import { PersonaSwitcher } from '@/components/persona/persona-switcher';
import { Command } from 'lucide-react';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Command className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">OmniView Central</h1>
      </div>
      <PersonaSwitcher />
    </header>
  );
}
