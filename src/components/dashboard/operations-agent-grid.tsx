'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, FileText, Send, Shield, Bot, Camera, Video, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';

// Agent definitions
const AGENTS = {
  intel: { id: 'intel', name: 'Intel Agent', icon: Cpu, position: 'col-start-1 row-start-1', inputs: { camera: Camera, drone: Video, social: MessageSquare }},
  planning: { id: 'planning', name: 'Planning Agent', icon: FileText, position: 'col-start-2 row-start-1', inputs: { agent: Cpu } },
  dispatch: { id: 'dispatch', name: 'Dispatch Agent', icon: Send, position: 'col-start-1 row-start-2', inputs: { agent: FileText } },
  commander: { id: 'commander', name: 'Commander Agent', icon: Shield, position: 'col-start-2 row-start-2', inputs: { agent: Send } },
};

type AgentId = keyof typeof AGENTS;
type InputType = 'camera' | 'drone' | 'social' | 'agent';

// Scenarios for playback
const scenarios = [
  {
    title: 'Crowd Surge Mitigation',
    description: 'High crowd density was detected and managed at North Gate.',
    steps: [
      { from: 'intel', to: 'planning', message: 'High crowd density at North Gate. Velocity increasing. Recommend pedestrian rerouting.', activeInput: 'drone', fromStatus: 'Analyzing Drone Feed...', toStatus: 'Receiving Intel...' },
      { from: 'planning', to: 'dispatch', message: 'Plan: Reroute Sector 4 pedestrians to East exit. Dispatch one personnel unit to monitor flow.', activeInput: 'agent', fromStatus: 'Formulating Plan...', toStatus: 'Awaiting Dispatch Orders...' },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Crowd surge at North Gate being managed. Unit-2 deployed to reroute flow.', activeInput: 'agent', fromStatus: 'Executing Plan...', toStatus: 'Receiving Sitrep...' },
      { from: 'commander', to: 'dispatch', message: 'Acknowledged. Keep me updated on density levels.', activeInput: 'agent', fromStatus: 'Monitoring...', toStatus: 'Executing Plan...' },
    ],
  },
  {
    title: 'Unattended Package',
    description: 'An unattended package was identified and investigated.',
    steps: [
      { from: 'intel', to: 'planning', message: 'Unattended package spotted on Cam-3 feed, SW Corner near concession stand.', activeInput: 'camera', fromStatus: 'Analyzing Camera Feed...', toStatus: 'Receiving Intel...' },
      { from: 'planning', to: 'dispatch', message: 'Action: Dispatch unit-1 to investigate. Establish 50m cordon. Alert nearby units.', activeInput: 'agent', fromStatus: 'Devising Action Plan...', toStatus: 'Awaiting Dispatch Orders...' },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Unit-1 responding to suspicious package. Area secured.', activeInput: 'agent', fromStatus: 'Executing Plan...', toStatus: 'Receiving Sitrep...' },
      { from: 'commander', to: 'dispatch', message: 'Understood. Report findings immediately.', activeInput: 'agent', fromStatus: 'Awaiting Report...', toStatus: 'Executing Plan...' },
    ],
  },
   {
    title: 'Medical Emergency',
    description: 'Attendee required medical assistance in the main concourse.',
    steps: [
      { from: 'intel', to: 'planning', message: 'Social media report of person fainting near food court. Corroborated by Cam-5.', activeInput: 'social', fromStatus: 'Corroborating Social Post...', toStatus: 'Receiving Intel...' },
      { from: 'planning', to: 'dispatch', message: 'Plan: Dispatch medical unit M-1 to food court. Clear path via Service-A route.', activeInput: 'agent', fromStatus: 'Formulating Plan...', toStatus: 'Awaiting Dispatch Orders...' },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Medical unit M-1 en route to assist. Path is clear.', activeInput: 'agent', fromStatus: 'Executing Plan...', toStatus: 'Receiving Sitrep...' },
    ],
  },
];

