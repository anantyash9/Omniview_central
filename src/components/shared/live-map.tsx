
'use client';

import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { usePersona } from '@/components/persona/persona-provider';
import type { Incident, Unit, CrowdDensityPoint, SocialMediaPost, Camera } from '@/lib/types';
import { AlertTriangle, User, Car, MessageCircle, Airplay, Layers, Check, Camera as CameraIcon } from 'lucide-react';
import { SvgOverlay } from './svg-overlay';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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

// A wrapper for google.maps.Polygon to use it as a React component
const Polygon = (props: google.maps.PolygonOptions) => {
    const map = useMap();
    const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map) return;
        if (!polygon) {
            const newPolygon = new google.maps.Polygon(props);
            newPolygon.setMap(map);
            setPolygon(newPolygon);
        }
        return () => {
            if (polygon) {
                polygon.setMap(null);
            }
        };
    }, [map, polygon, props]);

    useEffect(() => {
        if (polygon) {
            polygon.setOptions(props);
        }
    }, [polygon, props]);

    return null;
};


interface LiveMapProps {
    isConfigMode?: boolean;
    onMapClick?: (latLng: { lat: number; lng: number }) => void;
}

export function LiveMap({ isConfigMode = false, onMapClick }: LiveMapProps) {
  const { incidents, units, crowdDensity, socialMediaPosts, cameras } = usePersona();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [layerVisibility, setLayerVisibility] = useState({
    heatmap: true,
    incidents: true,
    units: true,
    social: true,
    floorplan: true,
    cameras: true,
    fov: true,
  });

  const center = { lat: 13.062252, lng: 77.475917 };

  type LayerKey = keyof typeof layerVisibility;
  
  const handleMapClickHandler = (e: MapMouseEvent) => {
    if (isConfigMode && onMapClick && e.detail.latLng) {
      onMapClick(e.detail.latLng);
    }
  }

  const handleLayerToggle = (layer: LayerKey) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const allLayerOptions: { id: LayerKey; label: string }[] = [
    { id: 'heatmap', label: 'Crowd Heatmap' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'units', label: 'Units' },
    { id: 'social', label: 'Social Media' },
    { id: 'floorplan', label: 'Floor Plan' },
    { id: 'cameras', label: 'Cameras' },
    { id: 'fov', label: 'Field of View' },
  ];

  const layerOptions = isConfigMode ? allLayerOptions : allLayerOptions.filter(l => l.id !== 'fov');

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden shadow-md border">
      <div className="absolute top-2 right-2 z-10">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="icon">
              <Layers className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Map Layers</h4>
                <p className="text-sm text-muted-foreground">
                  Toggle layer visibility.
                </p>
              </div>
              <div className="grid gap-2">
                {layerOptions.map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={layerVisibility[option.id]}
                      onCheckedChange={() => handleLayerToggle(option.id)}
                    />
                    <Label htmlFor={option.id} className="font-normal cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Map
        mapId={'omniview_map_main'}
        defaultCenter={center}
        defaultZoom={19}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onClick={handleMapClickHandler}
      >
        {/* Crowd Density Heatmap */}
        {layerVisibility.heatmap && !isConfigMode && <HeatmapLayer data={crowdDensity} opacity={0.7} />}

        {/* Incidents */}
        {layerVisibility.incidents && !isConfigMode && incidents.map((incident) => (
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
        {layerVisibility.social && !isConfigMode && socialMediaPosts.map((post) => (
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
        {layerVisibility.units && !isConfigMode && units.map((unit) => (
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
        
        {/* All Camera locations */}
         {layerVisibility.cameras && cameras.map((camera) => {
            const fovPoints = camera.fov || [];
            return (
                <AdvancedMarker
                    key={camera.id}
                    position={camera.location}
                    title={camera.name}
                >
                    <div className={'p-1 rounded-full shadow bg-gray-700'}>
                        <CameraIcon className="h-4 w-4 text-white" />
                    </div>
                </AdvancedMarker>
            );
        })}


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
        
        {layerVisibility.floorplan && <SvgOverlay 
          imageUrl="/floorplan.svg"
          center={{ lat: 13.0625964, lng: 77.4758496 }}
          rotation={95}
          width={250}
          height={260}
        />}

        {/* FOV for all cameras */}
        {layerVisibility.fov && !isConfigMode && cameras.map((camera) => {
            const fovPoints = camera.fov || [];
            if (fovPoints.length === 0) return null;
            return (
                <Polygon
                    key={camera.id}
                    paths={fovPoints}
                    editable={false}
                    draggable={false}
                    strokeColor="#FFC107"
                    strokeOpacity={0.7}
                    strokeWeight={2}
                    fillColor="#FFC107"
                    fillOpacity={0.2}
                />
            );
        })}
      </Map>
    </div>
  );
}
