# Component Documentation for Yojsetu

## 1. Introduction

This document details the important components and modules of the Yojsetu platform. A component is an independent, reusable piece of code that handles a specific task, such as displaying a card on the screen, managing user login, or calculating whether a citizen is eligible for a welfare program.

The project is divided into two primary systems:
- The Frontend (User Interface in React)
- The Backend (Server, Business Logic, and Data Layer in FastAPI)

---

## 2. Major Frontend Pages and Components

The frontend is located in the `frontend/` directory.

### Core Layout and Navigation

- `AppLayout.jsx` (`frontend/src/layouts/AppLayout.jsx`):
  - Purpose: Provides the persistent layout frame for authenticated and primary views.
  - Responsibilities: Renders the top navigation header, sidebar navigation links (Dashboard, Schemes, Applications, Documents, Assistant, Profile), responsive mobile navigation menu, user avatar menu, and the regional language selector dropdown.

- `Navbar.jsx` (`frontend/src/components/Navbar.jsx`):
  - Purpose: Renders the top navigation bar with application branding, links, and authentication state controls.

- `ProtectedRoute.jsx` (`frontend/src/routes/ProtectedRoute.jsx`):
  - Purpose: A route guard component that protects private pages from unauthenticated access.
  - Responsibilities: Checks whether an active authentication token exists. If not, it redirects the visitor to the `/login` page while preserving the intended destination URL.

### Main Application Pages

- `Home.jsx` (`frontend/src/pages/Home.jsx`):
  - Purpose: Public landing page welcoming citizens to Yojsetu.
  - Responsibilities: Presents a high-level search bar, highlights top scheme categories (Agriculture, Education, Healthcare, Housing), outlines platform benefits, and guides users to register or explore schemes.

- `Login.jsx` (`frontend/src/pages/Login.jsx`):
  - Purpose: Handles user sign-in.
  - Responsibilities: Provides two login methods: password-based login (using phone or email) and mobile One-Time Password (OTP) login. Manages form state, validation, error messaging, and password recovery links.

- `Register.jsx` (`frontend/src/pages/Register.jsx`):
  - Purpose: New citizen account registration.
  - Responsibilities: Implements a verified registration flow: requests an OTP to the citizen's phone number, verifies the entered OTP, and submits the full name and password to create the account.

- `Onboarding.jsx` (`frontend/src/pages/Onboarding.jsx`):
  - Purpose: Profile setup wizard for new citizens.
  - Responsibilities: Guides the user through demographic questions including age, gender, social category (General, OBC, SC, ST), occupation, annual income, marital status, state of residence, and disability status. This information forms the basis for eligibility checks.

- `Dashboard.jsx` (`frontend/src/pages/Dashboard.jsx`):
  - Purpose: The citizen's personal overview hub.
  - Responsibilities: Summarizes profile completion status, displays high-priority matching schemes, quick links to saved schemes, and allows one-click profile updates.

- `SchemesListPage.jsx` (`frontend/src/pages/schemes/SchemesListPage.jsx`):
  - Purpose: Searchable and filterable directory of government schemes.
  - Responsibilities: Coordinates search input, category filters (such as Agriculture or Women and Child), state filters, and sorting. Renders scheme cards via child components.

- `SchemeDetailPage.jsx` (`frontend/src/pages/schemes/SchemeDetailPage.jsx`):
  - Purpose: Full-page view for an individual scheme.
  - Responsibilities: Displays official scheme title, sponsoring ministry or department, detailed monetary or social benefits, required documents checklist, eligibility rules, and official online application links.

- `Assistant.jsx` (`frontend/src/pages/Assistant.jsx`):
  - Purpose: Conversational AI advisor for citizens.
  - Responsibilities: Provides a chat interface where users can type or ask questions regarding schemes in their regional language, receiving guided suggestions and scheme summaries.

- `Profile.jsx` (`frontend/src/pages/Profile.jsx`):
  - Purpose: Citizen profile management.
  - Responsibilities: Displays and enables updates to personal demographics, contact details, and socioeconomic attributes.

