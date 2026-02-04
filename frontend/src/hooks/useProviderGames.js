import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

function buildQueryParams(filters, page) {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.volatility) params.set('volatility', filters.volatility)
  if (filters.game_type) params.set('game_type', filters.game_type)

  params.set('page', page.toString())

  return params.toString()
}

export function useProviderGames(providerId, filters = {}, page = 1, { enabled = true } = {}) {
  const queryString = buildQueryParams(filters, page)

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['providerGames', providerId, filters, page],
    queryFn: () => api.get(`/providers/${providerId}/games/?${queryString}`),
    enabled: enabled && !!providerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  })

  return {
    games: data?.results ?? [],
    totalCount: data?.count ?? 0,
    currentPage: page,
    totalPages: data?.count ? Math.ceil(data.count / 20) : 0, // 20 per page for games
    hasNextPage: !!data?.next,
    hasPrevPage: !!data?.previous,
    isLoading,
    isFetching,
    isError,
    error,
  }
}
