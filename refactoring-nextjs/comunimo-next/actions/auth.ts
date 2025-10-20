'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: 'Email o password non validi',
      };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante il login',
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return {
          success: false,
          error: 'Email già registrata',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Errore durante la registrazione',
      };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante la registrazione',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: 'Errore durante il logout',
      };
    }

    revalidatePath('/', 'layout');
    redirect('/login');
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante il logout',
    };
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  email: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      // Don't reveal if email exists or not (security)
      console.error('Password reset error:', error);
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante la richiesta di reset password',
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  newPassword: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: 'Errore durante il reset della password',
      };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante il reset della password',
    };
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    // First verify current password by attempting to sign in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return {
        success: false,
        error: 'Utente non autenticato',
      };
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return {
        success: false,
        error: 'Password attuale non corretta',
      };
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return {
        success: false,
        error: 'Errore durante il cambio password',
      };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante il cambio password',
    };
  }
}

