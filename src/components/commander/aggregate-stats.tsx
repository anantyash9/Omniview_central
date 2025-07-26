'use client';

import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle, Cloud, ShieldCheck } from 'lucide-react';

export function AggregateStats() {
  const { incidents, units, crowdDensity } = usePersona();

  const activeIncidents = incidents.length;
  const deployedUnits = units.filter(u => u.status === 'Deployed' || u.status === 'On-Site').length;
  
  const avgCrowdDensity = crowdDensity.length > 0 
    ? crowdDensity.reduce((acc, p) => acc + p.density, 0) / crowdDensity.length
    : 0;

  const getDensityLabel = (density: number) => {
    if (density > 0.75) return "High";
    if (density > 0.5) return "Medium";
    return "Low";
  };
  const crowdDensityLabel = getDensityLabel(avgCrowdDensity);

  const stats = [
    {
      title: 'Active Incidents',
      value: activeIncidents,
      icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
      description: 'Total ongoing incidents',
    },
    {
      title: 'Deployed Units',
      value: `${deployedUnits} / ${units.length}`,
      icon: <Users className="h-6 w-6 text-primary" />,
      description: 'Units on active duty',
    },
    {
      title: 'Avg. Crowd Density',
      value: crowdDensityLabel,
      icon: <Cloud className="h-6 w-6 text-accent" />,
      description: 'Overall crowd level',
    },
    {
      title: 'System Status',
      value: 'Operational',
      icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
      description: 'All systems running normally',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
