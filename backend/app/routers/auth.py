# app/routers/auth.py
#
# Production Authentication Router for Yojsetu.
# Handles Registration (with OTP), Login (Password & OTP), Password Reset, and Token Validation.

from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.auth_schemas import (
    PhoneRequest,
    OtpVerifyRequest,
    RegisterRequest,
    LoginRequest,
    ResetPasswordRequest,
    AuthResponse,
    GenericResponse,
    UserResponse,
)
from app.services import otp_service, auth_service
from app.dao import user_dao

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── REGISTER FLOW ─────────────────────────────────────────────────────────────

@router.post("/register/request-otp", response_model=GenericResponse)
def request_register_otp(req: PhoneRequest):
    """
    Step 1 of Registration: Request OTP for phone verification.
    Checks if phone is already registered. Generates 6-digit OTP.
    """
    phone = req.phone.strip()
    formatted_phone = otp_service.format_phone(phone)

    # Check duplicate phone
    existing_user = user_dao.get_user_by_phone(formatted_phone)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="This mobile number is already registered. Please login instead."
        )

    try:
        result = otp_service.generate_and_send_otp(formatted_phone, purpose="REGISTER")
        return GenericResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/register/verify-otp", response_model=GenericResponse)
def verify_register_otp(req: OtpVerifyRequest):
    """
    Step 2 of Registration: Verify submitted OTP.
    Returns short-lived verification token required for account creation.
    """
    phone = req.phone.strip()
    formatted_phone = otp_service.format_phone(phone)

    try:
        otp_service.verify_otp(formatted_phone, req.otp, purpose="REGISTER")
        verification_token = auth_service.create_temp_token(
            {"phone": formatted_phone, "purpose": "register_verification"},
            expires_minutes=15
        )
        return GenericResponse(
            message="Mobile number verified successfully.",
            verification_token=verification_token
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    """
    Step 3 of Registration: Create user account after OTP verification token is presented.
    Hashes password, saves user, returns JWT access token.
    """
    # Verify temporary verification token
    try:
        payload = auth_service.verify_temp_token(req.verification_token, expected_purpose="register_verification")
        token_phone = payload.get("phone")
        formatted_phone = otp_service.format_phone(req.phone)
        if token_phone != formatted_phone:
            raise HTTPException(status_code=400, detail="Verification token does not match mobile number.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid OTP verification token: {str(e)}")

    # Check duplicate email if provided
    if req.email and req.email.strip():
        existing_email = user_dao.get_user_by_email(req.email.strip())
        if existing_email:
            raise HTTPException(status_code=400, detail="This email address is already in use.")

    # Hash password with bcrypt
    password_hash = auth_service.hash_password(req.password)

    # Create user record
    created_user = user_dao.create_user(
        full_name=req.full_name.strip(),
        phone=formatted_phone,
        email=req.email.strip() if req.email else None,
        password_hash=password_hash,
        role="citizen",
    )

    # Generate JWT access token
    access_token = auth_service.create_access_token({"sub": created_user["id"], "phone": created_user["phone"]})

    user_resp = UserResponse(
        id=created_user["id"],
        full_name=created_user["full_name"],
        phone=created_user["phone"],
        email=created_user.get("email"),
        role=created_user.get("role", "citizen"),
        is_phone_verified=True,
        onboardingComplete=False,
    )

    return AuthResponse(access_token=access_token, token_type="bearer", user=user_resp)


# ─── LOGIN FLOW ────────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """
    Password Login: Authenticates user by Phone/Email and Password.
    Returns JWT access token.
    """
    identifier = req.identifier.strip()
    user = user_dao.get_user_by_identifier(identifier)

    if not user or not auth_service.verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number/email or password."
        )

    if not user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Your account has been deactivated.")

    access_token = auth_service.create_access_token({"sub": user["id"], "phone": user["phone"]})

    user_resp = UserResponse(
        id=user["id"],
        full_name=user["full_name"],
        phone=user["phone"],
        email=user.get("email"),
        role=user.get("role", "citizen"),
        is_phone_verified=bool(user.get("is_phone_verified", True)),
        onboardingComplete=False,
    )

    return AuthResponse(access_token=access_token, token_type="bearer", user=user_resp)


@router.post("/login/request-otp", response_model=GenericResponse)
def request_login_otp(req: PhoneRequest):
    """
    OTP Login Step 1: Request OTP for logging in.
    """
    formatted_phone = otp_service.format_phone(req.phone.strip())
    user = user_dao.get_user_by_phone(formatted_phone)
    if not user:
        raise HTTPException(status_code=400, detail="No registered account found with this mobile number.")

    try:
        result = otp_service.generate_and_send_otp(formatted_phone, purpose="LOGIN")
        return GenericResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login/verify-otp", response_model=AuthResponse)
def verify_login_otp(req: OtpVerifyRequest):
    """
    OTP Login Step 2: Verify OTP and log in.
    Returns JWT access token.
    """
    formatted_phone = otp_service.format_phone(req.phone.strip())
    user = user_dao.get_user_by_phone(formatted_phone)
    if not user:
        raise HTTPException(status_code=400, detail="User account not found.")

    try:
        otp_service.verify_otp(formatted_phone, req.otp, purpose="LOGIN")
        access_token = auth_service.create_access_token({"sub": user["id"], "phone": user["phone"]})

        user_resp = UserResponse(
            id=user["id"],
            full_name=user["full_name"],
            phone=user["phone"],
            email=user.get("email"),
            role=user.get("role", "citizen"),
            is_phone_verified=True,
            onboardingComplete=False,
        )

        return AuthResponse(access_token=access_token, token_type="bearer", user=user_resp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─── FORGOT PASSWORD FLOW ──────────────────────────────────────────────────────

@router.post("/forgot-password/request-otp", response_model=GenericResponse)
def request_forgot_password_otp(req: PhoneRequest):
    """
    Forgot Password Step 1: Request OTP for password reset.
    """
    formatted_phone = otp_service.format_phone(req.phone.strip())
    user = user_dao.get_user_by_phone(formatted_phone)
    if not user:
        raise HTTPException(status_code=400, detail="No account found with this mobile number.")

    try:
        result = otp_service.generate_and_send_otp(formatted_phone, purpose="PASSWORD_RESET")
        return GenericResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot-password/verify-otp", response_model=GenericResponse)
def verify_forgot_password_otp(req: OtpVerifyRequest):
    """
    Forgot Password Step 2: Verify OTP and receive short-lived reset token.
    """
    formatted_phone = otp_service.format_phone(req.phone.strip())
    try:
        otp_service.verify_otp(formatted_phone, req.otp, purpose="PASSWORD_RESET")
        reset_token = auth_service.create_temp_token(
            {"phone": formatted_phone, "purpose": "password_reset"},
            expires_minutes=15
        )
        return GenericResponse(
            message="OTP verified successfully. You may now reset your password.",
            reset_token=reset_token
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password", response_model=GenericResponse)
def reset_password(req: ResetPasswordRequest):
    """
    Forgot Password Step 3: Set new password using reset token.
    """
    try:
        payload = auth_service.verify_temp_token(req.reset_token, expected_purpose="password_reset")
        phone = payload.get("phone")
        password_hash = auth_service.hash_password(req.new_password)
        user_dao.update_user_password(phone, password_hash)
        return GenericResponse(message="Password reset successfully. You can now login with your new password.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─── CURRENT USER ──────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(auth_service.get_current_user)):
    """
    Returns current authenticated user details.
    """
    return UserResponse(
        id=current_user["id"],
        full_name=current_user["full_name"],
        phone=current_user["phone"],
        email=current_user.get("email"),
        role=current_user.get("role", "citizen"),
        is_phone_verified=current_user.get("is_phone_verified", True),
        onboardingComplete=False,
    )
