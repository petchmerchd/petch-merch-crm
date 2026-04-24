import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      {children}
      <BottomNav />
    </div>
  );
}
