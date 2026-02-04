import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useStats() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats/'),
    staleTime: 5 * 60 * 1000,
  })

  return {
    stats: data ?? { total_providers: 0, total_games: 0 },
    isLoading,
    isError,
    error,
  }
}
