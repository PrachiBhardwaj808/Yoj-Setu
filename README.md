# Yoj-Setu (योज-सेतु)

> **Bridge to Citizens' Entitlements** — An intelligent welfare discovery, deterministic eligibility evaluation, and application assistance platform for Indian government schemes.

---

## 📌 Project Overview

**Yoj-Setu** connects citizens to relevant central and state government schemes (such as PM-KISAN, Ayushman Bharat PM-JAY, PM Awas Yojana, PM Surya Ghar, Post-Matric Scholarships, and MGNREGA). By capturing and normalizing citizen demographic, geographic, and socioeconomic attributes, Yoj-Setu runs deterministic rule evaluation against official scheme guidelines and document readiness checklists to empower citizens and eliminate informational barriers.

### Core Idea

```text
Create Profile
      ↓
Find Relevant Schemes
      ↓
Deterministic Eligibility Evaluation
      ↓
Document Readiness & DigiLocker Checklist
      ↓
Guided Application Assistance
      ↓
Track Application Milestones
```

---

## 🏛 System Architecture

```text
                         ┌──────────────────┐
                         │     CITIZEN      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   React + Vite   │
                         │    Frontend      │
                         │ (Tailwind v4 UI) │
                         └────────┬─────────┘
                                  │
                              REST API
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  FastAPI Backend │
                         │ (Python 3.12/14) │
                         └───────┬───┬──────┘
                                 │   │
                    ┌────────────┘   └─────────────┐
                    ▼                              ▼
             ┌─────────────┐                ┌─────────────┐
             │ MySQL / DB  │                │ Rule Engine │
             │  (SQLite    │                │ Deterministic│
             │  Fallback)  │                │ Evaluation  │
             └─────────────┘                └─────────────┘
                                                    │
                                                    ▼
                                            ┌─────────────┐
                                            │  DigiLocker │
                                            │ Vault & Docs│
                                            └─────────────┘
```

---

## 🛠 Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.12+ / 3.14 compatible)
- **Database:** Dual MySQL (`mysql-connector-python`) with automatic embedded SQLite (`yojsetu.db`) fallback for local development
- **Authentication & Security:** JWT (`PyJWT==2.14.0`), Password Hashing (`bcrypt==5.0.0`), CORS middleware
- **Data Validation & Schemas:** Pydantic v2
- **Recommendation Engine:** Rule-based deterministic evaluation engine with fuzzy profile normalization

### Frontend
- **Framework:** React 19 + Vite 8
- **Routing:** React Router v7 (`createBrowserRouter`)
- **Styling:** Tailwind CSS v4 + `@tailwindcss/vite`
- **Linting & Code Quality:** Oxlint
- **Icons & UI:** Custom accessible SVG icon sets and Lucide-compatible design patterns

---

## 📂 Repository Structure

```text
Yoj-Setu/
├── backend/
│   ├── app/
│   │   ├── config.py                 # Application settings & environment variables
│   │   ├── db.py                     # Safe parameterized DB connection (MySQL + SQLite fallback)
│   │   ├── dao/
│   │   │   └── scheme_dao.py         # Data access object for schemes, rules, and documents
│   │   ├── routers/
│   │   │   └── schemes.py            # API routes for scheme discovery & recommendations
│   │   ├── schemas/
│   │   │   └── scheme_schemas.py     # Pydantic v2 schemas with standardized dual attribute compatibility
│   │   └── services/
│   │       ├── eligibility_engine.py # Rule evaluation engine (operators, types, conditions)
│   │       ├── profile_normalizer.py # Profile normalization (income sanitization, location, categories)
│   │       ├── recommendation_service.py # Scheme ranking and document readiness evaluation
│   │       ├── scheme_ingestion_service.py # Seed data loader for official government schemes
│   │       └── scheme_provider.py    # Scheme data catalog provider
│   ├── main.py                       # FastAPI entrypoint, OTP & Auth routes, table DDLs
│   ├── requirements.txt              # Backend dependencies
│   └── yojsetu.db                    # Embedded SQLite development database
├── frontend/
│   ├── src/
│   │   ├── components/               # Reusable UI components (SchemeCard, SchemeList, etc.)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state, token storage, OTP integration
│   │   │   └── ProfileContext.jsx    # Citizen profile, onboarding steps, document state
│   │   ├── data/
│   │   │   ├── mockNotifications.js  # Notifications and alerts seed data
│   │   │   └── mockSchemes.js        # Standardized schemes catalog
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx         # Responsive application shell (collapsible sidebar + mobile nav)
│   │   ├── pages/
│   │   │   ├── Applications.jsx      # Application status tracker & milestone pipeline
│   │   │   ├── Assistant.jsx         # AI Sathi conversational scheme advisor
│   │   │   ├── Dashboard.jsx         # Citizen dashboard with matched schemes & category filter
│   │   │   ├── Documents.jsx         # Citizen document vault & readiness checklist
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Login.jsx             # Citizen login
│   │   │   ├── NotFoundPage.jsx      # 404 handler
│   │   │   ├── Notifications.jsx     # Notifications center
│   │   │   ├── Onboarding.jsx        # Multi-step profile builder & eligibility intake
│   │   │   ├── Profile.jsx           # Citizen profile view and editing
│   │   │   ├── Register.jsx          # Citizen registration with OTP verification
│   │   │   └── schemes/
│   │   │       ├── SchemeDetailPage.jsx # Comprehensive scheme details & criteria breakdown
│   │   │       └── SchemesListPage.jsx  # Searchable & filterable schemes catalog
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx    # Route guard enforcing authentication & onboarding
│   │   ├── services/
│   │   │   ├── api.js                # Axios client with bearer token interceptor
│   │   │   ├── authService.js        # Auth and OTP API calls
│   │   │   ├── chatService.js        # Conversational query matching service
│   │   │   ├── eligibilityService.js # Eligibility recommendation API calls
│   │   │   └── schemeService.js      # Scheme listing and details API calls
│   │   ├── App.jsx                   # Central router & provider hierarchy
│   │   └── main.jsx                  # React application entrypoint
│   ├── package.json                  # Frontend dependencies and npm scripts
│   └── vite.config.js                # Vite build and plugin configuration
├── docs/                             # Database ER diagrams and schema documentation
└── README.md                         # Project documentation
```

