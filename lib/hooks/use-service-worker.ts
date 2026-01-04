'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true)

      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })

          setIsRegistered(true)
          console.log('[App] Service Worker registered successfully')

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New service worker is ready
                setHasUpdate(true)
                console.log('[App] Service Worker update available')
              }
            })
          })

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000) // Check every minute
        } catch (error) {
          console.error('[App] Service Worker registration failed:', error)
          setIsRegistered(false)
        }
      }

      // Register on mount
      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
        return () => window.removeEventListener('load', registerSW)
      }
    }
  }, [])

  const clearCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
      })
      console.log('[App] Cache cleared')
    }
  }

  const updateServiceWorker = async () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING',
      })
      window.location.reload()
    }
  }

  return {
    isSupported,
    isRegistered,
    hasUpdate,
    clearCache,
    updateServiceWorker,
  }
}
