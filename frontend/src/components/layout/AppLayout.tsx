import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { TourProvider } from '../onboarding/TourProvider';

export function AppLayout() {
  return (
    <TourProvider>
      <div className="min-h-screen bg-surface-secondary">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </TourProvider>
  );
}
