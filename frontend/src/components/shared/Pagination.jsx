function ChevronLeft() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 24,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1 && !totalCount) return null

  // Calculate showing range
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results count */}
      {totalCount > 0 && (
        <span className="text-sm text-text-muted order-2 sm:order-1">
          Showing <span className="font-medium text-text">{startItem}</span>-
          <span className="font-medium text-text">{endItem}</span> of{' '}
          <span className="font-medium text-text">{totalCount}</span> results
        </span>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-4 order-1 sm:order-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg
                       bg-surface border border-border text-text
                       hover:border-primary hover:text-primary
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text
                       transition-colors"
          >
            <ChevronLeft />
            Previous
          </button>

          <span className="text-sm text-text-muted">
            Page <span className="font-medium text-text">{currentPage}</span> of{' '}
            <span className="font-medium text-text">{totalPages}</span>
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg
                       bg-surface border border-border text-text
                       hover:border-primary hover:text-primary
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text
                       transition-colors"
          >
            Next
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}
