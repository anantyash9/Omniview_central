'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Persona, Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint, Briefing, SocialMediaPost, CrowdFlowData } from '@/lib/types';
import { INITIAL_INCIDENTS, INITIAL_UNITS, INITIAL_CAMERAS, INITIAL_PREDICTIONS, INITIAL_CROWD_DENSITY, INITIAL_BRIEFS, MOCK_SOCIAL_POSTS, INITIAL_CROWD_FLOW } from '@/lib/mock-data';

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  incidents: Incident[];
  units: Unit[];
  cameras: Camera[];
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
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [predictions, setPredictions] = useState<PredictionPolygon[]>(INITIAL_PREDICTIONS);
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensityPoint[]>(INITIAL_CROWD_DENSITY);
  const [briefs, setBriefs] = useState<Briefing[]>(INITIAL_BRIEFS);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [crowdFlow, setCrowdFlow] = useState<CrowdFlowData[]>(INITIAL_CROWD_FLOW);
  const droneVelocityRef = useRef({ vLat: (Math.random() - 0.5) * 0.00004, vLng: (Math.random() - 0.5) * 0.00004 });
  const timeRef = useRef(0);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      timeRef.current += 1;

      setUnits(prevUnits => {
        return prevUnits.map(unit => {
          // Smooth, bounded movement for the drone
          if (unit.id === 'drone-1') {
            let { vLat, vLng } = droneVelocityRef.current;
            
            // Add some randomness to the velocity for a meandering path
            vLat += (Math.random() - 0.5) * 0.00002;
            vLng += (Math.random() - 0.5) * 0.00002;

            // Constrain speed
            const maxSpeed = 0.00004;
            const speed = Math.sqrt(vLat * vLat + vLng * vLng);
            if (speed > maxSpeed) {
              vLat = (vLat / speed) * maxSpeed;
              vLng = (vLng / speed) * maxSpeed;
            }

            let newLat = unit.location.lat + vLat;
            let newLng = unit.location.lng + vLng;

            // Bounce off the edges of a bounding box around the venue
            const bounds = {
                north: 13.069,
                south: 13.065,
                east: 77.493,
                west: 77.489
            };

            if (newLat > bounds.north || newLat < bounds.south) {
                vLat = -vLat;
                newLat = unit.location.lat + vLat;
            }
            if (newLng > bounds.east || newLng < bounds.west) {
                vLng = -vLng;
                newLng = unit.location.lng + vLng;
            }
            
            droneVelocityRef.current = { vLat, vLng };

            return {
              ...unit,
              location: { lat: newLat, lng: newLng },
            };
          }
          
          // Jittery, random movement for the personnel unit
          if (unit.id === 'unit-1') {
            return {
              ...unit,
              location: {
                lat: unit.location.lat + (Math.random() - 0.5) * 0.0001,
                lng: unit.location.lng + (Math.random() - 0.5) * 0.0001,
              },
            };
          }

          return unit;
        });
      });

      // Change crowd density
      setCrowdDensity(prevDensity => {
        return prevDensity.map(point => ({
          ...point,
          density: Math.max(0, Math.min(1, point.density + (Math.random() - 0.5) * 0.1)),
        }));
      });
      
      // Update crowd flow data every 5 seconds to simulate new data points appearing
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
          
          return [...prevFlow.slice(1), newPoint]; // Keep the array size constant
        });
      }


      // Add a random social media post and let them accumulate
      if (Math.random() > 0.8 && socialMediaPosts.length < 15) { // Slower chance, capped at 15
        const highDensityPoints = INITIAL_CROWD_DENSITY.filter(p => p.density > 0.5);
        if (highDensityPoints.length > 0) {
            const targetPoint = highDensityPoints[Math.floor(Math.random() * highDensityPoints.length)];
            const newPostId = `post-${Date.now()}`;
            const mockPostText = MOCK_SOCIAL_POSTS[Math.floor(Math.random() * MOCK_SOCIAL_POSTS.length)];
            
            const newPost: SocialMediaPost = {
                id: newPostId,
                location: {
                    lat: targetPoint.location.lat + (Math.random() - 0.5) * 0.001,
                    lng: targetPoint.location.lng + (Math.random() - 0.5) * 0.001,
                },
                author: `@user${Math.floor(Math.random() * 900) + 100}`,
                text: mockPostText,
            };

            setSocialMediaPosts(prevPosts => [...prevPosts, newPost]);
        }
      }

    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [socialMediaPosts.length]); // Rerun effect logic based on post count

  return (
    <PersonaContext.Provider value={{ persona, setPersona, incidents, units, cameras, predictions, crowdDensity, briefs, socialMediaPosts, crowdFlow }}>
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
