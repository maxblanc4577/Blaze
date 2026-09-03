/// <reference types="vite/client" />
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { UserProfile } from '../types.ts';
import { MapPin, Shield, Key, AlertCircle, Lock, Unlock } from 'lucide-react';

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
  const [isViewLocked, setIsViewLocked] = useState<boolean>(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchDistStart, setTouchDistStart] = useState<number | null>(null);

  const defaultCenter = { lat: 37.7749, lng: -122.4194 };
  const effectiveApiKey = apiKeyInput || "AIzaSyDummyKey";

  const filteredProfiles = profiles.filter(p => (p.distance || 5) <= searchRadius);

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-sm border border-stone-200 relative bg-stone-900 flex flex-col">
      {/* Top Bar for Map Mode / API Key & Heatmap Toggle & Radius Slider & View Lock */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-stone-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-stone-800 text-xs text-white">
        <button
          onClick={() => setIsViewLocked(!isViewLocked)}
          className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
            isViewLocked ? 'bg-emerald-600 text-white shadow' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
          title="Toggle Auto-Recenter Lock"
        >
          {isViewLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isViewLocked ? 'View Locked' : 'View Unlocked'}</span>
        </button>
        <span className="text-stone-700">|</span>
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
                    {/* User's Custom Location Marker */}
                    <AdvancedMarker position={defaultCenter} zIndex={5}>
                      <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="absolute w-40 h-40 rounded-full border-2 border-amber-400 bg-amber-500/20 animate-ping pointer-events-none" />
                        <div className="absolute w-20 h-20 rounded-full border border-amber-300 bg-amber-400/30 animate-pulse pointer-events-none" />
                        <div className="w-12 h-12 rounded-full border-2 border-amber-400 shadow-2xl bg-stone-900 overflow-hidden relative z-10 flex items-center justify-center">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                            alt="You"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute -bottom-3 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white z-20 whitespace-nowrap">
                          📍 You
                        </span>
                      </div>
                    </AdvancedMarker>

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
                        {profile.status === 'online' && (
                          <div className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
                        )}
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-md bg-white relative z-10">
                          <img
                            src={profile.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className={`absolute -bottom-1 right-0 w-3 h-3 rounded-full border-2 border-white z-20 ${profile.status === 'online' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                      </div>
                    </AdvancedMarker>
                  );
                })}
                  </>
                );
              })()}
            </Map>
          </APIProvider>
        </div>
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center relative overflow-hidden bg-stone-950 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onWheel={(e) => {
            e.preventDefault();
            setZoom(prev => Math.max(0.5, Math.min(3, prev - e.deltaY * 0.002)));
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              setIsDragging(true);
              setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
            } else if (e.touches.length === 2) {
              const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
              setTouchDistStart(dist);
            }
          }}
          onTouchMove={(e) => {
            if (isDragging && e.touches.length === 1) {
              setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
            } else if (e.touches.length === 2 && touchDistStart !== null) {
              const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
              const factor = dist / touchDistStart;
              setZoom(prev => Math.max(0.5, Math.min(3, prev * factor)));
              setTouchDistStart(dist);
            }
          }}
          onTouchEnd={() => {
            setIsDragging(false);
            setTouchDistStart(null);
          }}
        >
          {/* Zoom & Pan Transform Container */}
          <div 
            className="w-full h-full flex items-center justify-center relative transition-transform duration-75"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
          {/* Concentric Distance Rings (5mi, 10mi, 25mi, 50mi) */}
          <div className="absolute w-[120px] h-[120px] rounded-full border border-orange-500/30 flex items-center justify-center pointer-events-none">
            <span className="absolute top-1 text-[9px] text-orange-400/80 font-bold">5 mi</span>
          </div>
          <div className="absolute w-[240px] h-[240px] rounded-full border border-orange-500/25 flex items-center justify-center pointer-events-none">
            <span className="absolute top-2 text-[9px] text-orange-400/80 font-bold">10 mi</span>
          </div>
          <div className="absolute w-[380px] h-[380px] rounded-full border border-amber-500/20 flex items-center justify-center pointer-events-none">
            <span className="absolute top-3 text-[9px] text-amber-400/80 font-bold">25 mi</span>
          </div>
          <div className="absolute w-[520px] h-[520px] rounded-full border border-stone-700/30 flex items-center justify-center pointer-events-none">
            <span className="absolute top-3 text-[9px] text-stone-400/80 font-bold">50 mi</span>
          </div>

          <div className="absolute w-14 h-14 rounded-full border-2 border-amber-400 shadow-2xl bg-stone-900 overflow-hidden flex items-center justify-center z-20">
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-60 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
              alt="You"
              className="w-full h-full object-cover"
            />
            <span className="absolute -bottom-4 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-white whitespace-nowrap">
              📍 You
            </span>
          </div>

          {/* Search Radius Circle Overlay based on searchRadius */}
          <div
            className="absolute rounded-full border-2 border-amber-500/50 bg-amber-500/5 pointer-events-none transition-all duration-300"
            style={{ width: `${Math.min(600, searchRadius * 10)}px`, height: `${Math.min(600, searchRadius * 10)}px` }}
          ></div>

          {/* Profile Avatars Placed Radially */}
          {filteredProfiles.map((profile, idx) => {
            const angle = (idx / filteredProfiles.length) * 2 * Math.PI;
            const radius = 90 + (idx % 3) * 55;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isActive = profile.status === 'online';

            return (
              <div
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className="absolute cursor-pointer group transition-transform hover:scale-125 z-10"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {isActive && (
                  <div className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
                )}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 shadow-xl bg-stone-800 relative z-10">
                  <img
                    src={profile.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className={`absolute -bottom-1 right-0 w-3 h-3 rounded-full border-2 border-white z-20 ${isActive ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/90 text-white px-2 py-0.5 rounded-full text-[10px] font-medium border border-stone-800 shadow">
                  {profile.name} ({profile.distance}m)
                </div>
              </div>
            );
          })}

          </div>
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
            <span>Interactive Radar: Showing concentric distance rings (5, 10, 25 mi)</span>
          </div>
        </div>
      )}
    </div>
  );
};
