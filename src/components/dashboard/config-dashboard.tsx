
'use client';

import { useState, useMemo } from 'react';
import ApiProviderWrapper from '../api-provider-wrapper';
import { usePersona } from '@/components/persona/persona-provider';
import type { Camera, DensityZone } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ConfigMap } from '../config/config-map';
import { cn } from '@/lib/utils';
import { CornerDownLeft, MapPin, Layers, Trash2, Pencil } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ConfigMode = 'location' | 'fov';
type FovCorner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';
type DrawingMode = 'polygon' | null;
type ActiveTab = 'cameras' | 'zones';

const CORNERS: FovCorner[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];

export function ConfigDashboard() {
  const { cameras, setCameras, densityZones, setDensityZones } = usePersona();
  const [activeTab, setActiveTab] = useState<ActiveTab>('cameras');
  
  // Camera State
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [configMode, setConfigMode] = useState<ConfigMode>('location');
  const [selectedCorner, setSelectedCorner] = useState<FovCorner | null>(null);
  
  // Density Zone State
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);

  const { toast } = useToast();

  const selectedCamera = useMemo(() => {
    if (!selectedCameraId) return null;
    return cameras.find(c => c.id === selectedCameraId) || null;
  }, [cameras, selectedCameraId]);

  const fovPoints = useMemo(() => {
    if (!selectedCamera?.fov) return [];
    return selectedCamera.fov;
  }, [selectedCamera]);
  
  const selectedZone = useMemo(() => {
    if (!selectedZoneId) return null;
    return densityZones.find(z => z.id === selectedZoneId) || null;
  }, [densityZones, selectedZoneId]);

  const handleTabChange = (value: string) => {
    const newTab = value as ActiveTab;
    setActiveTab(newTab);
    
    // Clear context when switching tabs
    if (newTab === 'cameras') {
      setSelectedZoneId(null);
      setDrawingMode(null);
    } else { // newTab is 'zones'
      setSelectedCameraId(null);
      setConfigMode('location');
      setSelectedCorner(null);
    }
  };

  const handleCameraChange = (cameraId: string) => {
    setSelectedCameraId(cameraId);
  };

  const handleMapClick = (latLng: { lat: number; lng: number }) => {
    if (activeTab === 'cameras') {
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
        
        for(let i=0; i<=cornerIndex; i++) {
          if(!newFov[i]) newFov[i] = latLng;
        }
        newFov[cornerIndex] = latLng;
        
        const updatedCameras = cameras.map(c =>
          c.id === selectedCamera.id ? { ...c, fov: newFov } : c
        );
        setCameras(updatedCameras);
        toast({ title: "FOV Point Set", description: `Updated ${selectedCorner} for ${selectedCamera.name}.`});
        setSelectedCorner(null);
      }
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

  const handlePolygonComplete = (path: { lat: number; lng: number }[]) => {
    const newZone: DensityZone = {
        id: `zone-${Date.now()}`,
        name: `New Zone ${densityZones.length + 1}`,
        points: path,
        maxDensity: 5,
    };
    setDensityZones(prevZones => [...prevZones, newZone]);
    setDrawingMode(null);
    setSelectedZoneId(newZone.id);
    toast({ title: "Zone Created", description: `${newZone.name} has been added.` });
  };
  
  const handleZoneUpdate = (zoneId: string, updates: Partial<DensityZone>) => {
    const updatedZones = densityZones.map(z => z.id === zoneId ? {...z, ...updates} : z);
    setDensityZones(updatedZones);
  }

  const handleDeleteZone = async (zoneId: string) => {
    try {
        await deleteDoc(doc(db, "densityZones", zoneId));
        
        const newZones = densityZones.filter(z => z.id !== zoneId)
        setDensityZones(newZones);
        
        if (selectedZoneId === zoneId) {
            setSelectedZoneId(null);
        }
        toast({ title: "Zone Deleted" });
    } catch (error) {
        console.error("Error deleting zone: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete zone." });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cameras">Camera Config</TabsTrigger>
                <TabsTrigger value="zones">Density Zones</TabsTrigger>
            </TabsList>
            <TabsContent value="cameras" className="mt-4">
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
            </TabsContent>
            <TabsContent value="zones" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Density Zone Configuration</CardTitle>
                        <CardDescription>Draw, select, and manage restricted density zones on the map.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={() => setDrawingMode('polygon')} disabled={!!drawingMode}>
                            <Pencil className="mr-2" />
                             New Zone
                        </Button>
                         {drawingMode && <p className="text-sm text-primary font-semibold">Drawing mode active. Click on the map to start your polygon.</p>}
                         
                         <hr/>
                         <Label>Manage Existing Zones</Label>
                         <ScrollArea className="h-[200px] border rounded-lg p-2">
                            {densityZones.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No zones created yet.</p>}
                            <div className="space-y-2">
                            {densityZones.map(zone => (
                                <div key={zone.id} className={cn("flex items-center justify-between p-2 rounded-md", selectedZoneId === zone.id ? "bg-accent" : "bg-muted/40")}>
                                    <button className="flex-grow text-left" onClick={() => setSelectedZoneId(zone.id)}>
                                        <p className="font-semibold">{zone.name}</p>
                                        <p className="text-xs text-muted-foreground">Max Density: {zone.maxDensity} p/m²</p>
                                    </button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteZone(zone.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                            </div>
                         </ScrollArea>
                         {selectedZone && (
                            <div className="space-y-2 pt-2 border-t">
                                <h4 className="font-semibold">Edit: {selectedZone.name}</h4>
                                 <div>
                                    <Label htmlFor="zone-name">Zone Name</Label>
                                    <Input id="zone-name" value={selectedZone.name} onChange={(e) => handleZoneUpdate(selectedZone.id, {name: e.target.value})}/>
                                 </div>
                                 <div>
                                    <Label htmlFor="zone-density">Max Density (people/m²)</Label>
                                    <Input id="zone-density" type="number" value={selectedZone.maxDensity} onChange={(e) => handleZoneUpdate(selectedZone.id, {maxDensity: Number(e.target.value)})}/>
                                 </div>
                            </div>
                         )}

                    </CardContent>
                 </Card>
            </TabsContent>
        </Tabs>

        {activeTab === 'cameras' && selectedCamera && (
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
            cameras={cameras}
            selectedCamera={selectedCamera}
            densityZones={densityZones}
            onPolygonComplete={handlePolygonComplete}
            drawingMode={drawingMode}
            selectedZoneId={selectedZoneId}
            activeTab={activeTab}
           />
        </ApiProviderWrapper>
      </div>
    </div>
  );
}
