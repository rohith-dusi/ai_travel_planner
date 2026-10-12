"""
SQLAlchemy models for persisting travel plans in SQLite.
"""
from datetime import datetime
import json
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class SavedTrip(Base):
    __tablename__ = "saved_trips"

    id = Column(String(64), primary_key=True)
    title = Column(String(200), nullable=False)
    destination = Column(String(100), nullable=False)
    origin = Column(String(100), nullable=False)
    start_date = Column(String(30), nullable=False)
    end_date = Column(String(30), nullable=True)
    duration_days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    travelers = Column(Integer, nullable=False, default=1)
    travel_style = Column(String(50), nullable=False)
    interests_json = Column(Text, nullable=False, default="[]")
    transport_mode = Column(String(100), nullable=False)
    accommodation = Column(String(100), nullable=False)
    dietary_accessibility = Column(Text, nullable=True)
    itinerary_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "destination": self.destination,
            "origin": self.origin,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "duration_days": self.duration_days,
            "budget": self.budget,
            "currency": self.currency,
            "travelers": self.travelers,
            "travel_style": self.travel_style,
            "interests": json.loads(self.interests_json) if self.interests_json else [],
            "transport_mode": self.transport_mode,
            "accommodation": self.accommodation,
            "dietary_accessibility": self.dietary_accessibility,
            "itinerary": json.loads(self.itinerary_json) if self.itinerary_json else {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

def get_engine(db_uri="sqlite:///trips.db"):
    return create_engine(db_uri, echo=False)

def init_db(engine):
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)
