import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export default function StatsCard({ title, value, icon, change, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <div className="text-white">{icon}</div>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}