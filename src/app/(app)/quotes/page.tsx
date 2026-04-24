import { db } from '@/lib/prisma';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { Badge, QUOTE_BADGE, QUOTE_LABEL } from '@/components/Badge';
import { euros, dateShort } from '@/lib/utils';
import { Plus, ChevronRight } from 'lucide-react';

export default async function QuotesPage() {
  const quotes = await db.quote.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true } } },
  });
  return (
    <>
      <AppHeader title="Devis" right={
        <Link href="/quotes/new" className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700">
          <Plus className="h-5 w-5 text-white" />
        </Link>
      } />
      <div className="pt-14 pb-24 px-4 space-y-2">
        <div className="pt-4" />
        {quotes.map(q => (
          <Link key={q.id} href={`/quotes/${q.id}`}
            className="flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 active:bg-gray-50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{q.client.name}</p>
                <Badge label={QUOTE_LABEL[q.status]!} variant={QUOTE_BADGE[q.status]} />
              </div>
              <p className="text-xs text-gray-400 truncate mb-1">{q.title}</p>
              <p className="text-xs font-semibold text-gray-700">{euros(q.totalCents)} · valide jusqu'au {dateShort(q.validUntil)}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 ml-2 shrink-0" />
          </Link>
        ))}
        {quotes.length === 0 && (
          <div className="bg-white rounded-2xl px-4 py-12 text-center">
            <p className="text-gray-400 text-sm mb-4">Aucun devis</p>
            <Link href="/quotes/new" className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
              Créer un devis
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
