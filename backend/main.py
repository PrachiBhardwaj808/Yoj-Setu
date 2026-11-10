# main.py — FastAPI application entry point

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ping, auth, schemes, profile, applications, documents
from app.db import get_connection, SQLiteConnectionWrapper

# ─── TABLE DDLS (SQLITE & MYSQL) ───────────────────────────────────────────────

# 1. SQLite DDLs
SQLITE_TABLE_DDLS = [
    """
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
        onboarding_complete BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS otp_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INT NULL,
        phone VARCHAR(20) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        purpose VARCHAR(50) NOT NULL DEFAULT 'REGISTER',
        expires_at DATETIME NOT NULL,
        attempts INT DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """,
    """
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
    """,
    """
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
    """,
    """
    CREATE TABLE IF NOT EXISTS scheme_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_id INT NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        is_mandatory BOOLEAN DEFAULT TRUE,
        description TEXT,
        FOREIGN KEY(scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS citizen_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INT NOT NULL UNIQUE,
        full_name VARCHAR(255),
        date_of_birth VARCHAR(20),
        age INT,
        gender VARCHAR(50),
        state VARCHAR(100),
        district VARCHAR(100),
        block VARCHAR(100),
        village_city VARCHAR(100),
        pincode VARCHAR(20),
        rural_urban VARCHAR(20) DEFAULT 'Rural',
        annual_income REAL DEFAULT 0.0,
        occupation VARCHAR(100),
        education VARCHAR(100),
        social_category VARCHAR(50) DEFAULT 'General',
        marital_status VARCHAR(50),
        family_size INT DEFAULT 1,
        children_count INT DEFAULT 0,
        disability_status VARCHAR(20) DEFAULT 'No',
        disability_percentage REAL,
        bpl_status VARCHAR(20) DEFAULT 'No',
        minority_status VARCHAR(20) DEFAULT 'No',
        housing_status VARCHAR(50),
        raw_details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id VARCHAR(100) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        scheme_id INT NULL,
        external_scheme_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'planning',
        submission_date DATETIME NULL,
        applied_date DATETIME NULL,
        metadata TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(scheme_id) REFERENCES schemes(id) ON DELETE SET NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS user_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id VARCHAR(100) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NULL,
        file_size INT NULL,
        mime_type VARCHAR(100) NULL,
        verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        metadata TEXT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """
]

SQLITE_TRIGGER_DDLS = [
    """
    CREATE TRIGGER IF NOT EXISTS trg_users_updated_at AFTER UPDATE ON users
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_citizen_profiles_updated_at AFTER UPDATE ON citizen_profiles
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL
    BEGIN
        UPDATE citizen_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_applications_updated_at AFTER UPDATE ON applications
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL
    BEGIN
        UPDATE applications SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_user_documents_updated_at AFTER UPDATE ON user_documents
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL
    BEGIN
        UPDATE user_documents SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
    """
]

# 2. MySQL DDLs
MYSQL_TABLE_DDLS = [
    """
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
        onboarding_complete BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        phone VARCHAR(20) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        purpose VARCHAR(50) NOT NULL DEFAULT 'REGISTER',
        expires_at DATETIME NOT NULL,
        attempts INT DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_phone_purpose (phone, purpose),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS schemes (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    """,
    """
    CREATE TABLE IF NOT EXISTS scheme_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scheme_id INT NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        operator VARCHAR(20) NOT NULL,
        field_value VARCHAR(255) NOT NULL,
        is_mandatory BOOLEAN DEFAULT TRUE,
        raw_condition_text TEXT,
        INDEX idx_rules_scheme (scheme_id),
        FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS scheme_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scheme_id INT NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        is_mandatory BOOLEAN DEFAULT TRUE,
        description TEXT,
        INDEX idx_docs_scheme (scheme_id),
        FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS citizen_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        full_name VARCHAR(255),
        date_of_birth VARCHAR(20),
        age INT,
        gender VARCHAR(50),
        state VARCHAR(100),
        district VARCHAR(100),
        block VARCHAR(100),
        village_city VARCHAR(100),
        pincode VARCHAR(20),
        rural_urban VARCHAR(20) DEFAULT 'Rural',
        annual_income DECIMAL(15, 2) DEFAULT 0.00,
        occupation VARCHAR(100),
        education VARCHAR(100),
        social_category VARCHAR(50) DEFAULT 'General',
        marital_status VARCHAR(50),
        family_size INT DEFAULT 1,
        children_count INT DEFAULT 0,
        disability_status VARCHAR(20) DEFAULT 'No',
        disability_percentage FLOAT,
        bpl_status VARCHAR(20) DEFAULT 'No',
        minority_status VARCHAR(20) DEFAULT 'No',
        housing_status VARCHAR(50),
        raw_details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_profile_user (user_id),
        INDEX idx_profile_state_dist (state, district),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id VARCHAR(100) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        scheme_id INT NULL,
        external_scheme_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'planning',
        submission_date DATETIME NULL,
        applied_date DATETIME NULL,
        metadata TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_apps_user (user_id),
        INDEX idx_apps_scheme (scheme_id),
        INDEX idx_apps_status (status),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE SET NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS user_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_id VARCHAR(100) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NULL,
        file_size INT NULL,
        mime_type VARCHAR(100) NULL,
        verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        metadata TEXT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_docs_user (user_id),
        INDEX idx_user_docs_type (user_id, document_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """
]


def init_database():
    """Initializes tables, triggers, and runs non-destructive schema migrations."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        is_sqlite = isinstance(conn, SQLiteConnectionWrapper)
        if is_sqlite:
            for ddl in SQLITE_TABLE_DDLS:
                cursor.execute(ddl)
            for trigger in SQLITE_TRIGGER_DDLS:
                cursor.execute(trigger)
        else:
            for ddl in MYSQL_TABLE_DDLS:
                cursor.execute(ddl)
        conn.commit()

        # Non-destructive migrations for existing users table
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE")
            conn.commit()
        except Exception:
            pass  # Column already exists

        db_type = "SQLite" if is_sqlite else "MySQL"
        print(f"[startup] [OK] {db_type} tables and triggers initialized successfully.")
        
        # Trigger initial scheme ingestion if database is empty
        try:
            from app.services.scheme_ingestion_service import seed_schemes_if_empty
            seed_schemes_if_empty()
        except Exception as seed_err:
            print(f"[startup] [WARN] Scheme seeding deferred: {seed_err}")
            
    except Exception as e:
        print(f"[startup] [WARN] Could not initialize DB tables: {e}")
        raise
    finally:
        conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_database()
    except Exception as e:
        print(f"[startup] [WARN] Lifespan database init exception: {e}")
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
app.include_router(profile.router)
app.include_router(applications.router)
app.include_router(documents.router)
