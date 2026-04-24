'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, UserPlus, ShoppingCart, FileText, CheckSquare } from 'lucide-react';

const TABS = [
  { href: '/',       icon: LayoutDashboard, label: 'Home' },
  { href: '/leads',  icon: UserPlus,        label: 'Leads' },
  { href: '/orders', icon: ShoppingCart,    label: 'Cmds' },
  { href: '/quotes', icon: FileText,        label: 'Devis' },
  { href: '/tasks',  icon: CheckSquare,     label: 'Tâches' },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 active:bg-gray-50',
                active ? 'text-indigo-600' : 'text-gray-400')}>
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
