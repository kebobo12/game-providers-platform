import { useState, useEffect, useMemo } from 'react'
import { StatsCards } from '../components/Stats/StatsCards'
import { FilterPanel } from '../components/Filters'
import { ProviderGrid } from '../components/Providers'
import { useFilters } from '../hooks/useFilters'
import { useProviders } from '../hooks/useProviders'

export default function HomePage() {
  const { filters, clearAll, hasActiveFilters } = useFilters()
  const [page, setPage] = useState(1)

  // Stringify filters for stable dependency comparison
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filtersKey])

  const {
    providers,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isFetching,
  } = useProviders(filters, page)

  return (
    <div>
      {/* Stats Cards */}
      <StatsCards />

      {/* Filter Panel */}
      <FilterPanel />

      {/* Provider Grid */}
      <ProviderGrid
        providers={providers}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        filters={filters}
        onClearFilters={hasActiveFilters ? clearAll : undefined}
      />
    </div>
  )
}
