import { useEffect } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { selectUser } from '@/app/store/slices/auth-slice/selectors';

// Replace with your server URL
const SERVER_ORIGIN =
  import.meta.env.VITE_PUSH_SERVER_ORIGIN || 'http://localhost:4000';

async function getPublicKey(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(`${SERVER_ORIGIN}/vapid-public-key`);
    const base64 = await res.text();
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64Safe);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
  } catch {
    return null;
  }
}

async function subscribeToPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const key = await getPublicKey();
    if (!key) return;
    const appServerKey = key.buffer.slice(
      key.byteOffset,
      key.byteOffset + key.byteLength
    ) as ArrayBuffer;
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey
    });
  }
  try {
    const res = await fetch(`${SERVER_ORIGIN}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    if (!res.ok) {
      // Surface server error in console to aid debugging
      const txt = await res.text().catch(() => '');

      console.error('[push] subscribe failed', res.status, txt);
    }
  } catch (e) {
    console.error('[push] subscribe network error', e);
  }
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // Only prompt authenticated users for push notifications
    if (!user?.id) return;

    // iOS 26+ requires that Notification.requestPermission() is called
    // synchronously within the user gesture handler (no async ops before it)
    const handler = () => {
      if (!('Notification' in window)) return;

      try {
        if (Notification.permission === 'default') {
          // MUST call requestPermission() synchronously to preserve user gesture on iOS 26+
          Notification.requestPermission().then((result) => {
            if (result === 'granted') {
              subscribeToPush();
            }
          });
        } else if (Notification.permission === 'granted') {
          subscribeToPush();
        }
      } catch {
        // Ignore errors
      }
    };

    // Use once:true to automatically remove listeners after first trigger
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchend', handler, { once: true });

    // As a fallback, try after load if already granted
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      subscribeToPush();
    }

    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchend', handler);
    };
  }, [user?.id]);

  return <>{children}</>;
}
