/**
 * Service Worker Registration — Sprint 37 PWA
 * Registers the service worker and handles updates.
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            console.warn('[SW] New version available — refresh to update')
          }
        })
      }
    })

    console.warn('[SW] Registered successfully, scope:', registration.scope)
    return registration
  } catch (error) {
    console.error('[SW] Registration failed:', error)
    return null
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false

  const registration = await navigator.serviceWorker.getRegistration()
  if (registration) {
    return registration.unregister()
  }
  return false
}
