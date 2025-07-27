
'use client';

import {
  Map,
  AdvancedMarker,
  useMap,
  MapMouseEvent,
  Pin,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import type { Camera, DensityZone } from '@/lib/types';
import { SvgOverlay } from '../shared/svg-overlay';
import { Camera as CameraIcon } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';

declare const google: any;

const Polygon = (props: google.maps.PolygonOptions & { id: string }) => {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  // Create the polygon instance
  useEffect(() => {
    if (!map) return;

    if (!polygonRef.current) {
        polygonRef.current = new google.maps.Polygon(props);
        polygonRef.current.setMap(map);
    }

    // Cleanup: remove polygon from map when component unmounts
    return () => {
        if (polygonRef.current) {
            polygonRef.current.setMap(null);
            polygonRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]); // Only depends on map

  // Update polygon options when props change
  useEffect(() => {
    if (polygonRef.current) {
        polygonRef.current.setOptions(props);
    }
  }, [props]);

  return null;
};


// DrawingManager Component
const DrawingManager = ({ onPolygonComplete, drawingMode }: { onPolygonComplete: (path: {lat: number, lng: number}[]) => void, drawingMode: 'polygon' | null }) => {
    const map = useMap();
    const drawingLibrary = useMapsLibrary('drawing');
    const [manager, setManager] = useState<google.maps.drawing.DrawingManager | null>(null);

    useEffect(() => {
        if (!map || !drawingLibrary) return;

        if (!manager) {
            const newManager = new drawingLibrary.DrawingManager({
                drawingControl: false,
                polygonOptions: {
                    editable: true,
                    draggable: true,
                    fillColor: "#FF5722",
                    strokeColor: "#BF360C",
                    fillOpacity: 0.3,
                    strokeWeight: 3
                },
            });
            newManager.setMap(map);
            setManager(newManager);
            
            google.maps.event.addListener(newManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
                const path = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
                onPolygonComplete(path);
                // After completing, the polygon is handled by the main state, so we remove the one created by the manager
                polygon.setMap(null);
                // Exit drawing mode
                newManager.setDrawingMode(null);
            });
        }

        return () => {
            if (manager) {
                google.maps.event.clearInstanceListeners(manager);
                manager.setMap(null);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, drawingLibrary]);
    
    useEffect(() => {
        if(manager) {
            manager.setDrawingMode(drawingMode === 'polygon' ? google.maps.drawing.OverlayType.POLYGON : null);
        }
    }, [manager, drawingMode]);

    return null;
};


interface ConfigMapProps {
    onMapClick: (latLng: { lat: number; lng: number }) => void;
    cameras: Camera[];
    selectedCamera?: Camera | null;
    densityZones: DensityZone[];
    onPolygonComplete: (path: { lat: number; lng: number }[]) => void;
    drawingMode: 'polygon' | null;
    selectedZoneId?: string | null;
    activeTab: 'cameras' | 'zones';
}

export function ConfigMap({ 
    onMapClick, 
    cameras, 
    selectedCamera, 
    densityZones,
    onPolygonComplete,
    drawingMode,
    selectedZoneId,
    activeTab,
}: ConfigMapProps) {
  const center = { lat: 13.062252, lng: 77.475917 };

  const handleMapClickHandler = (e: MapMouseEvent) => {
    if (drawingMode) return; // Prevent camera placement while drawing
    if (onMapClick && e.detail.latLng) {
      onMapClick(e.detail.latLng);
    }
  }

  const fovPoints = useMemo(() => {
    if (!selectedCamera?.fov) return [];
    return selectedCamera.fov;
  }, [selectedCamera]);
  
  const getZoneColor = (zone: DensityZone, allZones: DensityZone[], isSelected: boolean) => {
      const HUE_RED = 0;
      const HUE_GREEN = 120;

      if (isSelected) {
          return { stroke: '#1E88E5', fill: '#42A5F5' };
      }
      
      if (allZones.length <= 1) {
          return { stroke: '#0288D1', fill: '#03A9F4' }; // Neutral blue
      }

      const densities = allZones.map(z => z.maxDensity);
      const minDensity = Math.min(...densities);
      const maxDensity = Math.max(...densities);

      if (maxDensity === minDensity) {
          return { stroke: '#0288D1', fill: '#03A9F4' }; // All same density, use neutral blue
      }

      // Normalize density from 0 (red) to 1 (green)
      const t = (zone.maxDensity - minDensity) / (maxDensity - minDensity);
      const hue = HUE_RED + t * (HUE_GREEN - HUE_RED);

      return {
          stroke: `hsl(${hue}, 80%, 40%)`,
          fill: `hsl(${hue}, 90%, 60%)`,
      };
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden shadow-md border">
      <Map
        mapId={'omniview_map_config'}
        defaultCenter={center}
        defaultZoom={19}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onClick={handleMapClickHandler}
        tilt={0} // Disable tilt for easier configuration
      >
        <DrawingManager onPolygonComplete={onPolygonComplete} drawingMode={drawingMode} />

        <SvgOverlay 
          imageUrl="/floorplan.svg"
          center={{ lat: 13.0625964, lng: 77.4758496 }}
          rotation={95}
          width={250}
          height={260}
        />
        
        {activeTab === 'cameras' && (
            <>
                {cameras.map((camera) => (
                    <AdvancedMarker
                        key={camera.id}
                        position={camera.location}
                        title={camera.name}
                    >
                        <div className={`p-1 rounded-full shadow ${selectedCamera?.id === camera.id ? 'bg-primary' : 'bg-gray-700'}`}>
                            <CameraIcon className="h-4 w-4 text-white" />
                        </div>
                    </AdvancedMarker>
                ))}
                
                {fovPoints.length > 0 && selectedCamera && (
                    <>
                        <Polygon
                            id={`fov-poly-${selectedCamera.id}`}
                            key={`fov-poly-${selectedCamera.id}`}
                            paths={fovPoints}
                            editable={false}
                            draggable={false}
                            strokeColor="#FFC107"
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor="#FFC107"
                            fillOpacity={0.3}
                        />
                        {fovPoints.map((point, index) => (
                            <AdvancedMarker key={`fov-marker-${selectedCamera.id}-${index}`} position={point}>
                                <Pin background={'#FFC107'} borderColor={'#B28505'} glyphColor={'#000000'}>
                                    <span className="text-sm font-bold">{index + 1}</span>
                                </Pin>
                            </AdvancedMarker>
                        ))}
                    </>
                )}
            </>
        )}
        
        {activeTab === 'zones' && (
            <>
                {densityZones.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    const { stroke, fill } = getZoneColor(zone, densityZones, isSelected);
                    
                    return (
                        <Polygon
                            id={zone.id}
                            key={zone.id}
                            paths={zone.points}
                            editable={false}
                            draggable={false}
                            strokeColor={stroke}
                            strokeOpacity={1}
                            strokeWeight={isSelected ? 4 : 2}
                            fillColor={fill}
                            fillOpacity={0.4}
                        />
                    );
                })}
            </>
        )}
      </Map>
    </div>
  );
}
