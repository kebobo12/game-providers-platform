import { useState, useEffect, useMemo } from 'react'
import { Modal } from './Modal'
import { ExportButton, downloadCSV, arrayToCSV } from '../shared'

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

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
    <span className={`flex items-center gap-1.5 py-2 px-2 text-sm font-medium rounded-lg ${
      type === 'restricted' ? 'badge-restricted' : 'badge-regulated'
    }`}>
      <span className="opacity-50 font-mono text-xs">{code}</span>
      {name && <span className="truncate">{name}</span>}
    </span>
  )
}

export function CountryModal({ isOpen, onClose, provider, countryLookup = {}, initialTab }) {
  const [activeTab, setActiveTab] = useState('restricted')
  const [searchTerm, setSearchTerm] = useState('')

  // Sync to the requested tab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
      setSearchTerm('')
    }
  }, [isOpen, initialTab])

  const restrictions = provider?.restrictions ?? []
  const restrictedCountries = restrictions.filter(r => r.restriction_type === 'RESTRICTED')
  const regulatedCountries = restrictions.filter(r => r.restriction_type === 'REGULATED')

  const hasRestricted = restrictedCountries.length > 0
  const hasRegulated = regulatedCountries.length > 0
  const hasBoth = hasRestricted && hasRegulated
  const effectiveTab = hasBoth ? activeTab : (hasRestricted ? 'restricted' : hasRegulated ? 'regulated' : null)

  // Filter countries by search term (matches code or name)
  const filteredRestricted = useMemo(() => {
    if (!searchTerm) return restrictedCountries
    const term = searchTerm.toLowerCase()
    return restrictedCountries.filter(c =>
      c.country_code.toLowerCase().includes(term) ||
      (countryLookup[c.country_code] || '').toLowerCase().includes(term)
    )
  }, [restrictedCountries, searchTerm, countryLookup])

  const filteredRegulated = useMemo(() => {
    if (!searchTerm) return regulatedCountries
    const term = searchTerm.toLowerCase()
    return regulatedCountries.filter(c =>
      c.country_code.toLowerCase().includes(term) ||
      (countryLookup[c.country_code] || '').toLowerCase().includes(term)
    )
  }, [regulatedCountries, searchTerm, countryLookup])

  const handleExport = () => {
    const rows = restrictions.map(r => ({
      'Country Code': r.country_code,
      'Restriction Type': r.restriction_type,
    }))

    const csv = arrayToCSV(['Country Code', 'Restriction Type'], rows)
    downloadCSV(csv, `${provider?.provider_name}_countries`)
  }

  const totalCount = restrictions.length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Countries — ${provider?.provider_name}`}
      subtitle={`${totalCount} ${totalCount === 1 ? 'country' : 'countries'}`}
      size="lg"
      footer={
        totalCount > 0 && <ExportButton onClick={handleExport} label="Export CSV" />
      }
    >
      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search countries..."
          className="w-full pl-10 pr-4 py-2 bg-surface border border-input-border rounded-lg
                     text-text placeholder-text-muted
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Tabs — only show toggle when both types exist */}
      {hasBoth ? (
        <div className="flex border border-border rounded-lg overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('restricted')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'restricted'
                ? 'bg-error text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <XCircleIcon />
            Restricted ({restrictedCountries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('regulated')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'regulated'
                ? 'bg-success text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <CheckCircleIcon />
            Regulated ({regulatedCountries.length})
          </button>
        </div>
      ) : effectiveTab && (
        <h4 className="text-sm font-medium text-text-muted flex items-center gap-2 mb-4">
          {effectiveTab === 'restricted'
            ? <><XCircleIcon /> Restricted Countries</>
            : <><CheckCircleIcon /> Regulated Countries</>}
        </h4>
      )}

      {/* Content */}
      <div className="min-h-[200px]">
        {effectiveTab === 'restricted' && (
          <div className="space-y-4">
            {filteredRestricted.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                No restricted countries match your search
              </p>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                  {filteredRestricted.map(c => (
                    <CountryBadge key={c.country_code} country={c} type="restricted" countryLookup={countryLookup} />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  Games cannot be offered in these countries
                </p>
              </>
            )}
          </div>
        )}

        {effectiveTab === 'regulated' && (
          <div className="space-y-4">
            {filteredRegulated.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                No regulated countries match your search
              </p>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                  {filteredRegulated.map(c => (
                    <CountryBadge key={c.country_code} country={c} type="regulated" countryLookup={countryLookup} />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  Provider is licensed in these countries
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
