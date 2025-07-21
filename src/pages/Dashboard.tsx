import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UsersIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import { reportsApi } from '../lib/api';
import StatsCard from '../components/UI/StatsCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportsApi.getDashboard().then(res => res.data),
  });

  if (isLoading) {
    return <LoadingSpinner className="h-64" />;
  }

  const stats = dashboardStats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tizim umumiy ko'rsatkichlari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Jami o'quvchilar"
          value={stats.totalStudents || 0}
          icon={<UsersIcon className="h-6 w-6" />}
          color="blue"
        />
        
        <StatsCard
          title="Jami o'qituvchilar"
          value={stats.totalTeachers || 0}
          icon={<UserGroupIcon className="h-6 w-6" />}
          color="green"
        />
        
        <StatsCard
          title="Faol guruhlar"
          value={stats.totalGroups || 0}
          icon={<BookOpenIcon className="h-6 w-6" />}
          color="purple"
        />
        
        <StatsCard
          title="Jami kurslar"
          value={stats.totalCourses || 0}
          icon={<ChartBarIcon className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsCard
          title="Oylik daromad"
          value={formatCurrency(stats.monthlyRevenue || 0)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          color="green"
        />
        
        <StatsCard
          title="Oylik davomat"
          value={`${Math.round(((stats.monthlyAttendance?.present || 0) / 
            (Object.values(stats.monthlyAttendance || {}).reduce((a: number, b: any) => a + b, 0) || 1)) * 100)}%`}
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Davomat statistikasi</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {stats.monthlyAttendance && Object.entries(stats.monthlyAttendance).map(([status, count]: [string, any]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {status === 'present' ? 'Kelgan' : 
                     status === 'absent' ? 'Kelmagan' : 
                     status === 'late' ? 'Kech qolgan' : 'Uzrli'}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Tezkor havolalar</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <a href="/users" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <UsersIcon className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm font-medium">Foydalanuvchilar</p>
              </a>
              <a href="/groups" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <UserGroupIcon className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium">Guruhlar</p>
              </a>
              <a href="/attendance" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-sm font-medium">Davomat</p>
              </a>
              <a href="/payments" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-sm font-medium">To'lovlar</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}