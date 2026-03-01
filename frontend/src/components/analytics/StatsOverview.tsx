import { Card } from '../ui/Card';
import type { LinkStatsResponse } from '../../types/api';
import { truncateUrl } from '../../lib/utils';

interface StatsOverviewProps {
  stats: LinkStatsResponse;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card padding="md">
        <p className="text-sm text-text-secondary mb-1">Total Clicks</p>
        <p className="text-3xl font-semibold text-text-primary">
          {stats.totalClicks.toLocaleString()}
        </p>
      </Card>

      <Card padding="md">
        <p className="text-sm text-text-secondary mb-1">Short URL</p>
        <p className="text-lg font-medium text-accent truncate">
          {stats.shortCode}
        </p>
      </Card>

      <Card padding="md">
        <p className="text-sm text-text-secondary mb-1">Original URL</p>
        <p className="text-sm text-text-tertiary truncate" title={stats.originalUrl}>
          {truncateUrl(stats.originalUrl, 40)}
        </p>
      </Card>
    </div>
  );
}
