import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  FileText, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  Sparkles, 
  ExternalLink, 
  Building2,
  Lock,
  UserCheck
} from 'lucide-react';
import { UserProfile, Appointment, AppointmentDocument } from '../../../types.ts';
import { Language, translations } from '../../../lib/translations.ts';
import { StatusDonutChart, MonthlyActivityChart } from './CustomerCharts.tsx';
import { downloadAppointmentIcs } from '../../lib/icsExport.ts';

interface CustomerOverviewTabProps {
  currentUser: UserProfile;
  appointments: Appointment[];
  documents: AppointmentDocument[];
  roomsCount: number;
  onNavigateTab: (tab: 'appointments' | 'analytics' | 'chat' | 'profile') => void;
  onNavigateToCalendar?: (apt: Appointment) => void;
  onStartBooking: (serviceId?: string) => void;
  onOpenUploadModal?: () => void;
  lang?: Language;
}

export default function CustomerOverviewTab({
  currentUser,
  appointments,
  documents,
  roomsCount,
  onNavigateTab,
  onNavigateToCalendar,
  onStartBooking,
  onOpenUploadModal,
  lang = 'de',
}: CustomerOverviewTabProps) {
  const t = translations[lang] || translations.de;
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated metrics
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(
    (a) => a.status === 'Bestätigt' || a.status === 'Scheduled'
  ).length;
  const inProgressAppointments = appointments.filter((a) => a.status === 'In Progress').length;
  const completedAppointments = appointments.filter((a) => a.status === 'Query Completed').length;
  const canceledAppointments = appointments.filter(
    (a) => a.status === 'Storniert' || a.status === 'Canceled'
  ).length;

  // Find next upcoming appointment
  const upcomingAppointments = appointments
    .filter(
      (a) =>
        a.date >= todayStr &&
        a.status !== 'Storniert' &&
        a.status !== 'Canceled'
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Executive Welcome Hero Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.dash_client_badge} • A u.S München</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif-title">
            {t.dash_overview_banner_title}, {currentUser.firstName} {currentUser.lastName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {t.dash_overview_banner_desc}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              {t.dash_status_online}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-4 h-4 text-slate-400" />
              {currentUser.companyName || 'Privatmandant'}
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Maximilianstr. 35, 80539 München
            </span>
          </div>
        </div>

        {/* Quick Action Suite in Banner */}
        <div className="relative flex flex-wrap sm:flex-nowrap lg:flex-col items-stretch gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={() => onStartBooking()}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.dash_nav_book}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
        {/* KPI 1: Total Appointments */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_kpi_total}</p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">{totalAppointments}</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{t.stats_booked}</p>
        </div>

        {/* KPI 2: Confirmed */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_filter_confirmed}</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-serif">{confirmedAppointments}</h3>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">{t.stats_secured}</p>
        </div>

        {/* KPI 3: In Progress */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_filter_pending}</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-blue-600 font-serif">{inProgressAppointments}</h3>
          <p className="text-[11px] text-blue-700 mt-1 font-semibold">{t.dash_filter_pending}</p>
        </div>

        {/* KPI 4: Akten & Dokumente */}
        <div 
          onClick={() => onNavigateTab('chat')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_chat_gallery}</p>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-700 font-serif">{documents.length}</h3>
          <p className="text-[11px] text-purple-700 mt-1 font-semibold">{t.dash_chat_gallery}</p>
        </div>

        {/* KPI 5: Chat Kanäle */}
        <div 
          onClick={() => onNavigateTab('chat')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_chat_title}</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 font-serif">{roomsCount}</h3>
          <p className="text-[11px] text-amber-700 mt-1 font-semibold">{t.dash_chat_general_ticket}</p>
        </div>
      </div>

      {/* Next Appointment Spotlight + Advisor Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Next Appointment Highlight (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif-title">
                  {t.dash_next_spotlight_title}
                </h3>
                <p className="text-[11px] text-slate-500">{t.next_appointments}</p>
              </div>
            </div>

            {nextAppointment && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.status_bestaetigt}
              </span>
            )}
          </div>

          {nextAppointment ? (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {nextAppointment.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {nextAppointment.bookingRef || `AuS-2024-${nextAppointment.id}`}
                    </span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {nextAppointment.date} • {nextAppointment.startTime} – {nextAppointment.endTime}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-950 font-serif">
                    {nextAppointment.title}
                  </h4>

                  {nextAppointment.taskReason && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {nextAppointment.taskReason}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      Abdul Sattar (PhD, LL.M.)
                    </span>
                    <span>•</span>
                    <span>Maximilianstr. 35, München</span>
                  </div>
                </div>

                {/* Quick actions for next appointment */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (onNavigateToCalendar) {
                        onNavigateToCalendar(nextAppointment);
                      } else {
                        onNavigateTab('appointments');
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Im Kalender anzeigen"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Im Kalender</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('chat')}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.dash_nav_chat}</span>
                  </button>

                  <button
                    onClick={() => downloadAppointmentIcs(nextAppointment)}
                    className="w-full px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title={t.dash_download_ics}
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.dash_download_ics}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onNavigateTab('appointments')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.dash_all_appointments_btn} ({appointments.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">
                {t.dash_none_upcoming}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t.hero_subheading}
              </p>
              <button
                onClick={() => onStartBooking()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.dash_nav_book}</span>
              </button>
            </div>
          )}
        </div>

        {/* Advisor Spotlight Card (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900 font-serif">{t.dash_advisor_card_title}</h4>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 shadow-2xs">
              <img 
                src="/assets/abdul_sattar.png" 
                alt="Abdul Sattar" 
                className="w-full h-full object-cover object-top"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0">
              <h5 className="text-sm font-bold text-slate-900 truncate font-serif">Abdul Sattar</h5>
              <p className="text-xs text-slate-700 font-semibold">PhD, LL.M., Magister Artium</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{t.advisor}</p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-600 space-y-2 border-t border-slate-100">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
              <span className="text-slate-500">Standort:</span>
              <span className="font-semibold text-slate-800">Maximilianstr. 35, München</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
              <span className="text-slate-500">Sicherheitsstandard:</span>
              <span className="font-semibold text-emerald-700">DATEV & SSL 256-bit</span>
            </div>
            <div className="flex items-center justify-between py-1 text-[11px]">
              <span className="text-slate-500">{t.pillar4_title}:</span>
              <span className="font-semibold text-slate-800">&lt; 24 Std.</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('chat')}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.dash_chat_now}</span>
          </button>
        </div>
      </div>

      {/* Graphs Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Status Breakdown Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif-title">
                {t.dash_analytics_status_dist}
              </h3>
              <p className="text-[11px] text-slate-500">{t.dash_analytics_subtitle}</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.dash_nav_analytics}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <StatusDonutChart appointments={appointments} lang={lang} />
        </div>

        {/* Monthly Activity Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif-title">
                {t.dash_analytics_timeline}
              </h3>
              <p className="text-[11px] text-slate-500">{t.dash_analytics_subtitle}</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.dash_nav_analytics}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <MonthlyActivityChart appointments={appointments} lang={lang} />
        </div>
      </div>
    </div>
  );
}
