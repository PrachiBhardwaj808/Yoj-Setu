-- ============================================================
-- docs/db/schema.sql
-- Yojsetu Database Schema — Production Reference
-- Relational Schema for MySQL / SQLite compatible architecture
-- 
-- Tables:
--   1. users
--   2. otp_verifications
--   3. schemes
--   4. scheme_rules
--   5. scheme_documents
--   6. citizen_profiles
--   7. applications
--   8. user_documents
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Table: users
-- Purpose: Primary authentication and identity table.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_phone (phone),
    INDEX idx_users_email (email)
);

-- ────────────────────────────────────────────────────────────
-- 2. Table: otp_verifications
-- Purpose: Verification records for phone authentication and registration.
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- 3. Table: schemes
-- Purpose: Government scheme catalog with core benefits and metadata.
-- ────────────────────────────────────────────────────────────
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_schemes_category (category),
    INDEX idx_schemes_state (state)
);

-- ────────────────────────────────────────────────────────────
-- 4. Table: scheme_rules
-- Purpose: Eligibility evaluation criteria for rules engine.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheme_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    field_value VARCHAR(255) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    raw_condition_text TEXT,
    INDEX idx_scheme_rules_scheme (scheme_id),
    FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────
-- 5. Table: scheme_documents
-- Purpose: Documents required for scheme applications.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheme_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    description TEXT,
    INDEX idx_scheme_docs_scheme (scheme_id),
    FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────
-- 6. Table: citizen_profiles
-- Purpose: Detailed citizen demographic, income, and family profile
--          used for personalized scheme eligibility computation.
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- 7. Table: applications
-- Purpose: Citizen application lifecycle tracking for schemes.
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- 8. Table: user_documents
-- Purpose: Citizen document metadata and verification statuses.
--          File contents are stored securely on disk/cloud storage.
-- ────────────────────────────────────────────────────────────
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
