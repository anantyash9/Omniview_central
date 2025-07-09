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

  const latestFlow = useMemo(() => {
     if (!crowdFlow || crowdFlow.length === 0) {
        return { "North Gate": 0, "Main Entrance": 0, "South Gate": 0 };
     }
     return crowdFlow[crowdFlow.length - 1];
  }, [crowdFlow]);

  const totalPeople = useMemo(() => {
    if (!latestFlow) return 0;
    const total = Object.values(latestFlow).reduce((sum, val) => {
        if (typeof val === 'number') {
            return sum + val;
        }
        return sum;
    }, 0) as number;
    return Math.floor(total / 4);
  }, [latestFlow]);
  

  useEffect(() => {
    if (!latestFlow) return;

    const newPeople: Person[] = [];
    let personId = 0;

    Object.entries(GATE_CONFIG).forEach(([gateName, config]) => {
      const gateFlow = latestFlow[gateName as keyof typeof GATE_CONFIG] || 0;
      const count = Math.floor(gateFlow / 4); // Adjust density of simulation

      for (let i = 0; i < count; i++) {
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
          id: personId++,
          x,
          y,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          gate: gateName as keyof typeof GATE_CONFIG,
        });
      }
    });

    setPeople(newPeople);
  }, [latestFlow]);


  useEffect(() => {
    const animate = () => {
      setPeople(prevPeople =>
        prevPeople.map(p => {
          let { x, y, vx, vy } = p;

          // Add random jitter
          vx += (Math.random() - 0.5) * 0.2;
          vy += (Math.random() - 0.5) * 0.2;

          // Add gentle pull towards center
          const pullX = (SIMULATION_WIDTH / 2 - x) * 0.001;
          const pullY = (SIMULATION_HEIGHT / 2 - y) * 0.001;
          vx += pullX;
          vy += pullY;

          // Limit speed
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > 1) {
            vx = (vx / speed) * 1;
            vy = (vy / speed) * 1;
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

    if (people.length > 0) {
        animationFrameId.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [people.length]);

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
              <Users className="h-3 w-3" /> Crowd Est: {totalPeople}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
