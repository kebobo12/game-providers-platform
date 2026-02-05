import { useState, useEffect } from 'react'

function ImageIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export function convertGoogleDriveUrl(rawUrl) {
  if (!rawUrl) return rawUrl
  const trimmed = rawUrl.trim()

  // Pattern: https://drive.google.com/file/d/FILE_ID/view...
  const fileMatch = trimmed.match(/^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/)
  if (fileMatch) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`
  }

  // Pattern: https://drive.google.com/open?id=FILE_ID
  const openMatch = trimmed.match(/^https?:\/\/drive\.google\.com\/open\?id=([^&]+)/)
  if (openMatch) {
    return `https://lh3.googleusercontent.com/d/${openMatch[1]}`
  }

  // Pattern: https://drive.google.com/uc?export=view&id=FILE_ID
  const ucMatch = trimmed.match(/^https?:\/\/drive\.google\.com\/uc\?.*id=([^&]+)/)
  if (ucMatch) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`
  }

  return rawUrl
}

const PREVIEW_BG_MAP = {
  dark: 'var(--color-bg)',
  light: '#f8f9fa',
}

export function LogoPreview({ url, onChange, fieldId, onDragStart, onDrop: onDropProp, previewBg }) {
  const resolvedBg = PREVIEW_BG_MAP[previewBg] || previewBg || 'var(--color-bg)'
  const [loadState, setLoadState] = useState('idle') // idle | loading | loaded | error
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    if (!url || !url.trim()) {
      setLoadState('idle')
      return
    }

    try {
      new URL(url)
    } catch {
      setLoadState('error')
      return
    }

    setLoadState('loading')
    const img = new Image()
    img.onload = () => setLoadState('loaded')
    img.onerror = () => setLoadState('error')
    img.src = url
  }, [url])

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text')
    const converted = convertGoogleDriveUrl(pasted)
    if (converted !== pasted) {
      e.preventDefault()
      onChange(converted)
    }
  }

  const handleBlur = () => {
    const converted = convertGoogleDriveUrl(url)
    if (converted !== url) {
      onChange(converted)
    }
  }

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', fieldId)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.(fieldId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const sourceField = e.dataTransfer.getData('text/plain')
    if (sourceField && sourceField !== fieldId) {
      onDropProp?.(sourceField, fieldId)
    }
  }

  return (
    <div
      className={`rounded-lg transition-all ${
        isDragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder="https://example.com/logo.png"
          className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-text placeholder-text-muted
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {url && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-2 text-sm text-text-muted hover:text-text bg-bg border border-border rounded-lg hover:border-text-muted transition-colors"
            title="Clear"
          >
            Clear
          </button>
        )}
      </div>

      {/* Preview */}
      <div
        className="mt-2 inline-flex cursor-grab active:cursor-grabbing"
        draggable={!!url}
        onDragStart={handleDragStart}
      >
        <div
          className="w-[100px] h-[60px] rounded-lg border border-border overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: resolvedBg }}
        >
          {!url && (
            <span className="text-xs text-text-muted">No logo</span>
          )}
          {url && loadState === 'loading' && (
            <div className="w-full h-full bg-bg/30 animate-pulse" />
          )}
          {url && loadState === 'loaded' && (
            <img
              src={url}
              alt="Logo preview"
              className="w-full h-full object-contain p-1"
            />
          )}
          {url && loadState === 'error' && (
            <div className="text-error opacity-60">
              <ImageIcon />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
