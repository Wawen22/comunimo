/**
 * Database Types for ComUniMo
 * Generated from Supabase schema
 */

export type UserRole = 'user' | 'admin' | 'super_admin';
export type MembershipStatus = 'active' | 'suspended' | 'expired' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'paypal' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type EventRegistrationStatus = 'pending' | 'confirmed' | 'cancelled';
export type Gender = 'M' | 'F' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  fiscal_code: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Society {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  vat_number: string | null;
  fiscal_code: string | null;
  legal_representative: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Member {
  id: string;
  society_id: string | null;
  user_id: string | null;
  
  // Personal Info
  first_name: string;
  last_name: string;
  fiscal_code: string | null;
  birth_date: string | null;
  birth_place: string | null;
  gender: Gender | null;
  
  // Contact Info
  email: string | null;
  phone: string | null;
  mobile: string | null;
  
  // Address
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  
  // Membership Info
  membership_number: string | null;
  membership_date: string | null;
  membership_type: string | null;
  membership_status: MembershipStatus;
  
  // Additional Info
  notes: string | null;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Payment {
  id: string;
  member_id: string | null;
  society_id: string | null;
  
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod | null;
  payment_type: string;
  
  reference_number: string | null;
  notes: string | null;
  
  status: PaymentStatus;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Event {
  id: string;
  society_id: string | null;
  
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  
  max_participants: number | null;
  registration_deadline: string | null;
  
  is_public: boolean;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  
  registration_date: string;
  status: EventRegistrationStatus;
  notes: string | null;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Extended Types with Relations
// ============================================================================

export interface MemberWithSociety extends Member {
  society: Society | null;
}

export interface PaymentWithMember extends Payment {
  member: Member | null;
  society: Society | null;
}

export interface EventWithSociety extends Event {
  society: Society | null;
  registrations_count?: number;
}

export interface EventRegistrationWithDetails extends EventRegistration {
  event: Event;
  member: Member;
}

// ============================================================================
// Form Types (for creating/updating)
// ============================================================================

export type CreateProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>>;

export type CreateSocietyInput = Omit<Society, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateSocietyInput = Partial<CreateSocietyInput>;

export type CreateMemberInput = Omit<Member, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateMemberInput = Partial<CreateMemberInput>;

export type CreatePaymentInput = Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdatePaymentInput = Partial<CreatePaymentInput>;

export type CreateEventInput = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateEventInput = Partial<CreateEventInput>;

export type CreateEventRegistrationInput = Omit<EventRegistration, 'id' | 'created_at' | 'updated_at' | 'registration_date'>;
export type UpdateEventRegistrationInput = Partial<Pick<EventRegistration, 'status' | 'notes'>>;

// ============================================================================
// Database Response Types
// ============================================================================

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Supabase Database Type
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: CreateProfileInput;
        Update: UpdateProfileInput;
      };
      societies: {
        Row: Society;
        Insert: CreateSocietyInput;
        Update: UpdateSocietyInput;
      };
      members: {
        Row: Member;
        Insert: CreateMemberInput;
        Update: UpdateMemberInput;
      };
      payments: {
        Row: Payment;
        Insert: CreatePaymentInput;
        Update: UpdatePaymentInput;
      };
      events: {
        Row: Event;
        Insert: CreateEventInput;
        Update: UpdateEventInput;
      };
      event_registrations: {
        Row: EventRegistration;
        Insert: CreateEventRegistrationInput;
        Update: UpdateEventRegistrationInput;
      };
    };
  };
}

