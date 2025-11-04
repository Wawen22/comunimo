'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '@/lib/api/supabase';
import type { Database, UserRole } from '@/types/database';

interface AuditActor {
  id?: string | null;
  email?: string | null;
  role?: UserRole | null;
}

interface LogAuditEventParams {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  resourceLabel?: string | null;
  payload?: Record<string, unknown> | null;
  ipAddress?: string | null;
  actor?: AuditActor;
  client?: SupabaseClient<Database>;
}

async function resolveActor(
  client: SupabaseClient<Database>,
  actor?: AuditActor,
): Promise<Required<AuditActor>> {
  let resolvedId = actor?.id ?? null;
  let resolvedEmail = actor?.email ?? null;
  let resolvedRole = actor?.role ?? null;

  try {
    if (!resolvedId || !resolvedEmail) {
      const { data: userData } = await client.auth.getUser();
      resolvedId = resolvedId ?? userData.user?.id ?? null;
      resolvedEmail = resolvedEmail ?? userData.user?.email ?? null;
    }

    if (!resolvedRole && resolvedId) {
      const { data: profileData } = await client
        .from('profiles')
        .select('role')
        .eq('id', resolvedId)
        .maybeSingle();
      resolvedRole = profileData?.role ?? null;
    }
  } catch (error) {
    console.error('Unable to resolve actor for audit logging:', error);
  }

  return {
    id: resolvedId,
    email: resolvedEmail,
    role: resolvedRole,
  };
}

export async function logAuditEvent({
  action,
  resourceType,
  resourceId = null,
  resourceLabel = null,
  payload = null,
  ipAddress = null,
  actor,
  client,
}: LogAuditEventParams) {
  const supabase = client ?? defaultClient;

  try {
    const resolvedActor = await resolveActor(supabase, actor);

    const insertPayload = {
      actor_id: resolvedActor.id,
      actor_email: resolvedActor.email,
      actor_role: resolvedActor.role,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      resource_label: resourceLabel,
      payload: payload ?? null,
      ip_address: ipAddress,
    };

    const { error } = await supabase.from('audit_logs').insert(insertPayload as Database['public']['Tables']['audit_logs']['Insert']);

    if (error) {
      console.error('Audit log insertion failed:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
