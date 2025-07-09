import { LiveMap } from '@/components/shared/live-map';
import { CriticalCameraWall } from '@/components/shared/critical-camera-wall';
import ApiProviderWrapper from '../api-provider-wrapper';

export function DroneOperatorDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
      <div className="lg:col-span-2 h-full">
        <CriticalCameraWall />
      </div>
      <div className="h-full min-h-[400px]">
        <ApiProviderWrapper>
            <LiveMap />
        </ApiProviderWrapper>
      </div>
    </div>
  );
}
