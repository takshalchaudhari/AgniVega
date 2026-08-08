/* ------------------------------------------------------------------ *
 * Pan-India language layer.
 * Every scheduled Indian language is selectable; strings fall back to
 * English when a translation is not yet supplied, so the UI never breaks.
 * ------------------------------------------------------------------ */

export type Lang =
  | "en" | "hi" | "mr" | "bn" | "te" | "ta" | "gu" | "kn" | "ml" | "pa"
  | "or" | "as" | "ur" | "sa" | "ne" | "sd" | "ks" | "kok" | "mai" | "mni"
  | "doi" | "brx" | "sat";

export interface LanguageMeta {
  code: Lang;
  /** Native script name shown in the picker. */
  label: string;
  /** Latin name so the search box works with an English keyboard. */
  english: string;
  /** BCP-47 tag for speech recognition + synthesis. */
  speech: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "mr", label: "मराठी", english: "Marathi", speech: "mr-IN" },
  { code: "hi", label: "हिन्दी", english: "Hindi", speech: "hi-IN" },
  { code: "en", label: "English", english: "English", speech: "en-IN" },
  { code: "bn", label: "বাংলা", english: "Bengali", speech: "bn-IN" },
  { code: "te", label: "తెలుగు", english: "Telugu", speech: "te-IN" },
  { code: "ta", label: "தமிழ்", english: "Tamil", speech: "ta-IN" },
  { code: "gu", label: "ગુજરાતી", english: "Gujarati", speech: "gu-IN" },
  { code: "kn", label: "ಕನ್ನಡ", english: "Kannada", speech: "kn-IN" },
  { code: "ml", label: "മലയാളം", english: "Malayalam", speech: "ml-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ", english: "Punjabi", speech: "pa-IN" },
  { code: "or", label: "ଓଡ଼ିଆ", english: "Odia", speech: "or-IN" },
  { code: "as", label: "অসমীয়া", english: "Assamese", speech: "as-IN" },
  { code: "ur", label: "اردو", english: "Urdu", speech: "ur-IN" },
  { code: "ne", label: "नेपाली", english: "Nepali", speech: "ne-NP" },
  { code: "sa", label: "संस्कृतम्", english: "Sanskrit", speech: "sa-IN" },
  { code: "sd", label: "سنڌي", english: "Sindhi", speech: "sd-IN" },
  { code: "ks", label: "کٲشُر", english: "Kashmiri", speech: "ks-IN" },
  { code: "kok", label: "कोंकणी", english: "Konkani", speech: "kok-IN" },
  { code: "mai", label: "मैथिली", english: "Maithili", speech: "mai-IN" },
  { code: "mni", label: "ꯃꯤꯇꯩꯂꯣꯟ", english: "Manipuri", speech: "mni-IN" },
  { code: "doi", label: "डोगरी", english: "Dogri", speech: "doi-IN" },
  { code: "brx", label: "बड़ो", english: "Bodo", speech: "brx-IN" },
  { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali", speech: "sat-IN" },
];

export const RTL_LANGS: Lang[] = ["ur", "sd", "ks"];

export function speechLocale(lang: Lang): string {
  return LANGUAGES.find((l) => l.code === lang)?.speech ?? "en-IN";
}

export function languageName(lang: Lang): string {
  return LANGUAGES.find((l) => l.code === lang)?.english ?? "English";
}

type Entry = { en: string } & Partial<Record<Lang, string>>;

