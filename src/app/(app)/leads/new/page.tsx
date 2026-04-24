import { AppHeader } from '@/components/AppHeader';
import { createLead } from '@/services/leads';

const ic = 'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-indigo-400';

export default function NewLeadPage() {
  return (
    <>
      <AppHeader title="Nouveau lead" back="/leads" />
      <div className="pt-14 pb-24 px-4">
        <form action={createLead} className="pt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
            <input name="name" required placeholder="Jean Dupont" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Société</label>
            <input name="company" placeholder="Acme Corp" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input name="email" type="email" placeholder="jean@acme.fr" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
            <input name="phone" type="tel" placeholder="06 12 34 56 78" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
            <select name="source" className={ic}>
              <option value="INSTAGRAM">Instagram</option>
              <option value="REFERRAL">Recommandation</option>
              <option value="WEBSITE">Site web</option>
              <option value="PHONE">Téléphone</option>
              <option value="EMAIL">Email</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea name="notes" rows={3} placeholder="Détails du projet…" className={ic} />
          </div>
          <button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-semibold text-base active:bg-indigo-700">
            Créer le lead
          </button>
        </form>
      </div>
    </>
  );
}
