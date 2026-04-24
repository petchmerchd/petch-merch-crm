import { db } from '@/lib/prisma';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { Badge, INVOICE_BADGE, INVOICE_LABEL } from '@/components/Badge';
import { euros, dateShort, isPast } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export default async function InvoicesPage() {
  const invoices = await db.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true } } },
  });
  const unpaid = invoices.filter(i => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status));
  const rest   = invoices.filter(i => !['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status)).slice(0, 10);
  const totalUnpaid = unpaid.reduce((s, i) => s + (i.totalCents - i.paidCents), 0);
  return (
    <>
      <AppHeader title="Factures" />
      <div className="pt-14 pb-24 px-4 space-y-5">
        <div className="pt-4" />
        {unpaid.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium">À encaisser</p>
              <p className="text-2xl font-bold text-orange-700">{euros(totalUnpaid)}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        )}
        {unpaid.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">En attente</p>
            {unpaid.map(inv => (
              <Link key={inv.id} href={`/invoices/${inv.id}`}
                className="flex items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm active:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{inv.client.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">{inv.number}</p>
                    {inv.dueAt && isPast(inv.dueAt) && <span className="text-xs text-red-500 font-medium">⚠ Retard</span>}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-bold text-gray-900">{euros(inv.totalCents - inv.paidCents)}</p>
                  <p className="text-xs text-gray-400">reste</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 ml-2 shrink-0" />
              </Link>
            ))}
          </div>
        )}
        {rest.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Récentes</p>
            {rest.map(inv => (
              <Link key={inv.id} href={`/invoices/${inv.id}`}
                className="flex items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 opacity-70 active:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{inv.client.name}</p>
                  <p className="text-xs text-gray-400">{inv.number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{euros(inv.totalCents)}</span>
                  <Badge label={INVOICE_LABEL[inv.status]!} variant={INVOICE_BADGE[inv.status]} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
