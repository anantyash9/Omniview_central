'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';

export default function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center p-4">
          <h3 className="text-lg font-semibold">Google Maps API Key Missing</h3>
          <p className="text-sm text-muted-foreground">
            Please add your Google Maps API key to your environment variables.
            <br />
            See the <code>.env.local.example</code> file for instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} solutionChannel="GMP_visgl_rgm_react_v1_prom">
      {children}
    </APIProvider>
  );
}
