import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

function buildQueryParams(filters, page = 1) {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.currency_mode) params.set('currency_mode', filters.currency_mode)

  // Multi-value filters - API expects comma-separated values
  if (filters.game_type.length) params.set('game_type', filters.game_type.join(','))
  if (filters.fiat_currency.length) params.set('fiat_currency', filters.fiat_currency.join(','))
  if (filters.crypto_currency.length) params.set('crypto_currency', filters.crypto_currency.join(','))
  if (filters.restricted_country.length) params.set('restricted_country', filters.restricted_country.join(','))
  if (filters.regulated_country.length) params.set('regulated_country', filters.regulated_country.join(','))

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
