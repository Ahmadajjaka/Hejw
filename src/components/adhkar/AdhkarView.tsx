import React, { useState, useEffect } from 'react';
import {
  Heart,
  Share2,
  Copy,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Flame,
  Bed,
  Sunrise,
  BookOpen,
  Bell,
  BellRing,
  Clock,
  Compass,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { INITIAL_ADHKAR, ADHKAR_CATEGORIES } from '../../data/adhkarData';
import { DhikrItem } from '../../types';
import { calculatePrayerTimes, POPULAR_CITIES } from '../../utils/prayerCalculator';
import {
  getPostPrayerStatus,
  getAdhkarPhase,
  requestSmartNotificationPermission,
  sendLocalNotification,
} from '../../utils/adhkarPrayerSync';

interface AdhkarViewProps {
  initialCategory?: string;
  onNavigatePrayer?: () => void;
  onNavigateDuasRuqyah?: (tab: 'duas' | 'ruqyah' | 'ruqyah_text') => void;
}

export const AdhkarView: React.FC<AdhkarViewProps> = ({
  initialCategory,
  onNavigatePrayer,
  onNavigateDuasRuqyah,
}) => {
  // Calculate prayer times for current city or Makkah default
  const [now, setNow] = useState(new Date());
  const [smartNotifsEnabled, setSmartNotifsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('noor_smart_adhkar_notifs') === 'true';
  });
  const [notifPermission, setNotifPermission] = useState<string>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  });

  const city = POPULAR_CITIES[0];
  const prayerTimes = calculatePrayerTimes(now, city.latitude, city.longitude, 'ummAlQura');
  const postPrayerStatus = getPostPrayerStatus(prayerTimes, now);
  const adhkarPhase = getAdhkarPhase(prayerTimes, now);

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (initialCategory) return initialCategory;
    // Auto-select: If user is within post-prayer window, auto-open post prayer adhkar!
    if (postPrayerStatus.isPostPrayer) return 'after_prayer';
    if (adhkarPhase.phase === 'morning') return 'morning';
    if (adhkarPhase.phase === 'evening') return 'evening';
    return 'morning';
  });

  // If initialCategory prop changes from external navigation
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const [adhkarList, setAdhkarList] = useState<DhikrItem[]>(() => {
    try {
      const saved = localStorage.getItem('noor_adhkar_counts');
      if (saved) {
        const parsed = JSON.parse(saved);
        return INITIAL_ADHKAR.map((item) => ({
          ...item,
          currentCount: parsed[item.id] || 0,
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_ADHKAR;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle Smart Notification Toggle
  const handleToggleSmartNotifs = async () => {
    if (!smartNotifsEnabled) {
      const granted = await requestSmartNotificationPermission();
      if (granted) {
        setSmartNotifsEnabled(true);
        setNotifPermission('granted');
        localStorage.setItem('noor_smart_adhkar_notifs', 'true');
        sendLocalNotification(
          'تطبيق نور القرآن - تم تفعيل الإشعارات الذكية',
          'سنقوم بتذكيرك بأذكار الصباح والمساء وأذكار ما بعد الصلوات المفروضة في أوقاتها المباركة.'
        );
      } else {
        alert('يرجى السماح بالإشعارات في المتصفح لتلقي تنبيهات أذكار الصباح والمساء وبعد الصلاة.');
      }
    } else {
      setSmartNotifsEnabled(false);
      localStorage.setItem('noor_smart_adhkar_notifs', 'false');
    }
  };

  // Play subtle tap click
  const playClick = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  };

  const handleIncrement = (id: string, maxCount: number) => {
    const updated = adhkarList.map((item) => {
      if (item.id === id) {
        const next = Math.min(maxCount, item.currentCount + 1);
        return { ...item, currentCount: next };
      }
      return item;
    });

    setAdhkarList(updated);

    // Save to storage
    const countsMap: Record<string, number> = {};
    updated.forEach((i) => {
      countsMap[i.id] = i.currentCount;
    });
    localStorage.setItem('noor_adhkar_counts', JSON.stringify(countsMap));

    playClick();

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const handleResetCategory = () => {
    if (window.confirm('هل تريد إعادة تعيين عدادات هذا القسم؟')) {
      const updated = adhkarList.map((item) => {
        if (item.category === activeCategory) {
          return { ...item, currentCount: 0 };
        }
        return item;
      });
      setAdhkarList(updated);
      const countsMap: Record<string, number> = {};
      updated.forEach((i) => {
        countsMap[i.id] = i.currentCount;
      });
      localStorage.setItem('noor_adhkar_counts', JSON.stringify(countsMap));
    }
  };

  const handleCopy = (item: DhikrItem) => {
    const text = `${item.text}\n(${item.reference})\nعبر تطبيق نور القرآن`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (item: DhikrItem) => {
    const shareData = {
      title: item.categoryArabic,
      text: `${item.text}\n[${item.reference}]\nنور القرآن الكريم`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopy(item);
    }
  };

  const categoryItems = adhkarList.filter((item) => item.category === activeCategory);
  const completedCount = categoryItems.filter((i) => i.currentCount >= i.count).length;
  const isCategoryComplete = categoryItems.length > 0 && completedCount === categoryItems.length;

  return (
    <div className="w-full max-w-4xl mx-auto pb-28 px-4">
      {/* Adhkar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#c5a059]" />
            <span>حصن المسلم والأذكار</span>
          </h2>
          <p className="text-xs text-emerald-300/70 mt-1">
            أذكار موثقة من صحيح السنة النبوية مع ربط ذكي بمواقيت الصلاة وإشعارات الفجر والعصر
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Smart Notifications Toggle Button */}
          <button
            onClick={handleToggleSmartNotifs}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              smartNotifsEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-sm'
                : 'bg-black/30 text-emerald-200/80 border-emerald-800/40 hover:text-white'
            }`}
            title="تفعيل الإشعارات التلقائية لأذكار الصباح والمساء وبعد الصلاة"
          >
            {smartNotifsEnabled ? <BellRing className="w-3.5 h-3.5 text-amber-400" /> : <Bell className="w-3.5 h-3.5" />}
            <span>{smartNotifsEnabled ? 'الإشعارات الذكية مفعلة' : 'تفعيل الإشعارات الذكية'}</span>
          </button>

          <button
            onClick={handleResetCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-rose-300 bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/40 transition-colors cursor-pointer"
            title="تصفير العدادات لهذا القسم"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصفير العدادات</span>
          </button>
        </div>
      </div>

      {/* Sanctuary Quick Switcher (Adhkar / Sheikh Duas / Al-Ruqyah) */}
      {onNavigateDuasRuqyah && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#041d14] border border-emerald-800/40 mb-5">
          <button
            type="button"
            className="flex-1 min-w-[140px] min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-[#c5a059] text-black flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>أذكار حصن المسلم</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateDuasRuqyah('duas')}
            className="flex-1 min-w-[140px] min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-emerald-200 hover:text-white hover:bg-emerald-950/70 flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>أدعية بصوت الشيوخ</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateDuasRuqyah('ruqyah')}
            className="flex-1 min-w-[140px] min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-emerald-200 hover:text-white hover:bg-emerald-950/70 flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span>الرقية الشرعية</span>
          </button>
        </div>
      )}

      {/* Automatic Post-Prayer Notification Banner (يظهر تلقائياً بعد دخول وقت الصلاة) */}
      {postPrayerStatus.isPostPrayer && (
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#0d3f30]/40 to-amber-500/20 border-2 border-amber-400/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300/90 font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 inline-block mb-0.5">
                تنبيه ذكي: دخل وقت الصلاة
              </span>
              <h3 className="text-sm md:text-base font-bold text-white">
                حان وقت «أذكار ما بعد صلاة {postPrayerStatus.prayerNameArabic}»
              </h3>
              <p className="text-xs text-emerald-200/80">
                مضى على الأذان {postPrayerStatus.minutesSincePrayer === 0 ? 'لحظات' : `${postPrayerStatus.minutesSincePrayer} دقيقة`} · رطّب لسانك بالاستغفار والتسبيح وآية الكرسي
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveCategory('after_prayer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === 'after_prayer'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20 scale-105'
                : 'bg-[#c5a059] hover:bg-[#d8b368] text-black shadow'
            }`}
          >
            {activeCategory === 'after_prayer' ? 'أنت تقرأها الآن ✓' : 'عرض أذكار بعد الصلاة الآن'}
          </button>
        </div>
      )}

      {/* Smart Morning/Evening Adhkar Schedule Banner */}
      {!postPrayerStatus.isPostPrayer && (
        <div className="mb-5 p-3.5 rounded-2xl bg-[#06241b]/70 border border-emerald-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {adhkarPhase.phase === 'morning' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <span className="font-bold text-amber-300">{adhkarPhase.titleArabic}:</span>
              <span className="text-emerald-200/80 mr-1.5">{adhkarPhase.subtitleArabic}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveCategory(adhkarPhase.phase === 'evening' ? 'evening' : 'morning')}
            className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors font-semibold"
          >
            فتح أذكار هذا الوقت
          </button>
        </div>
      )}

      {/* Category Tabs Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {ADHKAR_CATEGORIES.map((cat) => {
          const isSelected = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#c5a059] text-black font-bold border-[#c5a059] shadow-md shadow-amber-900/30'
                  : 'bg-[#082a1f]/60 text-emerald-200 border-emerald-800/40 hover:bg-[#0c382a]'
              }`}
            >
              <span>{cat.nameArabic}</span>
            </button>
          );
        })}
      </div>

      {/* Category Progress Strip */}
      <div className="flex items-center justify-between p-3.5 mb-6 rounded-2xl bg-black/30 border border-emerald-800/30 text-xs">
        <span className="text-emerald-200/80">
          إنجاز هذا القسم: {completedCount} من {categoryItems.length}
        </span>
        {isCategoryComplete && (
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>اكتملت أذكار هذا القسم بارك الله فيك!</span>
          </span>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {categoryItems.map((dhikr) => {
          const isDone = dhikr.currentCount >= dhikr.count;

          return (
            <div
              key={dhikr.id}
              className={`p-5 rounded-3xl transition-all border ${
                isDone
                  ? 'bg-[#082a1f]/50 border-emerald-600/50'
                  : 'bg-[#062218]/80 border-emerald-800/40 hover:border-amber-500/30'
              }`}
            >
              {/* Dhikr text */}
              <p className="font-arabic-serif text-lg md:text-xl text-emerald-50 leading-loose text-right select-text">
                {dhikr.text}
              </p>

              {/* Reward & Reference Note */}
              <div className="mt-3 pt-3 border-t border-emerald-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {dhikr.reward && (
                  <p className="text-amber-300/80 text-[11px] leading-relaxed">
                    ★ {dhikr.reward}
                  </p>
                )}
                <span className="text-emerald-300/50 text-[10px] shrink-0">
                  {dhikr.reference}
                </span>
              </div>

              {/* Action & Counter Bar */}
              <div className="mt-4 pt-3 border-t border-emerald-800/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(dhikr)}
                    className="p-2 rounded-xl text-emerald-300/70 hover:text-white bg-black/20 hover:bg-black/40 transition-colors"
                    title="نسخ الذكر"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare(dhikr)}
                    className="p-2 rounded-xl text-emerald-300/70 hover:text-white bg-black/20 hover:bg-black/40 transition-colors"
                    title="مشاركة الذكر"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copiedId === dhikr.id && (
                    <span className="text-[11px] text-amber-300">تم النسخ!</span>
                  )}
                </div>

                {/* Counter Button */}
                <button
                  onClick={() => handleIncrement(dhikr.id, dhikr.count)}
                  disabled={isDone}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-600/40 cursor-default'
                      : 'bg-[#c5a059] text-black hover:bg-[#d8b368] active:scale-95 shadow-lg shadow-amber-900/30'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>تم ({dhikr.count})</span>
                    </>
                  ) : (
                    <>
                      <span>اضغط للذكر</span>
                      <span className="px-2 py-0.5 rounded-lg bg-black/20 text-black font-extrabold tabular-nums">
                        {dhikr.currentCount} / {dhikr.count}
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
  );
};
