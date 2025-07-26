
'use client';

import { useState } from 'react';
import { LiveMap } from '@/components/shared/live-map';
import ApiProviderWrapper from '../api-provider-wrapper';
import { usePersona } from '@/components/persona/persona-provider';
import type { Camera } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { mapPixelToLatLng } from '@/lib/geo-utils';
import { useToast } from '@/hooks/use-toast';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Camera as CameraIcon } from 'lucide-react';


export function ConfigDashboard() {
  const { cameras, setCameras } = usePersona(); // Assuming setCameras is available from context
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [fovPoints, setFovPoints] = useState<{ lat: number; lng: number }[]>([]);
  const { toast } = useToast();

  const handleCameraChange = (cameraId: string) => {
    const camera = cameras.find(c => c.id === cameraId) || null;
    setSelectedCamera(camera);
    setFovPoints(camera?.fov || []);
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    if (selectedCamera) {
      if (fovPoints.length < 4) {
        setFovPoints(prevPoints => [...prevPoints, latLng]);
      } else {
        toast({
          variant: "destructive",
          title: "FOV Shape Complete",
          description: "You can only add 4 points to define the camera's field of view.",
        });
      }
    }
  };

  const handleClearFov = () => {
    setFovPoints([]);
  }

  const handleSaveFov = () => {
    if (selectedCamera && fovPoints.length === 4) {
      const updatedCameras = cameras.map(c => 
        c.id === selectedCamera.id ? { ...c, fov: fovPoints } : c
      );
      setCameras(updatedCameras); // This should be implemented in PersonaProvider
      toast({
        title: "FOV Saved",
        description: `Field of view for ${selectedCamera.name} has been updated.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Cannot Save FOV",
        description: "Please select a camera and define exactly 4 points for the FOV.",
      });
    }
  };

  const testMapping = () => {
    if (selectedCamera && selectedCamera.fov && selectedCamera.fov.length === 4) {
      // Test with a pixel coordinate (e.g., center of the video feed)
      const pixel = { x: 400, y: 300 }; // Assuming an 800x600 video feed
      const videoDimensions = { width: 800, height: 600 };
      const latLng = mapPixelToLatLng(pixel, selectedCamera.fov, videoDimensions);
      
      toast({
          title: "Pixel to Lat/Lng Mapping Test",
          description: `Pixel (x:${pixel.x}, y:${pixel.y}) maps to Lat: ${latLng.lat.toFixed(6)}, Lng: ${latLng.lng.toFixed(6)}`,
          duration: 9000
      });
    } else {
        toast({
            variant: "destructive",
            title: "Mapping Test Failed",
            description: "Please save a 4-point FOV for the selected camera first.",
        });
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Camera Configuration</CardTitle>
                <CardDescription>Select a camera to configure its field of view (FOV) on the map.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select onValueChange={handleCameraChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a camera..." />
                    </SelectTrigger>
                    <SelectContent>
                        {cameras.map(camera => (
                            <SelectItem key={camera.id} value={camera.id}>
                                {camera.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedCamera && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Field of View (FOV) Points:</p>
                        <ul className="text-xs text-muted-foreground list-disc pl-5">
                            {fovPoints.map((p, i) => <li key={i}>{`Lat: ${p.lat.toFixed(4)}, Lng: ${p.lng.toFixed(4)}`}</li>)}
                        </ul>
                         <div className="flex gap-2 pt-2">
                            <Button onClick={handleSaveFov} disabled={fovPoints.length !== 4}>Save FOV</Button>
                            <Button onClick={handleClearFov} variant="outline">Clear</Button>
                         </div>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {selectedCamera && (
          <Card className="flex-grow">
            <CardHeader>
                <CardTitle>{selectedCamera.name}</CardTitle>
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
                </div>
                 <Button onClick={testMapping} className="mt-4 w-full">Test Coordinate Mapping</Button>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-2 h-full min-h-[400px]">
        <ApiProviderWrapper>
          <LiveMap 
            isConfigMode={true}
            onMapClick={handleMapClick}
            configFovPoints={fovPoints}
            selectedCamera={selectedCamera}
           />
        </ApiProviderWrapper>
      </div>
    </div>
  );
}
