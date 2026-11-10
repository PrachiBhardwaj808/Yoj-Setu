# backend/tests/test_fixes.py
#
# Comprehensive tests verifying fixes for:
# 1. Registration with a 10-digit Indian mobile number
# 2. Login using the same 10-digit number
# 3. Email login
# 4. Onboarding completion followed by page refresh and re-login
# 5. Eligibility with failed optional rules
# 6. Eligibility with failed mandatory rules
# 7. Income parsing (80000, 150000, 200000, lakh formats, safe fallbacks)
# 8. Aadhaar and Electricity Bill document mapping
# 9. Recommendation and check-eligibility endpoints integration

import pytest
from fastapi.testclient import TestClient
import sys
import os
import uuid

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from app.services.profile_normalizer import parse_income_range, normalize_profile
from app.services.eligibility_engine import evaluate_eligibility, EligibilityEngine
from app.services.otp_service import format_phone
from app.dao import user_dao

client = TestClient(app)


# ─── 1. REGISTRATION WITH 10-DIGIT INDIAN NUMBER ──────────────────────────────

def test_1_registration_with_10_digit_indian_number():
    """
    1. Test registration with a 10-digit Indian mobile number.
    Ensures:
    - 10-digit number is accepted.
    - Number is normalized to E.164 (+91XXXXXXXXXX).
    - Database stores normalized phone number.
    - Response contains normalized phone and onboardingComplete=False.
    """
    mobile_10 = f"98{str(uuid.uuid4().int)[:8]}"
    full_name = "Ramesh Patel"
    email = f"ramesh_{mobile_10}@example.com"
    password = "StrongPassword@2026"

    # Request OTP with 10-digit number
    req_otp = client.post("/auth/register/request-otp", json={"phone": mobile_10})
    assert req_otp.status_code == 200, req_otp.text
    dev_otp = req_otp.json().get("dev_otp")
    assert dev_otp, "Development OTP must be provided"

    # Verify OTP
    verify_otp = client.post("/auth/register/verify-otp", json={
        "phone": mobile_10,
        "otp": dev_otp
    })
    assert verify_otp.status_code == 200, verify_otp.text
    v_token = verify_otp.json().get("verification_token")
    assert v_token

    # Complete registration
    reg = client.post("/auth/register", json={
        "full_name": full_name,
        "phone": mobile_10,
        "email": email,
        "password": password,
        "verification_token": v_token
    })
    assert reg.status_code == 200, reg.text
    user_data = reg.json()["user"]
    assert user_data["phone"] == f"+91{mobile_10}"
    assert user_data["onboardingComplete"] is False
    assert user_data["onboarding_complete"] is False

    # Confirm normalized in DB
    db_rec = user_dao.get_user_by_phone(mobile_10)
    assert db_rec is not None
    assert db_rec["phone"] == f"+91{mobile_10}"


# ─── 2. LOGIN WITH 10-DIGIT NUMBER ────────────────────────────────────────────

def test_2_login_using_same_10_digit_number():
    """
    2. Test login using the same 10-digit number (and international format).
    Ensures:
    - Login succeeds with raw 10-digit string.
    - Login succeeds with +91 E.164 formatted string.
    - Database lookup properly finds user despite registration formatting.
    """
    mobile_10 = f"99{str(uuid.uuid4().int)[:8]}"
    full_name = "Sunita Devi"
    email = f"sunita_{mobile_10}@example.com"
    password = "SunitaPassword!2026"

    # Register user
    req_otp = client.post("/auth/register/request-otp", json={"phone": mobile_10})
    dev_otp = req_otp.json().get("dev_otp")
    verify_otp = client.post("/auth/register/verify-otp", json={"phone": mobile_10, "otp": dev_otp})
    v_token = verify_otp.json()["verification_token"]
    reg = client.post("/auth/register", json={
        "full_name": full_name,
        "phone": mobile_10,
        "email": email,
        "password": password,
        "verification_token": v_token
    })
    assert reg.status_code == 200

    # Login with 10-digit number
    login_res = client.post("/auth/login", json={
        "identifier": mobile_10,
        "password": password
    })
    assert login_res.status_code == 200, login_res.text
    assert login_res.json()["access_token"]
    assert login_res.json()["user"]["phone"] == f"+91{mobile_10}"

    # Login with +91 format
    login_e164 = client.post("/auth/login", json={
        "identifier": f"+91{mobile_10}",
        "password": password
    })
    assert login_e164.status_code == 200, login_e164.text
    assert login_e164.json()["access_token"]


