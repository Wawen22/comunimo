import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Password Dimenticata | ComUniMo',
  description: 'Recupera la tua password ComUniMo',
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Password dimenticata
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Inserisci la tua email per ricevere il link di reset
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}

