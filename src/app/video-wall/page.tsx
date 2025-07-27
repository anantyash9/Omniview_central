
'use client';

import { useState } from 'react';
import { usePersona } from '@/components/persona/persona-provider';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Cpu } from 'lucide-react';
import { PersonaProvider } from '@/components/persona/persona-provider';

function VideoWallContent() {
  const { cameras } = usePersona();
  const [showProcessed, setShowProcessed] = useState(false);

  const getStreamUrl = (url: string) => {
    if (!showProcessed) return url;
    // This is a simple replacement, adjust if the URL structure is different
    return url.replace('/original', '/processed');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Camera Video Wall</h1>
            <Button onClick={() => setShowProcessed(prev => !prev)} variant="outline">
                {showProcessed ? <Cpu className="mr-2" /> : <Video className="mr-2" />}
                Show {showProcessed ? 'Original' : 'Processed'} View
            </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cameras.map((camera) => (
            <Card key={camera.id}>
                <CardHeader className="p-3">
                    <CardTitle className="text-base flex justify-between items-center">
                        {camera.name}
                        {camera.isAlert && <Badge variant="destructive">ALERT</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative rounded-b-lg overflow-hidden border-t shadow-sm aspect-video bg-black">
                    {camera.stream ? (
                        <img
                        src={getStreamUrl(camera.stream)}
                        alt={`${camera.name} Stream`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://placehold.co/640x480/000000/FFFFFF/png?text=Stream+Error`;
                            target.alt = 'Stream failed to load';
                        }}
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Video className="w-10 h-10 text-muted-foreground" />
                        </div>
                    )}
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}


export default function VideoWallPage() {
    return (
        <PersonaProvider>
            <VideoWallContent />
        </PersonaProvider>
    )
}
