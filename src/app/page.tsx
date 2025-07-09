import { PersonaProvider } from '@/components/persona/persona-provider';
import { Header } from '@/components/shared/header';
import { MainDashboard } from '@/components/dashboard/main-dashboard';

export default function Home() {
  return (
    <PersonaProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <MainDashboard />
      </div>
    </PersonaProvider>
  );
}
