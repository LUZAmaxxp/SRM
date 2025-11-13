'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n-context';

export default function Home() {
  const { data: session, isPending: loading } = authClient.useSession();
  const isAuthenticated = !!session;
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Image
                src="/LOGO-SOUSS-MASSA-1033x308px-removebg-preview.png"
                alt="Société Régionale Multiservices SOUSS MASSA"
                width={150}
                height={45}
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-900/50 transition-all">
                    {t('landing.hero.accessDashboard')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-in">
                    <Button variant="outline" className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white font-semibold transition-all">
                      {t('landing.hero.signIn')}
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-900/50 transition-all">
                      {t('landing.hero.createAccount')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-800/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-blue-900 rounded-full animate-pulse"></span>
              <span className="text-blue-900 text-sm font-semibold">Plateforme Disponible</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('landing.hero.title')}
              <span className="block bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
                {t('landing.hero.subtitle')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('landing.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold shadow-2xl hover:shadow-blue-900/50 transform hover:scale-105 transition-all">
                    {t('landing.hero.accessDashboard')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold shadow-2xl hover:shadow-blue-900/50 transform hover:scale-105 transition-all">
                      {t('landing.hero.createAccount')}
                    </Button>
                  </Link>
                  <Link href="/auth/sign-in">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white font-bold transition-all">
                      {t('landing.hero.signIn')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="group bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-2xl p-8 text-center border-2 border-blue-700/50 hover:border-blue-500 transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('landing.features.interventions.title')}</h3>
              <p className="text-blue-200 leading-relaxed">
                {t('landing.features.interventions.description')}
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl"></div>
            </div>

            <div className="group bg-gradient-to-br from-yellow-700 to-yellow-600 rounded-2xl shadow-2xl p-8 text-center border-2 border-yellow-600/50 hover:border-yellow-400 transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-yellow-400/50 group-hover:scale-110 transition-all">
                <svg className="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('landing.features.reclamations.title')}</h3>
              <p className="text-yellow-100 leading-relaxed">
                {t('landing.features.reclamations.description')}
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl"></div>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-2xl p-8 text-center border-2 border-green-200 hover:border-green-400 transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 transition-all">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.features.reports.title')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {t('landing.features.reports.description')}
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-900 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/LOGO-SOUSS-MASSA-1033x308px-removebg-preview.png"
            alt="Société Régionale Multiservices SOUSS MASSA"
            width={120}
            height={36}
            className="h-10 w-auto mx-auto mb-6"
          />
          <p className="text-gray-600">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}