# ─── 3. EMAIL LOGIN ────────────────────────────────────────────────────────────

def test_3_email_login():
    """
    3. Test email login without breaking identifier resolution.
    """
    mobile_10 = f"97{str(uuid.uuid4().int)[:8]}"
    email = f"vikram_{mobile_10}@yojsetu.gov.in"
    password = "VikramSecure#2026"

    req_otp = client.post("/auth/register/request-otp", json={"phone": mobile_10})
    dev_otp = req_otp.json().get("dev_otp")
    verify_otp = client.post("/auth/register/verify-otp", json={"phone": mobile_10, "otp": dev_otp})
    v_token = verify_otp.json()["verification_token"]
    reg = client.post("/auth/register", json={
        "full_name": "Vikram Singh",
        "phone": mobile_10,
        "email": email,
        "password": password,
        "verification_token": v_token
    })
    assert reg.status_code == 200

    # Login with email
    login_res = client.post("/auth/login", json={
        "identifier": email,
        "password": password
    })
    assert login_res.status_code == 200, login_res.text
    res_data = login_res.json()
    assert res_data["access_token"]
    assert res_data["user"]["email"] == email


# ─── 4. ONBOARDING COMPLETION AND REFRESH PERSISTENCE ─────────────────────────

def test_4_onboarding_completion_followed_by_page_refresh():
    """
    4. Test onboarding completion followed by page refresh.
    - Initial login returns onboardingComplete=False.
    - POST /auth/complete-onboarding updates database.
    - Subsequent GET /auth/me (page refresh) retains onboardingComplete=True.
    - Re-login retains onboardingComplete=True.
    - Prevents repeated redirect loop to /onboarding.
    """
    mobile_10 = f"96{str(uuid.uuid4().int)[:8]}"
    email = f"anita_{mobile_10}@yojsetu.in"
    password = "AnitaPassword!123"

    req_otp = client.post("/auth/register/request-otp", json={"phone": mobile_10})
    dev_otp = req_otp.json().get("dev_otp")
    verify_otp = client.post("/auth/register/verify-otp", json={"phone": mobile_10, "otp": dev_otp})
    v_token = verify_otp.json()["verification_token"]
    client.post("/auth/register", json={
        "full_name": "Anita Verma",
        "phone": mobile_10,
        "email": email,
        "password": password,
        "verification_token": v_token
    })

    # Step A: Login before onboarding
    login_before = client.post("/auth/login", json={"identifier": mobile_10, "password": password})
    assert login_before.status_code == 200
    token = login_before.json()["access_token"]
    assert login_before.json()["user"]["onboardingComplete"] is False
    assert login_before.json()["user"]["onboarding_complete"] is False

    headers = {"Authorization": f"Bearer {token}"}

    # Step B: Check /auth/me before completion
    me_before = client.get("/auth/me", headers=headers)
    assert me_before.status_code == 200
    assert me_before.json()["onboardingComplete"] is False
    assert me_before.json()["onboarding_complete"] is False

    # Step C: Complete Onboarding via API
    comp_res = client.post("/auth/complete-onboarding", headers=headers)
    assert comp_res.status_code == 200, comp_res.text
    assert comp_res.json()["onboardingComplete"] is True
    assert comp_res.json()["onboarding_complete"] is True

    # Step D: Page refresh simulation (GET /auth/me with existing token)
    me_refresh = client.get("/auth/me", headers=headers)
    assert me_refresh.status_code == 200
    assert me_refresh.json()["onboardingComplete"] is True, "Must persist after page refresh"
    assert me_refresh.json()["onboarding_complete"] is True

    # Step E: Re-login simulation (fresh login session)
    relogin = client.post("/auth/login", json={"identifier": email, "password": password})
    assert relogin.status_code == 200
    assert relogin.json()["user"]["onboardingComplete"] is True, "Must persist on re-login"
    assert relogin.json()["user"]["onboarding_complete"] is True


