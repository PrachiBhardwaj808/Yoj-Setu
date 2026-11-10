# app/services/profile_normalizer.py
#
# Maps user profile fields into a clean, normalized structure for rule evaluation.

import re
from typing import Any, Optional


def parse_income_range(income_val: Any) -> Optional[float]:
    """
    Parses income values and range strings into a normalized upper bound numeric float in INR.
    Supports:
    - Exact numeric values (80000, 150000, 200000, int, float, string)
    - Currency symbols and commas (e.g. ₹1,50,000, 150,000)
    - Common Indian lakh formats (1.5 lakh, 2 lakh, 2.5 lakh, 8 lakh, 10 lakh)
    - Ranges (₹1–2.5 lakh, 2.5–5 lakh, 5–8 lakh, 8–10 lakh, 1-2.5)
    - Thresholds (below 1 lakh, under 2 lakh, above 10 lakh)
    - Safely returns None for invalid, empty, or uninformative values.
    """
    if income_val is None:
        return None
    if isinstance(income_val, (int, float)):
        return float(income_val)

    s = str(income_val).strip()
    if not s or s.lower() in ("prefer not to say", "not specified", "n/a", "na", "none", "unknown", "null", "undefined"):
        return None

    # Normalize en-dash / em-dash to hyphen and lowercase
    s_norm = s.replace("–", "-").replace("—", "-").lower()

    # Range pattern, e.g. 1-2.5 lakh, 2.5-5 lakh, 5-8 lakh, 8-10 lakh
    range_match = re.search(r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)?', s_norm)
    if range_match:
        upper = float(range_match.group(2))
        if upper <= 100 or "lakh" in s_norm or "lac" in s_norm:
            return upper * 100000.0
        return upper

    # Below / Under X lakh
    below_match = re.search(r'(?:below|under|<|less than|up to)\s*(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)?', s_norm)
    if below_match:
        val = float(below_match.group(1))
        if val <= 100 or "lakh" in s_norm or "lac" in s_norm:
            return val * 100000.0
        return val

    # Above X lakh
    above_match = re.search(r'(?:above|>|greater than|more than)\s*(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)?', s_norm)
    if above_match:
        val = float(above_match.group(1))
        base = val * 100000.0 if (val <= 100 or "lakh" in s_norm or "lac" in s_norm) else val
        return base * 1.5

    # Single value with lakh / lac, e.g. '1.5 lakh', '2 lakh'
    lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs)', s_norm)
    if lakh_match:
        return float(lakh_match.group(1)) * 100000.0

    # Single value with crore / cr, e.g. '1 crore'
    crore_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)', s_norm)
    if crore_match:
        return float(crore_match.group(1)) * 10000000.0

    # Direct numeric value (stripping currency symbols, commas, spaces)
    clean_num = re.sub(r'[₹,\s]|rs\.?|inr', '', s_norm)
    try:
        return float(clean_num)
    except ValueError:
        pass

    # Legacy fallback phrases
    if "above" in s_norm:
        return 1500000.0

    return None


def _is_doc_available(val: Any, default_val: bool = False) -> bool:
    """Helper to evaluate truthiness of document availability indicators."""
    if val is None:
        return default_val
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return val != 0
    if isinstance(val, str):
        cleaned = val.strip().lower()
        if cleaned in ("yes", "true", "1", "available", "y"):
            return True
        if cleaned in ("no", "false", "0", "not available", "n", "not applicable", "not sure", "in progress"):
            return False
    return bool(val)


def normalize_profile(profile_dict: dict) -> dict:
    """
    Takes raw profile data dictionary and returns normalized key-value structure.
    """
    age = profile_dict.get("age")
    if age is None or age == "":
        dob = profile_dict.get("date_of_birth")
        if dob:
            try:
                from datetime import datetime
                birth = datetime.strptime(dob, "%Y-%m-%d")
                today = datetime.now()
                age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
            except Exception:
                age = 28
        else:
            age = 28
    else:
        try:
            age = int(age)
        except Exception:
            age = 28

    hh_income = profile_dict.get("annual_household_income")
    if hh_income is None or hh_income == "":
        hh_income = profile_dict.get("annual_income", "")
    hh_income_num = parse_income_range(hh_income)

    normalized = {
        "age": age,
        "gender": str(profile_dict.get("gender", "")).strip().capitalize(),
        "state": str(profile_dict.get("state", "All India")).strip(),
        "district": str(profile_dict.get("district", "")).strip(),
        "rural_urban": str(profile_dict.get("rural_urban", "Rural")).strip().capitalize(),
        "occupation": str(profile_dict.get("occupation", "")).strip(),
        "annual_household_income": hh_income_num,
        "annual_income": hh_income_num,
        "land_ownership": str(profile_dict.get("land_ownership", "")).strip(),
        "land_holding": str(profile_dict.get("land_holding", "")).strip(),
        "social_category": str(profile_dict.get("social_category", "General")).strip(),
        "disability_status": str(profile_dict.get("disability_status", "No")).strip(),
        "bpl_status": str(profile_dict.get("bpl_status", "No")).strip(),
        "minority_status": str(profile_dict.get("minority_status", "No")).strip(),
        "marital_status": str(profile_dict.get("marital_status", "Single")).strip(),
        "family_size": int(profile_dict.get("family_size", 4) or 4),
        "children_count": int(profile_dict.get("children_count", 0) or 0),
        "housing_status": str(profile_dict.get("housing_status", "")).strip(),
        # Document flags
        "has_aadhaar": _is_doc_available(profile_dict.get("has_aadhaar"), default_val=True),
        "has_electricity_bill": _is_doc_available(
            profile_dict.get("has_electricity_bill")
            if profile_dict.get("has_electricity_bill") is not None
            else profile_dict.get("electricity_bill")
            if profile_dict.get("electricity_bill") is not None
            else profile_dict.get("electricity_connection"),
            default_val=True
        ),
        "has_bank_account": _is_doc_available(profile_dict.get("has_bank_account"), default_val=True),
        "has_ration_card": _is_doc_available(profile_dict.get("has_ration_card"), default_val=True),
        "has_income_certificate": _is_doc_available(profile_dict.get("has_income_certificate"), default_val=False),
        "has_caste_certificate": _is_doc_available(profile_dict.get("has_caste_certificate"), default_val=False),
        "has_disability_certificate": _is_doc_available(profile_dict.get("has_disability_certificate"), default_val=False),
        "has_land_document": _is_doc_available(profile_dict.get("has_land_document"), default_val=False),
    }

    # Preserve any additional custom fields passed in profile_dict
    for k, v in profile_dict.items():
        if k not in normalized:
            normalized[k] = v

    return normalized
