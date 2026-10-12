"""
Input and Output validation logic for Flask backend.
"""
from typing import Dict, Any, Tuple, List

VALID_TRAVEL_STYLES = {"budget", "adventure", "relaxation", "family", "luxury"}

def validate_trip_input(data: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
    errors = []
    if not isinstance(data, dict):
        return False, ["Request body must be a JSON object."], {}

    origin = str(data.get("origin", "")).strip()
    destination = str(data.get("destination", "")).strip()

    if not origin:
        errors.append("Origin / Starting City is required.")
    elif len(origin) > 100:
        errors.append("Origin cannot exceed 100 characters.")

    if not destination:
        errors.append("Destination is required.")
    elif len(destination) > 100:
        errors.append("Destination cannot exceed 100 characters.")

    try:
        duration_days = int(data.get("durationDays", 0))
        if duration_days < 1 or duration_days > 14:
            errors.append("Duration must be between 1 and 14 days.")
    except (ValueError, TypeError):
        errors.append("Duration must be a valid integer between 1 and 14.")
        duration_days = 0

    try:
        budget = float(data.get("budget", 0))
        if budget <= 0:
            errors.append("Budget must be a positive number greater than 0.")
    except (ValueError, TypeError):
        errors.append("Budget must be a valid positive number.")
        budget = 0.0

    currency = str(data.get("currency", "USD")).strip().upper() or "USD"

    try:
        travelers = int(data.get("travelers", 1))
        if travelers < 1 or travelers > 20:
            errors.append("Travelers must be between 1 and 20.")
    except (ValueError, TypeError):
        errors.append("Travelers must be a valid integer.")
        travelers = 1

    travel_style = str(data.get("travelStyle", "adventure")).strip().lower()
    if travel_style not in VALID_TRAVEL_STYLES:
        errors.append(f"Travel style must be one of: {', '.join(sorted(VALID_TRAVEL_STYLES))}.")

    raw_interests = data.get("interests", [])
    interests = [str(i).strip()[:50] for i in raw_interests if str(i).strip()] if isinstance(raw_interests, list) else []

    cleaned_data = {
        "origin": origin,
        "destination": destination,
        "startDate": str(data.get("startDate", "")).strip()[:20],
        "endDate": str(data.get("endDate", "")).strip()[:20],
        "durationDays": duration_days,
        "budget": budget,
        "currency": currency,
        "travelers": travelers,
        "travelStyle": travel_style,
        "interests": interests,
        "transportMode": str(data.get("transportMode", "Public Transit")).strip()[:100],
        "accommodationType": str(data.get("accommodationType", "Standard Hotel")).strip()[:100],
        "dietaryPreferences": str(data.get("dietaryPreferences", "")).strip()[:300],
        "accessibilityNeeds": str(data.get("accessibilityNeeds", "")).strip()[:300],
        "specialNotes": str(data.get("specialNotes", "")).strip()[:500],
    }

    return (len(errors) == 0), errors, cleaned_data

def validate_itinerary_schema(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    errors = []
    if not isinstance(data, dict):
        return False, ["Output must be a JSON dictionary."]

    required_keys = ["trip_summary", "itinerary_days", "estimated_budget", "travel_tips", "assumptions", "limitations"]
    for key in required_keys:
        if key not in data:
            errors.append(f"Missing required section: '{key}'")

    if "itinerary_days" in data and not isinstance(data["itinerary_days"], list):
        errors.append("'itinerary_days' must be a list.")
    elif "itinerary_days" in data and len(data["itinerary_days"]) == 0:
        errors.append("'itinerary_days' cannot be empty.")

    return (len(errors) == 0), errors
