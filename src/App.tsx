/**
 * AI Travel Planner — Full Stack Application Entry Point
 */
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { TripForm } from './components/TripForm.tsx';
import { ItineraryView } from './components/ItineraryView.tsx';
import { SavedTripsList } from './components/SavedTripsList.tsx';
import { ArchitectureGuide } from './components/ArchitectureGuide.tsx';
import { TripPreferences, GeneratedItinerary, SavedTripRecord } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'plan' | 'itinerary' | 'saved' | 'guide'>('plan');
  const [currentPreferences, setCurrentPreferences] = useState<TripPreferences | null>(null);
  const [currentItinerary, setCurrentItinerary] = useState<GeneratedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTripRecord[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Fetch saved trips from SQLite on mount
  useEffect(() => {
    fetchSavedTrips();
  }, []);

  const fetchSavedTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSavedTrips(json.data);
        }
      }
    } catch (err) {
      console.warn('Could not fetch saved trips:', err);
    }
  };

  const handleGenerateItinerary = async (preferences: TripPreferences) => {
    setIsLoading(true);
    setError(null);
    setCurrentPreferences(preferences);
    setIsSaved(false);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate itinerary. Please try again.');
      }

      setCurrentItinerary(data.data);
      setActiveTab('itinerary');
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err?.message || 'Network error while generating itinerary. Check server logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!currentItinerary) return;
    setIsSaving(true);
    try {
      const payload = {
        title: currentItinerary.trip_summary.title,
        destination: currentItinerary.trip_summary.destination,
        origin: currentPreferences?.origin || 'Not specified',
        startDate: currentPreferences?.startDate || '',
        endDate: currentPreferences?.endDate || '',
        durationDays: currentItinerary.trip_summary.duration_days,
        budget: currentItinerary.estimated_budget.user_budget,
        currency: currentItinerary.estimated_budget.currency,
        travelers: currentItinerary.trip_summary.travelers,
        travelStyle: currentItinerary.trip_summary.travel_style,
        interests: currentPreferences?.interests || [],
        transportMode: currentPreferences?.transportMode || 'Public Transit',
        accommodationType: currentPreferences?.accommodationType || 'Hotel',
        dietaryPreferences: currentPreferences?.dietaryPreferences || '',
        itinerary: currentItinerary,
      };

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save trip to database.');
      }

      setIsSaved(true);
      await fetchSavedTrips();
    } catch (err: any) {
      console.error('Save Trip Error:', err);
      alert(err.message || 'Error saving trip to database');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
      }
    } catch (err) {
      console.error('Delete Trip Error:', err);
    }
  };

  const handleSelectSavedTrip = (saved: SavedTripRecord) => {
    setCurrentItinerary(saved.itinerary);
    setCurrentPreferences({
      origin: saved.origin,
      destination: saved.destination,
      startDate: saved.start_date,
      endDate: saved.end_date,
      durationDays: saved.duration_days,
      budget: saved.budget,
      currency: saved.currency,
      travelers: saved.travelers,
      travelStyle: (saved.travel_style as any) || 'adventure',
      interests: saved.interests || [],
      transportMode: saved.transport_mode,
      accommodationType: saved.accommodation,
      dietaryPreferences: saved.dietary_accessibility || '',
      accessibilityNeeds: '',
      specialNotes: '',
    });
    setIsSaved(true);
    setActiveTab('itinerary');
  };

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-900 flex flex-col font-sans antialiased">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedTrips.length}
        hasCurrentItinerary={Boolean(currentItinerary)}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'plan' && (
          <TripForm
            onSubmit={handleGenerateItinerary}
            isLoading={isLoading}
            error={error}
          />
        )}

        {activeTab === 'itinerary' && currentItinerary && (
          <ItineraryView
            itinerary={currentItinerary}
            preferences={currentPreferences}
            onSave={handleSaveTrip}
            isSaving={isSaving}
            isSaved={isSaved}
            onBackToForm={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'saved' && (
          <SavedTripsList
            trips={savedTrips}
            onSelectTrip={handleSelectSavedTrip}
            onDeleteTrip={handleDeleteTrip}
            onNewTrip={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'guide' && <ArchitectureGuide />}
      </main>

      {/* Quiet, unpretentious footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-700">AI Travel Planner</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash Itinerary Generation</span>
            <span aria-hidden="true">·</span>
            <span>SQLite Local Persistence</span>
          </div>
          <div>All cost amounts are seasonal estimates. Always verify live tickets and schedules.</div>
        </div>
      </footer>
    </div>
  );
}
