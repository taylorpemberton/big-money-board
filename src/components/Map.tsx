import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Event } from '../types/Event';
import { getEventColors } from '../utils/eventStyles';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface MapProps {
  events: Event[];
}

interface Blip {
  id: string;
  coordinates: [number, number];
  color: string;
  timestamp: number;
}

interface Geography {
  rsmKey: string;
  properties: Record<string, any>;
  geometry: any;
}

export const Map: React.FC<MapProps> = ({ events }) => {
  const [blips, setBlips] = useState<Blip[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0];
      if (latestEvent.country) {
        // Convert country code to coordinates (simplified mapping)
        const coordinates = getCountryCoordinates(latestEvent.country);
        if (coordinates) {
          const newBlip: Blip = {
            id: Date.now().toString(),
            coordinates,
            color: getEventColors(latestEvent).text,
            timestamp: Date.now(),
          };
          setBlips(prev => [...prev, newBlip]);
        }
      }
    }
  }, [events]);

  // Remove blips after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setBlips(prev => prev.filter(blip => now - blip.timestamp < 5000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black p-4">
      <ComposableMap
        projectionConfig={{
          scale: 150,
          center: [0, 20],
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: Geography[] }) =>
            geographies.map((geo: Geography) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#D1D5DB"
                stroke="#9CA3AF"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
        {blips.map((blip) => (
          <Marker
            key={blip.id}
            coordinates={blip.coordinates}
          >
            <circle
              r={4}
              fill={blip.color}
              opacity={1 - (Date.now() - blip.timestamp) / 5000}
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

// Simplified country to coordinates mapping
const getCountryCoordinates = (countryCode: string): [number, number] | null => {
  const coordinates: Record<string, [number, number]> = {
    US: [-95.7129, 37.0902],
    GB: [-0.1276, 51.5074],
    CA: [-106.3468, 56.1304],
    AU: [151.2093, -33.8688],
    DE: [10.4515, 51.1657],
    FR: [2.3522, 48.8566],
    JP: [139.6917, 35.6895],
    CN: [116.4074, 39.9042],
    IN: [77.1025, 28.7041],
    BR: [-47.8645, -15.7801],
    // Add more countries as needed
  };
  return coordinates[countryCode] || null;
}; 