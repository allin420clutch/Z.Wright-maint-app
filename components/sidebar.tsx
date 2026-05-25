'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings, 
  Wrench, 
  ClipboardList, 
  ScanLine, 
  Clock, 
  Activity,
  History
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Equipment', href: '/equipment', icon: Settings },
  { name: 'Work Orders', href: '/work-orders', icon: Wrench },
  { name: 'PM Schedule', href: '/maintenance', icon: Clock },
  { name: 'Scanner', href: '/scanner', icon: ScanLine },
  { name: 'History', href: '/history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 lg:w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-700 flex flex-col h-full transition-all duration-300">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-700">
        <Activity className="h-8 w-8 text-amber-500" />
        <span className="ml-3 font-semibold text-lg hidden lg:block tracking-tight">MaintenX</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center justify-center lg:justify-start p-3 lg:px-3 rounded-lg transition-colors group',
                isActive 
                  ? 'bg-amber-500/10 text-amber-500' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
              )}
            >
              <item.icon className={clsx('h-6 w-6 lg:h-5 lg:w-5', isActive ? 'text-amber-500' : 'text-zinc-400 group-hover:text-zinc-100')} />
              <span className="hidden lg:block ml-3 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-700">
        <div className="flex items-center justify-center lg:justify-start gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-zinc-300">TJ</span>
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-medium text-zinc-100 truncate">Tech Jones</p>
            <p className="text-xs text-zinc-500 truncate">Lead Technician</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
