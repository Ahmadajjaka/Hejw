/**
 * Verified Audio Supplications (أدعية بصوت كبار الشيوخ) and
 * Authentic Al-Ruqyah Al-Shariah (الرقية الشرعية الصوتية والمقروءة)
 *
 * Audio URLs verified against archive.org audio/mpeg endpoints.
 * Quranic verses verified verbatim against quran-uthmani (Tanzil / King Fahd Complex).
 */

export interface AudioDuaTrack {
  id: string;
  titleArabic: string;
  sheikhNameArabic: string;
  categoryId: 'qunoot' | 'khatam' | 'tahajjud' | 'munajat';
  categoryArabic: string;
  durationSeconds: number;
  durationLabel: string;
  audioUrl: string;
  descriptionArabic: string;
}

export interface AudioRuqyahTrack {
  id: string;
  titleArabic: string;
  sheikhNameArabic: string;
  focusArabic: string;
  durationLabel: string;
  audioUrl: string;
  descriptionArabic: string;
}

export interface RuqyahAyahItem {
  surahNumber: number;
  surahNameArabic: string;
  ayahNumber: number;
  text: string;
}

export interface RuqyahQuranSection {
  id: string;
  titleArabic: string;
  benefitArabic: string;
  surahNumberForHeader?: number;
  showBasmalahHeader?: boolean;
  ayahs: RuqyahAyahItem[];
}

export interface RuqyahPropheticDua {
  id: string;
  titleArabic: string;
  text: string;
  repeatCount: number;
  instructionArabic: string;
  reference: string;
}

export const DUAS_OCCASION_FILTERS = [
  { id: 'all', labelArabic: 'جميع الأدعية' },
  { id: 'qunoot', labelArabic: 'دعاء القنوت' },
  { id: 'khatam', labelArabic: 'دعاء ختم القرآن' },
  { id: 'tahajjud', labelArabic: 'قيام الليل والتهجد' },
  { id: 'munajat', labelArabic: 'أدعية خاشعة ومناجاة' },
] as const;

