/**
 * User-Society Utilities
 *
 * Utilities for managing many-to-many relationship between users and societies.
 * Supports multi-society management for society_admin users.
 */

import { supabase } from '@/lib/api/supabase';
import type { Society, UserSociety, UserSocietyWithDetails, UserRole } from '@/types/database';

/**
 * Get all societies managed by a user
 * @param userId - User ID
 * @returns Array of societies
 */
export async function getUserSocieties(userId: string): Promise<Society[]> {

  const { data, error } = await supabase
    .from('user_societies')
    .select(`
      society_id,
      societies (*)
    `)
    .eq('user_id', userId) as {
      data: Array<{ society_id: string; societies: Society }> | null;
      error: any;
    };

  if (error) {
    console.error('Error fetching user societies:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((item) => item.societies);
}

/**
 * Get all society IDs managed by a user
 * @param userId - User ID
 * @returns Array of society IDs
 */
export async function getUserSocietyIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_societies')
    .select('society_id')
    .eq('user_id', userId) as {
      data: Array<{ society_id: string }> | null;
      error: any;
    };

  if (error) {
    console.error('Error fetching user society IDs:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((item) => item.society_id);
}

/**
 * Check if a user can manage a specific society
 * @param userId - User ID
 * @param societyId - Society ID
 * @returns True if user can manage the society
 */
export async function canUserManageSociety(
  userId: string,
  societyId: string
): Promise<boolean> {
  // Check if user is admin (can manage all societies)
  const isAdminUser = await isAdmin(userId);
  if (isAdminUser) {
    return true;
  }

  // Check if user has assignment to this society
  const { data, error } = await supabase
    .from('user_societies')
    .select('id')
    .eq('user_id', userId)
    .eq('society_id', societyId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

/**
 * Get user role
 * @param userId - User ID
 * @returns User role or null
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single() as {
      data: { role: UserRole } | null;
      error: any;
    };

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role || null;
}

/**
 * Check if user is admin or super_admin
 * @param userId - User ID
 * @returns True if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'super_admin';
}

/**
 * Check if user is super_admin
 * @param userId - User ID
 * @returns True if user is super_admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'super_admin';
}

/**
 * Assign a user to a society (admin only)
 * @param userId - User ID
 * @param societyId - Society ID
 * @returns Success status
 */
export async function assignUserToSociety(
  userId: string,
  societyId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_societies')
    .insert({ user_id: userId, society_id: societyId } as any);

  if (error) {
    console.error('Error assigning user to society:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Remove a user from a society (admin only)
 * @param userId - User ID
 * @param societyId - Society ID
 * @returns Success status
 */
export async function removeUserFromSociety(
  userId: string,
  societyId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_societies')
    .delete()
    .eq('user_id', userId)
    .eq('society_id', societyId);

  if (error) {
    console.error('Error removing user from society:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all users assigned to a society (admin only)
 * @param societyId - Society ID
 * @returns Array of user-society assignments with user details
 */
export async function getSocietyUsers(societyId: string): Promise<UserSocietyWithDetails[]> {
  const { data, error } = await supabase
    .from('user_societies')
    .select(`
      *,
      profiles (
        id,
        email,
        full_name,
        role
      )
    `)
    .eq('society_id', societyId) as {
      data: any[] | null;
      error: any;
    };

  if (error) {
    console.error('Error fetching society users:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data as UserSocietyWithDetails[];
}

/**
 * Get user's societies with details
 * @param userId - User ID
 * @returns Array of user-society assignments with society details
 */
export async function getUserSocietiesWithDetails(
  userId: string
): Promise<UserSocietyWithDetails[]> {
  const { data, error } = await supabase
    .from('user_societies')
    .select(`
      *,
      society:societies (*)
    `)
    .eq('user_id', userId) as {
      data: UserSocietyWithDetails[] | null;
      error: any;
    };

  if (error) {
    console.error('Error fetching user societies with details:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if user has access to any societies
 * @param userId - User ID
 * @returns True if user has at least one society assignment
 */
export async function userHasSocieties(userId: string): Promise<boolean> {
  const societies = await getUserSocietyIds(userId);
  return societies.length > 0;
}

/**
 * Get first society for a user (for backward compatibility)
 * @param userId - User ID
 * @returns First society or null
 */
export async function getUserFirstSociety(userId: string): Promise<Society | null> {
  const societies = await getUserSocieties(userId);
  return societies.length > 0 ? (societies[0] as Society) : null;
}

