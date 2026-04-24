import { db } from '@/lib/prisma';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { ChevronRight, Phone } from 'lucide-react';

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { orders: true, quotes: true } } },
  });
  return (
    <>
      <AppHeader title="Clients" />
      <div className="pt-14 pb-24 px-4 space-y-2">
        <div className="pt-4" />
        {clients.map(c => (
          <Link key={c.id} href={`/clients/${c.id}`}
            className="flex items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm active:bg-gray-50">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center mr-3 shrink-0">
              <span className="text-sm font-bold text-indigo-600">{c.name[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
              {c.company && <p className="text-xs text-gray-400 truncate">{c.company}</p>}
              <p className="text-xs text-gray-400 mt-0.5">{c._count.orders} cmd · {c._count.quotes} devis</p>
            </div>
            <div className="flex items-center gap-2">
              {c.phone && (
                <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-gray-100 active:bg-gray-200">
                  <Phone className="h-4 w-4 text-gray-600" />
                </a>
              )}
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </Link>
        ))}
        {clients.length === 0 && (
          <div className="bg-white rounded-2xl px-4 py-8 text-center text-sm text-gray-400">
            Aucun client — convertissez un lead
          </div>
        )}
      </div>
    </>
  );
}
