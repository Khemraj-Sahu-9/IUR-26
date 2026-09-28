/**
 * connectivityService.ts
 *
 * Detects and broadcasts online/offline state.
 * 
 * Why not rely on navigator.onLine alone?
 *   navigator.onLine can be true even when the device has no real internet
 *   (e.g. connected to a hotspot with no backhaul). We do a lightweight
 *   HEAD probe to confirm reachability.
 *
 * Usage:
 *   connectivityService.isOnline()          → boolean (cached)
 *   connectivityService.addListener(fn)     → subscription
 *   connectivityService.removeListener(fn)  → cleanup
 *   connectivityService.probe()             → Promise<boolean>
 */

type ConnectivityListener = (online: boolean) => void;

const SUPABASE_BASE = import.meta.env.VITE_SUPABASE_URL || 'https://llvnlbhpxruhnbbhphbb.supabase.co';
const PROBE_URL = `${SUPABASE_BASE.replace(/\/$/, '')}/rest/v1/`;
const PROBE_TIMEOUT_MS = 5000;
const DEBOUNCE_MS = 2000;

class ConnectivityService {
  private _isOnline: boolean = navigator.onLine;
  private _listeners: Set<ConnectivityListener> = new Set();
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    window.addEventListener('online', () => this._handleChange(true));
    window.addEventListener('offline', () => this._handleChange(false));
  }

  /** Cached online state — updated on every probe or browser event */
  isOnline(): boolean {
    return this._isOnline;
  }

  /** Add a listener called whenever online state changes */
  addListener(fn: ConnectivityListener): void {
    this._listeners.add(fn);
  }

  /** Remove a previously registered listener */
  removeListener(fn: ConnectivityListener): void {
    this._listeners.delete(fn);
  }

  /**
   * Perform a lightweight network probe.
   * Returns true if the server is actually reachable.
   */
  async probe(): Promise<boolean> {
    if (!navigator.onLine) {
      this._update(false);
      return false;
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
      const resp = await fetch(PROBE_URL, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      const online = resp.ok || resp.status === 401; // 401 = server reachable but needs auth
      this._update(online);
      return online;
    } catch {
      this._update(false);
      return false;
    }
  }

  private _handleChange(online: boolean) {
    // Debounce flapping connections (e.g. switching wifi)
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      if (online) {
        // Confirm with a real probe before declaring online
        this.probe();
      } else {
        this._update(false);
      }
    }, DEBOUNCE_MS);
  }

  private _update(online: boolean) {
    if (this._isOnline === online) return;
    this._isOnline = online;
    this._listeners.forEach((fn) => {
      try { fn(online); } catch { /* ignore listener errors */ }
    });
  }
}

export const connectivityService = new ConnectivityService();
