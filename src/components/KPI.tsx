'use client';

import { useEffect, useState } from 'react';

type KPIProps = {
  label: string;
  value: number; // ⚠️ on passe en number maintenant
  icon: React.ReactNode;
  color: string;
  isCurrency?: boolean;
};

export function KPI({ label, value, icon, color, isCurrency }: KPIProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = value / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(counter);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value]);

  const format = (val: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(val);
    }
    return val.toString();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">
          {format(displayValue)}
        </p>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );
}
