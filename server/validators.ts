/**
 * Validation and schema verification for trip requests and generated itineraries.
 */

export interface TripPreferencesInput {
  origin: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  budget: number;
  currency: string;
  travelers: number;
  travelStyle: 'budget' | 'adventure' | 'relaxation' | 'family' | 'luxury';
  interests: string[];
  transportMode: string;
  accommodationType: string;
  dietaryPreferences?: string;
  accessibilityNeeds?: string;
  specialNotes?: string;
}

export interface ItineraryActivity {
  time_slot: 'Morning' | 'Afternoon' | 'Evening';
  name: string;
  description: string;
  location_area: string;
  estimated_duration_hours: number;
  estimated_cost: {
    amount: number;
    currency: string;
    is_per_person: boolean;
  };
  tips_or_notes?: string;
}

export interface ItineraryDay {
  day_number: number;
  theme: string;
  date_label?: string;
  neighborhood_focus: string;
  activities: ItineraryActivity[];
  day_summary: string;
  transport_tip: string;
}

export interface BudgetBreakdownItem {
  category: string;
  estimated_amount: number;
  percentage_of_total: number;
  notes: string;
}

export interface GeneratedItinerary {
  trip_summary: {
    title: string;
    destination: string;
    duration_days: number;
    travel_style: string;
    travelers: number;
    overview: string;
    highlights: string[];
    best_time_to_visit_note: string;
  };
  assumptions: string[];
  itinerary_days: ItineraryDay[];
  estimated_budget: {
    total_estimated: number;
    user_budget: number;
    currency: string;
    is_per_person: boolean;
    breakdown: BudgetBreakdownItem[];
    budget_feasibility_assessment: 'Under Budget' | 'Within Budget' | 'Tight Budget' | 'Exceeds Budget';
    budget_advice: string;
  };
  travel_tips: {
    local_transportation: string;
    etiquette_and_customs: string;
    safety_and_health: string;
    packing_essentials: string[];
  };
  limitations: string[];
}

export function validateTripInput(input: any): { valid: boolean; errors: string[]; data?: TripPreferencesInput } {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Request body must be a valid JSON object.'] };
  }

  const origin = typeof input.origin === 'string' ? input.origin.trim() : '';
  const destination = typeof input.destination === 'string' ? input.destination.trim() : '';

  if (!origin) {
    errors.push('Starting city/origin is required.');
  } else if (origin.length > 100) {
    errors.push('Origin city cannot exceed 100 characters.');
  }

  if (!destination) {
    errors.push('Destination is required.');
  } else if (destination.length > 100) {
    errors.push('Destination cannot exceed 100 characters.');
  }

  const durationDays = Number(input.durationDays);
  if (isNaN(durationDays) || durationDays < 1 || durationDays > 14) {
    errors.push('Duration must be between 1 and 14 days.');
  }

  const budget = Number(input.budget);
  if (isNaN(budget) || budget <= 0) {
    errors.push('Budget must be a positive number greater than 0.');
  }

  const currency = typeof input.currency === 'string' && input.currency.trim().length > 0
    ? input.currency.trim().toUpperCase()
    : 'USD';

  const travelers = Number(input.travelers);
  if (isNaN(travelers) || travelers < 1 || travelers > 20) {
    errors.push('Travelers count must be between 1 and 20.');
  }

  const validStyles = ['budget', 'adventure', 'relaxation', 'family', 'luxury'];
  const travelStyle = typeof input.travelStyle === 'string' ? input.travelStyle.toLowerCase() : 'adventure';
  if (!validStyles.includes(travelStyle)) {
    errors.push(`Travel style must be one of: ${validStyles.join(', ')}.`);
  }

  const interests = Array.isArray(input.interests)
    ? input.interests.filter((i: any) => typeof i === 'string' && i.trim().length > 0).map((i: string) => i.trim().slice(0, 50))
    : [];

  const transportMode = typeof input.transportMode === 'string' ? input.transportMode.trim().slice(0, 100) : 'Public Transit';
  const accommodationType = typeof input.accommodationType === 'string' ? input.accommodationType.trim().slice(0, 100) : 'Standard Hotel';
  const dietaryPreferences = typeof input.dietaryPreferences === 'string' ? input.dietaryPreferences.trim().slice(0, 300) : '';
  const accessibilityNeeds = typeof input.accessibilityNeeds === 'string' ? input.accessibilityNeeds.trim().slice(0, 300) : '';
  const specialNotes = typeof input.specialNotes === 'string' ? input.specialNotes.trim().slice(0, 500) : '';

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      origin,
      destination,
      startDate: input.startDate ? String(input.startDate).slice(0, 20) : undefined,
      endDate: input.endDate ? String(input.endDate).slice(0, 20) : undefined,
      durationDays,
      budget,
      currency,
      travelers,
      travelStyle: travelStyle as any,
      interests,
      transportMode,
      accommodationType,
      dietaryPreferences,
      accessibilityNeeds,
      specialNotes,
    },
  };
}