# ─── 5. ELIGIBILITY WITH FAILED OPTIONAL RULES ────────────────────────────────

def test_5_eligibility_with_failed_optional_rules():
    """
    5. Test eligibility with failed optional rules.
    - Optional rules (is_mandatory=False) must not automatically disqualify users.
    - User must be evaluated as ELIGIBLE.
    - Failed condition must be distinguished into failed_optional_conditions.
    """
    scheme = {
        "id": 201,
        "external_scheme_id": "TEST-SCHEME-AYUSHMAN",
        "name": "Ayushman Bharat PM-JAY",
        "category": "Health",
        "benefits": "₹5 Lakhs health cover",
        "state": "All India"
    }
    rules = [
        # Mandatory: income under 5 Lakhs
        {
            "field_name": "annual_household_income",
            "operator": "<=",
            "field_value": "500000",
            "is_mandatory": True,
            "raw_text": "Annual household income under ₹5,00,000"
        },
        # Optional: BPL or priority household
        {
            "field_name": "bpl_status",
            "operator": "IN",
            "field_value": "Yes,Not sure",
            "is_mandatory": False,
            "raw_text": "BPL or SECC 2011 priority household list"
        }
    ]
    documents = [
        {"document_name": "Aadhaar Card", "is_mandatory": True}
    ]

    # User profile: income passes, bpl_status fails (No)
    profile = {
        "annual_household_income": 150000,
        "bpl_status": "No",
        "has_aadhaar": "Yes",
        "state": "Punjab"
    }

    result = evaluate_eligibility(scheme, rules, documents, profile)

    assert result["status"] == "ELIGIBLE", f"Expected ELIGIBLE despite optional rule failure, got {result['status']}"
    assert len(result["failed_mandatory_conditions"]) == 0
    assert len(result["failed_optional_conditions"]) == 1
    assert result["failed_optional_conditions"][0]["field"] == "bpl_status"
    assert result["failed_optional_conditions"][0]["is_mandatory"] is False
    assert result["match_score"] >= 75


# ─── 6. ELIGIBILITY WITH FAILED MANDATORY RULES ───────────────────────────────

def test_6_eligibility_with_failed_mandatory_rules():
    """
    6. Test eligibility with failed mandatory rules.
    - Only failed mandatory conditions should result in NOT_ELIGIBLE.
    """
    scheme = {
        "id": 202,
        "external_scheme_id": "TEST-SCHEME-PM-KISAN",
        "name": "PM Kisan Samman Nidhi",
        "category": "Agriculture",
        "benefits": "₹6,000 / year",
        "state": "All India"
    }
    rules = [
        # Mandatory: occupation must be Farmer or Agricultural worker
        {
            "field_name": "occupation",
            "operator": "IN",
            "field_value": "Farmer,Agricultural worker",
            "is_mandatory": True,
            "raw_text": "Must be a landholding farmer or agricultural worker"
        },
        # Mandatory: income <= 800,000
        {
            "field_name": "annual_household_income",
            "operator": "<=",
            "field_value": "800000",
            "is_mandatory": True,
            "raw_text": "Annual household income below ₹8,00,000"
        }
    ]
    documents = [
        {"document_name": "Aadhaar Card", "is_mandatory": True}
    ]

    # User is a Teacher (fails mandatory occupation)
    profile = {
        "occupation": "Teacher",
        "annual_household_income": 200000,
        "has_aadhaar": "Yes",
        "state": "Uttar Pradesh"
    }

    result = evaluate_eligibility(scheme, rules, documents, profile)

    assert result["status"] == "NOT_ELIGIBLE", f"Expected NOT_ELIGIBLE, got {result['status']}"
    assert len(result["failed_mandatory_conditions"]) == 1
    assert result["failed_mandatory_conditions"][0]["field"] == "occupation"
    assert result["failed_mandatory_conditions"][0]["is_mandatory"] is True


