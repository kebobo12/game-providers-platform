import { useState, useRef, useEffect, useMemo } from 'react'

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  multiple = false,
  placeholder,
  isLoading = false,
  hideLabel = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])
  const selectedCount = selectedValues.length

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const filteredOptions = useMemo(() => {
    if (!search) return options.slice(0, 100)
    const searchLower = search.toLowerCase()
    return options
      .filter(opt => {
        const label = typeof opt === 'string' ? opt : opt.label
        return label.toLowerCase().includes(searchLower)
      })
      .slice(0, 100)
  }, [options, search])

  const handleSelect = (optValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(optValue)) {
        onChange(currentValues.filter(v => v !== optValue))
      } else {
        onChange([...currentValues, optValue])
      }
    } else {
      onChange(optValue === value ? '' : optValue)
      setIsOpen(false)
      setSearch('')
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          const opt = filteredOptions[focusedIndex]
          const optValue = typeof opt === 'string' ? opt : opt.value
          handleSelect(optValue)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearch('')
        break
    }
  }

  const displayLabel = useMemo(() => {
    if (selectedCount === 0) return placeholder || `Select ${label.toLowerCase()}...`
    if (!multiple) {
      const selected = options.find(opt => {
        const optValue = typeof opt === 'string' ? opt : opt.value
        return optValue === value
      })
      return selected ? (typeof selected === 'string' ? selected : selected.label) : value
    }
    if (selectedCount === 1) {
      const selected = options.find(opt => {
        const optValue = typeof opt === 'string' ? opt : opt.value
        return optValue === selectedValues[0]
      })
      return selected ? (typeof selected === 'string' ? selected : selected.label) : selectedValues[0]
    }
    return `${selectedCount} selected`
  }, [selectedCount, options, value, selectedValues, multiple, placeholder, label])

  const showSearch = options.length > 10

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="w-full flex items-center gap-2 px-3 h-11 bg-surface border border-input-border rounded-lg hover:border-primary transition-colors min-w-[140px] text-left disabled:opacity-50"
      >
        {!hideLabel && (
          <span className="text-xs text-text-muted uppercase tracking-wide shrink-0">{label}</span>
        )}
        <span className="text-sm text-text truncate flex-1">{displayLabel}</span>
        {selectedCount > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full shrink-0">
            {selectedCount}
          </span>
        )}
        <span className={`shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
          {showSearch && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">
                  <SearchIcon />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setFocusedIndex(-1)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-surface border border-input-border rounded text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-text-muted text-sm">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-text-muted text-sm">No options found</div>
            ) : (
              filteredOptions.map((opt, index) => {
                const optValue = typeof opt === 'string' ? opt : opt.value
                const optLabel = typeof opt === 'string' ? opt : opt.label
                const isSelected = selectedValues.includes(optValue)
                const isFocused = index === focusedIndex

                return (
                  <button
                    key={optValue}
                    type="button"
                    onClick={() => handleSelect(optValue)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors
                      ${isFocused ? 'bg-primary/10' : 'hover:bg-muted-bg'}
                      ${isSelected ? 'text-primary' : 'text-text'}
                    `}
                  >
                    {multiple && (
                      <span className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary text-white' : 'border-border'}`}>
                        {isSelected && <CheckIcon />}
                      </span>
                    )}
                    <span className="truncate">{optLabel}</span>
                    {!multiple && isSelected && (
                      <span className="ml-auto text-primary shrink-0">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
