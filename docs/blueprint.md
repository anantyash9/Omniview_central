# **App Name**: OmniView Central

## Core Features:

- Persona-Based Dashboards: Displays a dashboard tailored to each persona (Commander, Analyst, Field Responder, Drone Operator), providing relevant data and controls for their specific roles.
- Interactive Live Map: Shows a live map with crowd density overlays, incident markers, and unit locations, with distinct visualizations per persona (e.g., prediction polygons for Commander).
- Real-time Data Updates: Offers real-time data feeds via WebSockets for events like incident updates and density changes, ensuring a dynamic and responsive user experience.
- Standardized Component Library: Uses components such as the CriticalCameraWall to display video streams with alert badges and an IncidentCard to show standardized information and actions related to an incident.
- AI-Powered Recommendations: The 'Analyst' persona will incorporate AI recommendations via the GeminiInsightList component, which acts as a tool providing suggested actions based on predictive analytics (e.g., opening gates to reduce density) and potential impact scores, enabling informed decision-making.
- Persona Switching: Allows seamless switching between different persona views without reloading sockets or losing the shared store state, enhancing usability and workflow efficiency.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to convey trust and authority.
- Background color: Light Gray (#F5F5F5) to provide a clean and neutral backdrop.
- Accent color: Amber (#FFB300) to highlight important information and interactive elements.
- Font: 'Inter', a sans-serif (grotesque) typeface, for both headlines and body text to maintain a modern, neutral, and machined look.
- Use clear and consistent icons from a library like FontAwesome to represent various functions, statuses, and alerts.
- Implement a modular design with rounded cards and consistent spacing to ensure a visually appealing and easily navigable interface.
- Use subtle transitions and animations for state changes and data updates to provide feedback to the user without being distracting.