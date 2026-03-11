# 🎯 AI Interview Platform

A full-stack AI-powered interview preparation platform with Resume Analysis, JD Matching, and 3 interview modes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + Zustand |
| Backend | Node.js + Express |
| AI | GROK AI + Whisper API |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| File Upload | Multer + pdf-parse |
| Speech | OpenAI Whisper / Web Speech API |

## Features

- 📄 **Resume Analyser** — Upload resume + paste JD → AI scores match %
- 🎯 **JD Match Score** — Skill breakdown, matched/missing skills, ATS tips
- 🎥 **Video Call Mode** — Camera + mic simulation with delivery scoring
- 🎙️ **Audio Mode** — Phone screen style with waveform + Whisper transcription
- 📝 **Written Test** — Scenario & technical questions with detailed scoring
- 🏆 **Final Report** — Grade, hire recommendation, action plan
- 📊 **History Dashboard** — Track all sessions, progress over time
- 👤 **Auth** — Register/Login with JWT

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key

### 1. Clone & Install
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, OPENAI_API_KEY

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
```

### 2. Run Dev Servers
```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

### 3. Open
http://localhost:3000

## Project Structure

```
interview-platform/
├── backend/               # Node.js + Express API
│   └── src/
│       ├── config/        # DB, env config
│       ├── models/        # Mongoose schemas
│       ├── controllers/   # Route handlers
│       ├── routes/        # Express routers
│       ├── services/      # OpenAI, business logic
│       ├── middleware/     # Auth, error, upload
│       └── utils/         # Helpers
└── frontend/              # Next.js 14
    └── src/
        ├── app/           # App Router pages
        ├── components/    # React components
        ├── hooks/         # Custom hooks
        ├── lib/           # API client, utils
        ├── store/         # Zustand state
        └── types/         # TypeScript types
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| POST | /api/resume/upload | Upload + parse resume |
| POST | /api/resume/analyze | Analyze resume vs JD |
| POST | /api/interview/start | Generate questions |
| POST | /api/interview/:id/answer | Submit + evaluate answer |
| POST | /api/interview/:id/complete | Generate final report |
| GET | /api/interview/:id | Get session |
| POST | /api/speech/transcribe | Whisper transcription |
| GET | /api/history | Past sessions |
| GET | /api/history/stats | User statistics |
