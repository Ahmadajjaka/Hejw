import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  Heart,
  Loader2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Search,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  DUAS_OCCASION_FILTERS,
  RUQYAH_AUDIO_TRACKS,
  RUQYAH_PROPHETIC_DUAS,
  RUQYAH_QURAN_SECTIONS,
  SHEIKH_DUAS,
  RuqyahAyahItem,
} from '../../data/duasAndRuqyahData';
import { RECITERS } from '../../data/quranMeta';
import {
  cacheAudioForOffline,
  getEveryAyahAudioUrl,
  getPlayableAudioSrc,
} from '../../utils/quranAudioAndTafsir';
import {
  filterSheikhAudioTracks,
  formatAudioDuration,
  getNextSequentialAyahIndex,
  validateRuqyahQuranSections,
} from '../../utils/duasRuqyahHelpers';

export type DuasRuqyahTab = 'duas' | 'ruqyah' | 'ruqyah_text';

interface DuasRuqyahViewProps {
  initialTab?: DuasRuqyahTab;
  onOpenAdhkar?: () => void;
}

export const DuasRuqyahView: React.FC<DuasRuqyahViewProps> = ({
  initialTab = 'duas',
  onOpenAdhkar,
}) => {
  const [activeTab, setActiveTab] = useState<DuasRuqyahTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Search & Filter states for Audio Duas / Ruqyah Audio
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [occasionFilter, setOccasionFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('noor_favorite_duas') || '["dua_alafasy_qunoot","ruqyah_alafasy"]');
    } catch {
      return ['dua_alafasy_qunoot', 'ruqyah_alafasy'];
    }
  });

  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('noor_downloaded_duas') || '[]');
    } catch {
      return [];
    }
  });

  // Shared Audio Player state for Sheikh Duas & Audio Ruqyah
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    initialTab === 'ruqyah' ? RUQYAH_AUDIO_TRACKS[0].id : SHEIKH_DUAS[0].id
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  // Interactive Quranic Ruqyah verse-by-verse player state
  const [selectedQariId, setSelectedQariId] = useState<string>(RECITERS[2]?.id || RECITERS[0].id);
  const [activeAyahFlatIndex, setActiveAyahFlatIndex] = useState<number | null>(null);
  const [isPlayingRuqyahVerses, setIsPlayingRuqyahVerses] = useState<boolean>(false);
  const [repeatSingleAyah, setRepeatSingleAyah] = useState<boolean>(false);

  // Prophetic Ruqyah Duas interactive counter & copy state
  const [propheticCounts, setPropheticCounts] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('noor_ruqyah_prophetic_counts') || '{}');
    } catch {
      return {};
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const trackAudioRef = useRef<HTMLAudioElement | null>(null);
  const verseAudioRef = useRef<HTMLAudioElement | null>(null);

  // Build flat list of all Ruqyah Ayahs for sequential recitation
  const flatRuqyahAyahs = useMemo<RuqyahAyahItem[]>(
    () => RUQYAH_QURAN_SECTIONS.flatMap((sec) => sec.ayahs),
    []
  );

  const ruqyahIntegrity = useMemo(
    () => validateRuqyahQuranSections(RUQYAH_QURAN_SECTIONS),
    []
  );

  // Combine searchable audio list depending on active tab ('duas' or 'ruqyah')
  const allTrackPool = useMemo(
    () => [...SHEIKH_DUAS, ...RUQYAH_AUDIO_TRACKS],
    []
  );

  const currentTabTracks = useMemo(() => {
    if (activeTab === 'ruqyah') {
      return filterSheikhAudioTracks(
        RUQYAH_AUDIO_TRACKS,
        searchQuery,
        'all',
        favoritesOnly,
        favoriteIds
      );
    }
    return filterSheikhAudioTracks(
      SHEIKH_DUAS,
      searchQuery,
      occasionFilter,
      favoritesOnly,
      favoriteIds
    );
  }, [activeTab, searchQuery, occasionFilter, favoritesOnly, favoriteIds]);

  const activeTrack = useMemo(
    () => allTrackPool.find((t) => t.id === selectedTrackId) || SHEIKH_DUAS[0],
    [allTrackPool, selectedTrackId]
  );

  // Sync default selected track when switching between 'duas' and 'ruqyah' tabs if nothing is playing
  const handleSwitchTab = (tab: DuasRuqyahTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setOccasionFilter('all');
    if (tab === 'ruqyah' && !isPlaying && !RUQYAH_AUDIO_TRACKS.some((r) => r.id === selectedTrackId)) {
      setSelectedTrackId(RUQYAH_AUDIO_TRACKS[0].id);
    } else if (tab === 'duas' && !isPlaying && !SHEIKH_DUAS.some((d) => d.id === selectedTrackId)) {
      setSelectedTrackId(SHEIKH_DUAS[0].id);
    }
  };

  // Stop verse-by-verse audio if user plays a full Sheikh MP3, and vice versa
  const stopVerseAudio = () => {
    if (verseAudioRef.current) {
      verseAudioRef.current.pause();
    }
    setIsPlayingRuqyahVerses(false);
    setActiveAyahFlatIndex(null);
  };

  const stopTrackAudio = () => {
    if (trackAudioRef.current) {
      trackAudioRef.current.pause();
    }
    setIsPlaying(false);
    setIsBuffering(false);
  };

  // Main Track Audio Loader & Playback Effect
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const isRepeatRef = useRef(isRepeat);
  isRepeatRef.current = isRepeat;
  const speedRef = useRef(playbackSpeed);
  speedRef.current = playbackSpeed;
  const tabTracksRef = useRef(currentTabTracks);
  tabTracksRef.current = currentTabTracks;

  useEffect(() => {
    if (!trackAudioRef.current) {
      trackAudioRef.current = new Audio();
    }
    const audio = trackAudioRef.current;
    let cancelled = false;
    let blobUrl: string | null = null;

    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);

    const loadSrc = async () => {
      const playable = await getPlayableAudioSrc(activeTrack.audioUrl);
      if (cancelled) {
        if (playable.startsWith('blob:')) URL.revokeObjectURL(playable);
        return;
      }
      if (playable.startsWith('blob:')) {
        blobUrl = playable;
      }
      audio.src = playable;
      audio.playbackRate = speedRef.current;
      if (isPlayingRef.current) {
        setIsBuffering(true);
        audio.play()
          .then(() => {
            if (!cancelled) setIsBuffering(false);
          })
          .catch(() => {
            if (!cancelled) {
              setIsBuffering(false);
              setIsPlaying(false);
              setAudioError('تعذر تشغيل هذا المقطع الصوتي حالياً. يرجى التحقق من الاتصال والمحاولة مجدداً.');
            }
          });
      }
    };

    loadSrc();

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onEnded = () => {
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const list = tabTracksRef.current;
      const idx = list.findIndex((item) => item.id === activeTrack.id);
      if (idx !== -1 && idx + 1 < list.length) {
        setSelectedTrackId(list[idx + 1].id);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };
    const onError = () => {
      if (!cancelled && isPlayingRef.current) {
        setIsBuffering(false);
        setIsPlaying(false);
        setAudioError('تعذر تحميل الملف الصوتي. تأكد من الاتصال بالإنترنت أو جرّب شيخاً آخر.');
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      cancelled = true;
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [activeTrack.id, activeTrack.audioUrl]);

  useEffect(() => {
    if (trackAudioRef.current) {
      trackAudioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Cleanup both audio elements on unmount
  useEffect(() => {
    return () => {
      trackAudioRef.current?.pause();
      verseAudioRef.current?.pause();
    };
  }, []);

  const handleTogglePlayTrack = (trackId?: string) => {
    stopVerseAudio();
    const targetId = trackId || activeTrack.id;

    if (targetId !== activeTrack.id) {
      setSelectedTrackId(targetId);
      setIsPlaying(true);
      return;
    }

    const audio = trackAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    } else {
      setAudioError(null);
      setIsBuffering(true);
      audio.playbackRate = playbackSpeed;
      audio.play()
        .then(() => {
          setIsBuffering(false);
          setIsPlaying(true);
        })
        .catch(() => {
          setIsBuffering(false);
          setIsPlaying(false);
          setAudioError('اضغط تشغيل مرة أخرى للسماح بالصوت أو تحقق من الاتصال.');
        });
    }
  };

  const handleStepTrack = (direction: 'next' | 'prev') => {
    const list = currentTabTracks.length > 0 ? currentTabTracks : allTrackPool;
    const idx = list.findIndex((t) => t.id === activeTrack.id);
    if (list.length === 0) return;
    const nextIdx =
      direction === 'next'
        ? (idx + 1) % list.length
        : (idx - 1 + list.length) % list.length;
    stopVerseAudio();
    setSelectedTrackId(list[nextIdx].id);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (trackAudioRef.current && Number.isFinite(val)) {
      trackAudioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleFavorite = (id: string) => {
    const updated = favoriteIds.includes(id)
      ? favoriteIds.filter((x) => x !== id)
      : [...favoriteIds, id];
    setFavoriteIds(updated);
    try {
      localStorage.setItem('noor_favorite_duas', JSON.stringify(updated));
    } catch {}
  };

  const handleCacheOffline = async (id: string, audioUrl: string, titleArabic: string) => {
    setDownloadingId(id);
    setDownloadMessage(null);
    const ok = await cacheAudioForOffline(audioUrl);
    setDownloadingId(null);
    if (ok) {
      const updated = Array.from(new Set([...downloadedIds, id]));
      setDownloadedIds(updated);
      try {
        localStorage.setItem('noor_downloaded_duas', JSON.stringify(updated));
      } catch {}
      setDownloadMessage(`تم حفظ «${titleArabic}» للاستماع دون إنترنت.`);
    } else {
      setDownloadMessage('تعذر تنزيل الملف للتخزين المحلي الآن؛ يمكنك الاستماع عبر الإنترنت.');
    }
  };

  // Sequential Verse-by-Verse Ruqyah Playback
  const repeatSingleAyahRef = useRef(repeatSingleAyah);
  repeatSingleAyahRef.current = repeatSingleAyah;
  const selectedQariRef = useRef(selectedQariId);
  selectedQariRef.current = selectedQariId;

  const playRuqyahAyahAtIndex = (flatIdx: number) => {
    const item = flatRuqyahAyahs[flatIdx];
    if (!item) {
      setIsPlayingRuqyahVerses(false);
      setActiveAyahFlatIndex(null);
      return;
    }

    stopTrackAudio();
    if (!verseAudioRef.current) {
      verseAudioRef.current = new Audio();
    }
    const audio = verseAudioRef.current;
    const url = getEveryAyahAudioUrl(selectedQariRef.current, item.surahNumber, item.ayahNumber);

    audio.src = url;
    audio.playbackRate = 1;
    setActiveAyahFlatIndex(flatIdx);
    setIsPlayingRuqyahVerses(true);

    audio.onended = () => {
      const nextIdx = getNextSequentialAyahIndex(
        flatIdx,
        flatRuqyahAyahs.length,
        repeatSingleAyahRef.current
      );
      if (nextIdx !== null) {
        playRuqyahAyahAtIndex(nextIdx);
      } else {
        setIsPlayingRuqyahVerses(false);
        setActiveAyahFlatIndex(null);
      }
    };

    audio.play().catch(() => {
      setIsPlayingRuqyahVerses(false);
    });
  };

  const handleToggleAllRuqyahVerses = () => {
    if (isPlayingRuqyahVerses) {
      stopVerseAudio();
    } else {
      playRuqyahAyahAtIndex(activeAyahFlatIndex ?? 0);
    }
  };

  const handleIncrementProphetic = (id: string, maxCount: number) => {
    const cur = propheticCounts[id] || 0;
    const next = Math.min(maxCount, cur + 1);
    const updated = { ...propheticCounts, [id]: next };
    setPropheticCounts(updated);
    try {
      localStorage.setItem('noor_ruqyah_prophetic_counts', JSON.stringify(updated));
    } catch {}
  };

  const handleResetProphetic = () => {
    setPropheticCounts({});
    try {
      localStorage.setItem('noor_ruqyah_prophetic_counts', '{}');
    } catch {}
  };

  const handleCopyText = (id: string, text: string, source: string) => {
    const payload = `${text}\n(${source})\nتطبيق نور القرآن`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper metadata for active track
  const activeMetaLabel =
    'categoryArabic' in activeTrack
      ? activeTrack.categoryArabic
      : activeTrack.focusArabic;

  // Map (surah, ayah) to flat index for quick lookup while rendering sections
  let runningFlatIndex = 0;

  return (
    <div className="w-full max-w-6xl mx-auto pb-28 px-4 space-y-6">
      {/* Header & Top Sanctuary Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-300 font-arabic-serif">
            الأدعية الصوتية والرقية الشرعية
          </h2>
          <p className="text-xs md:text-sm text-emerald-200/80 mt-1 max-w-2xl">
            أدعية خاشعة ومختارات القنوت وختم القرآن بأصوات كبار الشيوخ، مع الرقية الشرعية الصوتية الكاملة وآيات التحصين بالرسم العثماني الموثق.
          </p>
        </div>

        {onOpenAdhkar && (
          <button
            type="button"
            onClick={onOpenAdhkar}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-700/50 text-xs font-semibold text-emerald-200 hover:text-amber-300 hover:border-amber-500/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            الانتقال إلى أذكار حصن المسلم
          </button>
        )}
      </div>

      {/* Primary 3-Tab Segmented Navigation */}
      <div
        role="tablist"
        aria-label="أقسام الأدعية والرقية الشرعية"
        className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#041d14] border border-emerald-800/40"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'duas'}
          onClick={() => handleSwitchTab('duas')}
          className={`flex-1 min-w-[160px] min-h-[44px] px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'duas'
              ? 'bg-[#c5a059] text-black shadow-md'
              : 'text-emerald-200 hover:text-white hover:bg-emerald-950/60'
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>أدعية بصوت الشيوخ ({SHEIKH_DUAS.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ruqyah'}
          onClick={() => handleSwitchTab('ruqyah')}
          className={`flex-1 min-w-[160px] min-h-[44px] px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'ruqyah'
              ? 'bg-[#c5a059] text-black shadow-md'
              : 'text-emerald-200 hover:text-white hover:bg-emerald-950/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>الرقية الشرعية الصوتية ({RUQYAH_AUDIO_TRACKS.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ruqyah_text'}
          onClick={() => handleSwitchTab('ruqyah_text')}
          className={`flex-1 min-w-[160px] min-h-[44px] px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'ruqyah_text'
              ? 'bg-[#c5a059] text-black shadow-md'
              : 'text-emerald-200 hover:text-white hover:bg-emerald-950/60'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>آيات وأدعية الرقية الشرعية</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1 & TAB 2: AUDIO PLAYER STUDIO + SHEIKH LIST                     */}
      {/* =================================================================== */}
      {(activeTab === 'duas' || activeTab === 'ruqyah') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left/First Column: Dedicated Audio Studio Player */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl p-6 bg-gradient-to-b from-[#072e21] to-[#041912] border border-amber-500/35 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300/90 font-medium">
                  <span>{activeTrack.sheikhNameArabic}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeMetaLabel}</span>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-white mt-1.5 leading-snug">
                  {activeTrack.titleArabic}
                </h3>
                <p className="text-xs text-emerald-200/75 mt-1.5 leading-relaxed">
                  {activeTrack.descriptionArabic}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleFavorite(activeTrack.id)}
                aria-label={favoriteIds.includes(activeTrack.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-black/30 border border-emerald-800/40 flex items-center justify-center text-amber-400 hover:border-amber-400/50 transition-colors cursor-pointer shrink-0"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favoriteIds.includes(activeTrack.id) ? 'fill-amber-400 text-amber-400' : 'text-emerald-300/70'
                  }`}
                />
              </button>
            </div>

            {/* Progress Slider & Tabular Time */}
            <div>
              <input
                type="range"
                aria-label="موضع التقدم في المقطع الصوتي"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-amber-400 bg-emerald-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-emerald-300/80 mt-2 tabular-nums">
                <span>{formatAudioDuration(currentTime)}</span>
                <span>
                  {duration > 0 ? formatAudioDuration(duration) : activeTrack.durationLabel}
                </span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleStepTrack('prev')}
                aria-label="المقطع السابق"
                className="min-h-[44px] min-w-[44px] rounded-2xl bg-black/30 border border-emerald-800/40 flex items-center justify-center text-emerald-200 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleTogglePlayTrack()}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#c5a059] to-amber-300 text-black flex items-center justify-center shadow-xl shadow-amber-900/40 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                {isBuffering ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7 fill-black" />
                ) : (
                  <Play className="w-7 h-7 fill-black mr-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleStepTrack('next')}
                aria-label="المقطع التالي"
                className="min-h-[44px] min-w-[44px] rounded-2xl bg-black/30 border border-emerald-800/40 flex items-center justify-center text-emerald-200 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <SkipBack className="w-5 h-5" />
              </button>
            </div>

            {/* Secondary Controls: Speed, Repeat, Offline Save */}
            <div className="pt-4 border-t border-emerald-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next =
                      playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 0.75 : 1;
                    setPlaybackSpeed(next);
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-black/30 border border-emerald-800/40 text-amber-300 font-bold tabular-nums whitespace-nowrap cursor-pointer"
                >
                  السرعة {playbackSpeed}x
                </button>

                <button
                  type="button"
                  onClick={() => setIsRepeat((r) => !r)}
                  className={`min-h-[40px] px-3 rounded-xl border flex items-center gap-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isRepeat
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-black/30 border-emerald-800/40 text-emerald-200 hover:text-white'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>تكرار</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCacheOffline(activeTrack.id, activeTrack.audioUrl, activeTrack.titleArabic)
                }
                disabled={downloadingId === activeTrack.id}
                className={`min-h-[40px] px-3.5 rounded-xl border flex items-center gap-1.5 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  downloadedIds.includes(activeTrack.id)
                    ? 'bg-emerald-800/40 border-emerald-600/50 text-emerald-200'
                    : 'bg-[#c5a059] border-[#c5a059] text-black hover:bg-[#d8b368]'
                }`}
              >
                {downloadingId === activeTrack.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : downloadedIds.includes(activeTrack.id) ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>محفوظ أوفلاين</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>حفظ للاستماع بدون نت</span>
                  </>
                )}
              </button>
            </div>

            {audioError && (
              <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-700/40 rounded-xl p-3">
                {audioError}
              </p>
            )}

            {downloadMessage && (
              <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                {downloadMessage}
              </p>
            )}
          </div>

          {/* Right/Second Column: Search, Filters & Track List */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Favorites Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-emerald-300/60 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'duas'
                      ? 'ابحث باسم الشيخ أو نوع الدعاء (مثل: السديس، قنوت، ختم)...'
                      : 'ابحث باسم الشيخ للرقية الشرعية (مثل: العفاسي، المعيقلي)...'
                  }
                  className="w-full min-h-[44px] pr-10 pl-4 py-2 rounded-xl bg-[#041d14] border border-emerald-800/50 text-xs md:text-sm text-white placeholder:text-emerald-300/50 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setFavoritesOnly((f) => !f)}
                className={`min-h-[44px] px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  favoritesOnly
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-[#041d14] border-emerald-800/50 text-emerald-200 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400' : ''}`} />
                <span>المفضلة فقط</span>
              </button>
            </div>

            {/* Occasion Filter Buttons (for Duas tab) */}
            {activeTab === 'duas' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {DUAS_OCCASION_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOccasionFilter(f.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                      occasionFilter === f.id
                        ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold'
                        : 'bg-[#06241b]/70 text-emerald-200 border-emerald-800/40 hover:text-white'
                    }`}
                  >
                    {f.labelArabic}
                  </button>
                ))}
              </div>
            )}

            {/* Tracks List */}
            {currentTabTracks.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#041d14] border border-emerald-800/40 text-center space-y-2">
                <p className="text-sm font-bold text-amber-200">لا توجد نتائج مطابقة لبحثك</p>
                <p className="text-xs text-emerald-300/70">
                  جرّب مسح نص البحث أو عرض جميع التسجيلات المتاحة.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTabTracks.map((track) => {
                  const isSelected = track.id === activeTrack.id;
                  const isTrackPlaying = isSelected && isPlaying;
                  const metaCategory =
                    'categoryArabic' in track ? track.categoryArabic : track.focusArabic;
                  const isCached = downloadedIds.includes(track.id);
                  const isFav = favoriteIds.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#0a3627] border-amber-400/70 shadow-lg'
                          : 'bg-[#06241b]/80 border-emerald-800/40 hover:border-amber-500/35'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm md:text-base font-bold text-white leading-snug">
                          {track.titleArabic}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300/90 tabular-nums">
                          <span>{track.sheikhNameArabic}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-200/80">{metaCategory}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-300/70">{track.durationLabel}</span>
                          {isCached && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-300">محفوظ دون إنترنت</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-emerald-200/70 leading-relaxed">
                          {track.descriptionArabic}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(track.id)}
                          aria-label={`تفضيل ${track.titleArabic}`}
                          className="min-h-[44px] min-w-[44px] rounded-xl bg-black/30 border border-emerald-800/40 flex items-center justify-center text-emerald-300/70 hover:text-amber-300 cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePlayTrack(track.id)}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                            isTrackPlaying
                              ? 'bg-amber-400 text-black'
                              : 'bg-[#c5a059] text-black hover:bg-[#d8b368]'
                          }`}
                        >
                          {isTrackPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-black" />
                              <span>إيقاف</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-black" />
                              <span>استماع</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: AUTHENTIC QURANIC & PROPHETIC RUQYAH SHAR'IYAH TEXT + AUDIO   */}
      {/* =================================================================== */}
      {activeTab === 'ruqyah_text' && (
        <div className="space-y-6">
          {/* Interactive Sequential Ruqyah Quranic Player Toolbar */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#072e21] via-[#0a3c2c] to-[#072e21] border border-amber-500/35 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base md:text-lg font-bold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c5a059]" />
                <span>الرقية الشرعية بالآيات القرآنية (مقروءة ومسموعة آية بآية)</span>
              </h3>
              <p className="text-xs text-emerald-200/80 mt-1">
                آيات الرقية الكاملة بالرسم العثماني المعتمد ({ruqyahIntegrity.totalAyahs} آية) · اختر القارئ واستمع متصلاً أو انقر على أي آية.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label="اختيار القارئ لتلاوة آيات الرقية"
                value={selectedQariId}
                onChange={(e) => {
                  setSelectedQariId(e.target.value);
                  if (isPlayingRuqyahVerses && activeAyahFlatIndex !== null) {
                    setTimeout(() => playRuqyahAyahAtIndex(activeAyahFlatIndex), 40);
                  }
                }}
                className="min-h-[44px] bg-black/50 border border-emerald-700/60 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none cursor-pointer"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.nameArabic}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setRepeatSingleAyah((r) => !r)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  repeatSingleAyah
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-black/40 border-emerald-800/50 text-emerald-200'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>تكرار الآية</span>
              </button>

              <button
                type="button"
                onClick={handleToggleAllRuqyahVerses}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-amber-400 text-black font-bold text-xs flex items-center gap-2 whitespace-nowrap shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                {isPlayingRuqyahVerses ? (
                  <>
                    <Pause className="w-4 h-4 fill-black" />
                    <span>إيقاف تلاوة الآيات</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>تشغيل آيات الرقية متصلة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!ruqyahIntegrity.valid ? (
            <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-700/40 text-sm text-rose-200">
              {ruqyahIntegrity.reason}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Quranic Ruqyah Verses Column */}
              <div className="lg:col-span-7 space-y-5">
                {RUQYAH_QURAN_SECTIONS.map((sec) => {
                  const sectionStartIdx = runningFlatIndex;
                  runningFlatIndex += sec.ayahs.length;

                  return (
                    <section
                      key={sec.id}
                      className="p-5 md:p-6 rounded-3xl bg-[#06241b]/90 border border-amber-500/25 space-y-4"
                    >
                      <div className="pb-3 border-b border-emerald-800/40">
                        <h4 className="text-base font-bold text-amber-300">{sec.titleArabic}</h4>
                        <p className="text-xs text-emerald-200/75 mt-1">{sec.benefitArabic}</p>
                      </div>

                      {sec.showBasmalahHeader && (
                        <p className="font-quran text-lg md:text-xl text-amber-100 text-center py-1">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      )}

                      <div className="space-y-3">
                        {sec.ayahs.map((ayah, idx) => {
                          const flatIdx = sectionStartIdx + idx;
                          const isCurrent = isPlayingRuqyahVerses && activeAyahFlatIndex === flatIdx;

                          return (
                            <div
                              key={`${ayah.surahNumber}:${ayah.ayahNumber}`}
                              className={`p-4 rounded-2xl border transition-colors ${
                                isCurrent
                                  ? 'bg-amber-500/20 border-amber-400 shadow-md'
                                  : 'bg-black/25 border-emerald-800/35 hover:border-amber-500/35'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-emerald-800/25 text-xs">
                                <span className="text-amber-300/90 font-semibold tabular-nums">
                                  سورة {ayah.surahNameArabic} · الآية {ayah.ayahNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    isCurrent ? stopVerseAudio() : playRuqyahAyahAtIndex(flatIdx)
                                  }
                                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                    isCurrent
                                      ? 'bg-amber-400 text-black'
                                      : 'bg-emerald-950/70 border border-emerald-700/40 text-amber-200 hover:text-white'
                                  }`}
                                >
                                  {isCurrent ? (
                                    <>
                                      <Pause className="w-3.5 h-3.5" />
                                      <span>إيقاف</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3.5 h-3.5" />
                                      <span>استماع</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <p className="font-quran text-xl md:text-2xl text-emerald-50 leading-[2.3] text-right select-text">
                                {ayah.text}{' '}
                                <span className="text-amber-400 font-bold text-lg mx-1 tabular-nums">
                                  ﴿{ayah.ayahNumber}﴾
                                </span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Prophetic Sunnah Ruqyah Duas Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between gap-2 p-4 rounded-2xl bg-[#041d14] border border-emerald-800/40">
                  <div>
                    <h4 className="text-base font-bold text-amber-300">أدعية الرقية من السنة النبوية</h4>
                    <p className="text-xs text-emerald-300/70 mt-0.5">
                      أدعية صحيحة للتحصين والشفاء مع عداد التكرار المأثور
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetProphetic}
                    aria-label="تصفير عدادات أدعية الرقية"
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 hover:bg-rose-900/40 text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تصفير</span>
                  </button>
                </div>

                {RUQYAH_PROPHETIC_DUAS.map((dua) => {
                  const count = propheticCounts[dua.id] || 0;
                  const done = count >= dua.repeatCount;

                  return (
                    <div
                      key={dua.id}
                      className={`p-5 rounded-3xl border transition-colors space-y-3 ${
                        done
                          ? 'bg-[#082a1f]/60 border-emerald-500/50'
                          : 'bg-[#06241b]/85 border-emerald-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-sm font-bold text-amber-300">{dua.titleArabic}</h5>
                          <p className="text-[11px] text-emerald-300/70 mt-0.5">{dua.reference}</p>
                        </div>
                      </div>

                      <p className="font-arabic-serif text-lg md:text-xl text-white leading-loose select-text">
                        {dua.text}
                      </p>

                      <p className="text-xs text-emerald-200/75 leading-relaxed">
                        {dua.instructionArabic}
                      </p>

                      <div className="pt-3 border-t border-emerald-800/30 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(dua.id, dua.text, dua.reference)}
                          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-black/30 border border-emerald-800/40 text-xs text-emerald-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedId === dua.id ? 'تم النسخ ✓' : 'نسخ'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={done}
                          onClick={() => handleIncrementProphetic(dua.id, dua.repeatCount)}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 tabular-nums transition-colors cursor-pointer ${
                            done
                              ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-600/40 cursor-default'
                              : 'bg-[#c5a059] text-black hover:bg-[#d8b368]'
                          }`}
                        >
                          {done ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                              <span>اكتمل ({dua.repeatCount})</span>
                            </>
                          ) : (
                            <>
                              <span>اضغط للتكرار</span>
                              <span className="px-2 py-0.5 rounded bg-black/20 font-extrabold">
                                {count} / {dua.repeatCount}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
