---
name: offline-first-pwa
description: Architectural patterns and implementation rules for client-side storage, queueing, and synchronization in offline-first PWAs.
---

# Offline-First PWA Architecture

## Purpose
Ensure 100% reliable offline operations for health workers in zero-connectivity rural environments, backed by IndexedDB persistence and an optimistic synchronization engine.

## When to Use
Use when architecting or coding:
- Service Worker registration and PWA manifest configurations
- Client-side database storage (IndexedDB with Dexie.js or idb)
- Mutation queues and sync managers
- Network detection and background sync triggers
- Conflict detection and resolution strategies

## Architectural Rules
1. **Local-First Writes**:
   - Every write operation (add patient, create visit, order medicines) MUST write directly to IndexedDB first.
   - Assign deterministic client UUIDs (`crypto.randomUUID()`) to all local entities immediately upon creation.
   - Mark local records with sync flags: `sync_status: 'synced' | 'pending' | 'syncing' | 'failed'`.
2. **Sync Outbox Queue**:
   - Enqueue a mutation record in an IndexedDB `sync_queue` table with payload, endpoint/table, timestamp, retry count, and operation type (`INSERT`, `UPDATE`, `DELETE`).
   - Sync runner executes FIFO order respecting relational foreign key dependencies (e.g., household synced before patient; patient synced before visit).
3. **Idempotent Server Operations**:
   - Backend APIs / RPCs / Supabase Upserts must use client UUID as primary key (`id`) with `onConflict: 'id'` / upsert logic to ensure replaying queued requests never creates duplicates.
4. **Network Lifecycle Handling**:
   - Monitor `window.addEventListener('online')` and `navigator.onLine`.
   - Debounce reconnection triggers to avoid flapping in flaky connectivity.
   - Provide manual "Sync Now" button alongside automated background synchronization.
5. **Clear User Visibility**:
   - Global status banner or pill showing:
     - 🟢 **Synced** (Online & up-to-date)
     - 🟡 **Pending Sync (N)** (N local changes waiting for network)
     - 🔵 **Syncing...** (Active upload in progress)
     - 🔴 **Offline Mode** (Saved locally, ready for auto-sync)

## Quality Checklist
- [ ] App loads and functions fully when Network tab is set to "Offline".
- [ ] No network failure blocks local saving or throws uncaught UI errors.
- [ ] Refreshing browser while offline preserves all local unsynced records.
- [ ] Reconnecting seamlessly uploads pending queue and transitions status to "Synced".
