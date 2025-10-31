'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2, Plus } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface OrgSwitcherProps {
  currentOrgId: string;
}

export default function OrgSwitcher({ currentOrgId }: OrgSwitcherProps) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/orgs');
      const data = await res.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  const switchOrg = (orgId: string) => {
    router.push(`/org/${orgId}`);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="px-3 py-2 bg-ayvlo-accent/50 rounded-md animate-pulse">
        <div className="h-5 bg-ayvlo-accent rounded w-32" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-ayvlo-accent/50 hover:bg-ayvlo-accent rounded-md transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {currentOrg?.name || 'Select Organization'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-ayvlo-secondary border border-ayvlo-accent rounded-md shadow-lg z-20 max-h-64 overflow-auto">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => switchOrg(org.id)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-ayvlo-accent transition-colors ${
                  org.id === currentOrgId ? 'bg-ayvlo-accent' : ''
                }`}
              >
                {org.name}
              </button>
            ))}
            <div className="border-t border-ayvlo-accent">
              <button
                onClick={() => router.push('/org/new')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-ayvlo-accent transition-colors flex items-center gap-2 text-ayvlo-blue"
              >
                <Plus className="h-4 w-4" />
                Create Organization
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
