import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award, 
  Building2,
  CalendarCheck
} from 'lucide-react';
import { Appointment, AppointmentDocument, UserProfile } from '../../../types.ts';
import { Language, translations } from '../../../lib/translations.ts';
import { StatusDonutChart, MonthlyActivityChart, CategoryDistributionChart } from './CustomerCharts.tsx';

interface CustomerAnalyticsTabProps {
  currentUser: UserProfile;
  appointments: Appointment[];
  documents: AppointmentDocument[];
  lang?: Language;
}

export default function CustomerAnalyticsTab({
  currentUser,
  appointments,
  documents,
  lang = 'de',
}: CustomerAnalyticsTabProps) {
  const t = translations[lang] || translations.de;
  const total = appointments.length;
  const confirmed = appointments.filter(a => a.status === 'Bestätigt' || a.status === 'Scheduled').length;
  const canceled = appointments.filter(a => a.status === 'Storniert' || a.status === 'Canceled').length;

  const confirmationRate = total > 0 ? Math.round(((total - canceled) / total) * 100) : 100;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-[10px] font-black uppercase tracking-wider">
            {t.dash_portal_badge}
          </span>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t.dash_status_online}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-serif-title">
          {t.dash_analytics_title} • {currentUser.firstName} {currentUser.lastName}
        </h2>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          {t.dash_analytics_subtitle}
        </p>
      </div>

      {/* 4 Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.stats_confirmed}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 font-serif">{confirmationRate}%</h3>
            <span className="text-xs font-bold text-emerald-600">{t.status_bestaetigt}</span>
          </div>
          <p className="text-[11px] text-slate-500">{total - canceled} / {total} {t.appointments}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_chat_gallery}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 font-serif">{documents.length}</h3>
            <span className="text-xs font-bold text-purple-600">Files</span>
          </div>
          <p className="text-[11px] text-slate-500">DATEV 256-bit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_advisor_card_title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-black text-slate-900 font-serif truncate">Abdul Sattar</h3>
          </div>
          <p className="text-[11px] text-slate-500">PhD, LL.M. • {t.advisor}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.dash_analytics_compliance}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-black text-emerald-700 font-serif">DATEV Standard</h3>
          </div>
          <p className="text-[11px] text-slate-500">SSL 256-bit</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Donut Chart: Terminstatus (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-serif-title flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>{t.dash_analytics_status_dist}</span>
            </h3>
            <p className="text-[11px] text-slate-500">{t.dash_analytics_subtitle}</p>
          </div>

          <StatusDonutChart appointments={appointments} lang={lang} />
        </div>

        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-serif-title flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>{t.dash_analytics_practice}</span>
            </h3>
            <p className="text-[11px] text-slate-500">{t.services_subtitle}</p>
          </div>

          <CategoryDistributionChart appointments={appointments} lang={lang} />

          <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{t.dash_analytics_compliance_desc}</span>
          </div>
        </div>

        {/* Monthly Activity Bar Chart (Full Width) */}
        <div className="lg:col-span-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif-title flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>{t.dash_analytics_timeline}</span>
              </h3>
              <p className="text-[11px] text-slate-500">{t.dash_analytics_subtitle}</p>
            </div>
          </div>

          <MonthlyActivityChart appointments={appointments} lang={lang} />
        </div>
      </div>
    </div>
  );
}
