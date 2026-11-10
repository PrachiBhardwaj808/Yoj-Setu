# app/services/eligibility_engine.py
#
# Deterministic Eligibility Evaluation Engine — NEVER asks LLM to calculate eligibility.
# Evaluates normalized profile values against structured rules using pure Python logic.

from typing import Any, Optional, List
from app.services.profile_normalizer import parse_income_range


def _is_doc_truthy(val: Any) -> bool:
    """Helper to evaluate truthiness of document availability indicators."""
    if val is None:
        return False
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return val > 0
    if isinstance(val, str):
        cleaned = val.strip().lower()
        if cleaned in ("yes", "true", "1", "available", "y"):
            return True
        if cleaned in ("no", "false", "0", "not available", "n", "not applicable", "not sure", "in progress"):
            return False
    return bool(val)


# Mapping of scheme document names to citizen profile fields
DOCUMENT_FIELD_MAPPING = {
    # Aadhaar mappings (handles both 'Aadhaar' and 'Aadhaar Card')
    "aadhaar": ["has_aadhaar", "aadhaar"],
    "aadhaar card": ["has_aadhaar", "aadhaar"],
    # Electricity Bill mappings
    "electricity bill": ["has_electricity_bill", "electricity_bill", "electricity_connection"],
    # Bank Account mappings
    "bank account": ["has_bank_account", "bank_account"],
    "bank passbook": ["has_bank_account", "bank_account"],
    # Ration Card mappings
    "ration card": ["has_ration_card", "ration_card"],
    # Income Certificate mappings
    "income certificate": ["has_income_certificate", "income_certificate"],
    # Caste Certificate mappings
    "caste certificate": ["has_caste_certificate", "caste_certificate"],
    # Disability Certificate mappings
    "disability certificate": ["has_disability_certificate", "disability_certificate"],
    "disability / udid card": ["has_disability_certificate", "disability_certificate"],
    # Land Document mappings
    "land document": ["has_land_document", "land_document"],
    "land records": ["has_land_document", "land_document"],
}


def _evaluate_rule(rule: dict, profile: dict) -> tuple[bool, str, Any, Any]:
    """
    Evaluates a single rule dict against normalized profile.
    Returns: (is_passed, status_text, user_val, required_val)
    """
    field = rule["field_name"]
    op = rule["operator"].strip().upper()
    req_val_str = str(rule["field_value"]).strip()

    user_val = profile.get(field)
    if user_val is None or user_val == "":
        return False, "UNKNOWN", user_val, req_val_str

    # Normalize income fields for comparison
    if "income" in field.lower():
        norm_user_val = parse_income_range(user_val) if not isinstance(user_val, (int, float)) else float(user_val)
        norm_req_val = parse_income_range(req_val_str) or float(req_val_str)
        if norm_user_val is None:
            return False, "UNKNOWN", user_val, req_val_str
        user_val = norm_user_val
        req_val_str = str(norm_req_val)

    try:
        if op == "==" or op == "EQUALS":
            passed = str(user_val).strip().lower() == req_val_str.strip().lower()
        elif op == "!=" or op == "NOT_EQUALS":
            passed = str(user_val).strip().lower() != req_val_str.strip().lower()
        elif op == ">=":
            passed = float(user_val) >= float(req_val_str)
        elif op == "<=":
            passed = float(user_val) <= float(req_val_str)
        elif op == ">":
            passed = float(user_val) > float(req_val_str)
        elif op == "<":
            passed = float(user_val) < float(req_val_str)
        elif op == "IN":
            allowed = [x.strip().lower() for x in req_val_str.split(",")]
            passed = str(user_val).strip().lower() in allowed
        elif op == "NOT_IN":
            disallowed = [x.strip().lower() for x in req_val_str.split(",")]
            passed = str(user_val).strip().lower() not in disallowed
        else:
            # Fallback string comparison
            passed = str(user_val).strip().lower() == req_val_str.strip().lower()
        return passed, ("PASS" if passed else "FAIL"), user_val, req_val_str
    except (ValueError, TypeError):
        return False, "FAIL", user_val, req_val_str


