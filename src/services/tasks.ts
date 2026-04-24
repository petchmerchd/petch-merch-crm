'use server';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTask(fd: FormData) {
  await db.task.create({
    data: {
      title:      String(fd.get('title')),
      priority:   (fd.get('priority') as any) ?? 'NORMAL',
      assigneeId: fd.get('assigneeId') ? String(fd.get('assigneeId')) : undefined,
    },
  });
  revalidatePath('/tasks');
}

export async function toggleTask(id: string, done: boolean) {
  await db.task.update({
    where: { id },
    data: { status: done ? 'DONE' : 'TODO', doneAt: done ? new Date() : null },
  });
  revalidatePath('/tasks');
}
