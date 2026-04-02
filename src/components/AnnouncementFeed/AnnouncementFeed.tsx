import { useState, useEffect, useCallback } from 'react'
import { FiHeart, FiMessageCircle } from 'react-icons/fi'
import {
  getAnnouncementFeed,
  toggleAnnouncementLike,
  getAnnouncementComments,
  addAnnouncementComment,
  deleteAnnouncementComment,
} from '../../services/announcementService'
import type { Announcement, AnnouncementComment } from '../../services/announcementService'
import { useAuth } from '../../contexts/AuthContext'
import './AnnouncementFeed.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${UPLOAD_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

function AnnouncementCard({ a, onLike, onRefresh }: {
  a: Announcement
  onLike: (id: number) => void
  onRefresh: () => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<AnnouncementComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const loadComments = useCallback(async () => {
    if (!showComments) return
    try {
      const list = await getAnnouncementComments(a.id)
      setComments(list)
    } catch {
      setComments([])
    }
  }, [a.id, showComments])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await addAnnouncementComment(a.id, newComment.trim())
      setNewComment('')
      loadComments()
      onRefresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteAnnouncementComment(a.id, commentId)
      loadComments()
      onRefresh()
    } catch {
      void 0
    }
  }

  return (
    <article className="announcement-card">
      <h3 className="announcement-card-title">{a.title}</h3>
      {a.type === 'IMAGE' && a.imagePath && (
        <div className="announcement-card-image">
          <img src={getImageUrl(a.imagePath) ?? ''} alt={a.title} />
        </div>
      )}
      {a.content && (
        <div className="announcement-card-content">{a.content}</div>
      )}
      <footer className="announcement-card-footer">
        <div className="announcement-card-actions">
          <button
            type="button"
            onClick={() => user && onLike(a.id)}
            className={`announcement-btn-like ${a.likedByCurrentUser ? 'liked' : ''}`}
            disabled={!user}
            title={a.likedByCurrentUser ? 'Descurtir' : 'Curtir'}
          >
            <FiHeart size={18} fill={a.likedByCurrentUser ? 'currentColor' : 'none'} />
            <span>{a.likeCount > 0 ? a.likeCount : 'Curtir'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="announcement-btn-comment"
            title="Comentários"
          >
            <FiMessageCircle size={18} />
            <span>{a.commentCount > 0 ? a.commentCount : 'Comentar'}</span>
          </button>
        </div>
        <span className="announcement-card-date">
          {new Date(a.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </footer>
      {showComments && (
        <div className="announcement-comments">
          {user && (
            <form onSubmit={handleAddComment} className="announcement-comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="announcement-comment-input"
                disabled={isSubmitting}
              />
              <button type="submit" className="announcement-comment-submit" disabled={isSubmitting || !newComment.trim()}>
                Enviar
              </button>
            </form>
          )}
          <ul className="announcement-comments-list">
            {comments.map((c) => (
              <li key={c.id} className="announcement-comment-item">
                <strong>{c.user.name}</strong>
                <span>{c.content}</span>
                {user?.id === c.user.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    className="announcement-comment-delete"
                  >
                    Excluir
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAnnouncementFeed()
      setAnnouncements(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar avisos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLike = useCallback(async (id: number) => {
    try {
      await toggleAnnouncementLike(id)
      fetchFeed()
    } catch {
      void 0
    }
  }, [fetchFeed])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  if (isLoading) {
    return (
      <div className="announcement-feed">
        <div className="announcement-feed-loading">
          <div className="loading-spinner-sm"></div>
          <span>Carregando avisos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="announcement-feed">
        <div className="announcement-feed-error">
          <p>{error}</p>
          <button onClick={fetchFeed} className="btn-retry">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="announcement-feed">
        <div className="announcement-feed-empty">
          <p>Nenhum aviso no momento.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="announcement-feed">
      <h2 className="announcement-feed-title">Avisos</h2>
      <div className="announcement-feed-list">
        {announcements.map((a) => (
          <AnnouncementCard
            key={a.id}
            a={a}
            onLike={handleLike}
            onRefresh={fetchFeed}
          />
        ))}
      </div>
    </section>
  )
}
