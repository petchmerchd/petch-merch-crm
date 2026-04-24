import { db } from '@/lib/prisma';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { Badge, ORDER_BADGE, ORDER_LABEL } from '@/components/Badge';
import { euros, dateShort } from '@/lib/utils';
import { ChevronRight, Clock } from 'lucide-react';

const PRIO: Record<string, string> = { LOW: 'bg-gray-200', NORMAL: 'bg-blue-300', HIGH: 'bg-orange-400', URGENT: 'bg-red-500' };

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    orderBy: [{ priority: 'desc' }, { deliveryDate: 'asc' }],
    include: { client: { select: { name: true } } },
  });
  const active = orders.filter(o => !['COMPLETED', 'CANCELED'].includes(o.status));
  const done   = orders.filter(o => ['COMPLETED', 'CANCELED'].includes(o.status)).slice(0, 5);
  return (
    <>
      <AppHeader title="Commandes" />
      <div className="pt-14 pb-24 px-4 space-y-5">
        <div className="pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">En cours ({active.length})</p>
          {active.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`}
              className="block bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 active:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${PRIO[o.priority]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{o.client.name}</p>
                    <Badge label={ORDER_LABEL[o.status]!} variant={ORDER_BADGE[o.status]} />
                  </div>
                  <p className="text-xs text-gray-400 truncate mb-2">{o.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">{euros(o.totalCents)}</span>
                    {o.deliveryDate && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />{dateShort(o.deliveryDate)}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
          {active.length === 0 && (
            <div className="bg-white rounded-2xl px-4 py-8 text-center text-sm text-gray-400">Aucune commande active</div>
          )}
        </div>
        {done.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Récentes</p>
            {done.map(o => (
              <Link key={o.id} href={`/orders/${o.id}`}
                className="flex items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 opacity-60 active:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate">{o.client.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{o.number}</p>
                </div>
                <Badge label={ORDER_LABEL[o.status]!} variant={ORDER_BADGE[o.status]} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
