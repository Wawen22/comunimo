/**
 * Database Types for ComUniMo
 * Generated from Supabase schema
 */

export type UserRole = 'society_admin' | 'admin' | 'super_admin';
export type MembershipStatus = 'active' | 'suspended' | 'expired' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'paypal' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type EventRegistrationStatus = 'pending' | 'confirmed' | 'cancelled';
export type Gender = 'M' | 'F' | 'other';
export type ChampionshipType = 'cross_country' | 'road' | 'track' | 'other';
export type RaceStatus = 'upcoming' | 'open' | 'closed' | 'completed';
export type ChampionshipRegistrationStatus = 'confirmed' | 'cancelled';
export type OrganizationCode = 'FIDAL' | 'UISP' | 'CSI' | 'RUNCARD';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  fiscal_code: string | null;
  role: UserRole;
  society_id: string | null; // Deprecated: use user_societies table instead
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSociety {
  id: string;
  user_id: string;
  society_id: string;
  created_at: string;
  updated_at: string;
}

export interface Society {
  id: string;
  name: string;
  society_code: string | null;
  organization: OrganizationCode | null; // Ente di affiliazione (FIDAL, UISP, CSI, RUNCARD)
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
  logo_url: string | null;
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

  // Athletic Info
  organization: string | null;
  category: string | null;
  medical_certificate_date: string | null;
  medical_certificate_expiry: string | null;
  is_foreign_athlete: boolean;
  photo_url: string | null;
  card_date: string | null;                       // Data movimento/tessera (DAT_MOV per FIDAL, Data tessera per UISP)
  system_date: string | null;                     // Data inserimento sistema (DAT_SYS per FIDAL)

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

export interface Championship {
  id: string;

  // Basic Info
  name: string;
  slug: string;
  year: number;
  season: string | null;
  description: string | null;

  // Dates
  start_date: string | null;
  end_date: string | null;

  // Type
  championship_type: ChampionshipType;

  // Status
  is_active: boolean;

  // Audit
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Event {
  id: string;
  championship_id: string | null;
  society_id: string | null;

  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;

  max_participants: number | null;
  registration_deadline: string | null;

  // Athletic event specific fields
  event_number: number | null;
  registration_start_date: string | null;
  registration_end_date: string | null;
  poster_url: string | null;
  results_url: string | null;
  has_specialties: boolean;

  is_public: boolean;
  is_active: boolean;

  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Alias for Race (Event within a Championship)
export type Race = Event;

export interface ChampionshipRegistration {
  id: string;
  championship_id: string;
  member_id: string;
  society_id: string | null;

  bib_number: string;
  organization: string | null;
  category: string | null;

  registration_date: string;
  status: ChampionshipRegistrationStatus;
  notes: string | null;

  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  society_id: string | null;

  bib_number: string | null;
  organization: string | null;
  category: string | null;
  specialty: string | null;

  registration_date: string;
  status: EventRegistrationStatus;
  notes: string | null;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationEmailStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  title: string;
  body_html: string;
  body_text: string | null;
  sent_by: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecipient {
  id: string;
  notification_id: string;
  user_id: string;
  delivered_at: string;
  read_at: string | null;
  email_sent_at: string | null;
  email_status: NotificationEmailStatus;
  created_at: string;
}

// ============================================================================
// Extended Types with Relations
// ============================================================================

export interface ProfileWithSocieties extends Profile {
  societies: Society[];
}

export interface UserSocietyWithDetails extends UserSociety {
  society: Society;
}

export interface MemberWithSociety extends Member {
  society: Society | null;
}

export interface PaymentWithMember extends Payment {
  member: Member | null;
  society: Society | null;
}

export interface ChampionshipWithRaces extends Championship {
  races: Race[];
  race_count: number;
}

export interface EventWithSociety extends Event {
  society: Society | null;
  registrations_count?: number;
}

export interface RaceWithChampionship extends Race {
  championship: Championship | null;
  registration_count: number;
}

export interface EventRegistrationWithDetails extends EventRegistration {
  event: Event;
  member: Member;
  society: Society | null;
}

export interface ChampionshipRegistrationWithDetails extends ChampionshipRegistration {
  championship: Championship;
  member: Member;
  society: Society | null;
}

export interface NotificationWithRecipients extends Notification {
  recipients: NotificationRecipient[];
}

export interface NotificationRecipientWithNotification extends NotificationRecipient {
  notification: Notification;
}

// ============================================================================
// Form Types (for creating/updating)
// ============================================================================

export type CreateProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'society_id'>;
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at' | 'society_id'>>;

export type CreateUserSocietyInput = Omit<UserSociety, 'id' | 'created_at' | 'updated_at'>;

export type CreateSocietyInput = Omit<Society, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateSocietyInput = Partial<CreateSocietyInput>;

export type CreateMemberInput = Omit<Member, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateMemberInput = Partial<CreateMemberInput>;

export type CreatePaymentInput = Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdatePaymentInput = Partial<CreatePaymentInput>;

export type CreateChampionshipInput = Omit<Championship, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateChampionshipInput = Partial<CreateChampionshipInput>;

export type CreateEventInput = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateEventInput = Partial<CreateEventInput>;

export type CreateRaceInput = CreateEventInput;
export type UpdateRaceInput = UpdateEventInput;

export type CreateEventRegistrationInput = Omit<EventRegistration, 'id' | 'created_at' | 'updated_at' | 'registration_date'>;
export type UpdateEventRegistrationInput = Partial<Pick<EventRegistration, 'status' | 'notes'>>;

export type CreateChampionshipRegistrationInput = Omit<ChampionshipRegistration, 'id' | 'created_at' | 'updated_at' | 'registration_date'>;
export type UpdateChampionshipRegistrationInput = Partial<Pick<ChampionshipRegistration, 'status' | 'notes' | 'bib_number'>>;

export interface CreateNotificationInput {
  title: string;
  body_html: string;
  body_text?: string | null;
  sent_by?: string | null;
  published_at?: string;
}

export type UpdateNotificationInput = Partial<CreateNotificationInput>;

export interface CreateNotificationRecipientInput {
  notification_id: string;
  user_id: string;
  delivered_at?: string;
  read_at?: string | null;
  email_sent_at?: string | null;
  email_status?: NotificationEmailStatus;
}

export type UpdateNotificationRecipientInput = Partial<CreateNotificationRecipientInput>;

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
      user_societies: {
        Row: UserSociety;
        Insert: CreateUserSocietyInput;
        Update: Partial<CreateUserSocietyInput>;
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
      championships: {
        Row: Championship;
        Insert: CreateChampionshipInput;
        Update: UpdateChampionshipInput;
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
      notifications: {
        Row: Notification;
        Insert: CreateNotificationInput;
        Update: UpdateNotificationInput;
      };
      notification_recipients: {
        Row: NotificationRecipient;
        Insert: CreateNotificationRecipientInput;
        Update: UpdateNotificationRecipientInput;
      };
    };
  };
}
