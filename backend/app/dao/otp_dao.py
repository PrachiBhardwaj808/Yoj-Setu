# app/dao/otp_dao.py
#
# Raw SQL functions for the `otp_verifications` table.

from datetime import datetime
from app.db import get_connection


def insert_otp(phone: str, otp_hash: str, purpose: str, expires_at: datetime) -> int:
    """
    Inserts a new OTP record into otp_verifications.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            INSERT INTO otp_verifications (phone, otp_hash, purpose, expires_at, attempts, verified)
            VALUES (%s, %s, %s, %s, 0, FALSE)
        """
        cursor.execute(sql, (phone, otp_hash, purpose, expires_at))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def get_latest_otp(phone: str, purpose: str) -> dict | None:
    """
    Returns the most recently created OTP record for this phone & purpose.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT id, phone, otp_hash, purpose, expires_at, attempts, verified, created_at
            FROM otp_verifications
            WHERE phone = %s AND purpose = %s
            ORDER BY created_at DESC, id DESC
            LIMIT 1
        """
        cursor.execute(sql, (phone, purpose))
        return cursor.fetchone()
    finally:
        conn.close()


def increment_attempts(otp_id: int) -> None:
    """
    Increments the attempt counter for an OTP row.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = %s"
        cursor.execute(sql, (otp_id,))
        conn.commit()
    finally:
        conn.close()


def mark_verified(otp_id: int) -> None:
    """
    Sets verified = TRUE for the given OTP row.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "UPDATE otp_verifications SET verified = TRUE WHERE id = %s"
        cursor.execute(sql, (otp_id,))
        conn.commit()
    finally:
        conn.close()
