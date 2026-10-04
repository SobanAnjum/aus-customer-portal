
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Home, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  LogOut, 
  Sparkles,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { UserProfile } from '../../../types.ts';
import { Language, translations } from '../../../lib/translations.ts';

interface CustomerProfileTabProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => void;
  lang?: Language;
}

export default function CustomerProfileTab({
  currentUser,
  onUpdateProfile,
  onSignOut,
  lang = 'de',
}: CustomerProfileTabProps) {
  const t = translations[lang] || translations.de;
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [company, setCompany] = useState(currentUser.companyName || '');
  const [address, setAddress] = useState(currentUser.homeAddress || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await onUpdateProfile({
        phone: phone.trim(),
        companyName: company.trim() || undefined,
        homeAddress: address.trim(),
      });
      setSuccessMsg(t.dash_profile_saved);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Fehler beim Speichern der Stammdaten.');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${(currentUser.firstName || '')[0] || 'M'}${(currentUser.lastName || '')[0] || 'P'}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              {initials}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-serif-title">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{currentUser.companyName || 'Privatmandant'}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">A u.S-{currentUser.id.slice(0, 6).toUpperCase()}</span>
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t.dash_status_online}
          </span>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-bold shadow-2xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-bold shadow-2xs animate-in fade-in duration-200">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Editable Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-serif-title">
              {t.dash_profile_title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.dash_profile_subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t.dash_profile_firstname}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.firstName}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t.dash_profile_lastname}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.lastName}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                {t.dash_profile_email}
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t.dash_profile_phone}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 170 1234567"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t.dash_profile_company_name}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="z.B. Mustermann GmbH & Co. KG"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Wohnanschrift / Firmensitz
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Straße, Hausnummer, PLZ, Ort"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {saving ? t.dash_profile_saving : t.dash_profile_save}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Security & Mandanten-Information (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 font-serif">{t.dash_profile_security_box}</h4>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">SSL 256-bit Verschlüsselung</p>
                  <p className="text-[11px] text-slate-500">{t.dash_profile_sec_p2}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t.dash_profile_sec_p3}</p>
                  <p className="text-[11px] text-slate-500">{t.dash_analytics_compliance_desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Berufsgeheimnis</p>
                  <p className="text-[11px] text-slate-500">{t.dash_profile_sec_p1}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={onSignOut}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.dash_nav_logout}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
