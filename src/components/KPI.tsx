import React from 'react';

type KPIProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
};

export function KPI({ label, value, icon, color }: KPIProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );
}
