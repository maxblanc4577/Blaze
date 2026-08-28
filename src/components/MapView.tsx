/// <reference types="vite/client" />
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { UserProfile } from '../types.ts';
import { MapPin, Shield, Star } from 'lucide-react';

interface MapViewProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
}

export const MapView: React.FC<MapViewProps> = ({ profiles, onSelectProfile }) => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  // Default center around San Francisco or user's avg location
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };

  // Use public maps demo key or env var
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSy-demo-key-for-maps";

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-sm border border-stone-200 relative bg-stone-100">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="blaze_radar_map"
          gestureHandling={'greedy'}
          disableBCC={false}
          className="w-full h-full"
        >
          {profiles.map((profile, index) => {
            // Generate some deterministic lat/lng offsets if none provided
            const lat = profile.latitude || (37.7749 + (index * 0.01 - 0.05));
            const lng = profile.longitude || (-122.4194 + (index * 0.01 - 0.05));

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
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-orange-600 animate-bounce" />
        <span>Live Radar: Showing profiles near you</span>
      </div>
    </div>
  );
};
