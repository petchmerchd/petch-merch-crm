'use server';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function issueInvoice(id: string) {
  await db.invoice.update({ where: { id }, data: { status: 'ISSUED', issuedAt: new Date() } });
  revalidatePath(`/invoices/${id}`);
  revalidatePath('/invoices');
}

export async function recordPayment(fd: FormData) {
  const invoiceId = String(fd.get('invoiceId'));
  const amount    = Math.round(parseFloat(String(fd.get('amountCents'))) * 100);
  const method    = String(fd.get('method'));
  const reference = fd.get('reference') ? String(fd.get('reference')) : undefined;

  const inv = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  await db.payment.create({ data: { invoiceId, amountCents: amount, method: method as any, reference } });

  const newPaid = inv.paidCents + amount;
  const status  = newPaid >= inv.totalCents ? 'PAID' : newPaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED';
  await db.invoice.update({ where: { id: invoiceId }, data: { paidCents: newPaid, status } });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath('/invoices');
  revalidatePath('/payments');
}
