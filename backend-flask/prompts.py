"""
Prompt templates and system instructions for the LLM.
"""

SYSTEM_PROMPT = """
You are an expert AI Travel Planner and Master Itinerary Designer.
Your job is to generate a realistic, geographically cohesive, culturally respectful, and budget-conscious travel itinerary based on user preferences.

CRITICAL INSTRUCTIONS:
1. Geographical Clustering: Group morning, afternoon, and evening activities in nearby neighborhoods to minimize transit overhead.
2. Budget Estimates: Label all amounts as estimates. Clarify if costs are per-person or group total. Break down into Accommodation, Dining, Transport, Activities, and Contingency.
3. Factual Pacing: Never invent confirmed reservations, live hotel availability, or verified ticket prices. Separate known geography from assumptions.
4. Output Schema: You MUST output strictly valid JSON conforming to the requested schema.
"""

def build_user_prompt(params: dict) -> str:
    return f"""
Generate a structured {params['durationDays']}-day itinerary from {params['origin']} to {params['destination']}.

Parameters:
- Starting City: {params['origin']}
- Destination: {params['destination']}
- Duration: {params['durationDays']} days
- Dates: {params.get('startDate') or 'Flexible'} to {params.get('endDate') or 'Flexible'}
- Total Budget: {params['budget']} {params['currency']} for {params['travelers']} traveler(s)
- Travel Style: {params['travelStyle']}
- Interests: {', '.join(params['interests']) if params['interests'] else 'General exploration'}
- Transport: {params['transportMode']}
- Stay: {params['accommodationType']}
- Dietary: {params.get('dietaryPreferences') or 'None specified'}
- Accessibility: {params.get('accessibilityNeeds') or 'Standard'}
- Special Requests: {params.get('specialNotes') or 'None'}

Return valid JSON with:
- "trip_summary": {{ "title", "destination", "duration_days", "travel_style", "travelers", "overview", "highlights", "best_time_to_visit_note" }}
- "assumptions": [list of strings]
- "itinerary_days": [
    {{
      "day_number": 1,
      "theme": "...",
      "neighborhood_focus": "...",
      "day_summary": "...",
      "transport_tip": "...",
      "activities": [
        {{
          "time_slot": "Morning" | "Afternoon" | "Evening",
          "name": "...",
          "description": "...",
          "location_area": "...",
          "estimated_duration_hours": 2,
          "estimated_cost": {{ "amount": 25, "currency": "{params['currency']}", "is_per_person": true }},
          "tips_or_notes": "..."
        }}
      ]
    }}
  ]
- "estimated_budget": {{
    "total_estimated": number,
    "user_budget": {params['budget']},
    "currency": "{params['currency']}",
    "is_per_person": false,
    "budget_feasibility_assessment": "Under Budget" | "Within Budget" | "Tight Budget" | "Exceeds Budget",
    "budget_advice": "...",
    "breakdown": [
      {{ "category": "Accommodation", "estimated_amount": 0, "percentage_of_total": 0, "notes": "..." }}
    ]
  }}
- "travel_tips": {{ "local_transportation": "...", "etiquette_and_customs": "...", "safety_and_health": "...", "packing_essentials": [] }}
- "limitations": [list of strings]
"""
