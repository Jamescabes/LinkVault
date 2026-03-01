import { Card } from '../ui/Card';

interface CountryBreakdownProps {
  data: Record<string, number>;
}

export function CountryBreakdown({ data }: CountryBreakdownProps) {
  const entries = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const max = entries.length > 0 ? entries[0][1] : 0;

  if (entries.length === 0) {
    return (
      <Card padding="md">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Clicks by Country
        </h3>
        <p className="text-sm text-text-tertiary text-center py-6">
          No geographic data yet
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Clicks by Country
      </h3>
      <div className="space-y-3">
        {entries.map(([country, count]) => (
          <div key={country}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-secondary">{country || 'Unknown'}</span>
              <span className="text-sm font-medium text-text-primary tabular-nums">
                {count.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
