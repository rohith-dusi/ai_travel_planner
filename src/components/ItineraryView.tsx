import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Compass,
  Bookmark,
  Check,
  Download,
  Share2,
  Info,
  ShieldAlert,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GeneratedItinerary, TripPreferences } from '../types.ts';

interface ItineraryViewProps {
  itinerary: GeneratedItinerary;
  preferences: TripPreferences | null;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
  onBackToForm: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  preferences,
  onSave,
  isSaving,
  isSaved,
  onBackToForm,
}) => {
  const [activeTab, setActiveTab] = useState<'days' | 'budget' | 'tips' | 'disclaimer'>('days');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    itinerary.itinerary_days.forEach((d) => {
      init[d.day_number] = true;
    });
    return init;
  });
  const [copiedNotification, setCopiedNotification] = useState(false);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleExportMarkdown = () => {
    let md = `# ${itinerary.trip_summary.title}\n\n`;
    md += `**Destination:** ${itinerary.trip_summary.destination}\n`;
    md += `**Duration:** ${itinerary.trip_summary.duration_days} days\n`;
    md += `**Travelers:** ${itinerary.trip_summary.travelers}\n`;
    md += `**Travel Style:** ${itinerary.trip_summary.travel_style}\n\n`;
    md += `## Overview\n${itinerary.trip_summary.overview}\n\n`;

    md += `## Day-by-Day Itinerary\n`;
    itinerary.itinerary_days.forEach((day) => {
      md += `\n### Day ${day.day_number}: ${day.theme}\n`;
      md += `*Neighborhood Focus:* ${day.neighborhood_focus}\n`;
      md += `*Transit Tip:* ${day.transport_tip}\n\n`;
      day.activities.forEach((act) => {
        md += `- **[${act.time_slot}] ${act.name}** (~${act.estimated_duration_hours}h)\n`;
        md += `  ${act.description}\n`;
        md += `  *Area:* ${act.location_area} | *Est. Cost:* ${act.estimated_cost.amount} ${act.estimated_cost.currency} (${act.estimated_cost.is_per_person ? 'per person' : 'group'})\n`;
        if (act.tips_or_notes) md += `  *Tip:* ${act.tips_or_notes}\n`;
      });
    });

    md += `\n## Estimated Budget Breakdown\n`;
    md += `Total Estimated: ${itinerary.estimated_budget.total_estimated} ${itinerary.estimated_budget.currency}\n`;
    md += `Budget Assessment: ${itinerary.estimated_budget.budget_feasibility_assessment}\n\n`;
    itinerary.estimated_budget.breakdown.forEach((b) => {
      md += `- **${b.category}**: ${b.estimated_amount} ${itinerary.estimated_budget.currency} (${b.percentage_of_total}%) - ${b.notes}\n`;
    });

    md += `\n## Planning Tips\n`;
    md += `*Transit:* ${itinerary.travel_tips.local_transportation}\n`;
    md += `*Etiquette:* ${itinerary.travel_tips.etiquette_and_customs}\n`;
    md += `*Safety:* ${itinerary.travel_tips.safety_and_health}\n\n`;

    md += `## Assumptions & Limitations\n`;
    itinerary.assumptions.forEach((a) => (md += `- Assumption: ${a}\n`));
    itinerary.limitations.forEach((l) => (md += `- Limitation: ${l}\n`));

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${itinerary.trip_summary.destination.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = `${itinerary.trip_summary.title} - ${itinerary.trip_summary.duration_days} Days in ${itinerary.trip_summary.destination}.\nEstimated Budget: ${itinerary.estimated_budget.total_estimated} ${itinerary.estimated_budget.currency}.\n${itinerary.trip_summary.overview}`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-200">
        <button
          type="button"
          onClick={onBackToForm}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Preferences</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedNotification ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || isSaved}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isSaved
                ? 'bg-emerald-700 text-white cursor-default'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved to Trips (SQLite)</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save to SQLite'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-300 text-xs font-medium mb-2">
              <span>{itinerary.trip_summary.destination}</span>
              <span aria-hidden="true">·</span>
              <span>{itinerary.trip_summary.duration_days} Days</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{itinerary.trip_summary.travel_style} Pace</span>
              <span aria-hidden="true">·</span>
              <span>{itinerary.trip_summary.travelers} Traveler{itinerary.trip_summary.travelers > 1 ? 's' : ''}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {itinerary.trip_summary.title}
            </h1>
          </div>

          <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700/60 md:text-right shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">
              Estimated Total Cost
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-300">
              {itinerary.estimated_budget.currency} {itinerary.estimated_budget.total_estimated.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-400 block mt-0.5">
              {itinerary.estimated_budget.budget_feasibility_assessment} (vs budget {itinerary.estimated_budget.currency} {itinerary.estimated_budget.user_budget.toLocaleString()})
            </span>
          </div>
        </div>

        <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          {itinerary.trip_summary.overview}
        </p>

        {itinerary.trip_summary.highlights && itinerary.trip_summary.highlights.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-800">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-2">
              Key Highlights
            </span>
            <div className="flex flex-wrap gap-2 text-xs text-stone-200">
              {itinerary.trip_summary.highlights.map((h, i) => (
                <div
                  key={i}
                  className="bg-stone-800/70 border border-stone-700 px-3 py-1 rounded-md"
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Switcher / Segmented Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg max-w-fit mb-8 border border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('days')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === 'days'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Day-by-Day Schedule
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('budget')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === 'budget'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Budget Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tips')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === 'tips'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Local Advice & Tips
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('disclaimer')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === 'disclaimer'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Assumptions & Limits
        </button>
      </div>

      {/* Tab 1: Day-by-Day Itinerary */}
      {activeTab === 'days' && (
        <div className="space-y-6">
          {itinerary.itinerary_days.map((day) => {
            const isExpanded = expandedDays[day.day_number] ?? true;
            return (
              <div
                key={day.day_number}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs"
              >
                {/* Day Header Bar */}
                <div
                  onClick={() => toggleDay(day.day_number)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50/70 transition-colors border-b border-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 text-xs font-bold flex items-center justify-center">
                      D{day.day_number}
                    </span>
                    <div>
                      <h3 className="font-semibold text-stone-900 text-base">
                        Day {day.day_number}: {day.theme}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>Focus: {day.neighborhood_focus}</span>
                        <span aria-hidden="true">·</span>
                        <span>{day.activities.length} Activities</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Day Summary & Transit Note */}
                    <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed">
                      <div className="font-medium text-stone-900 mb-1">{day.day_summary}</div>
                      <div className="text-stone-500 text-xs flex items-center gap-1.5 mt-1">
                        <Compass className="w-3.5 h-3.5 text-amber-700" />
                        <span>Transit Tip: {day.transport_tip}</span>
                      </div>
                    </div>

                    {/* Timeline Activities */}
                    <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                      {day.activities.map((activity, actIdx) => (
                        <div key={actIdx} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full bg-stone-900 ring-4 ring-white" />

                          <div className="border border-stone-200 rounded-lg p-4 bg-white hover:border-stone-300 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
                                  {activity.time_slot}
                                </span>
                                <span className="text-stone-300">·</span>
                                <h4 className="font-semibold text-stone-900 text-sm sm:text-base">
                                  {activity.name}
                                </h4>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-stone-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                  ~{activity.estimated_duration_hours}h
                                </span>
                                <span className="flex items-center gap-1 font-medium text-stone-700">
                                  <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                                  {activity.estimated_cost.currency} {activity.estimated_cost.amount}{' '}
                                  <span className="text-stone-400 text-[10px]">
                                    ({activity.estimated_cost.is_per_person ? 'per person' : 'group'})
                                  </span>
                                </span>
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                              {activity.description}
                            </p>

                            <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                <span>Area: {activity.location_area}</span>
                              </span>
                              {activity.tips_or_notes && (
                                <span className="text-stone-600 italic">
                                  Tip: {activity.tips_or_notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Budget Breakdown */}
      {activeTab === 'budget' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-5">
            <h2 className="text-lg font-semibold text-stone-900">
              Estimated Budget Breakdown & Assessment
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              All figures are calculated projections based on current seasonal norms, travel style,
              and group parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 font-medium block">User Budget</span>
              <span className="text-xl font-bold text-stone-900 mt-1 block">
                {itinerary.estimated_budget.currency}{' '}
                {itinerary.estimated_budget.user_budget.toLocaleString()}
              </span>
              <span className="text-[11px] text-stone-400">Total available funds</span>
            </div>

            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 font-medium block">Estimated Plan Total</span>
              <span className="text-xl font-bold text-stone-900 mt-1 block">
                {itinerary.estimated_budget.currency}{' '}
                {itinerary.estimated_budget.total_estimated.toLocaleString()}
              </span>
              <span className="text-[11px] text-stone-400">Projected expenses</span>
            </div>

            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 font-medium block">Feasibility Rating</span>
              <span className="text-xl font-bold text-stone-900 mt-1 block">
                {itinerary.estimated_budget.budget_feasibility_assessment}
              </span>
              <span className="text-[11px] text-stone-400">Model evaluation</span>
            </div>
          </div>

          {/* Budget Advice */}
          <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 text-stone-800 text-xs sm:text-sm leading-relaxed">
            <span className="font-semibold text-amber-900 block mb-1">Model Budget Advice</span>
            {itinerary.estimated_budget.budget_advice}
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Expense Category</th>
                  <th className="py-3 px-3">Estimated Amount</th>
                  <th className="py-3 px-3">Share (%)</th>
                  <th className="py-3 px-3">Context & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {itinerary.estimated_budget.breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-medium text-stone-900">{item.category}</td>
                    <td className="py-3 px-3 font-semibold text-stone-800">
                      {itinerary.estimated_budget.currency} {item.estimated_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-800 rounded-full"
                            style={{ width: `${Math.min(item.percentage_of_total, 100)}%` }}
                          />
                        </div>
                        <span>{item.percentage_of_total}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Local Advice & Tips */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <Compass className="w-4 h-4 text-stone-700" />
              <h3 className="font-semibold text-stone-900 text-sm">Local Transportation</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {itinerary.travel_tips.local_transportation}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <Info className="w-4 h-4 text-stone-700" />
              <h3 className="font-semibold text-stone-900 text-sm">Etiquette & Cultural Customs</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {itinerary.travel_tips.etiquette_and_customs}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <ShieldAlert className="w-4 h-4 text-stone-700" />
              <h3 className="font-semibold text-stone-900 text-sm">Health, Safety & Insurance</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {itinerary.travel_tips.safety_and_health}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <Check className="w-4 h-4 text-stone-700" />
              <h3 className="font-semibold text-stone-900 text-sm">Essential Packing Checklist</h3>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-stone-600">
              {itinerary.travel_tips.packing_essentials.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Assumptions & Disclaimers */}
      {activeTab === 'disclaimer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <h3 className="font-semibold text-stone-900 text-base mb-2">
              Model Assumptions During Planning
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              To construct a realistic itinerary, the language model operates under the following
              assumptions:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
              {itinerary.assumptions.map((assump, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-stone-400 font-bold">·</span>
                  <span>{assump}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold mb-2">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-sm">Real-World Planning Limitations & Disclaimer</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4">
              Large language models provide structured guidance based on known geography and typical
              travel practices. They do not have live access to ticket inventories, real-time weather
              emergencies, or sudden museum closures.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
              {itinerary.limitations.map((limit, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-amber-600 font-bold">!</span>
                  <span>{limit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
