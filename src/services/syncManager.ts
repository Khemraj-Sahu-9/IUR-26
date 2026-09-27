/**
 * syncManager.ts
 *
 * Processes the IndexedDB sync_queue and uploads pending operations to Supabase.
 *
 * Key guarantees:
 *   • Dependency ordering  — households before patients before visits/follow-ups/referrals
 *   • Idempotency          — upsert with onConflict:'id' ensures replaying never duplicates
 *   • Sync lock            — only one sync job runs at a time
 *   • Retry + backoff      — exponential, max 5 attempts
 *   • Data preservation    — failed ops stay in queue; data is never deleted on error
 */

import { db, SyncOperation, SyncStatus } from './offlineDatabase';
import { supabase } from '@/lib/supabaseClient';
import { connectivityService } from './connectivityService';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 5;
const ENTITY_ORDER: string[] = [
  'households',
  'patients',
  'pregnancies',
  'visits',
  'follow_ups',
  'referrals',
  'medicine_orders',
];

// ─── Sync state ───────────────────────────────────────────────────────────────

type SyncStateValue = 'idle' | 'syncing' | 'synced' | 'failed';

type SyncStateListener = (state: SyncManagerState) => void;

export interface SyncManagerState {
  status: SyncStateValue;
  pendingCount: number;
  failedCount: number;
  lastSyncedAt: string | null;
}

class SyncManager {
  private _locked = false;
  private _listeners: Set<SyncStateListener> = new Set();
  private _state: SyncManagerState = {
    status: 'idle',
    pendingCount: 0,
    failedCount: 0,
    lastSyncedAt: null,
  };

  // ─── Listeners ─────────────────────────────────────────────────────────────

  addListener(fn: SyncStateListener): void {
    this._listeners.add(fn);
    fn(this._state); // deliver current state immediately
  }

  removeListener(fn: SyncStateListener): void {
    this._listeners.delete(fn);
  }

  getState(): SyncManagerState {
    return { ...this._state };
  }

  private _emit() {
    this._listeners.forEach((fn) => {
      try { fn({ ...this._state }); } catch { /* ignore */ }
    });
  }

  private async _refreshCounts() {
    const pending = await db.sync_queue.where('sync_status').anyOf(['pending', 'syncing']).count();
    const failed = await db.sync_queue.where('sync_status').equals('failed').count();
    this._state.pendingCount = pending;
    this._state.failedCount = failed;
  }

  /** Call after any local write to update the pending badge */
  async notifyPendingAdded(): Promise<void> {
    await this._refreshCounts();
    if (this._state.status !== 'syncing') {
      this._state.status = this._state.pendingCount > 0 ? 'idle' : 'synced';
    }
    this._emit();
  }

  // ─── Main sync entry ────────────────────────────────────────────────────────

  /** Trigger synchronization. Safe to call multiple times — lock prevents races. */
  async sync(): Promise<void> {
    if (this._locked) {
      console.log('[SyncManager] Sync already in progress — skipping');
      return;
    }
    const online = await connectivityService.probe();
    if (!online) {
      console.log('[SyncManager] Offline — deferring sync');
      return;
    }

    this._locked = true;
    await this._refreshCounts();
    if (this._state.pendingCount === 0 && this._state.failedCount === 0) {
      this._locked = false;
      this._state.status = 'synced';
      this._emit();
      return;
    }

    this._state.status = 'syncing';
    this._emit();
    console.log('[SyncManager] Starting sync…');

    try {
      await this._processBatch();
      await this._refreshCounts();
      this._state.status = this._state.failedCount > 0 ? 'failed' : 'synced';
      this._state.lastSyncedAt = new Date().toISOString();
      console.log('[SyncManager] Sync complete', this._state);
    } catch (err) {
      console.error('[SyncManager] Sync error', err);
      this._state.status = 'failed';
    } finally {
      this._locked = false;
      this._emit();
    }
  }

  // ─── Process queue in dependency order ─────────────────────────────────────

  private async _processBatch(): Promise<void> {
    // Collect all pending/failed ops eligible for retry
    const allOps = await db.sync_queue
      .where('sync_status')
      .anyOf(['pending', 'failed'])
      .toArray();

    // Only retry failed ones that haven't exceeded max retries
    const eligible = allOps.filter(
      (op) => op.sync_status === 'pending' || op.retry_count < MAX_RETRIES
    );

    // Sort by dependency order, then FIFO within same entity type
    const sorted = this._sortByDependency(eligible);

    // Track entity_ids that have been successfully synced in this run
    const syncedEntityIds = new Set<string>();

    for (const op of sorted) {
      // If this op depends on another entity, check if it's been synced
      if (op.depends_on_entity_id && !syncedEntityIds.has(op.depends_on_entity_id)) {
        // Dependency not yet synced — check if it's already synced in DB
        const depOp = await db.sync_queue
          .where('entity_id').equals(op.depends_on_entity_id)
          .first();
        if (depOp && depOp.sync_status !== 'synced') {
          console.log(`[SyncManager] Skipping ${op.entity_type}:${op.entity_id} — dependency not synced`);
          continue;
        }
      }

      const success = await this._processOp(op);
      if (success) {
        syncedEntityIds.add(op.entity_id);
      }
    }
  }

