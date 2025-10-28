import { Metadata } from 'next';
import { LoginForm } from '@/components/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Login | ComUniMo',
  description: 'Accedi al tuo account ComUniMo',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Accedi</h2>
        <p className="mt-2 text-sm text-gray-600">
          Inserisci le tue credenziali per accedere
        </p>
      </div>
      <LoginForm />
    </div>
  );
}

