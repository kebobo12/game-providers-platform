import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

function buildQueryParams(filters, page = 1) {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.currency_mode) params.set('currency_mode', filters.currency_mode)

  // Multi-value filters - API expects repeated params or comma-separated
  filters.game_type.forEach(v => params.append('game_type', v))
  filters.supported_currency.forEach(v => params.append('supported_currency', v))
  filters.restricted_country.forEach(v => params.append('restricted_country', v))
  filters.regulated_country.forEach(v => params.append('regulated_country', v))

  params.set('page', page.toString())

  return params.toString()
}

export function useProviders(filters, page = 1) {
  const queryString = buildQueryParams(filters, page)

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['providers', filters, page],
    queryFn: () => api.get(`/providers/?${queryString}`),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  return {
    providers: data?.results ?? [],
    totalCount: data?.count ?? 0,
    currentPage: page,
    totalPages: data?.count ? Math.ceil(data.count / 24) : 0,
    hasNextPage: !!data?.next,
    hasPrevPage: !!data?.previous,
    isLoading,
    isFetching,
    isError,
    error,
  }
}
