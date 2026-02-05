import { useState } from 'react'

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

export function ExportButton({
  onClick,
  label = 'Export CSV',
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await onClick()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                  bg-primary/10 text-primary hover:bg-primary/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors ${className}`}
    >
      {isLoading ? <SpinnerIcon /> : <DownloadIcon />}
      {label}
    </button>
  )
}

// Utility to download CSV from data
export function downloadCSV(data, filename) {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + data], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Convert array of objects to CSV string (semicolon-delimited for Excel)
export function arrayToCSV(headers, rows) {
  const headerRow = headers.join(';')
  const dataRows = rows.map(row =>
    headers.map(h => {
      const value = row[h] ?? ''
      // Escape quotes and wrap in quotes if contains semicolon or quote
      const str = String(value)
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(';')
  )
  return [headerRow, ...dataRows].join('\r\n')
}
