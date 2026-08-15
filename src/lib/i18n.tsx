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
    "Send Crop": "फसल भेजें",
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
    "Namaste, Kisan 🙏": "नमस्ते, किसान 🙏",
    "Here is your farm and crop logistics summary today.": "आज की आपकी कृषि एवं परिवहन लॉजिस्टिक्स का विवरण।",
    "Active Shipments": "सक्रिय लोड",
    "Money Credited": "खाते में जमा राशि",
    "Weather & Spoilage": "मौसम एवं खराबी जोखिम",
    "Pooling Savings": "पूलिंग बचत",
    "Loads on the move": "मार्ग में चल रहे लोड",
    "Live status of every harvest you sent": "आपके द्वारा भेजी गई प्रत्येक फसल की लाइव स्थिति",
    "Nothing on the road": "वर्तमान में कोई लोड मार्ग में नहीं है",
    "Book a truck for your harvest to get started.": "शुरुआत करने के लिए अपनी फसल हेतु ट्रक बुक करें।",
    "Quick Actions": "त्वरित कार्य",
    "Manage harvests & earnings": "फसल व आय प्रबंधन",
    "Mandi Rates & Trends": "मंडी भाव व रुझान",
    "Wallet & Payments": "वॉलेट व भुगतान",
    "Compare today's APMC mandi prices and 14-day trends.": "आज के एपीएमसी मंडी भाव और 14 दिनों के रुझानों की तुलना करें।",
    "Track credited amounts, escrow held funds, and payout slips.": "खाते में आई राशि, एस्क्रो फंड और भुगतान रसीदें ट्रैक करें।",
    "Pick crop, mandi, and quantity (T/Q/kg) — we allocate optimal 12T trucks.": "फसल, मंडी और मात्रा चुनें — हम अनुकूलित 12T ट्रक आवंटित करते हैं।",
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
    "Driver duty": "चालक ड्यूटी",
    "Load offers near you": "आपके निकट उपलब्ध लोड",
    "First to accept gets the load": "पहले स्वीकार करने वाले चालक को लोड मिलेगा",
    "No offers right now": "फिलहाल कोई नया लोड उपलब्ध नहीं है",
    "Stay online — new loads arrive through the day.": "ऑनलाइन रहें — दिनभर नए लोड आते रहते हैं।",
    "Open offers": "उपलब्ध लोड",
    "Completed payout": "प्राप्त भुगतान",
    "Current trip": "वर्तमान यात्रा",
    "Produce market": "कृषि उपज बाज़ार",
    "Graded lots, straight from the farm.": "सीधे खेत से वर्गीकृत एवं प्रमाणित उपज।",
    "Find produce": "उपज खोजें",
    "Filter by crop, mandi, grade and price": "फसल, मंडी, ग्रेड और कीमत के अनुसार फ़िल्टर करें",
    "Available lots": "उपलब्ध लॉट",
    "My orders": "मेरे ऑर्डर",
    "What you bought and where it is.": "आपके द्वारा खरीदे गए उत्पाद और उनकी वर्तमान स्थिति।",
    "Fleet overview": "फ्लीट अवलोकन",
    "Your trucks, drivers and money today.": "आपके ट्रक, चालक और दैनिक आय।",
    "Strict 12-tonne capacity guard enabled across all trucks.": "सभी ट्रकों पर सख्त 12-टन क्षमता सुरक्षा लागू।",
    "Keep the trucks on the road.": "वाहनों को सुरक्षित और चालू रखें।",
  },
  mr: {
    Home: "होम",
    "Send crop": "पीक पाठवा",
    "Send Crop": "पीक पाठवा",
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
    "Namaste, Kisan 🙏": "नमस्कार, शेतकरी बांधवांनो 🙏",
    "Here is your farm and crop logistics summary today.": "आजचा शेतमाल वाहतूक आणि बाजार सारांश.",
    "Active Shipments": "मार्गस्थ लोड",
    "Money Credited": "जमा झालेली रक्कम",
    "Weather & Spoilage": "हवामान व नासाडी जोखीम",
    "Pooling Savings": "पूलिंग बचत",
    "Loads on the move": "रस्त्यावरील सक्रिय लोड",
    "Live status of every harvest you sent": "तुम्ही पाठवलेल्या मालाची थेट ट्रॅकिंग स्थिती",
    "Nothing on the road": "सध्या कोणताही लोड रस्त्यावर नाही",
    "Book a truck for your harvest to get started.": "सुरुवात करण्यासाठी आपल्या मालासाठी ट्रक बुक करा.",
    "Quick Actions": "जलद कृती",
    "Manage harvests & earnings": "शेतमाल व कमाई व्यवस्थापन",
    "Mandi Rates & Trends": "बाजार भाव व अंदाज",
    "Wallet & Payments": "वॉलेट व देयके",
    "Compare today's APMC mandi prices and 14-day trends.": "आजचे बाजार समिती भाव आणि पुढील १४ दिवसांचा कल तपासा.",
    "Track credited amounts, escrow held funds, and payout slips.": "जमा रक्कम, सुरक्षित फंड आणि पावत्या तपासा.",
    "Pick crop, mandi, and quantity (T/Q/kg) — we allocate optimal 12T trucks.": "पीक, बाजार आणि वजन निवडा — आम्ही १२ टन ट्रक उपलब्ध करतो.",
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
    "Driver duty": "चालक ड्युटी",
    "Load offers near you": "जवळ उपलब्ध असलेले लोड",
    "First to accept gets the load": "प्रथम स्वीकारणाऱ्या चालकास भाडे मिळेल",
    "No offers right now": "सध्या कोणतेही नवीन भाडे उपलब्ध नाही",
    "Stay online — new loads arrive through the day.": "ऑनलाइन राहा — दिवसभरात नवीन लोड येत राहतात.",
    "Open offers": "उपलब्ध लोड",
    "Completed payout": "मिळालेला मोबदला",
    "Current trip": "चालू फेरी",
    "Produce market": "शेतमाल बाजार",
    "Graded lots, straight from the farm.": "थेट शेतातून प्रमाणित प्रतवारी केलेला माल.",
    "Find produce": "शेतमाल शोधा",
    "Filter by crop, mandi, grade and price": "पीक, बाजार, प्रत आणि दरानुसार शोधा",
    "Available lots": "उपलब्ध शेतमाल",
    "My orders": "माझे ऑर्डर्स",
    "What you bought and where it is.": "खरेदी केलेला माल आणि त्याची सद्यस्थिती.",
    "Fleet overview": "फ्लीट आढावा",
    "Your trucks, drivers and money today.": "तुमचे ट्रक, चालक आणि दैनंदिन जमा खर्च.",
    "Strict 12-tonne capacity guard enabled across all trucks.": "सर्व ट्रकांसाठी १२ टन क्षमता मर्यादा लागू.",
    "Keep the trucks on the road.": "वाहने रस्त्यावर सुरक्षित आणि कार्यरत ठेवा.",
  },
  gu: {
    Home: "હોમ",
    "Send crop": "પાક મોકલો",
    "Send Crop": "પાક મોકલો",
    "My loads": "મારા લોડ",
    Market: "બજાર",
    Money: "નાણાં",
    Duty: "ડ્યૂટી",
    Trips: "ટ્રિપ્સ",
    Earnings: "કમાણી",
    Overview: "ઝાંખી",
    Vehicles: "વાહનો",
    Drivers: "ડ્રાઈવર",
    Maintenance: "જાળવણી",
    Orders: "ઓર્ડર",
    "Control tower": "કંટ્રોલ ટાવર",
    "Live ops": "લાઈવ સંચાલન",
    Network: "નેટવર્ક",
    "Sign in": "સાઇન ઇન",
    "Sign out": "સાઇન આઉટ",
    Farmer: "ખેડૂત",
    Driver: "ચાલક",
    Fleet: "કાફલો",
    Buyer: "ખરીદદાર",
    Admin: "એડમિન",
    "Namaste, Kisan 🙏": "નમસ્તે, કિસાન 🙏",
    "Here is your farm and crop logistics summary today.": "આજનો ખેત પેદાશ પરિવહન સારાંશ.",
    "Active Shipments": "ચાલુ શિપમેન્ટ",
    "Money Credited": "જમા થયેલ રકમ",
    "Weather & Spoilage": "હવામાન અને બગાડ જોખમ",
    "Pooling Savings": "પૂલિંગ બચત",
    "Quick Actions": "ઝડપી ક્રિયાઓ",
    "Mandi Rates & Trends": "માર્કેટિંગ યાર્ડ ભાવ",
    "Wallet & Payments": "વોલેટ અને ચુકવણી",
    "From the farm gate to the mandi, in one journey": "ખેતરથી માર્કેટ યાર્ડ સુધી, એક સુગમ યાત્રા",
    "Open the Farmer app": "ખેડૂત એપ્લિકેશન ખોલો",
    "Choose your app": "તમારી એપ્લિકેશન પસંદ કરો",
  },
  bn: {
    Home: "হোম",
    "Send crop": "ফসল পাঠান",
    "Send Crop": "ফসল পাঠান",
    "My loads": "আমার লোড",
    Market: "বাজার",
    Money: "অর্থ",
    Duty: "ডিউটি",
    Trips: "ট্রিপ",
    Earnings: "উপার্জন",
    Overview: "সংক্ষিপ্ত বিবরণ",
    Vehicles: "যানবাহন",
    Drivers: "চালক",
    Maintenance: "রক্ষণাবেক্ষণ",
    Orders: "অর্ডার",
    "Control tower": "কন্ট্রোল টাওয়ার",
    "Live ops": "লাইভ অপারেশন",
    Network: "নেটওয়ার্ক",
    "Sign in": "সাইন ইন",
    "Sign out": "সাইন আউট",
    Farmer: "কৃষক",
    Driver: "ড্রাইভার",
    Fleet: "বহর",
    Buyer: "ক্রেতা",
    Admin: "অ্যাডমিন",
    "Namaste, Kisan 🙏": "নমস্কার, কৃষক বন্ধু 🙏",
    "Here is your farm and crop logistics summary today.": "আজকের আপনার কৃষি পরিবহন সংক্ষিপ্ত বিবরণ।",
    "Active Shipments": "সক্রিয় চালান",
    "Money Credited": "জমা হওয়া টাকা",
    "Weather & Spoilage": "আবহাওয়া ও ক্ষতির ঝুঁকি",
    "Pooling Savings": "পুলিং সাশ্রয়",
    "Quick Actions": "দ্রুত পদক্ষেপ",
    "Mandi Rates & Trends": "মান্ডি দর ও ট্রেন্ড",
    "Wallet & Payments": "ওয়ালেট ও পেমেন্ট",
    "From the farm gate to the mandi, in one journey": "খামার থেকে মান্ডি পর্যন্ত, এক যাত্রায়",
    "Open the Farmer app": "কৃষক অ্যাপ খুলুন",
    "Choose your app": "আপনার অ্যাপ বেছে নিন",
  },
  ta: {
    Home: "முகப்பு",
    "Send crop": "பயிர் அனுப்ப",
    "Send Crop": "பயிர் அனுப்ப",
    "My loads": "என் சரக்குகள்",
    Market: "சந்தை",
    Money: "பணம்",
    Duty: "பணி",
    Trips: "பயணங்கள்",
    Earnings: "வருமானம்",
    Overview: "கண்ணோட்டம்",
    Vehicles: "வாகனங்கள்",
    Drivers: "ஓட்டுநர்கள்",
    Maintenance: "பராமரிப்பு",
    Orders: "ஆர்டர்கள்",
    "Control tower": "கட்டுப்பாட்டு அறை",
    "Live ops": "நேரலை இயக்கம்",
    Network: "நெட்வொர்க்",
    "Sign in": "உள்நுழைக",
    "Sign out": "வெளியேறு",
    Farmer: "விவசாயி",
    Driver: "ஓட்டுநர்",
    Fleet: "வாகனக் குழு",
    Buyer: "வாங்குபவர்",
    Admin: "நிர்வாகி",
    "Namaste, Kisan 🙏": "வணக்கம், விவசாயி தோழரே 🙏",
    "Here is your farm and crop logistics summary today.": "இன்றைய விவசாய மற்றும் போக்குவரத்து சுருக்கம்.",
    "Active Shipments": "செயலில் உள்ள சரக்குகள்",
    "Money Credited": "வரவு வைக்கப்பட்ட தொகை",
    "Weather & Spoilage": "வானிலை & சேத அபாயம்",
    "Pooling Savings": "பகிர்வு சேமிப்பு",
    "Quick Actions": "விரைவுச் செயல்கள்",
    "Mandi Rates & Trends": "சந்தை விலைகள்",
    "Wallet & Payments": "பணப்பை & கட்டணங்கள்",
    "From the farm gate to the mandi, in one journey": "பண்ணையிலிருந்து சந்தை வரை, ஒரே பயணத்தில்",
    "Open the Farmer app": "விவசாயி செயலியைத் திறக்கவும்",
    "Choose your app": "உங்கள் செயலியைத் தேர்ந்தெடுக்கவும்",
  },
  te: {
    Home: "హోమ్",
    "Send crop": "పంట పంపండి",
    "Send Crop": "పంట పంపండి",
    "My loads": "నా లోడ్లు",
    Market: "మార్కెట్",
    Money: "డబ్బు",
    Duty: "డ్యూటీ",
    Trips: "ట్రిప్పులు",
    Earnings: "ఆదాయం",
    Overview: "అవలోకనం",
    Vehicles: "వాహనాలు",
    Drivers: "డ్రైవర్లు",
    Maintenance: "నిర్వహణ",
    Orders: "ఆర్డర్లు",
    "Control tower": "కంట్రోల్ టవర్",
    "Live ops": "లైవ్ కార్యకలాపాలు",
    Network: "నెట్‌వర్క్",
    "Sign in": "సైన్ ఇన్",
    "Sign out": "సైన్ అవుట్",
    Farmer: "రైతు",
    Driver: "డ్రైవర్",
    Fleet: "ఫ్లీట్",
    Buyer: "కొనుగోలుదారు",
    Admin: "అడ్మిన్",
    "Namaste, Kisan 🙏": "నమస్తే, రైతు సోదరా 🙏",
    "Here is your farm and crop logistics summary today.": "నేటి వ్యవసాయ రవాణా సమాచారం.",
    "Active Shipments": "యాక్టివ్ షిప్‌మెంట్‌లు",
    "Money Credited": "జమ అయిన మొత్తం",
    "Weather & Spoilage": "వాతావరణం & నష్ట ప్రమాదం",
    "Pooling Savings": "పూలింగ్ పొదుపు",
    "Quick Actions": "త్వరిత చర్యలు",
    "Mandi Rates & Trends": "మార్కెట్ ధరలు",
    "Wallet & Payments": "వ్యాలెట్ & చెల్లింపులు",
    "From the farm gate to the mandi, in one journey": "పొలం నుండి మార్కెట్ వరకు, ఒకే ప్రయాణంలో",
    "Open the Farmer app": "రైతు యాప్‌ను తెరవండి",
    "Choose your app": "మీ యాప్‌ను ఎంచుకోండి",
  },
  kn: {
    Home: "ಮುಖಪುಟ",
    "Send crop": "ಬೆಳೆ ಕಳುಹಿಸಿ",
    "Send Crop": "ಬೆಳೆ ಕಳುಹಿಸಿ",
    "My loads": "ನನ್ನ ಲೋಡ್‌ಗಳು",
    Market: "ಮಾರುಕಟ್ಟೆ",
    Money: "ಹಣ",
    Duty: "ಡ್ಯೂಟಿ",
    Trips: "ಪ್ರವಾಸಗಳು",
    Earnings: "ಗಳಿಕೆ",
    Overview: "ಅವಲೋಕನ",
    Vehicles: "ವಾಹನಗಳು",
    Drivers: "ಚಾಲಕರು",
    Maintenance: "ನಿರ್ವಹಣೆ",
    Orders: "ಆರ್ಡರ್‌ಗಳು",
    "Control tower": "ಕಂಟ್ರೋಲ್ ಟವರ್",
    "Live ops": "ಲೈವ್ ಕಾರ್ಯಾಚರಣೆ",
    Network: "ನೆಟ್‌ವರ್ಕ್",
    "Sign in": "ಸೈನ್ ಇನ್",
    "Sign out": "ಸೈನ್ ಔಟ್",
    Farmer: "ರೈತ",
    Driver: "ಚಾಲಕ",
    Fleet: "ಫ್ಲೀಟ್",
    Buyer: "ಖರೀದಿದಾರ",
    Admin: "ನಿರ್ವಾಹಕ",
    "Namaste, Kisan 🙏": "ನಮಸ್ಕಾರ, ರೈತ ಬಾಂಧವರೇ 🙏",
    "Here is your farm and crop logistics summary today.": "ಇಂದಿನ ಕೃಷಿ ಸಾರಿಗೆ ಸಾರಾಂಶ.",
    "Active Shipments": "ಸಕ್ರಿಯ ಸಾಗಣೆಗಳು",
    "Money Credited": "ಖಾತೆಗೆ ಜಮಾ ಆದ ಹಣ",
    "Weather & Spoilage": "ಹವಾಮಾನ ಮತ್ತು ಹಾನಿ ಅಪಾಯ",
    "Pooling Savings": "ಪೂಲಿಂಗ್ ಉಳಿತಾಯ",
    "Quick Actions": "ತ್ವರಿತ ಕಾರ್ಯಗಳು",
    "Mandi Rates & Trends": "ಮಾರುಕಟ್ಟೆ ದರಗಳು",
    "Wallet & Payments": "ವಾಲೆಟ್ ಮತ್ತು ಪಾವತಿಗಳು",
    "From the farm gate to the mandi, in one journey": "ಹೊಲದಿಂದ ಮಾರುಕಟ್ಟೆಗೆ, ಒಂದೇ ಪ್ರಯಾಣದಲ್ಲಿ",
    "Open the Farmer app": "ರೈತ ಆ್ಯಪ್ ತೆರೆಯಿರಿ",
    "Choose your app": "ನಿಮ್ಮ ಆ್ಯಪ್ ಆಯ್ಕೆಮಾಡಿ",
  },
  pa: {
    Home: "ਘਰ",
    "Send crop": "ਫਸਲ ਭੇਜੋ",
    "Send Crop": "ਫਸਲ ਭੇਜੋ",
    "My loads": "ਮੇਰੇ ਲੋਡ",
    Market: "ਮੰਡੀ",
    Money: "ਪੈਸੇ",
    Duty: "ਡਿਊਟੀ",
    Trips: "ਫੇਰੀਆਂ",
    Earnings: "ਕਮਾਈ",
    Overview: "ਸੰਖੇਪ",
    Vehicles: "ਵਾਹਨ",
    Drivers: "ਡਰਾਈਵਰ",
    Maintenance: "ਸੰਭਾਲ",
    Orders: "ਆਰਡਰ",
    "Control tower": "ਕੰਟਰੋਲ ਟਾਵਰ",
    "Live ops": "ਲਾਈਵ ਸੰਚਾਲਨ",
    Network: "ਨੈੱਟਵਰਕ",
    "Sign in": "ਸਾਈਨ ਇਨ",
    "Sign out": "ਸਾਈਨ ਆਊਟ",
    Farmer: "ਕਿਸਾਨ",
    Driver: "ਡਰਾਈਵਰ",
    Fleet: "ਫਲੀਟ",
    Buyer: "ਖਰੀਦਦਾਰ",
    Admin: "ਐਡਮਿਨ",
    "Namaste, Kisan 🙏": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਸਾਨ ਵੀਰੋ 🙏",
    "Here is your farm and crop logistics summary today.": "ਅੱਜ ਦਾ ਖੇਤੀ ਅਤੇ ਟਰਾਂਸਪੋਰਟ ਸੰਖੇਪ।",
    "Active Shipments": "ਸਰਗਰਮ ਲੋਡ",
    "Money Credited": "ਖਾਤੇ ਵਿੱਚ ਆਏ ਪੈਸੇ",
    "Weather & Spoilage": "ਮੌਸਮ ਅਤੇ ਖਰਾਬੀ ਦਾ ਖਤਰਾ",
    "Pooling Savings": "ਪੂਲਿੰਗ ਬੱਚਤ",
    "Quick Actions": "ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ",
    "Mandi Rates & Trends": "ਮੰਡੀ ਦੇ ਭਾਅ",
    "Wallet & Payments": "ਵਾਲਿਟ ਅਤੇ ਭੁਗਤਾਨ",
    "From the farm gate to the mandi, in one journey": "ਖੇਤ ਤੋਂ ਮੰਡੀ ਤੱਕ, ਇੱਕੋ ਸਫ਼ਰ ਵਿੱਚ",
    "Open the Farmer app": "ਕਿਸਾਨ ਐਪ ਖੋਲ੍ਹੋ",
    "Choose your app": "ਆਪਣੀ ਐਪ ਚੁਣੋ",
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