export const STRINGS: Record<string, Entry> = {
  brand: { en: "Team Agnivega", hi: "टीम अग्निवेग", mr: "टीम अग्निवेग" },
  tagline: {
    en: "Smart Krishi-Yatra AI — Agri-Logistics Operating System",
    hi: "स्मार्ट कृषि-यात्रा AI — कृषि-लॉजिस्टिक्स ऑपरेटिंग सिस्टम",
    mr: "स्मार्ट कृषी-यात्रा AI — कृषी-लॉजिस्टिक्स ऑपरेटिंग सिस्टम",
    bn: "স্মার্ট কৃষি-যাত্রা AI — কৃষি-লজিস্টিকস অপারেটিং সিস্টেম",
    ta: "ஸ்மார்ட் கிருஷி-யாத்ரா AI — வேளாண் தளவாட அமைப்பு",
    te: "స్మార్ట్ కృషి-యాత్ర AI — వ్యవసాయ లాజిస్టిక్స్ వ్యవస్థ",
  },
  farmerPortal: {
    en: "Farmer Portal", hi: "किसान पोर्टल", mr: "शेतकरी पोर्टल", bn: "কৃষক পোর্টাল",
    te: "రైతు పోర్టల్", ta: "விவசாயி போர்டல்", gu: "ખેડૂત પોર્ટલ", kn: "ರೈತ ಪೋರ್ಟಲ್",
    ml: "കർഷക പോർട്ടൽ", pa: "ਕਿਸਾਨ ਪੋਰਟਲ", or: "କୃଷକ ପୋର୍ଟାଲ", as: "কৃষক প’ৰ্টেল", ur: "کسان پورٹل",
  },
  crop: {
    en: "Crop", hi: "फसल", mr: "पीक", bn: "ফসল", te: "పంట", ta: "பயிர்", gu: "પાક",
    kn: "ಬೆಳೆ", ml: "വിള", pa: "ਫ਼ਸਲ", or: "ଫସଲ", as: "শস্য", ur: "فصل",
  },
  weight: {
    en: "Weight", hi: "वज़न", mr: "वजन", bn: "ওজন", te: "బరువు", ta: "எடை", gu: "વજન",
    kn: "ತೂಕ", ml: "ഭാരം", pa: "ਭਾਰ", or: "ଓଜନ", as: "ওজন", ur: "وزن",
  },
  village: {
    en: "Village", hi: "गाँव", mr: "गाव", bn: "গ্রাম", te: "గ్రామం", ta: "கிராமம்", gu: "ગામ",
    kn: "ಗ್ರಾಮ", ml: "ഗ്രാമം", pa: "ਪਿੰਡ", or: "ଗାଁ", as: "গাঁও", ur: "گاؤں",
  },
  calculate: {
    en: "Calculate mandi net profit", hi: "मंडी शुद्ध लाभ की गणना करें", mr: "मंडी निव्वळ नफा मोजा",
    bn: "মান্ডি নিট লাভ হিসাব করুন", te: "మండి నికర లాభం లెక్కించండి", ta: "மண்டி நிகர லாபத்தைக் கணக்கிடு",
    gu: "મંડી ચોખ્ખો નફો ગણો", kn: "ಮಂಡಿ ನಿವ್ವಳ ಲಾಭ ಲೆಕ್ಕಹಾಕಿ", ml: "മണ്ടി അറ്റാദായം കണക്കാക്കുക",
    pa: "ਮੰਡੀ ਸ਼ੁੱਧ ਲਾਭ ਗਿਣੋ", ur: "منڈی خالص منافع کا حساب لگائیں",
  },
  pooled: {
    en: "Pooled transport", hi: "साझा ट्रक", mr: "सामायिक ट्रक", bn: "যৌথ পরিবহন", te: "ఉమ్మడి రవాణా",
    ta: "பகிர்வு போக்குவரத்து", gu: "સહિયારું વાહન", kn: "ಹಂಚಿಕೆ ಸಾರಿಗೆ", ml: "പങ്കിട്ട ഗതാഗതം",
    pa: "ਸਾਂਝਾ ਟਰੱਕ", ur: "مشترکہ ٹرک",
  },
  solo: {
    en: "Individual solo truck", hi: "अलग ट्रक", mr: "स्वतंत्र ट्रक", bn: "একক ট্রাক", te: "సొంత ట్రక్",
    ta: "தனி லாரி", gu: "એકલું વાહન", kn: "ಪ್ರತ್ಯೇಕ ಟ್ರಕ್", ml: "ഒറ്റ ട്രക്ക്", pa: "ਵੱਖਰਾ ਟਰੱਕ", ur: "الگ ٹرک",
  },
  confirmPooled: {
    en: "Confirm & join pooled truck", hi: "साझा ट्रक कन्फ़र्म करें", mr: "सामायिक ट्रक निश्चित करा",
    bn: "যৌথ ট্রাক নিশ্চিত করুন", te: "ఉమ్మడి ట్రక్ ఖరారు చేయండి", ta: "பகிர்வு லாரியை உறுதிசெய்",
    gu: "સહિયારું વાહન કન્ફર્મ કરો", kn: "ಹಂಚಿಕೆ ಟ್ರಕ್ ದೃಢೀಕರಿಸಿ", pa: "ਸਾਂਝਾ ਟਰੱਕ ਪੱਕਾ ਕਰੋ",
  },
  confirmSolo: {
    en: "Confirm solo truck", hi: "अलग ट्रक कन्फ़र्म करें", mr: "स्वतंत्र ट्रक निश्चित करा",
    bn: "একক ট্রাক নিশ্চিত করুন", te: "సొంత ట్రక్ ఖరారు చేయండి", ta: "தனி லாரியை உறுதிசெய்",
    gu: "એકલું વાહન કન્ફર્મ કરો", kn: "ಪ್ರತ್ಯೇಕ ಟ್ರಕ್ ದೃಢೀಕರಿಸಿ", pa: "ਵੱਖਰਾ ਟਰੱਕ ਪੱਕਾ ਕਰੋ",
  },
  netCash: {
    en: "Net cash", hi: "शुद्ध राशि", mr: "निव्वळ रक्कम", bn: "নিট টাকা", te: "నికర నగదు",
    ta: "நிகர தொகை", gu: "ચોખ્ખી રકમ", kn: "ನಿವ್ವಳ ಮೊತ್ತ", ml: "അറ്റ തുക", pa: "ਸ਼ੁੱਧ ਰਕਮ", ur: "خالص رقم",
  },
  savings: { en: "Saved", hi: "बचत", mr: "बचत", bn: "সাশ্রয়", te: "ఆదా", ta: "சேமிப்பு", gu: "બચત", kn: "ಉಳಿತಾಯ", pa: "ਬੱਚਤ" },
  speak: { en: "Speak", hi: "बोलें", mr: "बोला", bn: "বলুন", te: "మాట్లాడండి", ta: "பேசு", gu: "બોલો", kn: "ಮಾತನಾಡಿ", ml: "സംസാരിക്കുക", pa: "ਬੋਲੋ", ur: "بولیں" },
  listening: { en: "Listening…", hi: "सुन रहे हैं…", mr: "ऐकत आहे…", bn: "শুনছি…", te: "వింటున్నాం…", ta: "கேட்கிறது…", gu: "સાંભળી રહ્યા છીએ…", kn: "ಕೇಳುತ್ತಿದೆ…", pa: "ਸੁਣ ਰਹੇ ਹਾਂ…" },
  spoilage: { en: "Spoilage clock", hi: "खराब होने का समय", mr: "खराब होण्याची वेळ", bn: "নষ্ট হওয়ার সময়", te: "పాడయ్యే సమయం", ta: "கெடும் நேரம்" },
  myShipments: { en: "My shipments", hi: "मेरी शिपमेंट", mr: "माझ्या पाठवण्या", bn: "আমার চালান", te: "నా షిప్‌మెంట్లు", ta: "என் அனுப்புகைகள்" },
  offlineQueued: { en: "Queued offline", hi: "ऑफ़लाइन क़तार में", mr: "ऑफलाइन रांगेत ठेवले", bn: "অফলাইনে সারিবদ্ধ" },
  searchLanguage: { en: "Search language…", hi: "भाषा खोजें…", mr: "भाषा शोधा…" },
};

