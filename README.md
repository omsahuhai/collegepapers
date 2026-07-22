# 🎓 College Papers
### AI-Powered Last-Minute Exam Preparation Platform

> Find Previous Year Question Papers. Understand Them. Learn Smarter with AI.

---

## 📖 About

**College Papers** is an AI-powered exam intelligence platform designed for university students preparing for semester examinations.

Instead of acting as another static PDF repository, College Papers transforms previous-year question papers (PYQs) into an interactive, situational AI learning experience. Students can discover previous-year papers, read clean OCR-friendly PDFs, generate syllabus weightage heatmaps, and unlock personalized "Pass Tomorrow's Exam" strategy dashboards—all from a single platform.

---

# 🏆 Idea2Impact 2026 Hackathon Submission

### 📌 Hackathon Details
- **Event:** Idea2Impact 2026 Hackathon (NxtWave Academy)
- **Theme:** Theme 1 · 🌱 Sustainability & Social Impact
- **Domain:** Education & EdTech
- **Author:** Om Sahu (Individual Submission)

---

## ✅ Theme & Problem Statement

### Theme Alignment: Education & EdTech (Social Impact)
In higher education across regional state universities, millions of undergraduate students rely heavily on Previous Year Question Papers (PYQs) to pass their semester exams. However, access to quality educational resources remains highly inequitable.

### The Real Problem
Most graduation students begin serious exam preparation only 1–2 days before an examination. During this crucial time window, students face severe roadblocks:
- **Low-Quality Archives:** PYQs are hidden behind ad-ridden, link-shortened websites with watermarked or blurry scanned PDFs.
- **Wasted Time:** Students waste hours manually hunting for papers across fragmented sources instead of actually studying.
- **Lack of Guidance:** Even when students find papers, they don't know which topics are high-yield, what to memorize, or what can be safely skipped under severe time constraints.
- **Fragmented AI Usage:** Students have to manually copy-paste questions into generic AI tools like ChatGPT or Gemini, causing friction and context switching.

---

## 💡 Solution Description

**College Papers** bridges the gap between static PYQ archives and intelligent exam preparation. It combines a clean, ad-free digital paper vault with a custom AI intelligence engine built directly into the student workflow.

### How It Works:
1. **Instant Ad-Free Vault:** Statically generated, lightning-fast paper lookup by University ➔ College ➔ Course ➔ Semester ➔ Subject.
2. **On-the-Fly PDF Extraction:** Automatically extracts raw text from PDF question papers using `pdf-parse`.
3. **AI Syllabus & Weightage Heatmap:** Powered by **Google Gemini 3.5 Flash Lite**, the platform analyzes paper structure to generate unit-wise syllabus weightage heatmaps and identifies recurring core concepts.
4. **🚀 "Pass Tomorrow's Exam" Strategy Engine:** A situational onboarding modal asks 3 targeted questions (Time Left, Exam Target, Current Prep Level) and dynamically outputs a tailored strategy dashboard:
   - **Priority Study Order** (High-yield vs Low-yield topics)
   - **What to Memorize vs What to Skip**
   - **Expected Mark Breakdown & Target Score**
   - **Hourly/Daily Revision Timeline**

---

# 💭 Inspiration

The idea originated from my own university examinations.

One night before a major semester exam, I urgently needed previous-year question papers. I had no idea where to find them until a friend shared a link to an old student-made site. While that website got thousands of visits, the user experience was painful: intrusive pop-up ads, watermarked scans, broken redirect links, and unselectable text.

When I tried using AI to help me solve the questions, I had to manually type out questions from blurry images into ChatGPT. 

That moment made me realize: **Students don't just need another PDF download link. They need a modern, AI-native study workspace.** During the Idea2Impact Hackathon, I brought this vision to life by integrating Google Gemini directly into the question paper interface.

---

# 🚀 Vision

Our vision is to make College Papers:

> **"The Ultimate Last-Minute Exam Preparation Tool."**

Over 80% of university undergraduates do their most critical studying in the 24–48 hours preceding an exam. College Papers is purpose-built for that high-stress window, turning anxiety into structured, high-confidence preparation.

---

# ✨ Features

## 📚 Organized PYQ Repository
- Categorized hierarchically by University, College, Course, Semester, and Subject.
- Instant 1-click downloads with direct file protection.

## 📄 Clean & AI-Friendly PDFs
- No advertisements or pop-ups.
- No intrusive watermarks.
- Clean text formatting optimized for AI text extraction.

