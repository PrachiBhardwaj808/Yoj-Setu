# app/dao/otp_dao.py
#
# Raw SQL functions for the otp_verifications table.
#
# SPRING BOOT EQUIVALENT: This is your DAO layer. Instead of
# JdbcTemplate or NamedParameterJdbcTemplate, we use
# mysql-connector-python's cursor directly.
#
# SQL INJECTION SAFETY — CRITICAL:
#   Always use parameterized queries: cursor.execute("... WHERE x = %s", (value,))
#   The %s placeholder is filled in by the driver AFTER the SQL structure
#   is already sent to MySQL — user data can never be interpreted as SQL.
#   NEVER do: cursor.execute(f"... WHERE x = '{value}'")  ← SQL injection risk!
#
#   This is identical in concept to Java's PreparedStatement / JdbcTemplate:
#     jdbcTemplate.queryForObject("SELECT ... WHERE x = ?", String.class, value)
#   The ? and %s are both "bind parameters" — different syntax, same safety.

from datetime import datetime
from app.db import get_connection


def insert_otp(phone_number: str, otp_code: str, expires_at: datetime) -> None:
    """
    Inserts a new OTP record into otp_verifications.

    Called by otp_service.send_otp() after generating a fresh OTP code.
    Each send creates a new row — we don't overwrite the previous one,
    because get_latest_otp() always fetches the most recent row anyway.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO otp_verifications (phone_number, otp_code, expires_at)
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (phone_number, otp_code, expires_at))
        conn.commit()   # INSERT/UPDATE/DELETE require an explicit commit
    finally:
        conn.close()    # always runs — connection is returned even on exception


def get_latest_otp(phone_number: str) -> dict | None:
    """
    Returns the most recently created OTP row for this phone number,
    or None if no record exists.

    We use dictionary=True on the cursor so each row comes back as a
    plain Python dict ({"id": 1, "phone_number": "...", ...}) rather
    than a positional tuple. Easier to work with by column name.

    Spring Boot equivalent: jdbcTemplate.queryForMap(...) / RowMapper
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)   # rows as dicts, not tuples
        sql = """
            SELECT id, phone_number, otp_code, expires_at, verified
            FROM otp_verifications
            WHERE phone_number = %s
            ORDER BY created_at DESC
            LIMIT 1
        """
        cursor.execute(sql, (phone_number,))    # note: comma makes it a tuple
        return cursor.fetchone()                # dict or None
    finally:
        conn.close()


def mark_verified(otp_id: int) -> None:
    """
    Sets verified = TRUE for the given OTP row.

    Called by otp_service.verify_otp() after all checks pass.
    Marking verified prevents the same OTP being used twice
    (replay attack protection).
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        sql = "UPDATE otp_verifications SET verified = TRUE WHERE id = %s"
        cursor.execute(sql, (otp_id,))
        conn.commit()
    finally:
        conn.close()