export function t(key: keyof typeof STRINGS | string, lang: Lang): string {
  const entry = STRINGS[key];
  if (!entry) return String(key);
  return entry[lang] ?? entry.en;
}

export function cropName(
  crop: { name_en: string; name_mr: string; name_hi: string },
  lang: Lang,
): string {
  if (lang === "mr") return crop.name_mr;
  if (lang === "hi" || lang === "mai" || lang === "doi" || lang === "brx" || lang === "sa") return crop.name_hi;
  return crop.name_en;
}

/** Dialect confirmation sentence spoken back after a calculation. */
export function spokenConfirmation(
  weightKg: number,
  crop: { name_en: string; name_mr: string; name_hi: string },
  lang: Lang,
): string {
  if (lang === "mr") return `तुमचा ${weightKg} किलो ${crop.name_mr} गणनेत जोडला आहे.`;
  if (lang === "hi") return `आपका ${weightKg} किलो ${crop.name_hi} गणना में जोड़ दिया गया है।`;
  return `Your ${weightKg} kg of ${crop.name_en} has been added to the calculation.`;
}

/** Region tags so the language picker can be browsed across all of India. */
export const LANGUAGE_REGION: Record<Lang, string> = {
  en: "Pan-India",
  hi: "North & Central",
  mr: "West",
  bn: "East",
  te: "South",
  ta: "South",
  gu: "West",
  kn: "South",
  ml: "South",
  pa: "North",
  or: "East",
  as: "North-East",
  ur: "North",
  sa: "Pan-India",
  ne: "Himalayan",
  sd: "West",
  ks: "Himalayan",
  kok: "West",
  mai: "East",
  mni: "North-East",
  doi: "Himalayan",
  brx: "North-East",
  sat: "East",
};

export const REGIONS = [
  "Pan-India",
  "North",
  "North & Central",
  "West",
  "South",
  "East",
  "North-East",
  "Himalayan",
] as const;
