# Workflow Documentation for Yojsetu

## 1. Introduction

This document explains step by step how key features in the Yojsetu platform operate. It walks through user interactions in the browser, how requests travel through the frontend services to the backend API, how business logic and database queries run, and how responses are returned and presented to the citizen.

---

## 2. Main Citizen User Journey

The overall journey of a citizen using Yojsetu follows five main phases:

```
[ Phase 1: Discovery ]
   Citizen visits Home page -> Browses categories -> Explores scheme directory
           |
           v
[ Phase 2: Verified Registration ]
   Enters mobile number -> Receives SMS OTP -> Enters verification code -> Sets password
           |
           v
[ Phase 3: Demographic Onboarding ]
   Completes multi-step profile (age, caste, income, state, employment, documents)
           |
           v
[ Phase 4: Personalized Dashboard & Eligibility ]
   Views matched schemes -> Reviews eligibility verdicts and document requirements
           |
           v
[ Phase 5: Scheme Application & Assistant Guidance ]
   Asks questions to AI Assistant in regional language -> Follows official portal link
```

---

## 3. Workflow: User Registration and Phone Verification

Security and identity validation are critical to prevent fraudulent applications. Yojsetu uses a mobile-first One-Time Password (OTP) workflow.

### Flow Diagram

```
[ Citizen ]              [ Register.jsx ]        [ auth.py Router ]      [ otp_service / DB ]
    |                           |                        |                        |
    | 1. Enters phone number     |                        |                        |
    |-------------------------->|                        |                        |
    |                           | 2. POST /request-otp   |                        |
    |                           |----------------------->|                        |
    |                           |                        | 3. Checks phone exists |
    |                           |                        |    Generates 6-digit OTP
    |                           |                        |    Saves hashed OTP in DB
    |                           |                        |    Sends SMS via logger
    |                           | 4. Returns 200 OK      |<-----------------------|
    |                           |<-----------------------|                        |
    | 5. Enters 6-digit code    |                        |                        |
    |-------------------------->|                        |                        |
    |                           | 6. POST /verify-otp    |                        |
    |                           |----------------------->|                        |
    |                           |                        | 7. Validates hash & exp
    |                           |                        |    Issues 15-min token |
    |                           | 8. verification_token  |<-----------------------|
    |                           |<-----------------------|                        |
    | 9. Enters name & password |                        |                        |
    |-------------------------->|                        |                        |
    |                           | 10. POST /register     |                        |
    |                           |----------------------->|                        |
    |                           |                        | 11. Hashes password
    |                           |                        |     Inserts user in DB
    |                           |                        |     Signs JWT access token
    |                           | 12. JWT Access Token   |<-----------------------|
    |                           |<-----------------------|                        |
    | 13. Redirected to /onboarding                      |                        |
    |<--------------------------|                        |                        |
```

### Step-by-Step Explanation

1. **Step 1 (User Input)**: The citizen opens `/register` in the browser and enters a 10-digit mobile number.
2. **Step 2 (Requesting OTP)**:
   - `frontend/src/pages/Register.jsx` calls `authService.requestRegisterOtp(phone)`.
   - An HTTP POST request is sent to `/auth/register/request-otp` via `frontend/src/services/api.js`.
3. **Step 3 (Backend Verification & Dispatch)**:
   - `backend/app/routers/auth.py` checks whether the phone number is already registered in the `users` table using `user_dao.get_user_by_phone()`.
   - If the number is available, `otp_service.generate_and_send_otp()` generates a random 6-digit numeric code.
   - The OTP is cryptographically hashed using SHA-256 and stored in `otp_verifications` with a 10-minute expiry timestamp.
   - `sms_service.py` dispatches the SMS message (logged to the development terminal in local mode).
4. **Step 4 (Entering OTP)**: The citizen enters the 6-digit code received on their phone.
5. **Step 5 (Verifying OTP)**:
   - The frontend sends a POST request to `/auth/register/verify-otp`.
   - The backend retrieves the active record from `otp_verifications`, hashes the input, verifies that attempts are within limits, and marks the OTP as verified.
   - The backend generates a temporary, cryptographically signed JSON Web Token (JWT) with a 15-minute lifespan and purpose `register_verification`.
6. **Step 6 (Account Creation)**:
   - The citizen enters their full name, password, and optional email address.
   - The frontend calls `POST /auth/register`, passing the verification token, phone number, name, and password.
   - The backend validates the temporary token to guarantee that the phone was verified.
   - `auth_service.py` hashes the password using bcrypt.
   - `user_dao.create_user()` inserts the new record into the `users` table.
   - The backend signs a permanent JWT access token containing the user ID and phone number.
