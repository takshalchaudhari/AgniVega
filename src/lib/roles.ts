export type Role = "farmer" | "driver" | "fleet" | "buyer" | "admin";

export type NavItem = { to: string; label: string; icon: string };

export const ROLES: Record<
  Role,
  {
    key: Role;
    app: string;
    tagline: string;
    emoji: string;
    home: string;
    nav: NavItem[];
  }
> = {
  farmer: {
    key: "farmer",
    app: "Smart Krishi Farmer",
    tagline: "Sell your harvest at the right mandi, at the right price.",
    emoji: "🌾",
    home: "/farmer",
    nav: [
      { to: "/farmer", label: "Home", icon: "home" },
      { to: "/farmer/new", label: "Send crop", icon: "truck" },
      { to: "/farmer/shipments", label: "My loads", icon: "package" },
      { to: "/farmer/market", label: "Market", icon: "trending" },
      { to: "/farmer/wallet", label: "Money", icon: "wallet" },
    ],
  },
  driver: {
    key: "driver",
    app: "Smart Krishi Driver",
    tagline: "Find loads, run the trip, get paid.",
    emoji: "🚛",
    home: "/driver",
    nav: [
      { to: "/driver", label: "Duty", icon: "home" },
      { to: "/driver/trips", label: "Trips", icon: "route" },
      { to: "/driver/earnings", label: "Earnings", icon: "wallet" },
    ],
  },
  fleet: {
    key: "fleet",
    app: "Smart Krishi Fleet",
    tagline: "Vehicles, drivers, utilisation and maintenance in one board.",
    emoji: "🛠️",
    home: "/fleet",
    nav: [
      { to: "/fleet", label: "Overview", icon: "home" },
      { to: "/fleet/vehicles", label: "Vehicles", icon: "truck" },
      { to: "/fleet/drivers", label: "Drivers", icon: "users" },
      { to: "/fleet/maintenance", label: "Maintenance", icon: "wrench" },
    ],
  },
  buyer: {
    key: "buyer",
    app: "Smart Krishi Buyer",
    tagline: "Buy graded produce straight from the farm gate.",
    emoji: "🛒",
    home: "/buyer",
    nav: [
      { to: "/buyer", label: "Market", icon: "store" },
      { to: "/buyer/orders", label: "Orders", icon: "package" },
    ],
  },
  admin: {
    key: "admin",
    app: "Smart Krishi Control Tower",
    tagline: "Whole-network operations, incidents and system mode.",
    emoji: "🛰️",
    home: "/admin",
    nav: [
      { to: "/admin", label: "Control tower", icon: "radar" },
      { to: "/admin/operations", label: "Live ops", icon: "route" },
      { to: "/admin/network", label: "Network", icon: "users" },
      { to: "/admin/demo", label: "Demo & system", icon: "settings" },
    ],
  },
};

export const ROLE_LIST = Object.values(ROLES);
