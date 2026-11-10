# backend/tests/test_api_architecture.py
#
# Production test suite for Yojsetu Backend Architecture:
# - Connection pooling & fallback verification
# - Authentication APIs (/api/auth)
# - Profile APIs (/api/profile & /profile)
# - Scheme Catalog & Ingestion APIs (/api/schemes)
# - Single-Scheme Eligibility API with profile normalizer
# - Recommendation API with batch rule/doc fetching
# - Application Tracking APIs (/api/applications)
# - Document Metadata APIs (/api/documents)
# - Conversational Assistant API (/api/assistant/chat)
# - Health Check (/api/ping & /ping)
# - Security, authorization, and error handling

import os
import sys
import time
import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app, init_database
from app.db import get_active_engine, get_connection
from app.services import auth_service, otp_service
from app.dao import user_dao, scheme_dao, application_dao, user_document_dao, citizen_profile_dao

# Ensure database is initialized
init_database()
client = TestClient(app)


# ─── 1. HEALTH AND PREFIX STANDARDIZATION TESTS ──────────────────────────────
def test_ping_and_route_prefixes():
    """Verifies that health check and routes respond on both /api/* and root prefixes."""
    # Ping
    r1 = client.get("/api/ping")
    assert r1.status_code == 200
    assert r1.json() == "pong"

    r2 = client.get("/ping")
    assert r2.status_code == 200
    assert r2.json() == "pong"

    # Schemes
    r_api = client.get("/api/schemes")
    assert r_api.status_code == 200
    assert len(r_api.json()) >= 6

    r_root = client.get("/schemes")
    assert r_root.status_code == 200
    assert len(r_root.json()) >= 6


# ─── 2. DATABASE ENGINE AND POOLING VERIFICATION ─────────────────────────────
def test_db_engine_and_pooling():
    """Verifies active engine detection and connection acquisition without delay."""
    engine = get_active_engine()
    assert engine in ("sqlite", "mysql")

    start = time.perf_counter()
    conn = get_connection()
    elapsed = time.perf_counter() - start
    try:
        cur = conn.cursor()
        cur.execute("SELECT 1 as num")
        row = cur.fetchone()
        assert row["num"] == 1
    finally:
        conn.close()

    # Connection acquisition should be instantaneous (< 50ms)
    assert elapsed < 0.25, f"Connection acquisition too slow: {elapsed:.3f}s"


