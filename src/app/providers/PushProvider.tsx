import { useEffect } from 'react'

// Replace with your server URL
const SERVER_ORIGIN =
  import.meta.env.VITE_PUSH_SERVER_ORIGIN || 'http://localhost:4000'

async function getPublicKey(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(`${SERVER_ORIGIN}/vapid-public-key`)
    const base64 = await res.text()
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64Safe)
    const output = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
    return output
  } catch {
    return null
  }
}

async function subscribeToPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    const key = await getPublicKey()
    if (!key) return
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      // Pass Uint8Array directly (BufferSource)
      applicationServerKey: key as unknown as Uint8Array
    })
  }
  try {
    const res = await fetch(`${SERVER_ORIGIN}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    })
    if (!res.ok) {
      // Surface server error in console to aid debugging
      const txt = await res.text().catch(() => '')
      // eslint-disable-next-line no-console
      console.error('[push] subscribe failed', res.status, txt)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[push] subscribe network error', e)
  }
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // iOS Safari requires a user gesture to show the permission prompt reliably
    const handler = async () => {
      try {
        if ('Notification' in window && Notification.permission === 'default') {
          const result = await Notification.requestPermission()
          if (result === 'granted') {
            await subscribeToPush()
          }
        } else if (Notification.permission === 'granted') {
          await subscribeToPush()
        }
      } catch {}
      window.removeEventListener('click', handler)
      window.removeEventListener('touchend', handler)
    }
    window.addEventListener('click', handler, { once: true })
    window.addEventListener('touchend', handler, { once: true })

    // As a fallback, try after load if already granted
    ;(async () => {
      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        await subscribeToPush()
      }
    })()
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('touchend', handler)
    }
  }, [])

  return <>{children}</>
}
