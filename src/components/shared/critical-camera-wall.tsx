'use client';
import Image from 'next/image';
import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Camera } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from 'react';
import { getPlacePhotoReferences } from '@/app/actions';

export function CriticalCameraWall() {
  const { cameras } = usePersona();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [photoReferences, setPhotoReferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      setIsLoading(true);
      try {
        const refs = await getPlacePhotoReferences("BIEC Bangalore");
        if (refs.length > 0) {
          setPhotoReferences(refs);
        }
      } catch (error) {
        console.error("Failed to fetch place photos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (apiKey) {
        fetchPhotos();
    } else {
        setIsLoading(false);
    }
  }, [apiKey]);

  const getImageUrl = (camera: Camera, index: number) => {
    // If we have user-submitted photos, use them
    if (apiKey && photoReferences.length > 0) {
      const photoRef = photoReferences[index % photoReferences.length];
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photoRef}&key=${apiKey}`;
    }
    // Fallback to Street View if Places API fails or returns no photos
    if (apiKey) {
      const { lat, lng } = camera.location;
      return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&heading=${camera.heading}&pitch=${camera.pitch}&fov=90&key=${apiKey}`;
    }
    // Final fallback to placeholder
    return `https://placehold.co/600x400.png`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Critical Camera Wall</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100%-4rem)] p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            cameras.map((camera) => (
              <Skeleton key={camera.id} className="aspect-video w-full" />
            ))
          ) : (
            cameras.map((camera, index) => (
              <div key={camera.id} className="relative rounded-lg overflow-hidden border shadow-sm aspect-video">
                <Image
                  src={getImageUrl(camera, index)}
                  alt={`View from ${camera.name}`}
                  fill
                  className="object-cover"
                  data-ai-hint="exhibition hall crowd"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white text-sm font-semibold">{camera.name}</h4>
                    {camera.isAlert && (
                      <Badge variant="destructive" className="animate-pulse">ALERT</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
