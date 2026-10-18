# main.py — FastAPI application entry point

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ping, auth, schemes
from app.db import get_connection, SQLiteConnectionWrapper

# ─── TABLE DDLS ───────────────────────────────────────────────────────────────

USERS_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_phone_verified BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

USERS_TABLE_MYSQL_DDL = """
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_phone_verified BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
"""

OTP_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT NULL,
    phone VARCHAR(20) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'REGISTER',
    expires_at DATETIME NOT NULL,
    attempts INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

SCHEMES_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_scheme_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    benefits TEXT,
    category VARCHAR(100),
    government_level VARCHAR(50) DEFAULT 'Central',
    state VARCHAR(100) DEFAULT 'All India',
    department VARCHAR(255),
    source_url VARCHAR(500),
    source_name VARCHAR(255) DEFAULT 'MyScheme Portal',
    application_url VARCHAR(500),
    application_method VARCHAR(50) DEFAULT 'Online',
    status VARCHAR(50) DEFAULT 'Active',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

SCHEME_RULES_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS scheme_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    field_value VARCHAR(255) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    raw_condition_text TEXT,
    FOREIGN KEY(scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
);
"""

SCHEME_DOCS_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS scheme_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    description TEXT,
    FOREIGN KEY(scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
);
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        is_sqlite = isinstance(conn, SQLiteConnectionWrapper)
        if is_sqlite:
            cursor.execute(USERS_TABLE_DDL)
            cursor.execute(OTP_TABLE_DDL)
            cursor.execute(SCHEMES_TABLE_DDL)
            cursor.execute(SCHEME_RULES_TABLE_DDL)
            cursor.execute(SCHEME_DOCS_TABLE_DDL)
        else:
            cursor.execute(USERS_TABLE_MYSQL_DDL)
            cursor.execute(OTP_TABLE_DDL)
            cursor.execute(SCHEMES_TABLE_DDL)
            cursor.execute(SCHEME_RULES_TABLE_DDL)
            cursor.execute(SCHEME_DOCS_TABLE_DDL)
        conn.commit()
        print("[startup] [OK] Database tables (users, otp_verifications, schemes, scheme_rules, scheme_documents) ready.")
        
        # Trigger initial scheme ingestion if database is empty
        try:
            from app.services.scheme_ingestion_service import seed_schemes_if_empty
            seed_schemes_if_empty()
        except Exception as seed_err:
            print(f"[startup] [WARN] Scheme seeding deferred: {seed_err}")
            
    except Exception as e:
        print(f"[startup] [WARN] Could not initialize DB tables: {e}")
    finally:
        conn.close()
    yield


app = FastAPI(
    title="Yojsetu API",
    description="AI-powered Government Scheme Discovery & Eligibility Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ping.router)
app.include_router(auth.router)
app.include_router(schemes.router)
