import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const INITIAL_FILTERS = {
  search: '',
  game_type: [],
  currency_mode: '',
  supported_currency: [],
  restricted_country: [],
  regulated_country: [],
}

function parseArrayParam(value) {
  if (!value) return []
  return value.split(',').filter(Boolean)
}

function paramsToFilters(searchParams) {
  return {
    search: searchParams.get('search') || '',
    game_type: parseArrayParam(searchParams.get('game_type')),
    currency_mode: searchParams.get('currency_mode') || '',
    supported_currency: parseArrayParam(searchParams.get('supported_currency')),
    restricted_country: parseArrayParam(searchParams.get('restricted_country')),
    regulated_country: parseArrayParam(searchParams.get('regulated_country')),
  }
}

function filtersToParams(filters) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.currency_mode) params.set('currency_mode', filters.currency_mode)
  if (filters.game_type.length) params.set('game_type', filters.game_type.join(','))
  if (filters.supported_currency.length) params.set('supported_currency', filters.supported_currency.join(','))
  if (filters.restricted_country.length) params.set('restricted_country', filters.restricted_country.join(','))
  if (filters.regulated_country.length) params.set('regulated_country', filters.regulated_country.join(','))
  return params
}

function filtersEqual(a, b) {
  return (
    a.search === b.search &&
    a.currency_mode === b.currency_mode &&
    a.game_type.join(',') === b.game_type.join(',') &&
    a.supported_currency.join(',') === b.supported_currency.join(',') &&
    a.restricted_country.join(',') === b.restricted_country.join(',') &&
    a.regulated_country.join(',') === b.regulated_country.join(',')
  )
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => paramsToFilters(searchParams))
  const [localSearch, setLocalSearch] = useState(() => searchParams.get('search') || '')

  const debounceRef = useRef(null)
  const isInternalUpdate = useRef(false)
  const pendingUrlSync = useRef(null)

  // Sync URL -> local state (for back/forward navigation)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    const urlFilters = paramsToFilters(searchParams)
    if (!filtersEqual(urlFilters, filters)) {
      setFilters(urlFilters)
      setLocalSearch(urlFilters.search)
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local state -> URL (single effect, deferred)
  useEffect(() => {
    if (pendingUrlSync.current) {
      clearTimeout(pendingUrlSync.current)
    }

    pendingUrlSync.current = setTimeout(() => {
      const urlFilters = paramsToFilters(searchParams)
      if (!filtersEqual(filters, urlFilters)) {
        isInternalUpdate.current = true
        setSearchParams(filtersToParams(filters), { replace: true })
      }
    }, 0)

    return () => {
      if (pendingUrlSync.current) {
        clearTimeout(pendingUrlSync.current)
      }
    }
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search input -> filter state
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      setFilters(prev => {
        if (prev.search === localSearch) return prev
        return { ...prev, search: localSearch }
      })
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [localSearch])

  // All setters only update local state - never touch URL directly
  const setSearch = useCallback((value) => {
    setLocalSearch(value)
  }, [])

  const setGameType = useCallback((values) => {
    setFilters(prev => ({ ...prev, game_type: values }))
  }, [])

  const setCurrencyMode = useCallback((value) => {
    setFilters(prev => ({ ...prev, currency_mode: value || '' }))
  }, [])

  const setSupportedCurrency = useCallback((values) => {
    setFilters(prev => ({ ...prev, supported_currency: values }))
  }, [])

  const setRestrictedCountry = useCallback((values) => {
    setFilters(prev => ({ ...prev, restricted_country: values }))
  }, [])

  const setRegulatedCountry = useCallback((values) => {
    setFilters(prev => ({ ...prev, regulated_country: values }))
  }, [])

  const removeFilter = useCallback((key, value) => {
    if (key === 'search') {
      setLocalSearch('')
      setFilters(prev => ({ ...prev, search: '' }))
    } else if (key === 'currency_mode') {
      setFilters(prev => ({ ...prev, currency_mode: '' }))
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter(v => v !== value)
      }))
    }
  }, [])

  const clearAll = useCallback(() => {
    setLocalSearch('')
    setFilters(INITIAL_FILTERS)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      localSearch !== '' ||
      filters.game_type.length > 0 ||
      filters.currency_mode !== '' ||
      filters.supported_currency.length > 0 ||
      filters.restricted_country.length > 0 ||
      filters.regulated_country.length > 0
    )
  }, [localSearch, filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (localSearch) count++
    if (filters.currency_mode) count++
    count += filters.game_type.length
    count += filters.supported_currency.length
    count += filters.restricted_country.length
    count += filters.regulated_country.length
    return count
  }, [localSearch, filters])

  return {
    filters: { ...filters, search: localSearch },
    setSearch,
    setGameType,
    setCurrencyMode,
    setSupportedCurrency,
    setRestrictedCountry,
    setRegulatedCountry,
    removeFilter,
    clearAll,
    hasActiveFilters,
    activeFilterCount,
  }
}
