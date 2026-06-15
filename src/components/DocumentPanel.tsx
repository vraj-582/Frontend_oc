import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '../types'
import { listDocuments, uploadDocument, deleteDocument } from '../services/api'

const ROLE_FOLDER: Record<string, string> = {
  employee: 'root folder',
  manager: 'manager/',
  hr: 'hr/',
  admin: 'admin/',
}

function fileExt(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

function shortName(path: string): string {
  return path.includes('/') ? path.split('/').slice(1).join('/') : path
}

function folderOf(path: string): string | null {
  const idx = path.indexOf('/')
  return idx !== -1 ? path.slice(0, idx + 1) : null
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const EXT_COLORS: Record<string, string> = {
  pdf: '#e74c3c',
  docx: '#2980b9',
  pptx: '#e67e22',
  xlsx: '#27ae60',
  txt: '#8e44ad',
}

function FileTypeTag({ ext }: { ext: string }) {
  const color = EXT_COLORS[ext] ?? 'var(--text-muted)'
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: '#fff',
        background: color,
        borderRadius: 3,
        padding: '1px 5px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        flexShrink: 0,
      }}
    >
      {ext || '?'}
    </span>
  )
}

function FolderBadge({ role }: { role: string }) {
  const label = ROLE_FOLDER[role] ?? 'root folder'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--accent)',
        background: 'rgba(108,71,240,0.12)',
        borderRadius: 5,
        padding: '2px 7px',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
      {label}
    </span>
  )
}

export function DocumentPanel({
  user,
  open,
  onClose,
}: {
  user: User
  open: boolean
  onClose: () => void
}) {
  const [documents, setDocuments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { documents: docs } = await listDocuments()
      setDocuments(docs)
    } catch {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) fetchDocs()
  }, [open, fetchDocs])

  const handleUpload = async (file: File) => {
    setError(null)
    setSuccess(null)
    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadDocument(file, setProgress)
      setSuccess(`"${file.name}" uploaded to ${result.folder}`)
      await fetchDocs()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    handleUpload(files[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDelete = async (filename: string) => {
    try {
      await deleteDocument(filename)
      setConfirmDelete(null)
      setSuccess(`"${shortName(filename)}" deleted`)
      await fetchDocs()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Delete failed')
      setConfirmDelete(null)
    }
  }

  if (!open) return null

  const isAdmin = user.role === 'admin'

  return (
    <aside
      style={{
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Document Library
          </span>
          <FolderBadge role={user.role} />
        </div>
        <button
          onClick={onClose}
          aria-label="Close document panel"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Upload zone */}
      <div style={{ padding: '12px 14px', flexShrink: 0 }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 10,
            padding: '18px 12px',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: dragOver ? 'rgba(108,71,240,0.06)' : 'var(--surface)',
            transition: 'border-color 150ms, background 150ms',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 8px', display: 'block', opacity: uploading ? 0.4 : 1 }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
            {uploading ? 'Uploading…' : 'Drop file or click to upload'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>
            PDF · DOCX · PPTX · XLSX · TXT · max 20 MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.pptx,.xlsx,.txt"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {/* Progress bar */}
        {uploading && (
          <div
            style={{
              marginTop: 8,
              height: 4,
              borderRadius: 4,
              background: 'var(--surface)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--gradient)',
                borderRadius: 4,
                transition: 'width 150ms ease',
              }}
            />
          </div>
        )}

        {/* Feedback messages */}
        {error && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#e74c3c', background: 'rgba(231,76,60,0.08)', borderRadius: 6, padding: '6px 10px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#27ae60', background: 'rgba(39,174,96,0.08)', borderRadius: 6, padding: '6px 10px' }}>
            {success}
          </div>
        )}
      </div>

      {/* Divider + doc count */}
      <div
        style={{
          padding: '0 14px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Accessible documents
        </span>
        {!loading && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {documents.length}
          </span>
        )}
        <button
          onClick={fetchDocs}
          disabled={loading}
          aria-label="Refresh"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: loading ? 'default' : 'pointer',
            padding: 2,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: loading ? 0.4 : 1 }}>
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3" />
          </svg>
        </button>
      </div>

      {/* Document list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
        {loading && (
          <div style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
            Loading…
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div style={{ padding: '24px 8px', textAlign: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 10px' }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>No documents yet</p>
            <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>Upload one above to get started</p>
          </div>
        )}

        {!loading &&
          documents.map(doc => {
            const ext = fileExt(doc)
            const name = shortName(doc)
            const folder = folderOf(doc)
            const isConfirming = confirmDelete === doc

            return (
              <div
                key={doc}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 8px',
                  borderRadius: 8,
                  marginBottom: 2,
                  background: isConfirming ? 'rgba(231,76,60,0.06)' : 'transparent',
                  border: isConfirming ? '1px solid rgba(231,76,60,0.2)' : '1px solid transparent',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { if (!isConfirming) e.currentTarget.style.background = 'var(--surface)' }}
                onMouseLeave={e => { if (!isConfirming) e.currentTarget.style.background = 'transparent' }}
              >
                <FileTypeTag ext={ext} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {folder && (
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 1 }}>
                      {folder}
                    </div>
                  )}
                  <div
                    title={name}
                    style={{
                      fontSize: 11,
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </div>
                </div>

                {isAdmin && (
                  <>
                    {isConfirming ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handleDelete(doc)}
                          style={{
                            fontSize: 9, fontWeight: 700, color: '#fff', background: '#e74c3c',
                            border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer',
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{
                            fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface)',
                            border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer',
                          }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(doc)}
                        aria-label={`Delete ${name}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 3,
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                          opacity: 0,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.color = '#e74c3c'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.opacity = '0'
                          e.currentTarget.style.color = 'var(--text-muted)'
                        }}
                        onFocus={e => { e.currentTarget.style.opacity = '1' }}
                        onBlur={e => { e.currentTarget.style.opacity = '0' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
      </div>

      {isAdmin && documents.length > 0 && (
        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>
            Hover a document to reveal the delete button
          </p>
        </div>
      )}
    </aside>
  )
}
