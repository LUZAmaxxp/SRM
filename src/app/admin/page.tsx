'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminTable from '@/components/admin-table';
import SidebarMenu from '@/components/sidebar-menu';
import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n-context';


interface UserData {
  _id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  interventionsCount: number;
  reclamationsCount: number;
  totalRecords: number;
  lastActivity: string | null;
  interventions: Record<string, unknown>[];
  reclamations: Record<string, unknown>[];
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'interventions' | 'reclamations' | 'records' | 'admin'>('admin');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session && session.data) {
          setAuthenticated(true);
          // Check if user is admin via API
          try {
            const response = await fetch('/api/admin/check-access', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: session.data.user.email }),
            });
            if (response.ok) {
              setAuthorized(true);
            } else {
              toast.error(t('admin.access-denied'));
              router.push('/dashboard');
              return;
            }
          } catch (error) {
            console.error('Admin check failed:', error);
            toast.error(t('admin.no-permission'));
            router.push('/dashboard');
            return;
          }
        } else {
          router.push('/auth/sign-in');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/sign-in');
        return;
      }
    };

    checkAuth();
  }, [router, t]);

  const fetchAdminData = useCallback(async () => {
    if (!authenticated || !authorized) return;

    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      } else if (response.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
      } else {
        toast.error('Failed to fetch admin data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [authenticated, authorized, router]);

  useEffect(() => {
    if (authenticated && authorized) {
      fetchAdminData();
    }
  }, [authenticated, authorized, fetchAdminData]);

  if (!authenticated || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('admin.checking-permissions')}</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.access-denied')}</h3>
                <p className="text-gray-600 text-center mb-4">
                  {t('admin.no-permission')}
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  {t('admin.go-dashboard')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('admin.loading-admin-data')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarMenu activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
            </div>
            <p className="text-gray-600">{t('admin.subtitle')}</p>
          </div>

          <AdminTable users={users} />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
