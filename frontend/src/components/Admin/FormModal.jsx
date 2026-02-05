import { useEffect } from 'react'
import { createPortal } from 'react-dom'

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = 'Save',
  isLoading = false,
  size = 'default', // 'default' | 'lg' | 'xl'
}) {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    default: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[--color-backdrop] backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full ${sizeClasses[size]} bg-surface border border-border rounded-lg shadow-xl animate-slideUp`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text rounded transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {children}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-bg/50 border-t border-border rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:border-text-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// Reusable form field components
export function FormField({ label, required, children, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, ...props }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text placeholder-text-muted
                 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      {...props}
    />
  )
}

export function TextArea({ value, onChange, placeholder, rows = 3, ...props }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text placeholder-text-muted
                 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
      {...props}
    />
  )
}

export function Select({ value, onChange, options, placeholder, ...props }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text
                 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
