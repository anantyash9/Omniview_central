'use client';
import Image from 'next/image';
import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const cameraHints = [
  "street crowd", "city plaza", "public event", "surveillance camera", "security view", "urban corner"
];


export function CriticalCameraWall() {
  const { cameras } = usePersona();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Critical Camera Wall</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100%-4rem)] p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera, index) => (
            <div key={camera.id} className="relative rounded-lg overflow-hidden border shadow-sm aspect-video">
              <Image
                src={`https://placehold.co/600x400.png`}
                data-ai-hint={cameraHints[index % cameraHints.length]}
                alt={`View from ${camera.name}`}
                layout="fill"
                objectFit="cover"
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