export const SHEIKH_DUAS: AudioDuaTrack[] = [
  {
    id: 'dua_alafasy_qunoot',
    titleArabic: 'دعاء القنوت الخاشع',
    sheikhNameArabic: 'الشيخ مشاري راشد العفاسي',
    categoryId: 'qunoot',
    categoryArabic: 'دعاء القنوت',
    durationSeconds: 615,
    durationLabel: '10:15',
    audioUrl: 'https://archive.org/download/AlafasyQunutDua/AlafasyQunutDua.mp3',
    descriptionArabic: 'دعاء قنوت جامع بصوت ندي خاشع للشيخ مشاري العفاسي.',
  },
  {
    id: 'dua_sudais_khatam',
    titleArabic: 'دعاء ختم القرآن الكريم من المسجد الحرام',
    sheikhNameArabic: 'الشيخ عبد الرحمن السديس',
    categoryId: 'khatam',
    categoryArabic: 'دعاء ختم القرآن',
    durationSeconds: 1840,
    durationLabel: '30:40',
    audioUrl: 'https://archive.org/download/Do3a-Khatm-quran_mp3/03-duaKhatmulQuran2012BySheikhSudais1433.mp3',
    descriptionArabic: 'تسجيل رسمي لدعاء ختم القرآن الكريم في الحرم المكي الشريف.',
  },
  {
    id: 'dua_sudais_qunoot_makkah',
    titleArabic: 'دعاء القنوت في الحرم المكي الشريف',
    sheikhNameArabic: 'الشيخ عبد الرحمن السديس',
    categoryId: 'qunoot',
    categoryArabic: 'دعاء القنوت',
    durationSeconds: 780,
    durationLabel: '13:00',
    audioUrl: 'https://archive.org/download/MakkahDuaAlQunootAudio/MakkahDuaAlQunoot-Night1BySheikhSudais.mp3',
    descriptionArabic: 'قنوت مؤثر من رحاب المسجد الحرام بمكة المكرمة.',
  },
  {
    id: 'dua_maher_qunoot',
    titleArabic: 'دعاء القنوت والتضرع',
    sheikhNameArabic: 'الشيخ ماهر المعيقلي',
    categoryId: 'qunoot',
    categoryArabic: 'دعاء القنوت',
    durationSeconds: 816,
    durationLabel: '13:36',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/06704581435hd.mp3',
    descriptionArabic: 'دعاء قنوت مملوء بالسكينة والرجاء بصوت إمام الحرم المكي الشيخ ماهر المعيقلي.',
  },
  {
    id: 'dua_dosari_munajat',
    titleArabic: 'مناجاة مؤثرة: ربنا إن عصيناك فإننا نحبك',
    sheikhNameArabic: 'الشيخ ياسر الدوسري',
    categoryId: 'munajat',
    categoryArabic: 'أدعية خاشعة ومناجاة',
    durationSeconds: 1123,
    durationLabel: '18:43',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/00----00000.mp3',
    descriptionArabic: 'دعاء ومناجاة خاشعة تلامس القلوب بصوت إمام الحرم المكي الشيخ ياسر الدوسري.',
  },
  {
    id: 'dua_dosari_khatam',
    titleArabic: 'دعاء ختم القرآن الكريم ليلة التاسع والعشرين',
    sheikhNameArabic: 'الشيخ ياسر الدوسري',
    categoryId: 'khatam',
    categoryArabic: 'دعاء ختم القرآن',
    durationSeconds: 2497,
    durationLabel: '41:37',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/011006291435.mp3',
    descriptionArabic: 'دعاء ختم القرآن الكريم بأداء خاشع ومطوّل.',
  },
  {
    id: 'dua_qatami_munajat',
    titleArabic: 'دعاء مبكٍ في الثناء على الله وطلب المغفرة',
    sheikhNameArabic: 'الشيخ ناصر القطامي',
    categoryId: 'munajat',
    categoryArabic: 'أدعية خاشعة ومناجاة',
    durationSeconds: 660,
    durationLabel: '11:00',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/001.mp3',
    descriptionArabic: 'من أخشع الأدعية الرمضانية بصوت القارئ الشيخ ناصر القطامي.',
  },
  {
    id: 'dua_idrees_qunoot',
    titleArabic: 'دعاء القنوت من جامع الشيخ زايد الكبير',
    sheikhNameArabic: 'الشيخ إدريس أبكر',
    categoryId: 'qunoot',
    categoryArabic: 'دعاء القنوت',
    durationSeconds: 635,
    durationLabel: '10:35',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/0150008221435.mp3',
    descriptionArabic: 'دعاء القنوت والخشوع بصوت الشيخ إدريس أبكر.',
  },
  {
    id: 'dua_sudais_tahajjud_27',
    titleArabic: 'دعاء صلاة التهجد ليلة السابع والعشرين',
    sheikhNameArabic: 'الشيخ عبد الرحمن السديس',
    categoryId: 'tahajjud',
    categoryArabic: 'قيام الليل والتهجد',
    durationSeconds: 1160,
    durationLabel: '19:20',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/0130072714352014.mp3',
    descriptionArabic: 'دعاء مؤثر من صلاة القيام والتهجد بالحرم المكي الشريف.',
  },
  {
    id: 'dua_jalil_khatam',
    titleArabic: 'دعاء ختم القرآن الكريم وتفريج الكربات',
    sheikhNameArabic: 'الشيخ خالد الجليل',
    categoryId: 'khatam',
    categoryArabic: 'دعاء ختم القرآن',
    durationSeconds: 1627,
    durationLabel: '27:07',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/014008291435.mp3',
    descriptionArabic: 'دعاء جامع بالرحمة والشفاء والفرج بصوت الشيخ خالد الجليل.',
  },
  {
    id: 'dua_ghamdi_tahajjud',
    titleArabic: 'دعاء صلاة القيام والانكسار بين يدي الله',
    sheikhNameArabic: 'الشيخ سعد الغامدي',
    categoryId: 'tahajjud',
    categoryArabic: 'قيام الليل والتهجد',
    durationSeconds: 250,
    durationLabel: '04:10',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/236101435.mp3',
    descriptionArabic: 'دعاء قصير مؤثر وهادئ بصوت الشيخ سعد الغامدي.',
  },
  {
    id: 'dua_balilah_tahajjud',
    titleArabic: 'دعاء صلاة التهجد وطلب العفو والعافية',
    sheikhNameArabic: 'الشيخ بندر بليلة',
    categoryId: 'tahajjud',
    categoryArabic: 'قيام الليل والتهجد',
    durationSeconds: 890,
    durationLabel: '14:50',
    audioUrl: 'https://archive.org/download/all----years-----mp3--do3aa----traweeh--and--khatm---quran---and--laylat--alqa_717/040025261435.mp3',
    descriptionArabic: 'دعاء قيام الليل من المسجد الحرام بصوت الشيخ بندر بليلة.',
  },
];

