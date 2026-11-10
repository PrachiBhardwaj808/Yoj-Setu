# app/db.py
#
# Production database connection pooling and engine management layer.
# Supports MySQL connection pooling with clean, deterministic SQLite fallback.
# Prevents per-query connection timeouts and guards against split-brain engine switching.

import os
import sqlite3
import threading
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# SQLite database file path in backend directory
SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "yojsetu.db")

_pool_lock = threading.Lock()
_mysql_pool: MySQLConnectionPool | None = None
_active_engine: str | None = None  # 'mysql' or 'sqlite'
_engine_initialized: bool = False


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
        # Convert datetime objects to ISO strings for SQLite compatibility across Python 3.12+
        from datetime import datetime, date
        converted = tuple(p.isoformat() if isinstance(p, (datetime, date)) else p for p in params)
        return self.cursor.execute(sql_sqlite, converted)

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
        try:
            self.conn.execute("PRAGMA foreign_keys = ON;")
        except Exception:
            pass

    def cursor(self, dictionary=True):
        self.conn.row_factory = sqlite3.Row
        cur = self.conn.cursor()
        return SQLiteDictCursor(cur)

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()


def init_db_engine(force: bool = False) -> str:
    """
    Initializes the database engine and MySQL connection pool once.
    Determines active engine ('mysql' or 'sqlite') avoiding repeated per-query timeouts.
    """
    global _mysql_pool, _active_engine, _engine_initialized
    with _pool_lock:
        if _engine_initialized and not force:
            return _active_engine

        configured_engine = os.getenv("DB_ENGINE", "").lower().strip()
        if configured_engine == "sqlite":
            _active_engine = "sqlite"
            _engine_initialized = True
            return _active_engine

        # Attempt to initialize MySQL Connection Pool
        try:
            pool = MySQLConnectionPool(
                pool_name="yojsetu_pool",
                pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
                pool_reset_session=True,
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                connect_timeout=int(os.getenv("DB_CONNECT_TIMEOUT", "2")),
            )
            # Test getting a connection from pool and setting UTC timezone
            test_conn = pool.get_connection()
            try:
                cur = test_conn.cursor()
                cur.execute("SET time_zone = '+00:00'")
                cur.close()
            finally:
                test_conn.close()

            _mysql_pool = pool
            _active_engine = "mysql"
            _engine_initialized = True
            return "mysql"
        except Exception as e:
            if configured_engine == "mysql":
                raise RuntimeError(f"Configured DB_ENGINE=mysql but could not initialize MySQL pool: {e}")

            # Fallback to local SQLite database (intended development / testing mode)
            _active_engine = "sqlite"
            _engine_initialized = True
            return "sqlite"


def get_active_engine() -> str:
    """Returns the currently active database engine name ('mysql' or 'sqlite')."""
    global _active_engine, _engine_initialized
    if not _engine_initialized:
        init_db_engine()
    return _active_engine or "sqlite"


def get_connection():
    """
    Returns an active database connection.
    If MySQL pool is active, retrieves a pooled connection.
    If SQLite is active, returns a thread-safe SQLite connection wrapper.
    Avoids silent mid-session engine switching to preserve data consistency.
    """
    global _active_engine, _engine_initialized
    if not _engine_initialized:
        init_db_engine()

    if _active_engine == "mysql":
        if _mysql_pool is None:
            raise RuntimeError("MySQL engine active but connection pool is not initialized.")
        try:
            conn = _mysql_pool.get_connection()
            try:
                cur = conn.cursor()
                cur.execute("SET time_zone = '+00:00'")
                cur.close()
            except Exception:
                pass
            return conn
        except Exception as e:
            raise RuntimeError(f"Failed to retrieve MySQL connection from pool: {e}")

    # SQLite connection
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    return SQLiteConnectionWrapper(sqlite_conn)


def close_pool():
    """Cleans up the MySQL connection pool upon application shutdown."""
    global _mysql_pool, _engine_initialized, _active_engine
    with _pool_lock:
        _mysql_pool = None
        _engine_initialized = False
        _active_engine = None
