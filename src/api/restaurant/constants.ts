
export const CUISINE_TYPES = [
  "American", "Italian", "Chinese", "Japanese", "Mexican", "Indian", "Thai", "French",
  "Mediterranean", "Greek", "Korean", "Vietnamese", "Spanish", "Middle Eastern", "Other"
];

export const FEATURE_OPTIONS = [
  "Outdoor Seating", "Delivery", "Takeout", "Bar", "Live Music", "Private Dining",
  "Wheelchair Accessible", "Pet Friendly", "WiFi", "Parking", "Catering", "Brunch"
];

export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DEFAULT_OPERATING_HOURS = {
  monday: { open: "09:00", close: "21:00", closed: false },
  tuesday: { open: "09:00", close: "21:00", closed: false },
  wednesday: { open: "09:00", close: "21:00", closed: false },
  thursday: { open: "09:00", close: "21:00", closed: false },
  friday: { open: "09:00", close: "22:00", closed: false },
  saturday: { open: "09:00", close: "22:00", closed: false },
  sunday: { open: "10:00", close: "20:00", closed: false },
} as const;

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
];
