'use client';
import { useState, useTransition } from 'react';
import { createQuote } from '@/services/quotes';
import { Trash2, Plus } from 'lucide-react';

type Client = { id: string; name: string; company: string | null };
type LineItem = { id: number; description: string; quantity: string; unit: string; unitPriceEuros: string; vatRate: string };

const emptyLine = (id: number): LineItem => ({ id, description: '', quantity: '1', unit: 'unité', unitPriceEuros: '', vatRate: '20' });
const ic = 'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-indigo-400';
const sm = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400';

export function NewQuoteForm({ clients, userId }: { clients: Client[]; userId: string }) {
  const [lines, setLines] = useState<LineItem[]>([emptyLine(1)]);
  const [nextId, setNextId] = useState(2);
  const [isPending, startTransition] = useTransition();

  const addLine = () => { setLines(p => [...p, emptyLine(nextId)]); setNextId(n => n + 1); };
  const removeLine = (id: number) => { if (lines.length > 1) setLines(p => p.filter(l => l.id !== id)); };
  const updateLine = (id: number, field: keyof LineItem, value: string) =>
    setLines(p => p.map(l => l.id === id ? { ...l, [field]: value } : l));

  const total = lines.reduce((s, l) => {
    const qty = parseFloat(l.quantity) || 0;
    const price = parseFloat(l.unitPriceEuros) || 0;
    const vat = parseFloat(l.vatRate) || 0;
    return s + qty * price * (1 + vat / 100);
  }, 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    lines.forEach((line, i) => {
      fd.set(`items[${i}].description`, line.description);
      fd.set(`items[${i}].quantity`, line.quantity);
      fd.set(`items[${i}].unit`, line.unit);
      fd.set(`items[${i}].unitPriceEuros`, line.unitPriceEuros);
      fd.set(`items[${i}].vatRate`, line.vatRate);
    });
    startTransition(() => { createQuote(fd); });
  }

  return (
    <div className="pt-14 pb-24 px-4">
      <form onSubmit={handleSubmit} className="pt-4 space-y-5">
        <input type="hidden" name="createdById" value={userId} />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Client *</label>
          <select name="clientId" required className={ic}>
            <option value="">Sélectionner un client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
          <input name="title" required placeholder="Ex : Broderie 20 polos" className={ic} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Valide jusqu'au *</label>
          <input name="validUntil" type="date" required
            defaultValue={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]} className={ic} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Acompte (%)</label>
          <input name="depositPct" type="number" min="0" max="100" defaultValue="30" className={ic} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Lignes ({lines.length})</p>
            {total > 0 && <p className="text-sm font-bold text-indigo-600">≈ {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} TTC</p>}
          </div>
          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div key={line.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Ligne {idx + 1}</span>
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(line.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 active:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)}
                  placeholder="Description" required className={sm} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Quantité</label>
                    <input type="number" min="0.01" step="0.01" value={line.quantity}
                      onChange={e => updateLine(line.id, 'quantity', e.target.value)} required className={sm} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Unité</label>
                    <input value={line.unit} onChange={e => updateLine(line.id, 'unit', e.target.value)} className={sm} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Prix unitaire HT (€)</label>
                    <input type="number" min="0" step="0.01" value={line.unitPriceEuros}
                      onChange={e => updateLine(line.id, 'unitPriceEuros', e.target.value)} placeholder="0.00" required className={sm} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">TVA (%)</label>
                    <select value={line.vatRate} onChange={e => updateLine(line.id, 'vatRate', e.target.value)} className={sm}>
                      <option value="0">0%</option>
                      <option value="5.5">5,5%</option>
                      <option value="10">10%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>
                </div>
                {line.quantity && line.unitPriceEuros && (
                  <p className="text-xs text-right text-indigo-600 font-medium">
                    {(parseFloat(line.quantity) * parseFloat(line.unitPriceEuros) * (1 + parseFloat(line.vatRate) / 100))
                      .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} TTC
                  </p>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addLine}
            className="mt-3 w-full flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium active:bg-gray-50">
            <Plus className="h-4 w-4" /> Ajouter une ligne
          </button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
          <textarea name="notes" rows={2} placeholder="Conditions particulières…" className={ic} />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base active:bg-indigo-700 disabled:opacity-60">
          {isPending ? 'Création…' : 'Créer le devis'}
        </button>
      </form>
    </div>
  );
}
