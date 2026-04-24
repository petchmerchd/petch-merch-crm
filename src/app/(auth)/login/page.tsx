import { signIn, auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const session = await auth();
  if (session) redirect('/');
  const { e } = await searchParams;
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
            <span className="text-2xl font-black text-white">PM</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Petch Merch</h1>
          <p className="text-gray-400 text-sm mt-1">Votre CRM</p>
        </div>
        {e && (
          <div className="mb-4 rounded-xl bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-300 text-center">
            Email ou mot de passe incorrect
          </div>
        )}
        <form className="space-y-4" action={async (fd) => {
          'use server';
          try {
            await signIn('credentials', { email: fd.get('email'), password: fd.get('password'), redirectTo: '/' });
          } catch (err) {
            if (err instanceof AuthError) redirect('/login?e=1');
            throw err;
          }
        }}>
          <input name="email" type="email" required autoComplete="email" placeholder="Email"
            className="w-full h-14 rounded-2xl bg-gray-800 border border-gray-700 px-4 text-white placeholder-gray-500 text-base focus:outline-none focus:border-indigo-500" />
          <input name="password" type="password" required autoComplete="current-password" placeholder="Mot de passe"
            className="w-full h-14 rounded-2xl bg-gray-800 border border-gray-700 px-4 text-white placeholder-gray-500 text-base focus:outline-none focus:border-indigo-500" />
          <button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-semibold text-base active:bg-indigo-700">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
