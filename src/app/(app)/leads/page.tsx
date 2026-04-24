import { db } from '@/lib/prisma';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { Badge, LEAD_BADGE, LEAD_LABEL } from '@/components/Badge';
import { Plus, ChevronRight, Phone } from 'lucide-react';

export default async function LeadsPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <>
      <AppHeader title="Leads" right={
        <Link href="/leads/new" className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700">
          <Plus className="h-5 w-5 text-white" />
        </Link>
      } />
      <div className="pt-14 pb-24 px-4 space-y-2">
        <div className="pt-4" />
        {leads.map(lead => (
          <Link key={lead.id} href={`/leads/${lead.id}`}
            className="flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 active:bg-gray-50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{lead.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {lead.company && <p className="text-xs text-gray-400 truncate">{lead.company}</p>}
                <Badge label={LEAD_LABEL[lead.status]!} variant={LEAD_BADGE[lead.status]} />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-gray-100 active:bg-gray-200">
                  <Phone className="h-4 w-4 text-gray-600" />
                </a>
              )}
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </Link>
        ))}
        {leads.length === 0 && (
          <div className="bg-white rounded-2xl px-4 py-12 text-center">
            <p className="text-gray-400 text-sm mb-4">Aucun lead</p>
            <Link href="/leads/new" className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
              Créer un lead
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
