'use client';

import { Plus, AlertTriangle, Table, Settings, User, LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n-context';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

interface SidebarMenuProps {
  activeSection?: 'overview' | 'interventions' | 'reclamations' | 'records' | 'admin';
  onSectionChange?: (section: 'overview' | 'interventions' | 'reclamations' | 'records' | 'admin') => void;
}

export default function SidebarMenu({ activeSection, onSectionChange }: SidebarMenuProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const session = await authClient.getSession();
        console.log('Session data:', session); // Debug log
        if (session && session.data && session.data.user && session.data.user.email) {
          const userEmail = session.data.user.email;
          // Check admin status via API instead of direct import
          const response = await fetch('/api/admin/check-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail }),
          });
          const data = await response.json();
          setIsAdmin(data.success || false);
        } else {
          console.log('No session or user data found'); // Debug log
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/');
          },
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  return (
    <div className="w-16 bg-card border-r border-border shadow-lg flex flex-col items-center py-8 space-y-6">
      <div
        className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
        onClick={() => router.push('/interventions/new')}
        title={t('navigation.newIntervention')}
      >
        <Plus className="w-6 h-6 text-white" />
      </div>
      <div
        className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
        onClick={() => router.push('/reclamations/new')}
        title={t('navigation.newReclamation')}
      >
        <AlertTriangle className="w-6 h-6 text-white" />
      </div>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
          activeSection === 'records' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
        onClick={() => {
          if (onSectionChange) {
            onSectionChange('records');
          } else {
            router.push('/dashboard?section=records');
          }
        }}
        title={t('navigation.records')}
      >
        <Table className="w-6 h-6" />
      </div>

      {/* Admin Icon - only show for admins */}
      {isAdmin && (
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
            activeSection === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          onClick={() => router.push('/admin')}
          title="Admin Dashboard"
        >
          <Shield className="w-6 h-6" />
        </div>
      )}

      {/* Spacer to push user icons to bottom */}
      <div className="flex-1"></div>

      {/* Profile Icon */}
      <div
        className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={() => router.push('/profile')}
        title={t('navigation.profile')}
      >
        <User className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Settings Icon */}
      <div
        className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={() => router.push('/settings')}
        title={t('navigation.settings')}
      >
        <Settings className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Logout Icon */}
      <div
        className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
        onClick={handleLogout}
        title={t('navigation.logout')}
      >
        <LogOut className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
