import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  CheckSquare, 
  MessageSquare, 
  Plus, 
  Download, 
  Search, 
  CalendarDays,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarRange,
  ArrowRight
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../../types.ts';
import { Language, translations } from '../../../lib/translations.ts';
import { downloadAppointmentIcs } from '../../lib/icsExport.ts';

interface CustomerAppointmentsTabProps {
  appointments: Appointment[];
  loading: boolean;
  onOpenChat: (apt: Appointment) => void;
  onCancelAppointment: (aptId: number) => void;
  onStartBooking: () => void;
  targetAppointment?: Appointment | null;
  onClearTargetAppointment?: () => void;
  lang?: Language;
}

export default function CustomerAppointmentsTab({
  appointments,
  loading,
  onOpenChat,
  onCancelAppointment,
  onStartBooking,
  targetAppointment = null,
  onClearTargetAppointment,
  lang = 'de',
}: CustomerAppointmentsTabProps) {
  const t = translations[lang] || translations.de;
  const [tabView, setTabView] = useState<'list' | 'calendar'>('list');
  const [calMode, setCalMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'inProgress' | 'rescheduled' | 'completed' | 'canceled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize when targetAppointment is passed
  useEffect(() => {
    if (targetAppointment && targetAppointment.date) {
      const parts = targetAppointment.date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setCurrentDate(new Date(y, m, d));
        }
      }
      setSelectedAppointment(targetAppointment);
      setTabView('calendar');
    }
  }, [targetAppointment]);

  // Jump from list view to calendar for specific appointment
  const handleJumpToCalendar = (apt: Appointment) => {
    if (apt.date) {
      const parts = apt.date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setCurrentDate(new Date(y, m, d));
        }
      }
    }
    setSelectedAppointment(apt);
    setTabView('calendar');
  };

  // Status counts
  const counts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'Bestätigt' || a.status === 'Scheduled').length,
    inProgress: appointments.filter(a => a.status === 'In Progress').length,
    rescheduled: appointments.filter(a => a.status === 'Verschoben' || a.status === 'Rescheduled').length,
    completed: appointments.filter(a => a.status === 'Query Completed').length,
    canceled: appointments.filter(a => a.status === 'Storniert' || a.status === 'Canceled').length,
  };

  // Filter & Search Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (filterStatus === 'confirmed' && apt.status !== 'Bestätigt' && apt.status !== 'Scheduled') return false;
      if (filterStatus === 'inProgress' && apt.status !== 'In Progress') return false;
      if (filterStatus === 'rescheduled' && apt.status !== 'Verschoben' && apt.status !== 'Rescheduled') return false;
      if (filterStatus === 'completed' && apt.status !== 'Query Completed') return false;
      if (filterStatus === 'canceled' && apt.status !== 'Storniert' && apt.status !== 'Canceled') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (apt.title || '').toLowerCase().includes(q);
        const matchReason = (apt.taskReason || '').toLowerCase().includes(q);
        const matchRef = (apt.bookingRef || '').toLowerCase().includes(q);
        const matchDate = (apt.date || '').includes(q);
        if (!matchTitle && !matchReason && !matchRef && !matchDate) return false;
      }

      return true;
    });
  }, [appointments, filterStatus, searchQuery]);

  const monthNames = lang === 'ur' 
    ? ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر']
    : lang === 'en'
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  const dayNames = lang === 'ur'
    ? ['پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ', 'اتوار']
    : lang === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (calMode === 'week') {
      nextDate.setDate(currentDate.getDate() - 7);
    } else {
      nextDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (calMode === 'week') {
      nextDate.setDate(currentDate.getDate() + 7);
    } else {
      nextDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(nextDate);
  };

  const handleJumpToday = () => {
    setCurrentDate(new Date());
  };

  // Month Calendar Days calculation
  const monthCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday is 0
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentDate]);

  // Week Calendar Days calculation
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(start);
      nextDay.setDate(start.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentDate]);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Scheduled':
      case 'Bestätigt':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t.status_bestaetigt}
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {t.dash_filter_pending}
          </span>
        );
      case 'Rescheduled':
      case 'Verschoben':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {t.status_verschoben}
          </span>
        );
      case 'Canceled':
      case 'Storniert':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {t.status_storniert}
          </span>
        );
      case 'Query Completed':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" /> {t.dash_filter_completed}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-serif-title">
              {t.dash_apts_title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.dash_apts_subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Switcher: List vs Calendar */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setTabView('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  tabView === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
              <button
                onClick={() => setTabView('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  tabView === 'calendar'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 text-blue-600" />
                <span>Kalender</span>
              </button>
            </div>

            <button
              onClick={onStartBooking}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t.dash_nav_book}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar (Active on List View) */}
        {tabView === 'list' && (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Status Filter Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dash_filter_all} ({counts.all})
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'confirmed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dash_filter_confirmed} ({counts.confirmed})
              </button>
              <button
                onClick={() => setFilterStatus('inProgress')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'inProgress' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dash_filter_pending} ({counts.inProgress})
              </button>
              <button
                onClick={() => setFilterStatus('rescheduled')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'rescheduled' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dash_filter_rescheduled} ({counts.rescheduled})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'completed' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dash_filter_completed} ({counts.completed})
              </button>
              <button
                onClick={() => setFilterStatus('canceled')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'canceled' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dash_filter_cancelled} ({counts.canceled})
              </button>
            </div>

            {/* Search box */}
            <div className="relative w-full lg:w-72">
              <Search className={`w-3.5 h-3.5 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-3 text-slate-400`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.dash_apts_search}
                className={`w-full ${lang === 'ur' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors`}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===================== VIEW 1: LIST VIEW ===================== */}
      {tabView === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-500 text-xs">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mb-2" />
              <p>...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {t.dash_no_matching_apts}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.no_upcoming_apts}
                </p>
              </div>
              <button
                onClick={onStartBooking}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.dash_nav_book}</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredAppointments.map((apt) => {
                const isCanceled = apt.status === 'Storniert' || apt.status === 'Canceled';

                return (
                  <div 
                    key={apt.id} 
                    className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-2.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {getStatusBadge(apt.status)}
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {apt.bookingRef || `AUS-2024-${apt.id}`}
                        </span>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {apt.date} • {apt.startTime} – {apt.endTime}
                        </span>
                      </div>

                      <h3 
                        onClick={() => handleJumpToCalendar(apt)}
                        className="text-base sm:text-lg font-bold text-slate-950 font-serif hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {apt.title}
                      </h3>

                      {apt.taskReason && (
                        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                          {apt.taskReason}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          Abdul Sattar (PhD, LL.M.)
                        </span>
                        <span>•</span>
                        <span>Maximilianstraße 35, 80539 München</span>
                      </div>
                    </div>

                    {/* Actions Suite */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                      {/* Jump to Calendar Action */}
                      <button
                        onClick={() => handleJumpToCalendar(apt)}
                        className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title="Im Kalender anzeigen"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-700" />
                        <span>Im Kalender</span>
                      </button>

                      <button
                        onClick={() => onOpenChat(apt)}
                        className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                        <span>{t.dash_nav_chat}</span>
                      </button>

                      <button
                        onClick={() => downloadAppointmentIcs(apt)}
                        className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title={t.dash_download_ics}
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>ICS</span>
                      </button>

                      {!isCanceled && (
                        <button
                          onClick={() => onCancelAppointment(apt.id)}
                          className="px-3 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                          title={t.dash_cancel_action}
                        >
                          <span>{t.dash_cancel_action}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== VIEW 2: CALENDAR VIEW ===================== */}
      {tabView === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Calendar Controls Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 font-serif">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {calMode === 'week' ? 'Wochenansicht (Mo – So)' : 'Monatsübersicht'}
                  </p>
                </div>
              </div>

              {/* View switch & Month Navigator */}
              <div className="flex items-center gap-2.5">
                <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => setCalMode('month')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      calMode === 'month'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monat
                  </button>
                  <button
                    onClick={() => setCalMode('week')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      calMode === 'week'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Woche
                  </button>
                </div>

                <button
                  onClick={handleJumpToday}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  Heute
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Mode: Month View */}
            {calMode === 'month' && (
              <div className="p-4 sm:p-6 bg-slate-50/30">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {dayNames.map((d, i) => (
                    <span key={i} className="text-[11px] font-bold text-slate-400 uppercase py-1">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Day cells grid */}
                <div className="grid grid-cols-7 gap-2">
                  {monthCalendarDays.map((d, i) => {
                    if (!d) {
                      return <div key={`empty-${i}`} className="bg-slate-50/40 rounded-2xl border border-dashed border-slate-200 min-h-[90px]" />;
                    }

                    const dStr = formatDateString(d);
                    const isCurrentToday = isToday(d);
                    const isDaySelected = selectedAppointment?.date === dStr;
                    const dayAppointments = appointments.filter((a) => a.date === dStr);

                    return (
                      <div
                        key={dStr}
                        onClick={() => {
                          if (dayAppointments.length > 0) {
                            setSelectedAppointment(dayAppointments[0]);
                          }
                        }}
                        className={`p-2.5 rounded-2xl border transition-all flex flex-col min-h-[95px] ${
                          isDaySelected
                            ? 'border-2 border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                            : isCurrentToday
                            ? 'bg-blue-50/40 border-blue-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        } ${dayAppointments.length > 0 ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${
                              isDaySelected ? 'text-blue-700 font-extrabold' : isCurrentToday ? 'text-blue-600 font-bold' : 'text-slate-800'
                            }`}>
                              {d.getDate()}
                            </span>
                            {isDaySelected && (
                              <span className="text-[8px] font-extrabold bg-blue-600 text-white px-1 py-0.2 rounded uppercase">
                                Aktiv
                              </span>
                            )}
                          </div>
                          {dayAppointments.length > 0 && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                              {dayAppointments.length}
                            </span>
                          )}
                        </div>

                        {/* Appointment Badges */}
                        <div className="space-y-1 flex-1 overflow-y-auto mt-1">
                          {dayAppointments.map((apt) => {
                            const isAptActive = selectedAppointment?.id === apt.id;
                            return (
                              <div
                                key={apt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(apt);
                                }}
                                className={`text-[10px] px-2 py-1 rounded-lg truncate font-bold cursor-pointer transition-all ${
                                  isAptActive
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                }`}
                              >
                                {apt.startTime} {apt.title}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calendar Mode: Week View */}
            {calMode === 'week' && (
              <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[480px] bg-slate-50/30">
                {weekDays.map((day, idx) => {
                  const dayStr = formatDateString(day);
                  const isCurrentToday = isToday(day);
                  const isDaySelected = selectedAppointment?.date === dayStr;
                  const dayAppointments = appointments.filter((a) => a.date === dayStr);

                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col h-full min-w-[120px] transition-colors ${
                        isDaySelected ? 'bg-blue-50/25 ring-1 ring-blue-500/20' : ''
                      }`}
                    >
                      <div className={`p-3 text-center border-b transition-colors ${
                        isDaySelected
                          ? 'bg-blue-100/70 border-blue-300 ring-1 ring-blue-500/30'
                          : isCurrentToday
                          ? 'bg-blue-50/60 border-slate-100'
                          : 'bg-white border-slate-100'
                      }`}>
                        <div className="flex items-center justify-center gap-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                            isDaySelected ? 'text-blue-700' : 'text-slate-400'
                          }`}>
                            {dayNames[idx]}
                          </span>
                          {isDaySelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                          )}
                        </div>
                        <span className={`text-base font-extrabold block mt-0.5 ${
                          isDaySelected
                            ? 'text-blue-700 underline decoration-2 decoration-blue-500 underline-offset-2'
                            : isCurrentToday
                            ? 'text-blue-600'
                            : 'text-slate-800'
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>

                      <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[450px]">
                        {dayAppointments.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-slate-300 text-[10px] italic py-8">
                            Keine Termine
                          </div>
                        ) : (
                          dayAppointments.map((apt) => {
                            const isSelected = selectedAppointment?.id === apt.id;
                            return (
                              <div
                                key={apt.id}
                                onClick={() => setSelectedAppointment(apt)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                                  isSelected
                                    ? 'border-blue-600 bg-white ring-2 ring-blue-600/20 shadow-md scale-[1.02]'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 shadow-2xs'
                                }`}
                              >
                                <div className="font-bold text-slate-900 truncate text-[11px] mb-1">
                                  {apt.title}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mb-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{apt.startTime} – {apt.endTime}</span>
                                </div>
                                <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                                  {apt.status}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Appointment Spotlight Card */}
          {selectedAppointment ? (
            <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-md p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <h4 className="text-base font-bold text-slate-950 font-serif">
                    Ausgewählter Termin im Kalender
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {selectedAppointment.bookingRef || `AUS-2024-${selectedAppointment.id}`}
                  </span>
                </div>
                {getStatusBadge(selectedAppointment.status)}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 min-w-0">
                  <h3 className="text-lg font-bold text-slate-950 font-serif">
                    {selectedAppointment.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Datum: {selectedAppointment.date} • {selectedAppointment.startTime} – {selectedAppointment.endTime} Uhr
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      Berater: Abdul Sattar (PhD, LL.M.)
                    </span>
                  </div>

                  {selectedAppointment.taskReason && (
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl pt-1">
                      {selectedAppointment.taskReason}
                    </p>
                  )}
                </div>

                {/* Spotlight Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenChat(selectedAppointment)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.dash_nav_chat}</span>
                  </button>

                  <button
                    onClick={() => downloadAppointmentIcs(selectedAppointment)}
                    className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.dash_download_ics}</span>
                  </button>

                  {selectedAppointment.status !== 'Storniert' && selectedAppointment.status !== 'Canceled' && (
                    <button
                      onClick={() => onCancelAppointment(selectedAppointment.id)}
                      className="px-3.5 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <span>{t.dash_cancel_action}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Klicken Sie auf einen Termin im Kalender oben, um die Detailansicht und Aktionen anzuzeigen.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
