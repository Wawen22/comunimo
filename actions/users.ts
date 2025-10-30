'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/api/createServerClient';
import { supabaseAdmin } from '@/lib/api/supabase-server';
import { randomUUID } from 'node:crypto';
import type { Database, Profile, UserRole } from '@/types/database';
import { validateSocietyAdminAssignment, shouldBlockSuperAdminChange } from '@/lib/utils/userManagementGuards';
import { createUserSchema, resetPasswordSchema, updateUserSchema } from '@/actions/users.schemas';

const adminClient = supabaseAdmin as any;

interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

async function ensureSuperAdmin() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Utente non autenticato' } as const;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single<{ id: string; role: UserRole }>();

  if (profileError || !profile) {
    console.error('[users actions] Impossibile caricare il profilo', profileError);
    return { error: 'Impossibile verificare i permessi' } as const;
  }

  if (profile.role !== 'super_admin') {
    return { error: 'Permessi insufficienti' } as const;
  }

  return { supabase, user } as const;
}

async function upsertProfile({
  userId,
  email,
  fullName,
  role,
  isActive,
}: {
  userId: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
}) {
  const payload: Partial<Profile> = {
    id: userId,
    email,
    full_name: fullName,
    role,
    is_active: isActive,
  };

  const { error } = await adminClient
    .from('profiles')
    .upsert(payload as any, { onConflict: 'id' });

  if (error) {
    console.error('[users actions] Errore aggiornando profilo', error);
    throw new Error('Impossibile aggiornare il profilo utente');
  }
}

async function setUserSocieties(userId: string, societyIds: string[]) {
  const { error: deleteError } = await adminClient
    .from('user_societies')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('[users actions] Errore rimuovendo società utente', deleteError);
    throw new Error('Impossibile aggiornare le società assegnate');
  }

  if (societyIds.length === 0) {
    return;
  }

  const uniqueSocieties = Array.from(new Set(societyIds));

  const rows = uniqueSocieties.map((societyId) => ({
    user_id: userId,
    society_id: societyId,
  })) as Array<Database['public']['Tables']['user_societies']['Insert']>;

  const { error: insertError } = await adminClient
    .from('user_societies')
    .insert(rows as any);

  if (insertError) {
    console.error('[users actions] Errore assegnando società', insertError);
    throw new Error('Impossibile assegnare le società selezionate');
  }

  const { error: clearRequestedError } = await adminClient
    .from('profiles')
    .update({ requested_society_ids: [] } as Partial<Profile>)
    .eq('id', userId);

  if (clearRequestedError) {
    console.error('[users actions] Errore azzerando richieste società', clearRequestedError);
  }

  const { error: clearMetadataError } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: {
      requested_society_ids: [],
    },
  });

  if (clearMetadataError) {
    console.error('[users actions] Errore azzerando richieste società (metadata)', clearMetadataError);
  }
}

function getResetRedirect() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return appUrl ? `${appUrl}/auth/reset-password` : undefined;
}

export async function createUserAccount(input: unknown): Promise<ActionResult> {
  const parsed = createUserSchema.safeParse(input);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Dati non validi';
    return { success: false, error: message };
  }

  const guard = await ensureSuperAdmin();
  if ('error' in guard) {
    return { success: false, error: guard.error };
  }

  const { email, fullName, role, isActive = true, societyIds = [] } = parsed.data;

  const existingProfile = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile.data?.id) {
    return { success: false, error: 'Esiste già un utente con questa email' };
  }

  const temporaryPassword = randomUUID();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: false,
    user_metadata: {
      full_name: fullName ?? undefined,
    },
  });

  if (createError || !created?.user) {
    console.error('[users actions] Errore creazione utente auth', createError);
    return {
      success: false,
      error: createError?.message ?? 'Impossibile creare l\'utente',
    };
  }

  const newUserId = created.user.id;

  try {
    await upsertProfile({
      userId: newUserId,
      email,
      fullName: fullName ?? null,
      role,
      isActive,
    });

    const societiesToAssign = role === 'society_admin' ? societyIds : [];
    await setUserSocieties(newUserId, societiesToAssign);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }

  const resetRedirect = getResetRedirect();

  const { error: resetError } = await guard.supabase.auth.resetPasswordForEmail(
    email,
    resetRedirect ? { redirectTo: resetRedirect } : undefined
  );

  if (resetError) {
    console.error('[users actions] Errore invio reset password', resetError);
    return {
      success: false,
      error:
        'Utente creato ma impossibile inviare le istruzioni di accesso. Riprovare dal pannello utenti.',
    };
  }

  revalidatePath('/dashboard/users');
  return {
    success: true,
    message: 'Utente creato con successo. È stata inviata un\'email con le istruzioni di accesso.',
  };
}