---

## ⚙️ Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **Python:** v3.12 or higher
- **Git:** v2.30 or higher
- **MySQL (Optional):** MySQL Server 8.0+ (if not running MySQL, the backend automatically uses embedded SQLite `yojsetu.db`)

---

## 🚀 Backend Setup and Execution

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment:**
   - **Windows:**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend development server:**
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API will be available at `http://127.0.0.1:8000`.
   Interactive Swagger documentation is accessible at `http://127.0.0.1:8000/docs`.

---

## 💻 Frontend Setup and Execution

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:5173`.

4. **Production Build & Linting:**
   ```bash
   npm run lint   # Run Oxlint
   npm run build  # Create production build in dist/
   ```

---

## 🔐 Environment Variable Configuration

### Backend (`backend/.env` optional)
Create `backend/.env` if you wish to override default settings:

```env
# Server
PORT=8000
SECRET_KEY=your-jwt-secret-key-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration (MySQL)
# If DB_HOST is unreachable or omitted, the backend automatically falls back to SQLite (backend/yojsetu.db)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=yojsetu_db
DB_PORT=3306

# Twilio SMS (Optional - OTP defaults to mock mode in console if unset)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Frontend (`frontend/.env` optional)
```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🗄 Database Setup

Yoj-Setu supports zero-configuration development:
- **Automatic SQLite Mode:** If MySQL is not running or credentials are not configured, `app.db` automatically opens or initializes an embedded SQLite database at `backend/yojsetu.db`. All DDL statements (`users`, `otp_verifications`, `schemes`, `scheme_rules`, `scheme_documents`) run automatically upon application startup.
- **MySQL Mode:** Create the database before launching:
  ```sql
  CREATE DATABASE IF NOT EXISTS yojsetu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
  Tables will be created automatically on startup or can be inspected in `docs/db/schema.sql`.

---

## 🌐 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Health and API status | No |
| `POST` | `/send-otp` | Request a 6-digit phone verification OTP | No |
| `POST` | `/verify-otp` | Verify phone OTP | No |
| `POST` | `/register` | Register new user account | No |
| `POST` | `/login` | Authenticate user and receive JWT bearer token | No |
| `GET` | `/users/me` | Fetch authenticated user details | Yes (Bearer JWT) |
| `GET` | `/schemes` | Fetch schemes catalog with category/search filters | No |
| `GET` | `/schemes/{id}` | Fetch scheme details, criteria rules & document requirements | No |
| `POST` | `/schemes/recommendations` | Deterministic AI evaluation of schemes against citizen profile | No / Optional |
| `POST` | `/schemes/ingest` | Admin endpoint to ingest/refresh seed schemes into DB | No |

---

## 🧪 Testing Instructions

### Backend Testing
- **Parameter Handling Test:**
  ```powershell
  backend\.venv\Scripts\python.exe backend\scratch\test_db_params.py
  ```
- **Scheme Ingestion & Recommendation Engine Test:**
  ```powershell
  backend\.venv\Scripts\python.exe backend\scratch\test_milestone1.py
  ```

### Frontend Testing
- **Linter Check:**
  ```bash
  cd frontend
  npm run lint
  ```
- **Production Build Validation:**
  ```bash
  cd frontend
  npm run build
  ```

---

## ❓ Troubleshooting

1. **`ModuleNotFoundError: No module named 'mysql'`:**
   Ensure you activate the virtual environment (`backend/.venv`) or invoke Python directly from `.venv/Scripts/python.exe`.
2. **Database Connection Issues:**
   The backend gracefully falls back to SQLite (`backend/yojsetu.db`) if MySQL credentials are empty or MySQL server is not running. Check terminal startup logs for `[DB] Using SQLite fallback database`.
3. **CORS Errors:**
   By default, `backend/main.py` allows origins `http://localhost:5173`, `http://127.0.0.1:5173`, and `http://localhost:3000`. Ensure your frontend is running on one of these ports.

---

## 👥 Team

### Team Hackops — Chitkara University
YOJSETU was developed to simplify access to government welfare schemes through personalized discovery, deterministic eligibility evaluation, DigiLocker-assisted documentation, and centralized application tracking.
