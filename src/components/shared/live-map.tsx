'use client';

import { Map, AdvancedMarker, Pin, InfoWindow, Polygon, HeatmapLayer } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { usePersona } from '@/components/persona/persona-provider';
import type { Incident, Unit } from '@/lib/types';
import { AlertTriangle, User, Car, Drone } from 'lucide-react';

const unitIcons = {
  Personnel: <User className="h-4 w-4 text-white" />,
  Vehicle: <Car className="h-4 w-4 text-white" />,
  Drone: <Drone className="h-4 w-4 text-white" />,
};

export function LiveMap() {
  const { persona, incidents, units, predictions, crowdDensity } = usePersona();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const center = { lat: 34.0535, lng: -118.2455 };
  
  const heatmapData = crowdDensity.map(p => ({
    lat: p.location.lat,
    lng: p.location.lng,
    weight: p.density,
  }));

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md border">
      <Map
        mapId={'omniview_map_main'}
        defaultCenter={center}
        defaultZoom={15}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {/* Crowd Density Heatmap */}
        <HeatmapLayer data={heatmapData} radius={30} opacity={0.7} />

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
              <p className="text-sm">Status: {unit.status}</p>
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
