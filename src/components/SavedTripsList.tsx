import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  MapPin,
  Trash2,
  ExternalLink,
  Users,
  Compass,
  BookmarkCheck,
  AlertTriangle,
} from 'lucide-react';
import { SavedTripRecord } from '../types.ts';

interface SavedTripsListProps {
  trips: SavedTripRecord[];
  onSelectTrip: (trip: SavedTripRecord) => void;
  onDeleteTrip: (tripId: string) => void;
  onNewTrip: () => void;
}

export const SavedTripsList: React.FC<SavedTripsListProps> = ({
  trips,
  onSelectTrip,
  onDeleteTrip,
  onNewTrip,
}) => {
  const [tripToDelete, setTripToDelete] = useState<SavedTripRecord | null>(null);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Saved Itineraries</h1>
          <p className="text-sm text-stone-600 mt-1">
            Persisted in local SQLite database (<code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">trips.db</code>).
          </p>
        </div>

        <button
          type="button"
          onClick={onNewTrip}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors self-start"
        >
          <Compass className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Empty State */}
      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-semibold text-stone-900 text-base">No saved itineraries yet</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 mb-6 leading-relaxed">
            Generate a personalized travel plan and click &quot;Save to SQLite&quot; to keep your itinerary for future reference.
          </p>
          <button
            type="button"
            onClick={onNewTrip}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Create Your First Itinerary
          </button>
        </div>
      ) : (
        /* Grid of Saved Trips */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{trip.destination}</span>
                    <span aria-hidden="true">·</span>
                    <span>{trip.duration_days} Days</span>
                  </div>

                  <span className="capitalize text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                    {trip.travel_style}
                  </span>
                </div>

                <h3 className="font-semibold text-stone-900 text-base mb-1.5">
                  {trip.title || `${trip.destination} Journey`}
                </h3>

                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                  {trip.itinerary?.trip_summary?.overview ||
                    `Journey from ${trip.origin} with ${trip.travelers} traveler(s).`}
                </p>

                <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-stone-100 text-xs text-stone-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      Budget: {trip.currency} {trip.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setTripToDelete(trip)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTrip(trip)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                >
                  <span>Open Itinerary</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="font-semibold text-stone-900 text-base mb-1">Delete Itinerary?</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
              Are you sure you want to remove &quot;{tripToDelete.title}&quot; from your SQLite database? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTrip(tripToDelete.id);
                  setTripToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
