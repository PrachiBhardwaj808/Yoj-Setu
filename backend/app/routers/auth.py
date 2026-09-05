# app/routers/auth.py
#
# OTP authentication endpoints.
#
# SPRING BOOT EQUIVALENT:
#   @RestController
#   @RequestMapping("/auth/otp")
#   public class OtpController { ... }
#
# HTTP STATUS CODE DECISIONS:
#   - Successful send/verify     → 200 OK (default)
#   - Wrong/expired/reused OTP   → 400 Bad Request
#     Why 400 and not 401/403?
#     401 = "you need to authenticate first" (we're in the auth flow itself)
#     403 = "authenticated but not allowed"
#     400 = "your request is understood but invalid" — fits wrong OTP perfectly.
#   - Internal DB error          → 500 (FastAPI's default for unhandled exceptions)
#
# FASTAPI DEPENDENCY INJECTION vs SPRING:
#   Spring used @Autowired to inject services. FastAPI uses function
#   parameters with Depends(). For this project we're calling the
#   service functions directly (no DI needed at this scale), which is
#   simpler and perfectly fine.

from fastapi import APIRouter, HTTPException
from app.schemas.otp_schemas import OtpSendRequest, OtpVerifyRequest, OtpResponse
from app.services import otp_service

router = APIRouter(prefix="/auth/otp", tags=["OTP Auth"])


@router.post("/send", response_model=OtpResponse)
def send_otp(request: OtpSendRequest):
    """
    Generates a 6-digit OTP and dispatches it via SMS (currently mock).

    Request body: { "phone_number": "9876543210" }
    Success:      200 { "success": true, "message": "OTP sent successfully." }

    The phone_number must be exactly 10 digits — validated automatically
    by Pydantic before this function is called. A malformed request
    gets a 422 error with a detailed explanation, no code needed here.

    Spring Boot equivalent:
        @PostMapping("/send")
        public ResponseEntity<OtpResponse> sendOtp(@Valid @RequestBody OtpSendRequest req) { ... }
    """
    # otp_service.send_otp() handles generation, DB insert, and SMS dispatch.
    # Any unexpected error bubbles up as HTTP 500 (FastAPI's default).
    otp_service.send_otp(request.phone_number)
    return OtpResponse(success=True, message="OTP sent successfully.")


@router.post("/verify", response_model=OtpResponse)
def verify_otp(request: OtpVerifyRequest):
    """
    Verifies the submitted OTP code against the stored record.

    Request body: { "phone_number": "9876543210", "otp": "123456" }
    Success:      200 { "success": true, "message": "OTP verified successfully." }
    Failure:      400 { "detail": "<human-readable reason>" }

    The service raises ValueError on any failure (wrong code, expired,
    already used). We catch it here and convert to HTTP 400.
    Converting ValueError → HTTPException here (not in the service) keeps
    the service layer HTTP-agnostic — it could be called from a CLI tool
    or a scheduled job without needing to know about HTTP status codes.
    """
    try:
        result = otp_service.verify_otp(request.phone_number, request.otp)
        return OtpResponse(**result)
    except ValueError as e:
        # str(e) gives the human-readable message from otp_service.py
        raise HTTPException(status_code=400, detail=str(e))
