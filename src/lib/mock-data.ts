import type { Incident, Unit, Camera, PredictionPolygon, CrowdDensityPoint, Briefing } from "@/lib/types";

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

export const INITIAL_BRIEFS: Briefing[] = [
    {
        timestamp: "14:00",
        brief: "All systems operational. Crowd density is low and stable across all sectors. No active incidents to report. On-ground teams are at their posts."
    },
    {
        timestamp: "14:05",
        brief: "Monitoring a slight increase in crowd density near the north gate. All other sectors remain stable. Units are holding their positions."
    },
    {
        timestamp: "14:10",
        brief: "Crowd density at the north gate has stabilized. System status remains green. No unusual activity detected on camera feeds. Weather is clear."
    },
    {
        timestamp: "14:15",
        brief: "A small, contained argument was resolved by on-site personnel near Sector B. No further action needed. All other areas are calm."
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
        brief: "An unattended bag has been reported near the main entrance. Unit-1 is deployed to investigate. Severity is currently assessed as Medium."
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
        brief: "A crowd surge is reported at the north gate. Potential for crushes. Severity is High. All available units are being directed to the location."
    }
];

export const MOCK_SOCIAL_POSTS: string[] = [
    "The lines to get in are insane! Been waiting 45 minutes. #OmniView #Fail",
    "Incredible atmosphere here at #OmniView! The energy is electric!",
    "Can't find any water fountains and the bottles are so expensive. Pretty frustrating. #OmniView",
    "Security team was super helpful when I got lost. Big thanks! #OmniView",
    "The sound system is amazing! Can hear everything perfectly from my seat. #OmniView",
    "Why is the north gate so crowded? Seems unsafe. #OmniView",
    "Just saw the drone fly over, so cool! #OmniView #Tech",
    "Parking was a nightmare. Took an hour just to get into the lot. #OmniView",
    "Food is surprisingly good and not too overpriced. Well done #OmniView.",
    "The light show was absolutely breathtaking! #OmniView #Amazing",
    "Restrooms near section C are a total mess. Needs attention. #OmniView",
    "Love the band, but it's way too crowded up front. Hard to breathe. #OmniView",
];
