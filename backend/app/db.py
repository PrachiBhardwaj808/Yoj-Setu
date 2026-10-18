# app/db.py
#
# Raw database connection helper — no ORM, no connection pool.
# Supports MySQL with graceful fallback to local SQLite (yojsetu.db)
# if MySQL connection fails or credentials are not configured.

import os
import sqlite3
import mysql.connector
from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# SQLite database file path in backend directory
SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "yojsetu.db")


def _convert_mysql_placeholders_to_sqlite(sql: str) -> str:
    """
    Safely converts unquoted MySQL %s placeholders to SQLite ? placeholders.
    Preserves literal %s or %% inside single quotes, double quotes, and strings.
    """
    result = []
    i = 0
    n = len(sql)
    in_single_quote = False
    in_double_quote = False
    escape = False

    while i < n:
        char = sql[i]

        if escape:
            result.append(char)
            escape = False
            i += 1
            continue

        if char == '\\':
            escape = True
            result.append(char)
            i += 1
            continue

        if char == "'" and not in_double_quote:
            in_single_quote = not in_single_quote
            result.append(char)
            i += 1
            continue

        if char == '"' and not in_single_quote:
            in_double_quote = not in_double_quote
            result.append(char)
            i += 1
            continue

        if not in_single_quote and not in_double_quote:
            if char == '%' and i + 1 < n and sql[i + 1] == '%':
                result.append('%%')
                i += 2
                continue
            if char == '%' and i + 1 < n and sql[i + 1] == 's':
                result.append('?')
                i += 2
                continue

        result.append(char)
        i += 1

    return "".join(result)


class SQLiteDictCursor:
    """Wrapper to make SQLite cursor behave like mysql.connector dictionary cursor."""
    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, sql, params=None):
        sql_sqlite = _convert_mysql_placeholders_to_sqlite(sql)
        if params is None:
            return self.cursor.execute(sql_sqlite)
        return self.cursor.execute(sql_sqlite, params)

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self):
        rows = self.cursor.fetchall()
        return [dict(row) for row in rows]

    @property
    def lastrowid(self):
        return self.cursor.lastrowid

    @property
    def rowcount(self):
        return self.cursor.rowcount


class SQLiteConnectionWrapper:
    """Wrapper to give SQLite connection an API compatible with mysql-connector."""
    def __init__(self, conn):
        self.conn = conn

    def cursor(self, dictionary=True):
        self.conn.row_factory = sqlite3.Row
        cur = self.conn.cursor()
        return SQLiteDictCursor(cur)

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()


def get_connection():
    """
    Opens and returns a new DB connection.
    Attempts MySQL first; falls back to SQLite if MySQL is unavailable.
    """
    try:
        return mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            connect_timeout=3,
        )
    except Exception as e:
        # Fallback to local SQLite database
        sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
        return SQLiteConnectionWrapper(sqlite_conn)
