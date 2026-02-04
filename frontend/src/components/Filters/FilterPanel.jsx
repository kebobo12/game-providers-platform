import { useFilters } from '../../hooks/useFilters'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import { SearchInput } from './SearchInput'
import { FilterDropdown } from './FilterDropdown'
import { ActiveFilters } from './ActiveFilters'

export function FilterPanel() {
  const {
    filters,
    setSearch,
    setGameType,
    setCurrencyMode,
    setSupportedCurrency,
    setRestrictedCountry,
    setRegulatedCountry,
    removeFilter,
    clearAll,
    hasActiveFilters,
  } = useFilters()

  const {
    gameTypes,
    currencyModes,
    fiatCurrencies,
    cryptoCurrencies,
    countries,
    isLoading: optionsLoading,
  } = useFilterOptions()

  // Combine fiat and crypto currencies for the dropdown
  const allCurrencies = [
    ...fiatCurrencies.map(c => ({ value: c, label: `${c} (Fiat)` })),
    ...cryptoCurrencies.map(c => ({ value: c, label: `${c} (Crypto)` })),
  ]

  // Format country options
  const countryOptions = countries.map(c => ({ value: c, label: c }))

  return (
    <div className="space-y-4 mb-6">
      {/* Search + Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        <SearchInput
          value={filters.search}
          onChange={setSearch}
          className="lg:w-80"
        />
        <div className="flex flex-wrap gap-3">
          <FilterDropdown
            label="Game Type"
            options={gameTypes}
            value={filters.game_type}
            onChange={setGameType}
            multiple
            placeholder="All types"
            isLoading={optionsLoading}
          />
          <FilterDropdown
            label="Currency Mode"
            options={currencyModes}
            value={filters.currency_mode}
            onChange={setCurrencyMode}
            placeholder="All modes"
            isLoading={optionsLoading}
          />
          <FilterDropdown
            label="Currency"
            options={allCurrencies}
            value={filters.supported_currency}
            onChange={setSupportedCurrency}
            multiple
            placeholder="All currencies"
            isLoading={optionsLoading}
          />
          <FilterDropdown
            label="Restricted"
            options={countryOptions}
            value={filters.restricted_country}
            onChange={setRestrictedCountry}
            multiple
            placeholder="No restriction filter"
            isLoading={optionsLoading}
          />
          <FilterDropdown
            label="Regulated"
            options={countryOptions}
            value={filters.regulated_country}
            onChange={setRegulatedCountry}
            multiple
            placeholder="No regulation filter"
            isLoading={optionsLoading}
          />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          onRemove={removeFilter}
          onClearAll={clearAll}
        />
      )}
    </div>
  )
}
