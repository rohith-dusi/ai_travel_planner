# Python Flask Backend — AI Travel Planner

This directory contains the standalone Python / Flask backend implementation of the AI Travel Planner, built for local development, pytest test automation, and your GitHub repository.

## Setup Instructions

### 1. Create a Python Virtual Environment
```bash
cd backend-flask
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file inside `backend-flask/` (copied from `.env.example`):
```env
GEMINI_API_KEY="your-gemini-api-key"
DATABASE_URI="sqlite:///trips.db"
FRONTEND_ORIGIN="http://localhost:3000"
```

### 4. Run Automated Pytest Tests
```bash
pytest tests/ -v
```

### 5. Run the Flask Development Server
```bash
python app.py
```
The API server will run at `http://127.0.0.1:5000` with endpoints:
- `GET /api/health`
- `POST /api/generate-itinerary`
- `GET /api/trips`
- `POST /api/trips`
- `DELETE /api/trips/<trip_id>`
