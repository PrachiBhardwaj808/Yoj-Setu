# app/services/eligibility_engine.py
#
# Deterministic Eligibility Evaluation Engine — NEVER asks LLM to calculate eligibility.
# Evaluates normalized profile values against structured rules using pure Python logic.

from typing import Any, Optional, List


def _evaluate_rule(rule: dict, profile: dict) -> tuple[bool, str, Any, Any]:
    """
    Evaluates a single rule dict against normalized profile.
    Returns: (is_passed, status_text, user_val, required_val)
    """
    field = rule["field_name"]
    op = rule["operator"].strip().upper()
    req_val_str = str(rule["field_value"]).strip()
    raw_text = rule.get("raw_condition_text") or f"{field} {op} {req_val_str}"

    user_val = profile.get(field)
    if user_val is None or user_val == "":
        return False, "UNKNOWN", user_val, req_val_str

    try:
        if op == "==" or op == "EQUALS":
            passed = str(user_val).lower() == req_val_str.lower()
        elif op == "!=" or op == "NOT_EQUALS":
            passed = str(user_val).lower() != req_val_str.lower()
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
            passed = str(user_val).lower() in allowed
        elif op == "NOT_IN":
            disallowed = [x.strip().lower() for x in req_val_str.split(",")]
            passed = str(user_val).lower() not in disallowed
        else:
            # Fallback string comparison
            passed = str(user_val).lower() == req_val_str.lower()
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
    """
    passed_conditions = []
    failed_conditions = []
    missing_info = []

    total_mandatory_rules = 0
    passed_mandatory_rules = 0

    # 1. State matching check (if scheme is state-specific)
    scheme_state = scheme.get("state", "All India")
    user_state = profile.get("state", "")
    if scheme_state != "All India" and user_state and scheme_state.lower() != user_state.lower():
        failed_conditions.append({
            "field": "state",
            "user_value": user_state,
            "required": scheme_state,
            "status": "FAIL",
            "description": f"Scheme is restricted to {scheme_state} (your state: {user_state})"
        })

    # 2. Rule-by-rule evaluation
    for rule in rules:
        is_mandatory = bool(rule.get("is_mandatory", True))
        if is_mandatory:
            total_mandatory_rules += 1

        passed, status_text, user_val, req_val = _evaluate_rule(rule, profile)

        cond_item = {
            "field": rule["field_name"],
            "user_value": user_val,
            "required": req_val,
            "status": status_text,
            "description": rule.get("raw_condition_text") or f"{rule['field_name']} {rule['operator']} {req_val}"
        }

        if status_text == "UNKNOWN":
            missing_info.append(rule["field_name"])
        elif passed:
            passed_conditions.append(cond_item)
            if is_mandatory:
                passed_mandatory_rules += 1
        else:
            failed_conditions.append(cond_item)

    # 3. Determine Overall Status
    if failed_conditions:
        overall_status = "NOT_ELIGIBLE"
    elif missing_info:
        overall_status = "INSUFFICIENT_INFORMATION"
    else:
        overall_status = "ELIGIBLE"

    # 4. Calculate Match Score (0 - 100)
    if overall_status == "ELIGIBLE":
        rule_score = 100 if total_mandatory_rules == 0 else int((passed_mandatory_rules / total_mandatory_rules) * 100)
        match_score = max(75, rule_score)
    elif overall_status == "INSUFFICIENT_INFORMATION":
        match_score = 60
    else:
        match_score = max(20, int((passed_mandatory_rules / max(1, len(rules))) * 50))

    # 5. Document Readiness Check
    doc_results = []
    available_docs_count = 0
    doc_mapping = {
        "Aadhaar": "has_aadhaar",
        "Bank Account": "has_bank_account",
        "Ration Card": "has_ration_card",
        "Income Certificate": "has_income_certificate",
        "Caste Certificate": "has_caste_certificate",
        "Disability Certificate": "has_disability_certificate",
        "Land Document": "has_land_document",
    }

    user_docs_set = set([d.lower() for d in (user_documents or [])])

    for doc in documents:
        doc_name = doc["document_name"]
        profile_key = doc_mapping.get(doc_name, "")
        profile_has_doc = profile.get(profile_key, False) if profile_key else False
        is_in_explicit_list = doc_name.lower() in user_docs_set
        
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
        "scheme_id": scheme["id"],
        "external_scheme_id": scheme["external_scheme_id"],
        "scheme_name": scheme["name"],
        "category": scheme["category"],
        "benefit": scheme["benefits"],
        "status": overall_status,
        "match_score": match_score,
        "passed_conditions": passed_conditions,
        "failed_conditions": failed_conditions,
        "missing_information": missing_info,
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
