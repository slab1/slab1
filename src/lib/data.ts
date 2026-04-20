export interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  cuisine: string;
  price: string;
  rating: number;
  location: string;
  description: string;
  openingHours: {
    days: string;
    hours: string;
  }[];
  features: string[];
}

export const restaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "Olivia's Bistro",
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    cuisine: "Mediterranean",
    price: "$$$",
    rating: 4.8,
    location: "Downtown",
    description:
      "Olivia's Bistro offers a refined Mediterranean experience with locally-sourced ingredients and an extensive wine selection.",
    openingHours: [
      { days: "Monday - Thursday", hours: "11:00 AM - 10:00 PM" },
      { days: "Friday - Saturday", hours: "11:00 AM - 11:00 PM" },
      { days: "Sunday", hours: "10:00 AM - 9:00 PM" },
    ],
    features: [
      "Outdoor Seating",
      "Wine Bar",
      "Private Dining",
      "Vegetarian Options",
    ],
  },
  {
    id: "rest-2",
    name: "Sakura Japanese",
    image_url:
      "https://images.unsplash.com/photo-1526069631228-723c945bea6b?q=80&w=1973&auto=format&fit=crop",
    cuisine: "Japanese",
    price: "$$$$",
    rating: 4.9,
    location: "Marina District",
    description:
      "Experience authentic Japanese cuisine at Sakura. Our master chefs prepare the finest sushi and sashimi using premium ingredients.",
    openingHours: [
      { days: "Monday - Thursday", hours: "12:00 PM - 10:00 PM" },
      { days: "Friday - Saturday", hours: "12:00 PM - 11:00 PM" },
      { days: "Sunday", hours: "1:00 PM - 9:00 PM" },
    ],
    features: ["Sushi Bar", "Sake Selection", "Teppanyaki", "Vegan Options"],
  },
  {
    id: "rest-3",
    name: "Rustic Table",
    image_url:
      "https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=2070&auto=format&fit=crop",
    cuisine: "Farm-to-Table",
    price: "$$",
    rating: 4.7,
    location: "Highland Park",
    description:
      "Rustic Table celebrates the bounty of local farms with seasonal, hearty dishes.",
    openingHours: [
      { days: "Tuesday - Friday", hours: "5:00 PM - 10:00 PM" },
      {
        days: "Saturday - Sunday",
        hours: "10:00 AM - 2:00 PM, 5:00 PM - 10:00 PM",
      },
      { days: "Monday", hours: "Closed" },
    ],
    features: [
      "Local Ingredients",
      "Craft Beer",
      "Weekend Brunch",
      "Kid-Friendly",
    ],
  },
  {
    id: "rest-4",
    name: "Spice Fusion",
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    cuisine: "Indian",
    price: "$$",
    rating: 4.5,
    location: "Central District",
    description:
      "Spice Fusion brings together traditional Indian recipes with modern cooking techniques.",
    openingHours: [
      { days: "Monday - Thursday", hours: "11:30 AM - 9:30 PM" },
      { days: "Friday - Saturday", hours: "11:30 AM - 10:30 PM" },
      { days: "Sunday", hours: "12:00 PM - 9:00 PM" },
    ],
    features: [
      "Tandoori Oven",
      "Curry Specialties",
      "Cocktail Menu",
      "Catering Available",
    ],
  },
  {
    id: "rest-5",
    name: "Trattoria Milano",
    image_url:
      "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=2070&auto=format&fit=crop",
    cuisine: "Italian",
    price: "$$$",
    rating: 4.6,
    location: "Little Italy",
    description:
      "Family-owned for three generations, Trattoria Milano serves authentic Northern Italian cuisine.",
    openingHours: [
      { days: "Tuesday - Thursday", hours: "5:00 PM - 9:30 PM" },
      { days: "Friday - Saturday", hours: "5:00 PM - 10:30 PM" },
      { days: "Sunday", hours: "4:00 PM - 9:00 PM" },
      { days: "Monday", hours: "Closed" },
    ],
    features: [
      "Handmade Pasta",
      "Wine Pairing",
      "Private Events",
      "Gluten-Free Options",
    ], // Removed trailing comma
  },
  {
    id: "rest-6",
    name: "Coastal Grill",
    // Fixed key name (was `image-url`)
    image_url:
      "https://images.unsplash.com/photo-1560624657-2c1167578089?q=80&w=2070&auto=format&fit=crop",
    cuisine: "Seafood",
    price: "$$$$",
    rating: 4.7,
    location: "Waterfront",
    description:
      "Coastal Grill showcases the finest seafood available, with daily deliveries from local fishermen.",
    openingHours: [
      { days: "Monday - Thursday", hours: "5:00 PM - 10:00 PM" },
      { days: "Friday - Sunday", hours: "12:00 PM - 10:30 PM" },
    ],
    features: [
      "Ocean View",
      "Raw Bar",
      "Sustainable Seafood",
      "Chef's Tasting Menu",
    ],
  },
];
