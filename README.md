# 🚗 Rydo — City-Based Ride Sharing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-blue.svg)](https://flutter.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org)

> Rydo is a production-ready, city-based ride sharing platform where users can offer rides, search for rides, and share travel costs — inspired by BlaBlaCar and Uber.

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENTS                          │
│  Next.js Web  │  Flutter Android  │  Flutter iOS        │
└───────┬───────┴─────────┬─────────┴──────────┬──────────┘
        │                 │                     │
        └─────────────────▼─────────────────────┘
                          │
                    ┌─────▼──────┐
                    │   Nginx    │
                    │  (Reverse  │
                    │   Proxy)   │
                    └─────┬──────┘
                          │
              ┌───────────▼───────────┐
              │   NestJS Backend API  │
              │   + Socket.IO Server  │
              └───┬───────────────┬───┘
                  │               │
          ┌───────▼──┐     ┌──────▼──────┐
          │PostgreSQL│     │    Redis     │
          │   DB     │     │   Cache +   │
          └──────────┘     │   Sessions  │
                           └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS |
| Backend | Node.js 18, NestJS 10, TypeScript |
| Mobile | Flutter 3.x (Android + iOS) |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Realtime | Socket.IO |
| Auth | JWT + Refresh Tokens |
| Maps | Google Maps API |
| Notifications | Firebase Cloud Messaging |
| DevOps | Docker, Nginx, GitHub Actions |
| Docs | Swagger / OpenAPI 3.0 |

---

## ✅ Prerequisites

- Docker & Docker Compose
- Node.js >= 18
- Flutter >= 3.x (for mobile)
- PostgreSQL 15 (if running locally)
- Redis 7 (if running locally)

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/rydo.git
cd rydo

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Fill in your environment variables (see section below)
nano backend/.env

# 4. Start all services
docker-compose up --build

# 5. Run database migrations
docker-compose exec backend npm run migration:run

# 6. Seed initial data
docker-compose exec backend npm run seed
```

Access points:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/api/docs
- **Admin Panel**: http://localhost:3000/admin

---

## 💻 Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migration:run
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Mobile (Flutter)

```bash
cd mobile
flutter pub get
# For Android
flutter run -d android
# For iOS
flutter run -d ios
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# App
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=rydo_user
DB_PASSWORD=rydo_password
DB_NAME=rydo_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:4000/api/docs
- **OpenAPI JSON**: http://localhost:4000/api/docs-json

---

## 📁 Project Structure

```
rydo/
├── backend/                 # NestJS API + Socket.IO
│   ├── src/
│   │   ├── auth/           # JWT, Google OAuth, OTP
│   │   ├── users/          # User profiles, vehicles
│   │   ├── rides/          # Offer/search rides
│   │   ├── bookings/       # Booking management
│   │   ├── chats/          # Realtime chat (Socket.IO)
│   │   ├── ratings/        # Reviews & ratings
│   │   ├── notifications/  # Push, SMS, Email
│   │   ├── admin/          # Admin CRM endpoints
│   │   └── config/         # App configuration
│   └── Dockerfile
├── frontend/                # Next.js 14 Web App
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # Utilities & helpers
│   └── Dockerfile
├── mobile/                  # Flutter App (Android + iOS)
│   ├── lib/
│   │   ├── screens/        # App screens
│   │   ├── widgets/        # Reusable widgets
│   │   ├── services/       # API + Socket services
│   │   ├── providers/      # Riverpod state management
│   │   └── models/         # Data models
│   └── pubspec.yaml
├── database/
│   ├── migrations/         # TypeORM migrations
│   └── seeds/              # Database seeders
├── docs/                   # Additional documentation
├── scripts/                # Utility scripts
├── docker-compose.yml      # Full stack Docker setup
└── .github/workflows/      # CI/CD pipelines
```

---

## 🚀 Deployment

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup (Production)

1. Set all env vars with production values
2. Use strong JWT secrets
3. Configure SSL certificates via Nginx
4. Set up Firebase for push notifications
5. Configure Google Maps API key with domain restrictions

---

## 📱 Mobile App Features

- Offer & Search rides
- Real-time booking management
- In-app chat with Socket.IO
- Live location tracking
- Google Maps integration
- Push notifications (FCM)
- Offline caching
- Dark mode support

---

## 🔒 Security Features

- HTTPS enforced in production
- JWT with short expiry + refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- SQL injection protection (TypeORM parameterized queries)
- XSS protection headers
- CORS configured
- Input validation with class-validator

---

## 📊 Development Phases

| Phase | Features | Status |
|-------|----------|--------|
| Phase 1 | Auth, Profiles, Offer/Search Ride, Booking | ✅ |
| Phase 2 | Chat, Notifications, Ratings | ✅ |
| Phase 3 | Admin CRM, Analytics, Payments | ✅ |
| Phase 4 | AI Recommendations, Corporate Rides | 🔜 |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for smarter city commutes.
