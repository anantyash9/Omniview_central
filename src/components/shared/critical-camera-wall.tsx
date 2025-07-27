'use client';
import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video } from 'lucide-react';

export function CriticalCameraWall() {
  const { cameras } = usePersona();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Critical Camera Wall</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100%-4rem)] p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <div key={camera.id} className="relative rounded-lg overflow-hidden border shadow-sm aspect-video bg-black">
              {camera.stream ? (
                <img
                  src={camera.stream}
                  alt={`${camera.name} Stream`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/640x480/000000/FFFFFF/png?text=Stream+Error';
                      target.alt = 'Stream failed to load';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Video className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex justify-between items-center">
                  <h4 className="text-white text-sm font-semibold">{camera.name}</h4>
                  {camera.isAlert && (
                    <Badge variant="destructive" className="animate-pulse">ALERT</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
