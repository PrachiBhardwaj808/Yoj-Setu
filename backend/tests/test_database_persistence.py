# backend/tests/test_database_persistence.py
#
# Comprehensive test suite covering all 10 Database Persistence Requirements:
# 1. Database initialization
# 2. MySQL table creation syntax
# 3. SQLite table creation and triggers
# 4. Profile insertion and retrieval
# 5. Application insertion and retrieval
# 6. Document metadata insertion
# 7. Foreign key constraints
# 8. updated_at behavior
# 9. OTP expiry and resend cooldown (UTC & IST)
# 10. Multi-user data isolation

import os
import sys
import time
import sqlite3
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

# Ensure backend root is on path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app, init_database, SQLITE_TABLE_DDLS, SQLITE_TRIGGER_DDLS, MYSQL_TABLE_DDLS
from app.db import get_connection, SQLiteConnectionWrapper
from app.dao import user_dao, citizen_profile_dao, application_dao, user_document_dao, otp_dao, scheme_dao
from app.services import otp_service, auth_service
from app.services.otp_service import normalize_to_utc

# Ensure tables and triggers are initialized
init_database()

client = TestClient(app)


# ─── 1. DATABASE INITIALIZATION ───────────────────────────────────────────────
def test_1_database_initialization():
    """Verifies that all 8 required tables exist and existing scheme data is preserved."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        # Check table existence in SQLite or MySQL
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [r["name"] for r in cursor.fetchall()]

        required_tables = [
            "users", "otp_verifications", "schemes", "scheme_rules",
            "scheme_documents", "citizen_profiles", "applications", "user_documents"
        ]
        for tbl in required_tables:
            assert tbl in tables, f"Missing required table: {tbl}"

        # Verify existing schemes are preserved
        schemes = scheme_dao.get_all_schemes()
        assert len(schemes) >= 6, "Expected at least 6 seeded schemes to be preserved"
    finally:
        conn.close()


# ─── 2. MYSQL TABLE CREATION SYNTAX ───────────────────────────────────────────
def test_2_mysql_table_creation_syntax():
    """Verifies MySQL DDL syntax rules (INT AUTO_INCREMENT PRIMARY KEY, ON UPDATE CURRENT_TIMESTAMP, INDEXes)."""
    assert len(MYSQL_TABLE_DDLS) == 8, "Expected 8 MySQL table DDLs"
    
    for ddl in MYSQL_TABLE_DDLS:
        # Must not contain SQLite-specific AUTOINCREMENT
        assert "AUTOINCREMENT" not in ddl, "MySQL DDL must not contain SQLite AUTOINCREMENT"
        assert "AUTO_INCREMENT" in ddl or "INDEX" in ddl
        assert "CREATE TABLE IF NOT EXISTS" in ddl

    # Verify specific MySQL keywords in tables with timestamps
    timestamp_tables = [ddl for ddl in MYSQL_TABLE_DDLS if "updated_at" in ddl]
    for ddl in timestamp_tables:
        assert "ON UPDATE CURRENT_TIMESTAMP" in ddl, "MySQL updated_at column should include ON UPDATE CURRENT_TIMESTAMP"


# ─── 3. SQLITE TABLE CREATION & TRIGGERS ──────────────────────────────────────
def test_3_sqlite_table_creation_and_triggers():
    """Verifies in-memory SQLite table and trigger creation from defined DDLs."""
    mem_conn = sqlite3.connect(":memory:")
    mem_conn.execute("PRAGMA foreign_keys = ON;")
    
    for ddl in SQLITE_TABLE_DDLS:
        mem_conn.execute(ddl)
    for trig in SQLITE_TRIGGER_DDLS:
        mem_conn.execute(trig)
    mem_conn.commit()

    cur = mem_conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    created_tables = [r[0] for r in cur.fetchall()]
    assert "citizen_profiles" in created_tables
    assert "applications" in created_tables
    assert "user_documents" in created_tables

    cur.execute("SELECT name FROM sqlite_master WHERE type='trigger';")
    created_triggers = [r[0] for r in cur.fetchall()]
    assert "trg_users_updated_at" in created_triggers
    assert "trg_citizen_profiles_updated_at" in created_triggers
    assert "trg_applications_updated_at" in created_triggers
    assert "trg_user_documents_updated_at" in created_triggers
    mem_conn.close()


# ─── 4. PROFILE INSERTION AND RETRIEVAL ───────────────────────────────────────
def test_4_profile_insertion_and_retrieval():
    """Tests citizen profile creation, field types, raw_details serialization, and updates."""
    # Create distinct test user
    test_phone = f"+919988{int(time.time()) % 1000000:06d}"
    user = user_dao.create_user(
        full_name="Profile Test User",
        phone=test_phone,
        email=f"profile_{int(time.time())}@example.com",
        password_hash="testhash"
    )
    user_id = user["id"]

    try:
        profile_data = {
            "full_name": "Profile Test User",
            "state": "Maharashtra",
            "district": "Pune",
            "annual_income": 180000,
            "occupation": "Artisan",
            "education": "Graduate",
            "social_category": "OBC",
            "gender": "Female",
            "age": 29,
            "rural_urban": "Urban",
            "family_size": 4,
            "custom_scheme_preference": "weaving",
        }
        saved = citizen_profile_dao.upsert_profile(user_id, profile_data)
        assert saved is not None
        assert saved["user_id"] == user_id
        assert saved["state"] == "Maharashtra"
        assert saved["district"] == "Pune"
        assert float(saved["annual_income"]) == 180000.0
        assert saved["custom_scheme_preference"] == "weaving"

        # Update profile
        saved["annual_income"] = 220000
        saved["district"] = "Nashik"
        updated = citizen_profile_dao.upsert_profile(user_id, saved)
        assert float(updated["annual_income"]) == 220000.0
        assert updated["district"] == "Nashik"
    finally:
        citizen_profile_dao.delete_profile(user_id)
        user_dao.delete_user(user_id) if hasattr(user_dao, "delete_user") else None


# ─── 5. APPLICATION INSERTION AND RETRIEVAL ───────────────────────────────────
def test_5_application_insertion_and_retrieval():
    """Tests creating, fetching, updating status, and deleting scheme applications."""
    test_phone = f"+919977{int(time.time()) % 1000000:06d}"
    user = user_dao.create_user(
        full_name="Application Test User",
        phone=test_phone,
        email=f"app_{int(time.time())}@example.com",
        password_hash="testhash"
    )
    user_id = user["id"]

    try:
        app_record = application_dao.create_application(
            user_id=user_id,
            external_scheme_id="PM-KISAN",
            status="planning",
            metadata={"notes": "Awaiting document verification"}
        )
        assert app_record is not None
        assert app_record["user_id"] == user_id
        assert app_record["external_scheme_id"] == "PM-KISAN"
        assert app_record["status"] == "planning"
        assert app_record["metadata"]["notes"] == "Awaiting document verification"

        # Update status to applied_by_user
        app_id = app_record["application_id"]
        updated = application_dao.update_application_status(app_id, user_id, "applied_by_user")
        assert updated["status"] == "applied_by_user"
        assert updated["applied_date"] is not None

        # Fetch list
        apps = application_dao.get_applications_by_user_id(user_id)
        assert len(apps) == 1
        assert apps[0]["application_id"] == app_id
    finally:
        application_dao.delete_application(app_record["application_id"], user_id)


# ─── 6. DOCUMENT METADATA INSERTION ───────────────────────────────────────────
def test_6_document_metadata_insertion():
    """Tests document metadata storage without binary file contents in DB."""
    test_phone = f"+919966{int(time.time()) % 1000000:06d}"
    user = user_dao.create_user(
        full_name="Document Test User",
        phone=test_phone,
        email=f"doc_{int(time.time())}@example.com",
        password_hash="testhash"
    )
    user_id = user["id"]

    try:
        doc = user_document_dao.upsert_document_metadata(
            user_id=user_id,
            document_type="Aadhaar Card",
            document_name="aadhaar_front.pdf",
            file_path="/secure/uploads/users/aadhaar_front.pdf",
            file_size=245100,
            mime_type="application/pdf",
            verification_status="pending",
            metadata={"extracted_doc_number": "XXXX-XXXX-1234"}
        )
        assert doc is not None
        assert doc["user_id"] == user_id
        assert doc["document_type"] == "Aadhaar Card"
        assert doc["file_path"] == "/secure/uploads/users/aadhaar_front.pdf"
        assert doc["verification_status"] == "pending"

        # Update verification status
        updated = user_document_dao.update_document_status(doc["document_id"], user_id, "verified")
        assert updated["verification_status"] == "verified"

        # Fetch list
        docs = user_document_dao.get_documents_by_user_id(user_id)
        assert len(docs) == 1
        assert docs[0]["document_id"] == doc["document_id"]
    finally:
        user_document_dao.delete_document(doc["document_id"], user_id)


# ─── 7. FOREIGN KEY CONSTRAINTS ───────────────────────────────────────────────
def test_7_foreign_key_constraints():
    """Verifies that invalid user_id foreign keys are rejected and cascades work."""
    invalid_user_id = 99999999
    
    # Attempt inserting application with non-existent user_id
    with pytest.raises(Exception):
        application_dao.create_application(
            user_id=invalid_user_id,
            external_scheme_id="PM-KISAN",
            status="planning"
        )

    # Attempt inserting document with non-existent user_id
    with pytest.raises(Exception):
        user_document_dao.upsert_document_metadata(
            user_id=invalid_user_id,
            document_type="Income Certificate",
            document_name="income.pdf"
        )

    # Test CASCADE DELETE
    test_phone = f"+919955{int(time.time()) % 1000000:06d}"
    user = user_dao.create_user(
        full_name="Cascade User",
        phone=test_phone,
        email=f"cascade_{int(time.time())}@example.com",
        password_hash="testhash"
    )
    uid = user["id"]
    citizen_profile_dao.upsert_profile(uid, {"full_name": "Cascade User", "state": "Punjab"})
    app_rec = application_dao.create_application(uid, "PM-KISAN")
    doc_rec = user_document_dao.upsert_document_metadata(uid, "PAN Card", "pan.pdf")

    # Delete user from DB
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE id = %s", (uid,))
        conn.commit()
    finally:
        conn.close()

    # Verify children were cascaded
    assert citizen_profile_dao.get_profile_by_user_id(uid) is None
    assert len(application_dao.get_applications_by_user_id(uid)) == 0
    assert len(user_document_dao.get_documents_by_user_id(uid)) == 0


# ─── 8. UPDATED_AT BEHAVIOR ───────────────────────────────────────────────────
def test_8_updated_at_behavior():
    """Verifies that updated_at advances upon updating a profile record."""
    test_phone = f"+919944{int(time.time()) % 1000000:06d}"
    user = user_dao.create_user(
        full_name="Trigger User",
        phone=test_phone,
        email=f"trig_{int(time.time())}@example.com",
        password_hash="testhash"
    )
    uid = user["id"]

    try:
        p1 = citizen_profile_dao.upsert_profile(uid, {"full_name": "Trigger User", "state": "Goa"})
        t1 = p1["updated_at"]
        time.sleep(1.1)  # Advance clock past 1 second for DATETIME resolution

        p2 = citizen_profile_dao.upsert_profile(uid, {"full_name": "Trigger User Updated", "state": "Goa"})
        t2 = p2["updated_at"]

        # Parse timestamps and verify t2 >= t1
        dt1 = normalize_to_utc(t1)
        dt2 = normalize_to_utc(t2)
        assert dt2 > dt1, f"Expected updated_at to advance: {dt2} should be > {dt1}"
    finally:
        citizen_profile_dao.delete_profile(uid)


# ─── 9. OTP EXPIRY AND RESEND COOLDOWN (UTC & IST) ─────────────────────────────
def test_9_otp_expiry_and_resend_cooldown():
    """Tests OTP cooldown, expiry, and standardized UTC/IST timestamp conversions."""
    test_phone = f"+919811{int(time.time() * 1000) % 1000000:06d}"

    # 1. First OTP generation succeeds
    resp1 = otp_service.generate_and_send_otp(test_phone, purpose="REGISTER")
    assert resp1["expires_in"] == 300
    assert resp1["cooldown"] == 60

    # 2. Immediate second request triggers cooldown
    with pytest.raises(ValueError, match="Please wait .* seconds before requesting a new OTP"):
        otp_service.generate_and_send_otp(test_phone, purpose="REGISTER")

    # 3. Simulate IST timestamp from an Indian server (+05:30)
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    ist_clock_time = now_utc + timedelta(hours=5, minutes=30)
    normalized = normalize_to_utc(ist_clock_time)
    assert abs((normalized - now_utc).total_seconds()) < 2.0

    # 4. Expired OTP verification raises expiry error
    expired_time = now_utc - timedelta(minutes=10)
    otp_dao.insert_otp(
        phone=test_phone,
        otp_hash="expired_hash",
        purpose="LOGIN",
        expires_at=expired_time,
        created_at=expired_time - timedelta(minutes=5)
    )
    with pytest.raises(ValueError, match="This OTP has expired"):
        otp_service.verify_otp(test_phone, "123456", purpose="LOGIN")


# ─── 10. MULTI-USER DATA ISOLATION ────────────────────────────────────────────
def test_10_multi_user_data_isolation():
    """Verifies that User A and User B cannot read or modify each other's data."""
    # Create User A & User B
    phone_a = f"+919800{int(time.time()) % 1000000:06d}"
    phone_b = f"+919801{int(time.time()) % 1000000:06d}"
    user_a = user_dao.create_user("User A", phone_a, f"usera_{int(time.time())}@test.com", "hashA")
    user_b = user_dao.create_user("User B", phone_b, f"userb_{int(time.time())}@test.com", "hashB")

    token_a = auth_service.create_access_token({"sub": user_a["id"], "phone": user_a["phone"]})
    token_b = auth_service.create_access_token({"sub": user_b["id"], "phone": user_b["phone"]})

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    try:
        # User A saves profile
        res_a_prof = client.put("/profile/me", json={"full_name": "User A", "state": "Kerala", "annual_income": 300000}, headers=headers_a)
        assert res_a_prof.status_code == 200

        # User B fetches profile -> should NOT see User A's data
        res_b_prof = client.get("/profile/me", headers=headers_b)
        assert res_b_prof.status_code == 200
        assert res_b_prof.json()["state"] == ""

        # User A creates application
        res_a_app = client.post("/applications", json={"external_scheme_id": "PM-KISAN", "status": "planning"}, headers=headers_a)
        assert res_a_app.status_code == 201
        app_a_id = res_a_app.json()["application_id"]

        # User B cannot retrieve User A's application by ID
        res_b_app_get = client.get(f"/applications/{app_a_id}", headers=headers_b)
        assert res_b_app_get.status_code == 404

        # User B's application list does not contain User A's application
        res_b_apps = client.get("/applications", headers=headers_b)
        assert res_b_apps.status_code == 200
        assert len(res_b_apps.json()) == 0

        # User A uploads document metadata
        res_a_doc = client.post("/documents", json={
            "document_type": "Electricity Bill",
            "document_name": "bill.pdf",
            "verification_status": "pending"
        }, headers=headers_a)
        assert res_a_doc.status_code == 201
        doc_a_id = res_a_doc.json()["document_id"]

        # User B cannot access User A's document
        res_b_doc_get = client.get(f"/documents/{doc_a_id}", headers=headers_b)
        assert res_b_doc_get.status_code == 404

        # User B's documents list is empty
        res_b_docs = client.get("/documents", headers=headers_b)
        assert len(res_b_docs.json()) == 0
    finally:
        citizen_profile_dao.delete_profile(user_a["id"])
        citizen_profile_dao.delete_profile(user_b["id"])
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM users WHERE id IN (%s, %s)", (user_a["id"], user_b["id"]))
            conn.commit()
        finally:
            conn.close()