const defaultStatuses: Record<AgentId, string> = {
  intel: 'Monitoring data streams...',
  planning: 'Awaiting intel...',
  dispatch: 'Standing by for orders...',
  commander: 'Overseeing operations...',
};

export function OperationsAgentGrid() {
  const [statuses, setStatuses] = useState<Record<AgentId, string>>(defaultStatuses);
  const [activeConnection, setActiveConnection] = useState<{ from: AgentId, to: AgentId } | null>(null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeInput, setActiveInput] = useState<{ agent: AgentId, input: InputType } | null>(null);
  const [transmission, setTransmission] = useState<string | null>(null);

  const resetState = () => {
    setStatuses(defaultStatuses);
    setActiveConnection(null);
    setActiveInput(null);
    setTransmission(null);
    setCurrentStep(0);
  }

  const handleScenarioClick = (index: number) => {
    resetState();
    setActiveScenarioIndex(index);
  };
  
  useEffect(() => {
    if (activeScenarioIndex === null) return;
  
    const scenario = scenarios[activeScenarioIndex];
    if (currentStep >= scenario.steps.length) {
      // Scenario finished
      setTimeout(resetState, 3000);
      return;
    }
  
    const step = scenario.steps[currentStep];
  
    const stepTimeout = setTimeout(() => {
      // 1. "From" agent starts thinking
      setStatuses(prev => ({ ...prev, [step.from]: step.fromStatus }));
      setActiveInput({ agent: step.from, input: step.activeInput as InputType });

      // 2. Data transmission starts
      const transmissionTimer = setTimeout(() => {
        setActiveConnection({ from: step.from, to: step.to });
        setTransmission(`FROM: ${AGENTS[step.from].name} -> TO: ${AGENTS[step.to].name}\n\n"${step.message}"`);
        setStatuses(prev => ({ ...prev, [step.to]: step.toStatus }));
      }, 1500);
  
      // 3. Transmission ends, cleanup
      const nextStepTimer = setTimeout(() => {
        setActiveConnection(null);
        setActiveInput(null);
        setTransmission(null);
        setCurrentStep(prev => prev + 1);
      }, 4000);
  
      return () => {
        clearTimeout(transmissionTimer);
        clearTimeout(nextStepTimer);
      };
    }, currentStep === 0 ? 50 : 2000); // Pause between steps
  
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
        <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle>Completed Actions Log</CardTitle>
              <CardDescription>Click an action to replay the agent communication sequence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow">
                <ScrollArea className='h-full'>
                  {scenarios.map((scenario, index) => (
                    <Button
                      key={index}
                      variant={activeScenarioIndex === index ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto py-2 mb-2"
                      onClick={() => handleScenarioClick(index)}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{scenario.title}</span>
                        <span className="text-xs text-muted-foreground font-normal whitespace-normal">{scenario.description}</span>
                      </div>
                    </Button>
                  ))}
                </ScrollArea>
            </CardContent>
          </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative grid grid-cols-2 grid-rows-2 gap-4 flex-grow">
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
                <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
                
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
                                <div className={cn('p-1.5 rounded-lg', isSender ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <agent.icon className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base">{agent.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-center justify-center">
                                <p className="text-xs text-muted-foreground italic text-center">
                                    {statuses[agent.id as AgentId]}
                                </p>
                            </CardContent>
                            <div className="flex items-center justify-center gap-2 border-t p-2">
                                <span className="text-xs font-semibold">Inputs:</span>
                                {Object.entries(agent.inputs).map(([key, Icon]) => (
                                    <div key={key} className={cn(
                                        "p-1 rounded-md transition-colors",
                                        activeInput?.agent === agent.id && activeInput.input === key ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                                    )}>
                                       <Icon className="w-4 h-4" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>
            <Card className="h-28">
                <CardHeader className='p-2'>
                    <CardTitle className="text-sm">Live Transmission Log</CardTitle>
                </CardHeader>
                <CardContent className='p-2'>
                  <div className="text-xs font-mono whitespace-pre-wrap text-green-600">
                    {transmission ? `> ${transmission}` : '> Awaiting transmission...'}
                  </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
