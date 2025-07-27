'use client';

import { usePersona } from '@/components/persona/persona-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, Bot, Settings, Video } from 'lucide-react';
import type { Persona } from '@/lib/types';

const personaConfig = {
  Commander: { icon: Shield, label: 'Commander' },
  'Operations Agent': { icon: Bot, label: 'Operations Agent' },
  'Field Responder': { icon: User, label: 'Field Responder' },
  'Config': { icon: Settings, label: 'Config' },
  'Video Wall': { icon: Video, label: 'Video Wall' },
};

export function PersonaSwitcher() {
  const { persona, setPersona } = usePersona();
  const CurrentIcon = personaConfig[persona as keyof typeof personaConfig].icon;

  return (
    <Select value={persona} onValueChange={(value: string) => setPersona(value as Persona)}>
      <SelectTrigger className="w-[220px] h-10 bg-card">
        <div className="flex items-center gap-2">
          <CurrentIcon className="h-5 w-5 text-primary" />
          <SelectValue placeholder="Select Persona" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(personaConfig).map(([key, { icon: Icon, label }]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
