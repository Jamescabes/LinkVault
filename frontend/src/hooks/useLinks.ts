import { useCallback, useEffect, useState } from 'react';
import { linksApi } from '../lib/links-api';
import type { CreateLinkRequest, LinkResponse } from '../types/api';

export function useLinks() {
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await linksApi.list(p);
      setLinks(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks(page);
  }, [page, fetchLinks]);

  const createLink = useCallback(
    async (data: CreateLinkRequest) => {
      const newLink = await linksApi.create(data);
      // Re-fetch current page to show the new link
      await fetchLinks(0);
      setPage(0);
      return newLink;
    },
    [fetchLinks],
  );

  const deleteLink = useCallback(
    async (id: number) => {
      await linksApi.delete(id);
      await fetchLinks(page);
    },
    [page, fetchLinks],
  );

  return {
    links,
    page,
    totalPages,
    totalElements,
    isLoading,
    error,
    setPage,
    createLink,
    deleteLink,
    refetch: () => fetchLinks(page),
  };
}
