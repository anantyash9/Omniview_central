'use client';

import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

declare const google: any;

interface SvgOverlayProps {
  imageUrl: string;
  center: { lat: number; lng: number };
  width: number;  // Width in meters
  height: number; // Height in meters
  rotation: number; // Rotation in degrees
}

export function SvgOverlay({ imageUrl, center, width, height, rotation }: SvgOverlayProps) {
  const map = useMap();
  const [overlay, setOverlay] = useState<any>(null);
  const geometryLibrary = useMapsLibrary('geometry');

  useEffect(() => {
    if (!map || !geometryLibrary) return;

    class CustomGroundOverlay extends google.maps.OverlayView {
      private imageUrl: string;
      private center: google.maps.LatLng;
      private width: number;
      private height: number;
      private rotation: number;
      private div: HTMLDivElement | null = null;
      
      constructor(imageUrl: string, center: google.maps.LatLng, width: number, height: number, rotation: number) {
        super();
        this.imageUrl = imageUrl;
        this.center = center;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
      }
      
      onAdd() {
        const div = document.createElement("div");
        div.style.borderStyle = "none";
        div.style.borderWidth = "0px";
        div.style.position = "absolute";
        div.style.transformOrigin = "center";
        
        const img = document.createElement("img");
        img.src = this.imageUrl;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.position = "absolute";
        img.style.objectFit = 'contain';
        img.style.opacity = '0.75';
        
        div.appendChild(img);
        this.div = div;
        
        const panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
      }
      
      draw() {
        if (!this.div || !geometryLibrary) return;
        
        const overlayProjection = this.getProjection();
        
        // Use the map's projection to calculate pixel coordinates from lat/lng
        const centerPixel = overlayProjection.fromLatLngToDivPixel(this.center);
        if (!centerPixel) return;

        // Calculate the pixel dimensions based on the map's zoom level
        const northEast = geometryLibrary.spherical.computeOffset(this.center, this.height / 2, 0);
        const southWest = geometryLibrary.spherical.computeOffset(this.center, this.height / 2, 180);
        const east = geometryLibrary.spherical.computeOffset(this.center, this.width / 2, 90);

        const northEastPixel = overlayProjection.fromLatLngToDivPixel(northEast);
        const southWestPixel = overlayProjection.fromLatLngToDivPixel(southWest);
        const eastPixel = overlayProjection.fromLatLngToDivPixel(east);

        if(!northEastPixel || !southWestPixel || !eastPixel) return;

        const pixelHeight = Math.abs(northEastPixel.y - southWestPixel.y);
        const pixelWidth = Math.abs((eastPixel.x - centerPixel.x) * 2);
        
        const div = this.div;
        div.style.width = `${pixelWidth}px`;
        div.style.height = `${pixelHeight}px`;
        div.style.left = `${centerPixel.x - pixelWidth / 2}px`;
        div.style.top = `${centerPixel.y - pixelHeight / 2}px`;
        div.style.transform = `rotate(${this.rotation}deg)`;
      }
      
      onRemove() {
        if (this.div) {
          (this.div.parentNode as HTMLElement).removeChild(this.div);
          this.div = null;
        }
      }

      update(center: google.maps.LatLng, width: number, height: number, rotation: number) {
        this.center = center;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.draw();
      }
    }

    const centerLatLng = new google.maps.LatLng(center.lat, center.lng);

    if (overlay) {
        overlay.update(centerLatLng, width, height, rotation);
    } else {
        const newOverlay = new CustomGroundOverlay(imageUrl, centerLatLng, width, height, rotation);
        newOverlay.setMap(map);
        setOverlay(newOverlay);
    }

    return () => {
        if (overlay) {
            // Check if the div exists and is a child of the map before trying to remove
            const mapDiv = map.getDiv();
            if (overlay.div && mapDiv.contains(overlay.div)) {
                 overlay.setMap(null);
            }
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, geometryLibrary, center.lat, center.lng, width, height, rotation, imageUrl]);

  return null;
}
