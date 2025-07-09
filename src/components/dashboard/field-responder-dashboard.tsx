import { LiveMap } from '@/components/shared/live-map';
import { IncidentCard } from '@/components/shared/incident-card';
import { usePersona } from '@/components/persona/persona-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import ApiProviderWrapper from '../api-provider-wrapper';

export function FieldResponderDashboard() {
  const { incidents } = usePersona();
  const assignedIncident = incidents.find(inc => inc.id === 'inc-1');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
      <div className="h-full min-h-[400px]">
        <ApiProviderWrapper>
          <LiveMap />
        </ApiProviderWrapper>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><User/> Your Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Unit:</strong> unit-1 (Personnel)</p>
            <p><strong>Status:</strong> Deployed</p>
            <p><strong>Assignment:</strong> Respond to 'Unattended Bag'</p>
          </CardContent>
        </Card>
        {assignedIncident && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Assigned Incident</h2>
            <IncidentCard incident={assignedIncident} />
          </div>
        )}
      </div>
    </div>
  );
}
