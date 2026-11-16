/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { SplashScreen } from './components/layout/SplashScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { QuranView } from './components/quran/QuranView';
import { RecitationsHub } from './components/recitations/RecitationsHub';
import { PrayerTimesView } from './components/prayer/PrayerTimesView';
import { AdhkarView } from './components/adhkar/AdhkarView';
import { DuasRuqyahView, DuasRuqyahTab } from './components/duas/DuasRuqyahView';
import { Sebha3D } from './components/three/Sebha3D';
import { QiblaCompass } from './components/three/QiblaCompass';
import { KhatmahView } from './components/khatmah/KhatmahView';
import { MoreHubView } from './components/more/MoreHubView';
import { SheikhAiView } from './components/sheikh/SheikhAiView';
import { OfflineIndicator } from './components/pwa/PWAInstallUI';
import { POPULAR_CITIES } from './utils/prayerCalculator';
import { parseInitialScreenFromSearch } from './utils/pwaHelpers';
import {
  AppThemeId,
  applyThemeToDocument,
  getAppTheme,
  loadSavedThemeId,
  saveThemeId,
  shouldAutoSkipSplash,
} from './utils/appThemes';
import { Sparkles, Compass } from 'lucide-react';

export default function App() {
  const initialLaunch =
    typeof window !== 'undefined' ? parseInitialScreenFromSearch(window.location.search) : null;

  const [activeScreen, setActiveScreen] = useState<string>(initialLaunch?.screen || 'home');
  const [themeId, setThemeId] = useState<AppThemeId>(() => loadSavedThemeId());
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !shouldAutoSkipSplash(window.location.search);
  });
  const [splashReplay, setSplashReplay] = useState<boolean>(false);

  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: POPULAR_CITIES[0].latitude,
    longitude: POPULAR_CITIES[0].longitude,
  });

  const [adhkarCategory, setAdhkarCategory] = useState<string>(
    initialLaunch?.category || 'morning'
  );
  const [duasRuqyahTab, setDuasRuqyahTab] = useState<DuasRuqyahTab>(
    initialLaunch?.tab || 'duas'
  );

  useEffect(() => {
    applyThemeToDocument(themeId);
    saveThemeId(themeId);
  }, [themeId]);

  const activeTheme = getAppTheme(themeId);

  const handleNavigate = (screen: string, extra?: Record<string, unknown>) => {
    if (screen === 'adhkar' && extra?.category) {
      setAdhkarCategory(extra.category as string);
    }
    if (screen === 'duas_ruqyah' && extra?.tab) {
      setDuasRuqyahTab(extra.tab as DuasRuqyahTab);
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#031911] text-slate-100 flex flex-col font-sans selection:bg-[#c5a059]/30 selection:text-amber-200 islamic-pattern">
      {showSplash && (
        <SplashScreen
          theme={activeTheme}
          autoDismissMs={splashReplay ? 0 : 2600}
          onFinish={() => {
            setShowSplash(false);
            setSplashReplay(false);
          }}
        />
      )}

      {/* Top Header strictly conforming to Top Bar Contract */}
      <Header
        activeScreen={activeScreen}
        setActiveScreen={handleNavigate}
        themeId={themeId}
        onSelectTheme={setThemeId}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto pt-4 pb-20">
        {activeScreen === 'home' && (
          <HomeScreen onNavigate={handleNavigate} />
        )}

        {activeScreen === 'quran' && (
          <QuranView onNavigateHome={() => handleNavigate('home')} />
        )}

        {activeScreen === 'recitations' && (
          <RecitationsHub />
        )}

        {activeScreen === 'prayer' && (
          <PrayerTimesView
            onOpenQibla={() => handleNavigate('qibla')}
            onOpenAdhkar={(cat) => handleNavigate('adhkar', { category: cat || 'after_prayer' })}
          />
        )}

        {activeScreen === 'adhkar' && (
          <AdhkarView
            initialCategory={adhkarCategory}
            onNavigatePrayer={() => handleNavigate('prayer')}
            onNavigateDuasRuqyah={(tab) => handleNavigate('duas_ruqyah', { tab })}
          />
        )}

        {activeScreen === 'duas_ruqyah' && (
          <DuasRuqyahView
            initialTab={duasRuqyahTab}
            onOpenAdhkar={() => handleNavigate('adhkar')}
          />
        )}

        {activeScreen === 'sebha' && (
          <div className="w-full max-w-3xl mx-auto px-4 pb-28 pt-2">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-300 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-[#c5a059]" />
                <span>المسبحة الإلكترونية التفاعلية</span>
              </h2>
              <p className="text-xs text-emerald-300/70 mt-1">
                سبّح واذكر الله بعداد تفاعلي مع اللمس والاهتزاز والصوت
              </p>
            </div>
            <Sebha3D />
          </div>
        )}

        {activeScreen === 'qibla' && (
          <div className="w-full max-w-2xl mx-auto px-4 pb-28 pt-2">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-300 flex items-center justify-center gap-2">
                <Compass className="w-6 h-6 text-[#c5a059]" />
                <span>بوصلة اتجاه القبلة</span>
              </h2>
              <p className="text-xs text-emerald-300/70 mt-1">
                توجيه دقيق نحو الكعبة المشرفة في مكة المكرمة
              </p>
            </div>
            <QiblaCompass userCoords={userCoords} cityName="مكة المكرمة" />
          </div>
        )}

        {activeScreen === 'khatmah' && (
          <KhatmahView />
        )}

        {activeScreen === 'more' && (
          <MoreHubView
            onNavigate={handleNavigate}
            themeId={themeId}
            onSelectTheme={setThemeId}
            onReplaySplash={() => {
              setSplashReplay(true);
              setShowSplash(true);
            }}
          />
        )}

        {activeScreen === 'sheikh_ai' && (
          <SheikhAiView onBack={() => handleNavigate('home')} />
        )}
      </main>

      {/* Offline status indicator */}
      <OfflineIndicator />

      {/* Floating Bottom Navigation Bar */}
      <BottomNav activeScreen={activeScreen} setActiveScreen={handleNavigate} />
    </div>
  );
}
