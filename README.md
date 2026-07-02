# Teacher Companion AI

An AI-powered content generation tool built for educators. Teachers can generate assignments, quizzes, lesson plans, and concept explanations — and save everything to a personal library.

---

## Features

- **Assignment Generator** — Generate custom assignments with questions, answer keys, and marking schemes
- **Quiz Builder** — Build quizzes with configurable difficulty, question types, and passing criteria
- **Lesson Plan Generator** — Create structured lesson plans with daily breakdowns and activities
- **Concept Explainer** — Explain any concept in multiple ways (simple, analogy, example-based, etc.)
- **Question Paper Export** — Export generated content as PDF or Word documents
- **Resource Discovery** — Search curated educational resources by subject, grade, and topic
- **Personal Library** — Save and organize all generated content with tags and notes
- **Teacher Profile** — Set your subjects, grade levels, and school info for personalized generation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Cache / Queue Store | Redis |
| Job Queue | BullMQ |
| AI Providers | Google Gemini (primary), Groq (fallback) |
| Auth | JWT, bcrypt |
| Validation | Joi |
| Logging | Winston |
| PDF Export | PDFKit |
| Word Export | docx (npm) |
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| API Client | Axios |
| Server State | React Query |
| Dev Environment | Docker, Docker Compose |

---

## Project Structure

```
teacher-companion-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, env config
│   │   ├── middleware/      # auth, rate limit, validation, error handler
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── controllers/     # Route handler logic
│   │   ├── services/        # Business logic (AI, export, search)
│   │   ├── jobs/            # BullMQ job processors
│   │   └── utils/           # Helpers, prompt builders, response parsers
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instances and API calls
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context, global state
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page-level components
│   │   └── utils/           # Helpers
│   ├── index.html
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Google Gemini API key
- Groq API key

### 1. Clone the repository

```bash
git clone <repo-url>
cd teacher-companion-ai
```

### 2. Start MongoDB and Redis

```bash
docker-compose up -d
```

### 3. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in your API keys and secrets in .env
npm install
npm run dev
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The API runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/teacher-companion

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

