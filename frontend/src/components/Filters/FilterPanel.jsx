import { useState, useMemo, useCallback } from 'react'
import { useFilters } from '../../hooks/useFilters'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import { SearchInput } from './SearchInput'
import { FilterDropdown } from './FilterDropdown'
import { ActiveFilters } from './ActiveFilters'

function FunnelIcon() {
  return (
    <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function CryptoIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
    </svg>
  )
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function FilterPanel() {
  const {
    filters,
    setSearch,
    setFiatCurrency,
    setCryptoCurrency,
    setRestrictedCountry,
    setRegulatedCountry,
    removeFilter,
    clearAll,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters()

  const {
    fiatCurrencies,
    cryptoCurrencies,
    countries,
    countryLookup,
    isLoading: optionsLoading,
  } = useFilterOptions()

  const [isExpanded, setIsExpanded] = useState(false)
  const [countryMode, setCountryMode] = useState('supported')

  const countryOptions = useMemo(
    () => countries.map(c => ({ value: c.code, label: `${c.code} - ${c.name}` })),
    [countries]
  )

  // Country dropdown value depends on toggle mode
  const countryValue = countryMode === 'supported'
    ? filters.regulated_country
    : filters.restricted_country

  const handleCountryChange = useCallback((values) => {
    if (countryMode === 'supported') {
      setRegulatedCountry(values)
    } else {
      setRestrictedCountry(values)
    }
  }, [countryMode, setRegulatedCountry, setRestrictedCountry])

  // Transfer selected countries when toggling between supported/restricted
  const handleCountryModeChange = useCallback((newMode) => {
    if (newMode === countryMode) return

    const currentValues = countryMode === 'supported'
      ? filters.regulated_country
      : filters.restricted_country

    if (newMode === 'supported') {
      setRegulatedCountry(currentValues)
      setRestrictedCountry([])
    } else {
      setRestrictedCountry(currentValues)
      setRegulatedCountry([])
    }

    setCountryMode(newMode)
  }, [countryMode, filters.regulated_country, filters.restricted_country, setRegulatedCountry, setRestrictedCountry])

  // Count of active filters inside "More Filters" (everything except search)
  const moreFilterCount = activeFilterCount - (filters.search ? 1 : 0)

  return (
    <div className="mb-6 bg-surface border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FunnelIcon />
        <span className="text-sm font-medium text-text">Filters</span>
      </div>

      {/* Search Provider — always visible */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Search Provider
        </label>
        <SearchInput
          value={filters.search}
          onChange={setSearch}
          placeholder="Search by name..."
          className="w-full"
        />
      </div>

      {/* More Filters toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm text-text-muted hover:text-text border border-border rounded-lg transition-colors"
      >
        <span>
          More Filters
          {!isExpanded && moreFilterCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full bg-primary text-white">
              {moreFilterCount}
            </span>
          )}
        </span>
        <ChevronIcon expanded={isExpanded} />
      </button>

      {/* Collapsible section */}
      <div
        className={`transition-[max-height] duration-300 ease-out ${
          isExpanded ? 'max-h-[400px]' : 'max-h-0 overflow-hidden'
        }`}
      >
        <div>
          {/* Filter grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Fiat Currency */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
                <CurrencyIcon />
                Fiat Currency
              </label>
              <FilterDropdown
                label="Fiat Currency"
                hideLabel
                options={fiatCurrencies}
                value={filters.fiat_currency}
                onChange={setFiatCurrency}
                multiple
                placeholder="All Fiat Currencies"
                isLoading={optionsLoading}
              />
            </div>

            {/* Crypto Currency */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
                <CryptoIcon />
                Crypto Currency
              </label>
              <FilterDropdown
                label="Crypto Currency"
                hideLabel
                options={cryptoCurrencies}
                value={filters.crypto_currency}
                onChange={setCryptoCurrency}
                multiple
                placeholder="All Crypto Currencies"
                isLoading={optionsLoading}
              />
            </div>

            {/* Country — full width */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
                <GlobeIcon />
                Country
              </label>
              <FilterDropdown
                label="Country"
                hideLabel
                options={countryOptions}
                value={countryValue}
                onChange={handleCountryChange}
                multiple
                placeholder="All Countries"
                isLoading={optionsLoading}
              />
            </div>

            {/* Supported / Restricted toggle — full width */}
            <div className="sm:col-span-2 flex border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => handleCountryModeChange('supported')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  countryMode === 'supported'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Supported
              </button>
              <button
                type="button"
                onClick={() => handleCountryModeChange('restricted')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  countryMode === 'restricted'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Restricted
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4">
          <ActiveFilters
            filters={filters}
            onRemove={removeFilter}
            onClearAll={clearAll}
            countryLookup={countryLookup}
          />
        </div>
      )}
    </div>
  )
}
