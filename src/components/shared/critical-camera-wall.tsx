'use client';
import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
              <video
                src={`/cameras/${camera.id}.mp4`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
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
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
