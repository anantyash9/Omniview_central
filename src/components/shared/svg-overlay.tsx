'use client';

import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

declare const google: any;

interface SvgOverlayProps {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  imageUrl: string;
}

export function SvgOverlay({ bounds, imageUrl }: SvgOverlayProps) {
  const map = useMap();
  const [overlay, setOverlay] = useState<any>(null);

  useEffect(() => {
    if (!map) return;

    // Define the custom overlay class *inside* the effect,
    // so it's only created on the client when `map` is available.
    class CustomGroundOverlay extends google.maps.OverlayView {
        private bounds: google.maps.LatLngBounds;
        private imageUrl: string;
        private div: HTMLDivElement | null = null;
        private rotation: number;
      
        constructor(bounds: google.maps.LatLngBounds, imageUrl: string) {
          super();
          this.bounds = bounds;
          this.imageUrl = imageUrl;
          
          const ne = this.bounds.getNorthEast();
          const sw = this.bounds.getSouthWest();
          const projection = map.getProjection();

          if (!projection) {
              this.rotation = 0;
              return;
          }

          // We can't use the SW and NE to calculate the rotation,
          // instead we need the top-left and top-right corners.
          const topRight = new google.maps.LatLng(ne.lat(), ne.lng());
          const topLeft = new google.maps.LatLng(ne.lat(), sw.lng());

          const topRightPoint = projection.fromLatLngToPoint(topRight);
          const topLeftPoint = projection.fromLatLngToPoint(topLeft);

          if (!topRightPoint || !topLeftPoint) {
              this.rotation = 0;
              return;
          }

          const dx = topRightPoint.x - topLeftPoint.x;
          const dy = topRightPoint.y - topLeftPoint.y;
          this.rotation = Math.atan2(dy, dx) * (180 / Math.PI);
        }
      
        onAdd() {
          const div = document.createElement("div");
          div.style.borderStyle = "none";
          div.style.borderWidth = "0px";
          div.style.position = "absolute";
      
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
            if (!this.div) return;
    
            const overlayProjection = this.getProjection();
        
            const sw = overlayProjection.fromLatLngToDivPixel(
                this.bounds.getSouthWest()
            );
            const ne = overlayProjection.fromLatLngToDivPixel(
                this.bounds.getNorthEast()
            );
        
            this.div.style.left = sw.x + "px";
            this.div.style.top = ne.y + "px";
            this.div.style.width = ne.x - sw.x + "px";
            this.div.style.height = sw.y - ne.y + "px";
            this.div.style.transformOrigin = 'top left';
            this.div.style.transform = `rotate(${this.rotation}deg)`;
        }
      
        onRemove() {
          if (this.div) {
            (this.div.parentNode as HTMLElement).removeChild(this.div);
            this.div = null;
          }
        }
    }

    const latLngBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.south, bounds.west),
      new google.maps.LatLng(bounds.north, bounds.east)
    );

    const groundOverlay = new CustomGroundOverlay(latLngBounds, imageUrl);
    groundOverlay.setMap(map);
    setOverlay(groundOverlay);

    return () => {
      if (overlay) {
        overlay.setMap(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, bounds, imageUrl]);

  return null;
}
