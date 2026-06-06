
raw
Readme · MD
<p align="center">
  <h1 align="center">📄 Resume Craft Studio 2.0</h1>
  <p align="center">
    AI-powered resume builder · Job application tracker · Career management platform
  </p>
  <p align="center">
    <a href="https://resume-craft-studio-8ajr.vercel.app/">Live Demo</a> ·
    <a href="#getting-started">Getting Started</a> 
  </p>
</p>
---
 
## Overview
 
Resume Craft Studio 2.0 is a full-stack career management web application that combines AI-powered resume building with end-to-end job application tracking. Built for professionals who want intelligent tooling — not just a form with a PDF export.
 
**Core capabilities:**
- Drag-and-drop resume builder with real-time preview
- Gemini AI-powered content suggestions and ATS scoring
- Full job application pipeline (apply → interview → offer)
- AI-generated cover letters linked to resume + job posting
- Interview scheduling, notes, and follow-up tracking
- Career analytics dashboard with actionable insights
- PDF import and export
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Firebase Firestore (real-time listeners) |
| **Auth** | Firebase Authentication |
| **AI** | Google Gemini AI |
| **Media Storage** | Cloudinary |
| **PDF Export** | @react-pdf/renderer |
| **PDF Import** | pdfjs-dist |
| **Drag & Drop** | @dnd-kit |
| **Analytics** | Recharts |
| **Validation** | Zod |
| **State Management** | React Context API |
| **Deployment** | Vercel |
 
---
 
## Features
 
### Resume Builder
- Section-based editor (Experience, Education, Skills, Projects, Certifications, etc.)
- Drag-and-drop section reordering via @dnd-kit
- Real-time live preview
- One-click PDF export
- PDF resume import with parsed content
### AI Integration (Gemini)
- Bullet point enhancement and rewrites
- ATS keyword analysis against job descriptions
- Job match scoring
- Cover letter generation
- Content gap detection
### Job Application Tracker
- Full pipeline: Saved → Applied → Phone Screen → Interview → Offer → Rejected
- Application history with timestamps
- Interview round tracking with notes
- Follow-up reminders
### Analytics Dashboard
- Application funnel metrics
- Response rate trends
- Interview conversion rates
- Weekly activity logs
---
 
## Project Structure
 
```
src/
├── components/
│   ├── resume/          # Builder, section editors, preview
│   ├── tracker/         # Application pipeline UI
│   ├── analytics/       # Dashboard charts
│   ├── cover-letter/    # Cover letter editor
│   └── ui/              # shadcn/ui base components
├── context/             # React Context providers
├── hooks/               # Custom hooks
├── lib/
│   ├── utils.ts         # Shared helpers (debounce, file validation)
│   └── validators.ts    # Zod schemas for all forms
├── pages/               # Route-level components
├── services/
│   ├── firebase.ts      # Firestore abstraction layer
│   ├── gemini.ts        # AI service layer
│   └── cloudinary.ts    # Media upload service
└── types/               # TypeScript domain types
```
 
### Domain Types
 
`UserProfile` · `Resume` · `ResumeSections` · `Certificate` · `CoverLetter` · `Application` · `Interview` · `ATSAnalysis` · `JobMatch` · `ActivityLog`
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js ≥ 18
- Firebase project (Firestore + Auth enabled)
- Cloudinary account
- Google Gemini API key
### Installation
 
```bash
# Clone
git clone https://github.com/your-username/resume-craft-studio.git
cd resume-craft-studio
 
# Install dependencies
npm install
 
# Configure environment
cp .env.example .env.local
```
 
### Environment Variables
 
```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
 
# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
 
# Gemini AI
VITE_GEMINI_API_KEY=
```
 
### Run
 
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```
 
 
---
 
## Architecture Notes
 
- **Service layer pattern** — all Firebase, Gemini, and Cloudinary calls abstracted into dedicated service modules; components never call external APIs directly
- **Schema-first validation** — Zod schemas defined before components; forms validate against shared schemas
- **Real-time by default** — Firestore listeners power live UI state across resume editing and job tracking
- **Phase-gated implementation** — full architecture approved before any implementation phase begins
---
 
## Deployment
 
Deployed on Vercel. Push to `main` triggers automatic deployment.
 
```bash
vercel --prod
```
 
Live: [https://resume-craft-studio-8ajr.vercel.app](https://resume-craft-studio-8ajr.vercel.app)
 
---
