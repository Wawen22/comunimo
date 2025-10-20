'use client';

import { useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { ProfileEditForm } from '@/components/forms/ProfileEditForm';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { getRoleDisplayName } from '@/lib/utils/permissions';
import { User, Mail, Phone, FileText, Shield, Edit } from 'lucide-react';

export function ProfileView() {
  const { profile, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              fallback={profile.full_name || profile.email}
              className="h-20 w-20"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.full_name || 'Utente'}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{profile.email}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <Shield className="h-4 w-4" />
                {getRoleDisplayName(profile.role)}
              </div>
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
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
      </div>
    </div>
  );
}

