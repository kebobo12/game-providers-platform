import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useFilterOptions() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: () => api.get('/filters/'),
    staleTime: 10 * 60 * 1000,
  })

  // Countries come as [{code, name}] — build a code->name lookup map
  const countries = data?.countries ?? []
  const countryLookup = useMemo(() => {
    const map = {}
    for (const c of countries) {
      map[c.code] = c.name
    }
    return map
  }, [countries])

  return {
    gameTypes: data?.game_types ?? [],
    currencyModes: data?.currency_modes ?? [],
    fiatCurrencies: data?.fiat_currencies ?? [],
    cryptoCurrencies: data?.crypto_currencies ?? [],
    countries,
    countryLookup,
    isLoading,
    isError,
    error,
  }
}
