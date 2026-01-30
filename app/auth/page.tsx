import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-void p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-2 text-paper">Welcome to Vesper</h1>
          <p className="text-paper/60">Sign in to continue</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}

