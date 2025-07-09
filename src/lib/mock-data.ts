import type { Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint } from "@/lib/types";

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Unattended Bag',
    severity: 'Medium',
    location: { lat: 18.9842, lng: 72.8201 },
    time: '14:32',
    description: 'An unattended black backpack was reported near the main entrance.',
  },
  {
    id: 'inc-2',
    title: 'Crowd Surge',
    severity: 'High',
    location: { lat: 18.9849, lng: 72.8210 },
    time: '14:45',
    description: 'Sudden crowd movement reported at the north gate. Potential for crushes.',
  },
];

export const INITIAL_UNITS: Unit[] = [
  { id: 'unit-1', type: 'Personnel', status: 'Deployed', location: { lat: 18.9844, lng: 72.8194 } },
  { id: 'unit-2', type: 'Personnel', status: 'Available', location: { lat: 18.9834, lng: 72.8215 } },
  { id: 'unit-3', type: 'Vehicle', status: 'On-Site', location: { lat: 18.9829, lng: 72.8189 } },
  { id: 'drone-1', type: 'Drone', status: 'Deployed', location: { lat: 18.9846, lng: 72.8204 } },
];

export const INITIAL_CAMERAS: Camera[] = [
  { id: 'cam-1', name: 'Plaza Cam 1', isAlert: false },
  { id: 'cam-2', name: 'North Gate Cam', isAlert: true },
  { id: 'cam-3', name: 'West Corridor', isAlert: false },
  { id: 'cam-4', name: 'East Entrance', isAlert: false },
  { id: 'cam-5', name: 'Rooftop Cam A', isAlert: false },
  { id: 'cam-6', name: 'Service Entry', isAlert: false },
];

export const INITIAL_PREDICTIONS: PredictionPolygon[] = [
    {
        id: 'pred-1',
        points: [
            { lat: 18.9849, lng: 72.8210 },
            { lat: 18.9854, lng: 72.8208 },
            { lat: 18.9852, lng: 72.8203 },
            { lat: 18.9847, lng: 72.8205 },
        ]
    }
];

export const INITIAL_CROWD_DENSITY: CrowdDensityPoint[] = [
    { location: { lat: 18.9842, lng: 72.8201 }, density: 0.6 },
    { location: { lat: 18.9844, lng: 72.8206 }, density: 0.7 },
    { location: { lat: 18.9849, lng: 72.8210 }, density: 0.9 },
    { location: { lat: 18.9839, lng: 72.8196 }, density: 0.4 },
];
