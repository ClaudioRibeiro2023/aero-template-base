'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'

export function SatisfactionRating({
  onRate,
  isPending,
}: {
  onRate: (rating: number, comment: string) => void
  isPending: boolean
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) return
    onRate(rating, comment)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-4 space-y-3">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Avalie o atendimento</h3>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-colors"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            <Star
              size={20}
              className={
                star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
              }
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Comentário (opcional)"
        rows={2}
        className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/30 transition-colors resize-none"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || rating < 1}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        Enviar Avaliação
      </button>
    </form>
  )
}
