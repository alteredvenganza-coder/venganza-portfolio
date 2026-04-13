import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function urlB64ToUint8(b64) {
  const pad  = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw  = window.atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function usePush() {
  // 'unsupported' | 'idle' | 'requesting' | 'subscribed' | 'denied'
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !VAPID_KEY) {
      setStatus('unsupported'); return;
    }
    if (Notification.permission === 'denied') { setStatus('denied'); return; }
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(s => { if (s) setStatus('subscribed'); })
      );
    }
  }, []);

  async function subscribe() {
    setStatus('requesting');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setStatus('denied'); return false; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlB64ToUint8(VAPID_KEY),
      });

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/subscribe-push', {
        method:  'POST',
        headers: {
          'content-type':  'application/json',
          'authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      if (!res.ok) throw new Error(await res.text());
      setStatus('subscribed');
      return true;
    } catch (err) {
      console.error('[push] subscribe error:', err);
      setStatus('idle');
      return false;
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      setStatus('idle');
    } catch (err) {
      console.error('[push] unsubscribe error:', err);
    }
  }

  return { status, subscribe, unsubscribe, supported: status !== 'unsupported' };
}
