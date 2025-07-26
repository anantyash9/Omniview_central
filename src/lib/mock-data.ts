import type { Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint, Briefing, CrowdFlowData } from "@/lib/types";

// Centered around BIEC Hall 1, Bangalore, within the specified bounding box.
// Bounding Box:
// Top-Left: 13.063417, 77.475750
// Top-Right: 13.063361, 77.476278
// Bottom-Left: 13.061896, 77.475594
// Bottom-Right: 13.061861, 77.476122

const VENUE_BOUNDS = {
  north: 13.063417,
  south: 13.061861,
  east: 77.476278,
  west: 77.475594,
};

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Unattended Bag',
    severity: 'Medium',
    location: { lat: 13.0624, lng: 77.4761 },
    time: '14:32',
    description: 'An unattended black backpack was reported near the entrance to Hall 1.',
  },
  {
    id: 'inc-2',
    title: 'Crowd Surge',
    severity: 'High',
    location: { lat: 13.0629, lng: 77.4758 },
    time: '14:45',
    description: 'Sudden crowd movement reported at the food court area. Potential for crushes.',
  },
];

export const INITIAL_UNITS: Unit[] = [
  { id: 'unit-1', type: 'Personnel', status: 'Deployed', location: { lat: 13.0622, lng: 77.4760 } },
  { id: 'unit-2', type: 'Personnel', status: 'Available', location: { lat: 13.0620, lng: 77.4758 } },
  { id: 'unit-3', type: 'Vehicle', status: 'On-Site', location: { lat: 13.0619, lng: 77.4756 } },
  { id: 'drone-1', type: 'Drone', status: 'Deployed', location: { lat: 13.0628, lng: 77.4760 } },
];

export const INITIAL_CAMERAS: Camera[] = [
  { id: 'cam1', name: 'Hall 1 west side ', isAlert: false, location: { lat: 13.06265, lng: 77.4758 }, heading: 90, pitch: 5, fov: [] },
  { id: 'cam2', name: 'Hall 1 east side', isAlert: true, location: { lat: 13.0626, lng: 77.4762 }, heading: 180, pitch: 2, fov: [] },
  { id: 'cam-3', name: 'Parking Lot Cam', isAlert: false, location: { lat: 13.0620, lng: 77.4757 }, heading: 30, pitch: 0, fov: [] },
  { id: 'cam-4', name: 'Food Court Cam', isAlert: false, location: { lat: 13.0632, lng: 77.4759 }, heading: 270, pitch: 5, fov: [] },
  { id: 'cam-5', name: 'Conference Ctr', isAlert: false, location: { lat: 13.0633, lng: 77.4761 }, heading: 210, pitch: 10, fov: [] },
  { id: 'cam-6', name: 'Service Road Cam', isAlert: false, location: { lat: 13.0621, lng: 77.47625 }, heading: 0, pitch: 3, fov: [] },
];

export const INITIAL_PREDICTIONS: PredictionPolygon[] = [
    {
        id: 'pred-1',
        points: [
          { lat: 13.0630, lng: 77.4757 },
          { lat: 13.0629, lng: 77.4761 },
          { lat: 13.0625, lng: 77.4762 },
          { lat: 13.0622, lng: 77.4760 },
          { lat: 13.0623, lng: 77.4756 },
          { lat: 13.0627, lng: 77.4756 },
        ]
    }
];

export const INITIAL_CROWD_DENSITY: CrowdDensityPoint[] = [
    { location: { lat: 13.0624, lng: 77.4761 }, density: 0.6 },
    { location: { lat: 13.0628, lng: 77.4760 }, density: 0.7 },
    { location: { lat: 13.0629, lng: 77.4758 }, density: 0.9 },
    { location: { lat: 13.0622, lng: 77.4760 }, density: 0.4 },
];

