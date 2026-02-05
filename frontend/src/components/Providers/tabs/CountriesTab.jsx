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
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-full ${
      type === 'restricted' ? 'badge-restricted' : 'badge-regulated'
    }`}>
      <span className="opacity-50 font-mono text-xs">{code}</span>
      {name && <span>{name}</span>}
    </span>
  )
}

const PREVIEW_LIMIT = 20

export function CountriesTab({ provider }) {
  const [activeSubTab, setActiveSubTab] = useState('restricted')
  const [modalTab, setModalTab] = useState(null)
  const { countryLookup } = useFilterOptions()

  if (!provider) return null

  const restrictions = provider.restrictions ?? []
  const restrictedCountries = restrictions.filter(r => r.restriction_type === 'RESTRICTED')
  const regulatedCountries = restrictions.filter(r => r.restriction_type === 'REGULATED')

  const hasRestricted = restrictedCountries.length > 0
  const hasRegulated = regulatedCountries.length > 0
  const hasBoth = hasRestricted && hasRegulated
  const effectiveTab = hasBoth ? activeSubTab : (hasRestricted ? 'restricted' : hasRegulated ? 'regulated' : null)

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
                onClick={() => setModalTab(effectiveTab)}
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

        {/* Sub-tabs — only show toggle when both types exist */}
        {hasBoth ? (
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveSubTab('restricted')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeSubTab === 'restricted'
                  ? 'bg-error text-white'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <XCircleIcon />
              Restricted ({restrictedCountries.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('regulated')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeSubTab === 'regulated'
                  ? 'bg-success text-white'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <CheckCircleIcon />
              Regulated ({regulatedCountries.length})
            </button>
          </div>
        ) : effectiveTab && (
          <h4 className="text-sm font-medium text-text-muted flex items-center gap-2">
            {effectiveTab === 'restricted'
              ? <><XCircleIcon /> Restricted Countries</>
              : <><CheckCircleIcon /> Regulated Countries</>}
          </h4>
        )}

        {/* Content */}
        <div>
          {effectiveTab === 'restricted' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {previewRestricted.map(c => (
                  <CountryBadge key={c.country_code} country={c} type="restricted" countryLookup={countryLookup} />
                ))}
              </div>
              {restrictedCountries.length > PREVIEW_LIMIT && (
                <button
                  type="button"
                  onClick={() => setModalTab('restricted')}
                  className="text-sm text-primary hover:text-primary-hover transition-colors"
                >
                  +{restrictedCountries.length - PREVIEW_LIMIT} more restricted countries
                </button>
              )}
              <p className="text-xs text-text-muted mt-3">
                Games cannot be offered in these countries
              </p>
            </div>
          )}

          {effectiveTab === 'regulated' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {previewRegulated.map(c => (
                  <CountryBadge key={c.country_code} country={c} type="regulated" countryLookup={countryLookup} />
                ))}
              </div>
              {regulatedCountries.length > PREVIEW_LIMIT && (
                <button
                  type="button"
                  onClick={() => setModalTab('regulated')}
                  className="text-sm text-primary hover:text-primary-hover transition-colors"
                >
                  +{regulatedCountries.length - PREVIEW_LIMIT} more regulated countries
                </button>
              )}
              <p className="text-xs text-text-muted mt-3">
                Provider is licensed in these countries
              </p>
            </div>
          )}

          {!effectiveTab && (
            <p className="text-text-muted text-sm py-4 text-center">No countries</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <CountryModal
        isOpen={!!modalTab}
        onClose={() => setModalTab(null)}
        provider={provider}
        countryLookup={countryLookup}
        initialTab={modalTab}
      />
    </>
  )
}
