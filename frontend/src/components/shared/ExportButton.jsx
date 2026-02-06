import { useState } from 'react'
import { useToast } from '../../hooks/useToast'

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
  const { showSuccess, showError } = useToast()

  const handleClick = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await onClick()
      showSuccess('CSV downloaded successfully')
    } catch (err) {
      showError('Failed to export CSV')
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

// Download data as Excel file using base64-encoded HTML table
export function downloadCSV(data, filename) {
  const uri = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(data)))
  const link = document.createElement('a')
  link.href = uri
  link.download = `${filename}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Convert array of objects to an HTML table string for Excel
export function arrayToCSV(headers, rows) {
  const esc = (val) => String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const style = `
    <style>
      table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
      th, td { border: 1px solid #D0D0D0; padding: 6px 10px; text-align: left; }
      th { background-color: #4472C4; color: #FFFFFF; font-weight: bold; }
      tr:nth-child(even) td { background-color: #F2F2F2; }
    </style>`
  const ths = headers.map(h => `<th>${esc(h)}</th>`).join('')
  const trs = rows.map(row =>
    '<tr>' + headers.map(h => `<td>${esc(row[h])}</td>`).join('') + '</tr>'
  ).join('')
  return `<html><head><meta charset="utf-8">${style}</head><body><table><tr>${ths}</tr>${trs}</table></body></html>`
}
