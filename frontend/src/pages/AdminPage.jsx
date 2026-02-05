import { useState } from 'react'
import { SyncCard } from '../components/Admin/SyncCard'
import { DbStatsCard } from '../components/Admin/DbStatsCard'
import { ImportCard } from '../components/Admin/ImportCard'
import { ProvidersTable } from '../components/Admin/ProvidersTable'
import { ProviderDetail } from '../components/Admin/ProviderDetail'

export default function AdminPage() {
  const [selectedProvider, setSelectedProvider] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Admin Dashboard</h1>
      </div>

      {/* Operations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SyncCard />
        <DbStatsCard />
        <ImportCard />
      </div>

      {/* Data Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Providers Table */}
        <div className="lg:col-span-1">
          <ProvidersTable
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
          />
        </div>

        {/* Provider Detail */}
        <div className="lg:col-span-2">
          {selectedProvider ? (
            <ProviderDetail
              providerId={selectedProvider}
              onClose={() => setSelectedProvider(null)}
            />
          ) : (
            <div className="bg-surface border border-border rounded-lg p-8 text-center">
              <div className="text-text-muted">
                Select a provider from the list to view and manage details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
