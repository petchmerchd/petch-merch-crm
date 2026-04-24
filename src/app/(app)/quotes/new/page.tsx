import { db } from '@/lib/prisma';
import { AppHeader } from '@/components/AppHeader';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NewQuoteForm } from './NewQuoteForm';

export default async function NewQuotePage() {
  const session = await auth();
  if (!session) redirect('/login');
  const clients = await db.client.findMany({ orderBy: { name: 'asc' } });
  if (clients.length === 0) {
    return (
      <>
        <AppHeader title="Nouveau devis" back="/quotes" />
        <div className="pt-20 pb-24 px-4 text-center space-y-4">
          <p className="text-4xl">👥</p>
          <p className="text-gray-500 text-sm">Créez d'abord un client</p>
          <a href="/leads/new" className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
            Créer un lead
          </a>
        </div>
      </>
    );
  }
  return (
    <>
      <AppHeader title="Nouveau devis" back="/quotes" />
      <NewQuoteForm clients={clients.map(c => ({ id: c.id, name: c.name, company: c.company }))} userId={session.user.id} />
    </>
  );
}
