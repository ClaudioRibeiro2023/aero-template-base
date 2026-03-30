import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable } from './Skeleton'

describe('Skeleton', () => {
  it('renders with text variant by default', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('.ds-skeleton--text')).toBeInTheDocument()
  })

  it('applies circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />)
    expect(container.querySelector('.ds-skeleton--circular')).toBeInTheDocument()
  })

  it('applies rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />)
    expect(container.querySelector('.ds-skeleton--rectangular')).toBeInTheDocument()
  })

  it('applies rounded variant', () => {
    const { container } = render(<Skeleton variant="rounded" />)
    expect(container.querySelector('.ds-skeleton--rounded')).toBeInTheDocument()
  })

  it('applies width and height as numbers (px)', () => {
    const { container } = render(<Skeleton width={200} height={40} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('40px')
  })

  it('applies width and height as strings', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.width).toBe('50%')
    expect(el.style.height).toBe('2rem')
  })

  it('applies pulse animation by default', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('.ds-skeleton--pulse')).toBeInTheDocument()
  })

  it('applies wave animation', () => {
    const { container } = render(<Skeleton animation="wave" />)
    expect(container.querySelector('.ds-skeleton--wave')).toBeInTheDocument()
  })

  it('skips animation class when none', () => {
    const { container } = render(<Skeleton animation="none" />)
    expect(container.querySelector('.ds-skeleton--pulse')).not.toBeInTheDocument()
    expect(container.querySelector('.ds-skeleton--wave')).not.toBeInTheDocument()
  })

  it('has aria-hidden for accessibility', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})

describe('SkeletonText', () => {
  it('renders 3 lines by default', () => {
    const { container } = render(<SkeletonText />)
    expect(container.querySelectorAll('.ds-skeleton')).toHaveLength(3)
  })

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    expect(container.querySelectorAll('.ds-skeleton')).toHaveLength(5)
  })

  it('last line is shorter (60%)', () => {
    const { container } = render(<SkeletonText lines={2} />)
    const skeletons = container.querySelectorAll('.ds-skeleton') as NodeListOf<HTMLElement>
    expect(skeletons[1].style.width).toBe('60%')
  })
})

describe('SkeletonAvatar', () => {
  it('renders circular skeleton with default size 40', () => {
    const { container } = render(<SkeletonAvatar />)
    const el = container.querySelector('.ds-skeleton--circular') as HTMLElement
    expect(el).toBeInTheDocument()
    expect(el.style.width).toBe('40px')
    expect(el.style.height).toBe('40px')
  })

  it('accepts custom size', () => {
    const { container } = render(<SkeletonAvatar size={64} />)
    const el = container.querySelector('.ds-skeleton--circular') as HTMLElement
    expect(el.style.width).toBe('64px')
  })
})

describe('SkeletonCard', () => {
  it('renders card skeleton with image and text placeholders', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelector('.ds-skeleton-card')).toBeInTheDocument()
    expect(container.querySelector('.ds-skeleton--rectangular')).toBeInTheDocument()
    expect(container.querySelectorAll('.ds-skeleton').length).toBeGreaterThan(2)
  })
})

describe('SkeletonTable', () => {
  it('renders default 5 rows and 4 columns', () => {
    const { container } = render(<SkeletonTable />)
    const rows = container.querySelectorAll('.ds-skeleton-table__row')
    expect(rows).toHaveLength(6) // 1 header + 5 body rows
  })

  it('accepts custom rows and columns', () => {
    const { container } = render(<SkeletonTable rows={3} columns={2} />)
    const rows = container.querySelectorAll('.ds-skeleton-table__row')
    expect(rows).toHaveLength(4) // 1 header + 3 body rows
    // Each row has 2 skeletons
    const header = rows[0]
    expect(header.querySelectorAll('.ds-skeleton')).toHaveLength(2)
  })
})
