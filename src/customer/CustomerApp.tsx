import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import CustomerNavbar from './components/CustomerNavbar.tsx';
import LandingPage from './components/LandingPage.tsx';
import BookingFlow from './components/BookingFlow.tsx';
import FounderAchievementsPage from './components/FounderAchievementsPage.tsx';
import CustomerFooter from './components/CustomerFooter.tsx';
import CustomerAuthModal from './components/CustomerAuthModal.tsx';
import CustomerDashboardView from './components/CustomerDashboardView.tsx';
import { Language, translations } from '../lib/translations.ts';
import { UserProfile } from '../types.ts';
import { getUserProfile, signOut as firebaseSignOut, migrateLocalStorageAppointmentsToSupabase, supabase } from '../lib/firebase.ts';

interface CustomerAppProps {
  onAppointmentBooked?: () => void;
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
}

export default function CustomerApp({
  onAppointmentBooked,
  lang,
  onChangeLanguage,
}: CustomerAppProps) {
  const t = translations[lang];
  const [currentView, setCurrentView] = useState<'landing' | 'booking' | 'founder' | 'dashboard'>('landing');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Sync customer session (from Firebase/Auth) and migrate any legacy local storage data
  useEffect(() => {
    // 1. Trigger background migration of any appointments left in localStorage
    migrateLocalStorageAppointmentsToSupabase();

    // 2. Firebase / Auth session listener
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setCurrentView('dashboard');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setCurrentView('dashboard');
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    if (currentUser) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('landing');
    }
    setSelectedServiceId(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateFounder = () => {
    setCurrentView('founder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestSignOut = () => {
    setIsSignOutModalOpen(true);
  };

  const executeSignOut = async () => {
    try {
      // Completely erase all user and session data from local and session storage
      localStorage.removeItem('aus_demo_profile');
      localStorage.removeItem('supabase_token');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('aus_') || k.startsWith('sb-') || k.includes('profile') || k.includes('user') || k.includes('token') || k.includes('auth'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch (_) {}

    try {
      await firebaseSignOut();
    } catch (_) {}

    setCurrentUser(null);
    setIsSignOutModalOpen(false);
    setCurrentView('landing');
    setSelectedServiceId(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppointmentBookedSuccess = () => {
    if (onAppointmentBooked) onAppointmentBooked();
    // After booking, return to persistent dashboard if logged in, or home
    if (currentUser) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('landing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* 1. PERSISTENT BUSINESS DASHBOARD: When user is logged in and in dashboard view */}
      {currentUser && currentView === 'dashboard' ? (
        <CustomerDashboardView
          currentUser={currentUser}
          onStartBooking={handleStartBooking}
          onNavigateWebsite={() => setCurrentView('landing')}
          onSignOut={handleRequestSignOut}
          lang={lang}
          onChangeLanguage={onChangeLanguage}
        />
      ) : (
        <>
          {/* Return Banner when logged in but viewing public pages */}
          {currentUser && (
            <div className="bg-slate-950 text-slate-300 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800 shrink-0">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {t.dash_logged_in_as} <strong>{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.companyName || (lang === 'ur' ? 'نجی موکل' : lang === 'en' ? 'Private Client' : 'Privatmandant')})
                </span>
              </span>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>{t.dash_back_to_cockpit}</span>
                <span>{lang === 'ur' ? '←' : '→'}</span>
              </button>
            </div>
          )}

          {/* Sticky Corporate Navbar for public view and booking */}
          <CustomerNavbar
            onStartBooking={handleStartBooking}
            onNavigateHome={handleNavigateHome}
            onNavigateFounder={handleNavigateFounder}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenPortal={() => {
              if (currentUser) setCurrentView('dashboard');
              else setIsAuthModalOpen(true);
            }}
            onSignOut={handleRequestSignOut}
            currentView={currentView}
            lang={lang}
            onChangeLanguage={onChangeLanguage}
          />

          {/* Main View Router */}
          <main className="flex-1">
            {/* PUBLIC: Landing Page */}
            {currentView === 'landing' && (
              <LandingPage 
                onStartBooking={handleStartBooking} 
                onNavigateFounder={handleNavigateFounder}
                lang={lang} 
              />
            )}

            {/* BOOKING FLOW with logged-in user auto-fill */}
            {currentView === 'booking' && (
              <BookingFlow
                initialServiceId={selectedServiceId}
                onGoHome={handleNavigateHome}
                onAppointmentBooked={handleAppointmentBookedSuccess}
                lang={lang}
                currentUser={currentUser}
              />
            )}

            {/* FOUNDER ACHIEVEMENTS PAGE */}
            {currentView === 'founder' && (
              <FounderAchievementsPage
                onStartBooking={() => handleStartBooking()}
                onGoHome={handleNavigateHome}
                lang={lang}
              />
            )}
          </main>

          {/* Corporate Footer (Public pages) */}
          <CustomerFooter 
            onNavigateFounder={handleNavigateFounder}
            lang={lang} 
          />
        </>
      )}

      {/* Email OTP Auth Modal (Login / Registration) */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          setCurrentView('dashboard');
          setIsAuthModalOpen(false);
        }}
        lang={lang}
      />

      {/* Executive Signout Confirmation Modal */}
      {isSignOutModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          dir={lang === 'ur' ? 'rtl' : 'ltr'}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-serif-title">
                {t.signout_confirm_title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.signout_confirm_desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                {t.signout_cancel}
              </button>

              <button
                type="button"
                onClick={executeSignOut}
                className="py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {t.signout_proceed}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
