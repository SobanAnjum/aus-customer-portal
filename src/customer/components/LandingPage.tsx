import { 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Star, 
  Lock, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown,
  GraduationCap,
  Scale,
  BookOpen,
  FileCheck2,
  BadgeCheck
} from 'lucide-react';
import ServicesSection from './ServicesSection.tsx';
import { initialAdvisors } from '../data/advisorsData.ts';
import { Language, translations } from '../../lib/translations.ts';

interface LandingPageProps {
  onStartBooking: (serviceId?: string) => void;
  onNavigateFounder?: () => void;
  lang: Language;
}

export default function LandingPage({ onStartBooking, onNavigateFounder, lang }: LandingPageProps) {
  const t = translations[lang] || translations.de;
  const founder = initialAdvisors[0];

  const trustMetrics = [
    { value: t.hero_stat1_val, label: t.hero_stat1_label, sub: t.hero_stat1_sub },
    { value: t.hero_stat2_val, label: t.hero_stat2_label, sub: t.hero_stat2_sub },
    { value: t.hero_stat3_val, label: t.hero_stat3_label, sub: t.hero_stat3_sub },
    { value: t.hero_stat4_val, label: t.hero_stat4_label, sub: t.hero_stat4_sub },
  ];

  const valuePillars = [
    {
      title: lang === 'ur' ? 'ذاتی وژن اور لیڈرشپ' : lang === 'en' ? 'Personal Founder Leadership' : 'Persönliche Kanzleiführung',
      desc: lang === 'ur' ? 'براہ راست بانی عبدالستار سے مشاورت۔ کوئی درمیانی کلرک نہیں، صرف اعلیٰ ترین سطح کی حکمت عملی۔' : lang === 'en' ? 'Direct consultation with founder Abdul Sattar. No intermediary clerks, only executive-level mastery.' : 'Direkte und exklusive Betreuung durch Kanzleiinhaber Abdul Sattar. Höchste Diskretion und maßgeschneiderte strategische Beratung.',
      icon: Users,
    },
    {
      title: lang === 'ur' ? 'قانونی و اسٹریٹجک مہارت (LL.M.)' : lang === 'en' ? 'Interdisciplinary Legal Expertise' : 'Juristische & wissenschaftliche Tiefe',
      desc: lang === 'ur' ? 'انفارمیشن اینڈ میڈیا لا (LL.M.) اور پولیٹیکل سائنس کی بدولت کثیر الجہتی جامع حل۔' : lang === 'en' ? 'Master of Laws in Information & Media Law and PhD in Political Science ensuring profound strategic insight.' : 'Master of Laws (LL.M.) in Informations- und Medienrecht sowie PhD in Politikwissenschaft garantieren fundierte Urteilskraft.',
      icon: Scale,
    },
    {
      title: t.pillar3_title,
      desc: t.pillar3_desc,
      icon: ShieldCheck,
    },
    {
      title: t.pillar4_title,
      desc: t.pillar4_desc,
      icon: Clock,
    },
  ];

  const testimonials = [
    {
      quote: lang === 'ur'
        ? 'اے.یو.ایس کے بانی عبدالستار نے ہمارے سالانہ گوشواروں اور ہولڈنگ کی ازسرنو تنظیم میں غیر معمولی مہارت کا ثبوت دیا۔'
        : lang === 'en'
        ? 'Abdul Sattar guided our entire corporate restructuring and strategic financial planning with extraordinary rigor.'
        : 'Abdul Sattar hat unsere gesamte gesellschaftsrechtliche Strukturierung und Wirtschaftsberatung mit beispielloser Präzision begleitet.',
      author: 'Dipl.-Ing. Heinrich Müller',
      role: lang === 'ur' ? 'منیجنگ ڈائریکٹر، ملر مشینری' : lang === 'en' ? 'Managing Partner, Müller Engineering GmbH' : 'Geschäftsführender Gesellschafter, Müller Maschinenbau GmbH & Co. KG',
      rating: 5,
    },
    {
      quote: lang === 'ur'
        ? 'عبدالستار کی جانب سے تجزیاتی اور قانونی مشاورت ہماری کمپنی کی ترقی میں کلیدی عنصر ثابت ہوئی۔'
        : lang === 'en'
        ? 'The analytical due diligence and media law counsel by Abdul Sattar was the decisive success factor in our expansion.'
        : 'Die fundierte medienrechtliche und strategische Beratung durch Abdul Sattar war der entscheidende Erfolgsfaktor bei unserer Expansion.',
      author: 'Dr. med. Thomas Weber',
      role: lang === 'ur' ? 'چیئرمین، ویبر میڈیکل ٹیک' : lang === 'en' ? 'CEO, Weber Medizintechnik AG' : 'Vorstandsvorsitzender, Weber Medizintechnik AG',
      rating: 5,
    },
    {
      quote: lang === 'ur'
        ? 'ڈیجیٹل DATEV کنکشن کی بدولت ہم ہر ماہ بک کیپنگ میں 20 گھنٹے سے زیادہ کا قیمتی وقت بچاتے ہیں۔'
        : lang === 'en'
        ? 'Thanks to the digital DATEV integration, our corporate financial reporting is seamless, reliable, and compliant.'
        : 'Durch die strukturierte DATEV-Prozessberatung und verlässliche Betreuung haben wir maximale Transparenz in unseren Finanzflüssen gewonnen.',
      author: 'Claudia Schmidt',
      role: 'CFO, Schmidt & Partner Logistik OHG',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: lang === 'ur'
        ? 'پہلی مشاورتی ملاقات کیسے ہوتی ہے؟'
        : lang === 'en'
        ? 'How does the consultation with Dr. Abdul Sattar work?'
        : 'Wie läuft das Beratungsgespräch mit Dr. Abdul Sattar ab?',
      a: lang === 'ur'
        ? 'ابتدائی مشاورت (45 تا 60 منٹ) میں ہم آپ کی موجودہ بک کیپنگ اور تنظیمی ضروریات کا تجزیہ کرتے ہیں اور ایک باقاعدہ حل پیش کرتے ہیں۔'
        : lang === 'en'
        ? 'In the consultation (approx. 45-60 min), Dr. Abdul Sattar analyzes your current bookkeeping and organizational needs to structure a tailored plan.'
        : 'Im persönlichen Gespräch (ca. 45-60 Minuten) analysiert Dr. Abdul Sattar Ihre Ausgangssituation und definiert einen maßgeschneiderten kaufmännischen und organisatorischen Betreuungsplan.',
    },
    {
      q: lang === 'ur'
        ? 'کیا ملاقات دفتر میں ہوتی ہے یا ویڈیو کانفرنس پر؟'
        : lang === 'en'
        ? 'Do meetings take place in person or digitally via video?'
        : 'Finden Termine vor Ort oder digital per Video statt?',
      a: lang === 'ur'
        ? 'آپ کی مرضی ہے: آپ لائپزگ میں ہمارے دفتر (Lagerhofstraße 2, 04103 Leipzig) آ سکتے ہیں یا مائیکروسافٹ ٹیمز پر آن لائن ویڈیو میٹنگ کر سکتے ہیں۔'
        : lang === 'en'
        ? 'You have complete choice: We welcome you in person at our offices in Leipzig (Lagerhofstraße 2, 04103 Leipzig) or conduct encrypted video conferences via Microsoft Teams.'
        : 'Sie haben die freie Wahl: Wir empfangen Sie gern persönlich in unseren Geschäftsräumen in Leipzig (Lagerhofstraße 2, 04103 Leipzig) oder führen verschlüsselte Video-Konferenzen über Microsoft Teams durch.',
    },
    {
      q: lang === 'ur'
        ? 'کیا میں اپنے پرانے ریکارڈ اور دستاویزات لا سکتا ہوں؟'
        : lang === 'en'
        ? 'Can I import existing bookkeeping and document records?'
        : 'Kann ich bestehende Buchhaltungsdaten und Belege mitbringen?',
      a: lang === 'ur'
        ? 'جی بالکل، ہم آپ کی تمام رسیدیں اور کاروباری دستاویزات منظم کر کے آپ کے ٹیکس مشیر کے لیے بروقت تیاری کرتے ہیں۔'
        : lang === 'en'
        ? 'Yes, absolutely. We seamlessly take over and organize your ongoing records and commercial data for optimal coordination with your appointed tax advisor.'
        : 'Ja, absolut. Wir erfassen und ordnen Ihre laufenden Belege und kaufmännischen Daten lückenlos und bereiten diese strukturiert für Ihren Steuerberater vor.',
    },
  ];

  return (
    <div className="bg-white text-slate-900 overflow-hidden">
      {/* HERO SECTION — Clean, Crisp Corporate White Canvas */}
      <section className="relative bg-white py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Authoritative Editorial Presentation */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>{t.hero_badge}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 font-serif-title leading-[1.15]">
                {t.hero_heading_pre}{' '}
                <span className="italic text-slate-800">
                  {t.hero_heading_highlight}
                </span>{' '}
                {t.hero_heading_post}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.hero_subheading}
              </p>

              {/* Consultation CTAs */}
              <div className="pt-4 flex flex-wrap justify-center lg:justify-start items-center gap-3.5">
                <button
                  onClick={() => onStartBooking()}
                  className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.hero_book_btn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onNavigateFounder && (
                  <button
                    onClick={onNavigateFounder}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 active:scale-98 text-slate-800 font-bold rounded-xl border border-slate-300 shadow-2xs transition-all text-xs sm:text-sm cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-slate-700" />
                    <span>{lang === 'ur' ? 'بانی کا تعلیمی سفر' : lang === 'en' ? 'Founder Profile & Journey' : 'Über den Gründer (Abdul Sattar)'}</span>
                  </button>
                )}
              </div>

              {/* Quick Contact Line */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.landing_free_initial_check}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.landing_professional_secrecy}</span>
                </span>
              </div>
            </div>

            {/* Right Column: Founder Executive Profile Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-md w-full space-y-5">
                <div className="relative mx-auto w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-xs">
                  <img
                    src="/assets/abdul_sattar.png"
                    alt="Abdul Sattar"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/abdul_sattar.png';
                    }}
                  />
                </div>

                <div className="text-center space-y-1.5">
                  <span className="inline-block px-3 py-0.5 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {t.landing_founder_badge}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">
                    Dr. Abdul Sattar
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Inhaber • Buchhaltung & Büroservice<br />
                    Lagerhofstraße 2, 04103 Leipzig
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 text-center">
                  <button
                    onClick={() => onStartBooking()}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
                  >
                    {t.landing_request_appointment} {lang === 'ur' ? '←' : '→'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Metric Row — High-Contrast Minimalist Cards */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto pt-10 border-t border-slate-200">
            {trustMetrics.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight font-serif">
                  {item.value}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMINENT STATUTORY LEGAL DISCLAIMER — KEINE STEUERBERATUNG */}
      <section className="bg-amber-50/80 border-y border-amber-200 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
            <Scale className="w-7 h-7 text-amber-800" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300">
                {t.legal_notice_badge}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 font-serif">
                {t.legal_notice_title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
              {t.legal_notice_text}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.legal_notice_subtext}
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <ServicesSection onStartBooking={onStartBooking} lang={lang} />

      {/* WHY US / PILLARS SECTION — Clean Off-White */}
      <section id="vorteile" className="py-16 sm:py-24 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest bg-white px-3.5 py-1 rounded-full border border-slate-200">
              {t.why_us_badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mt-3 tracking-tight font-serif-title">
              {t.why_us_title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              {t.why_us_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {valuePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={i} 
                  className="bg-white p-7 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex gap-5 items-start"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — Corporate Card Style */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest bg-slate-50 px-3.5 py-1 rounded-full border border-slate-200">
              {t.testimonials_badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mt-3 tracking-tight font-serif-title">
              {t.testimonials_title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              {t.testimonials_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tItem, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex gap-1 text-slate-700 mb-3">
                    {[...Array(tItem.rating)].map((_, starIndex) => (
                      <Star key={starIndex} className="w-4 h-4 fill-slate-700 text-slate-700" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-serif">
                    "{tItem.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-900">{tItem.author}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{tItem.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest bg-white px-3.5 py-1 rounded-full border border-slate-200">
              {t.faq_badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mt-3 tracking-tight font-serif-title">
              {t.faq_title}
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-slate-200 p-5 cursor-pointer shadow-2xs">
                <summary className="font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center select-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CONSULTATION CTA BANNER — Clean Off-White with Dark Navy Button */}
      <section id="kontakt" className="py-16 sm:py-20 px-4 sm:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif-title text-slate-950">
            {t.landing_cta_heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t.landing_cta_desc}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3.5">
            <button
              onClick={() => onStartBooking()}
              className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.hero_book_btn}</span>
            </button>
            <a
              href="mailto:kontakt@aus-wirtschaftsberatung.de"
              className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 shadow-2xs text-xs sm:text-sm"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>kontakt@aus-wirtschaftsberatung.de</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