- `Documents.jsx` (`frontend/src/pages/Documents.jsx`):
  - Purpose: Digital document checklist and repository tracker.
  - Responsibilities: Tracks whether the citizen possesses common verification documents (such as Aadhaar card, PAN card, income certificate, or ration card) necessary for scheme applications.

- `Applications.jsx` (`frontend/src/pages/Applications.jsx`):
  - Purpose: Application tracker.
  - Responsibilities: Allows users to track their ongoing or submitted scheme applications and review their current status.

### Reusable UI Components

- `SchemeCard.jsx` (`frontend/src/components/schemes/SchemeCard.jsx`):
  - Purpose: Card element displaying scheme summary information.
  - Responsibilities: Shows scheme name, category badge, sponsoring government level, a brief description of benefits, and a clickable link to open full scheme details.

- `SchemeList.jsx` (`frontend/src/components/schemes/SchemeList.jsx`):
  - Purpose: Grid container for scheme cards.
  - Responsibilities: Handles loading indicators, empty search results states, and renders multiple `SchemeCard` elements.

- `ProfileProgress.jsx` (`frontend/src/components/ProfileProgress.jsx`):
  - Purpose: Visual profile completeness indicator.
  - Responsibilities: Renders a progress bar indicating how thoroughly the citizen has filled out their eligibility criteria.

---

## 3. Frontend Context Providers and Services

### Context Providers (Global State)

- `AuthContext.jsx` (`frontend/src/context/AuthContext.jsx`):
  - Manages authentication state: `user`, `token`, `isAuthenticated`, and `loading`.
  - Exposes actions: `login()`, `logout()`, `register()`, and `refreshUser()`. Persists the access token to browser `localStorage`.

- `LanguageContext.jsx` (`frontend/src/context/LanguageContext.jsx`):
  - Manages localization state: `language` (e.g., `en`, `hi`, `ta`).
  - Exposes actions: `changeLanguage(code)` and `t(key)` for dictionary lookup. Integrates with static dictionaries and the Bhashini service bridge.

- `ProfileContext.jsx` (`frontend/src/context/ProfileContext.jsx`):
  - Manages citizen demographic profile state: age, income, caste, state, and student status.
  - Provides helper methods to update profile fields and calculate profile completeness percentage.

- `ThemeContext.jsx` (`frontend/src/context/ThemeContext.jsx`):
  - Manages application visual appearance (light mode and dark mode) by toggling CSS class attributes.

### Client-Side Services

- `api.js` (`frontend/src/services/api.js`):
  - Creates the shared Axios instance pointing to the backend base URL (`http://127.0.0.1:8000`).
  - Contains an HTTP request interceptor that automatically attaches `Authorization: Bearer <token>` if a token exists in storage.

- `authService.js` (`frontend/src/services/authService.js`):
  - Encapsulates authentication API calls: `/auth/login`, `/auth/register`, `/auth/register/request-otp`, `/auth/register/verify-otp`, and `/auth/me`.

- `schemeService.js` (`frontend/src/services/schemeService.js`):
  - Encapsulates scheme API calls: fetching scheme lists, fetching scheme details by ID, and invoking `/schemes/recommend`.

- `chatService.js` (`frontend/src/services/chatService.js`):
  - Processes queries for the interactive Assistant. Matches user questions with relevant scheme keywords, retrieves matching schemes, and formats helpful advice.

- `bhashiniService.js` (`frontend/src/services/bhashiniService.js`):
  - Localization translation engine supporting 10 Indian languages. Translates dynamic interface text and chatbot responses.

---

## 4. Backend Routers (Controllers)

Backend routers are located in `backend/app/routers/`. They define the HTTP endpoints, parse query parameters and JSON bodies, and return structured responses.

### 1. Schemes Router (`backend/app/routers/schemes.py`)

