import {
  AGNES_API_ENDPOINT,
  AUTO_GROQ_MODEL,
  buildSheikhSystemPrompt,
  DEFAULT_GROQ_MODEL,
  formatAgnesErrorMessage,
  formatGroqErrorMessage,
  getFallbackModelSequence,
  isAgnesModel,
  isRealApiKey,
  mergeLiveGroqModels,
  sanitizeChatMessages,
  stripModelThinkingTags,
} from '../utils/sheikhAi.ts';

let cachedLiveModels: { ids: string[]; fetchedAt: number } | null = null;
const LIVE_MODELS_TTL_MS = 5 * 60 * 1000;

export interface ServiceJsonResponse {
  status: number;
  body: Record<string, unknown>;
}

async function fetchLiveGroqModelIds(apiKey: string, forceRefresh = false): Promise<string[]> {
  if (
    !forceRefresh &&
    cachedLiveModels &&
    Date.now() - cachedLiveModels.fetchedAt < LIVE_MODELS_TTL_MS
  ) {
    return cachedLiveModels.ids;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (!res.ok) {
      return cachedLiveModels?.ids || [];
    }
    const data = (await res.json()) as { data?: Array<{ id?: string }> };
    const ids = Array.isArray(data.data)
      ? data.data.map((item) => item.id || '').filter(Boolean)
      : [];
    cachedLiveModels = { ids, fetchedAt: Date.now() };
    return ids;
  } catch {
    return cachedLiveModels?.ids || [];
  } finally {
    clearTimeout(timer);
  }
}

