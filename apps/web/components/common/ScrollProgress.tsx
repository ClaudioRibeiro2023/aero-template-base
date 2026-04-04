'use client'

import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = main
      const pct =
        scrollHeight <= clientHeight ? 0 : (scrollTop / (scrollHeight - clientHeight)) * 100
      ref.current?.style.setProperty('--scroll-pct', `${pct}%`)
    }

    main.addEventListener('scroll', update, { passive: true })
    update()
    return () => main.removeEventListener('scroll', update)
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