async function isLastActiveSuperAdmin(userId: string) {
  const { count, error } = await adminClient
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'super_admin')
    .eq('is_active', true);

  if (error) {
    console.error('[users actions] Errore conteggio super admin', error);
    throw new Error('Impossibile verificare i super amministratori attivi');
  }

  if (!count || count <= 1) {
    // Need to ensure the only active super admin is the target user
    const { data: maybeTarget } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .eq('role', 'super_admin')
      .eq('is_active', true)
      .maybeSingle();

    return Boolean((maybeTarget as { id?: string } | null)?.id);
  }

  return false;
}

export async function updateUserAccount(input: unknown): Promise<ActionResult> {
  const parsed = updateUserSchema.safeParse(input);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Dati non validi';
    return { success: false, error: message };
  }

  const guard = await ensureSuperAdmin();
  if ('error' in guard) {
    return { success: false, error: guard.error };
  }

  const { userId, fullName, role, isActive, societyIds } = parsed.data;

  const { data: existingProfile, error: loadError } = await adminClient
    .from('profiles')
    .select('email, full_name, role, is_active')
    .eq('id', userId)
    .single();

  if (loadError || !existingProfile) {
    console.error('[users actions] Utente non trovato', loadError);
    return { success: false, error: 'Utente non trovato' };
  }

  const profileData = existingProfile as Pick<Profile, 'email' | 'full_name' | 'role' | 'is_active'>;

  const targetRole = role ?? profileData.role;
  const targetActive = isActive ?? profileData.is_active;

  const lastSuperAdmin = await isLastActiveSuperAdmin(userId);

  if (
    shouldBlockSuperAdminChange({
      existingRole: profileData.role,
      targetRole,
      targetActive,
      isTargetLastActiveSuperAdmin: lastSuperAdmin,
    })
  ) {
    return {
      success: false,
      error: 'Non è possibile rimuovere o disattivare l\'ultimo super amministratore attivo',
    };
  }

  const updates: Partial<Profile> = {};
  if (fullName !== undefined) {
    updates.full_name = fullName || null;
  }
  if (role !== undefined) {
    updates.role = role;
  }
  if (isActive !== undefined) {
    updates.is_active = isActive;
  }

  try {
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update(updates as any)
        .eq('id', userId);

      if (updateError) {
        console.error('[users actions] Errore aggiornando profilo', updateError);
        throw new Error('Impossibile aggiornare il profilo utente');
      }
    }

    if (fullName !== undefined) {
      const { error: metaError } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: fullName || null,
        },
      });

      if (metaError) {
        console.error('[users actions] Errore aggiornando metadata utente', metaError);
        throw new Error('Profilo aggiornato ma impossibile aggiornare i metadati utente');
      }
    }

    const shouldManageSocieties = targetRole === 'society_admin';
    if (shouldManageSocieties) {
      const validationMessage = validateSocietyAdminAssignment(targetRole, societyIds);
      if (validationMessage) {
        throw new Error(validationMessage);
      }
      await setUserSocieties(userId, societyIds as string[]);
    } else if (societyIds !== undefined || profileData.role === 'society_admin') {
      await setUserSocieties(userId, []);
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }

  revalidatePath('/dashboard/users');
  return { success: true, message: 'Profilo utente aggiornato correttamente' };
}

export async function triggerPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Dati non validi';
    return { success: false, error: message };
  }

  const guard = await ensureSuperAdmin();
  if ('error' in guard) {
    return { success: false, error: guard.error };
  }

  const { userId } = parsed.data;

  const { data: profile, error: loadError } = await adminClient
    .from('profiles')
    .select('email, is_active')
    .eq('id', userId)
    .single();

  if (loadError || !profile) {
    console.error('[users actions] Utente non trovato per reset password', loadError);
    return { success: false, error: 'Utente non trovato' };
  }

  const profileData = profile as Pick<Profile, 'email' | 'is_active'>;

  if (!profileData.is_active) {
    return { success: false, error: 'Impossibile inviare il reset: utente disattivato' };
  }

  const resetRedirect = getResetRedirect();

  const { error: resetError } = await guard.supabase.auth.resetPasswordForEmail(
    profileData.email,
    resetRedirect ? { redirectTo: resetRedirect } : undefined
  );

  if (resetError) {
    console.error('[users actions] Errore reset password', resetError);
    return { success: false, error: resetError.message ?? 'Impossibile inviare il reset password' };
  }

  return { success: true, message: 'Email di reset password inviata con successo' };
}