# ─── 7. INCOME VALUES: 80000, 150000, 200000 ──────────────────────────────────

def test_7_income_values_80000_150000_200000_and_formats():
    """
    7. Test income values: 80000, 150000, 200000.
    Ensures:
    - Numeric values do NOT fall back to 500,000.
    - Exact numeric income values parse correctly.
    - Common formats (1.5 lakh, 2 lakh, below 1 lakh) parse correctly.
    - Empty and invalid values are handled safely (return None).
    - Income comparisons in eligibility engine use normalized numeric values.
    """
    # 1. Exact numeric values: 80000, 150000, 200000
    assert parse_income_range(80000) == 80000.0
    assert parse_income_range("80000") == 80000.0
    assert parse_income_range(150000) == 150000.0
    assert parse_income_range("150000") == 150000.0
    assert parse_income_range(200000) == 200000.0
    assert parse_income_range("200000") == 200000.0

    # 2. Lakh and threshold formats
    assert parse_income_range("1.5 lakh") == 150000.0
    assert parse_income_range("1.5 lac") == 150000.0
    assert parse_income_range("2 lakh") == 200000.0
    assert parse_income_range("2.5 lakh") == 250000.0
    assert parse_income_range("below 1 lakh") == 100000.0
    assert parse_income_range("Below ₹1 lakh") == 100000.0
    assert parse_income_range("₹1–2.5 lakh") == 250000.0
    assert parse_income_range("₹2.5–5 lakh") == 500000.0
    assert parse_income_range("Above ₹10 lakh") == 1500000.0

    # 3. Currency symbols & commas
    assert parse_income_range("₹ 80,000") == 80000.0
    assert parse_income_range("₹1,50,000") == 150000.0
    assert parse_income_range("2,00,000") == 200000.0

    # 4. Safe handling of invalid, empty, zero
    assert parse_income_range("") is None
    assert parse_income_range("   ") is None
    assert parse_income_range(None) is None
    assert parse_income_range("Prefer not to say") is None
    assert parse_income_range("Not specified") is None
    assert parse_income_range("invalid_string") is None
    assert parse_income_range(0) == 0.0
    assert parse_income_range("0") == 0.0

    # 5. Verify income comparison in eligibility engine
    # A scheme requiring income <= 250000 (Post-Matric Scholarship)
    scheme = {
        "id": 203,
        "external_scheme_id": "TEST-SCHEME-POST-MATRIC",
        "name": "Post-Matric Scholarship",
        "category": "Education",
        "benefits": "Tuition Reimbursement",
        "state": "All India"
    }
    rules = [
        {"field_name": "annual_household_income", "operator": "<=", "field_value": "250000", "is_mandatory": True}
    ]
    documents = [{"document_name": "Aadhaar Card", "is_mandatory": True}]

    # Incomes 80000, 150000, 200000 must ALL qualify!
    test_incomes = [80000, "80000", 150000, "150000", "1.5 lakh", 200000, "2 lakh", "₹ 2,00,000"]
    for inc in test_incomes:
        norm_profile = normalize_profile({"annual_household_income": inc, "has_aadhaar": "Yes"})
        res = evaluate_eligibility(scheme, rules, documents, norm_profile)
        assert res["status"] == "ELIGIBLE", f"Income {inc} should be ELIGIBLE (<= 250,000), but got {res['status']}"
        assert res["passed_conditions"][0]["field"] == "annual_household_income"

    # Higher income (e.g. 300000) must fail
    norm_profile_high = normalize_profile({"annual_household_income": 300000, "has_aadhaar": "Yes"})
    res_high = evaluate_eligibility(scheme, rules, documents, norm_profile_high)
    assert res_high["status"] == "NOT_ELIGIBLE"


