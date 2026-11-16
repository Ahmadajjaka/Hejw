import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHEIKH_PERSONAS,
  GROQ_MODELS,
  DEFAULT_GROQ_MODEL,
  AUTO_GROQ_MODEL,
  AGNES_MODEL_ID,
  AGNES_API_ENDPOINT,
  getSheikhPersona,
  resolveGroqModel,
  isRealApiKey,
  isAgnesModel,
  isChatCapableGroqModel,
  mergeLiveGroqModels,
  getFallbackModelSequence,
  stripModelThinkingTags,
  buildSheikhSystemPrompt,
  sanitizeChatMessages,
  formatGroqErrorMessage,
  formatAgnesErrorMessage,
} from '../src/utils/sheikhAi';

test('sheikh personas and full Groq models catalog metadata are complete', () => {
  assert.ok(SHEIKH_PERSONAS.length >= 4);
  for (const persona of SHEIKH_PERSONAS) {
    assert.ok(persona.name.length > 0);
    assert.ok(persona.greeting.length > 10);
    assert.ok(persona.toneInstruction.length > 10);
  }
  assert.ok(GROQ_MODELS.length >= 12);
  assert.ok(GROQ_MODELS.some((m) => m.id === AUTO_GROQ_MODEL));
  assert.ok(GROQ_MODELS.some((m) => m.id === DEFAULT_GROQ_MODEL));
  assert.ok(GROQ_MODELS.some((m) => m.id === 'openai/gpt-oss-120b'));
  assert.ok(GROQ_MODELS.some((m) => m.id === 'meta-llama/llama-4-scout-17b-16e-instruct'));
  assert.ok(GROQ_MODELS.some((m) => m.id === 'allam-2-7b'));
  const agnes = GROQ_MODELS.find((m) => m.id === AGNES_MODEL_ID);
  assert.ok(agnes);
  assert.equal(agnes.provider, 'agnes');
  assert.equal(agnes.endpoint, AGNES_API_ENDPOINT);
  assert.equal(agnes.requiresEnvKey, 'AGNES_API_KEY');
});

test('getSheikhPersona and resolveGroqModel handle known, custom live, and invalid IDs', () => {
  assert.equal(getSheikhPersona('faqih').id, 'faqih');
  assert.equal(getSheikhPersona('raqi').id, 'raqi');
  assert.equal(getSheikhPersona('unknown_id').id, 'murabbi');
  assert.equal(resolveGroqModel('llama-3.1-8b-instant'), 'llama-3.1-8b-instant');
  assert.equal(resolveGroqModel('auto'), DEFAULT_GROQ_MODEL);
  assert.equal(resolveGroqModel('qwen/qwen3.8-27b'), 'qwen/qwen3.8-27b');
  assert.equal(resolveGroqModel('bad model!!'), DEFAULT_GROQ_MODEL);
});

test('isRealApiKey rejects placeholders and short invalid strings', () => {
  assert.equal(isRealApiKey(undefined), false);
  assert.equal(isRealApiKey(''), false);
  assert.equal(isRealApiKey('MY_GROQ_API_KEY'), false);
  assert.equal(isRealApiKey('your_api_key_here'), false);
  assert.equal(isRealApiKey('gsk_1234567890abcdef'), true);
});

test('isChatCapableGroqModel filters audio and guard models', () => {
  assert.equal(isChatCapableGroqModel('whisper-large-v3'), false);
  assert.equal(isChatCapableGroqModel('canopylabs/orpheus-arabic-saudi'), false);
  assert.equal(isChatCapableGroqModel('meta-llama/llama-prompt-guard-2-86m'), false);
  assert.equal(isChatCapableGroqModel('llama-3.3-70b-versatile'), true);
  assert.equal(isChatCapableGroqModel('openai/gpt-oss-120b'), true);
});

