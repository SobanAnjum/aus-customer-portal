import { 
  LayoutDashboard, 
  CalendarDays, 
  BarChart3, 
  MessageSquare, 
  User, 
  Plus, 
  LogOut, 
  Globe, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  CheckCircle2,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { UserProfile } from '../../../types.ts';
import { Language, translations } from '../../../lib/translations.ts';

export type CustomerDashboardTab = 'overview' | 'appointments' | 'analytics' | 'chat' | 'profile';

interface CustomerSidebarProps {
  activeTab: CustomerDashboardTab;
  setActiveTab: (tab: CustomerDashboardTab) => void;
  currentUser: UserProfile;
  appointmentsCount: number;
  roomsCount: number;
  onStartBooking: () => void;
  onNavigateWebsite: () => void;
  onSignOut: () => void;
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
  mobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
}

export default function CustomerSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  appointmentsCount,
  roomsCount,
  onStartBooking,
  onNavigateWebsite,
  onSignOut,
  lang,
  onChangeLanguage,
  mobileSidebarOpen = false,
  onCloseMobileSidebar,
}: CustomerSidebarProps) {
  const t = translations[lang] || translations.de;

  const menuItems: { id: CustomerDashboardTab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: t.dash_nav_cockpit, icon: LayoutDashboard },
    { id: 'appointments', label: t.dash_nav_appointments, icon: CalendarDays, badge: appointmentsCount },
    { id: 'analytics', label: t.dash_nav_analytics, icon: BarChart3 },
    { id: 'chat', label: t.dash_nav_chat, icon: MessageSquare, badge: roomsCount },
    { id: 'profile', label: t.dash_nav_profile, icon: User },
  ];

  const handleTabClick = (tabId: CustomerDashboardTab) => {
    setActiveTab(tabId);
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar();
    }
  };

  // Client initials for avatar
  const initials = `${(currentUser.firstName || '')[0] || 'M'}${(currentUser.lastName || '')[0] || 'P'}`.toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 py-6 border-slate-800 select-none">
      {/* Brand & Mobile Close Button */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center font-bold text-white shadow-xs text-sm font-serif">
              A
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block font-serif">A u.S Wirtschaftsberatung</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.dash_client_badge}</span>
            </div>
          </div>

          {onCloseMobileSidebar && (
            <button
              onClick={onCloseMobileSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Client Identity Card */}
        <div className="mt-3 p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 truncate" title={`${currentUser.firstName} ${currentUser.lastName}`}>
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="truncate">{currentUser.companyName || 'Privatmandant'}</span>
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {t.dash_status_online}
            </span>
            <span className="text-slate-400 font-mono">
              AUS-{currentUser.id.slice(0, 5).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Language Switcher Capsule */}
      <div className="mx-4 mb-4 flex items-center justify-between gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400" />
          <span>{lang === 'ur' ? 'زبان' : lang === 'en' ? 'Language' : 'Sprache'}</span>
        </span>
        <div className="flex gap-1">
          {(['de', 'en', 'ur'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onChangeLanguage(l)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all uppercase cursor-pointer ${
                lang === l
                  ? 'bg-slate-800 text-white shadow-2xs border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {l === 'de' ? 'DE' : l === 'en' ? 'EN' : 'UR'}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all text-start text-xs font-bold uppercase tracking-wider cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white shadow-2xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Suite Bottom */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={() => {
            onStartBooking();
            if (onCloseMobileSidebar) onCloseMobileSidebar();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-98 text-slate-950 transition-all text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.dash_nav_book}</span>
        </button>

        <div className="pt-1 flex items-center gap-1.5">
          <button
            onClick={() => {
              onNavigateWebsite();
              if (onCloseMobileSidebar) onCloseMobileSidebar();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-slate-700"
            title={t.dash_nav_website}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate">{t.dash_nav_website}</span>
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 text-[11px] font-semibold transition-all cursor-pointer border border-transparent hover:border-red-900/40"
            title={t.dash_nav_logout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.dash_nav_logout}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className={`hidden lg:flex fixed ${lang === 'ur' ? 'right-0 border-l' : 'left-0 border-r'} top-0 h-full w-64 z-40 border-slate-800 flex-col shadow-lg`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={onCloseMobileSidebar} 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
          />
          <aside className={`relative z-10 w-72 max-w-[85vw] h-full shadow-2xl flex flex-col ${lang === 'ur' ? 'mr-auto' : 'ml-0'}`}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
