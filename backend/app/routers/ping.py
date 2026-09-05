# app/routers/ping.py
#
# Health-check endpoint: GET /api/ping → "pong"
#
# SPRING BOOT EQUIVALENT:
#   @RestController
#   @RequestMapping("/api")
#   public class PingController {
#       @GetMapping("/ping")
#       public String ping() { return "pong"; }
#   }
#
# WHAT IS APIRouter?
#   An APIRouter is a mini-app that collects related route definitions.
#   You define routes on it exactly like you would on the main FastAPI
#   app, then in main.py you call app.include_router(router).
#   This keeps main.py clean as the project grows.
#
#   The prefix="/api" here means every route in this file is
#   automatically prefixed — so @router.get("/ping") becomes GET /api/ping.

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/ping")
def ping():
    """
    Health-check endpoint.

    The frontend calls this on startup to confirm the backend is alive.
    Returns a plain string "pong" (FastAPI wraps it in JSON automatically).

    Try it: GET http://localhost:8080/api/ping
    Or in browser: http://localhost:8080/api/ping
    """
    return "pong"
