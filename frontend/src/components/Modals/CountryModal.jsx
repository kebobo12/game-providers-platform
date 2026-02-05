import { useState, useMemo } from 'react'
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

// Simple ISO2 to emoji flag conversion
function getFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return '🏳️'
  const codePoints = [...iso2.toUpperCase()].map(c => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function CountryBadge({ country, type }) {
  const iso2 = country.country_code?.substring(0, 2) || country.country_code
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${
      type === 'restricted'
        ? 'bg-error/10 text-error'
        : 'bg-primary/10 text-primary'
    }`}>
      <span>{getFlag(iso2)}</span>
      <span>{iso2}</span>
    </span>
  )
}

export function CountryModal({ isOpen, onClose, provider }) {
  const [activeTab, setActiveTab] = useState('restricted')
  const [searchTerm, setSearchTerm] = useState('')

  const restrictions = provider?.restrictions ?? []
  const restrictedCountries = restrictions.filter(r => r.restriction_type === 'RESTRICTED')
  const regulatedCountries = restrictions.filter(r => r.restriction_type === 'REGULATED')

  // Filter countries by search term
  const filteredRestricted = useMemo(() => {
    if (!searchTerm) return restrictedCountries
    const term = searchTerm.toLowerCase()
    return restrictedCountries.filter(c =>
      c.country_code.toLowerCase().includes(term)
    )
  }, [restrictedCountries, searchTerm])

  const filteredRegulated = useMemo(() => {
    if (!searchTerm) return regulatedCountries
    const term = searchTerm.toLowerCase()
    return regulatedCountries.filter(c =>
      c.country_code.toLowerCase().includes(term)
    )
  }, [regulatedCountries, searchTerm])

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
          className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg
                     text-text placeholder-text-muted
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('restricted')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'restricted'
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
          onClick={() => setActiveTab('regulated')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'regulated'
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
      <div className="min-h-[200px]">
        {activeTab === 'restricted' && (
          <div className="space-y-4">
            {filteredRestricted.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                {searchTerm ? 'No restricted countries match your search' : 'No restricted countries'}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {filteredRestricted.map(c => (
                    <CountryBadge key={c.country_code} country={c} type="restricted" />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  ⚠️ Games cannot be offered in these countries
                </p>
              </>
            )}
          </div>
        )}

        {activeTab === 'regulated' && (
          <div className="space-y-4">
            {filteredRegulated.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                {searchTerm ? 'No regulated countries match your search' : 'No regulated countries'}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {filteredRegulated.map(c => (
                    <CountryBadge key={c.country_code} country={c} type="regulated" />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  ℹ️ Games can be offered but must comply with local regulations
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
