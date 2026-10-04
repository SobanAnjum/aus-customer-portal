import React, { useState, useEffect } from 'react';
import StepServiceSelect from './StepServiceSelect.tsx';
import StepDateTimeSelect from './StepDateTimeSelect.tsx';
import StepClientInfo from './StepClientInfo.tsx';
import StepConfirmation from './StepConfirmation.tsx';
import CustomerAuthModal from './CustomerAuthModal.tsx';
import { corporateServices } from '../data/servicesData.ts';
import { Advisor, BookingFormData, BookingConfirmation, ServiceItem, UserProfile } from '../../types.ts';
import { getApiUrl } from '../../lib/api.ts';
import { supabase, getUserProfile, firestore, isLiveFirebaseConfigured } from '../../lib/firebase.ts';
import { doc, setDoc } from 'firebase/firestore';
import { Language, translations } from '../../lib/translations.ts';
import { Check, ArrowLeft } from 'lucide-react';

interface BookingFlowProps {
  initialServiceId?: string;
  onGoHome: () => void;
  onAppointmentBooked?: () => void;
  lang?: Language;
  currentUser?: UserProfile | null;
}

export default function BookingFlow({
  initialServiceId,
  onGoHome,
  onAppointmentBooked,
  lang = 'de',
  currentUser: currentUserProp,
}: BookingFlowProps) {
  const t = translations[lang] || translations.de;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(currentUserProp || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form State initialized with user profile if available
  const [formData, setFormData] = useState<BookingFormData>(() => {
    const profile = currentUserProp || (() => {
      try {
        const stored = localStorage.getItem('aus_demo_profile');
        return stored ? JSON.parse(stored) : null;
      } catch (_) { return null; }
    })();

    return {
      serviceId: initialServiceId || 'steuerberatung',
      serviceTitle: 'Steuerberatung & Steuergestaltung',
      advisorId: null,
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      clientName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '',
      clientEmail: profile?.email || '',
      clientPhone: profile?.phone || '',
      homeAddress: profile?.homeAddress || '',
      company: profile?.companyName || '',
      taskReason: 'Steuerliche Erstberatung',
      notes: '',
      acceptTerms: true,
      isGuest: !profile,
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const handleProfileLoaded = (profile: UserProfile) => {
    setCurrentUser(profile);
    setFormData((prev) => ({
      ...prev,
      clientName: `${profile.firstName} ${profile.lastName}`.trim(),
      clientEmail: profile.email || '',
      clientPhone: profile.phone || '',
      homeAddress: profile.homeAddress || '',
      company: profile.companyName || '',
      isGuest: false,
    }));
  };

  // Sync with currentUser prop or local session
  useEffect(() => {
    if (currentUserProp) {
      handleProfileLoaded(currentUserProp);
      return;
    }

    try {
      const stored = localStorage.getItem('aus_demo_profile');
      if (stored) {
        const p = JSON.parse(stored);
        if (p && p.email) {
          handleProfileLoaded(p);
          return;
        }
      }
    } catch (_) {}

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getUserProfile(session.user.id).then((profile) => {
          if (profile) {
            handleProfileLoaded(profile);
          }
        });
      }
    });
  }, [currentUserProp]);

  // If initialServiceId is provided, pre-select it
  useEffect(() => {
    if (initialServiceId) {
      const found = corporateServices.find((s) => s.id === initialServiceId);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          serviceId: found.id,
          serviceTitle: found.title,
        }));
      }
    }
  }, [initialServiceId]);

  // Fetch advisors list
  useEffect(() => {
    fetch(getApiUrl('/api/public/advisors'))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAdvisors(data);
        }
      })
      .catch((err) => console.error('Failed to load advisors:', err));
  }, []);

  const handleFieldChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectService = (service: ServiceItem) => {
    setFormData((prev) => ({
      ...prev,
      serviceId: service.id,
      serviceTitle: service.title,
    }));
  };

  const handleSelectDateTime = (date: string, startTime: string, endTime: string) => {
    setFormData((prev) => ({ ...prev, date, startTime, endTime }));
  };

  const handleSelectAdvisor = (advisorId: number | null) => {
    setFormData((prev) => ({ ...prev, advisorId }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        userId: currentUser?.id || null,
        isGuest: !currentUser,
      };

      const res = await fetch(getApiUrl('/api/public/book'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Buchung fehlgeschlagen.');
      }

      setConfirmation({
        appointment: data.appointment,
        bookingRef: data.bookingRef,
        message: data.message || 'Termin gebucht',
      });

      if (isLiveFirebaseConfigured && firestore && data.appointment) {
        try {
          setDoc(doc(firestore, 'appointments', String(data.appointment.id)), data.appointment, { merge: true }).catch(() => {});
        } catch (_) {}
      }

      setCurrentStep(4);
      if (onAppointmentBooked) {
        onAppointmentBooked();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Buchung konnte nicht abgeschlossen werden.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: t.step1_title },
    { number: 2, label: t.step2_title },
    { number: 3, label: t.step3_title },
    { number: 4, label: t.step4_title },
  ];

  const selectedService = corporateServices.find((s) => s.id === formData.serviceId);
  const selectedAdvisor = advisors.find((a) => a.id === formData.advisorId);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Top return breadcrumb */}
        {currentStep < 4 && (
          <button
            onClick={onGoHome}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.step4_home_btn}</span>
          </button>
        )}

        {/* Progress Step Bar */}
        <div className="mb-10">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between relative">
              {steps.map((step, idx) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-slate-900 text-white ring-4 ring-slate-200 shadow-md'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.number}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-bold mt-2 uppercase tracking-wide transition-colors ${
                          isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                          currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Container */}
        <div>
          {currentStep === 1 && (
            <StepServiceSelect
              selectedServiceId={formData.serviceId}
              onSelectService={handleSelectService}
              onNext={() => setCurrentStep(2)}
              lang={lang}
            />
          )}

          {currentStep === 2 && (
            <StepDateTimeSelect
              selectedDate={formData.date}
              selectedStartTime={formData.startTime}
              selectedEndTime={formData.endTime}
              selectedAdvisorId={formData.advisorId}
              advisors={advisors}
              onSelectDateTime={handleSelectDateTime}
              onSelectAdvisor={handleSelectAdvisor}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              lang={lang}
            />
          )}

          {currentStep === 3 && (
            <StepClientInfo
              formData={formData}
              selectedService={selectedService}
              selectedAdvisor={selectedAdvisor}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onChange={handleFieldChange}
              onSubmit={handleSubmitBooking}
              onBack={() => setCurrentStep(2)}
              loading={loading}
              error={error}
              lang={lang}
            />
          )}

          {currentStep === 4 && confirmation && (
            <StepConfirmation
              confirmation={confirmation}
              onBookAnother={() => {
                setConfirmation(null);
                setCurrentStep(1);
              }}
              onGoHome={onGoHome}
              lang={lang}
            />
          )}
        </div>
      </div>

      {/* Customer Auth Modal (Email OTP) */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleProfileLoaded}
        lang={lang}
      />
    </div>
  );
}
