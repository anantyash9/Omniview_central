'use client';

import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Car } from 'lucide-react';

const DroneIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 18.02a2.5 2.5 0 1 0-4.24-4.24 2.5 2.5 0 0 0 4.24 4.24Z"/>
      <path d="M21 6h-4.04"/>
      <path d="m16.96 6-4.95 4.95"/>
      <path d="M21 18h-4.04"/>
      <path d="m16.96 18-4.95-4.95"/>
      <path d="M3 12v-2a4 4 0 0 1 4-4h2"/>
      <path d="M3 12v2a4 4 0 0 0 4 4h2"/>
    </svg>
  );

const unitIcons = {
    Personnel: <User className="h-4 w-4" />,
    Vehicle: <Car className="h-4 w-4" />,
    Drone: <DroneIcon />,
};

export function OnGroundTeams() {
    const { units } = usePersona();

    return (
        <Card>
            <CardHeader>
                <CardTitle>On-Ground Teams Status</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Unit ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.map((unit) => (
                            <TableRow key={unit.id}>
                                <TableCell className="font-medium">{unit.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {unitIcons[unit.type]}
                                        <span>{unit.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={unit.status === 'Available' ? 'secondary' : 'default'}>
                                        {unit.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
