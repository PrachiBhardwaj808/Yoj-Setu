# app/routers/applications.py
#
# Production API Router for Scheme Application Tracking.
# Scoped strictly to the authenticated user for data isolation.

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.services import auth_service
from app.dao import application_dao

router = APIRouter(prefix="/applications", tags=["Applications"])


class CreateApplicationRequest(BaseModel):
    external_scheme_id: str
    status: Optional[str] = "planning"
    metadata: Optional[Dict[str, Any]] = None
    scheme_id: Optional[int] = None
    application_id: Optional[str] = None


class UpdateApplicationStatusRequest(BaseModel):
    status: str
    applied_date: Optional[str] = None


@router.get("", response_model=List[Dict[str, Any]])
def list_my_applications(current_user: dict = Depends(auth_service.get_current_user)):
    """Lists all scheme applications for the authenticated user."""
    return application_dao.get_applications_by_user_id(current_user["id"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_application(
    req: CreateApplicationRequest,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Tracks a new scheme application for the authenticated citizen."""
    app = application_dao.create_application(
        user_id=current_user["id"],
        external_scheme_id=req.external_scheme_id,
        status=req.status or "planning",
        metadata=req.metadata,
        scheme_id=req.scheme_id,
        application_id=req.application_id
    )
    return app


@router.get("/{application_id}")
def get_application(
    application_id: str,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Retrieves a single application, ensuring multi-user isolation."""
    app = application_dao.get_application_by_id(application_id, current_user["id"])
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized access."
        )
    return app


@router.put("/{application_id}")
@router.patch("/{application_id}")
def update_application(
    application_id: str,
    req: UpdateApplicationStatusRequest,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Updates status or details of a tracked application owned by the user."""
    updated = application_dao.update_application_status(
        application_id=application_id,
        user_id=current_user["id"],
        status=req.status,
        applied_date=req.applied_date
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized access."
        )
    return updated


@router.delete("/{application_id}")
def delete_application(
    application_id: str,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Deletes an application owned by the user."""
    success = application_dao.delete_application(application_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized access."
        )
    return {"message": "Application deleted successfully"}
