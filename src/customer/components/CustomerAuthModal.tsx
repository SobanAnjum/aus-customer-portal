import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Home, 
  Building, 
  ArrowRight, 
  AlertCircle,
  Shield,
  LogIn,
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  checkUserExistsByEmail, 
  signInWithEmailPassword, 
  signUpWithEmailPassword 
} from '../../lib/supabase.ts';
import { UserProfile } from '../../types.ts';
import { Language, translations } from '../../lib/translations.ts';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  lang?: Language;
  initialMode?: 'login' | 'register';
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  onSuccess,
  lang = 'de',
  initialMode = 'login',
}: CustomerAuthModalProps) {
  const t = translations[lang] || translations.de;

  // Active Auth Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Smart Existence State
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Real-time check if email exists when typing in Register mode
  const handleEmailBlurOrChange = async (val: string) => {
    setEmail(val);
    if (mode === 'register' && val.includes('@') && val.includes('.')) {
      const exists = await checkUserExistsByEmail(val);
      setEmailAlreadyExists(exists);
    } else {
      setEmailAlreadyExists(false);
    }
  };

  // Switch to Login tab with highlighted email pre-filled
  const handleSwitchToLoginWithEmail = () => {
    setMode('login');
    setError(null);
    setEmailAlreadyExists(false);
  };

  // Submit Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Bitte geben Sie E-Mail und Passwort ein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { profile, error: loginErr } = await signInWithEmailPassword(email.trim(), password);
      if (loginErr) throw loginErr;

      if (profile) {
        try {
          localStorage.setItem('aus_demo_profile', JSON.stringify(profile));
        } catch (_) {}
        onSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Account Registration (OTP removed)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !homeAddress.trim() || !password) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check email existence before registering
      const exists = await checkUserExistsByEmail(email.trim());
      if (exists) {
        setEmailAlreadyExists(true);
        setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.');
        setLoading(false);
        return;
      }

      const { profile, error: regErr } = await signUpWithEmailPassword({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        homeAddress: homeAddress.trim(),
        companyName: companyName.trim() || undefined,
        password,
      });

      if (regErr) throw regErr;

      if (profile) {
        try {
          localStorage.setItem('aus_demo_profile', JSON.stringify(profile));
        } catch (_) {}
        onSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className={`absolute top-5 ${lang === 'ur' ? 'left-5' : 'right-5'} p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer`}
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>{t.auth_modal_badge}</span>
          </div>
          <h2 className="text-xl font-bold font-serif-title">
            {mode === 'login' ? t.auth_welcome_title : t.auth_modal_register_tab}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' ? t.auth_login_subtitle : t.auth_register_subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              mode === 'login'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{t.auth_modal_login_tab}</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              mode === 'register'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.auth_modal_register_tab}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Global Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* ================= MODE: LOGIN ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  {t.auth_email_label}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute ${lang === 'ur' ? 'right-3.5' : 'left-3.5'} top-3`} />
                  <input
                    type="email"
                    required
                    placeholder="name@unternehmen.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${lang === 'ur' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  {t.auth_password_label}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute ${lang === 'ur' ? 'right-3.5' : 'left-3.5'} top-3`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${lang === 'ur' ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${lang === 'ur' ? 'left-3' : 'right-3'} top-3 text-slate-400 hover:text-slate-700 cursor-pointer`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>{t.auth_login_btn}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${lang === 'ur' ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer block w-full"
                >
                  {t.auth_no_account} <span className="text-blue-600 font-bold underline">{t.auth_register_now}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE: REGISTER (DIRECT 1-STEP) ================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Smart Email Existence Banner */}
              {emailAlreadyExists && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in duration-200 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">{t.auth_email_exists_title}</strong>
                      <span>{t.auth_email_exists_desc}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchToLoginWithEmail}
                    className="px-3.5 py-1.5 bg-amber-900 hover:bg-amber-800 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    {t.auth_login_now}
                  </button>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    {t.auth_firstname_label}
                  </label>
                  <div className="relative">
                    <User className={`w-3.5 h-3.5 text-slate-400 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="text"
                      required
                      placeholder="Max"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full ${lang === 'ur' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    {t.auth_lastname_label}
                  </label>
                  <div className="relative">
                    <User className={`w-3.5 h-3.5 text-slate-400 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="text"
                      required
                      placeholder="Mustermann"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full ${lang === 'ur' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    {t.auth_email_label}
                  </label>
                  <div className="relative">
                    <Mail className={`w-3.5 h-3.5 text-slate-400 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="email"
                      required
                      placeholder="m.mustermann@firma.de"
                      value={email}
                      onChange={(e) => handleEmailBlurOrChange(e.target.value)}
                      className={`w-full ${lang === 'ur' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    {t.auth_phone_label}
                  </label>
                  <div className="relative">
                    <Phone className={`w-3.5 h-3.5 text-slate-400 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="tel"
                      required
                      placeholder="+49 170 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full ${lang === 'ur' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                    />
                  </div>
                </div>
              </div>

              {/* Address & Company */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                  {t.auth_address_label}
                </label>
                <div className="relative">
                  <Home className={`w-3.5 h-3.5 text-slate-400 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5`} />
                  <input
                    type="text"
                    required
                    placeholder="Musterstraße 12, 80331 München"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    className={`w-full ${lang === 'ur' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                  {t.auth_company_label}
                </label>
                <div className="relative">
                  <Building className={`w-3.5 h-3.5 text-slate-400 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5`} />
                  <input
                    type="text"
                    placeholder="Mustermann GmbH & Co. KG"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`w-full ${lang === 'ur' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                  {t.auth_password_label}
                </label>
                <div className="relative">
                  <Lock className={`w-3.5 h-3.5 text-slate-400 absolute ${lang === 'ur' ? 'right-3' : 'left-3'} top-2.5`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${lang === 'ur' ? 'pr-9 pl-10' : 'pl-9 pr-10'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${lang === 'ur' ? 'left-3' : 'right-3'} top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer`}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || emailAlreadyExists}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t.auth_register_now}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${lang === 'ur' ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  {t.auth_modal_login_tab}? <span className="text-blue-600 font-bold underline">{t.auth_login_now}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
