import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  back?: string;
  right?: React.ReactNode;
}

export function AppHeader({ title, back, right }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200 safe-top">
      <div className="flex items-center h-14 px-4 gap-3 max-w-lg mx-auto">
        {back && (
          <Link href={back} className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
        )}
        <h1 className="flex-1 text-base font-semibold text-gray-900 truncate">{title}</h1>
        {right}
      </div>
    </header>
  );
}