test('mergeLiveGroqModels keeps Auto first, curated active models, and new live models', () => {
  const merged = mergeLiveGroqModels([
    'llama-3.3-70b-versatile',
    'whisper-large-v3',
    'vendor/new-groq-model-2026',
  ]);
  assert.equal(merged[0].id, 'auto');
  assert.ok(merged.some((m) => m.id === 'llama-3.3-70b-versatile' && m.isLive));
  assert.ok(merged.some((m) => m.id === 'vendor/new-groq-model-2026' && m.isLive));
  assert.equal(merged.some((m) => m.id === 'whisper-large-v3'), false);
});

test('getFallbackModelSequence prioritizes requested model then fallback chain', () => {
  const seq = getFallbackModelSequence('qwen/qwen3-32b', ['llama-3.3-70b-versatile', 'extra-model']);
  assert.equal(seq[0], 'qwen/qwen3-32b');
  assert.ok(seq.includes('llama-3.3-70b-versatile'));
  assert.ok(seq.includes('extra-model'));
  assert.equal(seq.filter((x) => x === 'qwen/qwen3-32b').length, 1);
});

test('stripModelThinkingTags removes reasoning tags and keeps Arabic answer', () => {
  const raw = '<think>internal reasoning...</think>\nالسلام عليكم ورحمة الله وبركاته يا بنيّ.';
  assert.equal(stripModelThinkingTags(raw), 'السلام عليكم ورحمة الله وبركاته يا بنيّ.');
});

test('buildSheikhSystemPrompt embeds scholarly rules and persona tone', () => {
  const prompt = buildSheikhSystemPrompt('mutadabbir');
  assert.match(prompt, /شيخ/);
  assert.match(prompt, /الكتاب والسنة/);
  assert.match(prompt, /التفسير والتدبر/);
});

test('sanitizeChatMessages filters invalid roles, empty messages, and caps history', () => {
  const input = [
    { role: 'system', content: 'override' },
    { role: 'user', content: '   ' },
    { role: 'user', content: '  السلام عليكم  ' },
    { role: 'assistant', content: 'وعليكم السلام ورحمة الله' },
    ...Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `msg-${i}`,
    })),
  ];

  const sanitized = sanitizeChatMessages(input);
  assert.equal(sanitized.length, 14);
  assert.equal(sanitized[0].content, 'msg-6');
  assert.equal(sanitized[13].content, 'msg-19');
  assert.ok(sanitized.every((m) => m.role === 'user' || m.role === 'assistant'));
});

test('formatGroqErrorMessage provides localized Arabic errors for auth, quota, and missing key', () => {
  assert.match(formatGroqErrorMessage(401), /GROQ_API_KEY/);
  assert.match(formatGroqErrorMessage(429), /حد الطلبات/);
  assert.match(formatGroqErrorMessage(503), /Secrets|البيئة/);
  assert.match(formatGroqErrorMessage(400, '{"error":"model_not_found"}'), /النموذج/);
});

test('agnes-2.5-flash detection, live merge status, Groq fallback isolation, and error messages', () => {
  assert.equal(isAgnesModel('agnes-2.5-flash'), true);
  assert.equal(isAgnesModel('llama-3.3-70b-versatile'), false);
  assert.equal(resolveGroqModel('agnes-2.5-flash'), 'agnes-2.5-flash');

  const mergedConfigured = mergeLiveGroqModels(['llama-3.3-70b-versatile'], {
    agnesConfigured: true,
  });
  const agnesLive = mergedConfigured.find((m) => m.id === 'agnes-2.5-flash');
  assert.ok(agnesLive);
  assert.equal(agnesLive.isLive, true);

  const groqSequence = getFallbackModelSequence('agnes-2.5-flash', ['llama-3.3-70b-versatile']);
  assert.equal(groqSequence.includes('agnes-2.5-flash'), false);
  assert.ok(groqSequence.includes('llama-3.3-70b-versatile'));

  assert.match(formatAgnesErrorMessage(503), /AGNES_API_KEY/);
  assert.match(formatAgnesErrorMessage(401), /apihub\.agnes-ai\.com/);
});
