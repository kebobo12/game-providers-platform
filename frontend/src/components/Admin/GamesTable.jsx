import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api/client'
import { FormModal, FormField, TextInput, Select } from './FormModal'
import { ConfirmDialog } from './ConfirmDialog'

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

const VOLATILITY_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium Low' },
  { value: '3', label: 'Medium' },
  { value: '4', label: 'Medium High' },
  { value: '5', label: 'High' },
]

const VOLATILITY_LABELS = {
  '1': 'Low',
  '2': 'Medium Low',
  '3': 'Medium',
  '4': 'Medium High',
  '5': 'High',
}

const GAME_TYPE_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'Slots', label: 'Slots' },
  { value: 'Live', label: 'Live' },
  { value: 'Table', label: 'Table' },
  { value: 'Crash', label: 'Crash' },
  { value: 'Virtual', label: 'Virtual' },
  { value: 'Other', label: 'Other' },
]

export function GamesTable({ providerId, providerName }) {
  const [games, setGames] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [formData, setFormData] = useState({
    game_title: '',
    game_type: '',
    rtp: '',
    volatility: '',
    platform: '',
    thumbnail: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchGames = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = `/admin/games/?provider=${providerId}`
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }
      const data = await api.get(url)
      setGames(data)
    } catch (err) {
      setError(err.message || 'Failed to load games')
    } finally {
      setIsLoading(false)
    }
  }, [providerId, search])

  useEffect(() => {
    const timeout = setTimeout(fetchGames, 300)
    return () => clearTimeout(timeout)
  }, [fetchGames])

  const openCreateForm = () => {
    setEditingGame(null)
    setFormData({
      game_title: '',
      game_type: '',
      rtp: '',
      volatility: '',
      platform: '',
      thumbnail: '',
    })
    setIsFormOpen(true)
  }

  const openEditForm = (game) => {
    setEditingGame(game)
    setFormData({
      game_title: game.game_title || '',
      game_type: game.game_type || '',
      rtp: game.rtp || '',
      volatility: game.volatility ? String(game.volatility) : '',
      platform: game.platform || '',
      thumbnail: game.thumbnail || '',
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.game_title.trim()) return

    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        rtp: formData.rtp ? parseFloat(formData.rtp) : null,
        provider: providerId,
      }

      if (editingGame) {
        await api.put(`/admin/games/${editingGame.id}/`, payload)
      } else {
        await api.post('/admin/games/', payload)
      }
      setIsFormOpen(false)
      fetchGames()
    } catch (err) {
      alert(err.message || 'Failed to save game')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await api.delete(`/admin/games/${deleteTarget.id}/`)
      setDeleteTarget(null)
      fetchGames()
    } catch (err) {
      alert(err.message || 'Failed to delete game')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-input-border rounded-lg text-sm text-text placeholder-text-muted
                       focus:outline-none focus:border-primary transition-colors"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon />
          </div>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
        >
          <PlusIcon />
          Add Game
        </button>
      </div>

      {/* Table */}
      {error ? (
        <div className="p-4 text-sm text-error">{error}</div>
      ) : isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-bg rounded animate-pulse" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="p-8 text-center text-text-muted">
          No games found for this provider
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">RTP</th>
                <th className="pb-2 font-medium">Volatility</th>
                <th className="pb-2 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-muted-bg">
                  <td className="py-2 text-text">{game.game_title}</td>
                  <td className="py-2 text-text-muted">{game.game_type || '-'}</td>
                  <td className="py-2 text-text-muted">{game.rtp ? `${game.rtp}%` : '-'}</td>
                  <td className="py-2 text-text-muted">{VOLATILITY_LABELS[game.volatility] || game.volatility || '-'}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(game)}
                        className="p-1.5 text-text-muted hover:text-text hover:bg-surface rounded transition-colors"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(game)}
                        className="p-1.5 text-text-muted hover:text-error hover:bg-surface rounded transition-colors"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {games.length >= 500 && (
            <div className="mt-2 text-xs text-text-muted text-center">
              Showing first 500 games. Use search to find specific games.
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        title={editingGame ? 'Edit Game' : 'Add Game'}
        isLoading={isSaving}
        size="lg"
      >
        <FormField label="Game Title" required>
          <TextInput
            value={formData.game_title}
            onChange={(v) => setFormData({ ...formData, game_title: v })}
            placeholder="e.g., Sweet Bonanza"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Game Type">
            <Select
              value={formData.game_type}
              onChange={(v) => setFormData({ ...formData, game_type: v })}
              options={GAME_TYPE_OPTIONS}
            />
          </FormField>
          <FormField label="Platform">
            <TextInput
              value={formData.platform}
              onChange={(v) => setFormData({ ...formData, platform: v })}
              placeholder="e.g., desktop, mobile"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="RTP (%)">
            <TextInput
              type="number"
              step="0.01"
              value={formData.rtp}
              onChange={(v) => setFormData({ ...formData, rtp: v })}
              placeholder="e.g., 96.5"
            />
          </FormField>
          <FormField label="Volatility">
            <Select
              value={formData.volatility}
              onChange={(v) => setFormData({ ...formData, volatility: v })}
              options={VOLATILITY_OPTIONS}
            />
          </FormField>
        </div>
        <FormField label="Thumbnail URL">
          <TextInput
            value={formData.thumbnail}
            onChange={(v) => setFormData({ ...formData, thumbnail: v })}
            placeholder="https://..."
          />
        </FormField>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Game"
        message={`Are you sure you want to delete "${deleteTarget?.game_title}"?`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
