
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Persona, Incident, Unit, Camera, CrowdDensityPoint, Briefing, SocialMediaPost, CrowdFlowData, DensityZone } from '@/lib/types';
import { INITIAL_INCIDENTS, INITIAL_UNITS, INITIAL_CROWD_DENSITY, INITIAL_BRIEFS, MOCK_SOCIAL_POSTS, INITIAL_CROWD_FLOW, INITIAL_CAMERAS, INITIAL_DENSITY_ZONES } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, setDoc } from 'firebase/firestore';

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  incidents: Incident[];
  units: Unit[];
  cameras: Camera[];
  setCameras: React.Dispatch<React.SetStateAction<Camera[]>>;
  saveCamerasToFirestore: (cameras: Camera[]) => Promise<void>;
  densityZones: DensityZone[];
  setDensityZones: React.Dispatch<React.SetStateAction<DensityZone[]>>;
  saveDensityZonesToFirestore: (zones: DensityZone[]) => Promise<void>;
  crowdDensity: CrowdDensityPoint[];
  briefs: Briefing[];
  addBrief: (brief: Briefing) => Promise<void>;
  socialMediaPosts: SocialMediaPost[];
  crowdFlow: CrowdFlowData[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>('Commander');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [densityZones, setDensityZones] = useState<DensityZone[]>([]);
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensityPoint[]>([]);
  const [briefs, setBriefs] = useState<Briefing[]>([]);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [crowdFlow, setCrowdFlow] = useState<CrowdFlowData[]>([]);

  const droneVelocityRef = useRef({ vLat: (Math.random() - 0.5) * 0.00004, vLng: (Math.random() - 0.5) * 0.00004 });
  const timeRef = useRef(0);
  const dataLoadedRef = useRef(false);

  const saveCamerasToFirestore = async (updatedCameras: Camera[]) => {
    try {
      const batch = writeBatch(db);
      updatedCameras.forEach(camera => {
        const { ...cameraData } = camera;
        const camRef = doc(db, 'cameras', camera.id);
        batch.set(camRef, cameraData);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error saving cameras to Firestore: ", error);
    }
  };
  
  const saveDensityZonesToFirestore = async (updatedZones: DensityZone[]) => {
    try {
        const batch = writeBatch(db);
        updatedZones.forEach(zone => {
            const zoneRef = doc(db, 'densityZones', zone.id);
            batch.set(zoneRef, zone);
        });
        await batch.commit();
    } catch (error) {
      console.error("Error saving density zones to Firestore: ", error);
    }
  };

  const addBrief = async (brief: Briefing) => {
    try {
      // Add to local state
      setBriefs(prevBriefs => {
          const newBriefs = [...prevBriefs, brief];
          return newBriefs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      });
      // Add to Firestore
      const briefId = `brief-${Date.now()}`;
      await setDoc(doc(db, "briefs", briefId), brief);
    } catch (error) {
       console.error("Error saving new brief to Firestore: ", error);
    }
  }

  useEffect(() => {
    const fetchAndSetData = async () => {
      console.log("Attempting to connect to Firestore...");
      try {
        const cameraSnapshot = await getDocs(collection(db, "cameras"));
        console.log("Successfully connected to Firestore.");

        if (cameraSnapshot.empty) {
          console.log("No data found in Firestore. Seeding with mock data.");
          // Seed all collections
          const batch = writeBatch(db);
          
          INITIAL_CAMERAS.forEach(item => batch.set(doc(db, "cameras", item.id), item));
          INITIAL_DENSITY_ZONES.forEach(item => batch.set(doc(db, "densityZones", item.id), item));
          INITIAL_INCIDENTS.forEach(item => batch.set(doc(db, "incidents", item.id), item));
          INITIAL_UNITS.forEach(item => batch.set(doc(db, "units", item.id), item));
          INITIAL_BRIEFS.forEach((item, index) => batch.set(doc(db, "briefs", `brief-${index}`), item));
          INITIAL_CROWD_DENSITY.forEach((item, index) => batch.set(doc(db, "crowdDensity", `cd-${index}`), item));
          INITIAL_CROWD_FLOW.forEach((item, index) => batch.set(doc(db, "crowdFlow", `cf-${index}`), item));

          await batch.commit();
          console.log("Firestore seeded successfully.");

          // Set state from initial data after seeding
          setCameras(INITIAL_CAMERAS);
          setDensityZones(INITIAL_DENSITY_ZONES);
          setIncidents(INITIAL_INCIDENTS);
          setUnits(INITIAL_UNITS);
          setBriefs(INITIAL_BRIEFS);
          setCrowdDensity(INITIAL_CROWD_DENSITY);
          setCrowdFlow(INITIAL_CROWD_FLOW);

        } else {
          console.log("Fetching data from Firestore.");
          const cameraData = cameraSnapshot.docs.map(doc => doc.data() as Camera);
          
          const densityZoneSnapshot = await getDocs(collection(db, "densityZones"));
          const densityZoneData = densityZoneSnapshot.docs.map(doc => doc.data() as DensityZone);

          const incidentSnapshot = await getDocs(collection(db, "incidents"));
          const incidentData = incidentSnapshot.docs.map(doc => doc.data() as Incident);
          
          const unitSnapshot = await getDocs(collection(db, "units"));
          const unitData = unitSnapshot.docs.map(doc => doc.data() as Unit);

          const briefSnapshot = await getDocs(collection(db, "briefs"));
          const briefData = briefSnapshot.docs.map(doc => doc.data() as Briefing);
          
          const crowdDensitySnapshot = await getDocs(collection(db, "crowdDensity"));
          const crowdDensityData = crowdDensitySnapshot.docs.map(doc => doc.data() as CrowdDensityPoint);

          const crowdFlowSnapshot = await getDocs(collection(db, "crowdFlow"));
          const crowdFlowData = crowdFlowSnapshot.docs.map(doc => doc.data() as CrowdFlowData);

          setCameras(cameraData);
          setDensityZones(densityZoneData);
          setIncidents(incidentData);
          setUnits(unitData);
          setBriefs(briefData.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
          setCrowdDensity(crowdDensityData);
          setCrowdFlow(crowdFlowData.sort((a,b) => a.time.localeCompare(b.time)));
        }
      } catch (error) {
        console.error("Firestore connection failed. Falling back to local mock data.", error);
        // Fallback to mock data if firestore fails
        setCameras(INITIAL_CAMERAS);
        setDensityZones(INITIAL_DENSITY_ZONES);
        setIncidents(INITIAL_INCIDENTS);
        setUnits(INITIAL_UNITS);
        setBriefs(INITIAL_BRIEFS);
        setCrowdDensity(INITIAL_CROWD_DENSITY);
        setCrowdFlow(INITIAL_CROWD_FLOW);
      }
    };
    
    if (!dataLoadedRef.current) {
        fetchAndSetData();
        dataLoadedRef.current = true;
    }


    // Simulate real-time data updates (this part remains local for simulation purposes)
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
            if (newLat > bounds.north || newLat < bounds.south) vLat = -vLat;
            if (newLng > bounds.east || newLng < bounds.west) vLng = -vLng;
            droneVelocityRef.current = { vLat, vLng };
            return { ...unit, location: { lat: newLat, lng: newLng } };
          }
          if (unit.id === 'unit-1') {
            return { ...unit, location: { lat: unit.location.lat + (Math.random() - 0.5) * 0.0001, lng: unit.location.lng + (Math.random() - 0.5) * 0.0001 }};
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
          const newPoint: CrowdFlowData = { time: newTime, "North Gate": Math.max(50, lastDataPoint["North Gate"] + Math.floor((Math.random() - 0.5) * 40)), "Main Entrance": Math.max(80, lastDataPoint["Main Entrance"] + Math.floor((Math.random() - 0.5) * 50)), "South Gate": Math.max(40, lastDataPoint["South Gate"] + Math.floor((Math.random() - 0.5) * 30)) };
          return [...prevFlow.slice(1), newPoint];
        });
      }

      if (Math.random() > 0.8 && socialMediaPosts.length < 15) {
        const highDensityPoints = crowdDensity.filter(p => p.density > 0.5);
        if (highDensityPoints.length > 0) {
            const targetPoint = highDensityPoints[Math.floor(Math.random() * highDensityPoints.length)];
            const newPost: SocialMediaPost = { id: `post-${Date.now()}`, location: { lat: targetPoint.location.lat + (Math.random() - 0.5) * 0.001, lng: targetPoint.location.lng + (Math.random() - 0.5) * 0.001 }, author: `@user${Math.floor(Math.random() * 900) + 100}`, text: MOCK_SOCIAL_POSTS[Math.floor(Math.random() * MOCK_SOCIAL_POSTS.length)] };
            setSocialMediaPosts(prevPosts => [...prevPosts, newPost]);
        }
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [crowdDensity, socialMediaPosts.length]);

  return (
    <PersonaContext.Provider value={{ persona, setPersona, incidents, units, cameras, setCameras, saveCamerasToFirestore, densityZones, setDensityZones, saveDensityZonesToFirestore, crowdDensity, briefs, addBrief, socialMediaPosts, crowdFlow }}>
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

