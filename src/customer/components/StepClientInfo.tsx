import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Calendar, 
  Clock, 
  Lock, 
  BadgeCheck,
  Home,
  Sparkles,
  LogIn,
  Check
} from 'lucide-react';
import { BookingFormData, ServiceItem, Advisor, UserProfile } from '../../types.ts';
import { Language, translations } from '../../lib/translations.ts';

interface StepClientInfoProps {
  formData: BookingFormData;
  selectedService: ServiceItem | undefined;
  selectedAdvisor: Advisor | undefined;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onChange: (field: keyof BookingFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  lang?: Language;
}

export default function StepClientInfo({
  formData,
  selectedService,
  selectedAdvisor,
  currentUser,
  onOpenAuthModal,
  onChange,
  onSubmit,
  onBack,
  loading,
  error,
  lang = 'de',
}: StepClientInfoProps) {
  const t = translations[lang] || translations.de;
  const [bookingMode, setBookingMode] = useState<'profile' | 'guest'>(
    currentUser ? 'profile' : 'guest'
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
      <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-title">{t.step3_client_title}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {currentUser ? t.booking_client_logged_in_notice : t.booking_client_guest_notice}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Account Status / Login Banner */}
          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {lang === 'ur' ? 'تصدیق شدہ موکل' : lang === 'en' ? 'Verified Client' : 'Verifiziertes Mandantenkonto'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {currentUser.email} • {currentUser.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              >
                {lang === 'ur' ? 'پروفائل تبدیل کریں' : lang === 'en' ? 'Switch Account' : 'Konto wechseln'}
              </button>
            </div>
          ) : (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs text-blue-900 font-medium">
                  {lang === 'ur' 
                    ? 'کیا آپ کا پہلے سے اکاؤنٹ ہے؟ وقت بچانے کے لیے لاگ ان کریں۔' 
                    : lang === 'en' 
                    ? 'Already have an account? Sign in for instant profile pre-fill.' 
                    : 'Haben Sie bereits ein Konto? Sparen Sie Zeit mit dem E-Mail-Code Login.'}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.auth_modal_login_tab}</span>
              </button>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.step3_full_name} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Dr. Maximilian Schmidt"
                value={formData.clientName}
                onChange={(e) => onChange('clientName', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.step3_email} {formData.isGuest ? '(oder Telefon)' : '*'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required={!formData.isGuest || !formData.clientPhone}
                  placeholder="m.schmidt@unternehmen.de"
                  value={formData.clientEmail}
                  onChange={(e) => onChange('clientEmail', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.step3_phone} {formData.isGuest ? '(oder E-Mail)' : '*'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required={!formData.isGuest || !formData.clientEmail}
                  placeholder="+49 170 1234567"
                  value={formData.clientPhone}
                  onChange={(e) => onChange('clientPhone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Home Address & Company Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.step3_address} {currentUser ? '*' : (lang === 'ur' ? '(اختیاری)' : lang === 'en' ? '(Optional)' : '(Optional)')}
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Goethestraße 12, 60313 Frankfurt"
                  value={formData.homeAddress || ''}
                  onChange={(e) => onChange('homeAddress', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.step3_company} ({lang === 'ur' ? 'اختیاری' : 'Optional'})
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Schmidt Holding GmbH"
                  value={formData.company}
                  onChange={(e) => onChange('company', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Task or Reason for Appointment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.step3_task_reason} *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="z.B. Steuerliche Erstberatung, Einspruchsverfahren, Bilanzerstellung..."
                value={formData.taskReason || ''}
                onChange={(e) => onChange('taskReason', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.step3_notes}
            </label>
            <textarea
              rows={2}
              placeholder="Gibt es relevante Fristen oder Dokumente, die besprochen werden sollen?"
              value={formData.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>

          {/* Terms & GDPR Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={(e) => onChange('acceptTerms', e.target.checked)}
                className="mt-0.5 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                {t.step3_gdpr_agree}
              </span>
            </label>
          </div>
        </div>

        {/* Booking Summary Box (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <BadgeCheck className="w-4 h-4" />
              <span>{lang === 'ur' ? 'آپ کی بکنگ کا خلاصہ' : lang === 'en' ? 'Summary of Your Booking' : 'Zusammenfassung Ihrer Buchung'}</span>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">{t.details_service}:</span>
                <strong className="text-sm font-bold text-white block mt-0.5 font-serif">
                  {selectedService?.title || formData.serviceTitle}
                </strong>
                <span className="text-[11px] text-slate-400">
                  {selectedService?.durationLabel || (lang === 'ur' ? '60 منٹ' : lang === 'en' ? '60 minutes' : '60 Minuten')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">{t.details_date}:</span>
                  <strong className="text-xs font-bold text-white block mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formData.date}
                  </strong>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">{t.details_time}:</span>
                  <strong className="text-xs font-bold text-white block mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formData.startTime} – {formData.endTime}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 block">{t.modal_advisor_label}:</span>
                <strong className="text-xs font-bold text-white block mt-0.5">
                  Abdul Sattar (PhD, LL.M.) • {lang === 'ur' ? 'فرم کے مالک' : lang === 'en' ? 'Firm Principal' : 'Kanzleiinhaber'}
                </strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'ایس ایس ایل اور پیشہ ورانہ راز داری' : lang === 'en' ? 'SSL & Professional Secrecy Protected' : 'SSL & Berufsgeheimnis geschützt'}</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                {t.landing_professional_secrecy}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-300 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.step3_prev_btn}</span>
            </button>

            <button
              type="submit"
              disabled={loading || !formData.clientName || (!formData.clientEmail && !formData.clientPhone)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.modal_btn_booking}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.step3_submit_btn}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
