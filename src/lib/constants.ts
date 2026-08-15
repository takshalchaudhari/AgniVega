export interface CropOption {
  id: string;
  name: string;
  name_hi: string;
  name_mr: string;
  category: string;
  emoji: string;
  base_price: number;
  shelf_life_days: number;
  perishability: "low" | "medium" | "high";
  season: string;
  description: string;
}

export interface MandiOption {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  capacity_tons: number;
}

export const FALLBACK_CROPS: CropOption[] = [
  { id: "onion", name: "Onion", name_hi: "प्याज", name_mr: "कांदा", category: "vegetable", emoji: "🧅", base_price: 1650, shelf_life_days: 60, perishability: "low", season: "Rabi", description: "Nashik red onion, export grade." },
  { id: "tomato", name: "Tomato", name_hi: "टमाटर", name_mr: "टोमॅटो", category: "vegetable", emoji: "🍅", base_price: 1400, shelf_life_days: 5, perishability: "high", season: "Rabi", description: "Hybrid table tomato." },
  { id: "banana", name: "Banana", name_hi: "केला", name_mr: "केळी", category: "fruit", emoji: "🍌", base_price: 1850, shelf_life_days: 7, perishability: "high", season: "year-round", description: "Jalgaon Grand Naine banana." },
  { id: "potato", name: "Potato", name_hi: "आलू", name_mr: "बटाटा", category: "vegetable", emoji: "🥔", base_price: 1250, shelf_life_days: 45, perishability: "low", season: "Rabi", description: "Table potato suited for storage." },
  { id: "grapes", name: "Grapes", name_hi: "अंगूर", name_mr: "द्राक्षे", category: "fruit", emoji: "🍇", base_price: 5200, shelf_life_days: 10, perishability: "high", season: "Winter", description: "Thompson seedless export grapes." },
  { id: "pomegranate", name: "Pomegranate", name_hi: "अनार", name_mr: "डाळिंब", category: "fruit", emoji: "🍎", base_price: 7800, shelf_life_days: 21, perishability: "medium", season: "year-round", description: "Bhagwa premium pomegranate." },
  { id: "mango", name: "Mango", name_hi: "आम", name_mr: "आंबा", category: "fruit", emoji: "🥭", base_price: 9500, shelf_life_days: 8, perishability: "high", season: "Summer", description: "Alphonso Konkan mango." },
  { id: "sugarcane", name: "Sugarcane", name_hi: "गन्ना", name_mr: "ऊस", category: "cash", emoji: "🎋", base_price: 315, shelf_life_days: 3, perishability: "high", season: "Winter", description: "Direct sugar mill grade." },
  { id: "cotton", name: "Cotton", name_hi: "कपास", name_mr: "कापूस", category: "cash", emoji: "🌿", base_price: 7200, shelf_life_days: 180, perishability: "low", season: "Kharif", description: "Long staple ginning cotton." },
  { id: "soybean", name: "Soybean", name_hi: "सोयाबीन", name_mr: "सोयाबीन", category: "oilseed", emoji: "🫘", base_price: 4650, shelf_life_days: 150, perishability: "low", season: "Kharif", description: "Oil-grade Vidarbha soybean." },
  { id: "wheat", name: "Wheat", name_hi: "गेहूं", name_mr: "गहू", category: "grain", emoji: "🌾", base_price: 2450, shelf_life_days: 180, perishability: "low", season: "Rabi", description: "Sharbati mill grade wheat." },
  { id: "rice", name: "Rice", name_hi: "चावल", name_mr: "तांदूळ", category: "grain", emoji: "🍚", base_price: 3100, shelf_life_days: 240, perishability: "low", season: "Kharif", description: "Indrayani Maval paddy." },
  { id: "turmeric", name: "Turmeric", name_hi: "हल्दी", name_mr: "हळद", category: "spice", emoji: "🟡", base_price: 8200, shelf_life_days: 300, perishability: "low", season: "Rabi", description: "Sangli polished finger turmeric." },
  { id: "chilli", name: "Chilli", name_hi: "मिर्च", name_mr: "मिरची", category: "spice", emoji: "🌶️", base_price: 11500, shelf_life_days: 120, perishability: "medium", season: "Kharif", description: "Dry red chilli." },
  { id: "groundnut", name: "Groundnut", name_hi: "मूंगफली", name_mr: "भुईमूग", category: "oilseed", emoji: "🥜", base_price: 6100, shelf_life_days: 120, perishability: "low", season: "Kharif", description: "Bold oil-crushing groundnut." },
  { id: "cabbage", name: "Cabbage", name_hi: "पत्तागोभी", name_mr: "कोबी", category: "vegetable", emoji: "🥬", base_price: 900, shelf_life_days: 12, perishability: "medium", season: "Rabi", description: "Fresh flat head cabbage." },
  { id: "cauliflower", name: "Cauliflower", name_hi: "फूलगोभी", name_mr: "फुलकोबी", category: "vegetable", emoji: "🥦", base_price: 1150, shelf_life_days: 7, perishability: "high", season: "Rabi", description: "Snowball cauliflower." },
  { id: "okra", name: "Okra", name_hi: "भिंडी", name_mr: "भेंडी", category: "vegetable", emoji: "🫑", base_price: 2300, shelf_life_days: 4, perishability: "high", season: "Kharif", description: "Tender green ladyfinger." },
  { id: "brinjal", name: "Brinjal", name_hi: "बैंगन", name_mr: "वांगी", category: "vegetable", emoji: "🍆", base_price: 1450, shelf_life_days: 6, perishability: "high", season: "year-round", description: "Purple long brinjal." },
  { id: "green-peas", name: "Green Peas", name_hi: "मटर", name_mr: "वाटाणा", category: "vegetable", emoji: "🟢", base_price: 3400, shelf_life_days: 6, perishability: "high", season: "Rabi", description: "Fresh green shelling peas." },
  { id: "orange", name: "Orange", name_hi: "संतरा", name_mr: "संत्री", category: "fruit", emoji: "🍊", base_price: 3800, shelf_life_days: 14, perishability: "medium", season: "Winter", description: "Nagpur juicy santra." }
];

export const FALLBACK_MANDIS: MandiOption[] = [
  { id: "apmc-pune", name: "Pune APMC Market Yard", district: "Pune", lat: 18.4682, lng: 73.8578, capacity_tons: 1200 },
  { id: "apmc-nashik", name: "Nashik APMC", district: "Nashik", lat: 19.9975, lng: 73.7898, capacity_tons: 900 },
  { id: "apmc-mumbai", name: "Vashi APMC Mumbai", district: "Thane", lat: 19.0760, lng: 73.0169, capacity_tons: 2000 },
  { id: "apmc-nagpur", name: "Nagpur Kalamna Market", district: "Nagpur", lat: 21.1702, lng: 79.1400, capacity_tons: 800 },
  { id: "apmc-jalgaon", name: "Jalgaon Krishi Bazar", district: "Jalgaon", lat: 21.0077, lng: 75.5626, capacity_tons: 600 },
  { id: "apmc-solapur", name: "Solapur Market Yard", district: "Solapur", lat: 17.6599, lng: 75.9064, capacity_tons: 700 },
  { id: "apmc-aurangabad", name: "Chh. Sambhajinagar APMC", district: "Aurangabad", lat: 19.8762, lng: 75.3433, capacity_tons: 650 },
  { id: "apmc-kolhapur", name: "Kolhapur Shetkari Bazar", district: "Kolhapur", lat: 16.7050, lng: 74.2433, capacity_tons: 550 }
];
