"""
Flask application for AI Travel Planner.
"""
import os
import json
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from models import get_engine, init_db, SavedTrip
from validators import validate_trip_input, validate_itinerary_schema
from prompts import SYSTEM_PROMPT, build_user_prompt

load_dotenv()

app = Flask(__name__)

# Restrict CORS to development frontend origin or environment variable
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
CORS(app, origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:3000"])

# Database initialization
DB_URI = os.getenv("DATABASE_URI", "sqlite:///trips.db")
engine = get_engine(DB_URI)
SessionLocal = init_db(engine)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "llm_configured": bool(os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")),
        "database": DB_URI,
    })

@app.route("/api/generate-itinerary", methods=["POST"])
def generate_itinerary():
    data = request.get_json(silent=True)
    valid, errors, cleaned = validate_trip_input(data or {})
    if not valid:
        return jsonify({"success": False, "error": "Validation failed", "details": errors}), 400

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({
            "success": False,
            "error": "Server error: GEMINI_API_KEY is not configured.",
        }), 500

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = build_user_prompt(cleaned)

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config={
                "system_instruction": SYSTEM_PROMPT,
                "response_mime_type": "application/json",
                "temperature": 0.7,
            }
        )

        parsed_itinerary = json.loads(response.text)
        is_schema_valid, schema_errors = validate_itinerary_schema(parsed_itinerary)
        if not is_schema_valid:
            return jsonify({
                "success": False,
                "error": f"LLM output schema validation failed: {', '.join(schema_errors)}"
            }), 500

        return jsonify({
            "success": True,
            "data": parsed_itinerary,
            "parameters": cleaned
        })

    except Exception as e:
        app.logger.error(f"Error generating itinerary: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/trips", methods=["GET"])
def list_trips():
    session = SessionLocal()
    try:
        trips = session.query(SavedTrip).order_by(SavedTrip.created_at.desc()).all()
        return jsonify({
            "success": True,
            "data": [t.to_dict() for t in trips],
            "count": len(trips)
        })
    finally:
        session.close()

@app.route("/api/trips", methods=["POST"])
def save_trip():
    data = request.get_json(silent=True)
    if not data or not data.get("destination") or not data.get("itinerary"):
        return jsonify({"success": False, "error": "Missing destination or itinerary."}), 400

    trip_id = data.get("id") or f"trip_{uuid.uuid4().hex[:12]}"
    session = SessionLocal()
    try:
        trip = SavedTrip(
            id=trip_id,
            title=data.get("title", f"{data['destination']} Trip"),
            destination=data["destination"],
            origin=data.get("origin", "Not specified"),
            start_date=data.get("startDate") or data.get("start_date") or "",
            end_date=data.get("endDate") or data.get("end_date") or "",
            duration_days=int(data.get("durationDays", 3)),
            budget=float(data.get("budget", 1000.0)),
            currency=data.get("currency", "USD"),
            travelers=int(data.get("travelers", 1)),
            travel_style=data.get("travelStyle", "adventure"),
            interests_json=json.dumps(data.get("interests", [])),
            transport_mode=data.get("transportMode", "Public Transit"),
            accommodation=data.get("accommodation", "Hotel"),
            dietary_accessibility=data.get("dietaryPreferences", ""),
            itinerary_json=json.dumps(data["itinerary"]),
        )
        session.add(trip)
        session.commit()
        return jsonify({"success": True, "data": trip.to_dict()}), 201
    except Exception as e:
        session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()

@app.route("/api/trips/<trip_id>", methods=["DELETE"])
def delete_trip(trip_id):
    session = SessionLocal()
    try:
        trip = session.query(SavedTrip).filter(SavedTrip.id == trip_id).first()
        if not trip:
            return jsonify({"success": False, "error": "Trip not found"}), 404
        session.delete(trip)
        session.commit()
        return jsonify({"success": True, "message": "Trip deleted"})
    finally:
        session.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
