import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | ComUniMo',
  description: 'Reimposta la tua password ComUniMo',
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Reimposta password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Inserisci la tua nuova password
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}

