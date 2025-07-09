'use client';

import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Car, Airplay } from 'lucide-react';

const unitIcons = {
    Personnel: <User className="h-4 w-4" />,
    Vehicle: <Car className="h-4 w-4" />,
    Drone: <Airplay className="h-4 w-4" />,
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