## 🤖 Core AI Exam Intelligence
- **Paper Analysis:** Automatic syllabus weightage calculation and topic frequency detection.
- **"Pass Tomorrow's Exam" Strategy Generator:** Situation-aware exam preparation plans generated in real-time via Gemini 3.5 Flash Lite.

## 🔖 Local Study Vault (Bookmarks)
- Save papers for instant offline/quick reference using browser local storage without forced sign-ins.

## 🎨 Solarized Academic UI
- Responsive, dark/light theme designed with glassmorphism and clear color contrast to reduce visual fatigue during late-night study sessions.

---

# 🧠 Why AI at the Core?

Traditional paper repositories stop after serving a PDF file. **College Papers** starts the learning journey right where the PDF ends.

By integrating Gemini 3.5 Flash Lite directly at the component level, the system processes document context and student constraints together. Instead of acting as a generic chatbot wrapper, our AI operates as a **situational exam strategist** that produces structured, actionable study guidance.

---

# 🛠 Tech Stack

- **Frontend & Framework:** Next.js 14 (App Router, Server Components, SSG)
- **UI & Styling:** CSS Modules (Solarized Light/Dark Palette, Glassmorphic Design System)
- **AI Core:** Google Gemini 3.5 Flash Lite (`@google/genai`)
- **Document Parsing:** `pdf-parse` (Node.js PDF text extraction)
- **Database & Storage:** Supabase (PostgreSQL for metadata, Supabase Storage for PDF files)
- **Deployment:** Vercel

---

# 📂 Project Structure

```
logicofcollegepapers/
├── app/                        # Next.js App Router routes & API endpoints
│   ├── api/
│   │   ├── ai/
│   │   │   ├── paper-analysis/ # Gemini endpoint for syllabus heatmap & topics
│   │   │   └── pass-strategy/  # Gemini endpoint for situational exam strategy
│   │   └── download/           # Protected PDF download handler
│   ├── institutes/             # Dynamic university/course/sem/subject funnel
│   ├── layout.js               # Root layout & ThemeProvider
│   └── page.js                 # Landing page
├── components/                 # UI Components
│   ├── funnel/                 # Multi-step selector components
│   ├── ExamIntelligenceModal.jsx # AI Analysis & Heatmap Modal
│   ├── PassTomorrowModal.jsx   # "Pass Tomorrow's Exam" Onboarding & Strategy Modal
│   ├── Header.jsx              # App Header with Theme Toggle & Vault Drawer
│   ├── PaperRow.jsx            # Individual PYQ paper row with AI triggers
│   └── SavedPapersDrawer.jsx   # Local storage bookmarked papers drawer
├── lib/
│   ├── ai/
│   │   ├── extractor.js        # PDF text extraction & Gemini prompt pipeline
│   │   └── gemini.js           # Google Gen AI client setup (gemini-3.5-flash-lite)
│   ├── supabase.js             # Supabase client initialization
│   └── navigation.js           # Dynamic breadcrumb & routing helpers
├── styles/                     # CSS Modules & Global Design System
│   ├── globals.css             # Solarized variables & base styles
│   └── components/             # Modular CSS stylesheets
└── public/                     # Static assets
```

---

# ⚙️ Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- npm / yarn
- Supabase Account & Project
- Google Gemini API Key

### 1. Clone Repository
```bash
git clone https://github.com/omsahuhai/collegepapers.git
cd collegepapers
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Supabase Database & Storage Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

# 🌍 Deployment

The application is optimized for zero-config deployment on Vercel.

1. Import the repository into Vercel.
2. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
3. Deploy!

---

# 🎯 Future Roadmap

- 💬 **Interactive AI Q&A per Question:** Click on any extracted question to get step-by-step explanations.
- 📊 **Cross-Year Trend Analysis:** Compare 5+ years of papers automatically to predict high-probability exam questions.
- 🎴 **AI Flashcard Generation:** 1-click conversion of paper analysis into active recall flashcards.
- 📱 **Progressive Web App (PWA):** Offline access to bookmarked PDFs and study notes.
- 🌐 **Multi-State Expansion:** Expanding paper archives to universities across India.

---

# ❤️ Target Audience

- Undergraduate & Diploma Students
- Last-Minute Exam Learners
- Tier-2 & Tier-3 University Students needing ad-free, high-quality PYQ access

---

# 👨‍💻 Author

**Om Sahu**
- Built for the **Idea2Impact 2026 Hackathon** (NxtWave Academy)
- GitHub: [@omsahuhai](https://github.com/omsahuhai)

---

⭐ *If you find College Papers helpful, please consider giving the repository a star on GitHub!*