# ─── 8. AADHAAR AND ELECTRICITY BILL DOCUMENT MAPPING ─────────────────────────

def test_8_aadhaar_and_electricity_bill_document_mapping():
    """
    8. Test Aadhaar and Electricity Bill document mapping.
    Required mappings:
    - Aadhaar -> Aadhaar Card
    - Electricity Bill -> Electricity Bill
    Ensure document names from scheme definitions correctly map to citizen profile fields.
    Aadhaar must not be marked missing when the user has confirmed its availability.
    """
    scheme = {
        "id": 204,
        "external_scheme_id": "TEST-SCHEME-SURYA-GHAR",
        "name": "PM Surya Ghar: Muft Bijli Yojana",
        "category": "Housing & Solar",
        "benefits": "Subsidy up to ₹78,000",
        "state": "All India"
    }
    rules = [
        {"field_name": "housing_status", "operator": "IN", "field_value": "Own house,Government housing", "is_mandatory": True}
    ]
    documents = [
        {"document_name": "Aadhaar Card", "is_mandatory": True},
        {"document_name": "Electricity Bill", "is_mandatory": True}
    ]

    # Scenario 1: User confirmed availability via string "Yes"
    profile_1 = {
        "housing_status": "Own house",
        "has_aadhaar": "Yes",
        "has_electricity_bill": "Yes"
    }
    norm_1 = normalize_profile(profile_1)
    res_1 = evaluate_eligibility(scheme, rules, documents, norm_1)
    doc_map_1 = {d["name"]: d for d in res_1["documents"]}

    assert doc_map_1["Aadhaar Card"]["status"] == "AVAILABLE"
    assert doc_map_1["Aadhaar Card"]["is_available"] is True
    assert doc_map_1["Electricity Bill"]["status"] == "AVAILABLE"
    assert doc_map_1["Electricity Bill"]["is_available"] is True
    assert res_1["document_readiness_score"] == 100

    # Scenario 2: User confirmed availability via boolean True
    profile_2 = {
        "housing_status": "Own house",
        "has_aadhaar": True,
        "has_electricity_bill": True
    }
    norm_2 = normalize_profile(profile_2)
    res_2 = evaluate_eligibility(scheme, rules, documents, norm_2)
    doc_map_2 = {d["name"]: d for d in res_2["documents"]}

    assert doc_map_2["Aadhaar Card"]["status"] == "AVAILABLE"
    assert doc_map_2["Electricity Bill"]["status"] == "AVAILABLE"

    # Scenario 3: ProfileContext fallback (electricity_connection="Yes")
    profile_3 = {
        "housing_status": "Own house",
        "has_aadhaar": "Yes",
        "electricity_connection": "Yes"
    }
    norm_3 = normalize_profile(profile_3)
    res_3 = evaluate_eligibility(scheme, rules, documents, norm_3)
    doc_map_3 = {d["name"]: d for d in res_3["documents"]}

    assert doc_map_3["Electricity Bill"]["status"] == "AVAILABLE", "Electricity Bill must map from electricity_connection"

    # Scenario 4: Scheme document named "Aadhaar" instead of "Aadhaar Card"
    scheme_aadhaar_alt = {
        "id": 205,
        "external_scheme_id": "TEST-SCHEME-ALT",
        "name": "Alt Scheme",
        "category": "General",
        "benefits": "Benefit",
        "state": "All India"
    }
    docs_alt = [{"document_name": "Aadhaar", "is_mandatory": True}]
    res_alt = evaluate_eligibility(scheme_alt:=scheme_aadhaar_alt, rules, docs_alt, norm_1)
    assert res_alt["documents"][0]["status"] == "AVAILABLE"

    # Scenario 5: User documents list includes "Aadhaar" and "Electricity Bill"
    res_user_docs = evaluate_eligibility(
        scheme,
        rules,
        documents,
        profile={"housing_status": "Own house", "has_aadhaar": "No", "has_electricity_bill": "No"},
        user_documents=["Aadhaar", "Electricity Bill"]
    )
    doc_map_5 = {d["name"]: d for d in res_user_docs["documents"]}
    assert doc_map_5["Aadhaar Card"]["status"] == "AVAILABLE"
    assert doc_map_5["Electricity Bill"]["status"] == "AVAILABLE"

    # Scenario 6: User explicitly marked missing
    profile_missing = {
        "housing_status": "Own house",
        "has_aadhaar": "No",
        "has_electricity_bill": "No",
        "electricity_connection": "No"
    }
    norm_missing = normalize_profile(profile_missing)
    res_missing = evaluate_eligibility(scheme, rules, documents, norm_missing)
    doc_map_missing = {d["name"]: d for d in res_missing["documents"]}
    assert doc_map_missing["Aadhaar Card"]["status"] == "MISSING"
    assert doc_map_missing["Electricity Bill"]["status"] == "MISSING"


