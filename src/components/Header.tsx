import React, { useState } from 'react';
import { Compass, BookOpen, BookmarkCheck, PlusCircle, Download, Loader2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'plan' | 'itinerary' | 'saved' | 'guide';
  setActiveTab: (tab: 'plan' | 'itinerary' | 'saved' | 'guide') => void;
  savedCount: number;
  hasCurrentItinerary: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  hasCurrentItinerary,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      // Fetch via base64 API - immune to iframe cross-origin sandbox download blocks
      const res = await fetch('/api/zip-base64');
      const data = await res.json();
      if (!data.success || !data.base64) {
        throw new Error('Failed to load zip payload');
      }

      // Decode base64 to binary array
      const binaryString = window.atob(data.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-travel-planner.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Blob download error, trying direct link:', err);
      window.location.href = '/api/download-zip';
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div
            onClick={() => setActiveTab('plan')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center transition-transform group-hover:scale-105">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-semibold text-stone-900 text-base tracking-tight block leading-tight">
                AI Travel Planner
              </span>
              <span className="text-[11px] text-stone-500 font-medium tracking-wide uppercase">
                LLM Itinerary Engine
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === 'plan'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Plan Trip</span>
            </button>

            {hasCurrentItinerary && (
              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'itinerary'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Current Plan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === 'saved'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Saved Trips</span>
              {savedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full font-semibold bg-stone-200 text-stone-800">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === 'guide'
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
              title="Architecture & Engineering Guide"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Engineering Guide</span>
              <span className="sm:hidden">Guide</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors ml-1 disabled:opacity-60 cursor-pointer"
              title="Download Full Project ZIP Archive"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                  <span className="hidden sm:inline">Downloading...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-500" />
                  <span className="hidden sm:inline">Project ZIP</span>
                  <span className="sm:hidden">ZIP</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
