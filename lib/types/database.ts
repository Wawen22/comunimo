/**
 * Database Types
 * TypeScript types for all database entities
 * Auto-generated from Supabase schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'society_admin' | 'admin' | 'super_admin';

export type MembershipStatus = 'active' | 'suspended' | 'expired' | 'cancelled';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'paypal' | 'other';

export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export type EventRegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export type Gender = 'M' | 'F' | 'other';

export type OrganizationCode = 'FIDAL' | 'UISP' | 'CSI' | 'RUNCARD';

// ============================================================================
// PROFILES
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  fiscal_code: string | null;
  role: UserRole;
  society_id: string | null;
  requested_society_ids: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SOCIETIES
// ============================================================================

export interface Society {
  id: string;
  name: string;
  society_code: string | null;           // Codice società (es. "MO001F", "MO001U")
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
  logo_url: string | null;               // URL logo società
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// ============================================================================
// MEMBERS
// ============================================================================

export interface Member {
  id: string;
  society_id: string | null;
  society_code: string | null;
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
  
  // Athletic Info (from legacy system)
  organization: string | null;                    // FIDAL, UISP, CSI, RUNCARD
  year: number | null;                            // Anno gestione
  regional_code: string | null;                   // Codice regionale
  category: string | null;                        // Categoria atletica
  membership_card_number: string | null;          // Numero tessera
  card_issue_date: string | null;                 // Data emissione tessera
  card_expiry_date: string | null;                // Data scadenza tessera
  is_foreign: boolean;                            // Atleta straniero
  medical_certificate_date: string | null;        // Data certificato medico
  medical_certificate_expiry: string | null;      // Data scadenza certificato medico
  photo_url: string | null;                       // URL foto atleta
  card_date: string | null;                       // Data movimento/tessera (DAT_MOV per FIDAL, Data tessera per UISP)
  system_date: string | null;                     // Data inserimento sistema (DAT_SYS per FIDAL)
  
  // Additional Info
  notes: string | null;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// ============================================================================
// PAYMENTS
// ============================================================================

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

// ============================================================================
// EVENTS
// ============================================================================

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
  
  // Athletic event specific fields (from legacy system)
  event_number: number | null;                 // Numero progressivo gara
  registration_start_date: string | null;      // Inizio iscrizioni
  registration_end_date: string | null;        // Fine iscrizioni
  poster_url: string | null;                   // URL locandina
  results_url: string | null;                  // URL classifiche
  has_specialties: boolean;                    // Ha specialità
  
  is_public: boolean;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// ============================================================================
// EVENT REGISTRATIONS
// ============================================================================

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  
  registration_date: string;
  status: EventRegistrationStatus;
  notes: string | null;
  
  // Athletic event specific fields (from legacy system)
  bib_number: string | null;          // Numero pettorale
  organization: string | null;        // Ente di appartenenza
  category: string | null;            // Categoria
  specialty: string | null;           // Specialità (es. "100m", "Salto in lungo")
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export interface Organization {
  id: string;
  code: string;                       // FIDAL, UISP, CSI, RUNCARD
  name: string;                       // Nome completo
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category {
  id: string;
  code: string;                       // Es. "SM", "SF", "AM", "AF"
  gender: string;                     // M, F
  age_from: number;                   // Età minima
  age_to: number;                     // Età massima
  description: string | null;         // Descrizione categoria
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MEDICAL CERTIFICATES
// ============================================================================

export interface MedicalCertificate {
  id: string;
  member_id: string | null;
  membership_card_number: string;     // Numero tessera
  issue_date: string;                 // Data emissione
  expiry_date: string;                // Data scadenza
  last_update_date: string | null;    // Data ultimo aggiornamento
  issuing_authority: string | null;   // Ente rilascio
  manual_update_note: string | null;  // Note aggiornamento manuale
  certificate_url: string | null;     // URL certificato
  card_attachment_url: string | null; // URL allegato tessera
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EVENT SPECIALTIES
// ============================================================================

export interface EventSpecialty {
  id: string;
  event_id: string;
  code: string;                       // Codice specialità (es. "100", "LUN")
  name: string;                       // Nome specialità (es. "100 metri", "Salto in lungo")
  category: string | null;            // Categoria (opzionale)
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ALL SOCIETIES
// ============================================================================

export interface AllSociety {
  id: string;
  society_code: string;               // Codice società
  name: string;                       // Nome società
  province: string | null;            // Provincia
  organization: string | null;        // Ente (FIDAL, UISP, etc.)
  is_managed: boolean;                // Gestita da noi
  managed_society_id: string | null;  // FK to societies
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BIB NUMBER SEQUENCES
// ============================================================================

export interface BibNumberSequence {
  id: string;
  event_id: string;
  last_number: number;
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

export interface NotificationRecipientWithNotification extends NotificationRecipient {
  notification: Notification;
}
