export type Persona = "Commander" | "Analyst" | "Field Responder" | "Drone Operator";

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
  heading: number;
  pitch: number;
};

export type PredictionPolygon = {
  id: string;
  points: { lat: number; lng: number }[];
};

export type Briefing = {
  timestamp: string;
  brief: string;
};
