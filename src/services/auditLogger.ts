import { supabase } from '@/lib/supabaseClient';
export interface AuditLogPayload {
  action: 
    | 'HOUSEHOLD_CREATED' 
    | 'PATIENT_CREATED' 
    | 'PATIENT_UPDATED' 
    | 'VISIT_CREATED' 
    | 'FOLLOW_UP_CREATED' 
    | 'FOLLOW_UP_COMPLETED' 
    | 'FOLLOW_UP_MISSED' 
    | 'REFERRAL_CREATED' 
    | 'REFERRAL_STATUS_UPDATED' 
    | 'MEDICINE_REQUEST_CREATED' 
    | 'MEDICINE_REQUEST_APPROVED' 
    | 'MEDICINE_REQUEST_REJECTED'
    | 'MEDICINE_REQUEST_CANCELLED'
    | 'MEDICINE_REQUEST_FULFILLED'
    | 'STOCK_RECEIVED'
    | 'STOCK_ADJUSTED'
    | 'STOCK_ISSUED'
    | 'USER_LOGIN' 
    | 'USER_LOGOUT';
  tableName: string;
  recordId: string;
  metadata?: Record<string, unknown>;
}

export const auditLogger = {
  async log(payload: AuditLogPayload): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ensure no sensitive fields (e.g. passwords, secrets) are logged in metadata
      const sanitizedMeta = { ...payload.metadata };
      delete (sanitizedMeta as Record<string, unknown>).password;
      delete (sanitizedMeta as Record<string, unknown>).token;

      await supabase.from('audit_logs').insert({
        actor_profile_id: user.id,
        action: payload.action,
        table_name: payload.tableName,
        record_id: payload.recordId,
        metadata: sanitizedMeta,
      });
    } catch (err) {
      // Non-blocking catch to ensure UI operations are never halted by audit logging failures
      console.warn('Non-blocking audit log notice:', err);
    }
  },
};
