import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Download, 
  Printer, 
  ArrowRight, 
  FileText,
  MapPin,
  BadgeCheck
} from 'lucide-react';
import { BookingConfirmation } from '../../types.ts';
import { Language, translations } from '../../lib/translations.ts';

interface StepConfirmationProps {
  confirmation: BookingConfirmation;
  onBookAnother: () => void;
  onGoHome: () => void;
  lang?: Language;
}

export default function StepConfirmation({
  confirmation,
  onBookAnother,
  onGoHome,
  lang = 'de',
}: StepConfirmationProps) {
  const t = translations[lang] || translations.de;
  const { appointment, bookingRef } = confirmation;

  // Generate .ics calendar download
  const handleDownloadIcs = () => {
    const title = `A u.S Beratung: ${appointment.title}`;
    const description = `Beratungsgespräch bei A u.S Wirtschaftsberatung. Buchungs-ID: ${bookingRef}. Berater: ${appointment.advisor?.name || 'Abdul Sattar'}.`;
    const location = 'A u.S Wirtschaftsberatung, Maximilianstraße 35, 80539 München / Online';
    
    const [y, m, d] = appointment.date.split('-');
    const [startH, startM] = appointment.startTime.split(':');
    const [endH, endM] = appointment.endTime.split(':');
    
    const dtStart = `${y}${m}${d}T${startH}${startM}00`;
    const dtEnd = `${y}${m}${d}T${endH}${endM}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//A u. S Wirtschaftsberatung e.K.//Terminbuchung//DE',
      'BEGIN:VEVENT',
      `UID:${bookingRef}@aus-beratung.de`,
      `DTSTAMP:${dtStart}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `A_u_S_Termin_${bookingRef}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Success Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-slate-800 shadow-2xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-full">
          {t.booking_confirmed_badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-serif-title">
          {t.step4_confirmed_title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {t.step4_confirmed_desc}
        </p>

        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900">
            <span className="text-slate-500">{t.step4_ref_label}:</span>
            <span className="text-slate-950 font-extrabold text-sm">{bookingRef}</span>
          </div>
        </div>
      </div>

      {/* Appointment Ticket Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <span>{t.booking_ticket_header}</span>
          </h4>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-md border border-slate-200">
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-xs">
          {/* Service & Title */}
          <div>
            <span className="text-slate-400 font-medium block">{t.details_service}:</span>
            <strong className="text-sm font-bold text-slate-900 block mt-1 font-serif">
              {appointment.title}
            </strong>
          </div>

          {/* Date & Time */}
          <div>
            <span className="text-slate-400 font-medium block">{t.details_date} & {t.details_time}:</span>
            <div className="flex items-center gap-2 mt-1 font-bold text-slate-900">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                {appointment.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-700" />
                {appointment.startTime} – {appointment.endTime} Uhr
              </span>
            </div>
          </div>

          {/* Assigned Advisor */}
          <div>
            <span className="text-slate-400 font-medium block">{t.modal_advisor_label}:</span>
            <strong className="text-xs font-bold text-slate-900 block mt-1">
              {appointment.advisor?.name || 'Abdul Sattar (PhD, LL.M.)'} • Kanzleiinhaber
            </strong>
          </div>

          {/* Location */}
          <div>
            <span className="text-slate-400 font-medium block">{t.booking_location_label}</span>
            <strong className="text-xs font-bold text-slate-900 block mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span>{t.booking_location_val}</span>
            </strong>
          </div>
        </div>

        {/* Client details box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.booking_contacts_label}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <strong>{appointment.client.name}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{appointment.client.email}</span>
            </div>
            {appointment.client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{appointment.client.phone}</span>
              </div>
            )}
            {appointment.client.company && (
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{appointment.client.company}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick action tools */}
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={handleDownloadIcs}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.step4_download_ics}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.step4_print}</span>
          </button>
        </div>
      </div>

      {/* Navigation Return Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={onBookAnother}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {t.booking_book_another}
        </button>

        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <span>{t.step4_home_btn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
