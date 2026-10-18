# app/services/profile_normalizer.py
#
# Maps user profile fields into a clean, normalized structure for rule evaluation.

def parse_income_range(income_str: str) -> float:
    """Parses income range string into an upper bound numeric value in INR."""
    if not income_str:
        return 999999999.0
    s = income_str.lower()
    if 'below ₹1' in s or 'below 1' in s:
        return 100000.0
    elif '1–2.5' in s or '1-2.5' in s or '2.5 lakh' in s:
        return 250000.0
    elif '2.5–5' in s or '2.5-5' in s or '5 lakh' in s:
        return 500000.0
    elif '5–8' in s or '5-8' in s or '8 lakh' in s:
        return 800000.0
    elif '8–10' in s or '8-10' in s or '10 lakh' in s:
        return 1000000.0
    elif 'above' in s:
        return 1500000.0
    return 500000.0  # Reasonable default estimate if ambiguous


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

    hh_income = profile_dict.get("annual_household_income", "")
    hh_income_num = parse_income_range(hh_income)

    return {
        "age": age,
        "gender": str(profile_dict.get("gender", "")).strip().capitalize(),
        "state": str(profile_dict.get("state", "All India")).strip(),
        "district": str(profile_dict.get("district", "")).strip(),
        "rural_urban": str(profile_dict.get("rural_urban", "Rural")).strip().capitalize(),
        "occupation": str(profile_dict.get("occupation", "")).strip(),
        "annual_household_income": hh_income_num,
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
        "has_aadhaar": profile_dict.get("has_aadhaar", "Yes") == "Yes",
        "has_bank_account": profile_dict.get("has_bank_account", "Yes") == "Yes",
        "has_ration_card": profile_dict.get("has_ration_card", "Yes") == "Yes",
        "has_income_certificate": profile_dict.get("has_income_certificate", "No") == "Yes",
        "has_caste_certificate": profile_dict.get("has_caste_certificate", "No") == "Yes",
        "has_disability_certificate": profile_dict.get("has_disability_certificate", "No") == "Yes",
        "has_land_document": profile_dict.get("has_land_document", "No") == "Yes",
    }
