import { db } from '@/lib/prisma';
import { AppHeader } from '@/components/AppHeader';
import { createTask, toggleTask } from '@/services/tasks';
import { dateShort, isPast } from '@/lib/utils';
import { auth } from '@/lib/auth';

const PRIO: Record<string, string> = { LOW: 'bg-gray-300', NORMAL: 'bg-blue-400', HIGH: 'bg-orange-400', URGENT: 'bg-red-500' };

export default async function TasksPage() {
  const session = await auth();
  const tasks = await db.task.findMany({
    where: { status: { not: 'CANCELED' } },
    orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
    include: { order: { select: { number: true } } },
  });
  const open = tasks.filter(t => t.status !== 'DONE');
  const done = tasks.filter(t => t.status === 'DONE').slice(0, 8);
  return (
    <>
      <AppHeader title="Tâches" />
      <div className="pt-14 pb-24 px-4 space-y-4">
        <form action={createTask} className="pt-4 flex gap-2">
          <input name="title" required placeholder="Ajouter une tâche…"
            className="flex-1 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-base placeholder-gray-400 focus:outline-none focus:border-indigo-400" />
          <input type="hidden" name="priority" value="NORMAL" />
          {session?.user?.id && <input type="hidden" name="assigneeId" value={session.user.id} />}
          <button type="submit"
            className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold active:bg-indigo-700 shrink-0">
            +
          </button>
        </form>
        <div className="space-y-2">
          {open.map(task => (
            <div key={task.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
              <form action={toggleTask.bind(null, task.id, true)}>
                <button className="h-7 w-7 rounded-full border-2 border-gray-300 flex items-center justify-center active:bg-gray-100 hover:border-indigo-400 shrink-0" />
              </form>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{task.title}</p>
                {task.order && <p className="text-xs text-gray-400 font-mono mt-0.5">{task.order.number}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`h-2.5 w-2.5 rounded-full ${PRIO[task.priority]}`} />
                {task.dueAt && (
                  <span className={`text-xs font-medium ${isPast(task.dueAt) ? 'text-red-500' : 'text-gray-400'}`}>
                    {dateShort(task.dueAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {open.length === 0 && (
            <div className="bg-white rounded-2xl px-4 py-8 text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm text-gray-400">Tout est à jour !</p>
            </div>
          )}
        </div>
        {done.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Terminées</p>
            {done.map(task => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                <form action={toggleTask.bind(null, task.id, false)}>
                  <button className="h-7 w-7 rounded-full bg-green-400 border-2 border-green-400 flex items-center justify-center active:opacity-70 shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </button>
                </form>
                <p className="text-sm text-gray-400 line-through flex-1 truncate">{task.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
