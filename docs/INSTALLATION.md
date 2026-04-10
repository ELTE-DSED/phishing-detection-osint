# PhishGuard Local Installation Setup

This guide walks you through setting up both the **FastAPI Backend** and the **Next.js Frontend** on your local machine.

## Prerequisites
- Node.js (v20+ recommended)
- Python (v3.10.12+ recommended)
- Git

---

## 1. Clone the Repository
```bash
git clone https://github.com/ishaq2321/phishing-detection-osint.git
cd phishing-detection-osint
```

## 2. Backend Setup (FastAPI & XGBoost)
The backend is responsible for running the machine learning models and the OSINT pipeline.

### Step 2.1: Virtual Environment
Navigate to the `backend/` directory (or run from the root using `.venv`):
```bash
python3 -m venv .venv
source .venv/bin/activate
# On Windows: .venv\Scripts\activate
```

### Step 2.2: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 2.3: Download the spaCy Model
The NLP engine requires the English core model:
```bash
python -m spacy download en_core_web_sm
```

### Step 2.4: Environment Variables
Create a `.env` file in the root or `backend/` directory:
```env
ENVIRONMENT=development
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:3000
VIRUSTOTAL_API_KEY=your_virustotal_key_here  # Optional
ABUSEIPDB_API_KEY=your_abuseipdb_key_here    # Optional
```

### Step 2.5: Run the Server
```bash
uvicorn backend.main:app --reload --port 8000
```
The API is now running at: `http://localhost:8000/docs`

---

## 3. Frontend Setup (Next.js & React)
The frontend provides the user interface for inputting URLs and viewing Explainable AI results.

### Step 3.1: Navigate to the Frontend
```bash
cd frontend
```

### Step 3.2: Install Dependencies
```bash
npm install
```

### Step 3.3: Environment Variables
Create a `.env.local` file inside the `frontend/` directory. Point it to your local FastAPI backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3.4: Run the Development Server
```bash
npm run dev
```
The application is now running at: `http://localhost:3000`

## 4. Running the Complete System
With both `uvicorn` running the backend and `npm run dev` running the frontend, open your browser and navigate to `http://localhost:3000`. You can now analyze URLs and texts locally!