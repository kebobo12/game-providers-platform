import { useState } from 'react'
import { ExportButton, downloadCSV, arrayToCSV } from '../../shared'
import { CountryModal } from '../../Modals'
import { useFilterOptions } from '../../../hooks/useFilterOptions'

function XCircleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function CountryBadge({ country, type, countryLookup = {} }) {
  const code = country.country_code
  const name = countryLookup[code]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-full ${
      type === 'restricted'
        ? 'bg-error/10 text-error'
        : 'bg-primary/10 text-primary'
    }`}>
      <span className="opacity-60 font-mono text-xs">{code}</span>
      {name && <span className="font-medium">{name}</span>}
    </span>
  )
}

const PREVIEW_LIMIT = 20

export function CountriesTab({ provider }) {
  const [activeSubTab, setActiveSubTab] = useState('restricted')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { countryLookup } = useFilterOptions()

  if (!provider) return null

  const restrictions = provider.restrictions ?? []
  const restrictedCountries = restrictions.filter(r => r.restriction_type === 'RESTRICTED')
  const regulatedCountries = restrictions.filter(r => r.restriction_type === 'REGULATED')

  const handleExport = () => {
    const rows = restrictions.map(r => ({
      'Country Code': r.country_code,
      'Restriction Type': r.restriction_type,
    }))

    const csv = arrayToCSV(['Country Code', 'Restriction Type'], rows)
    downloadCSV(csv, `${provider.provider_name}_countries`)
  }

  const totalCount = restrictions.length
  const showViewAll = restrictedCountries.length > PREVIEW_LIMIT || regulatedCountries.length > PREVIEW_LIMIT

  // Preview only first N countries
  const previewRestricted = restrictedCountries.slice(0, PREVIEW_LIMIT)
  const previewRegulated = regulatedCountries.slice(0, PREVIEW_LIMIT)

  return (
    <>
      <div className="space-y-4">
        {/* Header with count and export */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {totalCount} {totalCount === 1 ? 'country' : 'countries'}
          </span>
          <div className="flex items-center gap-2">
            {showViewAll && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                View All
              </button>
            )}
            {totalCount > 0 && (
              <ExportButton onClick={handleExport} />
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveSubTab('restricted')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeSubTab === 'restricted'
                ? 'border-error text-error'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <span className="flex items-center gap-2">
              <XCircleIcon />
              Restricted ({restrictedCountries.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('regulated')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeSubTab === 'regulated'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircleIcon />
              Regulated ({regulatedCountries.length})
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[100px]">
          {activeSubTab === 'restricted' && (
            <div className="space-y-3">
              {restrictedCountries.length === 0 ? (
                <p className="text-text-muted text-sm py-4 text-center">No restricted countries</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {previewRestricted.map(c => (
                      <CountryBadge key={c.country_code} country={c} type="restricted" countryLookup={countryLookup} />
                    ))}
                  </div>
                  {restrictedCountries.length > PREVIEW_LIMIT && (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      +{restrictedCountries.length - PREVIEW_LIMIT} more restricted countries
                    </button>
                  )}
                  <p className="text-xs text-text-muted mt-3">
                    ⚠️ Games cannot be offered in these countries
                  </p>
                </>
              )}
            </div>
          )}

          {activeSubTab === 'regulated' && (
            <div className="space-y-3">
              {regulatedCountries.length === 0 ? (
                <p className="text-text-muted text-sm py-4 text-center">No regulated countries</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {previewRegulated.map(c => (
                      <CountryBadge key={c.country_code} country={c} type="regulated" countryLookup={countryLookup} />
                    ))}
                  </div>
                  {regulatedCountries.length > PREVIEW_LIMIT && (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      +{regulatedCountries.length - PREVIEW_LIMIT} more regulated countries
                    </button>
                  )}
                  <p className="text-xs text-text-muted mt-3">
                    ℹ️ Games can be offered but must comply with local regulations
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <CountryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={provider}
        countryLookup={countryLookup}
      />
    </>
  )
}
