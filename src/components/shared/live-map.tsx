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
import type { Incident, Unit, CrowdDensityPoint, SocialMediaPost } from '@/lib/types';
import { AlertTriangle, User, Car, MessageCircle, Airplay } from 'lucide-react';

declare const google: any;

const unitIcons = {
  Personnel: <User className="h-4 w-4 text-white" />,
  Vehicle: <Car className="h-4 w-4 text-white" />,
  Drone: <Airplay className="h-4 w-4 text-white" />,
};

// A component to render a heatmap layer since it's not exported from the library
const HeatmapLayer = ({
  data,
  opacity,
}: {
  data: CrowdDensityPoint[];
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
    if (!map || !heatmap) return;

    heatmap.set('opacity', opacity);

    const updateRadius = () => {
        const zoom = map.getZoom();
        if (zoom) {
            // Scale the radius based on zoom level for a more consistent feel
            const newRadius = 80 * Math.pow(2, zoom - 17);
            heatmap.set('radius', newRadius);
        } else {
            heatmap.set('radius', 80);
        }
    };

    updateRadius(); // Set initial radius

    const zoomListener = map.addListener('zoom_changed', updateRadius);

    return () => {
      if(zoomListener) {
        google.maps.event.removeListener(zoomListener);
      }
    };
  }, [map, heatmap, opacity]);


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
  const { persona, incidents, units, predictions, crowdDensity, socialMediaPosts } = usePersona();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);

  const center = { lat: 13.06265, lng: 77.4764 };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md border">
      <Map
        mapId={'omniview_map_main'}
        defaultCenter={center}
        defaultZoom={18}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {/* Crowd Density Heatmap */}
        <HeatmapLayer data={crowdDensity} opacity={0.7} />

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

        {/* Social Media Posts */}
        {socialMediaPosts.map((post) => (
            <AdvancedMarker
                key={post.id}
                position={post.location}
                onClick={() => setSelectedPost(post)}
            >
                <div className="p-1.5 bg-sky-500 rounded-full shadow-lg animate-pulse">
                    <MessageCircle className="h-4 w-4 text-white" />
                </div>
            </AdvancedMarker>
        ))}

        {selectedPost && (
            <InfoWindow
                position={selectedPost.location}
                onCloseClick={() => setSelectedPost(null)}
                pixelOffset={[0, -20]}
            >
                <div className="p-1 max-w-xs">
                    <p className="font-bold text-sky-600">{selectedPost.author}</p>
                    <p className="text-sm">{selectedPost.text}</p>
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
              <h3 className="font-bold">{selectedUnit.type} {selectedUnit.id}</h3>
              <p className="text-sm">{selectedUnit.status}</p>
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
