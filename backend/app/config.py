# app/config.py
#
# Loads environment variables from backend/.env

import os
from dotenv import load_dotenv

load_dotenv()

# Database Config
DB_HOST: str = os.getenv("DB_HOST", "localhost")
DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
DB_NAME: str = os.getenv("DB_NAME", "yojsetu_db")
DB_USER: str = os.getenv("DB_USER", "root")
DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

# JWT Config
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "yojsetu_super_secret_jwt_key_2026_dev")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# OTP Config
OTP_DEV_MODE: bool = os.getenv("OTP_DEV_MODE", "true").lower() in ("true", "1", "yes")
OTP_EXPIRY_SECONDS: int = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))
OTP_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))
OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

# SMS Config
SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "development")
SMS_API_KEY: str = os.getenv("SMS_API_KEY", "")
SMS_SENDER_ID: str = os.getenv("SMS_SENDER_ID", "")
