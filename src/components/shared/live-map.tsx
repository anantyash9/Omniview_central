'use client';

import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { usePersona } from '@/components/persona/persona-provider';
import type { Incident, Unit, CrowdDensityPoint } from '@/lib/types';
import { AlertTriangle, User, Car } from 'lucide-react';

declare const google: any;

const DroneIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-white"
    >
      <path d="M12.22 18.02a2.5 2.5 0 1 0-4.24-4.24 2.5 2.5 0 0 0 4.24 4.24Z"/>
      <path d="M21 6h-4.04"/>
      <path d="m16.96 6-4.95 4.95"/>
      <path d="M21 18h-4.04"/>
      <path d="m16.96 18-4.95-4.95"/>
      <path d="M3 12v-2a4 4 0 0 1 4-4h2"/>
      <path d="M3 12v2a4 4 0 0 0 4 4h2"/>
    </svg>
  );

const unitIcons = {
  Personnel: <User className="h-4 w-4 text-white" />,
  Vehicle: <Car className="h-4 w-4 text-white" />,
  Drone: <DroneIcon />,
};

// A component to render a heatmap layer since it's not exported from the library
const HeatmapLayer = ({
  data,
  radius,
  opacity,
}: {
  data: CrowdDensityPoint[];
  radius?: number;
  opacity?: number;
}) => {
  const map = useMap();
  const vizLibrary = useMapsLibrary('visualization');
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!vizLibrary || !map) {
      return;
    }

    if (!heatmap) {
      const newHeatmap = new vizLibrary.HeatmapLayer({ map });
      setHeatmap(newHeatmap);
    }
    
    return () => {
      if (heatmap) {
        heatmap.setMap(null);
      }
    };
  }, [vizLibrary, map, heatmap]);

  useEffect(() => {
    if (!heatmap) return;

    const weightedData = data.map(p => ({
      location: new google.maps.LatLng(p.location.lat, p.location.lng),
      weight: p.density,
    }));
    heatmap.setData(weightedData);
  }, [heatmap, data]);

  useEffect(() => {
    if (!heatmap) return;
    heatmap.setOptions({ radius, opacity });
  }, [heatmap, radius, opacity]);

  return null;
};

// A custom Polygon component since it's not exported from the library
const Polygon = (options: google.maps.PolygonOptions) => {
  const map = useMap();
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!polygon) {
      setPolygon(new google.maps.Polygon());
    }

    // remove polygon from map on unmount
    return () => {
      if (polygon) {
        polygon.setMap(null);
      }
    };
  }, [map, polygon]);

  useEffect(() => {
    if (polygon) {
      polygon.setOptions({...options, map});
    }
  }, [polygon, options, map]);

  return null;
};


export function LiveMap() {
  const { persona, incidents, units, predictions, crowdDensity } = usePersona();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const center = { lat: 12.978813, lng: 77.5996565 };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md border">
      <Map
        mapId={'omniview_map_main'}
        defaultCenter={center}
        defaultZoom={17}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {/* Crowd Density Heatmap */}
        <HeatmapLayer data={crowdDensity} radius={30} opacity={0.7} />

        {/* Incidents */}
        {incidents.map((incident) => (
          <AdvancedMarker
            key={incident.id}
            position={incident.location}
            onClick={() => setSelectedIncident(incident)}
          >
            <Pin background={'#DC2626'} borderColor={'#7F1D1D'} glyphColor={'#FFFFFF'}>
              <AlertTriangle className="h-5 w-5" />
            </Pin>
          </AdvancedMarker>
        ))}

        {selectedIncident && (
          <InfoWindow
            position={selectedIncident.location}
            onCloseClick={() => setSelectedIncident(null)}
          >
            <div className="p-1 max-w-xs">
              <h3 className="font-bold">{selectedIncident.title}</h3>
              <p className="text-sm">{selectedIncident.description}</p>
            </div>
          </InfoWindow>
        )}

        {/* Units */}
        {units.map((unit) => (
          <AdvancedMarker
            key={unit.id}
            position={unit.location}
            onClick={() => setSelectedUnit(unit)}
          >
            <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary))'} glyphColor={'#FFFFFF'}>
              {unitIcons[unit.type]}
            </Pin>
          </AdvancedMarker>
        ))}

        {selectedUnit && (
           <InfoWindow
            position={selectedUnit.location}
            onCloseClick={() => setSelectedUnit(null)}
          >
            <div className="p-1 max-w-xs">
              <h3 className="font-bold">{unit.type} {unit.id}</h3>
              <p className="text-sm">{unit.status}</p>
            </div>
          </InfoWindow>
        )}

        {/* Commander Predictions */}
        {persona === 'Commander' && predictions.map((poly) => (
          <Polygon
            key={poly.id}
            paths={poly.points}
            strokeColor="#FFB300"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillColor="#FFB300"
            fillOpacity={0.35}
          />
        ))}
      </Map>
    </div>
  );
}
