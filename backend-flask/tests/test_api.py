"""
Pytest unit & integration tests for Flask backend.
"""
import pytest
import json
from app import app
from validators import validate_trip_input, validate_itinerary_schema

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"

def test_input_validation_empty():
    valid, errors, data = validate_trip_input({})
    assert valid is False
    assert any("Origin" in e for e in errors)
    assert any("Destination" in e for e in errors)

def test_input_validation_valid():
    sample = {
        "origin": "Seattle",
        "destination": "Kyoto",
        "durationDays": 5,
        "budget": 2500,
        "currency": "USD",
        "travelers": 2,
        "travelStyle": "adventure",
        "interests": ["history", "food", "nature"],
        "transportMode": "Train",
        "accommodationType": "Ryokan",
    }
    valid, errors, data = validate_trip_input(sample)
    assert valid is True
    assert len(errors) == 0
    assert data["durationDays"] == 5
    assert data["travelStyle"] == "adventure"

def test_input_validation_invalid_style():
    sample = {
        "origin": "Seattle",
        "destination": "Kyoto",
        "durationDays": 5,
        "budget": 2500,
        "travelStyle": "extreme_spacewalk",
    }
    valid, errors, data = validate_trip_input(sample)
    assert valid is False
    assert any("Travel style must be one of" in e for e in errors)

def test_itinerary_schema_validation():
    valid_payload = {
        "trip_summary": {"title": "Kyoto Trip"},
        "itinerary_days": [{"day_number": 1, "theme": "Temples", "activities": []}],
        "estimated_budget": {"total_estimated": 2000},
        "travel_tips": {"local_transportation": "Bus pass"},
        "assumptions": ["Train pass bought"],
        "limitations": ["Pre-booking required for tea house"]
    }
    is_valid, errors = validate_itinerary_schema(valid_payload)
    assert is_valid is True

    invalid_payload = {"trip_summary": {"title": "Missing pieces"}}
    is_valid_bad, errors_bad = validate_itinerary_schema(invalid_payload)
    assert is_valid_bad is False
    assert len(errors_bad) > 0
