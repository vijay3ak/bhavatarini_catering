export const siteConfig = {
  name: "Bhavatarini Catering Service",
  tagline: "Good Food. Beautifully Served. Every Occasion.",
  description:
    "Homely, hygienic and reliable traditional South Indian catering for corporate offices, startups, small functions and gatherings in Coimbatore, Tamil Nadu.",
  location: process.env.NEXT_PUBLIC_BUSINESS_LOCATION || "Coimbatore, Tamil Nadu",
  serviceArea: process.env.NEXT_PUBLIC_SERVICE_AREA || "",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  // Contact details are strictly configurable and empty by default
  // No fake or fabricated phone numbers are allowed
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  },

  // Service offerings matching approved requirements
  serviceCategories: [
    {
      id: "corporate",
      title: "Corporate Catering",
      description: "Daily meals, office lunches, meetings and corporate events.",
    },
    {
      id: "startup",
      title: "Startup & Office Catering",
      description: "Breakfast, lunch and food arrangements for growing teams.",
    },
    {
      id: "functions",
      title: "Small Functions",
      description: "Housewarming, birthdays and private celebrations.",
    },
    {
      id: "gatherings",
      title: "Group Gatherings",
      description: "Food arrangements for social and community events.",
    },
  ],

  // Menu offerings matching approved requirements
  menuOfferings: [
    {
      id: "full-meals",
      title: "Full Meals",
      badge: "Our Signature Menu",
      items: [
        "Rice",
        "Sambar",
        "Rasam",
        "Kuzhambu",
        "Poriyal",
        "Appalam",
        "Curd",
        "Payasam",
        "Pickle",
      ],
    },
    {
      id: "customised-tiffin",
      title: "Tiffin (Customised)",
      description:
        "Tiffin combinations curated based on your team's needs and preferences.",
      items: [
        "Idli",
        "Dosa",
        "Pongal",
        "Upma",
        "Vada",
        "Bajji",
        "Samosa",
        "& more",
      ],
    },
  ],
};
