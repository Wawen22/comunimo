'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { calculateDisplayCategory } from '@/lib/utils/categoryCalculator';
import { publicRegisterAthleteAction } from '@/actions/public-registration';
import { CheckCircle2, Loader2, UserPlus, ArrowLeft, Hash } from 'lucide-react';
import Link from 'next/link';

const registrationSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Il nome deve avere almeno 2 caratteri')
    .max(100, 'Il nome non può superare 100 caratteri'),
  last_name: z
    .string()
    .min(2, 'Il cognome deve avere almeno 2 caratteri')
    .max(100, 'Il cognome non può superare 100 caratteri'),
  birth_date: z
    .string()
    .min(1, 'La data di nascita è obbligatoria')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date < new Date();
    }, 'Data di nascita non valida'),
  gender: z.enum(['M', 'F'], {
    required_error: 'Seleziona il sesso',
  }),
  membership_number: z
    .string()
    .min(1, 'Il numero tessera è obbligatorio')
    .max(50, 'Il numero tessera non può superare 50 caratteri'),
  membership_type: z.enum(['UISP', 'FIDAL', 'ALTRO'], {
    required_error: 'Seleziona il tipo tessera',
  }),
  society_name: z
    .string()
    .min(2, 'Il nome della società deve avere almeno 2 caratteri')
    .max(200, 'Il nome della società non può superare 200 caratteri'),
  society_code: z
    .string()
    .min(1, 'Il codice società è obbligatorio')
    .max(50, 'Il codice società non può superare 50 caratteri'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function PublicRegistrationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedBibNumber, setAssignedBibNumber] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      birth_date: '',
      membership_number: '',
      society_name: '',
      society_code: '',
    },
  });

  const birthDate = watch('birth_date');
  const gender = watch('gender');

  // Auto-calculate category
  const calculatedCategory = useMemo(() => {
    if (!birthDate || !gender) return null;
    return calculateDisplayCategory(birthDate, gender);
  }, [birthDate, gender]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);

    try {
      const result = await publicRegisterAthleteAction({
        ...data,
        membership_number: data.membership_number || '',
        society_code: data.society_code || '',
        category: calculatedCategory,
      });

      if (!result.success) {
        toast({
          title: 'Errore',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      setAssignedBibNumber(result.bibNumber);
      setIsSuccess(true);
      toast({
        title: 'Iscrizione completata',
        description: `Atleta iscritto con pettorale n° ${result.bibNumber}`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Errore',
        description: 'Errore di connessione. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRegistration = () => {
    reset();
    setIsSuccess(false);
    setAssignedBibNumber(null);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-slate-900">
            Iscrizione completata!
          </h3>
          <p className="max-w-md text-sm text-slate-600">
            L'atleta è stato registrato con successo nel sistema e comparirà nella lista degli iscritti.
          </p>
        </div>

        {assignedBibNumber && (
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 px-6 py-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Hash className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Pettorale assegnato</p>
              <p className="text-3xl font-bold tabular-nums text-slate-900">{assignedBibNumber}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleNewRegistration} variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Iscrivi un altro atleta
          </Button>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            Nome <span className="text-red-500">*</span>
          </Label>
          <Input
            id="first_name"
            placeholder="Mario"
            {...register('first_name')}
            disabled={isLoading}
          />
          {errors.first_name && (
            <p className="text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">
            Cognome <span className="text-red-500">*</span>
          </Label>
          <Input
            id="last_name"
            placeholder="Rossi"
            {...register('last_name')}
            disabled={isLoading}
          />
          {errors.last_name && (
            <p className="text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Birth date & Gender */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birth_date">
            Data di Nascita <span className="text-red-500">*</span>
          </Label>
          <Input
            id="birth_date"
            type="date"
            {...register('birth_date')}
            disabled={isLoading}
          />
          {errors.birth_date && (
            <p className="text-sm text-red-600">{errors.birth_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Sesso <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => setValue('gender', value as 'M' | 'F')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Maschile</SelectItem>
              <SelectItem value="F">Femminile</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
      </div>

      {/* Auto-calculated category */}
      {calculatedCategory && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
          <p className="text-sm text-slate-700">
            <span className="font-medium">Categoria calcolata:</span>{' '}
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              {calculatedCategory}
            </span>
          </p>
        </div>
      )}

      {/* Membership info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="membership_number">
            N° Tessera <span className="text-red-500">*</span>
          </Label>
          <Input
            id="membership_number"
            placeholder="es. 12345"
            {...register('membership_number')}
            disabled={isLoading}
          />
          {errors.membership_number && (
            <p className="text-sm text-red-600">{errors.membership_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Tipo Tessera <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) =>
              setValue('membership_type', value as 'UISP' | 'FIDAL' | 'ALTRO')
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UISP">UISP</SelectItem>
              <SelectItem value="FIDAL">FIDAL</SelectItem>
              <SelectItem value="ALTRO">Altro</SelectItem>
            </SelectContent>
          </Select>
          {errors.membership_type && (
            <p className="text-sm text-red-600">{errors.membership_type.message}</p>
          )}
        </div>
      </div>

      {/* Society info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="society_name">
            Società <span className="text-red-500">*</span>
          </Label>
          <Input
            id="society_name"
            placeholder="es. ASD Atletica Modena"
            {...register('society_name')}
            disabled={isLoading}
          />
          {errors.society_name && (
            <p className="text-sm text-red-600">{errors.society_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="society_code">
            Codice Società <span className="text-red-500">*</span>
          </Label>
          <Input
            id="society_code"
            placeholder="es. MO001"
            {...register('society_code')}
            disabled={isLoading}
          />
          {errors.society_code && (
            <p className="text-sm text-red-600">{errors.society_code.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrazione in corso...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Iscrivi Atleta
          </>
        )}
      </Button>
    </form>
  );
}
