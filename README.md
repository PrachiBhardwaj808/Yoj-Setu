# YOJSETU

### Connecting Citizens with Government Welfare Schemes

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![DigiLocker](https://img.shields.io/badge/DigiLocker-0055A5?style=for-the-badge)

</div>

---

## Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [What Makes YOJSETU Different](#-what-makes-yojsetu-different)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Application Workflow](#-application-workflow)
- [Future Scope](#-future-scope)
- [References](#-references)
- [Team](#-team)

---

## Problem Statement

India has thousands of Central and State Government welfare schemes, but many eligible citizens struggle to discover and access the benefits available to them.

The current process is often fragmented across multiple portals, requires repeated entry of personal information and provides no single place to track applications.

### Key Challenges

- Citizens may not know which schemes they are eligible for.
- Scheme information is distributed across different portals.
- Eligibility criteria can be difficult to understand.
- Users repeatedly provide similar personal information.
- Documents may need to be submitted for different applications.
- Applications are difficult to track across multiple platforms.

---

## Our Solution

**YOJSETU** is a unified platform that connects citizens with relevant government welfare schemes through a personalized and simplified experience.

Users create their profile once and provide information such as income, state, category, occupation and education.

YOJSETU uses this information to identify relevant schemes, assist users during applications, provide access to required documents through **DigiLocker**, and track applications from a centralized dashboard.

### Core Idea

```text
Create Profile
      ↓
Find Relevant Schemes
      ↓
Check Eligibility
      ↓
Access Documents through DigiLocker
      ↓
Apply with Assistance
      ↓
Track Application
```

---

## Key Features

### Citizen Registration

Secure registration using phone-based verification and OTP.

### Personalized Profile

Users maintain a single profile containing important eligibility information such as:

- Income
- State
- Category
- Occupation
- Education

### AI-Powered Scheme Matching

The AI layer analyzes citizen information and scheme requirements to identify welfare schemes relevant to the user.

### DigiLocker Integration

YOJSETU can connect with **DigiLocker** to help users access their verified digital documents, reducing repetitive document collection and submission during applications.

### Application Assistance

Relevant profile and document information can be used to assist users while completing scheme applications.

### Centralized Dashboard

Users can view their:

- Matched schemes
- Applications
- Profile
- Application status
- Required documents

from a single dashboard.

### Application Tracking

Applications can be tracked through simple stages:

```text
Draft → Submitted → Under Review → Approved
```

### Secure Authentication

JWT-based authentication with secure password hashing using Passlib/BCrypt.

---

## What Makes YOJSETU Different

YOJSETU focuses on the **complete welfare journey**, rather than simply providing a scheme-search portal.

| Traditional Process | YOJSETU |
|---|---|
| Search schemes manually | AI-powered scheme matching |
| Check eligibility separately | Profile-based eligibility |
| Re-enter information | Reusable citizen profile |
| Collect documents repeatedly | DigiLocker document access |
| Visit multiple portals | Centralized experience |
| Track applications separately | Unified dashboard |

> **One profile. Relevant schemes. Easier applications. Centralized tracking.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| Database | MySQL |
| Authentication | JWT |
| Password Security | Passlib / BCrypt |
| AI Layer | Eligibility Matching & Application Assistance |
| Document Integration | DigiLocker |

---

## System Architecture

```text
                         ┌──────────────────┐
                         │     CITIZEN      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  React + Vite    │
                         │    Frontend      │
                         └────────┬─────────┘
                                  │
                              REST API
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     FastAPI      │
                         │     Backend      │
                         └───────┬───┬──────┘
                                 │   │
                    ┌────────────┘   └─────────────┐
                    ▼                              ▼
             ┌─────────────┐                ┌─────────────┐
             │    MySQL    │                │  AI Layer   │
             │   Database  │                │  Matching   │
             └─────────────┘                │ & Assistance│
                                            └─────────────┘
                                                    │
                                                    ▼
                                            ┌─────────────┐
                                            │  DigiLocker │
                                            │   Services  │
                                            └─────────────┘
```

---

## Project Structure

```text
Yoj-Setu/
│
├── backend/
│   └── FastAPI Backend
│
├── frontend/
│   └── React + Vite Frontend
│
├── docs/
│   └── Project Documentation
│
├── .gitignore
└── .vscode/
```

---

## Getting Started

### Prerequisites

Make sure you have:

- Python 3.10+
- Node.js
- npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/PrachiBhardwaj808/Yoj-Setu.git
cd Yoj-Setu
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server using the configured project entry point.

### 3. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE yojsetu;
```

Configure the backend database connection according to your local environment.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Application Workflow

```text
              ┌──────────────┐
              │   Register   │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │Build Profile │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │ AI Matching  │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │Find Schemes  │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │  DigiLocker  │
              │   Documents  │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │Apply Easily  │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │    Track     │
              └──────────────┘
```

---

## Future Scope

YOJSETU can be further extended with:

- Integration with more government scheme data sources.
- Multilingual support for regional languages.
- More advanced AI-based eligibility recommendations.
- Automated document verification.
- Application status notifications.
- Expanded government portal integrations.
- Admin panel for managing and updating scheme information.

---

## References

- [myScheme](https://www.myscheme.gov.in/)
- [DigiLocker](https://www.digilocker.gov.in/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Government of India Open Data Platform](https://data.gov.in/)

---

## Team

### Team Hackops

**Chitkara University — Semester 3**

YOJSETU was developed as a project to simplify access to government welfare schemes through personalized discovery, AI-powered eligibility matching, DigiLocker-assisted documentation and centralized application tracking.

---

## About

**YOJSETU** — Bridging the gap between citizens and government welfare schemes through a single, personalized platform.