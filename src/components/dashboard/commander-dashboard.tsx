import { LiveMap } from '@/components/shared/live-map';
import { IncidentCard } from '@/components/shared/incident-card';
import { usePersona } from '@/components/persona/persona-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import ApiProviderWrapper from '../api-provider-wrapper';

export function CommanderDashboard() {
  const { incidents } = usePersona();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
      <div className="lg:col-span-2 h-full min-h-[400px]">
        <ApiProviderWrapper>
          <LiveMap />
        </ApiProviderWrapper>
      </div>
      <div className="h-full flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Active Incidents</h2>
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-4">
            {incidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