- `GET /schemes`:
  - Retrieves all active schemes from the database. Supports optional query filters: `category`, `state`, and `search`.
- `GET /schemes/{scheme_id}`:
  - Retrieves detailed data for a specific scheme by primary key ID, including its associated eligibility rules and document checklist.
- `POST /schemes/ingest`:
  - Triggers the scheme ingestion service to populate or update scheme data in the database from the configured scheme provider.
- `POST /schemes/{scheme_id}/check-eligibility`:
  - Runs the deterministic eligibility engine for a single scheme against a supplied user profile and document list.
- `POST /schemes/recommend`:
  - Core recommendation endpoint. Filters schemes, evaluates user eligibility, ranks matching schemes, and returns structured recommendations with grounded explanations.

### 2. Authentication Router (`backend/app/routers/auth.py`)

- `POST /auth/register/request-otp`: Sends an OTP to the given phone number for registration.
- `POST /auth/register/verify-otp`: Validates the registration OTP and returns a short-lived verification token.
- `POST /auth/register`: Creates the user record in the database using the verification token, hashed password, and user details.
- `POST /auth/login`: Authenticates with phone/email and password, returning a signed JWT access token.
- `POST /auth/login/request-otp`: Sends a login OTP to a registered phone number.
- `POST /auth/login/verify-otp`: Verifies the login OTP and returns a signed JWT access token.
- `POST /auth/forgot-password/request-otp`: Initiates password recovery via SMS OTP.
- `POST /auth/forgot-password/verify-otp`: Verifies recovery OTP and returns a reset token.
- `POST /auth/reset-password`: Updates the user password after verifying the reset token.
- `GET /auth/me`: Returns the profile information of the currently authenticated user extracted from the JWT token.

### 3. Health Check Router (`backend/app/routers/ping.py`)

- `GET /api/ping`:
  - Returns a simple status payload `{"ping": "pong"}` confirming that the FastAPI backend server is alive and responding.

---

## 5. Backend Business Logic Services

Backend services are located in `backend/app/services/`. They encapsulate core business calculations without direct HTTP dependencies.

- `EligibilityEngine` (`backend/app/services/eligibility_engine.py`):
  - Purpose: Pure deterministic rule evaluator.
  - Responsibilities: Checks citizen profile fields against scheme conditions stored in `scheme_rules`.
  - Supports comparison operators:
    - Numeric: `>`, `>=`, `<`, `<=` (e.g., `age >= 18`, `income <= 250000`)
    - Equality: `==`, `!=` (e.g., `gender == 'female'`)
    - Inclusion: `in` (e.g., `state in ['All India', 'Maharashtra']`, `caste in ['SC', 'ST']`)
  - Evaluates document requirements against the citizen's uploaded document list.
  - Categorizes results into `ELIGIBLE`, `NOT_ELIGIBLE`, or `INSUFFICIENT_INFORMATION`.

- `RecommendationService` (`backend/app/services/recommendation_service.py`):
  - Purpose: Ranks and organizes schemes for a specific citizen.
  - Responsibilities: Pre-filters schemes by state and category, invokes `EligibilityEngine` for each scheme, calculates a match score, and formats an explainable reason for each recommendation.

- `SchemeIngestionService` (`backend/app/services/scheme_ingestion_service.py`):
  - Purpose: Manages initial and periodic catalog population.
  - Responsibilities: Reads scheme records from `scheme_provider.py`, writes schemes, rules, and document entries to the database, and provides `seed_schemes_if_empty()` called on application startup.

- `SchemeProvider` (`backend/app/services/scheme_provider.py`):
  - Purpose: Seed data repository.
  - Responsibilities: Contains pre-configured central and state welfare programs (e.g., PM-Kisan Samman Nidhi, Ayushman Bharat PM-JAY, Pradhan Mantri Awas Yojana) along with explicit rules and required documents.

