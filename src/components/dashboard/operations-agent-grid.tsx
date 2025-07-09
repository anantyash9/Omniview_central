'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, FileText, Send, Shield, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

// Agent definitions
const AGENTS = {
  intel: { id: 'intel', name: 'Intel Agent', icon: Cpu, position: 'col-start-1 row-start-1' },
  planning: { id: 'planning', name: 'Planning Agent', icon: FileText, position: 'col-start-2 row-start-1' },
  dispatch: { id: 'dispatch', name: 'Dispatch Agent', icon: Send, position: 'col-start-1 row-start-2' },
  commander: { id: 'commander', name: 'Commander Agent', icon: Shield, position: 'col-start-2 row-start-2' },
};

type AgentId = keyof typeof AGENTS;

// Message script for the simulation
const messageScript = [
  { from: 'intel', to: 'planning', message: 'High crowd density detected near North Gate via social media chatter.' },
  { from: 'planning', to: 'intel', message: 'Acknowledged. Analyzing available resources and drafting response options.' },
  { from: 'planning', to: 'dispatch', message: 'Plan ready: Reroute pedestrians away from North Gate. Deploy 1 personnel unit for observation.' },
  { from: 'dispatch', to: 'planning', message: 'Executing plan. Unit-2 is available and being dispatched to North Gate.' },
  { from: 'dispatch', to: 'commander', message: 'SITREP: Managing crowd surge at North Gate. Unit-2 deployed for monitoring.' },
  { from: 'commander', to: 'dispatch', message: 'Received. Keep me updated on the situation.' },
  { from: 'intel', to: 'planning', message: 'Unattended package spotted on Cam-3 near SW Corner.' },
  { from: 'planning', to: 'dispatch', message: 'Immediate action required. Dispatching unit-1 to investigate unattended package. Cordon off area.' },
  { from: 'dispatch', to: 'commander', message: 'SITREP: Unit-1 responding to unattended package at SW Corner. Area is being secured.' },
];

export function OperationsAgentGrid() {
  const [messages, setMessages] = useState<Record<AgentId, string>>({ intel: 'Monitoring data streams...', planning: 'Awaiting intel...', dispatch: 'Standing by for orders...', commander: 'Overseeing operations...' });
  const [activeConnection, setActiveConnection] = useState<{ from: AgentId, to: AgentId } | null>(null);
  const [scriptIndex, setScriptIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScriptIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % messageScript.length;
        const { from, to, message } = messageScript[nextIndex];

        setActiveConnection({ from, to });
        setMessages(prevMessages => ({
          ...prevMessages,
          [from]: `Sent to ${AGENTS[to].name}: "${message.substring(0, 40)}..."`,
          [to]: `Received from ${AGENTS[from].name}: "${message.substring(0, 40)}..."`,
        }));
        
        setTimeout(() => setActiveConnection(null), 1500);

        return nextIndex;
      });
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  const getPathD = (fromId: AgentId, toId: AgentId) => {
    const fromPos = AGENTS[fromId].position;
    const toPos = AGENTS[toId].position;
    const fromX = fromPos.includes('col-start-1') ? '25%' : '75%';
    const fromY = fromPos.includes('row-start-1') ? '25%' : '75%';
    const toX = toPos.includes('col-start-1') ? '25%' : '75%';
    const toY = toPos.includes('row-start-1') ? '25%' : '75%';
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }

  return (
    <div className="p-4 md:p-8 h-full bg-background flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          Operations Agent Grid
        </h1>
        <p className="text-muted-foreground">
          Live simulation of AI agents collaborating to manage event security.
        </p>
      </div>

      <div className="relative flex-grow grid grid-cols-2 grid-rows-2 gap-8">
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" className="fill-primary">
                  <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
          </defs>
          
          {/* Static lines */}
          <line x1="25%" y1="25%" x2="75%" y2="25%" className="stroke-border" strokeWidth="2" />
          <line x1="25%" y1="25%" x2="25%" y2="75%" className="stroke-border" strokeWidth="2" />
          <line x1="75%" y1="25%" x2="75%" y2="75%" className="stroke-border" strokeWidth="2" />
          <line x1="25%" y1="75%" x2="75%" y2="75%" className="stroke-border" strokeWidth="2" />
          <line x1="25%" y1="75%" x2="75%" y2="25%" className="stroke-border" strokeDasharray="4" strokeWidth="2" />

          {/* Active connection animation */}
          {activeConnection && (
            <path
              d={getPathD(activeConnection.from, activeConnection.to)}
              className="stroke-primary"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
              style={{ strokeDasharray: '1000', strokeDashoffset: '1000', animation: 'dash 1.5s linear forwards' }}
            />
          )}
        </svg>
        <style>{`
          @keyframes dash {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
        
        {Object.values(AGENTS).map((agent) => {
            const isSender = activeConnection?.from === agent.id;
            const isReceiver = activeConnection?.to === agent.id;
            return (
                <Card
                    key={agent.id}
                    id={agent.id}
                    className={cn(
                        'z-10 flex flex-col transition-all duration-300 transform-gpu shadow-lg',
                        agent.position,
                        isSender && 'border-primary ring-2 ring-primary shadow-2xl scale-105',
                        isReceiver && 'border-green-500 ring-2 ring-green-500 shadow-2xl scale-105'
                    )}
                >
                    <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-2">
                        <div className={cn(
                            'p-2 rounded-lg', 
                            isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}>
                            <agent.icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center">
                        <p className="text-sm text-muted-foreground italic">
                            "{messages[agent.id as AgentId]}"
                        </p>
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}