def evaluate_eligibility(
    scheme: dict,
    rules: list[dict],
    documents: list[dict],
    profile: dict,
    user_documents: Optional[List[str]] = None
) -> dict:
    """
    Evaluates a scheme against user profile deterministically.
    - Mandatory rules (is_mandatory=True): Failure causes NOT_ELIGIBLE.
    - Optional rules (is_mandatory=False): Failure does NOT disqualify user; user remains ELIGIBLE.
    - Missing mandatory fields result in INSUFFICIENT_INFORMATION.
    """
    passed_conditions = []
    failed_conditions = []
    failed_mandatory_conditions = []
    failed_optional_conditions = []
    missing_info = []
    missing_optional_info = []

    total_mandatory_rules = 0
    passed_mandatory_rules = 0
    total_optional_rules = 0
    passed_optional_rules = 0

    # 1. State matching check (state restriction is mandatory)
    scheme_state = scheme.get("state", "All India")
    user_state = profile.get("state", "")
    if scheme_state and scheme_state != "All India" and user_state and scheme_state.lower() != user_state.lower():
        total_mandatory_rules += 1
        cond_state = {
            "field": "state",
            "user_value": user_state,
            "required": scheme_state,
            "status": "FAIL",
            "is_mandatory": True,
            "description": f"Scheme is restricted to {scheme_state} (your state: {user_state})"
        }
        failed_conditions.append(cond_state)
        failed_mandatory_conditions.append(cond_state)

    # 2. Rule-by-rule evaluation
    for rule in rules:
        is_mandatory = bool(rule.get("is_mandatory", True))
        if is_mandatory:
            total_mandatory_rules += 1
        else:
            total_optional_rules += 1

        passed, status_text, user_val, req_val = _evaluate_rule(rule, profile)

        cond_item = {
            "field": rule["field_name"],
            "user_value": user_val,
            "required": req_val,
            "status": status_text,
            "is_mandatory": is_mandatory,
            "description": rule.get("raw_condition_text") or rule.get("raw_text") or f"{rule['field_name']} {rule['operator']} {req_val}"
        }

        if status_text == "UNKNOWN":
            if is_mandatory:
                missing_info.append(rule["field_name"])
            else:
                missing_optional_info.append(rule["field_name"])
        elif passed:
            passed_conditions.append(cond_item)
            if is_mandatory:
                passed_mandatory_rules += 1
            else:
                passed_optional_rules += 1
        else:
            failed_conditions.append(cond_item)
            if is_mandatory:
                failed_mandatory_conditions.append(cond_item)
            else:
                failed_optional_conditions.append(cond_item)

    # 3. Determine Overall Status
    # Only failed mandatory conditions result in NOT_ELIGIBLE.
    if failed_mandatory_conditions:
        overall_status = "NOT_ELIGIBLE"
    elif missing_info:
        overall_status = "INSUFFICIENT_INFORMATION"
    else:
        overall_status = "ELIGIBLE"

    # 4. Calculate Match Score (0 - 100)
    if overall_status == "ELIGIBLE":
        if total_mandatory_rules == 0:
            mandatory_score = 85
        else:
            mandatory_score = int((passed_mandatory_rules / total_mandatory_rules) * 85)

        if total_optional_rules > 0:
            optional_bonus = int((passed_optional_rules / total_optional_rules) * 15)
        else:
            optional_bonus = 15

        match_score = max(75, min(100, mandatory_score + optional_bonus))
    elif overall_status == "INSUFFICIENT_INFORMATION":
        match_score = 60
    else:
        denom = max(1, total_mandatory_rules + total_optional_rules)
        match_score = max(20, min(50, int((passed_mandatory_rules / denom) * 50)))

    # 5. Document Readiness Check
    doc_results = []
    available_docs_count = 0
    user_docs_set = set([d.strip().lower() for d in (user_documents or [])])

    for doc in documents:
        doc_name = doc["document_name"].strip()
        doc_lower = doc_name.lower()

        # Check explicit user_documents list
        is_in_explicit_list = False
        if doc_lower in user_docs_set:
            is_in_explicit_list = True
        elif doc_lower in ("aadhaar", "aadhaar card"):
            is_in_explicit_list = ("aadhaar" in user_docs_set or "aadhaar card" in user_docs_set)
        elif doc_lower in ("electricity bill", "electricity_bill"):
            is_in_explicit_list = ("electricity bill" in user_docs_set or "electricity" in user_docs_set)

        # Check citizen profile fields
        profile_has_doc = False
        candidate_keys = DOCUMENT_FIELD_MAPPING.get(doc_lower, [f"has_{doc_lower.replace(' ', '_')}"])
        for key in candidate_keys:
            if _is_doc_truthy(profile.get(key)):
                profile_has_doc = True
                break

        # Check direct document name in profile dict as fallback
        if not profile_has_doc and _is_doc_truthy(profile.get(doc_name)):
            profile_has_doc = True

        is_available = profile_has_doc or is_in_explicit_list
        if is_available:
            available_docs_count += 1

        doc_results.append({
            "name": doc_name,
            "is_mandatory": bool(doc.get("is_mandatory", True)),
            "is_available": is_available,
            "status": "AVAILABLE" if is_available else "MISSING"
        })

    doc_readiness_score = 100 if not documents else int((available_docs_count / len(documents)) * 100)

    return {
        "scheme_id": scheme.get("id"),
        "external_scheme_id": scheme.get("external_scheme_id"),
        "scheme_name": scheme.get("name"),
        "category": scheme.get("category"),
        "benefit": scheme.get("benefits"),
        "status": overall_status,
        "match_score": match_score,
        "passed_conditions": passed_conditions,
        "failed_conditions": failed_conditions,
        "failed_mandatory_conditions": failed_mandatory_conditions,
        "failed_optional_conditions": failed_optional_conditions,
        "missing_information": missing_info,
        "missing_optional_information": missing_optional_info,
        "document_readiness_score": doc_readiness_score,
        "documents": doc_results,
    }


class EligibilityResult:
    def __init__(self, data: dict):
        self.data = data

    def to_dict(self) -> dict:
        return self.data


class EligibilityEngine:
    def evaluate_scheme(
        self,
        scheme: dict,
        profile: dict,
        user_documents: Optional[List[str]] = None
    ) -> EligibilityResult:
        rules = scheme.get("rules", [])
        documents = scheme.get("documents", [])
        res = evaluate_eligibility(scheme, rules, documents, profile, user_documents)
        return EligibilityResult(res)
