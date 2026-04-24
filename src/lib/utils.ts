import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db } from './prisma';

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const euros = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export const dateShort = (d: Date | string | null) =>
  d ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(d)) : '—';

export const dateFull = (d: Date | string | null) =>
  d ? new Intl.DateTimeFormat('fr-FR').format(new Date(d)) : '—';

export const isPast = (d: Date | string | null) =>
  d ? new Date(d) < new Date() : false;

export async function nextNumber(key: string, prefix: string): Promise<string> {
  const counter = await db.counter.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });
  return `${prefix}-${String(counter.value).padStart(4, '0')}`;
}
