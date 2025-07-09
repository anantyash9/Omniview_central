
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, FileText, Send, Shield, Camera, Airplay, MessageSquare, Users, AreaChart, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';

const NODE_CONFIG = {
  // Inputs
  camera: { id: 'camera', name: 'Camera Feeds', icon: Camera, type: 'input', x: 10, y: 5 },
  drone: { id: 'drone', name: 'Drone Feeds', icon: Airplay, type: 'input', x: 40, y: 5 },
  social: { id: 'social', name: 'Social Media', icon: MessageSquare, type: 'input', x: 70, y: 5 },
  crowdSim: { id: 'crowdSim', name: 'Crowd Sim', icon: AreaChart, type: 'input', x: 25, y: 92 },
  groundUnits: { id: 'groundUnits', name: 'Ground Units', icon: Users, type: 'input', x: 75, y: 92 },

  // Agents
  intel: { id: 'intel', name: 'Intel Agent', icon: Cpu, type: 'agent', x: 25, y: 35 },
  planning: { id: 'planning', name: 'Planning Agent', icon: FileText, type: 'agent', x: 75, y: 35 },
  dispatch: { id: 'dispatch', name: 'Dispatch Agent', icon: Send, type: 'agent', x: 25, y: 65 },
  commander: { id: 'commander', name: 'Commander', icon: Shield, type: 'agent', x: 75, y: 65 },
};

type NodeId = keyof typeof NODE_CONFIG;
type AgentId = 'intel' | 'planning' | 'dispatch' | 'commander';

const STATIC_CONNECTIONS = [
  // Intel Inputs
  { from: 'camera', to: 'intel' },
  { from: 'drone', to: 'intel' },
  { from: 'social', to: 'intel' },
  // Planning Inputs
  { from: 'crowdSim', to: 'planning' },
  { from: 'groundUnits', to: 'planning' },
  // Dispatch Inputs
  { from: 'drone', to: 'dispatch' },
  { from: 'groundUnits', to: 'dispatch' },
  // Agent-to-Agent
  { from: 'intel', to: 'planning' },
  { from: 'intel', to: 'dispatch' },
  { from: 'planning', to: 'dispatch' },
  { from: 'dispatch', to: 'commander' },
  { from: 'planning', to: 'commander' },
];

const scenarios = [
  {
    title: 'Unattended Package',
    description: 'An unattended package was identified and investigated.',
    steps: [
      { from: 'camera', to: 'intel', duration: 2000, status: { intel: 'Analyzing Camera Feed...' } },
      { from: 'intel', to: 'planning', message: 'Unattended package spotted. Requesting plan.', duration: 3000, status: { intel: 'Awaiting Plan...', planning: 'Devising Action Plan...' } },
      { from: 'groundUnits', to: 'planning', duration: 1500, status: { planning: 'Checking unit proximity...' } },
      { from: 'planning', to: 'dispatch', message: 'Plan: Dispatch unit-1 to investigate. Establish 50m cordon.', duration: 3000, status: { planning: 'Plan Sent.', dispatch: 'Receiving Orders...' } },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Unit-1 responding to suspicious package.', duration: 2500, status: { dispatch: 'Executing Plan...', commander: 'Monitoring...' } },
    ],
  },
  {
    title: 'Crowd Surge Mitigation',
    description: 'High crowd density was detected and managed at North Gate.',
    steps: [
      { from: 'crowdSim', to: 'planning', duration: 2000, status: { planning: 'Analyzing Crowd Data...' } },
      { from: 'drone', to: 'intel', duration: 2000, status: { intel: 'Corroborating with drone feed...' } },
      { from: 'intel', to: 'planning', message: 'Confirmed: High density at North Gate.', duration: 3000, status: { planning: 'Updating plan with new intel...' } },
      { from: 'planning', to: 'dispatch', message: 'Plan: Reroute Sector 4. Dispatch unit-2 to monitor.', duration: 3000, status: { dispatch: 'Executing Reroute...' } },
      { from: 'dispatch', to: 'commander', message: 'SITREP: Crowd surge managed. Unit-2 on site.', duration: 2000, status: { commander: 'Acknowledged.' } },
    ],
  },
   {
    title: 'Medical Emergency',
    description: 'Attendee required medical assistance in the main concourse.',
    steps: [
      { from: 'social', to: 'intel', duration: 2000, status: { intel: 'Monitoring social media...' } },
      { from: 'intel', to: 'planning', message: 'Social media report of medical emergency. Requesting confirmation.', duration: 3000, status: { planning: 'Cross-referencing...' } },
      { from: 'camera', to: 'intel', duration: 2000, status: { intel: 'Confirming via Cam-5...' } },
      { from: 'intel', to: 'planning', message: 'Confirmed. Medical emergency at food court.', duration: 2000, status: { planning: 'Dispatching medical...' } },
      { from: 'planning', to: 'dispatch', message: 'ACTION: Dispatch M-1 to food court.', duration: 3000, status: { dispatch: 'Medical unit dispatched.' } },
    ],
  },
];


const defaultStatuses: Record<AgentId, string> = {
  intel: 'Monitoring...',
  planning: 'Awaiting Intel...',
  dispatch: 'Standing By...',
  commander: 'Overseeing...',
};

