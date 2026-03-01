import { Card } from '../ui/Card';
import type { ClickDetail } from '../../types/api';
import { timeAgo } from '../../lib/utils';

interface RecentClicksTableProps {
  clicks: ClickDetail[];
}

export function RecentClicksTable({ clicks }: RecentClicksTableProps) {
  if (clicks.length === 0) {
    return (
      <Card padding="md">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Recent Clicks
        </h3>
        <p className="text-sm text-text-tertiary text-center py-6">
          No clicks recorded yet
        </p>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Recent Clicks
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Time
              </th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Country
              </th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider hidden sm:table-cell">
                IP
              </th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell">
                User Agent
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {clicks.map((click, i) => (
              <tr key={i} className="hover:bg-surface-secondary/50 transition-colors">
                <td className="px-4 sm:px-6 py-3 text-text-secondary whitespace-nowrap">
                  {timeAgo(click.clickedAt)}
                </td>
                <td className="px-4 sm:px-6 py-3 text-text-primary whitespace-nowrap">
                  {click.country || 'Unknown'}
                </td>
                <td className="px-4 sm:px-6 py-3 text-text-tertiary whitespace-nowrap hidden sm:table-cell font-mono text-xs">
                  {click.ipAddress}
                </td>
                <td className="px-4 sm:px-6 py-3 text-text-tertiary hidden md:table-cell max-w-xs truncate">
                  {click.userAgent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
