import type { Incident } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const severityStyles = {
  Critical: 'bg-red-600 text-white',
  High: 'bg-orange-500 text-white',
  Medium: 'bg-amber-500 text-black',
  Low: 'bg-green-500 text-white',
};

export function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {incident.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" /> {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                    <Clock className="h-4 w-4 ml-2" /> {incident.time}
                </CardDescription>
            </div>
            <Badge className={cn("text-xs", severityStyles[incident.severity])}>{incident.severity}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{incident.description}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Acknowledge</Button>
        <Button size="sm" variant="outline">View Details</Button>
      </CardFooter>
    </Card>
  );
}