export const INITIAL_CROWD_FLOW: CrowdFlowData[] = [
  { time: "14:00", "North Gate": 120, "Main Entrance": 200, "South Gate": 80 },
  { time: "14:05", "North Gate": 125, "Main Entrance": 210, "South Gate": 85 },
  { time: "14:10", "North Gate": 130, "Main Entrance": 220, "South Gate": 90 },
  { time: "14:15", "North Gate": 150, "Main Entrance": 230, "South Gate": 95 },
  { time: "14:20", "North Gate": 160, "Main Entrance": 240, "South Gate": 100 },
  { time: "14:25", "North Gate": 170, "Main Entrance": 250, "South Gate": 105 },
  { time: "14:30", "North Gate": 180, "Main Entrance": 260, "South Gate": 110 },
  { time: "14:35", "North Gate": 190, "Main Entrance": 255, "South Gate": 115 },
  { time: "14:40", "North Gate": 200, "Main Entrance": 250, "South Gate": 120 },
  { time: "14:45", "North Gate": 220, "Main Entrance": 240, "South Gate": 125 },
];


export const INITIAL_BRIEFS: Briefing[] = [
    {
        timestamp: "14:00",
        brief: "All systems operational. Crowd density is low and stable across all sectors. No active incidents to report. On-ground teams are at their posts."
    },
    {
        timestamp: "14:05",
        brief: "Monitoring a slight increase in crowd density near the food court. All other sectors remain stable. Units are holding their positions."
    },
    {
        timestamp: "14:10",
        brief: "Crowd density at the food court has stabilized. System status remains green. No unusual activity detected on camera feeds. Weather is clear."
    },
    {
        timestamp: "14:15",
        brief: "A small, contained argument was resolved by on-site personnel near Hall 2. No further action needed. All other areas are calm."
    },
    {
        timestamp: "14:20",
        brief: "Drone-1 is conducting a routine aerial sweep. Live feed shows normal crowd distribution. All units report normal status. No new alerts."
    },
    {
        timestamp: "14:25",
        brief: "Slight congestion reported at the main entrance turnstiles. Unit-2 is monitoring. No immediate security concern. Other operations are nominal."
    },
    {
        timestamp: "14:30",
        brief: "An unattended bag has been reported near Hall 1. Unit-1 is deployed to investigate. Severity is currently assessed as Medium."
    },
    {
        timestamp: "14:35",
        brief: "Unit-1 has secured the unattended bag. The area is cordoned off. The situation is under control. No immediate threat detected. Crowd rerouted."
    },
    {
        timestamp: "14:40",
        brief: "The unattended bag incident is resolved. It contained personal belongings. The cordon has been lifted. Normal operations are resuming in the area."
    },
    {
        timestamp: "14:45",
        brief: "A crowd surge is reported at the food court. Potential for crushes. Severity is High. All available units are being directed to the location."
    }
];

export const MOCK_SOCIAL_POSTS: string[] = [
    "The lines to get into Hall 1 are insane! Been waiting 45 minutes. #BIEC #Bengaluru",
    "Incredible atmosphere here at #BIEC! The energy is electric!",
    "Can't find any water fountains and the bottles are so expensive. Pretty frustrating. #BIEC",
    "Security team was super helpful when I got lost. Big thanks! #BIEC #Bengaluru",
    "The sound system is amazing! Can hear everything perfectly from my seat. #BIEC",
    "Why is the food court so crowded? Seems unsafe. #BIEC",
    "Just saw the drone fly over, so cool! #BIEC #Tech",
    "Parking was a nightmare. Took an hour just to get into the lot. #BIEC #Bengaluru",
    "Food is surprisingly good and not too overpriced. Well done #BIEC.",
    "The exhibition in Hall 1 is absolutely breathtaking! #BIEC #Amazing",
    "Restrooms near Hall 3 are a total mess. Needs attention. #BIEC",
    "Love the event, but it's way too crowded up front. Hard to breathe. #BIEC",
];