7. **Step 7 (Session Initialization)**:
   - The frontend saves the token to browser `localStorage`.
   - `AuthContext.jsx` updates its state, marking `isAuthenticated` as true.
   - The citizen is navigated to `/onboarding`.

---

## 4. Workflow: Citizen Onboarding and Eligibility Evaluation

This workflow describes how a citizen fills out their profile and receives instant, personalized scheme recommendations.

### Flow Diagram

```
[ Citizen ]              [ Onboarding.jsx ]      [ schemes.py Router ]   [ RecommendationService ]
    |                           |                        |                        |
    | 1. Fills demographic form |                        |                        |
    |    (Age, Caste, Income,   |                        |                        |
    |     State, Occupation)    |                        |                        |
    |-------------------------->|                        |                        |
    |                           | 2. Updates context     |                        |
    |                           |    Calls /recommend    |                        |
    |                           |----------------------->|                        |
    |                           |                        | 3. Fetches schemes     |
    |                           |                        |    from SchemeDAO      |
    |                           |                        |----------------------->|
    |                           |                        |                        | 4. ProfileNormalizer:
    |                           |                        |                        |    cleans categories
    |                           |                        |                        | 5. EligibilityEngine:
    |                           |                        |                        |    checks rules & docs
    |                           |                        |                        | 6. Scores & ranks
    |                           |                        | 7. Recommendation JSON |<-----------------------|
    |                           | 8. Formatted results   |<-----------------------|
    |                           |<-----------------------|                        |
    | 9. Displays matched cards |                        |                        |
    |<--------------------------|                        |                        |
```

### Step-by-Step Explanation

1. **Step 1 (Collecting Profile Data)**:
   - The citizen completes the multi-step questionnaire on `frontend/src/pages/Onboarding.jsx`.
   - Fields collected include: age, gender, social category (General, OBC, SC, ST), annual household income, employment status, state of residence, marital status, and available identity documents.
2. **Step 2 (Local State Update)**:
   - `ProfileContext.jsx` stores the profile attributes in state and browser storage.
3. **Step 3 (Initiating Recommendation)**:
   - The frontend triggers `schemeService.getRecommendations()`, which sends an HTTP POST request to `/schemes/recommend`.
   - The request payload includes the `user_profile` dictionary and `user_documents` list, along with the user's `Bearer <token>` authentication header.
4. **Step 4 (Backend Pre-Filtering)**:
   - `backend/app/routers/schemes.py` receives the request and delegates it to `RecommendationService`.
   - The service fetches all active schemes, their rules, and their required documents from the database via `scheme_dao`.
   - Schemes are pre-filtered to include programs applicable nationwide ("All India") or specifically within the citizen's state.
5. **Step 5 (Data Normalization)**:
   - `profile_normalizer.py` parses and cleans user input. For example, text income representations (such as "150000" or "1.5 Lakh") are standardized into numeric integers, and category labels are unified.
6. **Step 6 (Deterministic Rule Evaluation)**:
   - `eligibility_engine.py` evaluates each scheme rule against user attributes:
     - Numerical comparisons: Checks if `profile.age` falls within the minimum and maximum scheme limits.
     - Income limits: Compares citizen income against the program ceiling.
     - Categorical requirements: Verifies gender, caste, and employment status.
     - Document requirements: Compares the scheme's mandatory documents against `user_documents`.
   - An eligibility verdict is assigned:
     - `ELIGIBLE`: All mandatory rules and documents are satisfied.
     - `NOT_ELIGIBLE`: At least one mandatory condition is unmet.
     - `INSUFFICIENT_INFORMATION`: Missing user profile fields prevent conclusive determination.
7. **Step 7 (Scoring and Explanation Generation)**:
   - `recommendation_service.py` calculates a relevance score (0 to 100) based on eligibility, benefit impact, and matching criteria.
   - A grounded explanation is generated in clear language (e.g., "Eligible: Meets income threshold and farmer landholding criteria").
8. **Step 8 (Rendering in UI)**:
   - The frontend receives the sorted recommendations list.
   - `Dashboard.jsx` updates its state, rendering high-match schemes with color-coded eligibility badges.

---

## 5. Workflow: Scheme Search, Filtering, and Detail Inspection

This workflow covers how citizens explore the public catalog of schemes.

### Step-by-Step Explanation

