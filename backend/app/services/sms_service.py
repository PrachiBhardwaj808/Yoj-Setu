# app/services/sms_service.py
#
# Mock SMS service — prints to terminal instead of calling a real SMS API.
#
# DESIGN:
#   This is a single function with the exact signature a real SMS
#   service would need. When you later integrate Twilio, MSG91, or
#   Bhashini, you only replace the body of this function. The OTP
#   service (otp_service.py) calls `sms_service.send_otp(...)` and
#   doesn't need to change at all.
#
#   Java equivalent: a MockSmsServiceImpl that implements an SmsService
#   interface. Python doesn't require the interface declaration — you
#   just write a function with the right name and parameters.


def send_otp(phone_number: str, otp_code: str) -> None:
    """
    Simulates sending an OTP SMS.

    In production, replace the print() call with a real SMS API call
    (e.g., Twilio client.messages.create(...) or MSG91's REST API).

    The output is clearly formatted so it's easy to spot in the
    backend terminal during development/testing.
    """
    print(f"\n{'='*55}")
    print(f"  [MOCK SMS] Sending OTP {otp_code} to +91-{phone_number}")
    print(f"{'='*55}\n")
