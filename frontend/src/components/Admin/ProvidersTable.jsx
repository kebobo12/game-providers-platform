import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api/client'
import { FormModal, FormField, TextInput, Select } from './FormModal'
import { ConfirmDialog } from './ConfirmDialog'
import { LogoPreview } from './LogoPreview'
import { useTheme } from '../../hooks/useTheme'

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
]

const CURRENCY_MODE_OPTIONS = [
  { value: 'ALL_FIAT', label: 'All Fiat' },
  { value: 'LIST', label: 'List (specific currencies)' },
]

export function ProvidersTable({ selectedProvider, onSelectProvider }) {
  const { isDark } = useTheme()
  const [providers, setProviders] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [formData, setFormData] = useState({
    provider_name: '',
    logo_url_dark: '',
    logo_url_light: '',
    status: 'DRAFT',
    currency_mode: 'ALL_FIAT',
  })
  const [isSaving, setIsSaving] = useState(false)

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProviders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const data = await api.get(`/admin/providers/${params}`)
      setProviders(data)
    } catch (err) {
      setError(err.message || 'Failed to load providers')
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(fetchProviders, 300)
    return () => clearTimeout(timeout)
  }, [fetchProviders])

  const openCreateForm = () => {
    setEditingProvider(null)
    setFormData({
      provider_name: '',
      logo_url_dark: '',
      logo_url_light: '',
      status: 'DRAFT',
      currency_mode: 'ALL_FIAT',
    })
    setIsFormOpen(true)
  }

  const openEditForm = (provider, e) => {
    e.stopPropagation()
    setEditingProvider(provider)
    setFormData({
      provider_name: provider.provider_name,
      logo_url_dark: provider.logo_url_dark || '',
      logo_url_light: provider.logo_url_light || '',
      status: provider.status,
      currency_mode: provider.currency_mode,
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.provider_name.trim()) return

    setIsSaving(true)
    try {
      if (editingProvider) {
        await api.put(`/admin/providers/${editingProvider.id}/`, formData)
      } else {
        await api.post('/admin/providers/', formData)
      }
      setIsFormOpen(false)
      fetchProviders()
    } catch (err) {
      alert(err.message || 'Failed to save provider')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await api.delete(`/admin/providers/${deleteTarget.id}/`)
      setDeleteTarget(null)
      if (selectedProvider === deleteTarget.id) {
        onSelectProvider(null)
      }
      fetchProviders()
    } catch (err) {
      alert(err.message || 'Failed to delete provider')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-text">Providers</h3>
          <button
            onClick={openCreateForm}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            title="Add provider"
          >
            <PlusIcon />
          </button>
        </div>
        <div className="relative">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-input-border rounded-lg text-sm text-text placeholder-text-muted
                       focus:outline-none focus:border-primary transition-colors"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[500px] overflow-y-auto">
        {error ? (
          <div className="p-4 text-sm text-error">{error}</div>
        ) : isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-bg rounded animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="p-4 text-sm text-text-muted text-center">
            No providers found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => onSelectProvider(provider.id)}
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors
                           ${selectedProvider === provider.id ? 'bg-primary/10' : 'hover:bg-muted-bg'}`}
              >
                {(provider.logo_url_dark || provider.logo_url_light) && (
                  <img
                    src={isDark
                      ? (provider.logo_url_dark || provider.logo_url_light)
                      : (provider.logo_url_light || provider.logo_url_dark)}
                    alt=""
                    className="w-8 h-8 rounded object-contain flex-shrink-0 bg-checkerboard"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text truncate">
                    {provider.provider_name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {provider.game_count} games · {provider.status}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => openEditForm(provider, e)}
                    className="p-1.5 text-text-muted hover:text-text hover:bg-surface rounded transition-colors"
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(provider)
                    }}
                    className="p-1.5 text-text-muted hover:text-error hover:bg-surface rounded transition-colors"
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        title={editingProvider ? 'Edit Provider' : 'Add Provider'}
        isLoading={isSaving}
        size="lg"
      >
        <FormField label="Provider Name" required>
          <TextInput
            value={formData.provider_name}
            onChange={(v) => setFormData({ ...formData, provider_name: v })}
            placeholder="e.g., Pragmatic Play"
          />
        </FormField>
        <FormField label="Logo URL (Dark Theme)">
          <LogoPreview
            url={formData.logo_url_dark}
            onChange={(v) => setFormData({ ...formData, logo_url_dark: v })}
            fieldId="logo_url_dark"
            previewBg="dark"
            onDrop={(src, tgt) => {
              if ((src === 'logo_url_dark' && tgt === 'logo_url_light') || (src === 'logo_url_light' && tgt === 'logo_url_dark')) {
                setFormData({ ...formData, logo_url_dark: formData.logo_url_light, logo_url_light: formData.logo_url_dark })
              }
            }}
          />
        </FormField>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, logo_url_dark: formData.logo_url_light, logo_url_light: formData.logo_url_dark })}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-text-muted hover:text-primary bg-bg border border-border rounded-full hover:border-primary transition-colors"
            title="Swap dark and light logos"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Swap
          </button>
        </div>
        <FormField label="Logo URL (Light Theme)">
          <LogoPreview
            url={formData.logo_url_light}
            onChange={(v) => setFormData({ ...formData, logo_url_light: v })}
            fieldId="logo_url_light"
            previewBg="light"
            onDrop={(src, tgt) => {
              if ((src === 'logo_url_dark' && tgt === 'logo_url_light') || (src === 'logo_url_light' && tgt === 'logo_url_dark')) {
                setFormData({ ...formData, logo_url_dark: formData.logo_url_light, logo_url_light: formData.logo_url_dark })
              }
            }}
          />
        </FormField>
        <p className="text-xs text-text-muted">If only one logo is provided, it will be used for both themes.</p>
        <FormField label="Status">
          <Select
            value={formData.status}
            onChange={(v) => setFormData({ ...formData, status: v })}
            options={STATUS_OPTIONS}
          />
        </FormField>
        <FormField label="Currency Mode">
          <Select
            value={formData.currency_mode}
            onChange={(v) => setFormData({ ...formData, currency_mode: v })}
            options={CURRENCY_MODE_OPTIONS}
          />
        </FormField>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Provider"
        message={`Are you sure you want to delete "${deleteTarget?.provider_name}"? This will also delete all associated games, currencies, and restrictions.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
