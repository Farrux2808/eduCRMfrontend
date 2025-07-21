
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Foydalanuvchilar', href: '/users', icon: UsersIcon },
  { name: 'Guruhlar', href: '/groups', icon: UserGroupIcon },
  { name: 'Kurslar', href: '/courses', icon: BookOpenIcon },
  { name: 'Jadval', href: '/schedule', icon: CalendarIcon },
  { name: 'Davomat', href: '/attendance', icon: ClipboardDocumentListIcon },
  { name: 'Baholar', href: '/grades', icon: AcademicCapIcon },
  { name: 'To\'lovlar', href: '/payments', icon: CurrencyDollarIcon },
  { name: 'Hisobotlar', href: '/reports', icon: ChartBarIcon },
];

const superAdminNavigation = [
  { name: 'Tashkilotlar', href: '/organizations', icon: BuildingOfficeIcon },
  { name: 'Super Admin', href: '/super-admin', icon: CogIcon },
];

export default function Sidebar() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center h-16 px-4 bg-gray-800">
        <h1 className="text-xl font-bold text-white">EduCRM Admin</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
        
        {isSuperAdmin && (
          <>
            <div className="border-t border-gray-700 my-4"></div>
            {superAdminNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </div>
  );
}