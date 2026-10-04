import { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  Phone, 
  ArrowRight, 
  LayoutDashboard, 
  Globe, 
  GraduationCap, 
  Menu, 
  X,
  Building,
  CheckCircle2,
  User,
  MessageSquare,
  LogIn,
  LogOut
} from 'lucide-react';
import { Language, translations } from '../../lib/translations.ts';
import { UserProfile } from '../../types.ts';

interface CustomerNavbarProps {
  onStartBooking: (serviceId?: string) => void;
  onNavigateHome: () => void;
  onNavigateFounder: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenPortal: () => void;
  onSignOut?: () => void;
  currentView: 'landing' | 'booking' | 'founder' | 'dashboard';
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
}

export default function CustomerNavbar({
  onStartBooking,
  onNavigateHome,
  onNavigateFounder,
  currentUser,
  onOpenAuthModal,
  onOpenPortal,
  onSignOut,
  currentView,
  lang,
  onChangeLanguage
}: CustomerNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang] || translations.de;

  const handleNavClick = (callback?: () => void) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-sm border-b border-slate-200 text-slate-800 shadow-xs">
      {/* Top Accreditation & Info Bar */}
      <div className="bg-slate-50 text-slate-600 py-1.5 px-4 sm:px-8 text-[11px] border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="font-bold text-slate-900 tracking-wide">A u.S</span> {t.nav_tagline}
          </span>
          <span className="hidden md:inline text-slate-300">•</span>
          <span className="hidden md:inline text-slate-600 font-medium">
            Lagerhofstraße 2, 04103 Leipzig
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <a 
            href="tel:+49341123456" 
            className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <Phone className="w-3 h-3 text-slate-500" />
            <span>Leipzig: Lagerhofstr. 2</span>
          </a>

          {/* Language Selector */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            {(['de', 'en', 'ur'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => onChangeLanguage(l)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase cursor-pointer transition-all ${
                  lang === l 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => handleNavClick(onNavigateHome)}
          className="flex items-center gap-3 cursor-pointer text-left focus:outline-none group"
        >
          <div className="h-10 px-2.5 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs group-hover:bg-slate-800 transition-colors font-serif tracking-tight">
            A u.S
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 flex items-center gap-1.5 font-serif">
              <span>A u.S</span>
              <span className="text-slate-500 text-xs sm:text-sm font-sans font-normal">Wirtschaftsberatung e.K.</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
              {t.nav_accreditation}
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
          {currentUser ? (
            <>
              <button
                onClick={onOpenPortal}
                className={`hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'dashboard' ? 'text-slate-950 font-bold' : 'text-blue-700 font-bold'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Mein Dashboard</span>
              </button>

              <button
                onClick={onNavigateHome}
                className={`hover:text-slate-950 transition-colors cursor-pointer ${
                  currentView === 'landing' ? 'text-slate-950 font-bold' : ''
                }`}
              >
                {t.nav_home}
              </button>

              <a href="#leistungen" className="hover:text-slate-950 transition-colors">
                {t.nav_services}
              </a>

              <button
                onClick={onNavigateFounder}
                className={`hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'founder' ? 'text-slate-950 font-bold' : ''
                }`}
              >
                <GraduationCap className="w-4 h-4 text-slate-600" />
                <span>{lang === 'ur' ? 'بانی (عبدالستار)' : lang === 'en' ? 'Founder (Abdul Sattar)' : 'Gründer (Abdul Sattar)'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNavigateHome}
                className={`hover:text-slate-950 transition-colors cursor-pointer ${
                  currentView === 'landing' ? 'text-slate-950 font-bold' : ''
                }`}
              >
                {t.nav_home}
              </button>

              <a href="#leistungen" className="hover:text-slate-950 transition-colors">
                {t.nav_services}
              </a>

              <button
                onClick={onNavigateFounder}
                className={`hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'founder' ? 'text-slate-950 font-bold' : ''
                }`}
              >
                <GraduationCap className="w-4 h-4 text-slate-600" />
                <span>{lang === 'ur' ? 'بانی (عبدالستار)' : lang === 'en' ? 'Founder (Abdul Sattar)' : 'Gründer (Abdul Sattar)'}</span>
              </button>

              <a href="#vorteile" className="hover:text-slate-950 transition-colors">
                {t.nav_why_us}
              </a>
            </>
          )}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* Customer Auth / Portal Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                title={t.dash_nav_cockpit}
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.firstName[0]}
                </div>
                <span className="hidden sm:inline">{currentUser.firstName} ({t.dash_nav_cockpit})</span>
              </button>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                  title={t.dash_nav_logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.dash_nav_logout}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.dash_login_register}</span>
            </button>
          )}

          {/* Book Appointment CTA */}
          <button
            onClick={() => handleNavClick(() => onStartBooking())}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.nav_book_btn}</span>
            <span className="xs:hidden">Buchen</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-6 shadow-lg animate-in slide-in-from-top-2 duration-200 space-y-4">
          <nav className="flex flex-col space-y-1.5 text-sm font-medium text-slate-800">
            <button
              onClick={() => handleNavClick(onNavigateHome)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer ${
                currentView === 'landing' ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <Building className="w-4 h-4 text-slate-700" />
              <span>{t.nav_home}</span>
            </button>

            <button
              onClick={() => handleNavClick(onNavigateFounder)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer ${
                currentView === 'founder' ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-slate-700" />
              <span>{lang === 'ur' ? 'بانی اور تعلیمی سفر (عبدالستار)' : lang === 'en' ? 'Founder Profile & Journey' : 'Über den Gründer (Abdul Sattar)'}</span>
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => handleNavClick(onOpenPortal)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left bg-slate-100 text-slate-900 font-bold"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>{t.dash_nav_cockpit}</span>
                </button>

                {onSignOut && (
                  <button
                    onClick={() => handleNavClick(onSignOut)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left text-red-600 hover:bg-red-50 font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.dash_nav_logout}</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => handleNavClick(onOpenAuthModal)}
                className="flex items-center gap-3 p-3 rounded-xl text-left hover:bg-slate-50 transition-colors"
              >
                <LogIn className="w-4 h-4 text-slate-700" />
                <span>{t.dash_login_register}</span>
              </button>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              onClick={() => handleNavClick(() => onStartBooking())}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.nav_book_btn}</span>
            </button>

            <div className="flex items-center justify-center text-xs text-slate-500 pt-1">
              <a href="tel:+498945289100" className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>+49 89 45289-100</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
