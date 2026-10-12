import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { TripPreferences, TravelStyle } from '../types.ts';
import { SAMPLE_PRESETS } from '../presets.ts';

interface TripFormProps {
  onSubmit: (preferences: TripPreferences) => void;
  isLoading: boolean;
  error: string | null;
}

const INTEREST_OPTIONS = [
  'History & Heritage',
  'Food & Culinary',
  'Nature & Landscapes',
  'Art & Museums',
  'Beaches & Islands',
  'Shopping & Local Markets',
  'Local Culture & Living',
  'Hiking & Trekking',
  'Photography',
  'Wellness & Thermal Baths',
  'Architecture',
  'Nightlife & Music',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR'];

const TRAVEL_STYLES: { id: TravelStyle; title: string; desc: string }[] = [
  { id: 'budget', title: 'Budget', desc: 'Hostels, public transit, local street food' },
  { id: 'adventure', title: 'Adventure', desc: 'Active exploration, hiking, local immersions' },
  { id: 'relaxation', title: 'Relaxation', desc: 'Gentle pacing, scenic cafés, wellness' },
  { id: 'family', title: 'Family', desc: 'Accessible, kid-friendly spots, smooth transit' },
  { id: 'luxury', title: 'Luxury', desc: 'Fine dining, premium comfort, private transfers' },
];

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState<TripPreferences>({
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    durationDays: 4,
    budget: 1500,
    currency: 'USD',
    travelers: 2,
    travelStyle: 'adventure',
    interests: ['History & Heritage', 'Food & Culinary', 'Local Culture & Living'],
    transportMode: 'Public Transit & Walking',
    accommodationType: 'Boutique Hotel or Guesthouse',
    dietaryPreferences: '',
    accessibilityNeeds: '',
    specialNotes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handlePresetSelect = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setFormData(preset.data);
    setFormErrors({});
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.origin.trim()) errs.origin = 'Starting city is required.';
    if (!formData.destination.trim()) errs.destination = 'Destination is required.';
    if (formData.durationDays < 1 || formData.durationDays > 14) {
      errs.durationDays = 'Duration must be between 1 and 14 days.';
    }
    if (formData.budget <= 0) {
      errs.budget = 'Please specify a budget greater than 0.';
    }
    if (formData.travelers < 1 || formData.travelers > 20) {
      errs.travelers = 'Travelers count must be between 1 and 20.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Intro Hero Section */}
      <div className="mb-8 text-center sm:text-left border-b border-stone-200 pb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          Plan Your Next Journey
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
          Specify your route, budget, pacing, and interests. Our LLM-powered engine crafts an
          actionable, geographically clustered daily itinerary with transparent cost estimates and
          practical local advice.
        </p>

        {/* Quick Presets Bar */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick Test Presets (1-Click Load)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-colors text-left"
              >
                <span className="font-medium text-stone-900">{preset.label}</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-500 text-[11px]">{preset.tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Generation Encountered an Issue</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Trip Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Journey Basics */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <MapPin className="w-4 h-4 text-stone-700" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              01. Destination & Dates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Starting City / Origin <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="e.g. San Francisco, CA or London"
                className={`w-full px-3.5 py-2 text-sm rounded-md border bg-white text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 ${
                  formErrors.origin ? 'border-red-400' : 'border-stone-300'
                }`}
              />
              {formErrors.origin && (
                <p className="mt-1 text-xs text-red-600">{formErrors.origin}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g. Kyoto, Japan or Rome, Italy"
                className={`w-full px-3.5 py-2 text-sm rounded-md border bg-white text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 ${
                  formErrors.destination ? 'border-red-400' : 'border-stone-300'
                }`}
              />
              {formErrors.destination && (
                <p className="mt-1 text-xs text-red-600">{formErrors.destination}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Trip Duration (Days) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="w-full accent-stone-900 cursor-pointer"
                />
                <span className="font-semibold text-sm text-stone-900 w-12 text-right">
                  {formData.durationDays} {formData.durationDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              {formErrors.durationDays && (
                <p className="mt-1 text-xs text-red-600">{formErrors.durationDays}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Group, Budget & Style */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <DollarSign className="w-4 h-4 text-stone-700" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              02. Budget & Travel Group
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Number of Travelers <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.travelers}
                  onChange={(e) => setFormData({ ...formData, travelers: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
              {formErrors.travelers && (
                <p className="mt-1 text-xs text-red-600">{formErrors.travelers}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Total Budget (All travelers) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className={`w-full px-3.5 py-2 text-sm rounded-md border text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                  formErrors.budget ? 'border-red-400' : 'border-stone-300'
                }`}
              />
              {formErrors.budget && (
                <p className="mt-1 text-xs text-red-600">{formErrors.budget}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Travel Style Selector */}
          <div className="mt-6">
            <label className="block text-xs font-medium text-stone-700 mb-2">Travel Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, travelStyle: style.id })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.travelStyle === style.id
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/60 text-stone-800'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm">{style.title}</div>
                  <div
                    className={`text-[11px] mt-1 leading-snug ${
                      formData.travelStyle === style.id ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {style.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Interests & Experiences */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-stone-700" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
                03. Interests & Focus Areas
              </h2>
            </div>
            <span className="text-xs text-stone-500">
              {formData.interests.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {INTEREST_OPTIONS.map((interest) => {
              const active = formData.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-2 text-xs font-medium rounded-md border text-left transition-colors flex items-center justify-between ${
                    active
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span>{interest}</span>
                  {active && <Check className="w-3.5 h-3.5 text-stone-200 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Logistics & Preferences */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Calendar className="w-4 h-4 text-stone-700" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              04. Logistics & Special Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Preferred Local Transportation
              </label>
              <input
                type="text"
                value={formData.transportMode}
                onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                placeholder="e.g. Public Transit, Walking, Rental Car, High-Speed Train"
                className="w-full px-3.5 py-2 text-sm rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Accommodation Preference
              </label>
              <input
                type="text"
                value={formData.accommodationType}
                onChange={(e) => setFormData({ ...formData, accommodationType: e.target.value })}
                placeholder="e.g. Traditional Ryokan, Boutique Hotel, Airbnb, Hostel"
                className="w-full px-3.5 py-2 text-sm rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Dietary Preferences & Allergies
              </label>
              <input
                type="text"
                value={formData.dietaryPreferences}
                onChange={(e) => setFormData({ ...formData, dietaryPreferences: e.target.value })}
                placeholder="e.g. Vegetarian, Halal, Nut allergy, Seafood lover"
                className="w-full px-3.5 py-2 text-sm rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Accessibility & Mobility
              </label>
              <input
                type="text"
                value={formData.accessibilityNeeds}
                onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                placeholder="e.g. Step-free access needed, comfortable walking 10k steps"
                className="w-full px-3.5 py-2 text-sm rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Special Notes / Specific Requests
            </label>
            <textarea
              rows={2}
              value={formData.specialNotes}
              onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
              placeholder="e.g. Want sunrise photography spots; avoid tourist traps; prefer leisurely late mornings"
              className="w-full px-3.5 py-2 text-sm rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <HelpCircle className="w-4 h-4 text-stone-400" />
            <span>
              Calls server-side Gemini 3.8 Flash model with structured schema validation.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-7 py-3 rounded-lg bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Crafting Itinerary with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Personalized Itinerary</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
