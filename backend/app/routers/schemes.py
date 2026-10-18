# app/routers/schemes.py
#
# Production Router for Government Scheme Discovery, Ingestion, Eligibility, and Recommendations.

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel

from app.dao import scheme_dao
from app.services.scheme_ingestion_service import SchemeIngestionService
from app.services.eligibility_engine import EligibilityEngine
from app.services.recommendation_service import RecommendationService
from app.services.auth_service import get_current_user
from app.schemas.scheme_schemas import SchemeResponse, RecommendationResponse, SchemeDetailResponse

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


class EvaluateEligibilityRequest(BaseModel):
    user_profile: dict
    user_documents: Optional[List[str]] = None


class RecommendationRequest(BaseModel):
    user_profile: dict
    user_documents: Optional[List[str]] = None
    category: Optional[str] = None
    limit: Optional[int] = 20


@router.get("", response_model=List[SchemeResponse])
def get_all_schemes(
    category: Optional[str] = Query(None, description="Filter by category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    search: Optional[str] = Query(None, description="Search keyword in scheme name or description"),
    status_filter: Optional[str] = Query("Active", description="Filter by status")
):
    """
    Fetch all government schemes from local repository/cache.
    Supports filtering by category, state, and search term.
    """
    try:
        cat_str = category if isinstance(category, str) else None
        st_str = state if isinstance(state, str) else None
        srch_str = search if isinstance(search, str) else None
        stat_str = status_filter if isinstance(status_filter, str) else "Active"
        schemes = scheme_dao.get_all_schemes(category=cat_str, state=st_str, status=stat_str)
        if srch_str:
            search_lower = srch_str.lower()
            schemes = [
                s for s in schemes
                if search_lower in (s.get("name") or "").lower()
                or search_lower in (s.get("title") or "").lower()
                or search_lower in (s.get("description") or "").lower()
                or search_lower in (s.get("category") or "").lower()
            ]
        return schemes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schemes: {str(e)}")


@router.get("/{scheme_id}", response_model=SchemeDetailResponse)
def get_scheme_by_id(scheme_id: int):
    """
    Get detailed scheme profile by ID, including eligibility rules and document requirements.
    """
    scheme = scheme_dao.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with ID {scheme_id} not found.")
    
    rules = scheme_dao.get_rules_for_scheme(scheme_id)
    docs = scheme_dao.get_documents_for_scheme(scheme_id)
    
    scheme["rules"] = rules
    scheme["documents"] = docs
    return scheme


@router.post("/ingest")
def trigger_scheme_ingestion():
    """
    Trigger scheme ingestion service to fetch schemes from configured provider,
    parse with AI service into structured rules, and update MySQL/SQLite storage.
    """
    try:
        service = SchemeIngestionService()
        result = service.ingest_schemes()
        return {
            "status": "success",
            "message": "Scheme ingestion completed successfully.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheme ingestion failed: {str(e)}")


@router.post("/{scheme_id}/check-eligibility")
def check_single_scheme_eligibility(scheme_id: int, req: EvaluateEligibilityRequest):
    """
    Deterministically check eligibility of a single user profile against a specific scheme.
    """
    scheme = scheme_dao.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found.")
    
    rules = scheme_dao.get_rules_for_scheme(scheme_id)
    docs = scheme_dao.get_documents_for_scheme(scheme_id)
    scheme["rules"] = rules
    scheme["documents"] = docs

    engine = EligibilityEngine()
    result = engine.evaluate_scheme(scheme, req.user_profile, req.user_documents or [])
    return result.to_dict()


@router.post("/recommend", response_model=RecommendationResponse)
def get_scheme_recommendations(req: RecommendationRequest):
    """
    Core AI Recommendation Endpoint:
    1. Pre-filters schemes based on basic criteria (state/category).
    2. Runs deterministic eligibility engine to calculate ELIGIBLE / NOT_ELIGIBLE / INSUFFICIENT_INFORMATION.
    3. Runs AI Recommendation Agent to rank schemes and generate grounded explanations without altering eligibility.
    """
    try:
        recommendation_service = RecommendationService()
        result = recommendation_service.generate_recommendations(
            user_profile=req.user_profile,
            user_documents=req.user_documents or [],
            category_filter=req.category,
            limit=req.limit or 20
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate scheme recommendations: {str(e)}")
