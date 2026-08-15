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

/** Dictionary keyed by the English phrase — untranslated keys fall back to English. */
type Phrase =
  | "Home" | "Send crop" | "My loads" | "Market" | "Money" | "Duty" | "Trips" | "Earnings"
  | "Overview" | "Vehicles" | "Drivers" | "Maintenance" | "Orders" | "Control tower"
  | "Live ops" | "Network" | "Demo & system" | "Sign in" | "Sign out" | "Language"
  | "Theme" | "Light" | "Dark" | "Farmer" | "Driver" | "Fleet" | "Buyer" | "Admin";

type Dict = Partial<Record<Phrase, string>>;

const T: Partial<Record<Lang, Dict>> = {
  hi: { Home: "होम", "Send crop": "फसल भेजें", "My loads": "मेरे लोड", Market: "बाज़ार", Money: "पैसा", Duty: "ड्यूटी", Trips: "यात्राएँ", Earnings: "कमाई", Overview: "अवलोकन", Vehicles: "वाहन", Drivers: "चालक", Maintenance: "रखरखाव", Orders: "ऑर्डर", "Control tower": "कंट्रोल टॉवर", "Live ops": "लाइव संचालन", Network: "नेटवर्क", "Demo & system": "डेमो व सिस्टम", "Sign in": "साइन इन", "Sign out": "साइन आउट", Language: "भाषा", Theme: "थीम", Light: "उजाला", Dark: "अंधेरा", Farmer: "किसान", Driver: "चालक", Fleet: "फ्लीट", Buyer: "खरीदार", Admin: "प्रशासक" },
  mr: { Home: "होम", "Send crop": "पीक पाठवा", "My loads": "माझे लोड", Market: "बाजार", Money: "पैसे", Duty: "ड्युटी", Trips: "फेऱ्या", Earnings: "कमाई", Overview: "आढावा", Vehicles: "वाहने", Drivers: "चालक", Maintenance: "देखभाल", Orders: "ऑर्डर", "Control tower": "कंट्रोल टॉवर", "Live ops": "थेट कामकाज", Network: "नेटवर्क", "Demo & system": "डेमो व प्रणाली", "Sign in": "साइन इन", "Sign out": "साइन आउट", Language: "भाषा", Theme: "थीम", Light: "उजेड", Dark: "गडद", Farmer: "शेतकरी", Driver: "चालक", Fleet: "फ्लीट", Buyer: "खरेदीदार", Admin: "प्रशासक" },
  bn: { Home: "হোম", "Send crop": "ফসল পাঠান", "My loads": "আমার লোড", Market: "বাজার", Money: "টাকা", Duty: "ডিউটি", Trips: "ট্রিপ", Earnings: "আয়", Overview: "সারসংক্ষেপ", Vehicles: "যানবাহন", Drivers: "চালক", Maintenance: "রক্ষণাবেক্ষণ", Orders: "অর্ডার", "Control tower": "কন্ট্রোল টাওয়ার", "Live ops": "লাইভ অপারেশন", Network: "নেটওয়ার্ক", "Demo & system": "ডেমো ও সিস্টেম", "Sign in": "সাইন ইন", "Sign out": "সাইন আউট", Language: "ভাষা", Theme: "থিম", Light: "আলো", Dark: "অন্ধকার", Farmer: "কৃষক", Driver: "চালক", Fleet: "ফ্লিট", Buyer: "ক্রেতা", Admin: "প্রশাসক" },
  ta: { Home: "முகப்பு", "Send crop": "பயிர் அனுப்பு", "My loads": "என் சரக்குகள்", Market: "சந்தை", Money: "பணம்", Duty: "பணி", Trips: "பயணங்கள்", Earnings: "வருமானம்", Overview: "மேலோட்டம்", Vehicles: "வாகனங்கள்", Drivers: "ஓட்டுநர்கள்", Maintenance: "பராமரிப்பு", Orders: "ஆர்டர்கள்", "Control tower": "கட்டுப்பாட்டு அறை", "Live ops": "நேரலை செயல்பாடு", Network: "வலையமைப்பு", "Demo & system": "டெமோ & அமைப்பு", "Sign in": "உள்நுழை", "Sign out": "வெளியேறு", Language: "மொழி", Theme: "தீம்", Light: "வெளிச்சம்", Dark: "இருள்", Farmer: "விவசாயி", Driver: "ஓட்டுநர்", Fleet: "வாகனத்தொகுப்பு", Buyer: "வாங்குபவர்", Admin: "நிர்வாகி" },
  te: { Home: "హోమ్", "Send crop": "పంట పంపండి", "My loads": "నా లోడ్లు", Market: "మార్కెట్", Money: "డబ్బు", Duty: "డ్యూటీ", Trips: "ప్రయాణాలు", Earnings: "ఆదాయం", Overview: "సమీక్ష", Vehicles: "వాహనాలు", Drivers: "డ్రైవర్లు", Maintenance: "నిర్వహణ", Orders: "ఆర్డర్లు", "Control tower": "కంట్రోల్ టవర్", "Live ops": "లైవ్ ఆపరేషన్స్", Network: "నెట్‌వర్క్", "Demo & system": "డెమో & సిస్టమ్", "Sign in": "సైన్ ఇన్", "Sign out": "సైన్ అవుట్", Language: "భాష", Theme: "థీమ్", Light: "వెలుగు", Dark: "చీకటి", Farmer: "రైతు", Driver: "డ్రైవర్", Fleet: "ఫ్లీట్", Buyer: "కొనుగోలుదారు", Admin: "అడ్మిన్" },
  kn: { Home: "ಮುಖಪುಟ", "Send crop": "ಬೆಳೆ ಕಳುಹಿಸಿ", "My loads": "ನನ್ನ ಲೋಡ್‌ಗಳು", Market: "ಮಾರುಕಟ್ಟೆ", Money: "ಹಣ", Duty: "ಕರ್ತವ್ಯ", Trips: "ಪ್ರಯಾಣಗಳು", Earnings: "ಗಳಿಕೆ", Overview: "ಅವಲೋಕನ", Vehicles: "ವಾಹನಗಳು", Drivers: "ಚಾಲಕರು", Maintenance: "ನಿರ್ವಹಣೆ", Orders: "ಆರ್ಡರ್‌ಗಳು", "Control tower": "ಕಂಟ್ರೋಲ್ ಟವರ್", "Live ops": "ಲೈವ್ ಕಾರ್ಯಾಚರಣೆ", Network: "ಜಾಲ", "Demo & system": "ಡೆಮೊ & ಸಿಸ್ಟಂ", "Sign in": "ಸೈನ್ ಇನ್", "Sign out": "ಸೈನ್ ಔಟ್", Language: "ಭಾಷೆ", Theme: "ಥೀಮ್", Light: "ಬೆಳಕು", Dark: "ಕತ್ತಲೆ", Farmer: "ರೈತ", Driver: "ಚಾಲಕ", Fleet: "ಫ್ಲೀಟ್", Buyer: "ಖರೀದಿದಾರ", Admin: "ನಿರ್ವಾಹಕ" },
  ml: { Home: "ഹോം", "Send crop": "വിള അയയ്ക്കുക", "My loads": "എന്റെ ലോഡുകൾ", Market: "വിപണി", Money: "പണം", Duty: "ഡ്യൂട്ടി", Trips: "യാത്രകൾ", Earnings: "വരുമാനം", Overview: "അവലോകനം", Vehicles: "വാഹനങ്ങൾ", Drivers: "ഡ്രൈവർമാർ", Maintenance: "പരിപാലനം", Orders: "ഓർഡറുകൾ", "Control tower": "കൺട്രോൾ ടവർ", "Live ops": "ലൈവ് ഓപ്പറേഷൻസ്", Network: "നെറ്റ്‌വർക്ക്", "Demo & system": "ഡെമോ & സിസ്റ്റം", "Sign in": "സൈൻ ഇൻ", "Sign out": "സൈൻ ഔട്ട്", Language: "ഭാഷ", Theme: "തീം", Light: "വെളിച്ചം", Dark: "ഇരുട്ട്", Farmer: "കർഷകൻ", Driver: "ഡ്രൈവർ", Fleet: "ഫ്ലീറ്റ്", Buyer: "വാങ്ങുന്നയാൾ", Admin: "അഡ്മിൻ" },
  gu: { Home: "હોમ", "Send crop": "પાક મોકલો", "My loads": "મારા લોડ", Market: "બજાર", Money: "પૈસા", Duty: "ડ્યુટી", Trips: "ટ્રિપ", Earnings: "કમાણી", Overview: "ઝાંખી", Vehicles: "વાહનો", Drivers: "ડ્રાઇવરો", Maintenance: "જાળવણી", Orders: "ઓર્ડર", "Control tower": "કંટ્રોલ ટાવર", "Live ops": "લાઇવ કામગીરી", Network: "નેટવર્ક", "Demo & system": "ડેમો અને સિસ્ટમ", "Sign in": "સાઇન ઇન", "Sign out": "સાઇન આઉટ", Language: "ભાષા", Theme: "થીમ", Light: "પ્રકાશ", Dark: "શ્યામ", Farmer: "ખેડૂત", Driver: "ડ્રાઇવર", Fleet: "ફ્લીટ", Buyer: "ખરીદદાર", Admin: "એડમિન" },
  pa: { Home: "ਹੋਮ", "Send crop": "ਫ਼ਸਲ ਭੇਜੋ", "My loads": "ਮੇਰੇ ਲੋਡ", Market: "ਮੰਡੀ", Money: "ਪੈਸਾ", Duty: "ਡਿਊਟੀ", Trips: "ਸਫ਼ਰ", Earnings: "ਕਮਾਈ", Overview: "ਸੰਖੇਪ", Vehicles: "ਵਾਹਨ", Drivers: "ਡਰਾਈਵਰ", Maintenance: "ਰੱਖ-ਰਖਾਅ", Orders: "ਆਰਡਰ", "Control tower": "ਕੰਟਰੋਲ ਟਾਵਰ", "Live ops": "ਲਾਈਵ ਕੰਮ", Network: "ਨੈੱਟਵਰਕ", "Demo & system": "ਡੈਮੋ ਤੇ ਸਿਸਟਮ", "Sign in": "ਸਾਈਨ ਇਨ", "Sign out": "ਸਾਈਨ ਆਊਟ", Language: "ਭਾਸ਼ਾ", Theme: "ਥੀਮ", Light: "ਚਾਨਣ", Dark: "ਹਨੇਰਾ", Farmer: "ਕਿਸਾਨ", Driver: "ਡਰਾਈਵਰ", Fleet: "ਫਲੀਟ", Buyer: "ਖਰੀਦਦਾਰ", Admin: "ਪ੍ਰਬੰਧਕ" },
  or: { Home: "ହୋମ", "Send crop": "ଫସଲ ପଠାନ୍ତୁ", "My loads": "ମୋ ଲୋଡ୍", Market: "ବଜାର", Money: "ଟଙ୍କା", Duty: "ଡ୍ୟୁଟି", Trips: "ଯାତ୍ରା", Earnings: "ଆୟ", Overview: "ସାରାଂଶ", Vehicles: "ଯାନ", Drivers: "ଚାଳକ", Maintenance: "ରକ୍ଷଣାବେକ୍ଷଣ", Orders: "ଅର୍ଡର", "Control tower": "କଣ୍ଟ୍ରୋଲ ଟାୱାର", "Live ops": "ଲାଇଭ ଅପରେସନ", Network: "ନେଟୱାର୍କ", "Demo & system": "ଡେମୋ ଓ ସିଷ୍ଟମ", "Sign in": "ସାଇନ ଇନ", "Sign out": "ସାଇନ ଆଉଟ", Language: "ଭାଷା", Theme: "ଥିମ", Light: "ଆଲୋକ", Dark: "ଅନ୍ଧାର", Farmer: "କୃଷକ", Driver: "ଚାଳକ", Fleet: "ଫ୍ଲିଟ", Buyer: "କ୍ରେତା", Admin: "ପ୍ରଶାସକ" },
  as: { Home: "হোম", "Send crop": "শস্য পঠিয়াওক", "My loads": "মোৰ লোড", Market: "বজাৰ", Money: "টকা", Duty: "ডিউটি", Trips: "যাত্ৰা", Earnings: "উপাৰ্জন", Overview: "সাৰাংশ", Vehicles: "যান", Drivers: "চালক", Maintenance: "ৰক্ষণাবেক্ষণ", Orders: "অৰ্ডাৰ", "Control tower": "কণ্ট্ৰোল টাৱাৰ", "Live ops": "লাইভ অপাৰেচন", Network: "নেটৱৰ্ক", "Demo & system": "ডেমো আৰু চিষ্টেম", "Sign in": "ছাইন ইন", "Sign out": "ছাইন আউট", Language: "ভাষা", Theme: "থীম", Light: "পোহৰ", Dark: "আন্ধাৰ", Farmer: "কৃষক", Driver: "চালক", Fleet: "ফ্লিট", Buyer: "ক্ৰেতা", Admin: "প্ৰশাসক" },
  ur: { Home: "ہوم", "Send crop": "فصل بھیجیں", "My loads": "میرے لوڈ", Market: "منڈی", Money: "پیسہ", Duty: "ڈیوٹی", Trips: "سفر", Earnings: "کمائی", Overview: "جائزہ", Vehicles: "گاڑیاں", Drivers: "ڈرائیور", Maintenance: "دیکھ بھال", Orders: "آرڈر", "Control tower": "کنٹرول ٹاور", "Live ops": "لائیو آپریشن", Network: "نیٹ ورک", "Demo & system": "ڈیمو اور سسٹم", "Sign in": "سائن ان", "Sign out": "سائن آؤٹ", Language: "زبان", Theme: "تھیم", Light: "روشن", Dark: "تاریک", Farmer: "کسان", Driver: "ڈرائیور", Fleet: "فلیٹ", Buyer: "خریدار", Admin: "منتظم" },
  sa: { Home: "गृहम्", "Send crop": "सस्यं प्रेषय", "My loads": "मम भाराः", Market: "विपणिः", Money: "धनम्", Duty: "कार्यम्", Trips: "यात्राः", Earnings: "आयः", Overview: "अवलोकनम्", Vehicles: "यानानि", Drivers: "चालकाः", Maintenance: "परिपालनम्", Orders: "आदेशाः", "Control tower": "नियन्त्रणस्तम्भः", "Live ops": "सद्यःकार्यम्", Network: "जालम्", "Demo & system": "प्रदर्शनं तन्त्रं च", "Sign in": "प्रवेशः", "Sign out": "निर्गमः", Language: "भाषा", Theme: "रूपम्", Light: "प्रकाशः", Dark: "तमः", Farmer: "कृषकः", Driver: "चालकः", Fleet: "यानसमूहः", Buyer: "क्रेता", Admin: "प्रशासकः" },
  ne: { Home: "गृह", "Send crop": "बाली पठाउनुहोस्", "My loads": "मेरा लोड", Market: "बजार", Money: "पैसा", Duty: "ड्युटी", Trips: "यात्रा", Earnings: "आम्दानी", Overview: "अवलोकन", Vehicles: "सवारी", Drivers: "चालक", Maintenance: "मर्मत", Orders: "अर्डर", "Control tower": "कन्ट्रोल टावर", "Live ops": "प्रत्यक्ष सञ्चालन", Network: "नेटवर्क", "Demo & system": "डेमो र प्रणाली", "Sign in": "साइन इन", "Sign out": "साइन आउट", Language: "भाषा", Theme: "थिम", Light: "उज्यालो", Dark: "अँध्यारो", Farmer: "किसान", Driver: "चालक", Fleet: "फ्लीट", Buyer: "क्रेता", Admin: "प्रशासक" },
  kok: { Home: "घर", "Send crop": "पीक धाड", "My loads": "म्हजे लोड", Market: "बाजार", Money: "पयशे", Duty: "ड्युटी", Trips: "प्रवास", Earnings: "कमाई", Overview: "आडावो", Vehicles: "वाहनां", Drivers: "चालक", Maintenance: "दुरुस्ती", Orders: "ऑर्डर", "Control tower": "कंट्रोल टावर", "Live ops": "थेट कामकाज", Network: "नेटवर्क", "Demo & system": "डेमो आनी प्रणाली", "Sign in": "साइन इन", "Sign out": "साइन आउट", Language: "भास", Theme: "थीम", Light: "उजवाड", Dark: "काळें", Farmer: "शेतकार", Driver: "चालक", Fleet: "फ्लीट", Buyer: "गिरायक", Admin: "प्रशासक" },
  mai: { Home: "घर", "Send crop": "फसल पठाउ", "My loads": "हमर लोड", Market: "बजार", Money: "पाइ", Duty: "ड्यूटी", Trips: "यात्रा", Earnings: "कमाई", Overview: "अवलोकन", Vehicles: "वाहन", Drivers: "चालक", Maintenance: "मरम्मत", Orders: "ऑर्डर", "Control tower": "कंट्रोल टावर", "Live ops": "जीवंत संचालन", Network: "नेटवर्क", "Demo & system": "डेमो आ सिस्टम", "Sign in": "साइन इन", "Sign out": "साइन आउट", Language: "भाषा", Theme: "थीम", Light: "इजोत", Dark: "अन्हार", Farmer: "किसान", Driver: "चालक", Fleet: "फ्लीट", Buyer: "क्रेता", Admin: "प्रशासक" },
  doi: { Home: "घर", "Send crop": "फसल भेजो", "My loads": "मेरे लोड", Market: "मंडी", Money: "पैसा", Duty: "ड्यूटी", Trips: "सफर", Earnings: "कमाई", Overview: "सार", Vehicles: "गड्डियां", Drivers: "चालक", Maintenance: "मरम्मत", Orders: "ऑर्डर", "Control tower": "कंट्रोल टावर", "Live ops": "लाइव कम्म", Network: "नेटवर्क", "Demo & system": "डेमो ते सिस्टम", "Sign in": "साइन इन", "Sign out": "साइन आउट", Language: "भाशा", Theme: "थीम", Light: "चानण", Dark: "न्हेरा", Farmer: "किसान", Driver: "चालक", Fleet: "फ्लीट", Buyer: "खरीददार", Admin: "प्रशासक" },
  brx: { Home: "नो", "Send crop": "आबाद दैथाय", "My loads": "आंनि लोड", Market: "बाजार", Money: "रांखान्थि", Duty: "दायित्व", Trips: "लामायाव", Earnings: "मुलाम्फा", Overview: "सारसंग्रह", Vehicles: "गाडी", Drivers: "ड्राइभार", Maintenance: "फाहामनाय", Orders: "अर्डार", "Control tower": "कन्ट्रल टावार", "Live ops": "लाइभ खामानि", Network: "नेटवार्क", "Demo & system": "डेमो आरो सिस्टम", "Sign in": "साइन इन", "Sign out": "साइन आउट", Language: "राव", Theme: "थीम", Light: "सोरखि", Dark: "खामनि", Farmer: "आबादगिरि", Driver: "ड्राइभार", Fleet: "फ्लीट", Buyer: "बायगिरि", Admin: "फोरमायगिरि" },
  sat: { Home: "ᱚᱲᱟᱜ", "Send crop": "ᱜᱟᱹᱲᱟ ᱠᱩᱞ", "My loads": "ᱤᱧᱟᱜ ᱞᱚᱰ", Market: "ᱦᱟᱴ", Money: "ᱴᱟᱠᱟ", Duty: "ᱠᱟᱹᱢᱤ", Trips: "ᱪᱟᱞᱟᱣ", Earnings: "ᱟᱭ", Overview: "ᱧᱮᱞ", Vehicles: "ᱜᱟᱰᱤ", Drivers: "ᱪᱟᱞᱟᱣᱤᱭᱟᱹ", Maintenance: "ᱥᱟᱹᱯᱲᱟᱣ", Orders: "ᱚᱰᱟᱨ", "Control tower": "ᱠᱚᱱᱴᱨᱚᱞ ᱴᱟᱶᱟᱨ", "Live ops": "ᱡᱤᱭᱚᱱ ᱠᱟᱹᱢᱤ", Network: "ᱱᱮᱴᱣᱟᱨᱠ", "Demo & system": "ᱰᱮᱢᱚ ᱟᱨ ᱥᱤᱥᱴᱚᱢ", "Sign in": "ᱵᱚᱞᱚᱱ", "Sign out": "ᱚᱰᱚᱠ", Language: "ᱯᱟᱹᱨᱥᱤ", Theme: "ᱛᱷᱤᱢ", Light: "ᱢᱟᱨᱥᱟᱞ", Dark: "ᱧᱩᱛ", Farmer: "ᱪᱟᱥᱤ", Driver: "ᱪᱟᱞᱟᱣᱤᱭᱟᱹ", Fleet: "ᱯᱷᱞᱤᱴ", Buyer: "ᱠᱤᱨᱤᱧᱤᱡ", Admin: "ᱮᱰᱢᱤᱱ" },
  mni: { Home: "য়ুম", "Send crop": "লৌমী থারকপা", "My loads": "ঐগী লোদ", Market: "কৈথেল", Money: "সেল", Duty: "থবক", Trips: "খোঙচৎ", Earnings: "সেন্থোক", Overview: "মথক্তগী", Vehicles: "গাড়ী", Drivers: "ড্রাইভর", Maintenance: "শেমগৎপা", Orders: "ওর্দর", "Control tower": "কন্ট্রোল টাৱার", "Live ops": "লাইভ থবক", Network: "নেতৱার্ক", "Demo & system": "ডেমো অমসুং সিস্তেম", "Sign in": "সাইন ইন", "Sign out": "সাইন আউত", Language: "লোল", Theme: "থীম", Light: "মঙাল", Dark: "অমম্বা", Farmer: "লৌমী", Driver: "ড্রাইভর", Fleet: "ফ্লীত", Buyer: "লৈবা মী", Admin: "এদমিন" },
  sd: { Home: "گھر", "Send crop": "فصل موڪليو", "My loads": "منهنجا لوڊ", Market: "مارڪيٽ", Money: "پئسا", Duty: "ڊيوٽي", Trips: "سفر", Earnings: "ڪمائي", Overview: "جائزو", Vehicles: "گاڏيون", Drivers: "ڊرائيور", Maintenance: "سار سنڀال", Orders: "آرڊر", "Control tower": "ڪنٽرول ٽاور", "Live ops": "لائيو ڪم", Network: "نيٽ ورڪ", "Demo & system": "ڊيمو ۽ سسٽم", "Sign in": "سائن ان", "Sign out": "سائن آئوٽ", Language: "ٻولي", Theme: "ٿيم", Light: "روشن", Dark: "اونداهو", Farmer: "هاري", Driver: "ڊرائيور", Fleet: "فليٽ", Buyer: "خريدار", Admin: "منتظم" },
  ks: { Home: "گَر", "Send crop": "فصل سوزِو", "My loads": "میٚنہٕ لوڈ", Market: "بازار", Money: "پیسہٕ", Duty: "ڈیوٹی", Trips: "سفر", Earnings: "کمَے", Overview: "جائزٕ", Vehicles: "گاڑی", Drivers: "ڈرایوٗر", Maintenance: "مرمَت", Orders: "آرڈر", "Control tower": "کنٹرول ٹاوَر", "Live ops": "لایو کٲم", Network: "نیٹ ورک", "Demo & system": "ڈیمو تہٕ سسٹم", "Sign in": "سائن اِن", "Sign out": "سائن آوٹ", Language: "زبان", Theme: "تھیم", Light: "روشن", Dark: "اندھیر", Farmer: "زمیندار", Driver: "ڈرایوٗر", Fleet: "فلیٹ", Buyer: "خریدار", Admin: "منتظم" },
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
      t: (k: string) => (T[lang] as Dict | undefined)?.[k as Phrase] ?? k,
    }),
    [lang, theme, userId],
  );

  return <PrefCtx.Provider value={value}>{children}</PrefCtx.Provider>;
}

export const useLang = () => useContext(PrefCtx);
export const usePrefs = useLang;
