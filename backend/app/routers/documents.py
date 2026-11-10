# app/routers/documents.py
#
# Production API Router for User Documents & Verification Metadata.
# Prevents storing raw binary blobs in database columns; stores secure file metadata.
# Scoped strictly to the authenticated user for data isolation.

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.services import auth_service
from app.dao import user_document_dao

router = APIRouter(prefix="/documents", tags=["User Documents"])


class SaveDocumentMetadataRequest(BaseModel):
    document_type: str
    document_name: str
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    verification_status: Optional[str] = "pending"
    metadata: Optional[Dict[str, Any]] = None
    document_id: Optional[str] = None


class UpdateDocumentStatusRequest(BaseModel):
    verification_status: str


@router.get("", response_model=List[Dict[str, Any]])
def list_my_documents(current_user: dict = Depends(auth_service.get_current_user)):
    """Lists all uploaded document metadata for the authenticated user."""
    return user_document_dao.get_documents_by_user_id(current_user["id"])


@router.post("", status_code=status.HTTP_201_CREATED)
def save_document_metadata(
    req: SaveDocumentMetadataRequest,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Saves document metadata with secure storage references (no binary blobs in DB)."""
    doc = user_document_dao.upsert_document_metadata(
        user_id=current_user["id"],
        document_type=req.document_type,
        document_name=req.document_name,
        file_path=req.file_path,
        file_size=req.file_size,
        mime_type=req.mime_type,
        verification_status=req.verification_status or "pending",
        metadata=req.metadata,
        document_id=req.document_id,
    )
    return doc


@router.get("/{document_id}")
def get_document(
    document_id: str,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Retrieves document metadata for a single document, ensuring multi-user isolation."""
    doc = user_document_dao.get_document_by_id(document_id, current_user["id"])
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access."
        )
    return doc


@router.patch("/{document_id}")
def update_document_status(
    document_id: str,
    req: UpdateDocumentStatusRequest,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Updates document verification status for the authenticated user."""
    updated = user_document_dao.update_document_status(
        document_id=document_id,
        user_id=current_user["id"],
        verification_status=req.verification_status
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access."
        )
    return updated


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Deletes document metadata owned by the authenticated user."""
    success = user_document_dao.delete_document(document_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access."
        )
    return {"message": "Document deleted successfully"}
