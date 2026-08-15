import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

/** English + the 22 languages of the Eighth Schedule of the Constitution of India. */
export const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "as", label: "অসমীয়া" },
  { code: "ur", label: "اردو" },
  { code: "sa", label: "संस्कृतम्" },
  { code: "ne", label: "नेपाली" },
  { code: "kok", label: "कोंकणी" },
  { code: "mai", label: "मैथिली" },
  { code: "doi", label: "डोगरी" },
  { code: "brx", label: "बड़ो" },
  { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "mni", label: "মৈতৈলোন্" },
  { code: "sd", label: "سنڌي" },
  { code: "ks", label: "کٲشُر" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export const RTL_LANGS: Lang[] = ["ur", "sd", "ks"];

type Dict = Record<string, string>;

const T: Partial<Record<Lang, Dict>> = {
  hi: {
    Home: "होम",
    "Send crop": "फसल भेजें",
    "My loads": "मेरे लोड",
    Market: "बाज़ार",
    Money: "पैसा",
    Duty: "ड्यूटी",
    Trips: "यात्राएँ",
    Earnings: "कमाई",
    Overview: "अवलोकन",
    Vehicles: "वाहन",
    Drivers: "चालक",
    Maintenance: "रखरखाव",
    Orders: "ऑर्डर",
    "Control tower": "कंट्रोल टॉवर",
    "Live ops": "लाइव संचालन",
    Network: "नेटवर्क",
    "Demo & system": "डेमो व सिस्टम",
    "Sign in": "साइन इन",
    "Sign out": "साइन आउट",
    Language: "भाषा",
    Theme: "थीम",
    Light: "उजाला",
    Dark: "अंधेरा",
    Farmer: "किसान",
    Driver: "चालक",
    Fleet: "फ्लीट",
    Buyer: "खरीदार",
    Admin: "प्रशासक",
    "Smart Krishi Farmer": "स्मार्ट कृषि किसान",
    "Smart Krishi Driver": "स्मार्ट कृषि चालक",
    "Smart Krishi Fleet": "स्मार्ट कृषि फ्लीट",
    "Smart Krishi Buyer": "स्मार्ट कृषि खरीदार",
    "Smart Krishi Control Tower": "स्मार्ट कृषि कंट्रोल टॉवर",
    "Sell your harvest at the right mandi, at the right price.": "अपनी फसल सही मंडी में, सही दाम पर बेचें।",
    "Find loads, run the trip, get paid.": "लोड प्राप्त करें, यात्रा पूरी करें, तुरंत भुगतान पाएं।",
    "Vehicles, drivers, utilisation and maintenance in one board.": "वाहन, चालक और रखरखाव एक ही डैशबोर्ड पर।",
    "Buy graded produce straight from the farm gate.": "खेत से सीधे गुणवत्ता-परीक्षित फसल खरीदें।",
    "Whole-network operations, incidents and system mode.": "संपूर्ण नेटवर्क संचालन, घटनाएं और नियंत्रण।",
    "From the farm gate to the mandi, in one journey": "खेत के द्वार से मंडी तक, एक सुगम यात्रा",
    "Book a truck for your harvest, pool loads with neighbours, watch the trip live and get paid on delivery. Built for small growers, drivers and buyers across Maharashtra.":
      "फसल के लिए ट्रक बुक करें, पड़ोसियों के साथ लोड साझा करें, लाइव ट्रैक करें और डिलीवरी पर भुगतान पाएं।",
    "Open the Farmer app": "किसान ऐप खोलें",
    "Crops tracked": "ट्रैक की गई फसलें",
    "APMC mandis": "एपीएमसी मंडियां",
    "Vehicle limit": "वाहन भार सीमा",
    "Choose your app": "अपना ऐप चुनें",
    "Each role has its own interface, navigation and Android package.": "प्रत्येक भूमिका के लिए विशेष इंटरफ़ेस और सुविधाएं।",
    "Terms of Service": "सेवा की शर्तें",
    "Privacy Policy": "गोपनीयता नीति",
    "Mandi Disclosures & Disclaimer": "मंडी प्रकटीकरण एवं अस्वीकरण",
    "Contact & Statutory Support": "संपर्क एवं शिकायत निवारण",
    askAssistant: "कृषि साथी से पूछें",
  },
  mr: {
    Home: "होम",
    "Send crop": "पीक पाठवा",
    "My loads": "माझे लोड",
    Market: "बाजार",
    Money: "पैसे",
    Duty: "ड्युटी",
    Trips: "फेऱ्या",
    Earnings: "कमाई",
    Overview: "आढावा",
    Vehicles: "वाहने",
    Drivers: "चालक",
    Maintenance: "देखभाल",
    Orders: "ऑर्डर",
    "Control tower": "कंट्रोल टॉवर",
    "Live ops": "थेट कामकाज",
    Network: "नेटवर्क",
    "Demo & system": "डेमो व प्रणाली",
    "Sign in": "साइन इन",
    "Sign out": "साइन आउट",
    Language: "भाषा",
    Theme: "थीम",
    Light: "उजेड",
    Dark: "गडद",
    Farmer: "शेतकरी",
    Driver: "चालक",
    Fleet: "फ्लीट",
    Buyer: "खरेदीदार",
    Admin: "प्रशासक",
    "Smart Krishi Farmer": "स्मार्ट कृषी शेतकरी",
    "Smart Krishi Driver": "स्मार्ट कृषी चालक",
    "Smart Krishi Fleet": "स्मार्ट कृषी फ्लीट",
    "Smart Krishi Buyer": "स्मार्ट कृषी खरेदीदार",
    "Smart Krishi Control Tower": "स्मार्ट कृषी कंट्रोल टॉवर",
    "Sell your harvest at the right mandi, at the right price.": "आपले पीक योग्य बाजार समितीत, योग्य भावात विका.",
    "Find loads, run the trip, get paid.": "भाडे मिळवा, फेरी पूर्ण करा, त्वरित मोबदला मिळवा.",
    "Vehicles, drivers, utilisation and maintenance in one board.": "वाहने, चालक आणि देखभाल सर्व एकाच डॅशबोर्डवर.",
    "Buy graded produce straight from the farm gate.": "शेताच्या बांधावरून थेट दर्जेदार शेतमाल खरेदी करा.",
    "Whole-network operations, incidents and system mode.": "संपूर्ण नेटवर्कचे थेट व्यवस्थापन आणि नियंत्रण.",
    "From the farm gate to the mandi, in one journey": "शेताच्या बांधापासून ते बाजारापर्यंत, एकाच फेरीत",
    "Book a truck for your harvest, pool loads with neighbours, watch the trip live and get paid on delivery. Built for small growers, drivers and buyers across Maharashtra.":
      "पिकासाठी ट्रक बुक करा, शेजाऱ्यांसोबत लोड शेअर करा, थेट ट्रॅकिंग पहा आणि डिलिव्हरीवर पैसे मिळवा.",
    "Open the Farmer app": "शेतकरी ॲप उघडा",
    "Crops tracked": "नोंदणीकृत पिके",
    "APMC mandis": "बाजार समित्या",
    "Vehicle limit": "वाहन वजन मर्यादा",
    "Choose your app": "आपले ॲप निवडा",
    "Each role has its own interface, navigation and Android package.": "प्रत्येक भूमिकेसाठी स्वतंत्र इंटरफेस आणि वैशिष्ट्ये.",
    "Terms of Service": "सेवा अटी",
    "Privacy Policy": "गोपनीयता धोरण",
    "Mandi Disclosures & Disclaimer": "बाजार माहिती आणि अस्वीकरण",
    "Contact & Statutory Support": "संपर्क व तक्रार निवारण",
    askAssistant: "कृषी साथीला विचारा",
  },
};

export type Theme = "light" | "dark";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const PrefCtx = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const LANG_KEY = "sky-lang";
const THEME_KEY = "sky-theme";

/** Language + theme, shared across every panel, persisted per signed-in user. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<Theme>("light");
  const [userId, setUserId] = useState<string | null>(null);

  // local preferences first (works signed out, and across tabs)
  useEffect(() => {
    const l = window.localStorage.getItem(LANG_KEY) as Lang | null;
    if (l && LANGS.some((x) => x.code === l)) setLangState(l);
    const th = window.localStorage.getItem(THEME_KEY) as Theme | null;
    if (th === "dark" || th === "light") setThemeState(th);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY && e.newValue) setLangState(e.newValue as Lang);
      if (e.key === THEME_KEY && e.newValue) setThemeState(e.newValue as Theme);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // per-user preferences from the profile, whenever the session changes
  useEffect(() => {
    let alive = true;
    const load = async (uid: string | null) => {
      setUserId(uid);
      if (!uid) return;
      const { data } = await supabase
        .from("profiles")
        .select("language, theme")
        .eq("id", uid)
        .maybeSingle();
      if (!alive || !data) return;
      const l = data.language as Lang;
      if (l && LANGS.some((x) => x.code === l)) {
        setLangState(l);
        window.localStorage.setItem(LANG_KEY, l);
      }
      const th = (data as { theme?: string }).theme;
      if (th === "dark" || th === "light") {
        setThemeState(th);
        window.localStorage.setItem(THEME_KEY, th);
      }
    };
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      load(s?.user.id ?? null),
    );
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // reflect on <html> so every panel and portal follows
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", theme === "dark");
    el.dataset["theme"] = theme;
    el.lang = lang;
    el.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, [theme, lang]);

  const persist = (patch: { language?: Lang; theme?: Theme }) => {
    if (!userId) return;
    void supabase.from("profiles").update(patch).eq("id", userId);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(LANG_KEY, l);
    persist({ language: l });
  };
  const setTheme = (th: Theme) => {
    setThemeState(th);
    window.localStorage.setItem(THEME_KEY, th);
    persist({ theme: th });
  };

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      t: (k: string) => T[lang]?.[k] ?? k,
    }),
    [lang, theme, userId],
  );

  return <PrefCtx.Provider value={value}>{children}</PrefCtx.Provider>;
}

export const useLang = () => useContext(PrefCtx);
export const usePrefs = useLang;
