export type Persona = "Commander" | "Operations Agent" | "Field Responder" | "Config" | "Video Wall" | "Lost & Found";

export type Incident = {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  location: { lat: number; lng: number };
  time: string;
  description: string;
};

export type Unit = {
  id: string;
  type: "Personnel" | "Vehicle" | "Drone";
  status: "Available" | "Deployed" | "On-Site";
  location: { lat: number; lng: number };
};

export type CrowdDensityPoint = {
  location: { lat: number; lng: number };
  density: number; // 0 to 1
};

export type Camera = {
  id: string;
  name: string;
  isAlert: boolean;
  location: { lat: number; lng: number };
  fov: { lat: number; lng: number }[];
  stream?: string;
};

export type DensityZone = {
  id: string;
  name: string;
  points: { lat: number; lng: number }[];
  maxDensity: number;
}

export type PredictionPolygon = {
  id:string;
  points: { lat: number; lng: number }[];
};

export type Briefing = {
  timestamp: string;
  brief: string;
};

export type SocialMediaPost = {
  id: string;
  location: { lat: number; lng: number };
  author: string;
  text: string;
};

export type CrowdFlowData = {
  time: string;
  "North Gate": number;
  "Main Entrance": number;
  "South Gate": number;
};
