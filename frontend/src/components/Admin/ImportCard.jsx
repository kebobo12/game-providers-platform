import { useState, useRef } from 'react'
import { api, ApiError } from '../../api/client'
import { useToast } from '../../hooks/useToast'

function UploadIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

export function ImportCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const { showSuccess, showError } = useToast()

  const handleFile = async (file) => {
    if (!file) return

    const validTypes = ['.csv', '.xlsx', '.xls']
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!validTypes.includes(ext)) {
      setError('Please upload a .csv or .xlsx file')
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/import/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRFToken': document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1] || '',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Import failed')
      }

      setResult(data)
      showSuccess(`Imported ${data.imported} providers`)
    } catch (err) {
      const msg = err.message || 'Import failed'
      setError(msg)
      showError(msg)
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-success/10 rounded-lg text-success">
          <UploadIcon />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text">Import from File</h3>
          <p className="text-sm text-text-muted mt-0.5">
            Upload .csv or .xlsx to import providers
          </p>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                    transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-text-muted">
            <SpinnerIcon />
            Importing...
          </div>
        ) : (
          <div className="text-sm text-text-muted">
            Drag & drop file here or click to browse
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      {result && (
        <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg text-sm">
          <div className="font-medium text-success">Import Complete</div>
          <div className="text-text-muted mt-1">
            Imported: {result.imported} | Skipped: {result.skipped}
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-2 text-xs text-text-muted">
              {result.errors.slice(0, 3).map((e, i) => (
                <div key={i}>{e}</div>
              ))}
              {result.errors.length > 3 && (
                <div>...and {result.errors.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-error/10 border border-error/30 rounded-lg text-sm">
          <div className="font-medium text-error">Import Failed</div>
          <div className="text-text-muted mt-1">{error}</div>
        </div>
      )}
    </div>
  )
}
