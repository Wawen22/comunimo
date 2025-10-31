'use client';

import { useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { ProfileEditForm } from '@/components/forms/ProfileEditForm';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { getRoleDisplayName } from '@/lib/utils/permissions';
import { useGuidedTour } from '@/components/guided-tour/GuidedTourProvider';
import { GUIDED_REGISTRATION_TOUR_ID } from '@/components/dashboard/guided-registration/GuidedRegistrationTourManager';
import { useToast } from '@/components/ui/toast';
import { User, Mail, Phone, FileText, Shield, Edit, RefreshCcw } from 'lucide-react';

export function ProfileView() {
  const { profile, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { toast } = useToast();
  const {
    reset: resetGuidedTour,
    completion: guidedTourCompleted,
    isActive: guidedTourActive,
    activeTourId,
  } = useGuidedTour(GUIDED_REGISTRATION_TOUR_ID);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-600">Impossibile caricare il profilo</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Modifica Profilo
            </h2>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Annulla
            </Button>
          </div>
          <ProfileEditForm
            profile={profile}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <Avatar
              fallback={profile.full_name || profile.email}
              className="h-20 w-20"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.full_name || 'Utente'}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{profile.email}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <Shield className="h-4 w-4" />
                {getRoleDisplayName(profile.role)}
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full justify-center gap-2 sm:w-auto sm:self-start"
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Informazioni Personali
        </h3>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Nome Completo</p>
              <p className="text-gray-900">{profile.full_name || 'Non specificato'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Telefono</p>
                <p className="text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}

          {profile.fiscal_code && (
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Codice Fiscale</p>
                <p className="text-gray-900">{profile.fiscal_code}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Sicurezza</h3>
        
        {showChangePassword ? (
          <div className="mt-6">
            <ChangePasswordForm onSuccess={() => setShowChangePassword(false)} />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowChangePassword(false)}
            >
              Annulla
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Cambia la tua password per mantenere il tuo account sicuro
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowChangePassword(true)}
            >
              Cambia Password
            </Button>
          </div>
        )}

        <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Guida iscrizione campionato
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                Reimposta il tour guidato per ripercorrere i passaggi di iscrizione con la procedura interattiva.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 md:w-52">
              <Button
                variant="outline"
                onClick={() => {
                  resetGuidedTour();
                  toast({
                    title: 'Guida ripristinata',
                    description: 'La guida all’iscrizione verrà riproposta dal primo passo.',
                  });
                }}
                disabled={guidedTourActive && activeTourId === GUIDED_REGISTRATION_TOUR_ID}
                className="w-full justify-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Reimposta guida
              </Button>
              <span className="text-xs text-slate-500">
                {guidedTourCompleted
                  ? 'Stato: completata – puoi ripeterla in ogni momento.'
                  : 'La guida non è ancora stata completata.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
