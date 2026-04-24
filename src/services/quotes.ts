'use server';
import { db } from '@/lib/prisma';
import { nextNumber } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createQuote(fd: FormData) {
  const clientId    = String(fd.get('clientId'));
  const createdById = String(fd.get('createdById'));
  const title       = String(fd.get('title'));
  const validUntil  = new Date(String(fd.get('validUntil')));
  const depositPct  = Number(fd.get('depositPct') ?? 30);
  const notes       = fd.get('notes') ? String(fd.get('notes')) : undefined;

  const items: any[] = [];
  let i = 0;
  while (fd.has(`items[${i}].description`)) {
    const description    = String(fd.get(`items[${i}].description`));
    const quantity       = parseFloat(String(fd.get(`items[${i}].quantity`)));
    const unit           = String(fd.get(`items[${i}].unit`) ?? 'unité');
    const priceEuros     = parseFloat(String(fd.get(`items[${i}].unitPriceEuros`)));
    const unitPriceCents = Math.round(priceEuros * 100);
    const vatRate        = parseFloat(String(fd.get(`items[${i}].vatRate`) ?? '20'));
    const totalCents     = Math.round(quantity * unitPriceCents);
    items.push({ position: i, description, quantity, unit, unitPriceCents, vatRate, totalCents });
    i++;
  }

  if (items.length === 0) throw new Error('Au moins une ligne est requise');

  const subtotalCents = items.reduce((s, it) => s + it.totalCents, 0);
  const taxCents      = items.reduce((s, it) => s + Math.round(it.totalCents * it.vatRate / 100), 0);
  const number        = await nextNumber('QUOTE', 'DEV');

  const quote = await db.quote.create({
    data: {
      number, clientId, createdById, title, notes,
      validUntil, depositPct,
      subtotalCents, taxCents,
      totalCents: subtotalCents + taxCents,
      items: { create: items },
    },
  });

  revalidatePath('/quotes');
  redirect(`/quotes/${quote.id}`);
}

export async function sendQuote(id: string) {
  await db.quote.update({ where: { id }, data: { status: 'SENT', sentAt: new Date() } });
  revalidatePath(`/quotes/${id}`);
  revalidatePath('/quotes');
}

export async function approveQuote(id: string) {
  await db.quote.update({ where: { id }, data: { status: 'APPROVED', approvedAt: new Date() } });
  revalidatePath(`/quotes/${id}`);
  revalidatePath('/quotes');
}

export async function convertQuoteToOrder(id: string) {
  const quote = await db.quote.findUniqueOrThrow({ where: { id } });
  if (quote.status !== 'APPROVED') throw new Error('Le devis doit être approuvé');

  const number       = await nextNumber('ORDER', 'CMD');
  const depositCents = Math.round(quote.totalCents * quote.depositPct / 100);

  const order = await db.order.create({
    data: {
      number, clientId: quote.clientId, quoteId: quote.id,
      title: quote.title, totalCents: quote.totalCents, depositCents,
      productionSteps: {
        create: [
          { name: 'Préparation fichiers', position: 0 },
          { name: 'Production',           position: 1 },
          { name: 'Contrôle qualité',     position: 2 },
        ],
      },
    },
  });

  await db.quote.update({ where: { id }, data: { status: 'CONVERTED' } });

  const invoiceNumber = await nextNumber('INVOICE', 'FAC');
  await db.invoice.create({
    data: {
      number: invoiceNumber, clientId: quote.clientId, orderId: order.id,
      type: 'DEPOSIT', subtotalCents: depositCents, taxCents: 0,
      totalCents: depositCents, dueAt: new Date(Date.now() + 7 * 86400_000),
    },
  });

  revalidatePath('/quotes');
  revalidatePath('/orders');
  redirect(`/orders/${order.id}`);
}
