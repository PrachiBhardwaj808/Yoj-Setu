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


class SQLiteDictCursor:
    """Wrapper to make SQLite cursor behave like mysql.connector dictionary cursor."""
    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, sql, params=None):
        # Convert MySQL %s placeholders to SQLite ? placeholders
        sql_sqlite = sql.replace("%s", "?")
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
