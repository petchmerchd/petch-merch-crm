'use server';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(id: string, status: string) {
  await db.order.update({ where: { id }, data: { status: status as any } });
  revalidatePath(`/orders/${id}`);
  revalidatePath('/orders');
  revalidatePath('/production');
}

export async function updateStepStatus(id: string, status: string) {
  await db.productionStep.update({
    where: { id },
    data: { status: status as any, doneAt: status === 'DONE' ? new Date() : null },
  });
  revalidatePath('/production');
  const step = await db.productionStep.findUnique({ where: { id } });
  if (step) revalidatePath(`/orders/${step.orderId}`);
}
