export type TravelStyle = 'budget' | 'adventure' | 'relaxation' | 'family' | 'luxury';

export interface TripPreferences {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  budget: number;
  currency: string;
  travelers: number;
  travelStyle: TravelStyle;
  interests: string[];
  transportMode: string;
  accommodationType: string;
  dietaryPreferences: string;
  accessibilityNeeds: string;
  specialNotes: string;
}

export interface ActivityCost {
  amount: number;
  currency: string;
  is_per_person: boolean;
}

export interface ItineraryActivity {
  time_slot: 'Morning' | 'Afternoon' | 'Evening';
  name: string;
  description: string;
  location_area: string;
  estimated_duration_hours: number;
  estimated_cost: ActivityCost;
  tips_or_notes?: string;
}

export interface ItineraryDay {
  day_number: number;
  theme: string;
  date_label?: string;
  neighborhood_focus: string;
  day_summary: string;
  transport_tip: string;
  activities: ItineraryActivity[];
}

export interface BudgetBreakdownItem {
  category: string;
  estimated_amount: number;
  percentage_of_total: number;
  notes: string;
}

export interface EstimatedBudget {
  total_estimated: number;
  user_budget: number;
  currency: string;
  is_per_person: boolean;
  budget_feasibility_assessment: 'Under Budget' | 'Within Budget' | 'Tight Budget' | 'Exceeds Budget';
  budget_advice: string;
  breakdown: BudgetBreakdownItem[];
}

export interface TravelTips {
  local_transportation: string;
  etiquette_and_customs: string;
  safety_and_health: string;
  packing_essentials: string[];
}

export interface TripSummary {
  title: string;
  destination: string;
  duration_days: number;
  travel_style: string;
  travelers: number;
  overview: string;
  highlights: string[];
  best_time_to_visit_note: string;
}

export interface GeneratedItinerary {
  trip_summary: TripSummary;
  assumptions: string[];
  itinerary_days: ItineraryDay[];
  estimated_budget: EstimatedBudget;
  travel_tips: TravelTips;
  limitations: string[];
}

export interface SavedTripRecord {
  id: string;
  title: string;
  destination: string;
  origin: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  budget: number;
  currency: string;
  travelers: number;
  travel_style: string;
  interests: string[];
  transport_mode: string;
  accommodation: string;
  dietary_accessibility?: string;
  itinerary: GeneratedItinerary;
  created_at: string;
}