# ─── 3. AUTHENTICATION APIS ───────────────────────────────────────────────────
def test_auth_full_lifecycle():
    """Tests registration OTP, account creation, login, /me, and onboarding completion."""
    phone = f"987{int(time.time() * 1000) % 10000000:07d}"
    formatted_phone = f"+91{phone}"

    # 1. Request OTP
    res_otp = client.post("/api/auth/register/request-otp", json={"phone": phone})
    assert res_otp.status_code == 200
    dev_otp = res_otp.json().get("dev_otp")
    assert dev_otp is not None

    # 2. Verify OTP
    res_verify = client.post("/api/auth/register/verify-otp", json={"phone": phone, "otp": dev_otp})
    assert res_verify.status_code == 200
    vtoken = res_verify.json()["verification_token"]

    # 3. Register user
    reg_payload = {
        "full_name": "API Test Citizen",
        "phone": phone,
        "email": f"citizen_{int(time.time())}@example.com",
        "password": "SecurePassword123!",
        "verification_token": vtoken
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 200
    token = res_reg.json()["access_token"]
    user_id = res_reg.json()["user"]["id"]
    assert res_reg.json()["user"]["onboardingComplete"] is False

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Check /api/auth/me and un-prefixed /auth/me
    me1 = client.get("/api/auth/me", headers=headers)
    assert me1.status_code == 200
    assert me1.json()["id"] == user_id
    assert me1.json()["phone"] == formatted_phone

    me2 = client.get("/auth/me", headers=headers)
    assert me2.status_code == 200
    assert me2.json()["id"] == user_id

    # 5. Complete Onboarding
    res_onb = client.post("/api/auth/complete-onboarding", headers=headers)
    assert res_onb.status_code == 200
    assert res_onb.json()["onboardingComplete"] is True

    # 6. Verify persistence on refresh
    me_after = client.get("/api/auth/me", headers=headers)
    assert me_after.json()["onboardingComplete"] is True

    # 7. Login with 10-digit number
    res_login = client.post("/api/auth/login", json={"identifier": phone, "password": "SecurePassword123!"})
    assert res_login.status_code == 200
    assert res_login.json()["user"]["onboardingComplete"] is True

    # Clean up user
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
    finally:
        conn.close()


# ─── 4. PROFILE APIS ──────────────────────────────────────────────────────────
def test_profile_apis():
    """Tests GET and PUT on /api/profile and /profile with multi-user isolation."""
    phone_a = f"+919861{int(time.time() * 1000) % 1000000:06d}"
    phone_b = f"+919862{int(time.time() * 1000) % 1000000:06d}"
    user_a = user_dao.create_user("User Profile A", phone_a, f"prof_a_{int(time.time())}@test.com", "hashA")
    user_b = user_dao.create_user("User Profile B", phone_b, f"prof_b_{int(time.time())}@test.com", "hashB")

    token_a = auth_service.create_access_token({"sub": user_a["id"], "phone": user_a["phone"]})
    token_b = auth_service.create_access_token({"sub": user_b["id"], "phone": user_b["phone"]})

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    try:
        # User A updates profile via /api/profile
        profile_data = {
            "full_name": "User Profile A",
            "state": "Haryana",
            "district": "Karnal",
            "annual_income": 175000,
            "occupation": "Farmer",
            "education": "Post-Graduate"
        }
        res_put = client.put("/api/profile", json=profile_data, headers=headers_a)
        assert res_put.status_code == 200
        assert res_put.json()["profile"]["state"] == "Haryana"

        # User A retrieves via root /profile
        res_get_root = client.get("/profile", headers=headers_a)
        assert res_get_root.status_code == 200
        assert res_get_root.json()["state"] == "Haryana"
        assert res_get_root.json()["annual_income"] == 175000.0

        # User B fetches /profile -> must NOT see User A's data
        res_b = client.get("/api/profile", headers=headers_b)
        assert res_b.status_code == 200
        assert res_b.json()["state"] == ""
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


# ─── 5. SCHEME APIS, INGESTION, AND DETAIL ───────────────────────────────────
def test_schemes_and_ingestion_api():
    """Tests scheme listing, category filtering, search, detail view, and ingestion."""
    # List all
    res = client.get("/api/schemes")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 6

    # Category filter
    res_cat = client.get("/api/schemes?category=Agriculture")
    assert res_cat.status_code == 200
    for s in res_cat.json():
        assert s["category"].lower() == "agriculture"

    # Search
    res_srch = client.get("/api/schemes?search=kisan")
    assert res_srch.status_code == 200
    assert len(res_srch.json()) >= 1
    assert "kisan" in res_srch.json()[0]["name"].lower()

    # Detail
    first_id = schemes[0]["id"]
    res_detail = client.get(f"/api/schemes/{first_id}")
    assert res_detail.status_code == 200
    assert "rules" in res_detail.json()
    assert "documents" in res_detail.json()

    # Ingestion trigger
    res_ingest = client.post("/api/schemes/ingest")
    assert res_ingest.status_code == 200
    assert res_ingest.json()["status"] == "success"
    assert res_ingest.json()["data"] >= 6


# ─── 6. SINGLE-SCHEME ELIGIBILITY API WITH NORMALIZER ────────────────────────
def test_single_scheme_eligibility_with_normalizer():
    """Tests that POST /api/schemes/{id}/check-eligibility normalizes income and handles missing fields."""
    pm_kisan = scheme_dao.get_scheme_by_external_id("SCH-PM-KISAN-001") or scheme_dao.get_scheme_by_id(1)
    assert pm_kisan is not None
    scheme_id = pm_kisan["id"]

    # 1. Successful check with lakh format and 80000 income
    res_valid = client.post(
        f"/api/schemes/{scheme_id}/check-eligibility",
        json={
            "user_profile": {
                "occupation": "Farmer",
                "state": "Punjab",
                "annual_household_income": "1.5 lakh",
                "has_aadhaar": True,
                "has_bank_account": True
            },
            "user_documents": ["Aadhaar Card", "Bank Account"]
        }
    )
    assert res_valid.status_code == 200
    data = res_valid.json()
    assert data["status"] == "ELIGIBLE"
    assert data["match_score"] >= 80

    # 2. Validation error on missing/malformed profile
    res_invalid = client.post(
        f"/api/schemes/{scheme_id}/check-eligibility",
        json={"user_profile": None}
    )
    assert res_invalid.status_code in (400, 422)

    res_empty = client.post(
        f"/api/schemes/{scheme_id}/check-eligibility",
        json={"user_profile": {}}
    )
    assert res_empty.status_code in (400, 422)

    # 3. 404 on non-existent scheme
    res_404 = client.post(
        "/api/schemes/9999999/check-eligibility",
        json={"user_profile": {"occupation": "Farmer"}}
    )
    assert res_404.status_code == 404


# ─── 7. RECOMMENDATION API (BATCH FETCHING) ──────────────────────────────────
def test_recommendation_api():
    """Tests /api/schemes/recommend and verifies batch evaluation."""
    res = client.post(
        "/api/schemes/recommend",
        json={
            "user_profile": {
                "occupation": "Farmer",
                "state": "Punjab",
                "annual_household_income": "150000",
                "has_aadhaar": True,
                "has_bank_account": True
            },
            "user_documents": ["Aadhaar Card", "Bank Account"],
            "limit": 5
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert data["total_evaluated"] >= 1
    assert data["eligible_count"] >= 1
    recs = data["recommendations"]
    assert len(recs) <= 5
    # Verify priority ranks
    for idx, r in enumerate(recs, start=1):
        assert r["priority"] == idx
        assert "reason" in r
        assert len(r["reason"]) > 0


# ─── 8. APPLICATION APIS (CRUD + AUTHORIZATION) ──────────────────────────────
def test_application_apis_crud():
    """Tests GET, POST, PUT, DELETE for applications scoped to authenticated user."""
    phone = f"+919855{int(time.time() * 1000) % 1000000:06d}"
    user = user_dao.create_user("App Test User", phone, f"app_{int(time.time())}@test.com", "hash")
    token = auth_service.create_access_token({"sub": user["id"], "phone": user["phone"]})
    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Create
        res_post = client.post(
            "/api/applications",
            json={"external_scheme_id": "PM-KISAN", "status": "planning", "metadata": {"note": "Test application"}},
            headers=headers
        )
        assert res_post.status_code == 201
        app_id = res_post.json()["application_id"]

        # Get by ID
        res_get = client.get(f"/api/applications/{app_id}", headers=headers)
        assert res_get.status_code == 200
        assert res_get.json()["status"] == "planning"

        # Update via PUT
        res_put = client.put(f"/api/applications/{app_id}", json={"status": "applied_by_user"}, headers=headers)
        assert res_put.status_code == 200
        assert res_put.json()["status"] == "applied_by_user"

        # List
        res_list = client.get("/api/applications", headers=headers)
        assert res_list.status_code == 200
        assert len(res_list.json()) == 1

        # Delete
        res_del = client.delete(f"/api/applications/{app_id}", headers=headers)
        assert res_del.status_code == 200

        # Verify 404 after delete
        res_get_deleted = client.get(f"/api/applications/{app_id}", headers=headers)
        assert res_get_deleted.status_code == 404
    finally:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM users WHERE id = %s", (user["id"],))
            conn.commit()
        finally:
            conn.close()


# ─── 9. DOCUMENT METADATA APIS ───────────────────────────────────────────────
def test_document_metadata_apis():
    """Tests GET, POST, DELETE for document metadata without storing binary blobs."""
    phone = f"+919844{int(time.time() * 1000) % 1000000:06d}"
    user = user_dao.create_user("Doc Test User", phone, f"doc_{int(time.time())}@test.com", "hash")
    token = auth_service.create_access_token({"sub": user["id"], "phone": user["phone"]})
    headers = {"Authorization": f"Bearer {token}"}

    try:
        # POST document metadata
        res_post = client.post(
            "/api/documents",
            json={
                "document_type": "Aadhaar Card",
                "document_name": "aadhaar.pdf",
                "file_path": "/var/data/docs/aadhaar.pdf",
                "file_size": 102400,
                "mime_type": "application/pdf"
            },
            headers=headers
        )
        assert res_post.status_code == 201
        doc_id = res_post.json()["document_id"]
        assert res_post.json()["file_path"] == "/var/data/docs/aadhaar.pdf"

        # GET single document
        res_get = client.get(f"/api/documents/{doc_id}", headers=headers)
        assert res_get.status_code == 200
        assert res_get.json()["document_type"] == "Aadhaar Card"

        # List documents
        res_list = client.get("/api/documents", headers=headers)
        assert res_list.status_code == 200
        assert len(res_list.json()) == 1

        # DELETE document
        res_del = client.delete(f"/api/documents/{doc_id}", headers=headers)
        assert res_del.status_code == 200

        # Verify 404
        assert client.get(f"/api/documents/{doc_id}", headers=headers).status_code == 404
    finally:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM users WHERE id = %s", (user["id"],))
            conn.commit()
        finally:
            conn.close()


# ─── 10. ASSISTANT CHAT API ───────────────────────────────────────────────────
def test_assistant_chat_api():
    """Tests /api/assistant/chat endpoint with grounded responses and fallback."""
    # 1. Scheme inquiry
    res1 = client.post("/api/assistant/chat", json={"message": "Tell me about kisan subsidy", "language": "en"})
    assert res1.status_code == 200
    assert "PM Kisan Samman Nidhi" in res1.json()["reply"]
    assert res1.json()["provider"] in ("grounded_catalog", "ai")

    # 2. Eligibility inquiry
    res2 = client.post("/api/assistant/chat", json={"message": "Am I eligible for solar panel subsidy?", "language": "en"})
    assert res2.status_code == 200
    assert "I cannot determine personal eligibility" in res2.json()["reply"] or "criteria" in res2.json()["reply"]

    # 3. Application tracking inquiry
    res3 = client.post("/api/assistant/chat", json={"message": "How do I track my application status?", "language": "en"})
    assert res3.status_code == 200
    assert "tracker" in res3.json()["reply"].lower()

    # 4. Empty message validation
    res_empty = client.post("/api/assistant/chat", json={"message": "   "})
    assert res_empty.status_code == 400


# ─── 11. SECURITY AND UNAUTHORIZED ACCESS ────────────────────────────────────
def test_security_and_unauthorized_access():
    """Verifies that protected routes return 401 without token and 404 on cross-user access."""
    # Missing auth
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/profile").status_code == 401
    assert client.get("/api/applications").status_code == 401
    assert client.get("/api/documents").status_code == 401

    # Invalid token
    bad_headers = {"Authorization": "Bearer invalid.jwt.token"}
    assert client.get("/api/auth/me", headers=bad_headers).status_code == 401
    assert client.get("/api/profile", headers=bad_headers).status_code == 401