- `ProfileNormalizer` (`backend/app/services/profile_normalizer.py`):
  - Purpose: Cleans and standardizes user profile data.
  - Responsibilities: Normalizes social categories (e.g., mapping "Scheduled Caste" to "SC"), parses text income values into numeric integers, and standardizes gender strings for consistent rule evaluation.

- `AuthService` (`backend/app/services/auth_service.py`):
  - Purpose: Security and cryptographic operations.
  - Responsibilities: Hashes passwords using bcrypt, verifies passwords against stored hashes, signs JWT access tokens, and verifies tokens for protected endpoints.

- `OtpService` (`backend/app/services/otp_service.py`):
  - Purpose: One-Time Password management.
  - Responsibilities: Generates secure 6-digit numeric codes, hashes OTPs using SHA-256 for secure storage, validates expiry windows (default 10 minutes), enforces rate limits, and increments failed attempt counters.

- `SmsService` (`backend/app/services/sms_service.py`):
  - Purpose: Outbound message transport abstraction.
  - Responsibilities: Dispatches OTP messages to the citizen's mobile device (mock console logger for development environments).

---

## 6. Backend Data Access Objects (DAO / Repositories)

The DAO layer is located in `backend/app/dao/`. It isolates direct database interactions from routers and services, using parameterized SQL queries to prevent SQL injection vulnerabilities.

- `UserDAO` (`backend/app/dao/user_dao.py`):
  - `create_user()`: Inserts a new user record.
  - `get_user_by_id()`: Fetches a user by primary key ID.
  - `get_user_by_phone()`: Fetches a user by phone number.
  - `get_user_by_email()`: Fetches a user by email address.
  - `get_user_by_identifier()`: Searches for a user by either phone or email.
  - `update_user_password()`: Updates a user's password hash.

- `OtpDAO` (`backend/app/dao/otp_dao.py`):
  - `create_otp()`: Records a new OTP request with hashed code, purpose, and expiration timestamp.
  - `get_active_otp()`: Fetches the most recent unexpired, unverified OTP for a phone number and purpose.
  - `increment_attempts()`: Increases the attempt count to prevent brute-force attacks.
  - `mark_otp_verified()`: Flags the OTP record as verified.

- `SchemeDAO` (`backend/app/dao/scheme_dao.py`):
  - `get_all_schemes()`: Returns schemes with optional category, state, and status filters.
  - `get_scheme_by_id()`: Retrieves a scheme by primary key ID.
  - `get_rules_for_scheme()`: Retrieves all eligibility rules for a scheme.
  - `get_documents_for_scheme()`: Retrieves required documents for a scheme.
  - `insert_scheme()`, `insert_scheme_rule()`, `insert_scheme_document()`: Methods for ingesting new scheme data.

---

## 7. How Main Components Interact

The following sequence illustrates how the primary components interact when a citizen requests scheme recommendations:

```
[ Citizen in Browser ]
       |
       | 1. Submits profile on Onboarding / Dashboard
       v
[ Dashboard.jsx / SchemesListPage.jsx ]
       |
       | 2. Calls schemeService.getRecommendations(profile)
       v
[ schemeService.js -> api.js ]
       |
       | 3. Sends HTTP POST /schemes/recommend with Bearer Token
       v
[ schemes.py (Router) ]
       |
       | 4. Validates request body with Pydantic
       v
[ RecommendationService ]
       |
       | 5. Calls scheme_dao.get_all_schemes()
       v
[ SchemeDAO -> Database (MySQL/SQLite) ]
       |
       | 6. Returns candidate schemes, rules, and documents
       v
[ EligibilityEngine ]
       |
       | 7. Normalizes profile via ProfileNormalizer
       | 8. Evaluates rules (age, income, state, caste, docs)
       v
[ RecommendationService ]
       |
       | 9. Scores, ranks, and attaches plain-language explanations
       v
[ schemes.py (Router) ]
       |
       | 10. Serializes into RecommendationResponse JSON
       v
[ Frontend (React State) ]
       |
       | 11. Renders SchemeCard components on Dashboard / Schemes view
```
