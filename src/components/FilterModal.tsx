import React from 'react';
import { X, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterState, Tribe, LookingFor, PositionRole } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
}

const ALL_TRIBES: Tribe[] = [
  'Bear', 'Clean', 'Daddy', 'Discreet', 'Geek', 'Jock', 'Leather', 'Otter', 'Poz', 'Trans', 'Twink'
];

const ALL_LOOKING: LookingFor[] = ['Chat', 'Friends', 'Dates', 'Networking', 'Relationship', 'Right Now'];
const ALL_POSITIONS: PositionRole[] = ['Top', 'Vers Top', 'Vers', 'Vers Bottom', 'Bottom', 'Side'];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onReset,
}) => {
  if (!isOpen) return null;

  const toggleTribe = (tribe: Tribe) => {
    setFilters(prev => {
      const exists = prev.selectedTribes.includes(tribe);
      return {
        ...prev,
        selectedTribes: exists
          ? prev.selectedTribes.filter(t => t !== tribe)
          : [...prev.selectedTribes, tribe],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1A1A1A] w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl border border-neutral-800 text-white max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-[#FFC107]" />
            <h2 className="font-bold text-lg">Filter Profiles</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Suggested For You Toggle */}
          <div className="bg-[#222222] border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">✨</span>
              <div>
                <h4 className="font-bold text-sm text-white">Suggested for You</h4>
                <p className="text-[11px] text-neutral-400">Prioritize high compatibility scores and common interests.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.suggestedForYou || false}
                onChange={e => setFilters(prev => ({ ...prev, suggestedForYou: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC107]"></div>
            </label>
          </div>

          {/* Status Filter (Online, Offline, Away) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Online Status</h3>
            <div className="grid grid-cols-4 gap-2">
              {(['all', 'online', 'away', 'offline'] as const).map(status => {
                const selected = (filters.statusFilter || 'all') === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({ ...prev, statusFilter: status }))}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                      selected
                        ? 'bg-[#FFC107] text-[#121212]'
                        : 'bg-[#252525] text-neutral-300 hover:bg-[#333333] border border-neutral-800'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Position</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, positionFilter: 'all' }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  !filters.positionFilter || filters.positionFilter === 'all'
                    ? 'bg-[#FFC107] text-[#121212] font-bold'
                    : 'bg-[#252525] text-neutral-300 hover:bg-[#333333]'
                }`}
              >
                All Positions
              </button>
              {ALL_POSITIONS.map(pos => {
                const selected = filters.positionFilter === pos;
                return (
                  <button
                    key={pos}
                    onClick={() => setFilters(prev => ({ ...prev, positionFilter: selected ? 'all' : pos }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      selected
                        ? 'bg-[#FFC107] text-[#121212] font-bold'
                        : 'bg-[#252525] text-neutral-300 hover:bg-[#333333]'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 font-medium">Max Distance</span>
              <span className="font-bold text-[#FFC107]">{filters.maxDistance} miles</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.maxDistance}
              onChange={e => setFilters(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
              className="w-full accent-[#FFC107] bg-neutral-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 font-medium">Age Range</span>
              <span className="font-bold text-[#FFC107]">{filters.ageRange[0]} - {filters.ageRange[1]} yrs</span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="18"
                max="80"
                value={filters.ageRange[0]}
                onChange={e => setFilters(prev => ({ ...prev, ageRange: [Number(e.target.value), prev.ageRange[1]] }))}
                className="w-full accent-[#FFC107] bg-neutral-800 h-2 rounded-lg cursor-pointer"
              />
              <input
                type="range"
                min="18"
                max="80"
                value={filters.ageRange[1]}
                onChange={e => setFilters(prev => ({ ...prev, ageRange: [prev.ageRange[0], Number(e.target.value)] }))}
                className="w-full accent-[#FFC107] bg-neutral-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Interest Cloud Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Interest Cloud</h3>
            <div className="flex flex-wrap gap-2">
              {['Fitness', 'Coffee', 'Music', 'Travel', 'Tech', 'Design', 'Art', 'Food', 'Gaming', 'Yoga', 'Photography'].map(tag => {
                const selected = filters.selectedTribes.includes(tag as any);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setFilters(prev => {
                        const exists = prev.selectedTribes.includes(tag as any);
                        return {
                          ...prev,
                          selectedTribes: exists
                            ? prev.selectedTribes.filter(t => t !== tag)
                            : [...prev.selectedTribes, tag as any],
                        };
                      });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      selected
                        ? 'bg-purple-500 text-white font-bold shadow'
                        : 'bg-[#252525] text-neutral-300 hover:bg-[#333333] border border-neutral-800'
                    }`}
                  >
                    ✨ {tag}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Looking For</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, lookingFor: undefined }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  !filters.lookingFor
                    ? 'bg-[#FFC107] text-[#121212] font-bold'
                    : 'bg-[#252525] text-neutral-300 hover:bg-[#333333]'
                }`}
              >
                All
              </button>
              {ALL_LOOKING.map(item => (
                <button
                  key={item}
                  onClick={() => setFilters(prev => ({ ...prev, lookingFor: prev.lookingFor === item ? undefined : item }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    filters.lookingFor === item
                      ? 'bg-[#FFC107] text-[#121212] font-bold'
                      : 'bg-[#252525] text-neutral-300 hover:bg-[#333333]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Tribes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Tribes</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_TRIBES.map(tribe => {
                const selected = filters.selectedTribes.includes(tribe);
                return (
                  <button
                    key={tribe}
                    onClick={() => toggleTribe(tribe)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                      selected
                        ? 'bg-[#FFC107] text-[#121212] font-bold shadow-md shadow-[#FFC107]/10'
                        : 'bg-[#252525] text-neutral-300 hover:bg-[#333333] border border-neutral-800'
                    }`}
                  >
                    <span>#{tribe}</span>
                    {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-800 bg-[#141414] flex items-center justify-between rounded-b-2xl">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white font-semibold text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
};
