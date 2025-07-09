'use client';

import { useEffect, useState } from 'react';
import { usePersona } from '@/components/persona/persona-provider';
import { generateCommanderBrief } from '@/app/actions';
import type { GenerateCommanderBriefOutput } from '@/ai/flows/generate-commander-brief';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BriefingTimeline() {
  const { incidents, units, crowdDensity } = usePersona();
  const [briefs, setBriefs] = useState<GenerateCommanderBriefOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBriefs = async () => {
      setIsLoading(true);
      const newBriefs: GenerateCommanderBriefOutput[] = [];
      const now = new Date();

      try {
        // Generate 5 historical briefs for demonstration
        for (let i = 4; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
          const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const result = await generateCommanderBrief({
            incidents,
            units,
            crowdDensity,
            timestamp: timeString,
          });

          if ('error' in result) {
            console.error(result.error);
            newBriefs.push({
              brief: 'Could not generate briefing for this period.',
              timestamp: timeString,
            });
          } else {
            newBriefs.push(result);
          }
        }
        setBriefs(newBriefs.reverse()); // Show newest first
      } catch (error) {
        console.error("Failed to fetch briefs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Commander's Briefing</h2>
      {isLoading ? (
        <div className="flex space-x-4">
            <Skeleton className="h-40 w-full md:w-1/2 lg:w-1/3" />
            <Skeleton className="h-40 w-full hidden md:block md:w-1/2 lg:w-1/3" />
            <Skeleton className="h-40 w-full hidden lg:block lg:w-1/3" />
        </div>
      ) : (
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {briefs.map((brief, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 flex flex-col h-full">
                  <Card className={cn("flex-grow", index === 0 && "border-primary shadow-lg")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Bot className="text-primary" /> AI Generated Brief
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{brief.brief}</p>
                    </CardContent>
                  </Card>
                  {/* Timeline track element */}
                  <div className="relative w-full h-8 mt-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
                    <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-background",
                        index === 0 ? "bg-primary" : "bg-muted-foreground"
                    )} />
                    <div className="absolute top-full -translate-y-1/2 left-1/2 -translate-x-1/2 bg-background px-2">
                        <div className={cn(
                            "flex items-center gap-1 text-xs",
                            index === 0 ? "text-primary font-semibold" : "text-muted-foreground"
                        )}>
                            <Clock className="h-3 w-3" />
                            <span>{brief.timestamp}</span>
                        </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
}
