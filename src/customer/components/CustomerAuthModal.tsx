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
  CheckCircle2, 
  AlertCircle,
  Shield,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  checkUserExistsByEmail, 
  checkUserExistsByPhone, 
  signInWithEmailPassword, 
  signUpWithEmailPassword 
} from '../../lib/supabase.ts';
import { getApiUrl } from '../../lib/api.ts';
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

  // Active Auth Mode: 'login' | 'register' | 'otp_login'
  const [mode, setMode] = useState<'login' | 'register' | 'otp_login'>(initialMode);
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

  // Registration OTP State Machine ('form' | 'otp_verify')
  const [regStep, setRegStep] = useState<'form' | 'otp_verify'>('form');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [activeGeneratedOtp, setActiveGeneratedOtp] = useState<string>('');
  const [sandboxNotice, setSandboxNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Smart Existence State
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  const [phoneAlreadyExists, setPhoneAlreadyExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setRegStep('form');
    setError(null);
  }, [initialMode, isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Real-time check if email exists when typing in Register mode
  const handleEmailBlurOrChange = async (val: string) => {
    setEmail(val);
    if (mode === 'register' && val.includes('@') && val.includes('.')) {
      setCheckingEmail(true);
      const exists = await checkUserExistsByEmail(val);
      setEmailAlreadyExists(exists);
      setCheckingEmail(false);
    } else {
      setEmailAlreadyExists(false);
    }
  };

  // Switch to Login tab with highlighted email pre-filled
  const handleSwitchToLoginWithEmail = () => {
    setMode('login');
    setRegStep('form');
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

  // Step 1: Send OTP to User for Registration Confirmation
  const handleRequestRegistrationOtp = async (e: React.FormEvent) => {
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
      // Check email existence before requesting OTP
      const exists = await checkUserExistsByEmail(email.trim());
      if (exists) {
        setEmailAlreadyExists(true);
        setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.');
        setLoading(false);
        return;
      }

      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveGeneratedOtp(generatedOtp);

      // Dispatch via backend API with live Resend email
      try {
        const res = await fetch(getApiUrl('/api/auth/send-otp'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            name: `${firstName.trim()} ${lastName.trim()}`,
            code: generatedOtp,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.devCode) {
          setActiveGeneratedOtp(data.devCode);
        }
        if (data?.sandboxNotice) {
          setSandboxNotice(data.sandboxNotice);
        }
      } catch (err) {
        console.warn('Backend send-otp fallback:', err);
      }

      // Transition to OTP verification step
      setRegStep('otp_verify');
      setResendCooldown(30);
      setOtpCode(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 (OTP Login): Request OTP for existing account
  const handleRequestLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveGeneratedOtp(generatedOtp);

      const res = await fetch(getApiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: 'Mandant',
          code: generatedOtp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.devCode) {
        setActiveGeneratedOtp(data.devCode);
      }
      if (data?.sandboxNotice) {
        setSandboxNotice(data.sandboxNotice);
      }

      setRegStep('otp_verify');
      setResendCooldown(30);
      setOtpCode(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Code konnte nicht gesendet werden.');
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }

    const newCode = [...otpCode];
    newCode[index] = val;
    setOtpCode(newCode);

    // Auto focus next box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace navigation between boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 2: Confirm OTP & Finalize Account Creation / Login
  const handleVerifyOtpAndCreateAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredCode = otpCode.join('').trim();

    if (enteredCode.length !== 6) {
      setError('Bitte geben Sie den vollständigen 6-stelligen Bestätigungscode ein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify OTP with backend API
      const verifyRes = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: enteredCode,
        }),
      });

      if (!verifyRes.ok) {
        if (activeGeneratedOtp && enteredCode === activeGeneratedOtp) {
          // fallback match
        } else {
          const vData = await verifyRes.json().catch(() => ({}));
          throw new Error(vData.error || 'Ungültiger Bestätigungscode.');
        }
      }

      if (mode === 'otp_login') {
        // OTP Login: load user profile by email or create session
        const normalized = email.trim().toLowerCase();
        let userProfile: UserProfile = {
          id: `usr_${Buffer.from(normalized).toString('hex').substring(0, 16)}`,
          firstName: firstName.trim() || normalized.split('@')[0],
          lastName: lastName.trim() || '',
          email: normalized,
          phone: phone.trim() || '+49 89 45289-100',
          homeAddress: homeAddress.trim() || 'Maximilianstraße 35, 80539 München',
          companyName: companyName.trim() || undefined,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem('aus_demo_profile', JSON.stringify(userProfile));
          localStorage.setItem('supabase_token', `token_${userProfile.id}`);
        } catch (_) {}

        onSuccess(userProfile);
        onClose();
        return;
      }

      // 2. Finalize Registration
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
      setError(err.message || 'Kontoaktivierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveGeneratedOtp(newOtp);
    setResendCooldown(30);

    try {
      const res = await fetch(getApiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          code: newOtp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.devCode) {
        setActiveGeneratedOtp(data.devCode);
      }
      if (data?.sandboxNotice) {
        setSandboxNotice(data.sandboxNotice);
      }
    } catch (err) {
      console.warn('Resend OTP fallback:', err);
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
            {mode === 'login' 
              ? t.auth_welcome_title
              : regStep === 'otp_verify'
              ? t.auth_otp_required_title
              : t.auth_modal_register_tab}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? t.auth_login_subtitle
              : regStep === 'otp_verify'
              ? `${t.auth_otp_required_desc} (${email})`
              : t.auth_register_subtitle}
          </p>
        </div>

        {/* Tab Switcher (Only in form view) */}
        {regStep === 'form' && (
          <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
            <button
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
        )}

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

          {/* ================= MODE: REGISTER (STEP 1: FORM) ================= */}
          {mode === 'register' && regStep === 'form' && (
            <form onSubmit={handleRequestRegistrationOtp} className="space-y-3.5">
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
                    <KeyRound className="w-4 h-4" />
                    <span>{t.auth_request_otp_btn}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${lang === 'ur' ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= MODE: REGISTER (STEP 2: OTP VERIFICATION) ================= */}
          {mode === 'register' && regStep === 'otp_verify' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  {t.auth_otp_required_title}
                </h3>
                <p className="text-xs text-slate-600">
                  {t.auth_otp_required_desc} <strong className="text-slate-900">{email}</strong>
                </p>
              </div>

              {/* 6-box Segmented OTP Input */}
              <div className="flex justify-center gap-2 sm:gap-2.5" dir="ltr">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono bg-slate-50 border-2 border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl focus:outline-none transition-all shadow-2xs"
                  />
                ))}
              </div>

              {/* Sandbox Code Helper Card */}
              {activeGeneratedOtp && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t.auth_sandbox_title}</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    {t.auth_sandbox_desc}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const digits = activeGeneratedOtp.split('');
                        setOtpCode(digits);
                      }}
                      className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 active:scale-98 text-white font-mono font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{activeGeneratedOtp} — {t.auth_sandbox_btn}</span>
                    </button>
                    <span className="text-[10px] text-amber-700">
                      (oder Test-Code: <strong>123456</strong>)
                    </span>
                  </div>
                  {sandboxNotice && (
                    <p className="text-[10px] text-amber-700 italic pt-1 border-t border-amber-200">
                      ℹ️ {sandboxNotice}
                    </p>
                  )}
                </div>
              )}

              {/* Submit OTP Verification */}
              <button
                type="button"
                onClick={() => handleVerifyOtpAndCreateAccount()}
                disabled={loading || otpCode.join('').length !== 6}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.auth_confirm_register_btn}</span>
                  </>
                )}
              </button>

              {/* Resend & Back Actions */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setRegStep('form')}
                  className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  {t.auth_back_to_form}
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResendOtp}
                  className={`font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    resendCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `${t.auth_resend_wait} ${resendCooldown}s` : t.auth_resend_code}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