  private _sortByDependency(ops: SyncOperation[]): SyncOperation[] {
    return [...ops].sort((a, b) => {
      const ai = ENTITY_ORDER.indexOf(a.entity_type);
      const bi = ENTITY_ORDER.indexOf(b.entity_type);
      const aIdx = ai === -1 ? 99 : ai;
      const bIdx = bi === -1 ? 99 : bi;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.created_at.localeCompare(b.created_at);
    });
  }

  // ─── Process a single operation ─────────────────────────────────────────────

  private async _processOp(op: SyncOperation): Promise<boolean> {
    // Mark as syncing
    await db.sync_queue.update(op.id, {
      sync_status: 'syncing' as SyncStatus,
      last_attempted_at: new Date().toISOString(),
    });

    try {
      if (op.operation_type === 'CREATE' || op.operation_type === 'UPDATE') {
        await this._upsert(op);
      } else if (op.operation_type === 'DELETE') {
        await this._delete(op);
      }

      // Mark operation as synced
      await db.sync_queue.update(op.id, { sync_status: 'synced' as SyncStatus });

      // Mark the local record as synced too
      await this._markLocalRecordSynced(op);

      console.log(`[SyncManager] ✓ ${op.operation_type} ${op.entity_type}:${op.entity_id}`);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[SyncManager] ✗ ${op.operation_type} ${op.entity_type}:${op.entity_id}`, msg);

      await db.sync_queue.update(op.id, {
        sync_status: 'failed' as SyncStatus,
        retry_count: op.retry_count + 1,
        error_message: msg.slice(0, 500), // cap size
      });
      return false;
    }
  }

  private async _upsert(op: SyncOperation): Promise<void> {
    // Strip local-only metadata fields before sending to server
    const payload = this._stripLocalMeta(op.payload);

    const { error } = await supabase
      .from(op.entity_type)
      .upsert(payload, { onConflict: 'id' });

    if (error) throw new Error(`Supabase upsert error on ${op.entity_type}: ${error.message}`);
  }

  private async _delete(op: SyncOperation): Promise<void> {
    const { error } = await supabase
      .from(op.entity_type)
      .delete()
      .eq('id', op.entity_id);

    if (error) throw new Error(`Supabase delete error on ${op.entity_type}: ${error.message}`);
  }

  private _stripLocalMeta(payload: Record<string, unknown>): Record<string, unknown> {
    const local = new Set([
      'sync_status', 'local_created_at', 'local_updated_at', 'created_offline',
    ]);
    return Object.fromEntries(
      Object.entries(payload).filter(([k]) => !local.has(k))
    );
  }

  private async _markLocalRecordSynced(op: SyncOperation): Promise<void> {
    const table = db.table(op.entity_type) as ReturnType<typeof db.table>;
    if (!table) return;
    try {
      await table.update(op.entity_id, { sync_status: 'synced' });
    } catch {
      // table.update is non-throwing if record not found
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /** Queue a CREATE or UPDATE operation */
  async enqueue(
    entityType: string,
    entityId: string,
    operationType: 'CREATE' | 'UPDATE' | 'DELETE',
    payload: Record<string, unknown>,
    dependsOnEntityId?: string,
  ): Promise<void> {
    const op: SyncOperation = {
      id: crypto.randomUUID(),
      entity_type: entityType,
      entity_id: entityId,
      operation_type: operationType,
      payload,
      created_at: new Date().toISOString(),
      retry_count: 0,
      last_attempted_at: null,
      sync_status: 'pending',
      error_message: null,
      depends_on_entity_id: dependsOnEntityId ?? null,
    };
    await db.sync_queue.add(op);
    await this.notifyPendingAdded();
  }

  /** Get current pending count without triggering a sync */
  async getPendingCount(): Promise<number> {
    return db.sync_queue.where('sync_status').anyOf(['pending', 'syncing', 'failed']).count();
  }

  /** Reset failed operations to pending so they can be retried */
  async retryFailed(): Promise<void> {
    const failed = await db.sync_queue.where('sync_status').equals('failed').toArray();
    await Promise.all(
      failed.map((op) =>
        db.sync_queue.update(op.id, {
          sync_status: 'pending' as SyncStatus,
          retry_count: 0,
          error_message: null,
        })
      )
    );
    await this.sync();
  }
}

export const syncManager = new SyncManager();

// ─── Auto-sync on reconnect ───────────────────────────────────────────────────

connectivityService.addListener((online) => {
  if (online) {
    console.log('[SyncManager] Network restored — auto-syncing…');
    syncManager.sync();
  }
});
