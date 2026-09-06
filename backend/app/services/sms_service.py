# app/services/sms_service.py
#
# SMS Service Abstraction — handles sending OTP via SMS provider or mock output.

from app.config import SMS_PROVIDER, SMS_API_KEY, SMS_SENDER_ID, OTP_DEV_MODE


def send_otp(phone: str, otp_code: str, purpose: str = "AUTHENTICATION") -> None:
    """
    Dispatches an OTP SMS using the configured SMS provider.
    In development mode or when SMS_PROVIDER='development', logs to backend console.
    """
    if SMS_PROVIDER == "development" or OTP_DEV_MODE:
        print("\n" + "=" * 48)
        print("         YOJSETU DEVELOPMENT OTP LOG         ")
        print("=" * 48)
        print(f"  Phone:   {phone}")
        print(f"  Purpose: {purpose}")
        print(f"  OTP:     {otp_code}")
        print(f"  Expiry:  5 minutes")
        print("=" * 48 + "\n")
        return

    # Real SMS integration placeholder (Twilio / MSG91 / Bhashini / Fast2SMS)
    # E.g.: msg91_client.send_sms(to=phone, template=purpose, otp=otp_code, api_key=SMS_API_KEY)
    pass
