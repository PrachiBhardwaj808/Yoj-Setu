# app/schemas/otp_schemas.py
#
# Pydantic request/response models for OTP endpoints.
#
# SPRING BOOT EQUIVALENT: These replace both your DTO classes AND
# the manual validation you'd write in the service or with @Valid.
# Pydantic combines both concerns into one class definition.
#
# HOW FASTAPI USES THESE:
#   When a route function declares a parameter typed as one of these
#   models, FastAPI automatically:
#     1. Parses the JSON request body into the model
#     2. Validates each field (type, constraints, custom validators)
#     3. If anything fails → returns HTTP 422 with a clear error message
#        BEFORE your function even runs
#   You never need to write `if phone_number is None: return 400`.
#
# VALIDATION LOCATION DECISION:
#   - Schema: structural rules — "is the shape correct?"
#     (10-digit phone, 6-digit OTP) → enforced here
#   - Service: business rules — "does this make sense in context?"
#     (OTP expired? Already verified?) → enforced in otp_service.py

from pydantic import BaseModel, field_validator


class OtpSendRequest(BaseModel):
    """Request body for POST /auth/otp/send."""
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def phone_must_be_10_digits(cls, v: str) -> str:
        # strip spaces so "98765 43210" doesn't sneak through
        v = v.strip()
        if not v.isdigit() or len(v) != 10:
            raise ValueError("phone_number must be exactly 10 digits")
        return v


class OtpVerifyRequest(BaseModel):
    """Request body for POST /auth/otp/verify."""
    phone_number: str
    otp: str

    @field_validator("phone_number")
    @classmethod
    def phone_must_be_10_digits(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit() or len(v) != 10:
            raise ValueError("phone_number must be exactly 10 digits")
        return v

    @field_validator("otp")
    @classmethod
    def otp_must_be_6_digits(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit() or len(v) != 6:
            raise ValueError("otp must be exactly 6 digits")
        return v


class OtpResponse(BaseModel):
    """Standard response shape for both OTP endpoints."""
    success: bool
    message: str
