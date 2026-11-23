# Barterly - Skill Bartering Platform

Barterly is a modern, full-stack peer-to-peer skill bartering platform where users can exchange skills without monetary transactions. Whether you want to learn a new language, master graphic design, or get fitness coaching, Barterly connects you with others who have complementary skills.

![Barterly Badge](https://img.shields.io/badge/Status-In%20Development-yellow)
![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![React Version](https://img.shields.io/badge/react-19.2-blue)

---

## 🌐 Live Deployment

- **Frontend**: [https://barterly-web.vercel.app](https://barterly-web.vercel.app)
- **Backend API**: [https://barterly-api-f0fhamd9bzbggae7.centralindia-01.azurewebsites.net](https://barterly-api-f0fhamd9bzbggae7.centralindia-01.azurewebsites.net)
- **Health Check**: [https://barterly-api-f0fhamd9bzbggae7.centralindia-01.azurewebsites.net/health](https://barterly-api-f0fhamd9bzbggae7.centralindia-01.azurewebsites.net/health)

---

## 🎯 Platform Overview

Barterly enables skill exchange through an intuitive marketplace where users can:

- **Post Skills**: Share skills you want to offer with detailed descriptions and availability
- **Browse Skills**: Discover skills offered by other users with advanced filtering
- **Barter Requests**: Send and manage skill exchange requests with counter-offers
- **Real-time Chat**: Communicate with other barterers via Socket.io powered messaging
- **Reviews & Ratings**: Build trust through user reviews and ratings
- **Admin Dashboard**: Manage skills, users, reports, and platform moderation
- **Notifications**: Stay updated on barter requests, messages, and reviews
- **Bookmarks**: Save interesting skills for later

---

## 🏗️ Project Structure

```
barterly/
├── barterly-backend/          # Express.js REST API
│   ├── src/
│   │   ├── config/            # Database, Socket, Metrics configs
│   │   ├── controllers/       # Request handlers for all routes
│   │   ├── models/            # MongoDB Mongoose schemas
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic layer
│   │   ├── middlewares/       # Auth, validation, error handling
│   │   ├── validations/       # Zod validation schemas
│   │   ├── utils/             # JWT, email, API response utilities
│   │   └── workers/           # Background job processors
│   ├── scripts/               # Database seeding scripts
│   └── server.js              # Entry point
│
├── barterly-frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── pages/             # Page components (auth, user, admin)
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API client services
│   │   ├── assets/            # Images, icons, styles
│   │   └── App.jsx            # Main app component
│   └── vite.config.js         # Vite configuration
│
└── README.md                  # This file
```

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js v18+
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose
- **Authentication**: Google Sign-In (Google Identity Services) + JWT (Access & Refresh tokens)
- **AI**: Groq API (fair-trade equalizer moderator)
- **Real-time Communication**: Socket.io
- **File Upload**: Cloudinary
- **Monitoring**: Prometheus + Grafana
- **Security**: Helmet, CORS, express-rate-limit, NoSQL injection protection
- **Validation**: Zod

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Real-time Chat**: Socket.io-client
- **UI Forms**: Tailwind CSS Forms

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Latest version
- **MongoDB**: Atlas account or local instance
- **Google OAuth Client ID**: for sign-in (see DEPLOY.md)
- **Groq API key**: optional, powers the AI fair-trade equalizer
- **Cloudinary**: Account for image uploads (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/parvaggarwal01/barterly.git
   cd barterly
   ```

2. **Backend Setup**

   ```bash
   cd barterly-backend
   npm install
   ```

   Create `.env` file in `barterly-backend/`:

   ```env
   # Server
   NODE_ENV=development
   PORT=3000

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barterly

   # JWT
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d

   # Google sign-in (Web client ID) and admin emails
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ADMIN_EMAILS=you@gmail.com

   # Groq (AI fair-trade equalizer, optional)
   GROQ_API_KEY=your_groq_key

   # Local dev only: sign in as seeded users without Google
   DEV_LOGIN=true

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Frontend URL
   FRONTEND_URL=http://localhost:5173

   # Reverse proxy
   TRUST_PROXY=1
   ```

3. **Frontend Setup**

   ```bash
   cd ../barterly-frontend
   npm install
   ```

   Create `.env` file in `barterly-frontend/`:

   ```env
   VITE_API_URL=http://localhost:3000
   ```

### Running the Application

**Terminal 1 - Backend**

```bash
cd barterly-backend
npm run dev
```

Backend runs on: `http://localhost:3000`

**Terminal 2 - Frontend**

```bash
cd barterly-frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Seed Initial Data (Optional)

```bash
cd barterly-backend

# Seed admin user
npm run seed:admin

# Seed skill categories
npm run seed:categories
```

---

## 📋 Features

### User Features

#### Authentication & Profile

- ✅ One-click Google sign-in / sign-up (no passwords, no email codes)
- ✅ Hourly rate on your profile
- ✅ AI fair-trade equalizer: when two skills need different teaching time, Groq estimates hours per skill and the app proposes a cash top-up, extra hours, or a shorter session to even the swap
- ✅ User profile management
- ✅ Avatar upload via Cloudinary
- ✅ Bio and location information

#### Skill Management

- ✅ Post skills with title, description, category, tags
- ✅ Set skill level (Beginner/Intermediate/Advanced)
- ✅ Define delivery mode (Online/In-Person/Both)
- ✅ Availability information
- ✅ Skill verification system (admin approval)
- ✅ Activate/deactivate skills
- ✅ View all offered and wanted skills

#### Skill Browsing & Discovery

- ✅ Search skills by keywords
- ✅ Filter by category, level, delivery mode
- ✅ Sort by date, relevance, ratings
- ✅ View verified skills only option
- ✅ Pagination support
- ✅ Detailed skill view with user info

#### Bartering System

- ✅ Send barter requests with messages
- ✅ Counter-offer capability
- ✅ Accept/Reject requests
- ✅ Complete barter transactions
- ✅ View barter request history
- ✅ Real-time barter status updates

#### Communication

- ✅ Real-time chat via Socket.io
- ✅ Message history
- ✅ User presence indicators
- ✅ Typing indicators

#### Reviews & Trust

- ✅ Leave reviews after completed bartering
- ✅ Star ratings (1-5)
- ✅ User reputation system
- ✅ Review moderation

#### Additional Features

- ✅ Bookmark interesting skills
- ✅ Report inappropriate content
- ✅ Receive notifications
- ✅ View transaction history

### Admin Features

#### Dashboard

- 📊 Platform statistics and metrics
- 📈 User growth charts
- 💬 Activity monitoring

#### Content Moderation

- ✅ Approve/Reject skills
- ✅ View all skills
- ✅ Manage categories
- ✅ Handle user reports
- ✅ View reported skills/users

#### User Management

- ✅ View all users
- ✅ Search users
- ✅ View user details
- ✅ Ban/Unban users (if implemented)

#### System Monitoring

- ✅ Prometheus metrics endpoint
- ✅ Health checks

---

## 📚 API Documentation

### Core Endpoints

#### Authentication

- `POST /api/auth/google` - Sign in / sign up with a Google ID token
- `POST /api/equalizer/calculate` - AI fair-trade proposal for two skills
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Skills

- `GET /api/skills` - Get all skills (with filters)
- `GET /api/skills/:id` - Get skill details
- `POST /api/skills` - Create a new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

#### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user profile by ID
- `PUT /api/users/avatar` - Upload avatar

#### Barter Requests

- `GET /api/barter` - Get user's barter requests
- `POST /api/barter` - Create barter request
- `PUT /api/barter/:id` - Update barter request
- `POST /api/barter/:id/counter-offer` - Send counter offer

#### Chat & Messaging

- Socket.io events for real-time messaging
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:conversationId` - Get messages

#### Admin

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/skills` - All skills with approval status
- `PUT /api/admin/skills/:id/verify` - Approve/Reject skill
- `GET /api/admin/reports` - All reported content
- `GET /api/admin/users` - All users

#### Monitoring

- `GET /metrics` - Prometheus metrics endpoint

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin request security
- **Helmet**: HTTP security headers
- **NoSQL Injection Protection**: Custom sanitization middleware
- **HPP**: HTTP Parameter Pollution protection
- **Sign-in**: Google ID tokens verified server-side
- **Role-Based Access Control**: Admin and user roles

---

## 📊 Architecture

### Request Flow

```
Client Request
    ↓
Rate Limiter (IP-based)
    ↓
Auth Middleware (JWT verification)
    ↓
Validation Middleware (Zod schemas)
    ↓
Request Handler (Controller)
    ↓
Service Layer (Business Logic)
    ↓
Database Layer (MongoDB)
    ↓
Response
```

### Real-time Communication

```
Client Socket.io Connection
    ↓
Socket Server (Node.js + Socket.io)
    ↓
Message Broadcast
    ↓
Connected Clients
```

---

## 🧪 Testing

### Backend

```bash
cd barterly-backend
npm test
```

The backend uses Node.js built-in test runner for isolated tests that do not require MongoDB or Cloudinary. Current coverage includes authentication validation schemas.

### Frontend

```bash
cd barterly-frontend
npm run lint
npm run build
```

### Planned

- Unit tests for services
- Integration tests for API endpoints
- E2E tests for user flows

---

## 🚢 Deployment

> Step-by-step guide (MongoDB Atlas + Render + Vercel, plus Google/Groq setup): see [DEPLOY.md](DEPLOY.md).

### Backend Deployment (Node.js)

- Recommended: Render, Railway, Azure App Service, or Heroku
- Requires: MongoDB (Atlas). See DEPLOY.md
- Environment variables setup required

### Frontend Deployment (React)

- Recommended: Vercel, Netlify, or Azure Static Web Apps
- Build: `npm run build`
- Output: `dist/` directory

### Example: Azure Deployment

```bash
# Backend deployment configuration in server.js
# Frontend deployment through Vercel or Azure Static Web Apps
```

---

## 📝 Environment Variables

### Backend (.env)

| Variable                | Description         | Example                   |
| ----------------------- | ------------------- | ------------------------- |
| `NODE_ENV`              | Environment         | development \| production |
| `PORT`                  | Server port         | 3000                      |
| `MONGODB_URI`           | MongoDB connection  | mongodb+srv://...         |
| `JWT_ACCESS_SECRET`     | JWT secret key      | your_secret_key           |
| `JWT_ACCESS_EXPIRE`     | Token expiry        | 15m                       |
| `GOOGLE_CLIENT_ID`      | Google OAuth client | xxxx.apps.googleusercontent.com |
| `FRONTEND_URL`          | Frontend URL        | http://localhost:5173     |
| `TRUST_PROXY`           | Trusted proxy hops  | 1                         |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account  | your_cloud_name           |
| `GROQ_API_KEY`          | Groq API key        | gsk_...                   |

### Frontend (.env)

| Variable       | Description     | Example               |
| -------------- | --------------- | --------------------- |
| `VITE_API_URL` | Backend API URL | http://localhost:3000 |

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Create Pull Request on GitHub
```

---

## 📞 Support & Contribution

### Contributing

Please read the contribution docs before opening an issue or pull request:

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Frontend README](barterly-frontend/README.md)
- [Backend README](barterly-backend/README.md)
- [Open Issues](https://github.com/Parvaggarwal01/Barterly/issues)

Recommended workflow:

1. Fork the repository.
2. Pick an assigned issue or request assignment on an open issue.
3. Create a feature branch (`git checkout -b feature/feature-name`).
4. Make focused changes and run the relevant checks.
5. Push your branch and open a pull request.

### Code Style

- Use consistent naming conventions (camelCase for JavaScript)
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic

### Issues

- Check existing issues before creating new ones
- Provide detailed descriptions
- Include error messages and logs
- Mention your environment (OS, Node version, etc.)

---

## 📖 Directory Details

### Backend Directories

| Directory      | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `config/`      | Database, rate limiting, sockets, and other configuration files |
| `controllers/` | HTTP request handlers                                    |
| `models/`      | MongoDB schema definitions                               |
| `routes/`      | API route definitions                                    |
| `services/`    | Business logic and database operations                   |
| `middlewares/` | Express middleware functions                             |
| `validations/` | Zod validation schemas                                   |
| `utils/`       | Helper utilities (JWT, email, etc.)                      |
| `workers/`     | Background job processors                                |
| `scripts/`     | Database seeding and utility scripts                     |

### Frontend Directories

| Directory     | Purpose                         |
| ------------- | ------------------------------- |
| `pages/`      | Full page components            |
| `components/` | Reusable UI components          |
| `services/`   | API client services             |
| `assets/`     | Images, icons, and static files |

---

## 🔍 Key Files

### Backend

- `server.js` - Express server entry point
- `src/app.js` - Express app configuration
- `src/models/User.model.js` - User schema
- `src/models/Skill.model.js` - Skill schema
- `src/models/BarterRequest.model.js` - Barter request schema
- `src/config/db.js` - MongoDB connection
- `src/config/socket.js` - Socket.io configuration

### Frontend

- `src/App.jsx` - Main app component with routing
- `src/main.jsx` - React entry point
- `vite.config.js` - Vite build configuration

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**

- Verify `MONGODB_URI` in `.env`
- Check MongoDB Atlas whitelist includes your IP
- Ensure username/password are URL encoded

**Socket.io Connection Failed**

- Verify frontend and backend are running
- Check CORS configuration in `src/app.js`
- Ensure `FRONTEND_URL` matches frontend domain

---

## 📄 License

This project is licensed under the ISC License - see [LICENSE](LICENSE) for details.

---

## 👥 Team

**Developer**: Parva Agarwal

---

## 🎉 Acknowledgments

- Express.js community
- MongoDB documentation
- Socket.io real-time capabilities
- Tailwind CSS for beautiful UI
- React ecosystem

---

## 📞 Contact

For questions or feedback, please open an issue on GitHub or reach out directly.

**Last Updated**: May 24, 2026

---

## 🗺️ Roadmap

### Current Phase

✅ Authentication system
✅ Skill posting and browsing
✅ Barter request system
✅ Real-time chat
✅ Admin dashboard

### Planned Features

🔄 Video verification for skills
🔄 Payment system for premium features
🔄 Mobile app (React Native)
🔄 Advanced analytics
🔄 Skill completion certificates
🔄 Community forums
🔄 Recommendation engine

---

**Happy Bartering! 🤝**
