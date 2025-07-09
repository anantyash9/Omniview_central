'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, FileText, Send, Shield, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Agent definitions
const AGENTS = {
  intel: { id: 'intel', name: 'Intel Agent', icon: Cpu, position: 'col-start-1 row-start-1' },
  planning: { id: 'planning', name: 'Planning Agent', icon: FileText, position: 'col-start-2 row-start-1' },
  dispatch: { id: 'dispatch', name: 'Dispatch Agent', icon: Send, position: 'col-start-1 row-start-2' },
  commander: { id: 'commander', name: 'Commander Agent', icon: Shield, position: 'col-start-2 row-start-2' },
};

type AgentId = keyof typeof AGENTS;

// Scenarios for playback
const scenarios = [
  {
    title: 'Crowd Surge Mitigation',
    description: 'High crowd density was detected and managed at North Gate.',
    steps: [
      { from: 'intel', to: 'planning', message: 'High crowd density detected near North Gate.' },
      { from: 'planning', to: 'dispatch', message: 'Plan: Reroute pedestrians, deploy 1 unit.' },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Managing crowd surge. Unit-2 deployed.' },
      { from: 'commander', to: 'dispatch', message: 'Acknowledged. Keep me updated.' },
    ],
  },
  {
    title: 'Unattended Package',
    description: 'An unattended package was identified and investigated.',
    steps: [
      { from: 'intel', to: 'planning', message: 'Unattended package on Cam-3, SW Corner.' },
      { from: 'planning', to: 'dispatch', message: 'Action: Dispatch unit-1 to investigate. Cordon area.' },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Unit-1 responding to package. Area secured.' },
      { from: 'commander', to: 'dispatch', message: 'Understood. Report findings immediately.' },
    ],
  },
   {
    title: 'Medical Emergency',
    description: 'Attendee required medical assistance in the main concourse.',
    steps: [
      { from: 'intel', to: 'planning', message: 'Report of person fainting near food court.' },
      { from: 'planning', to: 'dispatch', message: 'Plan: Dispatch medical unit, clear path.' },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Medical unit en route to assist.' },
    ],
  },
];

const defaultMessages: Record<AgentId, string> = {
  intel: 'Monitoring data streams...',
  planning: 'Awaiting intel...',
  dispatch: 'Standing by for orders...',
  commander: 'Overseeing operations...',
};

export function OperationsAgentGrid() {
  const [messages, setMessages] = useState<Record<AgentId, string>>(defaultMessages);
  const [activeConnection, setActiveConnection] = useState<{ from: AgentId, to: AgentId } | null>(null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleScenarioClick = (index: number) => {
    setMessages(defaultMessages); // Reset messages
    setActiveConnection(null);
    setCurrentStep(0);
    setActiveScenarioIndex(index);
  };
  
  useEffect(() => {
    if (activeScenarioIndex === null) return;
  
    const scenario = scenarios[activeScenarioIndex];
    if (currentStep >= scenario.steps.length) {
      // Scenario finished
      return;
    }
  
    const step = scenario.steps[currentStep];
  
    // Define the sequence of animations for the current step
    const stepTimeout = setTimeout(() => {
      // 1. Show connection and update text
      setActiveConnection({ from: step.from, to: step.to });
      setMessages(prev => ({
        ...prev,
        [step.from]: `Sent to ${AGENTS[step.to].name}: "${step.message.substring(0, 35)}..."`,
        [step.to]: `From ${AGENTS[step.from].name}: "${step.message.substring(0, 35)}..."`,
      }));
  
      // 2. Hide connection after animation
      const connectionTimer = setTimeout(() => {
        setActiveConnection(null);
      }, 1500);
  
      // 3. Move to next step
      const nextStepTimer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
  
      return () => {
        clearTimeout(connectionTimer);
        clearTimeout(nextStepTimer);
      };
    }, currentStep === 0 ? 50 : 2500); // No delay for the first step, then pause between steps
  
    return () => clearTimeout(stepTimeout);
  
  }, [activeScenarioIndex, currentStep]);


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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        {/* Left Column: Actions Log */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Completed Actions Log</CardTitle>
              <CardDescription>Click an action to replay the agent communication sequence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {scenarios.map((scenario, index) => (
                <Button
                  key={index}
                  variant={activeScenarioIndex === index ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => handleScenarioClick(index)}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{scenario.title}</span>
                    <span className="text-xs text-muted-foreground font-normal whitespace-normal">{scenario.description}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Agent Grid */}
        <div className="lg:col-span-2 relative grid grid-cols-2 grid-rows-2 gap-4">
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
                        <CardHeader className="flex flex-row items-center space-x-2 space-y-0 pb-2">
                            <div className={cn(
                                'p-1.5 rounded-lg', 
                                isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <agent.icon className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-base">{agent.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center">
                            <p className="text-xs text-muted-foreground italic">
                                "{messages[agent.id as AgentId]}"
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
      </div>
    </div>
  );
}
