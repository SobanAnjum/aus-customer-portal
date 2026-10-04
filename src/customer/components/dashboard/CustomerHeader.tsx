import { Search, Menu, Plus, ShieldCheck, LogOut, User, Bell } from 'lucide-react';
import { UserProfile } from '../../../types.ts';
import { Language, translations } from '../../../lib/translations.ts';

interface CustomerHeaderProps {
  currentUser: UserProfile;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenMobileSidebar?: () => void;
  onStartBooking: () => void;
  onOpenUploadModal?: () => void;
  onNavigateProfile: () => void;
  onSignOut: () => void;
  lang: Language;
}

export default function CustomerHeader({
  currentUser,
  searchQuery,
  setSearchQuery,
  onOpenMobileSidebar,
  onStartBooking,
  onNavigateProfile,
  onSignOut,
  lang,
}: CustomerHeaderProps) {
  const t = translations[lang] || translations.de;

  const initials = `${(currentUser.firstName || '')[0] || 'M'}${(currentUser.lastName || '')[0] || 'P'}`.toUpperCase();

  return (
    <header className="min-h-18 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-white sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger + Prominent Client Name & Badges */}
      <div className="flex items-center gap-3.5">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-[10px] font-black uppercase tracking-wider">
              {t.dash_portal_badge}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {t.dash_status_online}
            </span>
            <span className="hidden md:inline text-[10px] text-slate-400 font-mono">
              {t.dash_client_id}: A u.S-{currentUser.id.slice(0, 6).toUpperCase()}
            </span>
          </div>

          {/* Prominent Name On Top */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-serif-title tracking-tight truncate">
            {t.dash_welcome}, {currentUser.firstName} {currentUser.lastName}
          </h1>

          <p className="text-xs text-slate-500 truncate flex items-center gap-2">
            <span className="font-semibold text-slate-700">{currentUser.companyName || 'Privatmandant'}</span>
            <span>•</span>
            <span className="text-slate-500">{currentUser.email}</span>
          </p>
        </div>
      </div>

      {/* Right: Search, Quick Actions & Profile Capsule */}
      <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
        {/* Search input */}
        <div className="relative w-full sm:w-56 md:w-64">
          <span className={`absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5 text-slate-400`}>
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${lang === 'ur' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-2xs`}
            placeholder={t.dash_search_placeholder}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">

          <button
            onClick={onStartBooking}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.dash_book_cta}</span>
            <span className="sm:hidden">{t.dash_book_cta}</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <button
              onClick={onNavigateProfile}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
              title={t.dash_profile_cta}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-2xs group-hover:bg-blue-700 transition-colors">
                {initials}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {currentUser.firstName}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">{t.dash_nav_profile}</span>
              </div>
            </button>

            <button
              onClick={onSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title={t.dash_nav_logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
