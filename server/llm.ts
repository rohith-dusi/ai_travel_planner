/**
 * Server-side LLM Integration using Google GenAI SDK (@google/genai)
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Search and load .env across common project locations
const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
];
for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    break;
  }
}

import { GoogleGenAI, Type } from '@google/genai';
import type { TripPreferencesInput, GeneratedItinerary } from './validators.ts';
import { validateItinerarySchema } from './validators.ts';

export function getCleanApiKey(): string {
  // Re-read .env if needed
  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
      break;
    }
  }

  const raw = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const clean = raw.replace(/^["']|["']$/g, '').replace(/[\r\n]/g, '').trim();
  return clean;
}

function getAiClient(): GoogleGenAI {
  const apiKey = getCleanApiKey();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is missing or still set to the placeholder "MY_GEMINI_API_KEY". Open your .env file in VS Code, paste your real API key from https://aistudio.google.com/app/apikey, and restart your server (npm run dev).'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `
You are an expert, honest, and meticulous AI Travel Planner and Master Itinerary Designer.
Your role is to build practical, geographically coherent, culturally respectful, and budget-conscious travel itineraries based strictly on user preferences.

Core Principles:
1. Practical Pacing & Geographical Clustering:
   - Group morning, afternoon, and evening activities within reasonable walking or transit distance in the same neighborhood/zone.
   - Avoid unrealistic travel sprints across distant parts of a city or region in one day.
   - Account for transit time, rest breaks, and meal times.

2. Realistic Estimated Budgets:
   - Provide realistic cost estimates labeled explicitly as estimates.
   - Clearly designate whether activity and budget amounts are per person or total for the group.
   - Break down budget into: Accommodation, Food & Dining, Local Transport, Activities & Sightseeing, and Miscellaneous/Contingency.
   - Ensure the breakdown totals align with the user's total budget and assess feasibility (Under Budget, Within Budget, Tight Budget, or Exceeds Budget) with constructive advice.

3. Honesty & Factuality:
   - Never invent confirmed hotel availability, live ticket prices, exact real-time opening hours, or dynamic transportation schedules.
   - Clearly delineate provided facts from assumptions, recommendations, and seasonal projections.
   - State transparent limitations (e.g., ticket pre-booking requirements, seasonal closures).

4. Safety & Inclusivity:
   - Respect dietary preferences (halal, kosher, vegan, allergy notes) and accessibility requirements (step-free, wheelchair accessible, low stamina).
   - Provide genuine cultural etiquette advice and local safety tips.

5. Strict JSON Output:
   - You MUST respond strictly with valid JSON conforming to the requested schema.
`;

const schemaConfig = {
  type: Type.OBJECT,
  properties: {
    trip_summary: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        destination: { type: Type.STRING },
        duration_days: { type: Type.INTEGER },
        travel_style: { type: Type.STRING },
        travelers: { type: Type.INTEGER },
        overview: { type: Type.STRING },
        highlights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        best_time_to_visit_note: { type: Type.STRING },
      },
      required: ['title', 'destination', 'duration_days', 'travel_style', 'travelers', 'overview', 'highlights'],
    },
    assumptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    itinerary_days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day_number: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          date_label: { type: Type.STRING },
          neighborhood_focus: { type: Type.STRING },
          day_summary: { type: Type.STRING },
          transport_tip: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time_slot: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                location_area: { type: Type.STRING },
                estimated_duration_hours: { type: Type.NUMBER },
                estimated_cost: {
                  type: Type.OBJECT,
                  properties: {
                    amount: { type: Type.NUMBER },
                    currency: { type: Type.STRING },
                    is_per_person: { type: Type.BOOLEAN },
                  },
                  required: ['amount', 'currency', 'is_per_person'],
                },
                tips_or_notes: { type: Type.STRING },
              },
              required: ['time_slot', 'name', 'description', 'location_area', 'estimated_duration_hours', 'estimated_cost'],
            },
          },
        },
        required: ['day_number', 'theme', 'neighborhood_focus', 'activities', 'day_summary', 'transport_tip'],
      },
    },
    estimated_budget: {
      type: Type.OBJECT,
      properties: {
        total_estimated: { type: Type.NUMBER },
        user_budget: { type: Type.NUMBER },
        currency: { type: Type.STRING },
        is_per_person: { type: Type.BOOLEAN },
        budget_feasibility_assessment: { type: Type.STRING },
        budget_advice: { type: Type.STRING },
        breakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              estimated_amount: { type: Type.NUMBER },
              percentage_of_total: { type: Type.NUMBER },
              notes: { type: Type.STRING },
            },
            required: ['category', 'estimated_amount', 'percentage_of_total', 'notes'],
          },
        },
      },
      required: ['total_estimated', 'user_budget', 'currency', 'is_per_person', 'budget_feasibility_assessment', 'budget_advice', 'breakdown'],
    },
    travel_tips: {
      type: Type.OBJECT,
      properties: {
        local_transportation: { type: Type.STRING },
        etiquette_and_customs: { type: Type.STRING },
        safety_and_health: { type: Type.STRING },
        packing_essentials: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['local_transportation', 'etiquette_and_customs', 'safety_and_health', 'packing_essentials'],
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['trip_summary', 'assumptions', 'itinerary_days', 'estimated_budget', 'travel_tips', 'limitations'],
};

export function generateOfflineItinerary(preferences: TripPreferencesInput): GeneratedItinerary {
  const currency = preferences.currency || 'USD';
  const totalEst = Math.round(preferences.budget * 0.92);
  const isPerPerson = false;

  const days = Array.from({ length: preferences.durationDays }, (_, i) => {
    const dayNum = i + 1;
    return {
      day_number: dayNum,
      theme: dayNum === 1
        ? 'Arrival, Orientation & Historic Center'
        : dayNum === preferences.durationDays
          ? 'Final Exploration & Cultural Souvenirs'
          : `Scenic Discovery & Neighborhood Immersion (Day ${dayNum})`,
      neighborhood_focus: dayNum === 1 ? 'Central Old Town' : 'Historic & Arts District',
      day_summary: `Explore iconic landmarks, local food markets, and cultural districts in ${preferences.destination}.`,
      transport_tip: `Use ${preferences.transportMode || 'public transit'} or walkable pedestrian zones.`,
      activities: [
        {
          time_slot: 'Morning' as const,
          name: dayNum === 1 ? 'Historic Center Walking Tour' : 'Local Market & Architecture Stroll',
          description: `Begin the day exploring historic streets, plazas, and architectural landmarks in ${preferences.destination}.`,
          location_area: 'Central District',
          estimated_duration_hours: 3,
          estimated_cost: {
            amount: Math.round((preferences.budget * 0.05) / preferences.durationDays),
            currency,
            is_per_person: true,
          },
          tips_or_notes: 'Arrive early before mid-day crowds gather.',
        },
        {
          time_slot: 'Afternoon' as const,
          name: 'Regional Culinary Tasting & Cultural Sites',
          description: `Savor regional dishes and visit recommended heritage museums or scenic viewpoints.`,
          location_area: 'Cultural Quarter',
          estimated_duration_hours: 3.5,
          estimated_cost: {
            amount: Math.round((preferences.budget * 0.08) / preferences.durationDays),
            currency,
            is_per_person: true,
          },
          tips_or_notes: 'Check opening hours and book entry tickets in advance if applicable.',
        },
        {
          time_slot: 'Evening' as const,
          name: 'Sunset Vista & Dinner Experience',
          description: `Enjoy dinner in a vibrant neighborhood, followed by scenic evening city lights.`,
          location_area: 'Waterfront / Promenade',
          estimated_duration_hours: 2.5,
          estimated_cost: {
            amount: Math.round((preferences.budget * 0.1) / preferences.durationDays),
            currency,
            is_per_person: true,
          },
          tips_or_notes: 'Reservations are recommended for popular local restaurants.',
        },
      ],
    };
  });

  return {
    trip_summary: {
      title: `${preferences.durationDays}-Day ${preferences.destination} Journey`,
      destination: preferences.destination,
      duration_days: preferences.durationDays,
      travel_style: preferences.travelStyle,
      travelers: preferences.travelers,
      overview: `A personalized itinerary crafted for ${preferences.travelers} traveler(s) exploring ${preferences.destination} from ${preferences.origin}, optimized for a ${preferences.travelStyle} travel style and a total budget of ${preferences.budget} ${currency}.`,
      highlights: [
        `Discover iconic landmarks of ${preferences.destination}`,
        `Taste authentic local specialties and market delicacies`,
        `Immerse in historic quarters and scenic viewpoints`,
      ],
      best_time_to_visit_note: 'Spring and Autumn typically offer mild walking weather and comfortable sightseeing.',
    },
    assumptions: [
      `Travelers originate from ${preferences.origin} and have valid transit passes.`,
      `Accommodations (${preferences.accommodationType}) are booked in advance.`,
      `All costs are seasonal projections and may vary based on actual booking dates.`,
    ],
    itinerary_days: days,
    estimated_budget: {
      total_estimated: totalEst,
      user_budget: preferences.budget,
      currency,
      is_per_person: isPerPerson,
      budget_feasibility_assessment: 'Within Budget',
      budget_advice: `Your budget of ${preferences.budget} ${currency} provides comfortable coverage for ${preferences.durationDays} days.`,
      breakdown: [
        {
          category: 'Accommodation',
          estimated_amount: Math.round(totalEst * 0.42),
          percentage_of_total: 42,
          notes: `${preferences.accommodationType || 'Hotel'} for ${preferences.durationDays} nights.`,
        },
        {
          category: 'Food & Dining',
          estimated_amount: Math.round(totalEst * 0.26),
          percentage_of_total: 26,
          notes: 'Daily meals, coffee, and regional specialty dining.',
        },
        {
          category: 'Local Transport',
          estimated_amount: Math.round(totalEst * 0.14),
          percentage_of_total: 14,
          notes: `${preferences.transportMode || 'Public transit passes and local transit'}.`,
        },
        {
          category: 'Activities & Attractions',
          estimated_amount: Math.round(totalEst * 0.12),
          percentage_of_total: 12,
          notes: 'Museum entry fees, walking tours, and sightseeing.',
        },
        {
          category: 'Contingency & Miscellaneous',
          estimated_amount: Math.round(totalEst * 0.06),
          percentage_of_total: 6,
          notes: 'Safety buffer for incidental expenses and souvenirs.',
        },
      ],
    },
    travel_tips: {
      local_transportation: `Utilize regional transit cards or multi-day passes for easy navigation across ${preferences.destination}.`,
      etiquette_and_customs: 'Observe local cultural etiquette, dress respectfully when visiting religious sites, and observe standard tipping customs.',
      safety_and_health: 'Keep emergency contact cards and travel insurance details easily accessible.',
      packing_essentials: [
        'Comfortable walking shoes',
        'Weather-appropriate layers and rain shell',
        'Universal power adapter',
        'Reusable water bottle',
      ],
    },
    limitations: [
      'Generated in Offline Demo Mode because GEMINI_API_KEY was not configured in .env.',
      'To enable live AI generation powered by Gemini 3.8 Flash, set GEMINI_API_KEY in your .env file.',
      'Ticket availability and opening times should be confirmed directly with venues.',
    ],
  };
}

export async function generateItineraryWithLLM(preferences: TripPreferencesInput): Promise<GeneratedItinerary> {
  const apiKey = getCleanApiKey();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY is not configured. Serving offline demonstration itinerary.');
    return generateOfflineItinerary(preferences);
  }

  const prompt = `
Generate a comprehensive, realistic ${preferences.durationDays}-day travel itinerary from ${preferences.origin} to ${preferences.destination}.

Trip Parameters:
- Origin: ${preferences.origin}
- Destination: ${preferences.destination}
- Duration: ${preferences.durationDays} days (${preferences.startDate ? `Starting ${preferences.startDate}` : 'Flexible dates'})
- Total Budget: ${preferences.budget} ${preferences.currency} (for ${preferences.travelers} traveler${preferences.travelers > 1 ? 's' : ''})
- Travel Style: ${preferences.travelStyle}
- Group Size: ${preferences.travelers} person(s)
- Primary Interests: ${preferences.interests.length > 0 ? preferences.interests.join(', ') : 'General exploration, culture, and sightseeing'}
- Preferred Transport: ${preferences.transportMode}
- Preferred Accommodation: ${preferences.accommodationType}
${preferences.dietaryPreferences ? `- Dietary Preferences: ${preferences.dietaryPreferences}` : ''}
${preferences.accessibilityNeeds ? `- Accessibility Needs: ${preferences.accessibilityNeeds}` : ''}
${preferences.specialNotes ? `- Special Notes/Requests: ${preferences.specialNotes}` : ''}

Please generate an authentic day-by-day plan with realistic activity estimates, geographical neighborhood clusters, cost breakdowns, practical assumptions, local advice, and limitations. Return strictly valid JSON.
`;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  try {
    const ai = getAiClient();

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: schemaConfig,
          },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error('Received empty response from the AI model.');
        }

        let parsed: any;
        try {
          parsed = JSON.parse(rawText.trim());
        } catch (parseErr) {
          throw new Error(`Failed to parse AI response as JSON: ${(parseErr as Error).message}`);
        }

        const validation = validateItinerarySchema(parsed);
        if (!validation.valid || !validation.validated) {
          throw new Error(`Schema validation failed on AI output: ${validation.errors.join(', ')}`);
        }

        return validation.validated;
      } catch (err: any) {
        console.warn(`Model ${model} attempt failed:`, err?.message || err);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  } catch (clientErr: any) {
    console.warn('Could not initialize GoogleGenAI client, falling back to offline itinerary:', clientErr?.message);
    return generateOfflineItinerary(preferences);
  }

  console.warn('All Gemini API model attempts failed, falling back to offline itinerary:', lastError?.message);
  return generateOfflineItinerary(preferences);
}