export const RUQYAH_AUDIO_TRACKS: AudioRuqyahTrack[] = [
  {
    id: 'ruqyah_alafasy',
    titleArabic: 'الرقية الشرعية الشاملة للتحصين والشفاء',
    sheikhNameArabic: 'الشيخ مشاري راشد العفاسي',
    focusArabic: 'التحصين العام والسكينة',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Mishary%20Rashid%20Al%20Fasy.mp3',
    descriptionArabic: 'الرقية الشرعية كاملة من الكتاب والسنة بأداء الشيخ مشاري العفاسي.',
  },
  {
    id: 'ruqyah_maher',
    titleArabic: 'الرقية الشرعية الكاملة بالصوت الهادئ',
    sheikhNameArabic: 'الشيخ ماهر المعيقلي',
    focusArabic: 'الطمأنينة ورفع الهم',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Maher%20Al%20Muaiqly.mp3',
    descriptionArabic: 'آيات الشفاء والحفظ والسكينة بصوت إمام الحرم المكي الشيخ ماهر المعيقلي.',
  },
  {
    id: 'ruqyah_sudais',
    titleArabic: 'الرقية الشرعية المأثورة من القرآن الكريم',
    sheikhNameArabic: 'الشيخ عبد الرحمن السديس',
    focusArabic: 'الوقاية من العين والحسد',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Abdel%20Rahman%20Al-Sudais.mp3',
    descriptionArabic: 'تسجيل نقي للرقية الشرعية الكاملة بصوت الشيخ عبد الرحمن السديس.',
  },
  {
    id: 'ruqyah_shuraim',
    titleArabic: 'الرقية الشرعية للبيت والأهل والنفس',
    sheikhNameArabic: 'الشيخ سعود الشريم',
    focusArabic: 'حفظ البيت والأبناء',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Saood%20As%20Shuraim.mp3',
    descriptionArabic: 'تلاوة مؤثرة لآيات الرقية الشرعية بصوت الشيخ سعود الشريم.',
  },
  {
    id: 'ruqyah_abdulbasit',
    titleArabic: 'الرقية الشرعية بصوت الشيخ عبد الباسط عبد الصمد',
    sheikhNameArabic: 'الشيخ عبد الباسط عبد الصمد',
    focusArabic: 'آيات الشفاء والرحمة',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Abdel%20Baset%20Abdel%20Samad.mp3',
    descriptionArabic: 'نخبة آيات الرقية الشرعية والشفاء بتلاوة خاشعة للشيخ عبد الباسط.',
  },
  {
    id: 'ruqyah_ajamy',
    titleArabic: 'الرقية الشرعية الشاملة للشفاء بإذن الله',
    sheikhNameArabic: 'الشيخ أحمد بن علي العجمي',
    focusArabic: 'الشفاء ودفع البلاء',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Ahmed%20Bin%20Ali%20Al-Ajamy.mp3',
    descriptionArabic: 'رقية شرعية كاملة معروفة بتأثيرها السكيني بصوت الشيخ أحمد العجمي.',
  },
  {
    id: 'ruqyah_ghamdi',
    titleArabic: 'الرقية الشرعية الهادئة للنوم والسكينة',
    sheikhNameArabic: 'الشيخ سعد الغامدي',
    focusArabic: 'إزالة القلق والأرق',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Saad%20Al%20Ghamdi.mp3',
    descriptionArabic: 'تلاوة متزنة للرقية الشرعية بصوت الشيخ سعد الغامدي.',
  },
  {
    id: 'ruqyah_idrees',
    titleArabic: 'الرقية الشرعية الخاشعة المطولة',
    sheikhNameArabic: 'الشيخ إدريس أبكر',
    focusArabic: 'التحصين الشامل',
    durationLabel: 'تلاوة كاملة',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Idrees%20Abkar.mp3',
    descriptionArabic: 'رقية شرعية كاملة بأداء روحاني خاشع للشيخ إدريس أبكر.',
  },
];

