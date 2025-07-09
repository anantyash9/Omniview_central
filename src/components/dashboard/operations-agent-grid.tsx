
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Cpu, FileText, Send, Shield, Camera, Airplay, MessageSquare, Users, AreaChart, Bot, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const NODE_CONFIG = {
  // Inputs
  camera: { id: 'camera', name: 'Camera Feeds', icon: Camera, type: 'input', x: 10, y: 5 },
  drone: { id: 'drone', name: 'Drone Feeds', icon: Airplay, type: 'input', x: 40, y: 5 },
  social: { id: 'social', name: 'Social Media', icon: MessageSquare, type: 'input', x: 70, y: 5 },
  groundUnits: { id: 'groundUnits', name: 'Ground Units', icon: Users, type: 'input', x: 25, y: 92 },
  crowdSim: { id: 'crowdSim', name: 'Crowd Sim', icon: AreaChart, type: 'input', x: 75, y: 92 },

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
    description: 'An unattended package was identified, investigated, and cleared.',
    totalTime: 310,
    steps: [
      { from: 'camera', to: 'intel', time: 5, duration: 2000, status: { intel: 'Analyzing Camera Feed...' } },
      { from: 'intel', to: 'planning', time: 20, duration: 3000, message: 'Unattended package spotted. Requesting plan.', status: { intel: 'Awaiting Plan...', planning: 'Devising Action Plan...' } },
      { from: 'groundUnits', to: 'planning', time: 35, duration: 1500, status: { planning: 'Checking unit proximity...' } },
      { from: 'planning', to: 'dispatch', time: 55, duration: 3000, message: 'Plan: Dispatch unit-1 to investigate. Establish 50m cordon.', status: { planning: 'Plan Sent.', dispatch: 'Receiving Orders...' } },
      { from: 'dispatch', to: 'commander', time: 70, duration: 2500, message: 'SITREP: Unit-1 responding to suspicious package.', status: { dispatch: 'Executing Plan...', commander: 'Monitoring...' } },
      { from: 'groundUnits', to: 'dispatch', time: 180, duration: 2000, status: { dispatch: 'Awaiting on-site confirmation...'}, message: 'Unit-1 on site.' },
      { from: 'dispatch', to: 'planning', time: 200, duration: 2500, message: 'Unit-1 on site. Cordon established.', status: { planning: 'Acknowledged. Awaiting clearance.'} },
      { from: 'drone', to: 'intel', time: 240, duration: 2000, status: { intel: 'Verifying cordon with drone view.'} },
      { from: 'intel', to: 'commander', time: 300, duration: 3000, message: 'VERIFICATION: Package is benign, personal belongings found.', status: { commander: 'Stand down unit.'} },
      { from: 'dispatch', to: 'commander', time: 310, duration: 2000, message: 'SITREP: Incident resolved. Unit-1 returning to post.', status: { commander: 'Acknowledged.'} },
    ],
  },
  {
    title: 'Crowd Surge Mitigation',
    description: 'High crowd density was detected and managed at North Gate.',
    totalTime: 190,
    steps: [
      { from: 'crowdSim', to: 'planning', time: 10, duration: 2000, status: { planning: 'Analyzing Crowd Data...' } },
      { from: 'drone', to: 'intel', time: 25, duration: 2000, status: { intel: 'Corroborating with drone feed...' } },
      { from: 'intel', to: 'planning', time: 40, duration: 3000, message: 'Confirmed: High density at North Gate.', status: { planning: 'Updating plan with new intel...' } },
      { from: 'planning', to: 'dispatch', time: 60, duration: 3000, message: 'Plan: Reroute Sector 4. Dispatch unit-2 to monitor.', status: { dispatch: 'Executing Reroute...' } },
      { from: 'dispatch', to: 'commander', time: 75, duration: 2000, message: 'SITREP: Crowd surge managed. Unit-2 on site.', status: { commander: 'Acknowledged.' } },
      { from: 'crowdSim', to: 'planning', time: 180, duration: 2500, status: { planning: 'Verifying flow...' } },
      { from: 'planning', to: 'commander', time: 190, duration: 2000, message: 'VERIFICATION: Crowd flow normalized at North Gate.', status: { commander: 'Situation Resolved.'} },
    ],
  },
   {
    title: 'Medical Emergency',
    description: 'Attendee required medical assistance in the main concourse.',
    totalTime: 210,
    steps: [
      { from: 'social', to: 'intel', time: 15, duration: 2000, status: { intel: 'Monitoring social media...' } },
      { from: 'intel', to: 'planning', time: 30, duration: 3000, message: 'Social media report of medical emergency. Requesting confirmation.', status: { planning: 'Cross-referencing...' } },
      { from: 'camera', to: 'intel', time: 50, duration: 2000, status: { intel: 'Confirming via Cam-5...' } },
      { from: 'intel', to: 'planning', time: 65, duration: 2000, message: 'Confirmed. Medical emergency at food court.', status: { planning: 'Dispatching medical...' } },
      { from: 'planning', to: 'dispatch', time: 80, duration: 3000, message: 'ACTION: Dispatch M-1 to food court.', status: { dispatch: 'Medical unit dispatched.' } },
      { from: 'groundUnits', to: 'dispatch', time: 200, duration: 2500, message: 'Medic unit M-1 has arrived on-site.', status: { dispatch: 'Awaiting patient status...'} },
      { from: 'dispatch', to: 'commander', time: 210, duration: 2000, message: 'SITREP: Patient is stable and being treated.', status: { commander: 'Acknowledged.'} },
    ],
  },
];


