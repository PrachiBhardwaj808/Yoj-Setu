# Technical Decisions Documentation for Yojsetu

## 1. Introduction

This document records the key architectural, design, and implementation choices made in the Yojsetu codebase. Documenting these decisions helps developers, students, and contributors understand why specific technologies and patterns were selected, what trade-offs were accepted, and how the codebase balances developer experience with production readiness.

To maintain strict documentation accuracy:
- **Verified Decisions** are directly supported by evidence in configuration files, source code, and inline documentation.
- **Inferred Decisions** represent technical choices deduced from code architecture, design patterns, and package choices, clearly marked as inferences.

---

## 2. Decision 1: Using FastAPI as the Backend Framework

- **Status**: Verified from `backend/main.py` and `backend/requirements.txt`.
- **Context**: The application required a modern Python web backend capable of serving RESTful APIs, validating complex user and scheme data payloads, and handling asynchronous requests.
- **Why It Was Chosen**:
  - FastAPI is built on modern Python type hints and the Asynchronous Server Gateway Interface (ASGI) standard via Uvicorn, delivering high throughput.
  - Automatic JSON request validation and response serialization using Pydantic eliminate manual data parsing boilerplate.
  - Automatic interactive API documentation is generated out-of-the-box via Swagger UI (`/docs`) and ReDoc (`/redoc`).
- **Advantages**:
  - Clear separation of endpoints via `APIRouter`.
  - Type-safe request handling catches malformed inputs before reaching business logic.
  - Lightweight and fast compared to traditional monolithic frameworks.
- **Trade-offs and Limitations**:
  - Unlike "batteries-included" frameworks such as Django, FastAPI does not provide a built-in administrative dashboard, database migration tool, or user management system out-of-the-box. These components must be designed and maintained manually.

---

## 3. Decision 2: Dual Database Strategy with Automatic SQLite Fallback

- **Status**: Verified from `backend/app/db.py`.
- **Context**: Setting up a production relational database like MySQL can be an obstacle for students, new contributors, or automated evaluation environments that lack running database servers.
- **Decision**: Implement a database connection factory (`get_connection()`) that attempts to connect to a configured MySQL server first. If MySQL is unreachable, it automatically falls back to an embedded SQLite file database (`backend/yojsetu.db`), utilizing compatibility wrappers (`SQLiteConnectionWrapper` and `SQLiteDictCursor`) that translate MySQL `%s` placeholders to SQLite `?` placeholders.
- **Advantages**:
  - Zero-configuration setup: The backend functions immediately upon running `uvicorn main:app` without requiring the installation or configuration of MySQL.
  - Production readiness: The same codebase connects seamlessly to an external MySQL instance in staging or production environments simply by setting environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`).
- **Trade-offs and Limitations**:
  - SQL dialect differences: Advanced database-specific features (such as MySQL-specific date functions or locking mechanisms) must be avoided or abstracted to maintain compatibility with SQLite.
  - Concurrency limitations: SQLite is file-based and has concurrency constraints during simultaneous write operations, making MySQL necessary for high-load multi-user production environments.

---

## 4. Decision 3: Direct Parameterized SQL Queries (No ORM)

- **Status**: Verified from `backend/app/db.py` (`# Raw database connection helper -- no ORM, no connection pool`) and the `backend/app/dao/` directory.
- **Context**: Many web frameworks use an Object-Relational Mapper (ORM), such as SQLAlchemy or Tortoise ORM, to represent database tables as Python classes.
- **Decision**: The project explicitly uses raw SQL executed via cursor instances, organized into Data Access Objects (DAOs): `user_dao.py`, `otp_dao.py`, and `scheme_dao.py`. Parameterized queries (using `%s` or `?`) are enforced across all queries.
- **Advantages**:
  - Complete transparency: Developers see the exact SQL queries executed against the database, with no hidden query generation or unexpected N+1 query performance problems.
  - Minimal dependency footprint: No complex ORM dependencies or version migration conflicts.
  - Strict security: Parameterized inputs prevent SQL injection attacks.
- **Trade-offs and Limitations**:
  - Schema migrations are handled through `CREATE TABLE IF NOT EXISTS` DDL statements in `main.py` rather than automated migration tools (such as Alembic).
  - Column mappings from database tuples to dictionaries require explicit dictionary cursor wrappers.

---

## 5. Decision 4: Deterministic Eligibility Engine Over Pure Generative AI

- **Status**: Verified from `backend/app/services/eligibility_engine.py` and `backend/app/services/recommendation_service.py`.
- **Context**: Government welfare eligibility involves strict legal, economic, and demographic criteria. Citizens need reliable, verifiable answers about whether they qualify for financial assistance or public benefits.
- **Decision**: Use a deterministic rule engine (`EligibilityEngine`) to evaluate eligibility, while reserving artificial intelligence and natural language processing for search assistance, recommendations, and conversational explanations.
- **Why This Choice Is Critical**:
  - Generative AI models can experience "hallucinations" (generating plausible-sounding but factually incorrect information) and can make unpredictable mathematical errors when evaluating age brackets, income ceilings, or caste categories.
  - A deterministic engine applies strict boolean and comparison operators (`<`, `<=`, `>`, `>=`, `==`, `in`), ensuring consistent, auditable, and repeatable results for every citizen.