// Verbatim quran-uthmani Ayahs used in canonical Al-Ruqyah Al-Shariah
export const RUQYAH_QURAN_SECTIONS: RuqyahQuranSection[] = [
  {
    id: 'fatihah',
    titleArabic: '١. سورة الفاتحة (السبع المثاني والشفاء)',
    benefitArabic: 'أعظم سورة في القرآن وهي رقية وشفاء بإذن الله، ثبت في الصحيحين الرقية بها.',
    ayahs: [
      { surahNumber: 1, surahNameArabic: 'الفَاتِحَة', ayahNumber: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
      { surahNumber: 1, surahNameArabic: 'الفَاتِحَة', ayahNumber: 2, text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ' },
      { surahNumber: 1, surahNameArabic: 'الفَاتِحَة', ayahNumber: 3, text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
      { surahNumber: 1, surahNameArabic: 'الفَاتِحَة', ayahNumber: 4, text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ' },
      { surahNumber: 1, surahNameArabic: 'الفَاتِحَة', ayahNumber: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
      { surahNumber: 1, surahNameArabic: 'الفَاتِحَة', ayahNumber: 6, text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ' },
      { surahNumber: 1, surahNameArabic: 'الفَاتِحَة', ayahNumber: 7, text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ' },
    ],
  },
  {
    id: 'baqarah_start',
    titleArabic: '٢. فواتح سورة البقرة',
    benefitArabic: 'تثبيت الهداية واليقين وطمأنينة القلب في بداية الرقية.',
    surahNumberForHeader: 2,
    showBasmalahHeader: true,
    ayahs: [
      { surahNumber: 2, surahNameArabic: 'البَقَرَة', ayahNumber: 1, text: 'الٓمٓ' },
      { surahNumber: 2, surahNameArabic: 'البَقَرَة', ayahNumber: 2, text: 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ' },
      { surahNumber: 2, surahNameArabic: 'البَقَرَة', ayahNumber: 3, text: 'ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ' },
      { surahNumber: 2, surahNameArabic: 'البَقَرَة', ayahNumber: 4, text: 'وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْءَاخِرَةِ هُمْ يُوقِنُونَ' },
      { surahNumber: 2, surahNameArabic: 'البَقَرَة', ayahNumber: 5, text: 'أُو۟لَٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ' },
    ],
  },
  {
    id: 'kursi',
    titleArabic: '٣. آية الكرسي (سورة البقرة: ٢٥٥)',
    benefitArabic: 'أعظم آية في كتاب الله، من قرأها لم يزل عليه من الله حافظ ولا يقربه شيطان.',
    ayahs: [
      {
        surahNumber: 2,
        surahNameArabic: 'البَقَرَة',
        ayahNumber: 255,
        text: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
      },
    ],
  },
  {
    id: 'baqarah_end',
    titleArabic: '٤. خواتيم سورة البقرة (٢٨٥–٢٨٦)',
    benefitArabic: 'الآيتان من آخر سورة البقرة من قرأهما في ليلة كفتاه من كل شر وسوء.',
    ayahs: [
      {
        surahNumber: 2,
        surahNameArabic: 'البَقَرَة',
        ayahNumber: 285,
        text: 'ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍۢ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ',
      },
      {
        surahNumber: 2,
        surahNameArabic: 'البَقَرَة',
        ayahNumber: 286,
        text: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًۭا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ',
      },
    ],
  },
  {
    id: 'shifa_hifz',
    titleArabic: '٥. آيات الشفاء والتوكل والتحصين من العين',
    benefitArabic: 'آيات قرآنية جامعة للشفاء واليقين بأن الضر والنفع بيد الله وحده.',
    ayahs: [
      {
        surahNumber: 9,
        surahNameArabic: 'التَّوْبَة',
        ayahNumber: 51,
        text: 'قُل لَّن يُصِيبَنَآ إِلَّا مَا كَتَبَ ٱللَّهُ لَنَا هُوَ مَوْلَىٰنَا ۚ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ',
      },
      {
        surahNumber: 10,
        surahNameArabic: 'يُونُس',
        ayahNumber: 57,
        text: 'يَٰٓأَيُّهَا ٱلنَّاسُ قَدْ جَآءَتْكُم مَّوْعِظَةٌۭ مِّن رَّبِّكُمْ وَشِفَآءٌۭ لِّمَا فِى ٱلصُّدُورِ وَهُدًۭى وَرَحْمَةٌۭ لِّلْمُؤْمِنِينَ',
      },
      {
        surahNumber: 17,
        surahNameArabic: 'الإِسْرَاء',
        ayahNumber: 82,
        text: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌۭ وَرَحْمَةٌۭ لِّلْمُؤْمِنِينَ ۙ وَلَا يَزِيدُ ٱلظَّٰلِمِينَ إِلَّا خَسَارًۭا',
      },
      {
        surahNumber: 26,
        surahNameArabic: 'الشُّعَرَاء',
        ayahNumber: 80,
        text: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
      },
      {
        surahNumber: 68,
        surahNameArabic: 'القَلَم',
        ayahNumber: 51,
        text: 'وَإِن يَكَادُ ٱلَّذِينَ كَفَرُوا۟ لَيُزْلِقُونَكَ بِأَبْصَٰرِهِمْ لَمَّا سَمِعُوا۟ ٱلذِّكْرَ وَيَقُولُونَ إِنَّهُۥ لَمَجْنُونٌۭ',
      },
      {
        surahNumber: 68,
        surahNameArabic: 'القَلَم',
        ayahNumber: 52,
        text: 'وَمَا هُوَ إِلَّا ذِكْرٌۭ لِّلْعَٰلَمِينَ',
      },
    ],
  },
  {
    id: 'ikhlas',
    titleArabic: '٦. سورة الإخلاص (تُقرأ ثلاث مرات)',
    benefitArabic: 'إفراد الله بالتوحيد والصمدية، وتُقرأ مع المعوذتين ثلاثاً في الرقية والصباح والمساء.',
    surahNumberForHeader: 112,
    showBasmalahHeader: true,
    ayahs: [
      { surahNumber: 112, surahNameArabic: 'الإِخْلَاص', ayahNumber: 1, text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ' },
      { surahNumber: 112, surahNameArabic: 'الإِخْلَاص', ayahNumber: 2, text: 'ٱللَّهُ ٱلصَّمَدُ' },
      { surahNumber: 112, surahNameArabic: 'الإِخْلَاص', ayahNumber: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
      { surahNumber: 112, surahNameArabic: 'الإِخْلَاص', ayahNumber: 4, text: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ' },
    ],
  },
  {
    id: 'falaq',
    titleArabic: '٧. سورة الفلق (تُقرأ ثلاث مرات)',
    benefitArabic: 'الاستعاذة برب الفلق من شر المخلوقات والسحر والحسد.',
    surahNumberForHeader: 113,
    showBasmalahHeader: true,
    ayahs: [
      { surahNumber: 113, surahNameArabic: 'الفَلَق', ayahNumber: 1, text: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ' },
      { surahNumber: 113, surahNameArabic: 'الفَلَق', ayahNumber: 2, text: 'مِن شَرِّ مَا خَلَقَ' },
      { surahNumber: 113, surahNameArabic: 'الفَلَق', ayahNumber: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
      { surahNumber: 113, surahNameArabic: 'الفَلَق', ayahNumber: 4, text: 'وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ' },
      { surahNumber: 113, surahNameArabic: 'الفَلَق', ayahNumber: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' },
    ],
  },
  {
    id: 'nas',
    titleArabic: '٨. سورة الناس (تُقرأ ثلاث مرات)',
    benefitArabic: 'الاستعاذة برب الناس وملكهم وإلههم من شر الوسواس الخناس.',
    surahNumberForHeader: 114,
    showBasmalahHeader: true,
    ayahs: [
      { surahNumber: 114, surahNameArabic: 'النَّاس', ayahNumber: 1, text: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ' },
      { surahNumber: 114, surahNameArabic: 'النَّاس', ayahNumber: 2, text: 'مَلِكِ ٱلنَّاسِ' },
      { surahNumber: 114, surahNameArabic: 'النَّاس', ayahNumber: 3, text: 'إِلَٰهِ ٱلنَّاسِ' },
      { surahNumber: 114, surahNameArabic: 'النَّاس', ayahNumber: 4, text: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ' },
      { surahNumber: 114, surahNameArabic: 'النَّاس', ayahNumber: 5, text: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ' },
      { surahNumber: 114, surahNameArabic: 'النَّاس', ayahNumber: 6, text: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ' },
    ],
  },
];

export const RUQYAH_PROPHETIC_DUAS: RuqyahPropheticDua[] = [
  {
    id: 'rp1',
    titleArabic: 'دعاء الشفاء النبوي العام',
    text: 'أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.',
    repeatCount: 3,
    instructionArabic: 'يُقرأ مع المسح باليد اليمنى على موضع الألم أو على المريض.',
    reference: 'صحيح البخاري (5743) وصحيح مسلم (2191)',
  },
  {
    id: 'rp2',
    titleArabic: 'رقية جبريل عليه السلام للنبي ﷺ',
    text: 'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ.',
    repeatCount: 3,
    instructionArabic: 'من أجمع الأدعية النبوية للرقية من العين والحسد والأذى.',
    reference: 'صحيح مسلم (2186)',
  },
  {
    id: 'rp3',
    titleArabic: 'دعاء موضع الألم في الجسد',
    text: 'بِسْمِ اللَّهِ (ثلاثاً)، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ.',
    repeatCount: 7,
    instructionArabic: 'يضع المصاب يده على الذي يألم من جسده ويقول بسم الله ثلاثاً ثم الدعاء سبع مرات.',
    reference: 'صحيح مسلم (2202)',
  },
  {
    id: 'rp4',
    titleArabic: 'تعويذ الأبناء والأهل',
    text: 'أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ.',
    repeatCount: 3,
    instructionArabic: 'كان النبي ﷺ يعوّذ به الحسن والحسين رضي الله عنهما.',
    reference: 'صحيح البخاري (3371)',
  },
  {
    id: 'rp5',
    titleArabic: 'الاستعاذة بكلمات الله التامات',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    repeatCount: 3,
    instructionArabic: 'حصن عظيم عند نزول منزل أو الشعور بالوحشة أو الأذى.',
    reference: 'صحيح مسلم (2708)',
  },
  {
    id: 'rp6',
    titleArabic: 'الدعاء الجامع للحفظ من البلاء المفاجئ',
    text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    repeatCount: 3,
    instructionArabic: 'يُقال ثلاث مرات صباحاً ومساءً وعند الرقية.',
    reference: 'سنن أبي داود (5088) والترمذي (3388)',
  },
  {
    id: 'rp7',
    titleArabic: 'الدعاء للمريض عند عيادته',
    text: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ.',
    repeatCount: 7,
    instructionArabic: 'من عاد مريضاً لم يحضر أجله فقالها سبع مرات عافاه الله من ذلك المرض.',
    reference: 'سنن أبي داود (3106) والترمذي (2083)',
  },
];
