import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useProviderDetail(providerId, { enabled = true } = {}) {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => api.get(`/providers/${providerId}/`),
    enabled: enabled && !!providerId,
    staleTime: 5 * 60 * 1000, // 5 minutes - provider detail rarely changes
  })

  return {
    provider: data ?? null,
    isLoading,
    isFetching,
    isError,
    error,
  }
}
