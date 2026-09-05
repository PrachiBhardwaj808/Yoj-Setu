# app/services/otp_service.py
#
# OTP business logic — the service layer.
#
# SPRING BOOT EQUIVALENT: This is your @Service class. It orchestrates
# the flow: generate OTP → save to DB (via DAO) → send SMS (via service).
# It knows about business rules (expiry, already-verified) but knows
# nothing about HTTP — it doesn't touch request/response objects.
#
# WHY secrets.token_digits (NOT random.randint):
#   Python's `random` module is a pseudo-random number generator seeded
#   from the system clock. With a known approximate seed, an attacker
#   could brute-force the sequence. `secrets` uses the OS's
#   cryptographically secure RNG (BCryptGenRandom on Windows,
#   /dev/urandom on Linux) — output is unpredictable by design.
#   Rule: use `random` for games/simulations, `secrets` for security tokens.

import secrets
from datetime import datetime, timedelta, timezone

from app.dao import otp_dao
from app.services import sms_service


# OTP is valid for 5 minutes from the moment it's generated.
OTP_EXPIRY_MINUTES = 5


def send_otp(phone_number: str) -> None:
    """
    Generates a fresh 6-digit OTP, saves it to the DB, and
    calls the SMS service (mock or real) to dispatch it.

    Steps:
      1. Generate cryptographically secure 6-digit code
      2. Calculate expiry timestamp (now + 5 minutes, UTC)
      3. Persist to otp_verifications via DAO
      4. Dispatch via sms_service (currently mock)
    """
    # secrets.randbelow(900000) gives a number in [0, 900000)
    # Adding 100000 ensures we always get a 6-digit number.
    otp_code = str(100000 + secrets.randbelow(900000))

    # Use UTC so the expiry comparison in verify_otp() is timezone-safe.
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    # Persist — the DAO strips timezone info before storing because
    # MySQL DATETIME columns don't carry timezone. We compare in UTC
    # consistently on both ends.
    otp_dao.insert_otp(phone_number, otp_code, expires_at.replace(tzinfo=None))

    # Dispatch (currently just prints to terminal)
    sms_service.send_otp(phone_number, otp_code)


def verify_otp(phone_number: str, submitted_otp: str) -> dict:
    """
    Verifies the submitted OTP code for the given phone number.

    Checks (in order):
      1. Does a record exist for this phone number?
      2. Does the submitted code match the stored code?
      3. Has the OTP expired (older than 5 minutes)?
      4. Has this OTP already been used?

    Returns:
      {"success": True, "message": "OTP verified successfully."}

    Raises:
      ValueError with a human-readable message on any failure.
      The router catches ValueError and returns HTTP 400.

    WHY ValueError, not HTTPException?
      The service layer shouldn't know about HTTP. Raising a plain
      ValueError keeps the service reusable (e.g., if you later call
      this from a CLI tool or a background job). The router converts
      it to the appropriate HTTP status code.
    """
    record = otp_dao.get_latest_otp(phone_number)

    # Check 1: record exists
    if record is None:
        raise ValueError("No OTP found for this phone number. Please request a new one.")

    # Check 2: code matches
    if record["otp_code"] != submitted_otp:
        raise ValueError("Incorrect OTP. Please try again.")

    # Check 3: not expired
    # The stored expires_at has no timezone info (plain MySQL DATETIME).
    # datetime.now(timezone.utc).replace(tzinfo=None) gives naive UTC too.
    now_naive_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    if now_naive_utc > record["expires_at"]:
        raise ValueError("OTP has expired. Please request a new one.")

    # Check 4: not already verified (replay attack prevention)
    if record["verified"]:
        raise ValueError("OTP has already been used. Please request a new one.")

    # All checks passed — mark as verified so it can't be reused
    otp_dao.mark_verified(record["id"])

    return {"success": True, "message": "OTP verified successfully."}
