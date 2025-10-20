import { Metadata } from 'next';
import { RegisterForm } from '@/components/forms/RegisterForm';

export const metadata: Metadata = {
  title: 'Registrazione | ComUniMo',
  description: 'Crea un nuovo account ComUniMo',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Registrati</h2>
        <p className="mt-2 text-sm text-gray-600">
          Crea un nuovo account per iniziare
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}

