-- ============================================================
-- docs/db/schema.sql
-- Yojsetu Database Schema — living document
-- Add new tables below; never remove existing entries.
-- Run each statement in MySQL Workbench or via the mysql CLI:
--   mysql -u root -p yojsetu_db < docs/db/schema.sql
-- All statements are idempotent (IF NOT EXISTS) so re-running is safe.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- Table: otp_verifications
-- Purpose: Staging table for phone number verification during
--          registration. A user account does NOT exist yet at
--          this point in the flow — this table records that we
--          sent a code to a given number, and whether it was
--          successfully verified.
-- Added: 2026-09 (FastAPI backend rebuild)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_verifications (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(15)  NOT NULL,
    otp_code     VARCHAR(6)   NOT NULL,
    expires_at   DATETIME     NOT NULL,
    verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);
