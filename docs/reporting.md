# Phase 8: Reports, Analytics & Operational Insights

## 1. Overview & Operational Principles

Phase 8 introduces role-segregated reporting and operational analytics across the ASHA Saathi platform.

Key Guarantees:
- **Zero AI Diagnosis / Zero Worker Scoring**: Reports are factual accounting tools (activity counts, inventory levels, status pipelines). No worker rankings, punitive metrics, or algorithmic predictions.
- **Server-Side Aggregation**: Aggregate counts are executed using count queries and focused projections rather than full client-side table dumping.
- **RLS Enforced**: Row Level Security (RLS) is applied transparently via Supabase auth context. ASHAs can only compute and view summaries on their own assigned records; supervisors view their sector; managers oversee PHC inventory and aggregate field totals.
- **Accessible & Multilingual**: All charts (such as sparklines and status bars) have accessible `<table>` equivalents embedded via semantic `<details>` blocks. Bilingual labels (English & Hindi) are standard.
- **Export Integrity**: Privacy-respecting CSV exports are provided directly from filtered in-memory data, omitting sensitive system identifiers and never touching external services.

---

## 2. Reporting Capabilities by Role

### ASHA Worker Reports (`AshaReportView`)
- **Date Presets**: Today, Last 7 Days, Last 30 Days, This Month, or Custom Date Range.
- **Home Visits**: Total visit counts, visit breakdown by type (ANC, PNC, immunization, general checkup, communicable disease, child growth), and 30-day visit sparkline with full data table view.
- **Follow-ups Pipeline**: Scheduled follow-up counts categorized into Completed, Pending, Overdue, and Missed.
- **Referrals Distribution**: Status distribution across Referred, Visited PHC, Admitted, Discharged, and Cancelled.
- **Medicine Refills & Kit Requests**: Status overview of supply orders (Pending, Approved, Fulfilled, Rejected).
- **Task Milestones**: Tasks scheduled, completed, overdue, and dismissed.
- **PWA Sync Health**: Operational sync queue state, pending offline transactions, failed sync operations, and network status.
- **CSV Downloads**: Dedicated CSV exports for Visits, Follow-ups, Referrals, and Medicine Orders.

### Supervisor Sector Reports (`SupervisorReportView`)
- **Sector Coverage**: Total registered households, active patients, active pregnancies under monitoring, and total visits in the selected period.
- **Visits by Type Breakdown**: Proportional horizontal bar chart and table of clinical vs. preventive visits across the sector.
- **Sector Follow-ups & Referrals**: Status pipelines monitoring adherence and referral follow-through.
- **Neutral Aggregation**: Pure counts without individual worker performance leaderboards.
- **CSV Summary Export**: Sector summary metric sheet export.

### PHC Manager Operations Reports (`ManagerReportView`)
- **Inventory & Supply Health**: Real-time status cards tracking Out of Stock, Low Stock, and Adequate supply items.
- **Critical Stock Alerts**: Highlighted panels for zero-stock and below-minimum stock items.
- **Full Inventory Table**: Complete listing of active drugs, units, quantities on hand, minimum thresholds, and stock status.
- **Medicine Request Pipeline**: Order history with requested vs. approved quantities, statuses, and request dates.
- **Field Activity Overview**: Facility-wide counts of households, patients, pregnancies, and home visits.
- **CSV Data Exports**: Stock inventory sheet, order requisition records, and field summary report.

---

## 3. Database & Architecture Additions

### Migration: `20260928010000_phase8_reporting_indexes.sql`
- **Performance Indexes**:
  - `idx_visits_asha_date` on `visits(asha_id, visit_date)`
  - `idx_visits_date` on `visits(visit_date)`
  - `idx_visits_type` on `visits(visit_type)`
  - `idx_follow_ups_asha_status` on `follow_ups(assigned_asha_id, status, due_date)`
  - `idx_follow_ups_due_date` on `follow_ups(due_date)`
  - `idx_referrals_asha_date` on `referrals(asha_id, referral_date)`
  - `idx_medicine_orders_asha` on `medicine_orders(asha_id, requested_at)`
  - `idx_medicine_orders_status` on `medicine_orders(status)`
  - `idx_patients_asha_status` on `patients(assigned_asha_id, status)`
  - `idx_pregnancies_status` on `pregnancies(status)`
  - `idx_tasks_due_status` on `tasks(due_date, status)`
- **Server Views**:
  - `v_visits_by_day`
  - `v_follow_up_summary`
  - `v_referral_summary`
  - `v_medicine_order_summary`
  - `v_stock_levels` (with `security_invoker = true` to preserve RLS)

### Services & Utilities
- `src/services/reportService.ts`: Central query layer with date calculations, role-segregated fetchers, and offline queue health metrics.
- `src/utils/csvExport.ts`: UTF-8 BOM compliant CSV generator with RFC-4180 escaping and role-filtered downloads.
- `src/components/reports/ReportFilters.tsx`: Universal date range controller.
- `src/components/reports/ReportStatCard.tsx`: Metric card with responsive typography and icons.
- `src/components/reports/VisitSparkline.tsx`: Accessible CSS-height sparkline + table.
- `src/components/reports/StatusBarChart.tsx`: Proportional horizontal bar chart + table.
