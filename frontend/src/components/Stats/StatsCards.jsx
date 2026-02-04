import { useStats } from '../../hooks/useStats'

function ProvidersIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
    </svg>
  )
}

function GamesIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

function StatCard({ icon, label, value, isLoading }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-text-muted">{label}</p>
        {isLoading ? (
          <div className="h-9 w-20 bg-border rounded animate-pulse mt-1" />
        ) : (
          <p className="text-3xl font-bold text-text">
            {value?.toLocaleString() ?? 0}
          </p>
        )}
      </div>
    </div>
  )
}

export function StatsCards() {
  const { stats, isLoading } = useStats()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <StatCard
        icon={<ProvidersIcon />}
        label="Total Providers"
        value={stats.total_providers}
        isLoading={isLoading}
      />
      <StatCard
        icon={<GamesIcon />}
        label="Total Games"
        value={stats.total_games}
        isLoading={isLoading}
      />
    </div>
  )
}
