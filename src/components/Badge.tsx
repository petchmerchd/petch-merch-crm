import { cn } from '@/lib/utils';

const VARIANTS = {
  gray:   'bg-gray-100 text-gray-600',
  blue:   'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  green:  'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  red:    'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-700',
} as const;

type Variant = keyof typeof VARIANTS;

export function Badge({ label, variant = 'gray' }: { label: string; variant?: Variant }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', VARIANTS[variant])}>
      {label}
    </span>
  );
}

export const LEAD_BADGE: Record<string, Variant> = {
  NEW: 'gray', CONTACTED: 'blue', QUALIFIED: 'indigo',
  PROPOSAL: 'orange', WON: 'green', LOST: 'red',
};
export const LEAD_LABEL: Record<string, string> = {
  NEW: 'Nouveau', CONTACTED: 'Contacté', QUALIFIED: 'Qualifié',
  PROPOSAL: 'Devis', WON: 'Gagné', LOST: 'Perdu',
};
export const ORDER_BADGE: Record<string, Variant> = {
  CONFIRMED: 'blue', IN_PRODUCTION: 'indigo', QUALITY_CHECK: 'orange',
  READY: 'green', DELIVERED: 'green', COMPLETED: 'gray', CANCELED: 'red',
};
export const ORDER_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmée', IN_PRODUCTION: 'En prod.', QUALITY_CHECK: 'Contrôle',
  READY: 'Prête', DELIVERED: 'Livrée', COMPLETED: 'Terminée', CANCELED: 'Annulée',
};
export const QUOTE_BADGE: Record<string, Variant> = {
  DRAFT: 'gray', SENT: 'blue', APPROVED: 'green',
  REJECTED: 'red', EXPIRED: 'orange', CONVERTED: 'purple',
};
export const QUOTE_LABEL: Record<string, string> = {
  DRAFT: 'Brouillon', SENT: 'Envoyé', APPROVED: 'Approuvé',
  REJECTED: 'Refusé', EXPIRED: 'Expiré', CONVERTED: 'Converti',
};
export const INVOICE_BADGE: Record<string, Variant> = {
  DRAFT: 'gray', ISSUED: 'blue', PARTIALLY_PAID: 'orange',
  PAID: 'green', OVERDUE: 'red', CANCELED: 'gray',
};
export const INVOICE_LABEL: Record<string, string> = {
  DRAFT: 'Brouillon', ISSUED: 'Émise', PARTIALLY_PAID: 'Partiel',
  PAID: 'Payée', OVERDUE: 'En retard', CANCELED: 'Annulée',
};
