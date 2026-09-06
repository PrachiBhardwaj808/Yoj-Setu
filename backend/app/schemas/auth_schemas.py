# app/schemas/auth_schemas.py
#
# Pydantic models for authentication endpoints.

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class PhoneRequest(BaseModel):
    phone: str = Field(..., description="10-digit mobile number or E.164 format")


class OtpVerifyRequest(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str
    email: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=100)
    verification_token: str


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Mobile number or Email address")
    password: str = Field(..., min_length=1)


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str] = None
    role: str = "citizen"
    is_phone_verified: bool = True
    onboardingComplete: bool = False


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GenericResponse(BaseModel):
    message: str
    expires_in: Optional[int] = None
    verification_token: Optional[str] = None
    reset_token: Optional[str] = None
    dev_otp: Optional[str] = None
