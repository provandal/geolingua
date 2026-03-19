interface TranslationStrings {
  howToIntegrate: string;
  backToGlobe: string;
  integrationGuide: string;
  iconExplanationHeading: string;
  iconExplanation: string;
  iconModeHeading: string;
  localeCode: string;
  reactIntegration: string;
  usingDetectedLocale: string;
  languageNotes: string;
  loadTranslations: string;
  formatDatesNumbers: string;
}

const translations: Record<string, TranslationStrings> = {
  en: {
    howToIntegrate: 'How to integrate',
    backToGlobe: 'Back to Globe',
    integrationGuide: 'Integration Guide',
    iconExplanationHeading: 'The GeoLingua Icon',
    iconExplanation: 'This is GeoLingua\'s default icon. When embedded in your app, users click it to open the language selector.',
    iconModeHeading: 'Embed as an Icon',
    localeCode: 'Locale code',
    reactIntegration: 'React integration',
    usingDetectedLocale: 'Using the detected locale',
    languageNotes: 'Language-specific notes',
    loadTranslations: 'Load translations',
    formatDatesNumbers: 'Format dates & numbers',
  },
  es: {
    howToIntegrate: 'Cómo integrar',
    backToGlobe: 'Volver al globo',
    integrationGuide: 'Guía de integración',
    iconExplanationHeading: 'El ícono de GeoLingua',
    iconExplanation: 'Este es el ícono predeterminado de GeoLingua. Cuando se integra en tu aplicación, los usuarios lo presionan para abrir el selector de idioma.',
    iconModeHeading: 'Integrar como ícono',
    localeCode: 'Código de idioma',
    reactIntegration: 'Integración con React',
    usingDetectedLocale: 'Usar el idioma detectado',
    languageNotes: 'Notas específicas del idioma',
    loadTranslations: 'Cargar traducciones',
    formatDatesNumbers: 'Formato de fechas y números',
  },
  fr: {
    howToIntegrate: 'Comment intégrer',
    backToGlobe: 'Retour au globe',
    integrationGuide: 'Guide d\'intégration',
    iconExplanationHeading: 'L\'icône GeoLingua',
    iconExplanation: 'Ceci est l\'icône par défaut de GeoLingua. Intégré dans votre application, les utilisateurs cliquent dessus pour ouvrir le sélecteur de langue.',
    iconModeHeading: 'Intégrer comme icône',
    localeCode: 'Code de langue',
    reactIntegration: 'Intégration React',
    usingDetectedLocale: 'Utiliser la langue détectée',
    languageNotes: 'Notes spécifiques à la langue',
    loadTranslations: 'Charger les traductions',
    formatDatesNumbers: 'Format des dates et nombres',
  },
  de: {
    howToIntegrate: 'So integrieren Sie',
    backToGlobe: 'Zurück zum Globus',
    integrationGuide: 'Integrationsleitfaden',
    iconExplanationHeading: 'Das GeoLingua-Symbol',
    iconExplanation: 'Dies ist das Standardsymbol von GeoLingua. In Ihre App eingebettet, klicken Benutzer darauf, um die Sprachauswahl zu öffnen.',
    iconModeHeading: 'Als Symbol einbetten',
    localeCode: 'Sprachcode',
    reactIntegration: 'React-Integration',
    usingDetectedLocale: 'Erkannte Sprache verwenden',
    languageNotes: 'Sprachspezifische Hinweise',
    loadTranslations: 'Übersetzungen laden',
    formatDatesNumbers: 'Datums- und Zahlenformat',
  },
  pt: {
    howToIntegrate: 'Como integrar',
    backToGlobe: 'Voltar ao globo',
    integrationGuide: 'Guia de integração',
    iconExplanationHeading: 'O ícone do GeoLingua',
    iconExplanation: 'Este é o ícone padrão do GeoLingua. Incorporado ao seu aplicativo, os usuários clicam nele para abrir o seletor de idioma.',
    iconModeHeading: 'Incorporar como ícone',
    localeCode: 'Código do idioma',
    reactIntegration: 'Integração com React',
    usingDetectedLocale: 'Usar o idioma detectado',
    languageNotes: 'Notas específicas do idioma',
    loadTranslations: 'Carregar traduções',
    formatDatesNumbers: 'Formato de datas e números',
  },
  it: {
    howToIntegrate: 'Come integrare',
    backToGlobe: 'Torna al globo',
    integrationGuide: 'Guida all\'integrazione',
    iconExplanationHeading: 'L\'icona di GeoLingua',
    iconExplanation: 'Questa è l\'icona predefinita di GeoLingua. Integrata nella tua app, gli utenti ci cliccano per aprire il selettore della lingua.',
    iconModeHeading: 'Incorpora come icona',
    localeCode: 'Codice lingua',
    reactIntegration: 'Integrazione React',
    usingDetectedLocale: 'Usa la lingua rilevata',
    languageNotes: 'Note specifiche della lingua',
    loadTranslations: 'Carica le traduzioni',
    formatDatesNumbers: 'Formato date e numeri',
  },
  ja: {
    howToIntegrate: '統合方法',
    backToGlobe: '地球儀に戻る',
    integrationGuide: '統合ガイド',
    iconExplanationHeading: 'GeoLinguaアイコン',
    iconExplanation: 'これはGeoLinguaのデフォルトアイコンです。アプリに埋め込むと、ユーザーがクリックして言語セレクターを開きます。',
    iconModeHeading: 'アイコンとして埋め込む',
    localeCode: 'ロケールコード',
    reactIntegration: 'React統合',
    usingDetectedLocale: '検出されたロケールを使用',
    languageNotes: '言語固有の注意事項',
    loadTranslations: '翻訳を読み込む',
    formatDatesNumbers: '日付と数値の書式',
  },
  ko: {
    howToIntegrate: '통합 방법',
    backToGlobe: '지구본으로 돌아가기',
    integrationGuide: '통합 가이드',
    iconExplanationHeading: 'GeoLingua 아이콘',
    iconExplanation: '이것은 GeoLingua의 기본 아이콘입니다. 앱에 삽입하면 사용자가 클릭하여 언어 선택기를 엽니다.',
    iconModeHeading: '아이콘으로 삽입',
    localeCode: '로케일 코드',
    reactIntegration: 'React 통합',
    usingDetectedLocale: '감지된 로케일 사용',
    languageNotes: '언어별 참고 사항',
    loadTranslations: '번역 로드',
    formatDatesNumbers: '날짜 및 숫자 형식',
  },
  zh: {
    howToIntegrate: '如何集成',
    backToGlobe: '返回地球仪',
    integrationGuide: '集成指南',
    iconExplanationHeading: 'GeoLingua 图标',
    iconExplanation: '这是 GeoLingua 的默认图标。嵌入您的应用后，用户点击它即可打开语言选择器。',
    iconModeHeading: '以图标形式嵌入',
    localeCode: '语言代码',
    reactIntegration: 'React 集成',
    usingDetectedLocale: '使用检测到的语言',
    languageNotes: '语言特定说明',
    loadTranslations: '加载翻译',
    formatDatesNumbers: '日期和数字格式',
  },
  ar: {
    howToIntegrate: 'كيفية الدمج',
    backToGlobe: 'العودة إلى الكرة الأرضية',
    integrationGuide: 'دليل الدمج',
    iconExplanationHeading: 'أيقونة GeoLingua',
    iconExplanation: 'هذه هي أيقونة GeoLingua الافتراضية. عند تضمينها في تطبيقك، ينقر المستخدمون عليها لفتح محدد اللغة.',
    iconModeHeading: 'تضمين كأيقونة',
    localeCode: 'رمز اللغة',
    reactIntegration: 'دمج React',
    usingDetectedLocale: 'استخدام اللغة المكتشفة',
    languageNotes: 'ملاحظات خاصة باللغة',
    loadTranslations: 'تحميل الترجمات',
    formatDatesNumbers: 'تنسيق التواريخ والأرقام',
  },
  he: {
    howToIntegrate: 'כיצד לשלב',
    backToGlobe: 'חזרה לגלובוס',
    integrationGuide: 'מדריך שילוב',
    iconExplanationHeading: 'סמל GeoLingua',
    iconExplanation: 'זהו סמל ברירת המחדל של GeoLingua. כשהוא מוטמע באפליקציה שלך, המשתמשים לוחצים עליו כדי לפתוח את בורר השפה.',
    iconModeHeading: 'הטמעה כסמל',
    localeCode: 'קוד שפה',
    reactIntegration: 'שילוב React',
    usingDetectedLocale: 'שימוש בשפה שזוהתה',
    languageNotes: 'הערות ספציפיות לשפה',
    loadTranslations: 'טעינת תרגומים',
    formatDatesNumbers: 'פורמט תאריכים ומספרים',
  },
  ht: {
    howToIntegrate: 'Kòman pou entegre',
    backToGlobe: 'Retounen nan glob la',
    integrationGuide: 'Gid entegrasyon',
    iconExplanationHeading: 'Ikòn GeoLingua',
    iconExplanation: 'Sa a se ikòn pa defo GeoLingua. Lè li entegre nan aplikasyon ou, itilizatè yo klike sou li pou ouvri selektè lang lan.',
    iconModeHeading: 'Entegre kòm ikòn',
    localeCode: 'Kòd lang',
    reactIntegration: 'Entegrasyon React',
    usingDetectedLocale: 'Itilize lang ki detekte a',
    languageNotes: 'Nòt espesifik pou lang lan',
    loadTranslations: 'Chaje tradiksyon',
    formatDatesNumbers: 'Fòma dat ak nimewo',
  },
};

export function t(locale: string, key: keyof TranslationStrings): string {
  // Exact match
  if (translations[locale]) return translations[locale][key];
  // Base language (e.g., "zh-CN" → "zh")
  const base = locale.split('-')[0];
  if (translations[base]) return translations[base][key];
  // Fallback to English
  return translations.en[key];
}
