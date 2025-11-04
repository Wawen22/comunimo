'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/api/supabase';
import { Member, Society } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { assignCategory, getCategoriesByGender, type Gender } from '@/lib/utils/categoryAssignment';
import { useQueryClient } from '@tanstack/react-query';
import { membersQueryKeys } from '@/lib/react-query/members';

// Validation schema
const memberSchema = z.object({
  // Step 1: Personal Info
  first_name: z.string().min(1, 'Nome obbligatorio'),
  last_name: z.string().min(1, 'Cognome obbligatorio'),
  fiscal_code: z.string()
    .regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/, 'Codice fiscale non valido (16 caratteri)')
    .optional()
    .or(z.literal('')),
  birth_date: z.string().min(1, 'Data di nascita obbligatoria'),
  birth_place: z.string().optional(),
  gender: z.enum(['M', 'F', 'other'], { required_error: 'Genere obbligatorio' }),

  // Step 2: Contact & Address
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().max(2, 'Provincia deve essere di 2 caratteri').optional(),
  postal_code: z.string().max(5, 'CAP deve essere di 5 cifre').optional(),

  // Step 3: Membership
  society_id: z.string().min(1, 'Società obbligatoria'),
  society_code: z.string().min(1, 'Codice società obbligatorio'),
  membership_number: z.string().optional(),
  membership_date: z.string().optional(),
  membership_type: z.string().optional(),
  membership_status: z.enum(['active', 'suspended', 'expired', 'cancelled']).default('active'),

  // Step 4: Athletic Info
  year: z.number().optional().or(z.string().optional()),
  regional_code: z.string().optional(),
  category: z.string().optional(),
  is_foreign: z.boolean().default(false),

  // Step 5: Documents
  medical_certificate_date: z.string().optional(),
  medical_certificate_expiry: z.string().optional(),
  photo_url: z.string().url('URL non valido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  member?: Member;
  mode?: 'create' | 'edit';
}

export function MemberForm({ member, mode = 'create' }: MemberFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [justChangedStep, setJustChangedStep] = useState(false);
  const totalSteps = 4; // Reduced from 5: merged Athletic Info into Membership

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          first_name: member.first_name,
          last_name: member.last_name,
          fiscal_code: member.fiscal_code || '',
          birth_date: member.birth_date || '',
          birth_place: member.birth_place || '',
          gender: member.gender || 'M',
          email: member.email || '',
          phone: member.phone || '',
          mobile: member.mobile || '',
          address: member.address || '',
          city: member.city || '',
          province: member.province || '',
          postal_code: member.postal_code || '',
          society_id: member.society_id || '',
          society_code: member.society_code || '',
          membership_number: member.membership_number || '',
          membership_date: member.membership_date || '',
          membership_type: member.membership_type || '',
          membership_status: member.membership_status,
          year: member.year || undefined,
          regional_code: member.regional_code || '',
          category: member.category || '',
          is_foreign: member.is_foreign,
          medical_certificate_date: member.medical_certificate_date || '',
          medical_certificate_expiry: member.medical_certificate_expiry || '',
          photo_url: member.photo_url || '',
          notes: member.notes || '',
        }
      : {
          gender: 'M',
          membership_status: 'active',
          is_foreign: false,
        },
  });

  // Watch fields for auto-assignment
  const watchSocietyId = watch('society_id');
  const watchBirthDate = watch('birth_date');
  const watchGender = watch('gender');

  // Debug: log validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  // Fetch societies
  useEffect(() => {
    const fetchSocieties = async () => {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setSocieties(data);
      }
    };

    fetchSocieties();
  }, []);

  // Auto-populate society_code when society is selected
  useEffect(() => {
    if (watchSocietyId) {
      const selectedSociety = societies.find((s) => s.id === watchSocietyId);
      if (selectedSociety?.society_code) {
        setValue('society_code', selectedSociety.society_code);
      }
    }
  }, [watchSocietyId, societies, setValue]);

  // Auto-assign category based on birth_date and gender
  useEffect(() => {
    if (watchBirthDate && watchGender) {
      const category = calculateCategory(watchBirthDate, watchGender);
      setValue('category', category);
    }
  }, [watchBirthDate, watchGender, setValue]);

  // Use the utility function for category assignment
  const calculateCategory = (birthDate: string, gender: string): string => {
    return assignCategory(birthDate, gender as Gender);
  };

  const nextStep = () => {
    setJustChangedStep(true);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    // Reset the flag after a short delay to prevent accidental submit
    setTimeout(() => setJustChangedStep(false), 300);
  };

  const prevStep = () => {
    setJustChangedStep(true);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setTimeout(() => setJustChangedStep(false), 300);
  };

  const onSubmit = async (data: MemberFormData) => {
    // Prevent submit if user just changed step (accidental double-click)
    if (justChangedStep) {
      console.log('Submit prevented: just changed step');
      return;
    }

    console.log('Form submitted with data:', data);
    console.log('Mode:', mode);
    console.log('Member ID:', member?.id);
    setIsLoading(true);

    try {
      // Convert year to number if it's a string
      const yearValue = data.year ? parseInt(data.year.toString()) : null;

      // Convert empty strings to null for optional fields (PostgreSQL doesn't accept empty strings for dates)
      const sanitizeValue = (value: any) => {
        if (value === '' || value === undefined) return null;
        return value;
      };

      const memberData = {
        first_name: data.first_name,
        last_name: data.last_name,
        fiscal_code: sanitizeValue(data.fiscal_code),
        birth_date: data.birth_date, // Required field, don't sanitize
        birth_place: sanitizeValue(data.birth_place),
        gender: data.gender,
        email: sanitizeValue(data.email),
        phone: sanitizeValue(data.phone),
        mobile: sanitizeValue(data.mobile),
        address: sanitizeValue(data.address),
        city: sanitizeValue(data.city),
        province: sanitizeValue(data.province),
        postal_code: sanitizeValue(data.postal_code),
        society_id: data.society_id,
        society_code: data.society_code,
        membership_number: sanitizeValue(data.membership_number),
        membership_date: sanitizeValue(data.membership_date),
        membership_type: sanitizeValue(data.membership_type),
        membership_status: data.membership_status,
        year: yearValue,
        regional_code: sanitizeValue(data.regional_code),
        category: sanitizeValue(data.category),
        is_foreign: data.is_foreign,
        medical_certificate_date: sanitizeValue(data.medical_certificate_date),
        medical_certificate_expiry: sanitizeValue(data.medical_certificate_expiry),
        photo_url: sanitizeValue(data.photo_url),
        notes: sanitizeValue(data.notes),
        user_id: user?.id,
      };

      if (mode === 'create') {
        const { data: newMember, error } = await supabase
          .from('members')
          .insert([memberData] as any)
          .select()
          .single() as { data: any; error: any };

        if (error) throw error;

        toast({
          title: 'Successo',
          description: 'Atleta creato con successo',
          variant: 'success',
        });

        await queryClient.invalidateQueries({ queryKey: membersQueryKeys.all });

        router.push(`/dashboard/members/${newMember?.id}`);
      } else {
        console.log('Updating member with ID:', member!.id);
        console.log('Update data:', memberData);

        const { error } = await supabase
          .from('members')
          // @ts-expect-error - Supabase type inference issue
          .update({
            ...memberData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', member!.id);

        console.log('Update error:', error);

        if (error) throw error;

        toast({
          title: 'Successo',
          description: 'Atleta aggiornato con successo',
          variant: 'success',
        });

        await queryClient.invalidateQueries({ queryKey: membersQueryKeys.all });
        if (member?.id) {
          await queryClient.invalidateQueries({ queryKey: membersQueryKeys.detail(member.id) });
          await queryClient.invalidateQueries({ queryKey: membersQueryKeys.base(member.id) });
        }

        router.push(`/dashboard/members/${member!.id}`);
      }

      router.refresh();
    } catch (error: any) {
      console.error('Error saving member:', error);

      toast({
        title: 'Errore',
        description: 'Impossibile salvare l\'atleta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log('Form validation failed:', errors);
    toast({
      title: 'Errore di Validazione',
      description: 'Controlla i campi obbligatori e riprova',
      variant: 'destructive',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 mx-1 rounded ${
                step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Step {currentStep} di {totalSteps}
        </p>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={currentStep === 1 ? 'font-semibold text-blue-600' : ''}>Dati Personali</span>
          <span className={currentStep === 2 ? 'font-semibold text-blue-600' : ''}>Contatti</span>
          <span className={currentStep === 3 ? 'font-semibold text-blue-600' : ''}>Tesseramento</span>
          <span className={currentStep === 4 ? 'font-semibold text-blue-600' : ''}>Documenti</span>
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Dati Personali</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="first_name">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input id="first_name" {...register('first_name')} placeholder="Mario" />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name">
                Cognome <span className="text-red-500">*</span>
              </Label>
              <Input id="last_name" {...register('last_name')} placeholder="Rossi" />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="fiscal_code">Codice Fiscale</Label>
            <Input
              id="fiscal_code"
              {...register('fiscal_code')}
              placeholder="RSSMRA80A01H501Z"
              maxLength={16}
            />
            {errors.fiscal_code && (
              <p className="mt-1 text-sm text-red-600">{errors.fiscal_code.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="birth_date">
                Data di Nascita <span className="text-red-500">*</span>
              </Label>
              <Input id="birth_date" type="date" {...register('birth_date')} />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birth_place">Luogo di Nascita</Label>
              <Input id="birth_place" {...register('birth_place')} placeholder="Modena" />
            </div>
          </div>

          <div>
            <Label htmlFor="gender">
              Genere <span className="text-red-500">*</span>
            </Label>
            <select
              id="gender"
              {...register('gender')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
              <option value="other">Altro</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Contact & Address */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contatti e Indirizzo</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="mario.rossi@email.it" />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" type="tel" {...register('phone')} placeholder="059 123456" />
            </div>
          </div>

          <div>
            <Label htmlFor="mobile">Cellulare</Label>
            <Input id="mobile" type="tel" {...register('mobile')} placeholder="333 1234567" />
          </div>

          <div>
            <Label htmlFor="address">Indirizzo</Label>
            <Input id="address" {...register('address')} placeholder="Via Roma, 123" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">Città</Label>
              <Input id="city" {...register('city')} placeholder="Modena" />
            </div>

            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input id="province" {...register('province')} placeholder="MO" maxLength={2} />
              {errors.province && (
                <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="postal_code">CAP</Label>
              <Input id="postal_code" {...register('postal_code')} placeholder="41121" maxLength={5} />
              {errors.postal_code && (
                <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Membership & Athletic Info */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Tesseramento e Dati Atletici</h3>

          {/* Membership Section */}
          <div className="space-y-4 border-b pb-4">
            <h4 className="text-md font-medium text-gray-700">Dati Tesseramento</h4>

            <div>
              <Label htmlFor="society_id">
                Società <span className="text-red-500">*</span>
              </Label>
              <select
                id="society_id"
                {...register('society_id')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">Seleziona una società</option>
                {societies.map((society) => (
                  <option key={society.id} value={society.id}>
                    {society.name} {society.society_code ? `(${society.society_code})` : ''}
                  </option>
                ))}
              </select>
              {errors.society_id && (
                <p className="mt-1 text-sm text-red-600">{errors.society_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="society_code">
                Codice Società <span className="text-red-500">*</span>
              </Label>
              <Input
                id="society_code"
                {...register('society_code')}
                placeholder="Auto-popolato dalla società"
                readOnly
                className="bg-gray-50"
              />
              {errors.society_code && (
                <p className="mt-1 text-sm text-red-600">{errors.society_code.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="membership_number">Numero Tessera</Label>
                <Input id="membership_number" {...register('membership_number')} placeholder="12345" />
              </div>

              <div>
                <Label htmlFor="membership_date">Data Tesseramento</Label>
                <Input id="membership_date" type="date" {...register('membership_date')} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="membership_type">Tipo Tesseramento</Label>
                <Input id="membership_type" {...register('membership_type')} placeholder="Annuale" />
              </div>

              <div>
                <Label htmlFor="membership_status">Stato Tesseramento</Label>
                <select
                  id="membership_status"
                  {...register('membership_status')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="active">Attivo</option>
                  <option value="suspended">Sospeso</option>
                  <option value="expired">Scaduto</option>
                  <option value="cancelled">Annullato</option>
                </select>
              </div>
            </div>
          </div>

          {/* Athletic Info Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700">Dati Atletici</h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="year">Anno Gestione</Label>
                <Input id="year" type="number" {...register('year')} placeholder="2024" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="regional_code">Codice Regionale</Label>
                <Input id="regional_code" {...register('regional_code')} placeholder="ER123" />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  {...register('category')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50"
                >
                  <option value="">Auto-assegnata da età e genere</option>
                  {watchGender && (watchGender === 'M' || watchGender === 'F') &&
                    getCategoriesByGender(watchGender).map((cat) => (
                      <option key={cat.code} value={cat.code} title={cat.description}>
                        {cat.name} ({cat.ageMin}-{cat.ageMax || '∞'} anni)
                      </option>
                    ))
                  }
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Categoria calcolata automaticamente (modificabile)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_foreign"
                type="checkbox"
                {...register('is_foreign')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <Label htmlFor="is_foreign" className="cursor-pointer">
                Atleta Straniero
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Documents */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Documenti</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="medical_certificate_date">Data Certificato Medico</Label>
              <Input id="medical_certificate_date" type="date" {...register('medical_certificate_date')} />
            </div>

            <div>
              <Label htmlFor="medical_certificate_expiry">Data Scadenza Certificato</Label>
              <Input id="medical_certificate_expiry" type="date" {...register('medical_certificate_expiry')} />
            </div>
          </div>

          <div>
            <Label htmlFor="photo_url">URL Foto</Label>
            <Input id="photo_url" type="url" {...register('photo_url')} placeholder="https://esempio.it/foto.jpg" />
            {errors.photo_url && (
              <p className="mt-1 text-sm text-red-600">{errors.photo_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Note</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Note aggiuntive sull'atleta..."
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <div>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Annulla
          </Button>

          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep} disabled={isLoading}>
              Avanti
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvataggio...' : mode === 'create' ? 'Crea Atleta' : 'Salva Modifiche'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
