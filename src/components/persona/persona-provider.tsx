'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Persona, Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint, Briefing, SocialMediaPost } from '@/lib/types';
import { INITIAL_INCIDENTS, INITIAL_UNITS, INITIAL_CAMERAS, INITIAL_PREDICTIONS, INITIAL_CROWD_DENSITY, INITIAL_BRIEFS } from '@/lib/mock-data';

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

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Move a unit and a drone
      setUnits(prevUnits => {
        return prevUnits.map(unit => {
          if (unit.id === 'unit-1' || unit.id === 'drone-1') {
            return {
              ...unit,
              location: {
                lat: unit.location.lat + (Math.random() - 0.5) * 0.0002,
                lng: unit.location.lng + (Math.random() - 0.5) * 0.0002,
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
      
      // Add a random social media post
      if (Math.random() > 0.6) { // 40% chance every 5s
        const highDensityPoints = INITIAL_CROWD_DENSITY.filter(p => p.density > 0.5);
        if (highDensityPoints.length > 0) {
            const targetPoint = highDensityPoints[Math.floor(Math.random() * highDensityPoints.length)];
            const newPostId = `post-${Date.now()}`;
            const newPost: SocialMediaPost = {
                id: newPostId,
                location: {
                    lat: targetPoint.location.lat + (Math.random() - 0.5) * 0.001,
                    lng: targetPoint.location.lng + (Math.random() - 0.5) * 0.001,
                },
                author: `@user${Math.floor(Math.random() * 900) + 100}`,
                text: "Wow, it's packed here! Amazing view. #OmniView"
            };

            setSocialMediaPosts(prevPosts => [...prevPosts, newPost]);

            // Remove the post after a few seconds to make it "linger"
            setTimeout(() => {
                setSocialMediaPosts(prevPosts => prevPosts.filter(p => p.id !== newPostId));
            }, 4000); // Linger for 4 seconds
        }
      }


    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <PersonaContext.Provider value={{ persona, setPersona, incidents, units, cameras, predictions, crowdDensity, briefs, socialMediaPosts }}>
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
