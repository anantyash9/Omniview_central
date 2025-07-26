
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Persona, Incident, Unit, Camera, CrowdDensityPoint, Briefing, SocialMediaPost, CrowdFlowData } from '@/lib/types';
import { INITIAL_INCIDENTS, INITIAL_UNITS, INITIAL_CROWD_DENSITY, INITIAL_BRIEFS, MOCK_SOCIAL_POSTS, INITIAL_CROWD_FLOW, INITIAL_CAMERAS } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  incidents: Incident[];
  units: Unit[];
  cameras: Camera[];
  setCameras: (cameras: Camera[]) => void;
  crowdDensity: CrowdDensityPoint[];
  briefs: Briefing[];
  socialMediaPosts: SocialMediaPost[];
  crowdFlow: CrowdFlowData[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>('Commander');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensityPoint[]>([]);
  const [briefs, setBriefs] = useState<Briefing[]>([]);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [crowdFlow, setCrowdFlow] = useState<CrowdFlowData[]>([]);
  const droneVelocityRef = useRef({ vLat: (Math.random() - 0.5) * 0.00004, vLng: (Math.random() - 0.5) * 0.00004 });
  const timeRef = useRef(0);
  const dataLoadedRef = useRef(false);

  const seedFirestore = async () => {
    try {
      console.log("Seeding Firestore with initial data...");
      const batch = writeBatch(db);

      INITIAL_CAMERAS.forEach(camera => {
        const camRef = doc(db, 'cameras', camera.id);
        batch.set(camRef, camera);
      });
      INITIAL_INCIDENTS.forEach(incident => {
          const incidentRef = doc(db, 'incidents', incident.id);
          batch.set(incidentRef, incident);
      });
      INITIAL_UNITS.forEach(unit => {
          const unitRef = doc(db, 'units', unit.id);
          batch.set(unitRef, unit);
      });
      INITIAL_CROWD_DENSITY.forEach((cd, i) => {
          const cdRef = doc(db, 'crowd-density', `point-${i}`);
          batch.set(cdRef, cd);
      });
      INITIAL_BRIEFS.forEach((brief, i) => {
          const briefRef = doc(db, 'briefs', `brief-${i}`);
          batch.set(briefRef, brief);
      });
      INITIAL_CROWD_FLOW.forEach((cf, i) => {
          const cfRef = doc(db, 'crowd-flow', `flow-${i}`);
          batch.set(cfRef, cf);
      });

      await batch.commit();
      console.log("Firestore seeded successfully!");
      return true;
    } catch (error) {
      console.error("Error seeding Firestore: ", error);
      return false;
    }
  };

  const fetchAllData = async () => {
      try {
          // Check a single collection (e.g., cameras) to see if we need to seed.
          const camerasSnapshot = await getDocs(collection(db, "cameras"));
          if (camerasSnapshot.empty) {
              console.log("No camera configs found in Firestore. Seeding with mock data.");
              const success = await seedFirestore();
              if (success) {
                  // Re-fetch after seeding
                  fetchAllData();
              }
              return;
          }

          // If not empty, fetch all data
          const camerasData = camerasSnapshot.docs.map(doc => doc.data() as Camera);
          setCameras(camerasData);

          const incidentsSnapshot = await getDocs(collection(db, "incidents"));
          setIncidents(incidentsSnapshot.docs.map(doc => doc.data() as Incident));

          const unitsSnapshot = await getDocs(collection(db, "units"));
          setUnits(unitsSnapshot.docs.map(doc => doc.data() as Unit));

          const crowdDensitySnapshot = await getDocs(collection(db, "crowd-density"));
          setCrowdDensity(crowdDensitySnapshot.docs.map(doc => doc.data() as CrowdDensityPoint));
          
          const briefsSnapshot = await getDocs(collection(db, "briefs"));
          setBriefs(briefsSnapshot.docs.map(doc => doc.data() as Briefing));
          
          const crowdFlowSnapshot = await getDocs(collection(db, "crowd-flow"));
          setCrowdFlow(crowdFlowSnapshot.docs.map(doc => doc.data() as CrowdFlowData));

          dataLoadedRef.current = true;

      } catch (error) {
          console.error("Error fetching data from Firestore: ", error);
          // Fallback to local mock data if there's a severe error
          setCameras(INITIAL_CAMERAS);
          setIncidents(INITIAL_INCIDENTS);
          setUnits(INITIAL_UNITS);
          setCrowdDensity(INITIAL_CROWD_DENSITY);
          setBriefs(INITIAL_BRIEFS);
          setCrowdFlow(INITIAL_CROWD_FLOW);
      }
  };


  useEffect(() => {
    if (!dataLoadedRef.current) {
        fetchAllData();
    }
    
    const interval = setInterval(() => {
        if (!dataLoadedRef.current) return;
        
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
            if (prevFlow.length === 0) return [];
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
            const highDensityPoints = crowdDensity.filter(p => p.density > 0.5);
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
  }, [socialMediaPosts.length, crowdDensity]);

  const updateCameras = async (newCameras: Camera[]) => {
      setCameras(newCameras);
      try {
        const batch = writeBatch(db);
        newCameras.forEach(camera => {
            const docRef = doc(db, 'cameras', camera.id);
            // Ensure fov is an array before setting to prevent Firestore errors
            const cameraData = {
                ...camera,
                fov: Array.isArray(camera.fov) ? camera.fov : [],
            };
            batch.set(docRef, cameraData, { merge: true });
        });
        await batch.commit();
      } catch (error) {
          console.error("Error updating cameras in Firestore: ", error);
      }
  };


  return (
    <PersonaContext.Provider value={{ persona, setPersona, incidents, units, cameras, setCameras: updateCameras, crowdDensity, briefs, socialMediaPosts, crowdFlow }}>
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