1. **Browsing the Catalog**:
   - The citizen navigates to `/schemes`.
   - `frontend/src/pages/schemes/SchemesListPage.jsx` mounts and issues a `GET /schemes` request to the backend.
2. **Applying Filters**:
   - When the citizen selects a category (e.g., "Agriculture") or types a search keyword (e.g., "Kisan"), the page updates query parameters: `GET /schemes?category=Agriculture&search=Kisan`.
   - In `backend/app/routers/schemes.py`, the query parameters are passed to `scheme_dao.get_all_schemes()`. The endpoint filters matching records case-insensitively across scheme titles, descriptions, and categories.
3. **Opening Scheme Details**:
   - The citizen clicks on a scheme card.
   - React Router navigates to `/schemes/:id` (e.g., `/schemes/1`).
   - `frontend/src/pages/schemes/SchemeDetailPage.jsx` dispatches a `GET /schemes/1` request.
4. **Assembling Detailed Response**:
   - The backend retrieves the scheme record from `schemes`, its eligibility criteria from `scheme_rules`, and necessary documents from `scheme_documents`.
   - The combined payload is returned as a `SchemeDetailResponse`.
5. **Displaying Official Guidelines**:
   - The detail page renders:
     - Benefits section (cash transfers, insurance coverage, subsidies).
     - Eligibility rules table.
     - Document checklist with checkboxes allowing citizens to track readiness.
     - An "Apply on Official Portal" link that routes directly to the government department's external application website.

---

## 6. Workflow: Regional Language Switching

Accessibility across languages is managed through a centralized React Context.

### Step-by-Step Explanation

1. **User Action**: The citizen opens the language dropdown in `AppLayout.jsx` and selects a language (for example, Hindi - `hi`).
2. **Context Notification**:
   - The dropdown calls `changeLanguage('hi')` from `LanguageContext.jsx`.
   - `LanguageContext` updates its `language` state variable and persists the choice to browser `localStorage.setItem('yojsetu_language', 'hi')`.
3. **Static UI Translation**:
   - All components consuming the `useLanguage()` hook receive the updated code.
   - Calls to `t('nav.dashboard')` retrieve the corresponding string from `frontend/src/translations/hi.js`.
4. **Dynamic AI and Chatbot Content**:
   - When communicating with the Assistant, the language code is supplied to `bhashiniService.js`.
   - Prompts and system guidance are translated into the selected regional language.

---

## 7. Workflow: Interactive Scheme Assistant (Chatbot)

Citizens can ask questions about complex eligibility criteria using the conversational assistant.

### Step-by-Step Explanation

1. **User Query**: The citizen navigates to `/assistant` and submits a question (e.g., "What schemes can help me pay college fees?").
2. **Frontend Chat Service**:
   - `frontend/src/pages/Assistant.jsx` appends the message to the chat history and forwards it to `frontend/src/services/chatService.js`.
3. **Intent Detection and Scheme Matching**:
   - `chatService.js` analyzes the text for keywords related to education, scholarships, fees, and students.
   - It cross-references available schemes in the catalog matching the education category.
4. **Response Formulation**:
   - The assistant constructs a structured response explaining relevant programs (such as post-matric scholarships or student credit schemes), required documentation, and direct links to view full details.
5. **Interactive Guidance**:
   - The response appears in the chat window with clickable suggestion pills for follow-up queries.

---

## 8. Error Handling and Resilience

Yojsetu implements structured error handling across both client and server:

- **Invalid or Expired JWT Token**:
  - If a user sends a request with an expired access token, the backend returns HTTP status `401 Unauthorized`.
  - The frontend Axios interceptor in `api.js` catches the 401 response, clears `localStorage`, resets `AuthContext`, and redirects the citizen to `/login` with an informational notice.
- **Database Unavailability (Automatic Fallback)**:
  - If the configured MySQL server fails or experiences connection timeout, `backend/app/db.py` catches the connection error and automatically redirects database queries to the local SQLite database (`yojsetu.db`). The user experiences no application outage.
- **Form Validation Errors**:
  - When required fields are missing or invalid (such as an incorrect phone number format or mismatched password), FastAPI returns HTTP `422 Unprocessable Entity` or `400 Bad Request` with structured error details.
  - The frontend displays clear, localized error notices adjacent to the affected form fields without reloading the page.
- **Unknown Routes**:
  - If a user navigates to an unrecognized path, React Router renders `frontend/src/pages/NotFoundPage.jsx` providing a clear link back to the Home page or Dashboard.
