# app/config.py
#
# Loads environment variables from the .env file in the backend/ root.
#
# HOW IT WORKS:
#   1. `load_dotenv()` reads backend/.env and pushes each line into
#      the process's os.environ dictionary.
#   2. `os.getenv("KEY")` then reads those values out.
#
# Spring Boot equivalent: @Value("${db.host}") on a field, except
# python-dotenv is explicit — you can see exactly where every value
# comes from rather than relying on Spring's auto-binding magic.
#
# WHY MODULE-LEVEL CONSTANTS:
#   We read config once when this module is first imported, then every
#   other file just does `from app.config import DB_HOST`. No repetition.

import os
from dotenv import load_dotenv

# Load the .env file. By default this looks for .env in the current
# working directory, which will be backend/ when you run uvicorn.
load_dotenv()

DB_HOST: str = os.getenv("DB_HOST", "localhost")
DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
DB_NAME: str = os.getenv("DB_NAME", "yojsetu_db")
DB_USER: str = os.getenv("DB_USER", "root")
DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
