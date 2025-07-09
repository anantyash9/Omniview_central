import { CriticalCameraWall } from '@/components/shared/critical-camera-wall';
import { GeminiInsightList } from '@/components/shared/gemini-insight-list';
import { IncidentCard } from '@/components/shared/incident-card';
import { usePersona } from '@/components/persona/persona-provider';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AnalystDashboard() {
  const { incidents } = usePersona();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 h-full">
      <div className="xl:col-span-2 h-full">
        <CriticalCameraWall />
      </div>
      <div className="lg:col-span-1 h-full">
        <GeminiInsightList />
      </div>
      <div className="lg:col-span-2 xl:col-span-3 h-full flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Incident Queue</h2>
        <ScrollArea className="max-h-[40vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
            {incidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
