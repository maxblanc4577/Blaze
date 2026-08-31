import React, { useState } from 'react';
import { X, Search, MapPin, Globe, Check } from 'lucide-react';
import { WORLD_CITIES, WorldCity } from '../utils/worldCities';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface GoogleMapsCityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (cityName: string, lat?: number, lng?: number) => void;
  currentLocation: string;
}

export const GoogleMapsCityPickerModal: React.FC<GoogleMapsCityPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  currentLocation,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [activeCity, setActiveCity] = useState<WorldCity>(WORLD_CITIES[0]);
  const [apiKeyInput] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
  const [useRealMap, setUseRealMap] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);

  const continents = ['All', 'North America', 'South America', 'Caribbean', 'Europe', 'Asia', 'Oceania', 'Africa'];

  const filteredCities = WORLD_CITIES.filter(city => {
    const matchesContinent = selectedContinent === 'All' || city.continent === selectedContinent;
    const q = searchQuery.toLowerCase();
    const matchesQuery = city.name.toLowerCase().includes(q) || city.country.toLowerCase().includes(q) || city.region.toLowerCase().includes(q);
    return matchesContinent && matchesQuery;
  });

  const handleConfirm = () => {
    const formatted = `${activeCity.name}, ${activeCity.country}`;
    onSelectCity(formatted, activeCity.lat, activeCity.lng);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-4xl w-full h-[85vh] max-h-[750px] flex flex-col relative shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-[#FFC107]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Google Maps World City Picker</h2>
              <p className="text-xs text-neutral-400">Select exact cities all around the world for your location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content split view: Search & City List (Left) + Interactive Map View (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Pane: Search & Filter */}
          <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col border-r border-neutral-800 bg-[#1A1A1A] overflow-hidden">
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search any city or country worldwide..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#252525] border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#FFC107]"
                />
              </div>

              {/* Continent Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {continents.map(cont => (
                  <button
                    key={cont}
                    type="button"
                    onClick={() => setSelectedContinent(cont)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                      selectedContinent === cont
                        ? 'bg-[#FFC107] text-black shadow'
                        : 'bg-[#252525] hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {cont}
                  </button>
                ))}
              </div>
            </div>

            {/* City List Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
              {filteredCities.map(city => {
                const isSelected = activeCity.id === city.id;
                return (
                  <div
                    key={city.id}
                    onClick={() => setActiveCity(city)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-[#FFC107] ring-1 ring-[#FFC107]'
                        : 'bg-[#222222] hover:bg-[#282828] border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#FFC107] text-black font-bold' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{city.name}</h4>
                        <p className="text-[10px] text-neutral-400 truncate">{city.region}, {city.country} • <span className="text-amber-400">{city.continent}</span></p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#FFC107] flex-shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Interactive Google Maps / Radar Preview */}
          <div className="w-full md:w-1/2 bg-neutral-900 relative flex flex-col">
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
              <span className="text-neutral-400">Map Mode:</span>
              <button
                type="button"
                onClick={() => setUseRealMap(!useRealMap)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  useRealMap ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-white'
                }`}
              >
                {useRealMap ? 'Google Maps API' : 'Interactive Map View'}
              </button>
            </div>

            <div className="w-full h-full relative">
              {useRealMap && !mapError ? (
                <APIProvider apiKey={apiKeyInput || "AIzaSyDummyKey"} onError={() => setMapError(true)}>
                  <Map
                    center={{ lat: activeCity.lat, lng: activeCity.lng }}
                    zoom={12}
                    mapId="world_city_picker_map"
                    gestureHandling={'greedy'}
                    className="w-full h-full"
                  >
                    <AdvancedMarker position={{ lat: activeCity.lat, lng: activeCity.lng }} />
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full bg-[#181818] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFC107_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-[#FFC107] mb-3 animate-pulse shadow-lg shadow-amber-500/20">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">{activeCity.name}, {activeCity.country}</h3>
                  <p className="text-xs text-neutral-400 mb-4">Coordinates: {activeCity.lat.toFixed(4)}° N, {activeCity.lng.toFixed(4)}° E</p>
                  <div className="bg-[#222222] border border-neutral-800 px-4 py-2 rounded-xl text-[11px] text-amber-300">
                    🌍 Google Maps World City Pinpoint Active
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer inside Map pane */}
            <div className="p-4 bg-[#1E1E1E] border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block">Selected City</span>
                <span className="text-sm font-bold text-white">{activeCity.name}, {activeCity.country}</span>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#FFC107] text-black font-black text-xs hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Set Location</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
