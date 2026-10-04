import { useState, useEffect } from 'react';
import { Advisor, AdminAvailability } from '../../types.ts';
import { getApiUrl } from '../../lib/api.ts';
import { Language, translations } from '../../lib/translations.ts';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Info,
  Lock,
  CalendarCheck
} from 'lucide-react';

interface StepDateTimeSelectProps {
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  selectedAdvisorId: number | null;
  advisors: Advisor[];
  onSelectDateTime: (date: string, startTime: string, endTime: string) => void;
  onSelectAdvisor: (advisorId: number | null) => void;
  onNext: () => void;
  onBack: () => void;
  lang?: Language;
}

export default function StepDateTimeSelect({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  selectedAdvisorId,
  advisors,
  onSelectDateTime,
  onSelectAdvisor,
  onNext,
  onBack,
  lang = 'de',
}: StepDateTimeSelectProps) {
  const t = translations[lang] || translations.de;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayYearMonth = today.getFullYear() * 12 + today.getMonth();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });
  const [slots, setSlots] = useState<{ startTime: string; endTime: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);
  const [availabilities, setAvailabilities] = useState<AdminAvailability[]>([]);

  // Month navigation boundary check: Only Current Month (offset 0) and Next Month (offset 1)
  const currentViewYearMonth = currentMonthDate.getFullYear() * 12 + currentMonthDate.getMonth();
  const monthOffset = currentViewYearMonth - todayYearMonth;
  const canGoPrev = monthOffset > 0;
  const canGoNext = monthOffset < 1;
  const isNextMonth = monthOffset === 1;

  // Helper to format date string YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper to check if a day of week is allowed:
  // Mon (1), Tue (2), Wed (3), Thu (4), Sat (6) are allowed.
  // Sun (0) and Fri (5) are blocked.
  const isDayAllowed = (date: Date) => {
    const day = date.getDay();
    return day === 1 || day === 2 || day === 3 || day === 4 || day === 6;
  };

  // Load Admin Availability overrides
  useEffect(() => {
    fetch(getApiUrl('/api/admin/availability'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailabilities(data);
      })
      .catch(() => {});
  }, [currentMonthDate]);

  // Check if a date is open for booking
  const isDateOpenForBooking = (d: Date) => {
    const dStr = formatDateString(d);
    if (dStr < todayStr || !isDayAllowed(d)) return false;

    const dYearMonth = d.getFullYear() * 12 + d.getMonth();
    const dMonthOffset = dYearMonth - todayYearMonth;

    // Past or beyond next month
    if (dMonthOffset < 0 || dMonthOffset > 1) return false;

    const override = availabilities.find(a => a.date === dStr);

    // If Admin explicitly marked unavailable
    if (override?.status === 'unavailable') return false;

    // NEXT MONTH RULE: Must be explicitly opened by admin (available_all_day or custom_slots)
    if (dMonthOffset === 1) {
      if (!override || override.status === 'unavailable') {
        return false;
      }
    }

    return true;
  };

  // Get initial valid date
  const getInitialValidDate = () => {
    let check = new Date(today);
    for (let i = 0; i < 60; i++) {
      if (isDateOpenForBooking(check)) {
        return formatDateString(check);
      }
      check.setDate(check.getDate() + 1);
    }
    return todayStr;
  };

  // Generate calendar days for current month
  const getDaysInMonth = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
    
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
  };

  // Fetch available slots whenever date or advisor changes
  useEffect(() => {
    const targetDate = selectedDate || getInitialValidDate();
    setLoadingSlots(true);
    setSlotNotice(null);

    const query = new URLSearchParams({
      date: targetDate,
      ...(selectedAdvisorId ? { advisorId: String(selectedAdvisorId) } : {})
    });

    fetch(getApiUrl(`/api/public/available-slots?${query.toString()}`))
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setSlotNotice(data.message);
        }
        if (data.slots && Array.isArray(data.slots)) {
          setSlots(data.slots);
          if (!selectedStartTime || !data.slots.some((s: any) => s.startTime === selectedStartTime && s.available)) {
            const firstAvail = data.slots.find((s: any) => s.available);
            if (firstAvail) {
              onSelectDateTime(targetDate, firstAvail.startTime, firstAvail.endTime);
            }
          }
        } else {
          setSlots([]);
        }
      })
      .catch(err => {
        console.warn('Using client schedule fallback for slots:', err);
        const defaultSlots = [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '13:00', endTime: '14:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true },
          { startTime: '16:00', endTime: '17:00', available: true },
          { startTime: '17:00', endTime: '18:00', available: true },
        ];
        setSlots(defaultSlots);
        if (!selectedStartTime) {
          onSelectDateTime(targetDate, '09:00', '10:00');
        }
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [selectedDate, selectedAdvisorId]);

  const monthNames = lang === 'ur' 
    ? ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر']
    : lang === 'en'
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  const weekdayNames = lang === 'ur'
    ? ['پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ', 'اتوار']
    : lang === 'en'
    ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() - 1);
    setCurrentMonthDate(next);
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonthDate(next);
  };

  const handleDateClick = (d: Date) => {
    const dStr = formatDateString(d);
    if (!isDateOpenForBooking(d)) return;
    onSelectDateTime(dStr, selectedStartTime || '09:00', selectedEndTime || '10:00');
  };

  const currentAdvisor = advisors.find(a => a.id === selectedAdvisorId) || advisors[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-title">{t.step2_choose_date}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {t.step2_slots_available}
        </p>

        {/* Allowed Days Notice */}
        <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium px-3.5 py-1.5 rounded-full">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{t.booking_allowed_range}</span>
        </div>
      </div>

      {/* Advisor Profile Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-700" />
          <span>{t.step2_choose_advisor}</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onSelectAdvisor(currentAdvisor?.id || 1)}
            className="p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50 shadow-2xs flex items-center gap-3.5 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300 shadow-2xs">
              {currentAdvisor?.avatar?.startsWith('/') ? (
                <img src={currentAdvisor.avatar} alt="Abdul Sattar" className="w-full h-full object-cover object-top" />
              ) : (
                'AS'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentAdvisor?.name || 'Abdul Sattar (PhD, LL.M.)'}
              </p>
              <p className="text-[10px] text-slate-600 truncate">
                {currentAdvisor?.title || 'Kanzleiinhaber & Gründer'}
              </p>
              <span className="inline-block mt-1 text-[9px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full">
                {t.booking_available_badge}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar (7 Cols) & Time Slots (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Picker (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 capitalize font-serif-title">
                {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
              </h4>
              {isNextMonth && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                  {t.booking_next_month_badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={!canGoPrev}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                title={canGoPrev ? t.booking_prev_month : '—'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={!canGoNext}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                title={canGoNext ? t.booking_next_month : '—'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekdayNames.map((d, i) => (
              <span key={i} className="text-[11px] font-bold text-slate-400 uppercase py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((d, i) => {
              if (!d) {
                return <div key={`empty-${i}`} className="min-h-[44px]" />;
              }

              const dStr = formatDateString(d);
              const isOpen = isDateOpenForBooking(d);
              const isSelected = selectedDate === dStr;
              const isToday = dStr === todayStr;
              const isWorkday = isDayAllowed(d);
              const dayNum = d.getDate();

              let tooltipText = t.booking_legend_available;
              if (dStr < todayStr) tooltipText = '—';
              else if (!isWorkday) tooltipText = '—';
              else if (!isOpen && isNextMonth) tooltipText = t.booking_legend_locked;
              else if (!isOpen) tooltipText = '—';

              return (
                <button
                  key={dStr}
                  type="button"
                  disabled={!isOpen}
                  onClick={() => handleDateClick(d)}
                  title={tooltipText}
                  className={`min-h-[44px] rounded-xl font-bold text-xs flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs scale-[1.03]'
                      : !isOpen
                      ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed opacity-40'
                      : 'text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    {dayNum}
                    {!isOpen && isWorkday && isNextMonth && (
                      <Lock className="w-2.5 h-2.5 text-slate-400 inline" />
                    )}
                  </span>
                  {isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>{t.booking_legend_selected}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-100 border border-blue-400" />
              <span>{t.booking_legend_available}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>{t.booking_legend_locked}</span>
            </span>
          </div>
        </div>

        {/* Time Slot Picker (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <span>Freie Uhrzeiten</span>
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {selectedDate || todayStr}
              </span>
            </div>

            {loadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                <span className="text-xs">Verfügbarkeiten werden geprüft...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-8 px-4 text-center bg-slate-50 border border-slate-200 rounded-xl">
                <Lock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Keine freien Termine</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {slotNotice || 'Für das gewählte Datum sind keine freien Termine verfügbar. Bitte wählen Sie einen anderen Tag.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {slots.map((slot, index) => {
                  const isSelected = selectedStartTime === slot.startTime;
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => onSelectDateTime(selectedDate || todayStr, slot.startTime, slot.endTime)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs scale-[1.02]'
                          : slot.available
                          ? 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400 text-slate-900'
                          : 'border-slate-100 bg-slate-100/50 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <span>{slot.startTime} - {slot.endTime}</span>
                      <span className={`text-[9px] font-sans font-medium ${
                        isSelected ? 'text-slate-300' : slot.available ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {slot.available ? 'Verfügbar' : 'Belegt'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.step2_prev_btn || 'Zurück'}</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!selectedDate || !selectedStartTime || slots.length === 0}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{t.step2_next_btn || 'Weiter zur Dateneingabe'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