export function validateItinerarySchema(data: any): { valid: boolean; errors: string[]; validated?: GeneratedItinerary } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Itinerary response must be an object.'] };
  }

  if (!data.trip_summary || typeof data.trip_summary !== 'object') {
    errors.push('Missing trip_summary section.');
  }

  if (!Array.isArray(data.itinerary_days) || data.itinerary_days.length === 0) {
    errors.push('itinerary_days must be a non-empty array.');
  }

  if (!data.estimated_budget || typeof data.estimated_budget !== 'object') {
    errors.push('Missing estimated_budget section.');
  }

  if (!Array.isArray(data.assumptions)) {
    data.assumptions = ['Budget amounts are seasonal estimates only.', 'Flights/long-distance travel booked in advance.'];
  }

  if (!Array.isArray(data.limitations)) {
    data.limitations = ['Real-time ticket availability and exact opening hours must be checked before travel.'];
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Normalize days
  const normalizedDays: ItineraryDay[] = (data.itinerary_days || []).map((day: any, idx: number) => ({
    day_number: Number(day.day_number) || idx + 1,
    theme: String(day.theme || `Day ${idx + 1}`),
    date_label: day.date_label ? String(day.date_label) : undefined,
    neighborhood_focus: String(day.neighborhood_focus || 'Central District'),
    activities: Array.isArray(day.activities) ? day.activities.map((a: any) => ({
      time_slot: ['Morning', 'Afternoon', 'Evening'].includes(a.time_slot) ? a.time_slot : 'Morning',
      name: String(a.name || 'Activity'),
      description: String(a.description || ''),
      location_area: String(a.location_area || ''),
      estimated_duration_hours: Number(a.estimated_duration_hours) || 2,
      estimated_cost: {
        amount: Number(a.estimated_cost?.amount) || 0,
        currency: String(a.estimated_cost?.currency || 'USD'),
        is_per_person: a.estimated_cost?.is_per_person !== false,
      },
      tips_or_notes: a.tips_or_notes ? String(a.tips_or_notes) : undefined,
    })) : [],
    day_summary: String(day.day_summary || ''),
    transport_tip: String(day.transport_tip || 'Use local transit or walk.'),
  }));

  const validated: GeneratedItinerary = {
    trip_summary: {
      title: String(data.trip_summary.title || 'Personalized Travel Plan'),
      destination: String(data.trip_summary.destination || ''),
      duration_days: Number(data.trip_summary.duration_days) || normalizedDays.length,
      travel_style: String(data.trip_summary.travel_style || 'adventure'),
      travelers: Number(data.trip_summary.travelers) || 1,
      overview: String(data.trip_summary.overview || ''),
      highlights: Array.isArray(data.trip_summary.highlights) ? data.trip_summary.highlights.map(String) : [],
      best_time_to_visit_note: String(data.trip_summary.best_time_to_visit_note || ''),
    },
    assumptions: data.assumptions.map(String),
    itinerary_days: normalizedDays,
    estimated_budget: {
      total_estimated: Number(data.estimated_budget.total_estimated) || 0,
      user_budget: Number(data.estimated_budget.user_budget) || 0,
      currency: String(data.estimated_budget.currency || 'USD'),
      is_per_person: data.estimated_budget.is_per_person === true,
      breakdown: Array.isArray(data.estimated_budget.breakdown) ? data.estimated_budget.breakdown.map((b: any) => ({
        category: String(b.category || 'General'),
        estimated_amount: Number(b.estimated_amount) || 0,
        percentage_of_total: Number(b.percentage_of_total) || 0,
        notes: String(b.notes || ''),
      })) : [],
      budget_feasibility_assessment: ['Under Budget', 'Within Budget', 'Tight Budget', 'Exceeds Budget'].includes(data.estimated_budget.budget_feasibility_assessment)
        ? data.estimated_budget.budget_feasibility_assessment
        : 'Within Budget',
      budget_advice: String(data.estimated_budget.budget_advice || ''),
    },
    travel_tips: {
      local_transportation: String(data.travel_tips?.local_transportation || 'Public transit recommended.'),
      etiquette_and_customs: String(data.travel_tips?.etiquette_and_customs || ''),
      safety_and_health: String(data.travel_tips?.safety_and_health || 'Keep emergency contacts and travel insurance handy.'),
      packing_essentials: Array.isArray(data.travel_tips?.packing_essentials) ? data.travel_tips.packing_essentials.map(String) : [],
    },
    limitations: data.limitations.map(String),
  };

  return { valid: true, errors: [], validated };
}