- **Advantages**:
  - 100 percent predictable rule evaluation.
  - Clear explanations: When a citizen is ineligible, the engine pinpoints the exact unmet condition (for example: "Annual income must be under 2,50,000 INR").
  - Clear separation of concerns: The rule engine computes eligibility status (`ELIGIBLE`, `NOT_ELIGIBLE`, `INSUFFICIENT_INFORMATION`), while the recommendation service scores and ranks results.
- **Trade-offs and Limitations**:
  - Requires government scheme rules to be structured and stored in a standardized format in the `scheme_rules` table.

---

## 6. Decision 5: React 19, Vite, and React Router v7 on the Frontend

- **Status**: Verified from `frontend/package.json` and `frontend/vite.config.js`.
- **Context**: The frontend needed to be responsive, fast, and capable of seamless navigation across complex multi-step workflows (onboarding, scheme browsing, document tracking).
- **Decision**: Build the client application as a Single-Page Application (SPA) using React 19, Vite, and React Router v7.
- **Advantages**:
  - Fast developer feedback: Vite provides near-instantaneous Hot Module Replacement (HMR) during development.
  - Fluid user experience: React Router v7 enables client-side page transitions without full-page browser refreshes.
  - Modern component model: Reusable UI cards, modal dialogs, and progress indicators.
- **Trade-offs and Limitations**:
  - Single-Page Applications perform client-side rendering (CSR), which means search engine crawlers must execute JavaScript to index dynamic content.
  - Users on very low-bandwidth connections must download the JavaScript application bundle on their first visit.

---

## 7. Decision 6: React Context API for State Management (No Redux)

- **Status**: Verified from `frontend/src/context/` and `frontend/package.json`.
- **Context**: The application manages several shared states: logged-in user session, demographic profile, selected language, and visual theme.
- **Decision**: Use React's built-in Context API (`AuthContext`, `ProfileContext`, `LanguageContext`, `ThemeContext`) rather than external state libraries such as Redux, MobX, or Zustand.
- **Advantages**:
  - Zero external state management dependencies: Reduces bundle size and complexity.
  - Low learning curve: New developers can understand and contribute to state logic using standard React hooks (`useContext`, `useState`, `useEffect`).
  - Modular separation: Each domain (auth, profile, language, theme) is isolated in its own context provider.
- **Trade-offs and Limitations**:
  - React Context can cause re-renders in subscribing components when values change. For this application's moderate frequency of updates, this trade-off is acceptable and causes no noticeable performance degradation.

---

## 8. Decision 7: Mobile-First OTP Authentication Flow

- **Status**: Verified from `backend/app/routers/auth.py`, `backend/app/services/otp_service.py`, and `frontend/src/pages/Register.jsx`.
- **Context**: In India, many citizens access the internet exclusively through smartphones and may not possess or actively check personal email addresses. Mobile phone numbers and SMS OTPs are the standard for public service identification.
- **Decision**: Support mobile phone numbers as the primary identifier, with a 6-digit One-Time Password (OTP) verification step for registration and optional OTP login. Passwords and email addresses are supported for convenience, but phone verification remains mandatory.
- **Advantages**:
  - Accessible to rural and mobile-only citizens.
  - Reduces automated spam registrations.
  - Follows established Indian digital identity and public portal conventions.
- **Trade-offs and Limitations**:
  - Requires an active SMS gateway integration in production. In the local development environment, an SMS mock service (`sms_service.py`) logs OTP codes to the console to avoid third-party messaging costs.

---

## 9. Decision 8: Multi-Language Architecture Supporting Indian Languages

- **Status**: Verified from `frontend/src/context/LanguageContext.jsx`, `frontend/src/services/bhashiniService.js`, and `frontend/src/translations/`.
- **Context**: India has 22 officially recognized languages. A major barrier to welfare scheme adoption is that government notifications are often published in English or formal administrative terminology that citizens cannot easily interpret.
- **Decision**: Build first-class multilingual localization into the platform, supporting 10 major Indian languages (English, Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Odia). The architecture combines static dictionary files for user interface labels with an abstraction layer for the Indian government's Bhashini AI translation initiative.
- **Advantages**:
  - Broad accessibility across diverse states and linguistic communities.
  - Centralized `LanguageContext` ensures that changing the language updates the navigation bar, scheme catalog, profile, and assistant simultaneously.
- **Trade-offs and Limitations**:
  - Static dictionary files require ongoing maintenance as new UI elements are added.
  - Dynamic translation of arbitrary scheme descriptions relies on external translation services or fallback mechanisms when offline.
