import { db } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { euros, dateShort, isPast } from '@/lib/utils';
import { AppHeader } from '@/components/AppHeader';
import { Badge, ORDER_BADGE, ORDER_LABEL } from '@/components/Badge';
import Link from 'next/link';
import { TrendingUp, Package, FileText, AlertCircle } from 'lucide-react';
import { signOut } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenue, activeOrders, pendingQuotes, overdueTasks, recentOrders, urgentTasks] =
    await Promise.all([
      db.payment.aggregate({ _sum: { amountCents: true }, where: { paidAt: { gte: monthStart } } }),
      db.order.count({ where: { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY'] } } }),
      db.quote.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      db.task.count({ where: { status: { notIn: ['DONE', 'CANCELED'] }, dueAt: { lt: now } } }),
      db.order.findMany({ take: 4, orderBy: { createdAt: 'desc' }, include: { client: { select: { name: true } } } }),
      db.task.findMany({ where: { status: 'TODO', priority: { in: ['HIGH', 'URGENT'] } }, take: 3, orderBy: { dueAt: 'asc' } }),
    ]);

  const kpis = [
    { label: 'CA ce mois',  value: euros(revenue._sum.amountCents ?? 0), icon: TrendingUp, color: 'bg-indigo-500' },
    { label: 'Commandes',   value: String(activeOrders),  icon: Package,      color: 'bg-blue-500' },
    { label: 'Devis',       value: String(pendingQuotes), icon: FileText,     color: 'bg-orange-500' },
    { label: 'Retard',      value: String(overdueTasks),  icon: AlertCircle,  color: overdueTasks > 0 ? 'bg-red-500' : 'bg-gray-400' },
  ];

  return (
    <>
      <AppHeader title="Petch Merch" right={
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
          <button className="text-xs text-gray-400 px-2 py-1">Sortir</button>
        </form>
      } />
      <div className="pt-14 pb-24 px-4 space-y-5">
        <div className="pt-4">
          <p className="text-gray-500 text-sm">Bonjour 👋</p>
          <p className="text-xl font-bold text-gray-900">{session?.user?.name?.split(' ')[0]}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`h-8 w-8 rounded-xl ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Commandes récentes</h2>
            <Link href="/orders" className="text-xs text-indigo-600 font-medium">Tout voir</Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map(o => (
              <Link key={o.id} href={`/orders/${o.id}`}
                className="flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 active:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{o.client.name}</p>
                  <p className="text-xs text-gray-400 truncate">{o.title}</p>
                </div>
                <Badge label={ORDER_LABEL[o.status]!} variant={ORDER_BADGE[o.status]} />
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <div className="bg-white rounded-2xl px-4 py-6 text-center text-sm text-gray-400">Aucune commande</div>
            )}
          </div>
        </section>
        {urgentTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Tâches urgentes</h2>
              <Link href="/tasks" className="text-xs text-indigo-600 font-medium">Tout voir</Link>
            </div>
            <div className="space-y-2">
              {urgentTasks.map(t => (
                <Link key={t.id} href="/tasks"
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 active:bg-gray-50">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${t.priority === 'URGENT' ? 'bg-red-500' : 'bg-orange-400'}`} />
                  <p className="flex-1 text-sm text-gray-800 truncate">{t.title}</p>
                  {t.dueAt && (
                    <span className={`text-xs shrink-0 ${isPast(t.dueAt) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {dateShort(t.dueAt)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/leads/new',  label: '+ Nouveau lead',  color: 'bg-indigo-600 text-white' },
              { href: '/quotes/new', label: '+ Nouveau devis', color: 'bg-white text-gray-900 border border-gray-200' },
              { href: '/clients',    label: 'Clients',         color: 'bg-white text-gray-900 border border-gray-200' },
              { href: '/invoices',   label: 'Factures',        color: 'bg-white text-gray-900 border border-gray-200' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`rounded-2xl px-4 py-3.5 text-sm font-semibold text-center shadow-sm active:opacity-80 ${a.color}`}>
                {a.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
