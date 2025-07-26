
'use client';

import { useState, useMemo } from 'react';
import ApiProviderWrapper from '../api-provider-wrapper';
import { usePersona } from '@/components/persona/persona-provider';
import type { Camera } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ConfigMap } from '../config/config-map';
import { cn } from '@/lib/utils';
import { CornerDownLeft, MapPin } from 'lucide-react';

type ConfigMode = 'location' | 'fov';
type FovCorner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';

const CORNERS: FovCorner[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];

export function ConfigDashboard() {
  const { cameras, setCameras } = usePersona();
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [configMode, setConfigMode] = useState<ConfigMode>('location');
  const [selectedCorner, setSelectedCorner] = useState<FovCorner | null>(null);

  const { toast } = useToast();

  const selectedCamera = useMemo(() => {
    if (!selectedCameraId) return null;
    return cameras.find(c => c.id === selectedCameraId) || null;
  }, [cameras, selectedCameraId]);

  const fovPoints = useMemo(() => {
    if (!selectedCamera?.fov) return [];
    return selectedCamera.fov;
  }, [selectedCamera]);

  const handleCameraChange = (cameraId: string) => {
    setSelectedCameraId(cameraId);
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    if (!selectedCamera) {
      toast({ variant: "destructive", title: "Please select a camera first." });
      return;
    }

    if (configMode === 'location') {
      const updatedCameras = cameras.map(c =>
        c.id === selectedCamera.id ? { ...c, location: latLng } : c
      );
      setCameras(updatedCameras);
      toast({ title: "Camera Location Updated", description: `New location for ${selectedCamera.name} set.` });
    } else if (configMode === 'fov') {
      if (!selectedCorner) {
        toast({ variant: "destructive", title: "Select a corner on the video feed first." });
        return;
      }
      const cornerIndex = CORNERS.indexOf(selectedCorner);
      const newFov = [...(selectedCamera.fov || [])];
      
      // Fill array up to the corner index if it's sparse
      for(let i=0; i<=cornerIndex; i++) {
        if(!newFov[i]) newFov[i] = latLng;
      }
      newFov[cornerIndex] = latLng;
      
      const updatedCameras = cameras.map(c =>
        c.id === selectedCamera.id ? { ...c, fov: newFov } : c
      );
      setCameras(updatedCameras);
      toast({ title: "FOV Point Set", description: `Updated ${selectedCorner} for ${selectedCamera.name}.`});
      setSelectedCorner(null); // Reset after setting a point
    }
  };

  const handleCornerClick = (corner: FovCorner) => {
    setConfigMode('fov');
    setSelectedCorner(corner);
    toast({ title: "Corner Selected", description: `Click on the map to set the location for the ${corner}.` });
  }
  
  const handleClearFov = () => {
    if (selectedCamera) {
       const updatedCameras = cameras.map(c =>
        c.id === selectedCamera.id ? { ...c, fov: [] } : c
      );
      setCameras(updatedCameras);
      toast({ title: "FOV Cleared", description: `Removed FOV points for ${selectedCamera.name}` });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Camera Configuration</CardTitle>
            <CardDescription>Select a camera and mode to configure its position and field of view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={handleCameraChange} value={selectedCameraId ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder={cameras.length > 0 ? "Select a camera..." : "Loading cameras..."} />
              </SelectTrigger>
              <SelectContent>
                {cameras.length > 0 ? cameras.map(camera => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </SelectItem>
                )) : <SelectItem value="loading" disabled>Loading...</SelectItem>}
              </SelectContent>
            </Select>

            {selectedCamera && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                   <Button onClick={() => setConfigMode('location')} variant={configMode === 'location' ? 'default' : 'outline'}><MapPin /> Set Location</Button>
                   <Button onClick={() => setConfigMode('fov')} variant={configMode === 'fov' ? 'default' : 'outline'}><CornerDownLeft />Set FOV</Button>
                </div>
                
                <div className="text-sm p-2 bg-muted rounded-lg border">
                  <h4 className="font-semibold mb-1">Instructions:</h4>
                   {configMode === 'location' && <p>Click anywhere on the map to move the camera.</p>}
                   {configMode === 'fov' && <p>1. Click a corner on the video feed below.<br/>2. Click the corresponding location on the map.</p>}
                </div>
                
                {configMode === 'fov' && (
                    <div className="flex justify-end">
                      <Button onClick={handleClearFov} variant="destructive" size="sm">Clear FOV</Button>
                    </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCamera && (
          <Card className="flex-grow">
            <CardHeader>
              <CardTitle>{selectedCamera.name} Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg overflow-hidden border shadow-sm aspect-video bg-black">
                <video
                  key={selectedCamera.id}
                  src={`/cameras/${selectedCamera.id}.mp4`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0">
                  {CORNERS.map((corner, index) => {
                    const positionClasses = {
                      topLeft: 'top-2 left-2',
                      topRight: 'top-2 right-2',
                      bottomLeft: 'bottom-2 left-2',
                      bottomRight: 'bottom-2 right-2',
                    };
                    const isSet = fovPoints && fovPoints[index];
                    return (
                        <button
                            key={corner}
                            onClick={() => handleCornerClick(corner)}
                            className={cn(
                                'absolute w-8 h-8 bg-white/30 backdrop-blur-sm border rounded-full text-white text-xs font-bold flex items-center justify-center transition-all hover:bg-white/50',
                                positionClasses[corner],
                                selectedCorner === corner && 'ring-2 ring-primary scale-110',
                                isSet && 'bg-green-500/80 border-green-300'
                            )}
                        >
                        {index + 1}
                        </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-2 h-full min-h-[400px]">
        <ApiProviderWrapper>
          <ConfigMap 
            onMapClick={handleMapClick}
            fovPoints={fovPoints}
            cameras={cameras}
            selectedCamera={selectedCamera}
           />
        </ApiProviderWrapper>
      </div>
    </div>
  );
}
