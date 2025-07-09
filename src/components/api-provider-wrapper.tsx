import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const GoogleMapsProvider = dynamic(() => import('@/components/google-maps-provider'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />,
});

export default function ApiProviderWrapper({ children }: { children: ReactNode }) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}
