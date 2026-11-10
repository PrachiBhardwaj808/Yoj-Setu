# app/routers/ping.py
#
# Production Health-check router for Yojsetu.
# Supports GET /api/ping and GET /ping.

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/api/ping")
@router.get("/ping")
def ping():
    """
    Health-check endpoint.
    Returns plain string 'pong' indicating backend service operational health.
    """
    return "pong"
