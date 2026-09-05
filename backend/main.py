# main.py — FastAPI application entry point
#
# This is where the app is assembled:
#   1. FastAPI app is created
#   2. CORS middleware is configured
#   3. Routers are included
#   4. A startup event auto-creates the DB table if it doesn't exist
#
# HOW TO RUN (from backend/ with venv active):
#   uvicorn main:app --port 8080 --reload
#     main     = this file (main.py)
#     app      = the FastAPI() instance defined below
#     --reload = restart automatically when you save a file (dev only)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ping, auth
from app.db import get_connection


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP: Auto-create database table
# ─────────────────────────────────────────────────────────────────────────────
#
# WHY AUTO-CREATE ON STARTUP?
#   For a solo learning project this is a convenient shortcut — the table
#   always exists without you having to remember to run a SQL script.
#   The IF NOT EXISTS clause makes it idempotent: running it 100 times is
#   safe, it only creates the table on the first run.
#
# WHY NOT IN PRODUCTION?
#   Real production teams use database migration tools (e.g., Alembic for
#   Python, or Flyway/Liquibase which you'd know from Java). These track
#   *changes* to the schema over time, with version history and rollbacks.
#   Auto-creating tables on startup doesn't scale to a team — two
#   developers changing the schema simultaneously would conflict.
#   For Yojsetu solo dev right now, this approach is perfectly fine.

OTP_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs setup code before the server starts accepting requests.
    The `async with` pattern: code before `yield` = startup, after = shutdown.

    Spring Boot equivalent: @PostConstruct on a @Component bean.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(OTP_TABLE_DDL)
        conn.commit()
        print("[startup] ✅ otp_verifications table ready.")
    except Exception as e:
        print(f"[startup] ⚠️  Could not create table: {e}")
        print("[startup] Check your .env DB credentials and MySQL connection.")
    finally:
        conn.close()
    yield   # server is running — requests are now accepted
    # (any shutdown cleanup would go here, after yield)


# ─────────────────────────────────────────────────────────────────────────────
# APP CREATION
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Yojsetu API",
    description="Backend for the Yojsetu platform",
    version="0.1.0",
    lifespan=lifespan,
)


# ─────────────────────────────────────────────────────────────────────────────
# CORS MIDDLEWARE
# ─────────────────────────────────────────────────────────────────────────────
#
# WHY CORS IS NEEDED:
#   The browser's Same-Origin Policy blocks JS running on localhost:5173
#   from calling localhost:8080 — different ports = different origins.
#   CORS headers tell the browser "this server explicitly allows that origin".
#
# FASTAPI vs SPRING BOOT:
#   Spring: implement WebMvcConfigurer, override addCorsMappings(),
#           call registry.addMapping(...).allowedOrigins(...) etc.
#   FastAPI: call app.add_middleware() once — done. Genuinely less code.
#
# PARAMETER NOTES:
#   allow_origins    — exact origins allowed. We use a specific list (not
#                      ["*"]) because allow_credentials=True requires it.
#                      Wildcard + credentials is rejected by browsers.
#   allow_credentials— sends cookies / auth headers cross-origin.
#                      Needed now even though auth isn't implemented yet,
#                      so it's ready when you add JWT cookies later.
#   allow_methods    — ["*"] = GET, POST, PUT, DELETE, OPTIONS, PATCH, etc.
#   allow_headers    — ["*"] = any request header the client sends is allowed.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTERS
# ─────────────────────────────────────────────────────────────────────────────
#
# Spring equivalent: @RestController classes auto-discovered by component scan.
# FastAPI: you explicitly include each router. More transparent — you always
# know exactly which groups of endpoints are active.

app.include_router(ping.router)   # GET /api/ping
app.include_router(auth.router)   # POST /auth/otp/send, POST /auth/otp/verify
