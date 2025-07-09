import { LiveMap } from '@/components/shared/live-map';
import { IncidentCard } from '@/components/shared/incident-card';
import { usePersona } from '@/components/persona/persona-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import ApiProviderWrapper from '../api-provider-wrapper';
import { BriefingTimeline } from '@/components/commander/briefing-timeline';
import { AggregateStats } from '@/components/commander/aggregate-stats';
import { OnGroundTeams } from '@/components/commander/on-ground-teams';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SocialMediaIntelligence } from '../commander/social-media-intelligence';
import { CrowdMovementAnalysis } from '../commander/crowd-movement-analysis';

export function CommanderDashboard() {
  const { incidents } = usePersona();

  return (
    <div className="p-4 space-y-4">
      <BriefingTimeline />

      <AggregateStats />

      <div className="h-[50vh] min-h-[400px] w-full">
        <ApiProviderWrapper>
          <LiveMap />
        </ApiProviderWrapper>
      </div>

      <SocialMediaIntelligence />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                {incidents.length > 0 ? (
                  incidents.map(incident => (
                    <IncidentCard key={incident.id} incident={incident} />
                  ))
                ) : (
                  <p className="text-muted-foreground">No active incidents.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
            <OnGroundTeams />
            <CrowdMovementAnalysis />
        </div>
      </div>
    </div>
  );
}