async function callGroqChat(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          ...params.messages,
        ],
        temperature: 0.65,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    const rawText = await response.text();
    return { response, rawText };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callAgnesChat(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(AGNES_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          ...params.messages,
        ],
        temperature: 0.65,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    const rawText = await response.text();
    return { response, rawText };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getHealthResponse(): ServiceJsonResponse {
  return {
    status: 200,
    body: { ok: true },
  };
}

export async function getSheikhAiStatusResponse(options?: {
  forceRefresh?: boolean;
}): Promise<ServiceJsonResponse> {
  const groqKey = process.env.GROQ_API_KEY?.trim() || '';
  const agnesKey = process.env.AGNES_API_KEY?.trim() || '';
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const hasGroq = isRealApiKey(groqKey);
  const hasAgnes = isRealApiKey(agnesKey);
  const hasGemini = isRealApiKey(geminiKey);
  const forceRefresh = Boolean(options?.forceRefresh);

  const liveIds = hasGroq ? await fetchLiveGroqModelIds(groqKey, forceRefresh) : [];
  const models = mergeLiveGroqModels(liveIds, { agnesConfigured: hasAgnes });

  return {
    status: 200,
    body: {
      configured: hasGroq || hasAgnes || hasGemini,
      groqConfigured: hasGroq,
      agnesConfigured: hasAgnes,
      geminiFallbackConfigured: hasGemini,
      provider: hasGroq ? 'groq' : hasAgnes ? 'agnes' : hasGemini ? 'gemini-fallback' : 'unconfigured',
      models,
      defaultModel: AUTO_GROQ_MODEL,
      recommendedModel: DEFAULT_GROQ_MODEL,
      liveModelsCount: liveIds.length,
    },
  };
}

export async function processSheikhAiChat(payload: {
  messages?: unknown;
  personaId?: unknown;
  model?: unknown;
}): Promise<ServiceJsonResponse> {
  const { messages, personaId, model } = payload ?? {};
  const sanitizedMessages = sanitizeChatMessages(messages);

  if (
    sanitizedMessages.length === 0 ||
    sanitizedMessages[sanitizedMessages.length - 1]?.role !== 'user'
  ) {
    return {
      status: 400,
      body: {
        errorCode: 'INVALID_REQUEST',
        error: 'يرجى كتابة سؤال واضح ليتمكن الشيخ من الإجابة عليه.',
      },
    };
  }

  const groqKey = process.env.GROQ_API_KEY?.trim() || '';
  const agnesKey = process.env.AGNES_API_KEY?.trim() || '';
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const hasGroq = isRealApiKey(groqKey);
  const hasAgnes = isRealApiKey(agnesKey);
  const hasGemini = isRealApiKey(geminiKey);

  const systemPrompt = buildSheikhSystemPrompt(
    typeof personaId === 'string' ? personaId : undefined
  );

  const requestedModel = typeof model === 'string' ? model.trim() : AUTO_GROQ_MODEL;

  if (isAgnesModel(requestedModel)) {
    if (!hasAgnes) {
      return {
        status: 503,
        body: {
          errorCode: 'MISSING_AGNES_API_KEY',
          error: formatAgnesErrorMessage(503),
        },
      };
    }

    try {
      const { response, rawText } = await callAgnesChat({
        apiKey: agnesKey,
        model: requestedModel,
        systemPrompt,
        messages: sanitizedMessages,
      });

      if (!response.ok) {
        return {
          status: response.status,
          body: {
            errorCode:
              response.status === 401 || response.status === 403
                ? 'INVALID_AGNES_API_KEY'
                : 'AGNES_ERROR',
            error: formatAgnesErrorMessage(response.status, rawText),
          },
        };
      }

      const data = JSON.parse(rawText) as {
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };

      const rawReply = data.choices?.[0]?.message?.content?.trim() || '';
      const reply = stripModelThinkingTags(rawReply);
      if (!reply) {
        return {
          status: 502,
          body: {
            errorCode: 'EMPTY_REPLY',
            error: 'لم يصل رد مكتمل من خادم Agnes AI. يرجى إعادة طرح السؤال.',
          },
        };
      }

      return {
        status: 200,
        body: {
          reply,
          model: data.model || requestedModel,
          requestedModel,
          fallbackUsed: false,
          provider: 'agnes',
          usage: data.usage || null,
        },
      };
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const status = isAbort ? 504 : 502;
      return {
        status,
        body: {
          errorCode: isAbort ? 'TIMEOUT' : 'AGNES_ERROR',
          error: formatAgnesErrorMessage(status),
        },
      };
    }
  }

  if (hasGroq) {
    const liveIds = await fetchLiveGroqModelIds(groqKey, false);
    const candidates = getFallbackModelSequence(requestedModel, liveIds).slice(0, 5);

    let lastStatus = 502;
    let lastRawText = '';

    for (const candidateModel of candidates) {
      try {
        const { response, rawText } = await callGroqChat({
          apiKey: groqKey,
          model: candidateModel,
          systemPrompt,
          messages: sanitizedMessages,
        });

        lastStatus = response.status;
        lastRawText = rawText;

        if (response.status === 401 || response.status === 403) {
          return {
            status: response.status,
            body: {
              errorCode: 'INVALID_API_KEY',
              error: formatGroqErrorMessage(response.status, rawText),
            },
          };
        }

        if (!response.ok) {
          if (response.status === 400 || response.status === 404 || response.status === 429) {
            continue;
          }
          break;
        }

        const data = JSON.parse(rawText) as {
          model?: string;
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { total_tokens?: number };
        };

        const rawReply = data.choices?.[0]?.message?.content?.trim() || '';
        const reply = stripModelThinkingTags(rawReply);

        if (!reply) {
          continue;
        }

        return {
          status: 200,
          body: {
            reply,
            model: data.model || candidateModel,
            requestedModel,
            fallbackUsed:
              requestedModel !== AUTO_GROQ_MODEL && (data.model || candidateModel) !== requestedModel,
            provider: 'groq',
            usage: data.usage || null,
          },
        };
      } catch (err) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        if (isAbort) {
          lastStatus = 504;
          continue;
        }
        lastStatus = 502;
      }
    }

    return {
      status: lastStatus,
      body: {
        errorCode: lastStatus === 504 ? 'TIMEOUT' : 'GROQ_ERROR',
        error: formatGroqErrorMessage(lastStatus, lastRawText),
      },
    };
  }

  if (hasGemini) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const contents = sanitizedMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const geminiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.65,
        },
      });

      const reply = stripModelThinkingTags(geminiRes.text || '');
      if (!reply) {
        return {
          status: 502,
          body: {
            errorCode: 'EMPTY_REPLY',
            error: 'لم يصل رد مكتمل من الخادم. يرجى إعادة طرح السؤال.',
          },
        };
      }

      return {
        status: 200,
        body: {
          reply,
          model: 'gemini-2.5-flash (البديل التلقائي)',
          provider: 'gemini-fallback',
          usage: null,
        },
      };
    } catch {
      return {
        status: 502,
        body: {
          errorCode: 'FALLBACK_ERROR',
          error: formatGroqErrorMessage(500),
        },
      };
    }
  }

  return {
    status: 503,
    body: {
      errorCode: 'MISSING_API_KEY',
      error: formatGroqErrorMessage(503),
    },
  };
}
