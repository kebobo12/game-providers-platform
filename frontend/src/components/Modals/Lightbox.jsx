import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

function XIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function Lightbox({
  isOpen,
  onClose,
  imageSrc,
  title,
}) {
  // Handle Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !imageSrc) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Close"
      >
        <XIcon />
      </button>

      {/* Image container */}
      <div className="relative max-w-4xl max-h-[85vh] animate-slideUp">
        <img
          src={imageSrc}
          alt={title || 'Preview'}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />

        {/* Title */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
            <p className="text-white text-center font-medium">{title}</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
