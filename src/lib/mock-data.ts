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
  // Adjusted locations to be on roads with known Street View imagery
  { id: 'cam-1', name: 'Main Gate Cam', isAlert: false, location: { lat: 18.9846, lng: 72.8191 }, heading: 120, pitch: 5 },
  { id: 'cam-2', name: 'North Road Cam', isAlert: true, location: { lat: 18.9858, lng: 72.8188 }, heading: 270, pitch: 2 },
  { id: 'cam-3', name: 'SW Corner', isAlert: false, location: { lat: 18.9826, lng: 72.8183 }, heading: 45, pitch: 0 },
  { id: 'cam-4', name: 'Eastern Road', isAlert: false, location: { lat: 18.9830, lng: 72.8218 }, heading: 330, pitch: 5 },
  { id: 'cam-5', name: 'Paddock View', isAlert: false, location: { lat: 18.9842, lng: 72.8201 }, heading: 200, pitch: 10 },
  { id: 'cam-6', name: 'South Gate Cam', isAlert: false, location: { lat: 18.9818, lng: 72.8206 }, heading: 0, pitch: 3 },
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