const defaultStatuses: Record<AgentId, string> = {
  intel: 'Monitoring...',
  planning: 'Awaiting Intel...',
  dispatch: 'Standing By...',
  commander: 'Overseeing...',
};

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function OperationsAgentGrid() {
  const [statuses, setStatuses] = useState<Record<AgentId, string>>(defaultStatuses);
  const [activeConnection, setActiveConnection] = useState<{ from: NodeId, to: NodeId } | null>(null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [transmission, setTransmission] = useState<{ message: string; position: { x: string; y: string } } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const resetState = () => {
    setStatuses(defaultStatuses);
    setActiveConnection(null);
    setTransmission(null);
    setCurrentStep(0);
    setElapsedTime(0);
  }

  const handleScenarioClick = (index: number) => {
    if (activeScenarioIndex === index) {
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
      setElapsedTime(scenario.totalTime);
      setTimeout(() => {
        resetState();
        setActiveScenarioIndex(null);
      }, 4000);
      return;
    }
  
    const step = scenario.steps[currentStep];
  
    const stepTimeout = setTimeout(() => {
      setActiveConnection({ from: step.from as NodeId, to: step.to as NodeId });
      if (step.status) {
        setStatuses(prev => ({ ...prev, ...step.status }));
      }
      setElapsedTime(step.time);

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
      
      const nextStepTimer = setTimeout(() => {
        setActiveConnection(null);
        setTransmission(null);
        setCurrentStep(prev => prev + 1);
      }, step.duration - 500); 
  
      return () => clearTimeout(nextStepTimer);
    }, currentStep === 0 ? 50 : 800); 
  
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
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-3">
                  {scenarios.map((scenario, index) => (
                    <button
                      key={index}
                      onClick={() => handleScenarioClick(index)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        activeScenarioIndex === index
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                          : 'bg-muted/30 hover:bg-muted/80'
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{scenario.title}</span>
                        <span
                          className={cn(
                            'text-xs font-normal whitespace-normal mt-1',
                            activeScenarioIndex === index
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          )}
                        >
                          {scenario.description}
                        </span>
                        <div
                          className={cn(
                            'flex items-center gap-2 mt-3 pt-2 border-t',
                            activeScenarioIndex === index
                              ? 'border-primary-foreground/20 text-primary-foreground/90 text-sm'
                              : 'border-border text-muted-foreground text-xs font-medium'
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Resolved in {formatTime(scenario.totalTime)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex-col items-start border-t pt-4">
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Simulation Time</p>
                <p className="text-4xl font-bold font-mono text-primary">
                    {formatTime(elapsedTime)}
                </p>
            </CardFooter>
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
              
              {STATIC_CONNECTIONS.map(({from, to}) => (
                 <path key={`${from}-${to}`} d={getPathD(from as NodeId, to as NodeId)} className="stroke-border" strokeWidth="0.5" strokeDasharray="2" />
              ))}
              
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
                key={currentStep} 
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
