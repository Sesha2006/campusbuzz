import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  UserCheck, 
  MessageCircle, 
  IdCard, 
  Eye, 
  Users, 
  Code, 
  Settings,
  University,
  User
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3, current: true },
  { name: 'Student Verification', href: '/student-verification', icon: UserCheck, count: 23 },
  { name: 'Post Moderation', href: '/post-moderation', icon: MessageCircle, count: 12 },
  { name: 'ID Verification', href: '/id-verification', icon: IdCard, count: 8 },
  { name: 'Chat Monitoring', href: '/chat-monitoring', icon: Eye },
  { name: 'User Management', href: '/user-management', icon: Users },
  { name: 'API Logs', href: '/api-logs', icon: Code },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/' || location === '/dashboard';
    }
    return location === href;
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <University className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">CampusBuzz</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1 bg-white">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`${
                      active
                        ? 'bg-brand-50 border-r-2 border-brand-500 text-brand-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer`}
                  >
                    <item.icon
                      className={`${
                        active ? 'text-brand-500' : 'text-gray-400'
                      } mr-3 h-4 w-4`}
                    />
                    {item.name}
                    {item.count && (
                      <Badge 
                        variant="secondary" 
                        className={`ml-auto ${
                          item.name === 'Student Verification' 
                            ? 'bg-red-100 text-red-800' 
                            : item.name === 'Post Moderation'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.count}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs font-medium text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
