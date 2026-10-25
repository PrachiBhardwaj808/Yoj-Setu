# Architecture Documentation for Yojsetu

## 1. Project Overview and Purpose

Yojsetu is an open-source web application created to bridge the information gap between Indian citizens and government welfare schemes. In India, numerous social assistance and development programs exist across central and state departments, but citizens often struggle to discover which schemes apply to them due to complex eligibility rules, fragmented websites, and language barriers.

Yojsetu addresses these challenges by providing:
- A centralized catalog of government schemes across categories such as agriculture, education, healthcare, and social welfare.
- A deterministic eligibility evaluation engine that compares a citizen's profile (age, gender, caste, income, state, employment status) against official program requirements.
- Step-by-step document checklists and application guidelines.
- Multilingual accessibility supporting major Indian languages through translation services.
- An interactive guidance assistant for conversational questions regarding schemes.

---

## 2. Technologies and Frameworks Used

### Frontend Stack
- React 19: A modern JavaScript library used for building interactive user interfaces based on reusable components.
- Vite 8: A fast frontend build tool and development server that compiles and bundles the client code.
- React Router v7 (`react-router-dom`): A client-side routing library that manages page navigation without reloading the browser.
- Tailwind CSS v4: A utility-first Cascading Style Sheets (CSS) framework used for modern, responsive styling.
- Axios: A Promise-based Hypertext Transfer Protocol (HTTP) client used in the browser to send API requests to the backend server.
- Lucide React: An icon library providing consistent icons for user interface elements.

### Backend Stack
- Python 3: The primary programming language used for server-side logic.
- FastAPI: A high-performance web framework for Python used to define RESTful Application Programming Interface (API) endpoints, manage request validation, and handle responses.
- Uvicorn: An Asynchronous Server Gateway Interface (ASGI) web server used to run the FastAPI application.
- Pydantic: A data validation and settings management library used by FastAPI to validate incoming JSON payloads and enforce strict schema types.
- PyJWT: A Python library used to sign and decode JSON Web Tokens (JWT) for user authentication.
- Passlib and Bcrypt: Security libraries used for one-way cryptographic hashing of user passwords.

### Database and Storage
- Raw SQL Architecture: The system uses direct SQL queries rather than an Object-Relational Mapper (ORM), keeping queries explicit and lightweight.
- Dual-Engine Connection Strategy (`app/db.py`):
  - Primary: MySQL database via the `mysql-connector-python` driver for production setups.
  - Graceful Fallback: Local SQLite file database (`yojsetu.db`) via Python's built-in `sqlite3` library. If MySQL connection details are not configured or the server is unavailable, the backend automatically operates on SQLite with a compatibility wrapper.

---

## 3. High-Level System Architecture

The following diagram illustrates how the frontend, backend, database, and external interfaces interact:

```
[ User Browser ]
       |
       |  HTTP / JSON (Axios)
       v
[ Frontend: React + Vite ] (Port 5173)
       |
       |  REST API Requests (Bearer Token)
       v
[ Backend: FastAPI + Uvicorn ] (Port 8000)
       |
       +---> [ Authentication & OTP Services ]
       |
       +---> [ Eligibility Engine & Recommendation Service ]
       |
       +---> [ Raw SQL Layer / Database Abstraction (app/db.py) ]
                   |
                   +---> MySQL Server (Default if configured)
                   |
                   +---> SQLite File: yojsetu.db (Automatic Fallback)
```

---

## 4. Frontend Structure and Organization

The frontend codebase is located under `frontend/` and follows a modular single-page application pattern:

- `frontend/src/main.jsx`: The application entry point that mounts the React root into `index.html`.
- `frontend/src/App.jsx`: Configures global context providers (Theme, Language, Auth, Profile) and sets up routing using `createBrowserRouter`.
- `frontend/src/routes/`: Contains route guard components, such as `ProtectedRoute.jsx`, which restrict access to authenticated users.
- `frontend/src/layouts/`:
  - `AppLayout.jsx`: The main layout wrapper providing the navigation bar, sidebar navigation, language selector, and content container.
- `frontend/src/pages/`: Contains the primary full-page views:
  - `Home.jsx`: Public landing page with platform introduction and scheme categories.
  - `Login.jsx` and `Register.jsx`: Authentication pages supporting password and mobile OTP login.
  - `Onboarding.jsx`: Multi-step profile setup wizard collecting demographic data.
  - `Dashboard.jsx`: Citizen portal showing profile completion, matched schemes, and saved items.
  - `schemes/SchemesListPage.jsx`: Catalog page with search, filters, and scheme listings.
  - `schemes/SchemeDetailPage.jsx`: In-depth scheme view detailing benefits, rules, and documents.
  - `Assistant.jsx`: AI conversational helper for scheme guidance.
  - `Profile.jsx`: View and edit user details and eligibility criteria.
  - `Documents.jsx` and `Applications.jsx`: Document locker and application tracker views.
- `frontend/src/components/`: Reusable interface components such as `Navbar.jsx`, `SchemeCard.jsx`, `ProfileProgress.jsx`, and modal dialogs.
- `frontend/src/context/`: React Context providers managing shared application state:
  - `AuthContext.jsx`: User authentication state, token storage, and session lifecycle.
  - `LanguageContext.jsx`: Selected language code, translation functions, and regional language switching.
  - `ProfileContext.jsx`: Citizen profile data used for eligibility calculations.
  - `ThemeContext.jsx`: Dark and light theme settings.
