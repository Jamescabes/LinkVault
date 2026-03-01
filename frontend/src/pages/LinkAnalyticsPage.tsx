import { Link, useParams } from 'react-router-dom';
import { useLinkStats } from '../hooks/useLinkStats';
import { Spinner } from '../components/ui/Spinner';
import { StatsOverview } from '../components/analytics/StatsOverview';
import { CountryBreakdown } from '../components/analytics/CountryBreakdown';
import { RecentClicksTable } from '../components/analytics/RecentClicksTable';

export function LinkAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { stats, isLoading, error } = useLinkStats(Number(id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-danger mb-4">{error || 'Link not found'}</p>
        <Link to="/dashboard" className="text-sm text-accent hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-semibold text-text-primary mb-6">
        Link Analytics
      </h1>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountryBreakdown data={stats.clicksByCountry} />
        <RecentClicksTable clicks={stats.recentClicks} />
      </div>
    </div>
  );
}
