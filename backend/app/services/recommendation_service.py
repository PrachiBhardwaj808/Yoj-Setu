# app/services/recommendation_service.py
#
# AI Recommendation Agent — Ranks deterministically evaluated schemes and generates
# grounded recommendations. Never alters deterministic eligibility status.

from typing import Optional, List
from app.dao import scheme_dao
from app.services.profile_normalizer import normalize_profile
from app.services.eligibility_engine import evaluate_eligibility


def _generate_grounded_reason(eval_result: dict, profile: dict) -> str:
    """
    Generates a natural language explanation grounded strictly in verified evaluation results.
    Never invents requirements.
    """
    status = eval_result["status"]
    scheme_name = eval_result["scheme_name"]
    passed = eval_result["passed_conditions"]
    failed = eval_result["failed_conditions"]
    missing = eval_result["missing_information"]

    if status == "ELIGIBLE":
        passed_fields = [p["field"].replace("_", " ") for p in passed]
        if passed_fields:
            reasons = ", ".join(passed_fields[:3])
            return f"You meet key criteria for {scheme_name} ({reasons}) and have required documentation."
        return f"Your profile matches all eligibility criteria for {scheme_name}."

    elif status == "INSUFFICIENT_INFORMATION":
        missing_fields = ", ".join([m.replace("_", " ") for m in missing])
        return f"Potential match for {scheme_name}, but missing details for: {missing_fields}."

    else:
        failed_reasons = [f["description"] for f in failed]
        reason_str = "; ".join(failed_reasons[:2])
        return f"Currently not eligible for {scheme_name}: {reason_str}."


def generate_recommendations(
    user_profile: dict,
    user_documents: Optional[List[str]] = None,
    category_filter: Optional[str] = None,
    limit: Optional[int] = 20
) -> dict:
    """
    1. Normalizes user profile.
    2. Fetches active schemes from DB (with pre-filtering).
    3. Evaluates eligibility deterministically for each scheme.
    4. Ranks recommendations by match score, document readiness, and status.
    5. Returns structured JSON recommendation model.
    """
    normalized_profile = normalize_profile(user_profile)
    user_docs = user_documents or []
    
    # Pre-filtering: fetch schemes by category if specified
    all_schemes = scheme_dao.get_all_schemes(category=category_filter)

    evaluated_results = []
    eligible_count = 0
    high_confidence_count = 0

    for scheme in all_schemes:
        scheme_id = scheme["id"]
        rules = scheme_dao.get_scheme_rules(scheme_id)
        documents = scheme_dao.get_scheme_documents(scheme_id)

        eval_result = evaluate_eligibility(scheme, rules, documents, normalized_profile, user_docs)
        
        # Attach full scheme metadata
        eval_result["source_url"] = scheme.get("source_url", "")
        eval_result["application_url"] = scheme.get("application_url", "")
        eval_result["department"] = scheme.get("department", "")
        eval_result["government_level"] = scheme.get("government_level", "Central")
        eval_result["state"] = scheme.get("state", "All India")
        eval_result["last_updated"] = str(scheme.get("last_updated", ""))

        # Ensure field compatibility across frontend and backend
        eval_result["name"] = eval_result.get("scheme_name", "")
        eval_result["title"] = eval_result.get("scheme_name", "")
        eval_result["benefits"] = eval_result.get("benefit", "")
        eval_result["benefitAmount"] = eval_result.get("benefit", "")

        # Generate grounded reason
        eval_result["reason"] = _generate_grounded_reason(eval_result, normalized_profile)

        if eval_result["status"] == "ELIGIBLE":
            eligible_count += 1
            if eval_result["match_score"] >= 85:
                high_confidence_count += 1

        evaluated_results.append(eval_result)

    # Rank recommendations: ELIGIBLE first, then by match_score + document_readiness_score
    evaluated_results.sort(
        key=lambda x: (
            1 if x["status"] == "ELIGIBLE" else (2 if x["status"] == "INSUFFICIENT_INFORMATION" else 3),
            -x["match_score"],
            -x["document_readiness_score"]
        )
    )

    # Apply limit
    if limit and limit > 0:
        evaluated_results = evaluated_results[:limit]

    # Assign priority rank (1, 2, 3...)
    for idx, item in enumerate(evaluated_results, start=1):
        item["priority"] = idx

    return {
        "total_evaluated": len(evaluated_results),
        "eligible_count": eligible_count,
        "high_confidence_count": high_confidence_count,
        "more_to_explore_count": max(0, len(evaluated_results) - eligible_count),
        "recommendations": evaluated_results
    }


class RecommendationService:
    """Class wrapper for dependency injection or OOP invocation."""
    def generate_recommendations(
        self,
        user_profile: dict,
        user_documents: Optional[List[str]] = None,
        category_filter: Optional[str] = None,
        limit: Optional[int] = 20
    ) -> dict:
        return generate_recommendations(
            user_profile=user_profile,
            user_documents=user_documents,
            category_filter=category_filter,
            limit=limit
        )
