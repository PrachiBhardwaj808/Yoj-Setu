# app/routers/profile.py
#
# Production API Router for Citizen Profile management.
# Enforces authenticated user scoping for multi-user isolation.

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.services import auth_service
from app.dao import citizen_profile_dao, user_dao

router = APIRouter(prefix="/profile", tags=["Citizen Profile"])


@router.get("/me")
def get_my_profile(current_user: dict = Depends(auth_service.get_current_user)):
    """Fetches the citizen profile of the authenticated user."""
    user_id = current_user["id"]
    profile = citizen_profile_dao.get_profile_by_user_id(user_id)
    if not profile:
        # Return empty default profile structure initialized with user details
        return {
            "user_id": user_id,
            "full_name": current_user.get("full_name", ""),
            "phone": current_user.get("phone", ""),
            "email": current_user.get("email"),
            "state": "",
            "district": "",
            "annual_income": 0.0,
            "occupation": "",
            "education": "",
            "social_category": "General",
            "gender": "",
            "age": None,
            "date_of_birth": "",
            "rural_urban": "Rural",
            "family_size": 1,
            "children_count": 0,
            "disability_status": "No",
            "bpl_status": "No",
            "minority_status": "No",
        }
    return profile


@router.put("/me")
def update_my_profile(
    profile_data: Dict[str, Any],
    current_user: dict = Depends(auth_service.get_current_user)
):
    """
    Saves or updates the citizen profile in the database.
    Ensures multi-user isolation by always using the authenticated user's ID.
    """
    user_id = current_user["id"]
    updated = citizen_profile_dao.upsert_profile(user_id, profile_data)
    return {"message": "Profile updated successfully", "profile": updated}


@router.delete("/me")
def delete_my_profile(current_user: dict = Depends(auth_service.get_current_user)):
    """Deletes citizen profile for the current user."""
    user_id = current_user["id"]
    deleted = citizen_profile_dao.delete_profile(user_id)
    return {"message": "Profile deleted successfully", "deleted": deleted}
