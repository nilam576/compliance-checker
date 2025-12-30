# RegLex: AI-Powered SEBI Compliance Verification System

**Live Demo**: [https://reglex-frontend-305534435339.us-central1.run.app](https://reglex-frontend-305534435339.us-central1.run.app)  
**Backend API**: [https://reglex-backend-305534435339.us-central1.run.app](https://reglex-backend-305534435339.us-central1.run.app)

> **Note**: For the hackathon demonstration, authentication has been bypassed (via `NEXT_PUBLIC_SKIP_AUTH=true`) to allow instant access to the dashboard.

RegLex is a production-grade, multi-agent AI platform designed to automate and streamline compliance verification for legal documents against SEBI (Securities and Exchange Board of India) regulations. Built for high-stakes financial environments, RegLex combines **Gemini 3 Pro Preview** with **ElevenLabs Voice Intelligence** to provide a comprehensive compliance command center.

## 🚀 Key Features

### 1. **Autonomous Compliance Engine**
- **Document Analysis**: Upload PDF agreements for instant extraction and analysis.
- **SEBI Guard**: Verifies clauses against a vector database of updated SEBI regulations using Gemini 3 Pro Preview.
- **Risk Scoring**: Provides a quantitative compliance score and flags high-risk violations with detailed rationales.

### 2. **AI Voice & Video Intelligence (ElevenLabs Integration)**
- **Interactive Voice Assistant**: A conversational loop (STT -> AI -> TTS) allowing users to ask compliance questions audibly and receive spoken expert advice.
- **Daily Executive Briefing**: One-click audio summary of the current compliance state across all projects.
- **AI Video Briefing Studio**: Automatically synthesizes a "Breaking News" style MP4 video report for any document, featuring a Gemini-written script and professional ElevenLabs narration.

### 3. **Real-time Analytics Dashboard**
- **Executive Overview**: Monitor total documents, average compliance rates, and system health.
- **Timeline Tracking**: Visual history of processing events and audit trails.
- **Compliance Trends**: Interactive charts showing risk distribution and processing performance.

### 4. **Multi-Agent Architecture**
- **Supervisor Agent**: Orchestrates specialized agents for extraction, verification, and risk evaluation.
- **Compliance Agent**: Dedicated to rule matching and law verification.
- **Notification Worker**: Handles real-time alerts for high-risk findings.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn.
- **AI/ML**: Google Gemini 3 Pro Preview, ElevenLabs (Scribe & TTS), FFmpeg (Video Synthesis).
- **Data/Storage**: Google Cloud Storage (GCS), BigQuery, FAISS (Vector DB).
- **Infrastructure**: Google Cloud Run, Docker.

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Cloud Project with Billing Enabled
- ElevenLabs API Key

### Deployment

#### Backend
```bash
cd Backend
gcloud run deploy reglex-backend --source . --set-env-vars="ELEVENLABS_API_KEY=your_key,GEMINI_API_KEY=your_key"
```

#### Frontend
```bash
cd Frontend
npm install
npm run build
gcloud run deploy reglex-frontend --source .
```

## 🛡️ Security & Compliance
- **Content Security Policy**: Hardened headers to prevent XSS and unauthorized data exfiltration.
- **GCP IAM**: Granular access control for service accounts.
- **Data Privacy**: All processing occurs within secure VPC/Cloud Run environments.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
