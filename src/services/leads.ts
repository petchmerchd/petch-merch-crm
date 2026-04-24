'use server';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLead(fd: FormData) {
  await db.lead.create({
    data: {
      name:    String(fd.get('name')),
      company: fd.get('company') ? String(fd.get('company')) : undefined,
      email:   fd.get('email')   ? String(fd.get('email'))   : undefined,
      phone:   fd.get('phone')   ? String(fd.get('phone'))   : undefined,
      source:  (fd.get('source') as any) ?? 'OTHER',
      notes:   fd.get('notes')   ? String(fd.get('notes'))   : undefined,
    },
  });
  revalidatePath('/leads');
  redirect('/leads');
}

export async function updateLeadStatus(id: string, status: string) {
  await db.lead.update({ where: { id }, data: { status: status as any } });
  revalidatePath('/leads');
  revalidatePath(`/leads/${id}`);
}

export async function convertLeadToClient(id: string) {
  const lead = await db.lead.findUniqueOrThrow({ where: { id } });
  const client = await db.client.create({
    data: {
      name:    lead.name,
      company: lead.company ?? undefined,
      email:   lead.email   ?? undefined,
      phone:   lead.phone   ?? undefined,
      leadId:  lead.id,
    },
  });
  await db.lead.update({ where: { id }, data: { status: 'WON' } });
  revalidatePath('/leads');
  revalidatePath('/clients');
  redirect(`/clients/${client.id}`);
}
