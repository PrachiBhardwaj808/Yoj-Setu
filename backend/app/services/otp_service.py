# app/services/otp_service.py
#
# OTP business logic layer handling secure 6-digit generation, hashing,
# 60s cooldown enforcement, 5-min expiration, 5-attempt limits, and verification.

import secrets
import hashlib
from datetime import datetime, timedelta, timezone

from app.config import (
    OTP_EXPIRY_SECONDS,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_MAX_ATTEMPTS,
    OTP_DEV_MODE,
)
from app.dao import otp_dao
from app.services import sms_service


def _hash_otp(phone: str, otp_code: str) -> str:
    """Hashes the OTP code combined with phone number for secure storage."""
    salt = "yojsetu_otp_salt_2026"
    raw = f"{phone}:{otp_code}:{salt}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def format_phone(phone: str) -> str:
    """Standardizes phone number format to 10 digits or +91XXXXXXXXXX."""
    cleaned = ''.join(c for c in phone if c.isdigit())
    if len(cleaned) == 10:
        return f"+91{cleaned}"
    elif len(cleaned) == 12 and cleaned.startswith("91"):
        return f"+{cleaned}"
    elif len(cleaned) == 12 or len(cleaned) == 13:
        return phone
    return phone


def generate_and_send_otp(phone: str, purpose: str = "REGISTER") -> dict:
    """
    Generates a fresh 6-digit cryptographically secure OTP, hashes it,
    persists it via DAO, and dispatches via SMS service.
    Enforces a 60-second resend cooldown.
    """
    formatted_phone = format_phone(phone)
    now_utc = datetime.now(timezone.utc)
    now_naive_utc = now_utc.replace(tzinfo=None)

    # Check resend cooldown
    latest_record = otp_dao.get_latest_otp(formatted_phone, purpose)
    if latest_record:
        created_at = latest_record["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elapsed_seconds = (now_naive_utc - created_at).total_seconds()
        if elapsed_seconds < OTP_RESEND_COOLDOWN_SECONDS:
            remaining = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed_seconds)
            raise ValueError(f"Please wait {remaining} seconds before requesting a new OTP.")

    # Generate 6-digit cryptographically secure OTP
    otp_code = str(100000 + secrets.randbelow(900000))
    otp_hash = _hash_otp(formatted_phone, otp_code)
    expires_at = now_naive_utc + timedelta(seconds=OTP_EXPIRY_SECONDS)

    # Persist in DB
    otp_dao.insert_otp(formatted_phone, otp_hash, purpose, expires_at)

    # Dispatch via SMS service (logs to console in dev mode)
    sms_service.send_otp(formatted_phone, otp_code, purpose)

    response = {
        "message": "OTP sent successfully",
        "expires_in": OTP_EXPIRY_SECONDS,
        "cooldown": OTP_RESEND_COOLDOWN_SECONDS,
    }
    if OTP_DEV_MODE:
        response["dev_otp"] = otp_code
    return response


def verify_otp(phone: str, submitted_otp: str, purpose: str = "REGISTER") -> dict:
    """
    Verifies submitted OTP code against stored hash.
    Checks: existence, verification status, attempt limits, expiration, and hash match.
    """
    formatted_phone = format_phone(phone)
    record = otp_dao.get_latest_otp(formatted_phone, purpose)

    if record is None:
        raise ValueError("No OTP request found for this phone number. Please request a new code.")

    if record["verified"]:
        raise ValueError("This OTP has already been verified. Please request a new code.")

    if record["attempts"] >= OTP_MAX_ATTEMPTS:
        raise ValueError("Too many failed attempts. Please request a new OTP.")

    now_naive_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    expires_at = record["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)

    if now_naive_utc > expires_at:
        raise ValueError("This OTP has expired. Request a new code.")

    expected_hash = _hash_otp(formatted_phone, submitted_otp)
    if record["otp_hash"] != expected_hash:
        otp_dao.increment_attempts(record["id"])
        remaining_attempts = OTP_MAX_ATTEMPTS - (record["attempts"] + 1)
        if remaining_attempts <= 0:
            raise ValueError("Too many failed attempts. Please request a new OTP.")
        raise ValueError(f"Incorrect OTP. {remaining_attempts} attempt(s) remaining.")

    # All checks passed — mark as verified
    otp_dao.mark_verified(record["id"])
    return {"verified": True, "message": "OTP verified successfully."}
