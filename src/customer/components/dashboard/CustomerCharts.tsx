import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../../types.ts';
import { CheckCircle2, Clock, AlertTriangle, XCircle, CheckSquare, Sparkles } from 'lucide-react';
import { Language, translations } from '../../../lib/translations.ts';

interface StatusDonutChartProps {
  appointments: Appointment[];
  lang?: Language;
}

export function StatusDonutChart({ appointments, lang = 'de' }: StatusDonutChartProps) {
  const t = translations[lang] || translations.de;
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  // Group appointments into standardized status buckets
  const counts = {
    confirmed: appointments.filter(a => a.status === 'Bestätigt' || a.status === 'Scheduled').length,
    inProgress: appointments.filter(a => a.status === 'In Progress').length,
    rescheduled: appointments.filter(a => a.status === 'Verschoben' || a.status === 'Rescheduled').length,
    completed: appointments.filter(a => a.status === 'Query Completed').length,
    canceled: appointments.filter(a => a.status === 'Storniert' || a.status === 'Canceled').length,
  };

  const total = appointments.length;

  const dataSegments = [
    { key: 'confirmed', label: t.dash_filter_confirmed, count: counts.confirmed, color: '#10b981', hoverColor: '#059669', bgClass: 'bg-emerald-500', icon: CheckCircle2 },
    { key: 'inProgress', label: t.dash_filter_pending, count: counts.inProgress, color: '#3b82f6', hoverColor: '#2563eb', bgClass: 'bg-blue-500', icon: Clock },
    { key: 'rescheduled', label: t.dash_filter_rescheduled, count: counts.rescheduled, color: '#f59e0b', hoverColor: '#d97706', bgClass: 'bg-amber-500', icon: AlertTriangle },
    { key: 'completed', label: t.dash_filter_completed, count: counts.completed, color: '#6366f1', hoverColor: '#4f46e5', bgClass: 'bg-indigo-500', icon: CheckSquare },
    { key: 'canceled', label: t.dash_filter_cancelled, count: counts.canceled, color: '#f43f5e', hoverColor: '#e11d48', bgClass: 'bg-rose-500', icon: XCircle },
  ].filter(s => total === 0 || s.count > 0);

  // SVG Geometry for Donut
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-1">
      {/* SVG Donut Circle */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="18"
          />

          {total === 0 ? (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="18"
              strokeDasharray={circumference}
              strokeDashoffset="0"
            />
          ) : (
            dataSegments.map((segment) => {
              const percent = (segment.count / total);
              const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
              const strokeDashoffset = -circumference * cumulativePercent;
              cumulativePercent += percent;
              const isHovered = hoveredStatus === segment.key;

              return (
                <circle
                  key={segment.key}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={isHovered ? segment.hoverColor : segment.color}
                  strokeWidth={isHovered ? "22" : "18"}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredStatus(segment.key)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          {hoveredStatus ? (
            (() => {
              const active = dataSegments.find(s => s.key === hoveredStatus);
              if (!active) return null;
              const pct = total > 0 ? Math.round((active.count / total) * 100) : 0;
              return (
                <>
                  <span className="text-xl font-black text-slate-900">{active.count}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{active.label}</span>
                  <span className="text-[10px] font-bold text-emerald-600">{pct}%</span>
                </>
              );
            })()
          ) : (
            <>
              <span className="text-2xl font-black text-slate-900 font-serif">{total}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {total === 1 ? (lang === 'ur' ? 'ملاقات' : lang === 'en' ? 'Appointment' : 'Termin') : (lang === 'ur' ? 'ملاقاتیں' : lang === 'en' ? 'Appointments' : 'Termine')}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">{t.dash_kpi_total}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 w-full space-y-2">
        {dataSegments.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center">
            {t.dash_no_matching_apts}
          </div>
        ) : (
          dataSegments.map((segment) => {
            const isHovered = hoveredStatus === segment.key;
            const pct = total > 0 ? Math.round((segment.count / total) * 100) : 0;
            const Icon = segment.icon;

            return (
              <div
                key={segment.key}
                onMouseEnter={() => setHoveredStatus(segment.key)}
                onMouseLeave={() => setHoveredStatus(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                  isHovered
                    ? 'bg-slate-50 border-slate-300 shadow-2xs'
                    : 'border-transparent hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${segment.bgClass} shrink-0`} />
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">{segment.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{segment.count}</span>
                  <span className="text-[11px] font-semibold text-slate-400 w-10 text-right">({pct}%)</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface MonthlyActivityChartProps {
  appointments: Appointment[];
  lang?: Language;
}

export function MonthlyActivityChart({ appointments, lang = 'de' }: MonthlyActivityChartProps) {
  const t = translations[lang] || translations.de;
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Generate localized last 6 months list
  const deMonths = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const urMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
  const monthNames = lang === 'ur' ? urMonths : lang === 'en' ? enMonths : deMonths;

  const now = new Date();
  const monthsData: { key: string; label: string; count: number; confirmed: number; year: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIndex = d.getMonth();
    const year = d.getFullYear();
    const key = `${year}-${String(mIndex + 1).padStart(2, '0')}`;
    const label = `${monthNames[mIndex]} ${String(year).slice(2)}`;

    // Count appointments in this month
    const monthApts = appointments.filter(a => a.date && a.date.startsWith(key));
    const confirmed = monthApts.filter(a => a.status === 'Bestätigt' || a.status === 'Scheduled' || a.status === 'Query Completed').length;

    monthsData.push({
      key,
      label,
      count: monthApts.length,
      confirmed,
      year,
    });
  }

  const maxVal = Math.max(...monthsData.map(m => m.count), 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          {t.dash_analytics_timeline}
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 inline-block" />
            {t.dash_kpi_total}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            {t.dash_filter_confirmed}
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200">
        {monthsData.map((m) => {
          const heightPercent = Math.max(Math.round((m.count / maxVal) * 100), m.count > 0 ? 12 : 4);
          const isHovered = hoveredMonth === m.key;

          return (
            <div
              key={m.key}
              onMouseEnter={() => setHoveredMonth(m.key)}
              onMouseLeave={() => setHoveredMonth(null)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 z-10 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                  <p className="font-bold">{m.label}: {m.count} {t.appointments}</p>
                  <p className="text-emerald-400 font-medium">({m.confirmed} {t.dash_filter_confirmed})</p>
                </div>
              )}

              {/* Bar */}
              <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 flex flex-col justify-end ${
                    m.count > 0
                      ? isHovered
                        ? 'bg-blue-600'
                        : 'bg-slate-900'
                      : 'bg-slate-200'
                  }`}
                >
                  {m.confirmed > 0 && (
                    <div
                      style={{ height: `${Math.round((m.confirmed / (m.count || 1)) * 100)}%` }}
                      className="w-full bg-emerald-500/80 rounded-t-xs"
                    />
                  )}
                </div>
              </div>

              {/* Count label on top of bar if count > 0 */}
              <span className={`text-[10px] font-bold mt-1.5 transition-colors ${isHovered ? 'text-blue-600' : 'text-slate-600'}`}>
                {m.count}
              </span>

              {/* Month label */}
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {m.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CategoryDistributionProps {
  appointments: Appointment[];
  lang?: Language;
}

export function CategoryDistributionChart({ appointments, lang = 'de' }: CategoryDistributionProps) {
  const t = translations[lang] || translations.de;

  // Infer category from title or taskReason
  const categories = [
    {
      id: 'tax',
      label: t.services_filter_tax,
      count: appointments.filter(a => /steuer/i.test(a.title || '') || /steuer/i.test(a.taskReason || '')).length,
      color: 'bg-blue-600',
    },
    {
      id: 'consulting',
      label: t.services_filter_consulting,
      count: appointments.filter(a => /wirtschaft|strategie|m&a|beratung/i.test(a.title || '') || /wirtschaft|strategie/i.test(a.taskReason || '')).length,
      color: 'bg-emerald-600',
    },
    {
      id: 'audit',
      label: t.services_filter_audit,
      count: appointments.filter(a => /prüfung|audit|bilanz|jahresabschluss/i.test(a.title || '') || /prüfung|bilanz/i.test(a.taskReason || '')).length,
      color: 'bg-purple-600',
    },
    {
      id: 'finance',
      label: t.services_filter_finance,
      count: appointments.filter(a => /finanz|kapital|kredit|invest/i.test(a.title || '') || /finanz/i.test(a.taskReason || '')).length,
      color: 'bg-amber-600',
    },
  ];

  // Default distribution if zero matches
  const totalCategorized = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-3.5">
      {categories.map((cat) => {
        const pct = totalCategorized > 0 ? Math.round((cat.count / totalCategorized) * 100) : cat.count > 0 ? 100 : 0;

        return (
          <div key={cat.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 truncate">{cat.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{cat.count}</span>
                <span className="text-slate-400 font-semibold text-[11px]">({pct}%)</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${pct}%` }}
                className={`h-full ${cat.color} rounded-full transition-all duration-500`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
