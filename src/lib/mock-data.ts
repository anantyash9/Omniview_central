import type { Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint } from "@/lib/types";

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Unattended Bag',
    severity: 'Medium',
    location: { lat: 34.0522, lng: -118.2437 },
    time: '14:32',
    description: 'An unattended black backpack was reported near the main plaza entrance.',
  },
  {
    id: 'inc-2',
    title: 'Crowd Surge',
    severity: 'High',
    location: { lat: 34.0545, lng: -118.2465 },
    time: '14:45',
    description: 'Sudden crowd movement reported at the north gate. Potential for crushes.',
  },
];

export const INITIAL_UNITS: Unit[] = [
  { id: 'unit-1', type: 'Personnel', status: 'Deployed', location: { lat: 34.0530, lng: -118.2440 } },
  { id: 'unit-2', type: 'Personnel', status: 'Available', location: { lat: 34.0510, lng: -118.2420 } },
  { id: 'unit-3', type: 'Vehicle', status: 'On-Site', location: { lat: 34.0550, lng: -118.2480 } },
  { id: 'drone-1', type: 'Drone', status: 'Deployed', location: { lat: 34.0540, lng: -118.2450 } },
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
            { lat: 34.0545, lng: -118.2465 },
            { lat: 34.0555, lng: -118.2460 },
            { lat: 34.0550, lng: -118.2450 },
            { lat: 34.0540, lng: -118.2455 },
        ]
    }
];

export const INITIAL_CROWD_DENSITY: CrowdDensityPoint[] = [
    { location: { lat: 34.0522, lng: -118.2437 }, density: 0.6 },
    { location: { lat: 34.0532, lng: -118.2447 }, density: 0.7 },
    { location: { lat: 34.0545, lng: -118.2465 }, density: 0.9 },
    { location: { lat: 34.0528, lng: -118.2428 }, density: 0.4 },
];
