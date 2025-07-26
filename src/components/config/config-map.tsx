
'use client';

import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import type { Camera } from '@/lib/types';
import { SvgOverlay } from '../shared/svg-overlay';
import { Camera as CameraIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

declare const google: any;

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


interface ConfigMapProps {
    onMapClick: (latLng: { lat: number; lng: number }) => void;
    fovPoints?: { lat: number; lng: number }[];
    cameras: Camera[];
    selectedCamera?: Camera | null;
}

export function ConfigMap({ onMapClick, fovPoints = [], cameras, selectedCamera }: ConfigMapProps) {
  const center = { lat: 13.062252, lng: 77.475917 };

  const handleMapClickHandler = (e: MapMouseEvent) => {
    if (onMapClick && e.detail.latLng) {
      onMapClick(e.detail.latLng);
    }
  }

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
        <SvgOverlay 
          imageUrl="/floorplan.svg"
          center={{ lat: 13.0625964, lng: 77.4758496 }}
          rotation={95}
          width={250}
          height={260}
        />

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

        {fovPoints.length > 0 && (
             <Polygon
                paths={fovPoints}
                editable={false}
                draggable={false}
                strokeColor="#FFC107"
                strokeOpacity={1}
                strokeWeight={3}
                fillColor="#FFC107"
                fillOpacity={0.3}
            />
        )}
      </Map>
    </div>
  );
}

