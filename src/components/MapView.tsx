/// <reference types="vite/client" />
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { UserProfile } from '../types.ts';
import { MapPin, Shield, Key, AlertCircle } from 'lucide-react';

interface MapViewProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
}

export const MapView: React.FC<MapViewProps> = ({ profiles, onSelectProfile }) => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
  const [useRealMap, setUseRealMap] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [searchRadius, setSearchRadius] = useState<number>(25); // miles

  const defaultCenter = { lat: 37.7749, lng: -122.4194 };
  const effectiveApiKey = apiKeyInput || "AIzaSyDummyKey";

  const filteredProfiles = profiles.filter(p => (p.distance || 5) <= searchRadius);

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-sm border border-stone-200 relative bg-stone-900 flex flex-col">
      {/* Top Bar for Map Mode / API Key & Heatmap Toggle & Radius Slider */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-stone-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-stone-800 text-xs text-white">
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-medium">Radius:</span>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="w-24 accent-amber-500 cursor-pointer"
          />
          <span className="font-bold text-amber-400">{searchRadius} mi</span>
        </div>
        <span className="text-stone-700">|</span>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            showHeatmap ? 'bg-amber-500 text-black shadow' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
          title="Toggle Hotspot Heatmap Overlay"
        >
          🔥 {showHeatmap ? 'Heatmap On' : 'Heatmap Off'}
        </button>
        <span className="text-stone-700">|</span>
        <button
          onClick={() => setUseRealMap(!useRealMap)}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            useRealMap ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          {useRealMap ? 'Real Map Mode' : 'Interactive Radar Mode'}
        </button>
      </div>

      {useRealMap ? (
        <div className="w-full h-full relative">
          <APIProvider apiKey={effectiveApiKey} onError={() => setMapError(true)}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={13}
              mapId="blaze_radar_map"
              gestureHandling={'greedy'}
              className="w-full h-full"
            >
               {/* Clustered profiles grouping logic */}
              {(() => {
                // Group profiles that are very close to each other (approx delta < 0.015)
                const clusters: { centerLat: number; centerLng: number; profiles: typeof filteredProfiles }[] = [];
                
                filteredProfiles.forEach((profile, index) => {
                  const lat = profile.latitude || (37.7749 + (index * 0.01 - 0.05));
                  const lng = profile.longitude || (-122.4194 + (index * 0.01 - 0.05));

                  let addedToCluster = false;
                  for (const cluster of clusters) {
                    const dist = Math.hypot(cluster.centerLat - lat, cluster.centerLng - lng);
                    if (dist < 0.02) {
                      cluster.profiles.push(profile);
                      addedToCluster = true;
                      break;
                    }
                  }
                  if (!addedToCluster) {
                    clusters.push({ centerLat: lat, centerLng: lng, profiles: [profile] });
                  }
                });

                return (
                  <>
                    {/* Density Heatmap Overlay Rings */}
                    {showHeatmap && clusters.map((cluster, hIdx) => (
                      <AdvancedMarker
                        key={`heatmap-${hIdx}`}
                        position={{ lat: cluster.centerLat, lng: cluster.centerLng }}
                        zIndex={0}
                      >
                        <div className="relative pointer-events-none -translate-x-1/2 -translate-y-1/2">
                          <div className={`rounded-full animate-pulse transition-all duration-500 blur-md ${
                            cluster.profiles.length > 3 ? 'w-36 h-36 bg-red-500/30' : cluster.profiles.length > 1 ? 'w-28 h-28 bg-orange-500/25' : 'w-20 h-20 bg-amber-500/20'
                          }`} />
                        </div>
                      </AdvancedMarker>
                    ))}

                    {clusters.map((cluster, cIdx) => {
                  if (cluster.profiles.length > 1) {
                    // Render Cluster Badge
                    return (
                      <AdvancedMarker
                        key={`cluster-${cIdx}`}
                        position={{ lat: cluster.centerLat, lng: cluster.centerLng }}
                        onClick={() => setSelectedProfile(cluster.profiles[0])}
                      >
                        <div className="relative group cursor-pointer transition-transform hover:scale-110">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-2xl bg-amber-500/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xs">
                            🔥 {cluster.profiles.length}
                          </div>
                          <span className="absolute -bottom-1 right-0 bg-black/80 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-amber-500/40">
                            Cluster
                          </span>
                        </div>
                      </AdvancedMarker>
                    );
                  }

                  const profile = cluster.profiles[0];
                  const lat = cluster.centerLat;
                  const lng = cluster.centerLng;

                  return (
                    <AdvancedMarker
                      key={profile.id}
                      position={{ lat, lng }}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="relative group cursor-pointer transition-transform hover:scale-110">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-md bg-white">
                          <img
                            src={profile.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="absolute -bottom-1 right-0 w-3 h-3 rounded-full border-2 border-white bg-emerald-500"></span>
                      </div>
                    </AdvancedMarker>
                  );
                })}
                  </>
                );
              })()}

              {selectedProfile && (
                <InfoWindow
                  position={{
                    lat: selectedProfile.latitude || 37.7749,
                    lng: selectedProfile.longitude || -122.4194,
                  }}
                  onCloseClick={() => setSelectedProfile(null)}
                >
                  <div className="p-2 max-w-xs flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedProfile.photos[0]}
                        alt={selectedProfile.name}
                        className="w-12 h-12 rounded-full object-cover border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-1">
                          {selectedProfile.name}, {selectedProfile.age}
                          {selectedProfile.isVerified && <Shield className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                        </h4>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-500" /> {selectedProfile.distance} miles away · {selectedProfile.locationName}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">{selectedProfile.headline || selectedProfile.aboutMe}</p>
                    <button
                      onClick={() => onSelectProfile(selectedProfile)}
                      className="mt-1 w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
          {mapError && (
            <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center p-6 text-center text-white z-30">
              <AlertCircle className="w-12 h-12 text-orange-500 mb-3" />
              <h4 className="text-lg font-bold mb-1">Google Maps API Key Required</h4>
              <p className="text-sm text-stone-300 max-w-md mb-4">
                To view the live Google Maps tiles, please enter a valid Google Maps JavaScript API key below, or switch back to Interactive Radar Mode.
              </p>
              <div className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  placeholder="Paste Google Maps API Key..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => setMapError(false)}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Custom Interactive Radar Canvas */
        <div className="w-full h-full relative bg-stone-950 flex items-center justify-center overflow-hidden">
          {/* Heatmap Hotspot Glows */}
          {showHeatmap && (
            <>
              <div className="absolute w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none transform -translate-x-20 -translate-y-16 animate-pulse"></div>
              <div className="absolute w-80 h-80 rounded-full bg-orange-600/20 blur-3xl pointer-events-none transform translate-x-32 translate-y-24"></div>
              <div className="absolute w-72 h-72 rounded-full bg-red-500/15 blur-3xl pointer-events-none transform -translate-x-28 translate-y-36"></div>
            </>
          )}

          {/* Radar background circles */}
          <div className="absolute w-[500px] h-[500px] rounded-full border border-orange-500/20 animate-ping opacity-20 pointer-events-none"></div>
          <div className="absolute w-[350px] h-[350px] rounded-full border border-orange-500/30"></div>
          <div className="absolute w-[200px] h-[200px] rounded-full border border-orange-500/40"></div>
          <div className="absolute w-[50px] h-[50px] rounded-full bg-orange-500/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
          </div>

          {/* Search Radius Circle Overlay based on searchRadius */}
          <div
            className="absolute rounded-full border-2 border-amber-500/50 bg-amber-500/5 pointer-events-none transition-all duration-300"
            style={{ width: `${Math.min(500, searchRadius * 8)}px`, height: `${Math.min(500, searchRadius * 8)}px` }}
          ></div>

          {/* Profile Avatars Placed Radially */}
          {filteredProfiles.map((profile, idx) => {
            const angle = (idx / filteredProfiles.length) * 2 * Math.PI;
            const radius = 100 + (idx % 3) * 45;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className="absolute cursor-pointer group transition-transform hover:scale-125 z-10"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 shadow-xl bg-stone-800 relative">
                  <img
                    src={profile.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/90 text-white px-2 py-0.5 rounded-full text-[10px] font-medium border border-stone-800 shadow">
                  {profile.name} ({profile.distance}m)
                </div>
              </div>
            );
          })}

          {selectedProfile && (
            <div className="absolute bottom-6 left-6 right-6 max-w-sm mx-auto bg-stone-900/95 backdrop-blur-md border border-stone-800 p-4 rounded-2xl shadow-2xl z-30 flex flex-col gap-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProfile.photos[0]}
                    alt={selectedProfile.name}
                    className="w-12 h-12 rounded-full object-cover border border-stone-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1">
                      {selectedProfile.name}, {selectedProfile.age}
                      {selectedProfile.isVerified && <Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />}
                    </h4>
                    <p className="text-xs text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500" /> {selectedProfile.distance} miles away · {selectedProfile.locationName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="text-stone-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-stone-300 line-clamp-2">{selectedProfile.headline || selectedProfile.aboutMe}</p>
              <button
                onClick={() => onSelectProfile(selectedProfile)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium py-2 px-4 rounded-xl transition-colors"
              >
                View Profile & Connect
              </button>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-stone-800 text-xs font-medium text-stone-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500 animate-bounce" />
            <span>Interactive Radar: Showing profiles near you</span>
          </div>
        </div>
      )}
    </div>
  );
};

