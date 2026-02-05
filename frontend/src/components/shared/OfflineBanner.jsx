import { useState, useEffect, useRef } from 'react'
import { useToast } from '../../hooks/useToast'

function WifiOffIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  )
}

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const wasOfflineRef = useRef(false)
  const { showSuccess } = useToast()

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true)
      wasOfflineRef.current = true
    }

    const handleOnline = () => {
      setIsOffline(false)
      if (wasOfflineRef.current) {
        showSuccess("You're back online")
        wasOfflineRef.current = false
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [showSuccess])

  if (!isOffline) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-warning/10 border-b border-warning/30 px-4 py-2 text-center">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-warning">
        <WifiOffIcon />
        You're offline — some features may not work
      </span>
    </div>
  )
}