- `frontend/src/services/`: Client-side HTTP service modules:
  - `api.js`: Centralized Axios instance with base URL configuration and JWT interceptors.
  - `authService.js`: Authentication calls (login, register, OTP verification).
  - `schemeService.js`: Scheme discovery and recommendation API calls.
  - `chatService.js`: Assistant query processing and mock advice logic.
  - `bhashiniService.js`: Regional language translation bridge.
- `frontend/src/translations/`: Localized language dictionaries (`en.js`, `hi.js`, `ta.js`, etc.) providing static translations for user interface text.

---

## 5. Backend Structure and Organization

The backend codebase is located under `backend/` and follows a layered architecture separating routing, business logic, data access, and schemas:

- `backend/main.py`: The FastAPI application entry point. It registers CORS middleware, includes API routers, and contains the application lifespan handler that executes table Data Definition Language (DDL) statements upon startup.
- `backend/app/config.py`: Centralized environment configuration loading database credentials, JWT secrets, and service parameters.
- `backend/app/db.py`: Database connection factory. It attempts to connect to MySQL and automatically falls back to SQLite. It provides `SQLiteDictCursor` and `SQLiteConnectionWrapper` to ensure query compatibility across both database types.
- `backend/app/routers/`: API route controllers handling incoming HTTP requests:
  - `ping.py`: Health check endpoint (`GET /api/ping`).
  - `auth.py`: User registration, password login, OTP login, password reset, and authenticated user info (`GET /auth/me`).
  - `schemes.py`: Scheme retrieval, single scheme eligibility checks, and multi-scheme recommendations.
- `backend/app/services/`: Core business logic modules:
  - `auth_service.py`: Password hashing, JWT token generation, and token verification.
  - `otp_service.py`: Six-digit numeric OTP generation, SHA-256 OTP hashing, expiry validation, and rate limiting.
  - `sms_service.py`: SMS dispatch handler (mock implementation logging OTP messages for development).
  - `eligibility_engine.py`: Deterministic rule evaluator comparing citizen profile values against scheme criteria with comparison operators.
  - `recommendation_service.py`: Filters schemes, evaluates eligibility, ranks results, and generates grounded justification explanations.
  - `scheme_ingestion_service.py`: Initializes the schemes database from seed catalogs upon first startup.
  - `scheme_provider.py`: Repository of predefined government scheme records and criteria rules.
  - `profile_normalizer.py`: Normalizes diverse user profile inputs (caste names, gender strings, income ranges) into standardized comparison keys.
- `backend/app/dao/`: Data Access Objects containing direct parameterized SQL queries:
  - `user_dao.py`: CRUD operations for user accounts in the `users` table.
  - `otp_dao.py`: Database tracking of OTP tokens and verification status in `otp_verifications`.
  - `scheme_dao.py`: Retrieval and storage for `schemes`, `scheme_rules`, and `scheme_documents`.
- `backend/app/schemas/`: Pydantic data schemas for request validation and response serialization:
  - `auth_schemas.py`: Schemas for registration, login, and user tokens.
  - `otp_schemas.py`: Schemas for phone validation and OTP verification requests.
  - `scheme_schemas.py`: Schemas for scheme profiles, rules, documents, and recommendation responses.

---

## 6. Database and External Integrations

### Database Tables
The application automatically creates five core relational tables if they do not already exist:
1. `users`: Stores registered citizen accounts, full names, phone numbers, email addresses, password hashes, and verification flags.
2. `otp_verifications`: Tracks phone numbers, hashed OTP codes, expiry timestamps, attempt counters, and verification state.
3. `schemes`: Stores master information about government schemes, including title, category, government level (Central or State), department, source URL, and application links.
4. `scheme_rules`: Stores eligibility rules associated with each scheme. Each rule specifies a field name (such as age or income), a comparison operator (`>`, `<`, `==`, `in`), and expected criteria.
5. `scheme_documents`: Stores required identification and eligibility documents (such as Aadhaar card, income certificate, or ration card) for each scheme.

### External Integrations
- Government Scheme Seed Data: Integrated via `scheme_provider.py` to ingest real-world Central and State government welfare schemes into the platform.
- Bhashini Translation Layer: Built into `frontend/src/services/bhashiniService.js` to enable translation across 10 official Indian languages (English, Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Odia).
- SMS Notification Bridge: Abstracted in `backend/app/services/sms_service.py`. Currently operating as a development mock logger that can be swapped for a commercial SMS gateway (such as Twilio or Fast2SMS) without rewriting authentication logic.

---

## 7. Communication Between Application Layers

1. **Client to Server Request**:
   - The user triggers an action in the React browser client (for example, searching schemes or submitting onboarding details).
   - The frontend calls a method in `frontend/src/services/`, which utilizes `frontend/src/services/api.js`.
   - `api.js` attaches the JWT token from `localStorage` in the `Authorization: Bearer <token>` header if the user is authenticated.
2. **Backend Processing**:
   - FastAPI receives the HTTP request at `http://127.0.0.1:8000`.
   - CORS middleware verifies the origin.
   - Pydantic models validate the JSON body and query parameters.
   - The router invokes the relevant service (such as `RecommendationService` or `EligibilityEngine`).
   - The service queries the database through the Data Access Object (DAO) using parameterized SQL queries.
3. **Response Delivery**:
   - The backend returns a structured JSON payload with standard HTTP status codes (200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error).
   - The React component receives the response, updates local state or React Context, and updates the interface without a full page refresh.
