# NeoConnect — Staff Feedback & Complaint Management Platform

> Full Stack Challenge · Individual · Node.js · Next.js · MongoDB

NeoConnect is a production-grade staff feedback and complaint management platform. Employees can raise issues, vote on polls, and see how management is responding — with full accountability at every step.

---
##Links
**Live Application:** [neoconnect-puce.vercel.app](https://neoconnect-puce.vercel.app)  
**API Base URL:** [neoconnect-api-ujwa.onrender.com](https://neoconnect-api-ujwa.onrender.com)

## Features

- Every complaint gets a unique tracking ID (`NEO-YYYY-001`) and is assigned to a Case Manager
- Automatic escalation after 7 working days of no response via cron job
- Public Hub showing how staff feedback leads to real company changes
- Department hotspot detection — flags recurring issues early
- AI-powered Smart Tagger, Case Summarizer, and Trend Analyst (Groq API)
- Anonymous submission option — identity stripped server-side before storage
- File attachments via Cloudinary
- JWT authentication with access + refresh token rotation

---

## Tech Stack

**Frontend:** Next.js, React, Tailwind CSS, shadcn/ui, Recharts

**Backend:** Node.js, Express.js, MongoDB, Mongoose, node-cron

**Auth:** JWT (httpOnly cookies, refresh token rotation)

**AI:** Groq API (llama-3.1-8b-instant)

**Storage:** Cloudinary

**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free M0 cluster)
- Cloudinary account (free tier)
- Groq API key (free at console.groq.com)

---

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/neoconnect.git
cd neoconnect
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file based on `.env.example` and fill in your values:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/neoconnect
JWT_SECRET=your_64_character_random_string
JWT_REFRESH_SECRET=your_second_64_character_random_string
PORT=5000
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## User Roles

| Role | Access |
|---|---|
| Staff | Submit cases, vote in polls, view public hub |
| Secretariat | View all cases, assign managers, create polls, add hub content |
| Case Manager | View assigned cases, update status, add notes, AI summarize |
| Admin | Full analytics access, all features |

---

## Case Lifecycle
```
New → Assigned → In Progress → Pending → Resolved
                      │
                      └── (7 working days) ──→ Escalated
```

---

## AI Features

| Feature | Where | How |
|---|---|---|
| Smart Category Tagger | Submit form | Suggests category + severity as you type (debounced 800ms) |
| Case Summarizer | Case Manager dashboard | 3-bullet AI summary per case, cached in MongoDB |
| Trend Analyst | Analytics dashboard | 3-sentence executive briefing from live statistics |

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

### Cases
```
POST   /api/cases/submit
GET    /api/cases
GET    /api/cases/my
GET    /api/cases/assigned
GET    /api/cases/:id
PUT    /api/cases/assign
PUT    /api/cases/:id/status
POST   /api/cases/:id/note
```

### Polls
```
GET    /api/polls
POST   /api/polls
POST   /api/polls/:id/vote
```

### Analytics
```
GET    /api/analytics/by-department
GET    /api/analytics/by-status
GET    /api/analytics/by-category
GET    /api/analytics/hotspots
```

### AI
```
GET    /api/ai/summarize/:id
POST   /api/ai/insight
POST   /api/ai/suggest
```

### Hub
```
GET    /api/hub
POST   /api/hub
DELETE /api/hub/:id
```

---

## Project Structure
```
neoconnect/
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── caseController.js
│   │   ├── pollController.js
│   │   ├── analyticsController.js
│   │   ├── hubController.js
│   │   └── aiController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Case.js
│   │   ├── Poll.js
│   │   ├── Vote.js
│   │   └── HubContent.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── caseRoutes.js
│   │   ├── pollRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── hubRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   ├── caseService.js
│   │   ├── pollService.js
│   │   └── aiService.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   ├── generateTrackingId.js
│   │   └── escalationJob.js
│   ├── .env.example
│   ├── .gitignore
│   └── server.js
│
├── client/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── submit/
│   │   ├── polls/
│   │   ├── hub/
│   │   └── dashboard/
│   │       ├── staff/
│   │       ├── secretariat/
│   │       ├── case-manager/
│   │       ├── admin/
│   │       └── analytics/
│   ├── components/
│   │   └── ui/
│   ├── context/
│   │   └── AuthContext.js
│   ├── lib/
│   │   └── api.js
│   └── .env.local
│
└── README.md
```

---

## Deployment

### Backend — Render
1. Go to render.com → New Web Service
2. Connect GitHub repo → set root directory to `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables
6. Deploy

### Frontend — Vercel
1. Go to vercel.com → Import repository
2. Set root directory to `client`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api`
4. Deploy

### Database — MongoDB Atlas
- Free M0 cluster
- Whitelist `0.0.0.0/0` for Render access

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `MONGO_URI` | server | MongoDB Atlas connection string |
| `JWT_SECRET` | server | Access token secret (64 chars) |
| `JWT_REFRESH_SECRET` | server | Refresh token secret (64 chars) |
| `PORT` | server | Server port (default 5000) |
| `CLIENT_URL` | server | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | server | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | server | Cloudinary API secret |
| `GROQ_API_KEY` | server | Groq API key |
| `NEXT_PUBLIC_API_URL` | client | Backend API base URL |
