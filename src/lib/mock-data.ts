import type { Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint } from "@/lib/types";

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Unattended Bag',
    severity: 'Medium',
    location: { lat: 12.9788, lng: 77.5997 },
    time: '14:32',
    description: 'An unattended black backpack was reported near the main plaza entrance.',
  },
  {
    id: 'inc-2',
    title: 'Crowd Surge',
    severity: 'High',
    location: { lat: 12.9795, lng: 77.6005 },
    time: '14:45',
    description: 'Sudden crowd movement reported at the north gate. Potential for crushes.',
  },
];

export const INITIAL_UNITS: Unit[] = [
  { id: 'unit-1', type: 'Personnel', status: 'Deployed', location: { lat: 12.9790, lng: 77.5990 } },
  { id: 'unit-2', type: 'Personnel', status: 'Available', location: { lat: 12.9780, lng: 77.6010 } },
  { id: 'unit-3', type: 'Vehicle', status: 'On-Site', location: { lat: 12.9775, lng: 77.5985 } },
  { id: 'drone-1', type: 'Drone', status: 'Deployed', location: { lat: 12.9792, lng: 77.6000 } },
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
            { lat: 12.9795, lng: 77.6005 },
            { lat: 12.9800, lng: 77.6003 },
            { lat: 12.9798, lng: 77.5998 },
            { lat: 12.9793, lng: 77.6000 },
        ]
    }
];

export const INITIAL_CROWD_DENSITY: CrowdDensityPoint[] = [
    { location: { lat: 12.9788, lng: 77.5997 }, density: 0.6 },
    { location: { lat: 12.9790, lng: 77.6002 }, density: 0.7 },
    { location: { lat: 12.9795, lng: 77.6005 }, density: 0.9 },
    { location: { lat: 12.9785, lng: 77.5992 }, density: 0.4 },
];
