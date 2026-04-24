import { db } from '@/lib/prisma';
import { AppHeader } from '@/components/AppHeader';
import { euros, dateFull } from '@/lib/utils';

export default async function PaymentsPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [payments, monthTotal, totalUnpaid] = await Promise.all([
    db.payment.findMany({
      orderBy: { paidAt: 'desc' }, take: 30,
      include: { invoice: { include: { client: { select: { name: true } } } } },
    }),
    db.payment.aggregate({ _sum: { amountCents: true }, where: { paidAt: { gte: monthStart } } }),
    db.invoice.aggregate({
      _sum: { totalCents: true },
      where: { status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
    }),
  ]);
  const METHOD: Record<string, string> = {
    BANK_TRANSFER: 'Virement', CARD: 'Carte', CASH: 'Espèces', CHECK: 'Chèque', OTHER: 'Autre',
  };
  return (
    <>
      <AppHeader title="Paiements" />
      <div className="pt-14 pb-24 px-4 space-y-5">
        <div className="pt-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Reçu ce mois</p>
            <p className="text-xl font-bold text-green-600">{euros(monthTotal._sum.amountCents ?? 0)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">À encaisser</p>
            <p className="text-xl font-bold text-orange-600">{euros(totalUnpaid._sum.totalCents ?? 0)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Derniers paiements</p>
          {payments.map(p => (
            <div key={p.id} className="flex items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center mr-3 shrink-0">
                <span className="text-green-600 font-bold text-sm">€</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{p.invoice.client.name}</p>
                <p className="text-xs text-gray-400">{METHOD[p.method]} · {dateFull(p.paidAt)}</p>
              </div>
              <p className="text-sm font-bold text-green-600 ml-3 shrink-0">+{euros(p.amountCents)}</p>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="bg-white rounded-2xl px-4 py-8 text-center text-sm text-gray-400">Aucun paiement</div>
          )}
        </div>
      </div>
    </>
  );
}
