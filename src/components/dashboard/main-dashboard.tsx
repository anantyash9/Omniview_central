'use client';

import { usePersona } from '@/components/persona/persona-provider';
import { CommanderDashboard } from './commander-dashboard';
import { FieldResponderDashboard } from './field-responder-dashboard';
import { DroneOperatorDashboard } from './drone-operator-dashboard';
import { Card } from '../ui/card';
import { OperationsAgentGrid } from './operations-agent-grid';

const dashboards = {
  Commander: <CommanderDashboard />,
  'Operations Agent': <OperationsAgentGrid />,
  'Field Responder': <FieldResponderDashboard />,
  'Drone Operator': <DroneOperatorDashboard />,
};

export function MainDashboard() {
  const { persona } = usePersona();

  return (
    <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
        {dashboards[persona] || <Card><p>No dashboard found for this persona.</p></Card>}
    </main>
  );
}