# ─── 9 & 10: SCHEMES API INTEGRATION TESTS ────────────────────────────────────

def test_9_schemes_recommendation_api_with_optional_rules_and_income():
    """
    9. Test recommendation API endpoint:
    - User with income 150000, bpl_status='No', has_aadhaar='Yes'.
    - Ayushman Bharat (which has optional bpl rule) must be ELIGIBLE, not NOT_ELIGIBLE.
    - Post-Matric Scholarship (income <= 250000) must be ELIGIBLE for income 150000.
    """
    profile = {
        "annual_household_income": 150000,
        "bpl_status": "No",
        "age": 22,
        "occupation": "Student",
        "state": "All India",
        "has_aadhaar": "Yes",
        "has_income_certificate": "Yes",
        "has_bank_account": "Yes"
    }
    res = client.post("/schemes/recommend", json={"user_profile": profile})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["total_evaluated"] > 0
    rec_by_name = {r["scheme_name"]: r for r in data["recommendations"]}

    # Ayushman Bharat check
    if "Ayushman Bharat (PM-JAY)" in rec_by_name:
        ayushman = rec_by_name["Ayushman Bharat (PM-JAY)"]
        assert ayushman["status"] == "ELIGIBLE", f"Ayushman Bharat should be ELIGIBLE, got {ayushman['status']}"
        assert ayushman["match_score"] >= 75

    # Post-Matric Scholarship check (income 150000 <= 250000)
    if "Post-Matric Scholarship Scheme" in rec_by_name:
        scholarship = rec_by_name["Post-Matric Scholarship Scheme"]
        assert scholarship["status"] == "ELIGIBLE", f"Scholarship should be ELIGIBLE for income 150000, got {scholarship['status']}"


def test_10_single_scheme_check_eligibility_api():
    """
    10. Test single scheme eligibility check endpoint (/schemes/{id}/check-eligibility).
    Checks document readiness and income evaluation via API.
    """
    # Fetch all schemes to get an existing ID
    schemes_res = client.get("/schemes")
    assert schemes_res.status_code == 200
    schemes = schemes_res.json()
    assert len(schemes) > 0

    # Pick PM Surya Ghar (which needs Aadhaar and Electricity Bill)
    surya_scheme = next((s for s in schemes if "surya" in s["name"].lower()), None)
    if surya_scheme:
        scheme_id = surya_scheme["id"]
        check_res = client.post(f"/schemes/{scheme_id}/check-eligibility", json={
            "user_profile": {
                "housing_status": "Own house",
                "has_aadhaar": "Yes",
                "has_electricity_bill": "Yes"
            }
        })
        assert check_res.status_code == 200, check_res.text
        eval_data = check_res.json()
        doc_statuses = {d["name"]: d["status"] for d in eval_data["documents"]}
        assert doc_statuses.get("Aadhaar Card") == "AVAILABLE"
        assert doc_statuses.get("Electricity Bill") == "AVAILABLE"
        assert eval_data["document_readiness_score"] == 100
