import { useState, useCallback, useRef } from 'react'
import { ToastContext } from '../../hooks/useToast'
import { Toast } from './Toast'

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const removeToast = useCallback((id) => {
    // Mark as removing to trigger exit animation
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
  }, [])

  const showToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, type, message, removing: false }])

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => removeToast(id), duration)
    }

    return id
  }, [removeToast])

  const showSuccess = useCallback(
    (message, duration) => showToast({ type: 'success', message, duration }),
    [showToast]
  )

  const showError = useCallback(
    (message, duration) => showToast({ type: 'error', message, duration }),
    [showToast]
  )

  const showWarning = useCallback(
    (message, duration) => showToast({ type: 'warning', message, duration }),
    [showToast]
  )

  const showInfo = useCallback(
    (message, duration) => showToast({ type: 'info', message, duration }),
    [showToast]
  )

  const value = { showToast, showSuccess, showError, showWarning, showInfo }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                type={toast.type}
                message={toast.message}
                removing={toast.removing}
                onDismiss={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
