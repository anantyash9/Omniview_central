'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePersona } from '@/components/persona/persona-provider';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

const GATE_CONFIG = {
  'North Gate': { position: 'top', color: 'bg-chart-1' },
  'Main Entrance': { position: 'left', color: 'bg-chart-2' },
  'South Gate': { position: 'bottom', color: 'bg-chart-3' },
};

const SIMULATION_WIDTH = 500;
const SIMULATION_HEIGHT = 250;
const PERSON_RADIUS = 2.5;

interface Person {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gate: keyof typeof GATE_CONFIG;
}

export function CrowdMovementAnalysis() {
  const { crowdFlow } = usePersona();
  const [people, setPeople] = useState<Person[]>([]);
  const animationFrameId = useRef<number>();
  const personIdCounter = useRef(0);

  const latestFlow = useMemo(() => {
     if (!crowdFlow || crowdFlow.length === 0) {
        return { "North Gate": 0, "Main Entrance": 0, "South Gate": 0 };
     }
     return crowdFlow[crowdFlow.length - 1];
  }, [crowdFlow]);

  const totalPeopleEstimate = useMemo(() => {
    if (!latestFlow) return 0;
    const total = Object.values(latestFlow).reduce((sum, val) => {
        if (typeof val === 'number') {
            return sum + val;
        }
        return sum;
    }, 0) as number;
    return Math.floor(total / 4);
  }, [latestFlow]);

  // Effect to add/remove people based on changing flow data
  useEffect(() => {
    if (!latestFlow) return;

    setPeople(prevPeople => {
        const currentCount = prevPeople.length;
        const targetCount = totalPeopleEstimate;
        
        if (currentCount === targetCount) {
            return prevPeople;
        }

        let newPeople = [...prevPeople];

        if (currentCount < targetCount) {
            // Add people
            const peopleToAdd = targetCount - currentCount;
            for (let i = 0; i < peopleToAdd; i++) {
                // A simple way to distribute new people based on gate traffic proportions
                const northWeight = latestFlow['North Gate'] || 0;
                const mainWeight = latestFlow['Main Entrance'] || 0;
                const southWeight = latestFlow['South Gate'] || 0;
                const totalWeight = northWeight + mainWeight + southWeight;
                const gateRoulette = totalWeight > 0 ? Math.random() * totalWeight : Math.random() * 3;

                let gateName: keyof typeof GATE_CONFIG;
                if (gateRoulette < northWeight) {
                    gateName = 'North Gate';
                } else if (gateRoulette < northWeight + mainWeight) {
                    gateName = 'Main Entrance';
                } else {
                    gateName = 'South Gate';
                }
                const config = GATE_CONFIG[gateName];

                let x = 0, y = 0;
                if (config.position === 'top') {
                    x = Math.random() * (SIMULATION_WIDTH * 0.6) + (SIMULATION_WIDTH * 0.2);
                    y = Math.random() * 20;
                } else if (config.position === 'bottom') {
                    x = Math.random() * (SIMULATION_WIDTH * 0.6) + (SIMULATION_WIDTH * 0.2);
                    y = SIMULATION_HEIGHT - Math.random() * 20;
                } else { // left
                    x = Math.random() * 20;
                    y = Math.random() * (SIMULATION_HEIGHT * 0.6) + (SIMULATION_HEIGHT * 0.2);
                }

                newPeople.push({
                    id: personIdCounter.current++,
                    x, y,
                    vx: (Math.random() - 0.5) * 0.008,
                    vy: (Math.random() - 0.5) * 0.008,
                    gate: gateName,
                });
            }
        } else {
            // Remove people
            const peopleToRemove = currentCount - targetCount;
            newPeople.splice(newPeople.length - peopleToRemove, peopleToRemove);
        }
        
        return newPeople;
    });
  }, [latestFlow, totalPeopleEstimate]);


  // Effect for animation loop
  useEffect(() => {
    const animate = () => {
      setPeople(prevPeople =>
        prevPeople.map(p => {
          let { x, y, vx, vy } = p;

          // Add random jitter
          vx += (Math.random() - 0.5) * 0.0016;
          vy += (Math.random() - 0.5) * 0.0016;

          // Add gentle pull towards center
          const pullX = (SIMULATION_WIDTH / 2 - x) * 0.000008;
          const pullY = (SIMULATION_HEIGHT / 2 - y) * 0.000008;
          vx += pullX;
          vy += pullY;

          // Limit speed
          const speed = Math.sqrt(vx * vx + vy * vy);
          const maxSpeed = 0.008;
          if (speed > maxSpeed) {
            vx = (vx / speed) * maxSpeed;
            vy = (vy / speed) * maxSpeed;
          }

          x += vx;
          y += vy;
          
          // Boundary checks
          if (x <= PERSON_RADIUS || x >= SIMULATION_WIDTH - PERSON_RADIUS) vx = -vx;
          if (y <= PERSON_RADIUS || y >= SIMULATION_HEIGHT - PERSON_RADIUS) vy = -vy;

          x = Math.max(PERSON_RADIUS, Math.min(SIMULATION_WIDTH - PERSON_RADIUS, x));
          y = Math.max(PERSON_RADIUS, Math.min(SIMULATION_HEIGHT - PERSON_RADIUS, y));
          
          return { ...p, x, y, vx, vy };
        })
      );
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crowd Movement Simulation</CardTitle>
        <CardDescription>
          A visual representation of crowd flow at key points.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div 
            className="relative h-[250px] bg-muted/30 rounded-lg border overflow-hidden"
            style={{ width: `${SIMULATION_WIDTH}px` }}
        >
          {people.map(person => (
            <div
              key={person.id}
              className={cn('absolute rounded-full', GATE_CONFIG[person.gate].color)}
              style={{
                width: PERSON_RADIUS * 2,
                height: PERSON_RADIUS * 2,
                transform: `translate(${person.x}px, ${person.y}px)`,
                willChange: 'transform'
              }}
            />
          ))}

          {/* Gate Labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-background/80 rounded-full text-xs font-semibold border shadow-sm">
              <span className="h-2 w-2 rounded-full bg-chart-1" /> North Gate
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-2 flex items-center gap-2 px-3 py-1 bg-background/80 rounded-full text-xs font-semibold border shadow-sm">
              <span className="h-2 w-2 rounded-full bg-chart-2" /> Main Entrance
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-background/80 rounded-full text-xs font-semibold border shadow-sm">
              <span className="h-2 w-2 rounded-full bg-chart-3" /> South Gate
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-2 px-3 py-1 bg-background/80 rounded-full text-xs font-semibold border shadow-sm">
              <Users className="h-3 w-3" /> Crowd Est: {totalPeopleEstimate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
