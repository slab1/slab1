
# Restaurant Reservation App

A modern, feature-rich restaurant reservation platform with chef booking services that connects diners with restaurants and professional chefs.

## Features

### Core Restaurant Functionality
- **Restaurant Listings**: Browse restaurants with detailed information, photos, and reviews
- **Reservation System**: Book tables at your favorite restaurants
- **User Accounts**: Manage your profile, reservations, and preferences
- **Real-time Notifications**: Instant updates for booking status, reminders, and offers
- **Notification Management**: Global state management with a dedicated notification center
- **Restaurant Management**: Dashboard for restaurant owners to manage locations and bookings
- **Admin Portal**: Complete admin functionality to oversee the platform

### Chefs Warehouse
- **Professional Chef Booking**: Hire experienced chefs to cook at your home or event
- **Chef Profiles**: Browse detailed chef profiles with specialties, pricing, and availability
- **Cuisine Filtering**: Find chefs specialized in various cuisines
- **Booking Management**: Schedule chef services and manage your bookings

## Tech Stack

### Frontend
- React 18
- TypeScript
- TailwindCSS
- shadcn/ui components 
- Tanstack React Query for data fetching
- React Router for navigation
- Lucide React for icons

### Backend
- Supabase for authentication, database, and storage
- PostgreSQL database
- Row Level Security for data protection

## Getting Started

### Prerequisites
- Node.js 16.x or later
- npm 8.x or later

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd restaurant-reservation-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure

```
project-root/
├── public/               # Static assets
├── src/
│   ├── api/              # API integration layer
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin-specific components
│   │   ├── booking/      # Booking-related components
│   │   ├── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External service integrations
│   │   └── supabase/     # Supabase client and types
│   ├── lib/              # Utility functions and constants
│   ├── pages/            # Page components
│   ├── providers/        # Context providers (Auth, Notification, etc.)
│   └── App.tsx           # Main application component
├── supabase/             # Supabase configuration and functions
└── README.md
```

## Authentication

The application uses Supabase Authentication with the following user roles:
- **Anonymous**: Can browse restaurants and chef profiles
- **Authenticated Users**: Can make reservations and book chefs
- **Restaurant Managers**: Can manage their restaurant details and reservations
- **Admins**: Have full access to the platform management

## Database Schema

The main tables in the database include:
- **profiles**: User profile information
- **restaurants**: Restaurant details
- **restaurant_locations**: Restaurant physical locations
- **tables**: Available tables at each location
- **reservations**: User reservations for restaurants
- **chefs**: Professional chef profiles
- **chef_bookings**: Bookings for chef services

## Deployment

This project can be deployed to any hosting service that supports Node.js applications. For optimal performance with Supabase, we recommend Vercel, Netlify, or AWS Amplify.

### Production Readiness
Before deploying, visit the `/production-ready` page in the application to run system diagnostics and ensure all configurations (Database, Auth, Payments, Monitoring) are properly set for a live environment.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.io/) for the backend infrastructure
- [TailwindCSS](https://tailwindcss.com/) for the styling
- [Tanstack React Query](https://tanstack.com/query/latest) for data fetching
