'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, AlertTriangle, Calendar, Users, MapPin } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import RecordsTable from '@/components/records-table';
import SidebarMenu from '@/components/sidebar-menu';
import { authClient } from '@/lib/auth-client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Record {
  _id: string;
  type: 'intervention' | 'reclamation';
  createdAt: string;
  // Intervention fields
  startDate?: string;
  endDate?: string;
  entrepriseName?: string;
  responsable?: string;
  teamMembers?: string[];
  siteName?: string;
  photoUrl?: string;
  recipientEmails?: string[];
  // Reclamation fields
  date?: string;
  stationName?: string;
  reclamationType?: string;
  description?: string;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'interventions' | 'reclamations' | 'records'>('overview');
  const router = useRouter();

  const handleExport = () => {
    // This will be handled by the RecordsTable component
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session) {
          setAuthenticated(true);
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
  }, [router]);

  const fetchRecords = useCallback(async () => {
    if (!authenticated) return;

    try {
      const response = await fetch('/api/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else if (response.status === 401) {
        router.push('/auth/sign-in');
      } else {
        toast.error('Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('An error occurred while fetching records');
    } finally {
      setLoading(false);
    }
  }, [router, authenticated]);

  useEffect(() => {
    if (authenticated) {
      fetchRecords();
    }
  }, [fetchRecords, authenticated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRecordIcon = (type: string) => {
    return type === 'intervention' ? (
      <FileText className="w-5 h-5 text-blue-600" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-600" />
    );
  };

  const getRecordTitle = (record: Record) => {
    if (record.type === 'intervention') {
      return `${record.entrepriseName} - ${record.siteName}`;
    } else {
      return `${record.stationName} - ${record.reclamationType}`;
    }
  };

  const getRecordSubtitle = (record: Record) => {
    if (record.type === 'intervention') {
      return `${formatDate(record.startDate!)} - ${formatDate(record.endDate!)}`;
    } else {
      return formatDate(record.date!);
    }
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="mt-2 text-gray-600">Gérez vos interventions et réclamations</p>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setActiveSection('overview')}
                    className={activeSection === 'overview' ? 'font-semibold' : 'cursor-pointer'}
                  >
                    Aperçu
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setActiveSection('interventions')}
                    className={activeSection === 'interventions' ? 'font-semibold' : 'cursor-pointer'}
                  >
                    Interventions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setActiveSection('reclamations')}
                    className={activeSection === 'reclamations' ? 'font-semibold' : 'cursor-pointer'}
                  >
                    Réclamations
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage
                    onClick={() => setActiveSection('records')}
                    className={activeSection === 'records' ? 'font-semibold cursor-pointer' : 'cursor-pointer'}
                  >
                    Tous les enregistrements
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

        {activeSection === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total des interventions</CardTitle>
                  <FileText className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {records.filter(r => r.type === 'intervention').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total des réclamations</CardTitle>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {records.filter(r => r.type === 'reclamation').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ce mois-ci</CardTitle>
                  <Calendar className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {records.filter(r => {
                      const recordDate = new Date(r.createdAt);
                      const now = new Date();
                      return recordDate.getMonth() === now.getMonth() &&
                             recordDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/interventions/new')}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <FileText className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <CardTitle className="text-lg">Nouvelle intervention</CardTitle>
                    <CardDescription>Créer une nouvelle intervention</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une intervention
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/reclamations/new')}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
                  <div>
                    <CardTitle className="text-lg">Nouvelle réclamation</CardTitle>
                    <CardDescription>Créer un nouvel enregistrement de réclamation</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une réclamation
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Records */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enregistrements récents</h2>
              {records.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enregistrement pour le moment</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Créez votre première intervention ou réclamation pour commencer.&apos;
                    </p>
                    <div className="flex gap-4">
                      <Button onClick={() => router.push('/interventions/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle intervention
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/reclamations/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle réclamation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {records.slice(0, 6).map((record) => (
                    <Card key={record._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getRecordIcon(record.type)}
                            <CardTitle className="text-lg ml-2 capitalize">
                              {record.type}
                            </CardTitle>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(record.createdAt)}
                          </span>
                        </div>
                        <CardDescription className="font-medium">
                          {getRecordTitle(record)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {getRecordSubtitle(record)}
                          </div>
                          {record.type === 'intervention' && record.teamMembers && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2" />
                              {record.teamMembers.length} team member{record.teamMembers.length !== 1 ? 's' : ''}
                            </div>
                          )}
                          {record.type === 'intervention' && record.siteName && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {record.siteName}
                            </div>
                          )}
                          {record.type === 'reclamation' && record.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {record.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'interventions' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Toutes les interventions</h2>
            {records.filter(r => r.type === 'intervention').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune intervention trouvée</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Créez votre première intervention pour commencer.
                  </p>
                  <Button onClick={() => router.push('/interventions/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle intervention
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.filter(r => r.type === 'intervention').map((record) => (
                  <Card key={record._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getRecordIcon(record.type)}
                          <CardTitle className="text-lg ml-2 capitalize">
                            {record.type}
                          </CardTitle>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                      <CardDescription className="font-medium">
                        {getRecordTitle(record)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {getRecordSubtitle(record)}
                        </div>
                        {record.teamMembers && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            {record.teamMembers.length} team member{record.teamMembers.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        {record.siteName && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {record.siteName}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'reclamations' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Toutes les réclamations</h2>
            {records.filter(r => r.type === 'reclamation').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation trouvée</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Créez votre première réclamation pour commencer.
                  </p>
                  <Button onClick={() => router.push('/reclamations/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle réclamation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.filter(r => r.type === 'reclamation').map((record) => (
                  <Card key={record._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getRecordIcon(record.type)}
                          <CardTitle className="text-lg ml-2 capitalize">
                            {record.type}
                          </CardTitle>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                      <CardDescription className="font-medium">
                        {getRecordTitle(record)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {getRecordSubtitle(record)}
                        </div>
                        {record.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {record.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'records' && (
          <RecordsTable records={records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} onExport={handleExport} />
        )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
