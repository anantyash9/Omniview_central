'use client';

import { usePersona } from '@/components/persona/persona-provider';
import { CommanderDashboard } from './commander-dashboard';
import { FieldResponderDashboard } from './field-responder-dashboard';
import { ConfigDashboard } from './config-dashboard';
import { Card } from '../ui/card';
import { OperationsAgentGrid } from './operations-agent-grid';
import { VideoWallContent } from '@/app/video-wall/page';
import { LostAndFoundDashboard } from './lost-and-found-dashboard';

const dashboards = {
  Commander: <CommanderDashboard />,
  'Operations Agent': <OperationsAgentGrid />,
  'Field Responder': <FieldResponderDashboard />,
  'Config': <ConfigDashboard />,
  'Video Wall': <VideoWallContent />,
  'Lost & Found': <LostAndFoundDashboard />,
};

export function MainDashboard() {
  const { persona } = usePersona();

  return (
    <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
        {dashboards[persona] || <Card><p>No dashboard found for this persona.</p></Card>}
    </main>
  );
}
