'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import OrgSwitcher from './org-switcher';
import { LayoutDashboard, Database, Workflow, AlertTriangle, Settings } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  orgId: string;
}

export default function AppShell({ children, orgId }: AppShellProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: `/org/${orgId}`,
      icon: LayoutDashboard,
      current: pathname === `/org/${orgId}`,
    },
    {
      name: 'Anomalies',
      href: `/org/${orgId}/anomalies`,
      icon: AlertTriangle,
      current: pathname?.includes('/anomalies'),
    },
    {
      name: 'Workflows',
      href: `/org/${orgId}/workflows`,
      icon: Workflow,
      current: pathname?.includes('/workflows'),
    },
    {
      name: 'Data Sources',
      href: `/org/${orgId}/data-sources`,
      icon: Database,
      current: pathname?.includes('/data-sources'),
    },
    {
      name: 'Settings',
      href: `/org/${orgId}/settings`,
      icon: Settings,
      current: pathname?.includes('/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-ayvlo-bg text-ayvlo-text flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-ayvlo-accent bg-ayvlo-secondary/40 p-4 space-y-4 flex flex-col">
        {/* Logo */}
        <div className="px-2">
          <Link href="/" className="text-2xl font-bold text-ayvlo-gold">
            Ayvlo
          </Link>
          <p className="text-xs text-ayvlo-text/60 mt-1">Autonomous Analytics</p>
        </div>

        {/* Org Switcher */}
        <OrgSwitcher currentOrgId={orgId} />

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  item.current
                    ? 'bg-ayvlo-accent text-ayvlo-text'
                    : 'text-ayvlo-text/70 hover:bg-ayvlo-accent/50 hover:text-ayvlo-text'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-ayvlo-accent pt-4">
          <div className="text-xs text-ayvlo-text/50">
            <p>© 2025 Ayvlo</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
