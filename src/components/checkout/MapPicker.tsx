"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  position: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
}

function LocationMarker({ position, onChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

function MapUpdater({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15);
    }
  }, [position, map]);

  return null;
}

export default function MapPicker({ position, onChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [mapId, setMapId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Jakarta default

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMapId((prev) => prev + 1);
  }, []);

  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          // Limit to 5 results for dropdown
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=id`);
          const data = await response.json();
          setSuggestions(data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 800); // 800ms debounce to prevent spamming the free API

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectSuggestion = (suggestion: any) => {
    const newPos = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    };
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    onChange(newPos);
  };

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  if (!mounted) {
    return <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-[300px] w-full rounded-md overflow-hidden border relative">
      {/* Search Bar Overlay */}
      <div ref={wrapperRef} className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm">
        <div className="flex gap-2 bg-background p-1 rounded-md shadow-md border">
          <Input 
            type="text" 
            placeholder="Cari jalan, gedung, kota..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleManualSearch();
              }
            }}
            className="border-0 focus-visible:ring-0 h-9"
          />
          <Button 
            type="button" 
            onClick={handleManualSearch} 
            size="sm" 
            variant="secondary" 
            disabled={isSearching} 
            className="shrink-0 h-9 px-3"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-background border rounded-md shadow-lg overflow-hidden z-[1001] max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.place_id}
                className="px-3 py-2 text-sm hover:bg-muted cursor-pointer flex items-start gap-2 border-b last:border-b-0"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span className="line-clamp-2">{suggestion.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        key={mapId}
        center={position ? [position.lat, position.lng] : defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater position={position} />
        <LocationMarker position={position} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
