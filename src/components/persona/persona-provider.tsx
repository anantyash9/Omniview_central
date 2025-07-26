'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Persona, Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint, Briefing, SocialMediaPost, CrowdFlowData } from '@/lib/types';
import { INITIAL_INCIDENTS, INITIAL_UNITS, INITIAL_CAMERAS, INITIAL_PREDICTIONS, INITIAL_CROWD_DENSITY, INITIAL_BRIEFS, MOCK_SOCIAL_POSTS, INITIAL_CROWD_FLOW } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore"; 

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  incidents: Incident[];
  units: Unit[];
  cameras: Camera[];
  setCameras: (cameras: Camera[]) => void;
  predictions: PredictionPolygon[];
  crowdDensity: CrowdDensityPoint[];
  briefs: Briefing[];
  socialMediaPosts: SocialMediaPost[];
  crowdFlow: CrowdFlowData[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>('Commander');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [predictions, setPredictions] = useState<PredictionPolygon[]>(INITIAL_PREDICTIONS);
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensityPoint[]>(INITIAL_CROWD_DENSITY);
  const [briefs, setBriefs] = useState<Briefing[]>(INITIAL_BRIEFS);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [crowdFlow, setCrowdFlow] = useState<CrowdFlowData[]>(INITIAL_CROWD_FLOW);
  const droneVelocityRef = useRef({ vLat: (Math.random() - 0.5) * 0.00004, vLng: (Math.random() - 0.5) * 0.00004 });
  const timeRef = useRef(0);
  const dataLoaded = useRef(false);

  // Function to update cameras in both state and Firestore
  const updateCameras = async (newCameras: Camera[]) => {
    setCameras(newCameras);

    // Find the difference between new and old cameras to only update changed ones
    const oldCameras = cameras;
    const changedCameras = newCameras.filter((newCam, index) => 
        JSON.stringify(newCam) !== JSON.stringify(oldCameras[index])
    );
    
    if (changedCameras.length > 0) {
      const batch = writeBatch(db);
      changedCameras.forEach(camera => {
        const camRef = doc(db, "cameras", camera.id);
        batch.set(camRef, camera, { merge: true }); // Use merge to avoid overwriting complete doc
      });
      await batch.commit();
    }
  };

  useEffect(() => {
    const fetchAndSetCameras = async () => {
        if (dataLoaded.current) return; // Prevent re-fetching
        dataLoaded.current = true;

        const cameraCollection = collection(db, "cameras");
        try {
            const querySnapshot = await getDocs(cameraCollection);
            if (querySnapshot.empty) {
                // If firestore is empty, populate it with initial mock data
                console.log("No camera configs found in Firestore. Seeding with mock data.");
                const batch = writeBatch(db);
                INITIAL_CAMERAS.forEach((camera) => {
                    const docRef = doc(db, "cameras", camera.id);
                    batch.set(docRef, camera);
                });
                await batch.commit();
                setCameras(INITIAL_CAMERAS);
            } else {
                // If data exists, load it into state
                const camerasFromFirestore = querySnapshot.docs.map(doc => doc.data() as Camera);
                setCameras(camerasFromFirestore);
            }
        } catch (error) {
            console.error("Error fetching camera configuration:", error);
            // Fallback to mock data on error
            setCameras(INITIAL_CAMERAS);
        }
    };
    
    fetchAndSetCameras();
  }, []);

  useEffect(() => {
    // This interval is for live simulation and doesn't depend on camera data fetching
    const interval = setInterval(() => {
      timeRef.current += 1;

      setUnits(prevUnits => {
        return prevUnits.map(unit => {
          if (unit.id === 'drone-1') {
            let { vLat, vLng } = droneVelocityRef.current;
            vLat += (Math.random() - 0.5) * 0.00002;
            vLng += (Math.random() - 0.5) * 0.00002;
            const maxSpeed = 0.00004;
            const speed = Math.sqrt(vLat * vLat + vLng * vLng);
            if (speed > maxSpeed) {
              vLat = (vLat / speed) * maxSpeed;
              vLng = (vLng / speed) * maxSpeed;
            }
            let newLat = unit.location.lat + vLat;
            let newLng = unit.location.lng + vLng;
            const bounds = { north: 13.0634, south: 13.0619, east: 77.4770, west: 77.4756 };
            if (newLat > bounds.north || newLat < bounds.south) { vLat = -vLat; newLat = unit.location.lat + vLat; }
            if (newLng > bounds.east || newLng < bounds.west) { vLng = -vLng; newLng = unit.location.lng + vLng; }
            droneVelocityRef.current = { vLat, vLng };
            return { ...unit, location: { lat: newLat, lng: newLng } };
          }
          if (unit.id === 'unit-1') {
            return { ...unit, location: { lat: unit.location.lat + (Math.random() - 0.5) * 0.0001, lng: unit.location.lng + (Math.random() - 0.5) * 0.0001 } };
          }
          return unit;
        });
      });

      setCrowdDensity(prevDensity => prevDensity.map(point => ({ ...point, density: Math.max(0, Math.min(1, point.density + (Math.random() - 0.5) * 0.1)) })));
      
      if (timeRef.current % 5 === 0) {
        setCrowdFlow(prevFlow => {
          const lastDataPoint = prevFlow[prevFlow.length - 1];
          const newTime = new Date(new Date(`1970-01-01T${lastDataPoint.time}:00Z`).getTime() + 5 * 60000).toTimeString().slice(0, 5);
          const newPoint: CrowdFlowData = {
              time: newTime,
              "North Gate": Math.max(50, lastDataPoint["North Gate"] + Math.floor((Math.random() - 0.5) * 40)),
              "Main Entrance": Math.max(80, lastDataPoint["Main Entrance"] + Math.floor((Math.random() - 0.5) * 50)),
              "South Gate": Math.max(40, lastDataPoint["South Gate"] + Math.floor((Math.random() - 0.5) * 30)),
          };
          return [...prevFlow.slice(1), newPoint];
        });
      }

      if (Math.random() > 0.8 && socialMediaPosts.length < 15) {
        const highDensityPoints = INITIAL_CROWD_DENSITY.filter(p => p.density > 0.5);
        if (highDensityPoints.length > 0) {
            const targetPoint = highDensityPoints[Math.floor(Math.random() * highDensityPoints.length)];
            const newPostId = `post-${Date.now()}`;
            const mockPostText = MOCK_SOCIAL_POSTS[Math.floor(Math.random() * MOCK_SOCIAL_POSTS.length)];
            const newPost: SocialMediaPost = {
                id: newPostId,
                location: { lat: targetPoint.location.lat + (Math.random() - 0.5) * 0.001, lng: targetPoint.location.lng + (Math.random() - 0.5) * 0.001 },
                author: `@user${Math.floor(Math.random() * 900) + 100}`,
                text: mockPostText,
            };
            setSocialMediaPosts(prevPosts => [...prevPosts, newPost]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [socialMediaPosts.length]);

  return (
    <PersonaContext.Provider value={{ persona, setPersona, incidents, units, cameras, setCameras: updateCameras, predictions, crowdDensity, briefs, socialMediaPosts, crowdFlow }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}
