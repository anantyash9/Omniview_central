
'use client';

import { useEffect, useState, useMemo, useTransition } from 'react';
import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Slider } from '@/components/ui/slider';
import { Bot, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { generateCommanderBrief } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function BriefingTimeline() {
  const { briefs: initialBriefs, addBrief, incidents, units, crowdDensity, densityZones } = usePersona();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Reverse briefs to show newest first
  const briefs = useMemo(() => [...initialBriefs].reverse(), [initialBriefs]);
  const totalBriefs = briefs.length;

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on('select', handleSelect);
    
    // When the number of briefs changes (i.e., a new one is added),
    // re-initialize the carousel and scroll to the first slide.
    api.reInit();
    api.scrollTo(0, true);
    setCurrent(0);

    return () => {
      api.off('select', handleSelect);
    };
  }, [api, totalBriefs]); // Rerun specifically when the *count* of briefs changes.

  const handleSliderChange = (value: number[]) => {
    api?.scrollTo(value[0]);
  };
  
  const handleGenerateBrief = () => {
    startTransition(async () => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const lastBrief = briefs.length > 0 ? briefs[0].brief : undefined;

        const input = {
            incidents,
            units,
            crowdDensity,
            densityZones,
            timestamp,
            lastBrief,
        };
        const result = await generateCommanderBrief(input);
        console.log('Generated Briefing:', result);
        if ('error' in result) {
            toast({
                variant: 'destructive',
                title: "Briefing Generation Failed",
                description: result.error,
            });
        } else {
            await addBrief({ timestamp: result.timestamp, brief: result.brief });
            toast({
                title: "Briefing Generated",
                description: "The new briefing has been added to the timeline.",
            });
        }
    });
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Commander's Briefing</h2>
            <Button onClick={handleGenerateBrief} disabled={isPending}>
                <Sparkles className="mr-2" />
                {isPending ? 'Generating...' : 'Generate New Briefing'}
            </Button>
        </div>
      
        {!briefs || briefs.length === 0 ? (
            <p className="text-muted-foreground">No briefings available. Generate one to get started.</p>
        ) : (
        <>
            <Carousel
            setApi={setApi}
            opts={{
                align: 'start',
                loop: false,
            }}
            className="w-full"
            >
            <CarouselContent>
                {briefs.map((brief, index) => {
                    const isSelected = index === current;
                    const isMostRecent = index === 0;

                    return (
                        <CarouselItem key={`${brief.timestamp}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 flex flex-col h-full">
                            <Card className={cn(
                                "flex-grow", 
                                isSelected && isMostRecent && "border-primary shadow-lg",
                                isSelected && !isMostRecent && "border-foreground"
                            )}>
                                <CardHeader className="flex flex-row items-center justify-end pb-2">
                                    <Bot className="h-5 w-5 text-primary" />
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
                                    isSelected ? (isMostRecent ? "bg-primary" : "bg-foreground") : "bg-muted-foreground"
                                )} />
                                <div className="absolute top-full -translate-y-1/2 left-1/2 -translate-x-1/2 bg-background px-2">
                                    <div className={cn(
                                        "flex items-center gap-1 text-xs",
                                        isSelected ? (isMostRecent ? "text-primary font-semibold" : "text-foreground font-medium") : "text-muted-foreground"
                                    )}>
                                        <Clock className="h-3 w-3" />
                                        <span>{brief.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </CarouselItem>
                    );
                })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            </Carousel>
            <div className="py-2 px-16 mt-6">
                <Slider
                    value={[current]}
                    max={totalBriefs > 0 ? totalBriefs - 1 : 0}
                    onValueChange={handleSliderChange}
                    className="w-full"
                />
            </div>
        </>
      )}
    </div>
  );
}
