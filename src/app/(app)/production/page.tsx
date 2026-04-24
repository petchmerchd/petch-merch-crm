import { db } from '@/lib/prisma';
import { AppHeader } from '@/components/AppHeader';
import { updateStepStatus } from '@/services/orders';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const PRIO: Record<string, string> = { URGENT: '🔴', HIGH: '🟠', NORMAL: '🟡', LOW: '⚪' };
const STEP_COLOR: Record<string, string> = {
  TODO: 'border-gray-300 bg-white',
  IN_PROGRESS: 'bg-indigo-500 border-indigo-500',
  DONE: 'bg-green-500 border-green-500',
  BLOCKED: 'bg-red-500 border-red-500',
};

export default async function ProductionPage() {
  const orders = await db.order.findMany({
    where: { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK'] } },
    include: { client: { select: { name: true } }, productionSteps: { orderBy: { position: 'asc' } } },
    orderBy: [{ priority: 'desc' }, { deliveryDate: 'asc' }],
  });
  return (
    <>
      <AppHeader title="Production" />
      <div className="pt-14 pb-24 px-4 space-y-4">
        <div className="pt-4" />
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl px-4 py-12 text-center">
            <p className="text-2xl mb-2">🏭</p>
            <p className="text-sm text-gray-400">Aucune commande en production</p>
          </div>
        )}
        {orders.map(order => {
          const done  = order.productionSteps.filter(s => s.status === 'DONE').length;
          const total = order.productionSteps.length;
          const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Link href={`/orders/${order.id}`} className="flex items-center px-4 py-3.5 border-b border-gray-50 active:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{PRIO[order.priority]}</span>
                    <p className="font-semibold text-gray-900 text-sm truncate">{order.client.name}</p>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{order.title}</p>
                  {total > 0 && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 ml-3 shrink-0" />
              </Link>
              <div className="divide-y divide-gray-50">
                {order.productionSteps.map(step => (
                  <div key={step.id} className="flex items-center gap-3 px-4 py-3">
                    <form action={updateStepStatus.bind(null, step.id,
                      step.status === 'DONE' ? 'TODO' : step.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}>
                      <button className={`h-7 w-7 rounded-full border-2 flex items-center justify-center active:scale-95 ${STEP_COLOR[step.status]}`}>
                        {step.status === 'DONE' && <span className="text-white text-xs">✓</span>}
                        {step.status === 'IN_PROGRESS' && <span className="text-white text-[10px]">▶</span>}
                      </button>
                    </form>
                    <div className="flex-1">
                      <p className={`text-sm ${step.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{step.name}</p>
                      {step.technique && <p className="text-xs text-indigo-500">{step.technique}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
