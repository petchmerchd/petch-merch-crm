import { db } from '@/lib/prisma';
import { euros } from '@/lib/utils';
import { KPI } from '@/components/KPI';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    revenue,
    orders,
    quotes,
    unpaidInvoices,
    recentOrders,
  ] = await Promise.all([
    db.payment.aggregate({
      _sum: { amountCents: true },
      where: { paidAt: { gte: monthStart } },
    }),
    db.order.count({
      where: { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY'] } },
    }),
    db.quote.count({
      where: { status: { in: ['SENT', 'DRAFT'] } },
    }),
    db.invoice.count({
      where: { status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
    }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
  ]);

  return (
    <div className="pt-14 pb-24 px-4 space-y-5">
      <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KPI
          label="CA ce mois"
          value={euros(revenue._sum.amountCents ?? 0)}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          color="bg-indigo-500"
        />
        <KPI
          label="Commandes"
          value={String(orders)}
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          color="bg-blue-500"
        />
        <KPI
          label="Devis"
          value={String(quotes)}
          icon={<FileText className="h-5 w-5 text-white" />}
          color="bg-orange-500"
        />
        <KPI
          label="Impayés"
          value={String(unpaidInvoices)}
          icon={<AlertTriangle className="h-5 w-5 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/leads/new" className="btn">+ Lead</Link>
        <Link href="/quotes/new" className="btn">+ Devis</Link>
        <Link href="/orders" className="btn">Commandes</Link>
        <Link href="/tasks" className="btn">Tâches</Link>
      </div>

      {/* Commandes récentes */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase">
          Commandes récentes
        </p>

        {recentOrders.length === 0 && (
          <p className="text-sm text-gray-400">Aucune commande</p>
        )}

        {recentOrders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm active:bg-gray-50"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {order.client.name}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {order.number}
              </p>
            </div>

            <span className="text-xs text-indigo-600 font-semibold">
              Voir →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function KPI({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border p-4 flex justify-between">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );
}
