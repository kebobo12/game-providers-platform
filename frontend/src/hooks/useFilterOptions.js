import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useFilterOptions() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: () => api.get('/filters/'),
    staleTime: 10 * 60 * 1000,
  })

  return {
    gameTypes: data?.game_types ?? [],
    currencyModes: data?.currency_modes ?? [],
    fiatCurrencies: data?.fiat_currencies ?? [],
    cryptoCurrencies: data?.crypto_currencies ?? [],
    countries: data?.countries ?? [],
    isLoading,
    isError,
    error,
  }
}
