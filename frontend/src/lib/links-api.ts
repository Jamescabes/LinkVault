import { apiClient } from './api-client';
import type {
  CreateLinkRequest,
  LinkResponse,
  LinkStatsResponse,
  PageResponse,
} from '../types/api';

export const linksApi = {
  create: (data: CreateLinkRequest) =>
    apiClient<LinkResponse>('/api/v1/links', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (page = 0, size = 10) =>
    apiClient<PageResponse<LinkResponse>>(
      `/api/v1/links?page=${page}&size=${size}&sort=createdAt,desc`,
    ),

  delete: (id: number) =>
    apiClient<void>(`/api/v1/links/${id}`, { method: 'DELETE' }),

  getStats: (id: number) =>
    apiClient<LinkStatsResponse>(`/api/v1/links/${id}/stats`),
};
