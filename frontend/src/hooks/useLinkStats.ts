import { useEffect, useState } from 'react';
import { linksApi } from '../lib/links-api';
import type { LinkStatsResponse } from '../types/api';

export function useLinkStats(linkId: number) {
  const [stats, setStats] = useState<LinkStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    linksApi
      .getStats(linkId)
      .then(setStats)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      })
      .finally(() => setIsLoading(false));
  }, [linkId]);

  return { stats, isLoading, error };
}
