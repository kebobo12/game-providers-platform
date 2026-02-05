function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function InfoCircleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const typeConfig = {
  success: { Icon: CheckCircleIcon, colorClass: 'text-success', bgClass: 'bg-success/10', borderClass: 'border-success/30' },
  error: { Icon: XCircleIcon, colorClass: 'text-error', bgClass: 'bg-error/10', borderClass: 'border-error/30' },
  warning: { Icon: AlertTriangleIcon, colorClass: 'text-warning', bgClass: 'bg-warning/10', borderClass: 'border-warning/30' },
  info: { Icon: InfoCircleIcon, colorClass: 'text-info', bgClass: 'bg-info/10', borderClass: 'border-info/30' },
}

export function Toast({ type, message, removing, onDismiss }) {
  const config = typeConfig[type] || typeConfig.info
  const { Icon } = config

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm
        ${config.bgClass} ${config.borderClass}
        transition-all duration-300 ease-out
        ${removing ? 'opacity-0 translate-y-2' : 'animate-slideUp'}
      `}
    >
      <span className={`shrink-0 ${config.colorClass}`}>
        <Icon />
      </span>
      <span className="text-sm text-text flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-1 rounded text-text-muted hover:text-text transition-colors"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