export function OperationsAgentGrid() {
  const [statuses, setStatuses] = useState<Record<AgentId, string>>(defaultStatuses);
  const [activeConnection, setActiveConnection] = useState<{ from: NodeId, to: NodeId } | null>(null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [transmission, setTransmission] = useState<{ message: string; position: { x: string; y: string } } | null>(null);

  const resetState = () => {
    setStatuses(defaultStatuses);
    setActiveConnection(null);
    setTransmission(null);
    setCurrentStep(0);
  }

  const handleScenarioClick = (index: number) => {
    if (activeScenarioIndex === index) { // Allow re-clicking to reset
        resetState();
        setActiveScenarioIndex(null);
    } else {
        resetState();
        setActiveScenarioIndex(index);
    }
  };
  
  useEffect(() => {
    if (activeScenarioIndex === null) return;
  
    const scenario = scenarios[activeScenarioIndex];
    if (currentStep >= scenario.steps.length) {
      setTimeout(() => {
        resetState();
        setActiveScenarioIndex(null);
      }, 3000);
      return;
    }
  
    const step = scenario.steps[currentStep];
  
    const stepTimeout = setTimeout(() => {
      // 1. Set active connection and statuses
      setActiveConnection({ from: step.from as NodeId, to: step.to as NodeId });
      if (step.status) {
        setStatuses(prev => ({ ...prev, ...step.status }));
      }

      // 2. If there's a message, prepare it for display
      if (step.message) {
        const fromNode = NODE_CONFIG[step.from as NodeId];
        const toNode = NODE_CONFIG[step.to as NodeId];
        setTransmission({
          message: step.message,
          position: {
            x: `${(fromNode.x + toNode.x) / 2}%`,
            y: `${(fromNode.y + toNode.y) / 2}%`,
          }
        });
      }
      
      // 3. Set timer to advance to next step
      const nextStepTimer = setTimeout(() => {
        setActiveConnection(null);
        setTransmission(null);
        setCurrentStep(prev => prev + 1);
      }, step.duration - 500); // End transmission a bit before next step
  
      return () => clearTimeout(nextStepTimer);
    }, currentStep === 0 ? 50 : 500); // Pause between steps
  
    return () => clearTimeout(stepTimeout);
  
  }, [activeScenarioIndex, currentStep]);


  const getPathD = (fromId: NodeId, toId: NodeId) => {
    const fromNode = NODE_CONFIG[fromId];
    const toNode = NODE_CONFIG[toId];
    if (!fromNode || !toNode) return '';
    return `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
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
            <CardContent className="flex-grow">
                <ScrollArea className='h-full pr-4'>
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

        <div className="lg:col-span-2 relative min-h-[450px] bg-muted/20 rounded-lg border">
            <svg 
              className="absolute top-0 left-0 w-full h-full" 
              aria-hidden="true" 
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" className="fill-green-500">
                      <polygon points="0 0, 10 3.5, 0 7" />
                  </marker>
              </defs>
              
              {/* Static lines */}
              {STATIC_CONNECTIONS.map(({from, to}) => (
                 <path key={`${from}-${to}`} d={getPathD(from as NodeId, to as NodeId)} className="stroke-border" strokeWidth="0.5" strokeDasharray="2" />
              ))}
              
              {/* Active connection animation */}
              {activeConnection && (
                  <path
                  d={getPathD(activeConnection.from, activeConnection.to)}
                  className="stroke-green-500"
                  strokeWidth="1"
                  markerEnd="url(#arrowhead)"
                  style={{ 
                    strokeDasharray: '1000', 
                    strokeDashoffset: '1000', 
                    animation: `dash ${scenarios[activeScenarioIndex!].steps[currentStep].duration / 1000 * 0.8}s linear forwards`
                  }}
                  />
              )}
            </svg>
            <style>{`@keyframes dash { to { stroke-dashoffset: 0; } } @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`}</style>
            
            {transmission && (
                <div
                key={currentStep} // Key re-triggers animation on change
                className="absolute p-2 bg-background/90 border rounded-lg text-xs shadow-xl z-20 text-center -translate-x-1/2 -translate-y-1/2 max-w-[150px]"
                style={{
                    left: transmission.position.x,
                    top: transmission.position.y,
                    animation: 'fadeIn 0.5s forwards',
                }}
                >
                {transmission.message}
                </div>
            )}
            
            {Object.values(NODE_CONFIG).map((node) => {
                const isAgent = node.type === 'agent';
                const isSender = activeConnection?.from === node.id;
                const isReceiver = activeConnection?.to === node.id;
                const isActive = isSender || isReceiver;

                return (
                    <div
                        key={node.id}
                        id={node.id}
                        className={cn(
                            'absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border flex flex-col items-center justify-center p-2 text-center transition-all duration-300 shadow-md',
                            isAgent ? 'bg-card text-card-foreground h-[7rem] w-[9rem]' : 'bg-muted text-muted-foreground h-[4.5rem] w-[7rem]',
                            isActive && 'ring-2 scale-105 shadow-2xl',
                            isSender && 'ring-primary',
                            isReceiver && 'ring-green-500',
                        )}
                        style={{ top: `${node.y}%`, left: `${node.x}%` }}
                    >
                        <node.icon className={cn('h-5 w-5 mb-1', isAgent && 'text-primary')} />
                        <h4 className="text-[11px] font-semibold leading-tight">{node.name}</h4>
                        {isAgent && (
                            <p className="text-[10px] text-muted-foreground italic mt-1 px-1">
                                {statuses[node.id as AgentId]}
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
}

    