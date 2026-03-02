# Tattant - Japan Tourist Guide Platform

A modern, mobile-first platform for first-time visitors to Japan. Built with React and Node.js.
Live at: https://tattant.com

## Features

- Browse businesses by category (SIM cards, restaurants, bookstores, etc.)
- User authentication (email/password + Google OAuth)
- Save favorite businesses
- Multilingual support (English, Burmese)
- Mobile-responsive design
- Google Maps integration

## Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- Vue Router
- Pinia (state management)
- Tailwind CSS
- Vite
- i18n (multilingual)
- Axios

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT authentication
- bcrypt (password hashing)

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm or yarn

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

**Backend (.env in server/):**
```env
# Copy from server/.env.example
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/tattant
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
# ... see .env.example for all variables
```

**Frontend (.env in client/):**
```env
# Copy from client/.env.example
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Setup Database

**Automated (Windows):**
```bash
setup-database.bat
```

**Automated (Mac/Linux):**
```bash
chmod +x setup-database.sh
./setup-database.sh
```

**Manual Setup:**
See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

### 4. Start Development Servers

**Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

## Test Accounts

After running the seed script:

- **Admin:** admin@tattant.com / admin123
- **User:** test@example.com / test123

## Project Structure

```
tattant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── views/         # Page components
│   │   ├── router/        # Vue Router
│   │   ├── store/         # Pinia stores
│   │   ├── services/      # API services
│   │   ├── i18n/          # Translations
│   │   └── ...
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/        # Configs
│   │   ├── models/        # Database models
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Middleware
│   │   ├── migrations/    # DB migrations
│   │   ├── seeders/       # Seed data
│   │   └── server.js      # Entry point
│   └── package.json
│
└── README.md
```

## Database Schema

### Tables

- **users** - User accounts and authentication
- **categories** - Business categories (multilingual)
- **businesses** - Business listings with details
- **saved_businesses** - User's saved/favorite businesses

See migrations in `server/src/migrations/` for detailed schema.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/me` - Get current user (protected)

### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:slug` - Get category by slug

### Businesses
- `GET /api/v1/businesses` - List businesses (with filters)
- `GET /api/v1/businesses/:id` - Get business details

### Favorites
- `GET /api/v1/favorites` - Get saved businesses (protected)
- `POST /api/v1/favorites` - Save business (protected)
- `DELETE /api/v1/favorites/:id` - Remove saved business (protected)

## Available Scripts

### Backend (server/)
- `npm run dev` - Start dev server with nodemon
- `npm start` - Start production server
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:reset` - Reset database (undo, migrate, seed)

### Frontend (client/)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Development Status

**Completed:**
- ✅ Project setup (Vue 3 + Express)
- ✅ Database schema and migrations
- ✅ Tailwind CSS configuration
- ✅ Vue Router with protected routes
- ✅ Pinia stores (auth, business, category, favorite)
- ✅ i18n with 4 languages
- ✅ API service layer
- ✅ Seed data (categories and businesses)

**In Progress:**
- 🔄 Authentication controllers
- 🔄 Business and category routes
- 🔄 Vue components
- 🔄 Google OAuth integration

**Planned (MVP):**
- ⏳ All page components
- ⏳ Google Maps integration
- ⏳ Email verification
- ⏳ Password reset flow
- ⏳ Responsive design polish
- ⏳ Testing and deployment

## Contributing

This is a private project. For authorized contributors:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
