# app/db.py
#
# Raw database connection helper — no ORM, no connection pool.
#
# HOW IT WORKS:
#   `get_connection()` opens a brand-new MySQL connection using the
#   credentials from app/config.py and returns it to the caller.
#   The caller is responsible for closing it (see the try/finally
#   pattern used in every DAO function).
#
# WHY NOT A GLOBAL CONNECTION?
#   1. MySQL closes idle connections after ~8 hours (wait_timeout).
#      A global opened at startup would die overnight and crash the
#      next request with "Lost connection to MySQL server".
#   2. A single connection isn't safe to use from two requests at
#      the same time — you'd get interleaved queries.
#   Opening a connection per call avoids both problems cleanly.
#
# Spring Boot equivalent: DataSource / JdbcTemplate handled all this
# automatically. Here we do it explicitly — which also means you can
# see exactly what's happening.

import mysql.connector
from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD


def get_connection():
    """
    Opens and returns a new MySQL connection.

    Usage pattern in every DAO:
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT ...", (param,))
            result = cursor.fetchone()
            conn.commit()          # needed for INSERT/UPDATE/DELETE
            return result
        finally:
            conn.close()           # always runs, even if an exception occurs
    """
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
