'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Persona, Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint } from '@/lib/types';
import { INITIAL_INCIDENTS, INITIAL_UNITS, INITIAL_CAMERAS, INITIAL_PREDICTIONS, INITIAL_CROWD_DENSITY } from '@/lib/mock-data';

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  incidents: Incident[];
  units: Unit[];
  cameras: Camera[];
  predictions: PredictionPolygon[];
  crowdDensity: CrowdDensityPoint[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>('Commander');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [predictions, setPredictions] = useState<PredictionPolygon[]>(INITIAL_PREDICTIONS);
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensityPoint[]>(INITIAL_CROWD_DENSITY);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Move a unit
      setUnits(prevUnits => {
        return prevUnits.map(unit => {
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

    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <PersonaContext.Provider value={{ persona, setPersona, incidents, units, cameras, predictions, crowdDensity }}>
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
