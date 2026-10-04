import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Scale, 
  Globe2, 
  CheckCircle2, 
  FileText,
  User,
  ArrowLeft,
  Building2,
  BadgeCheck
} from 'lucide-react';
import { Language, translations } from '../../lib/translations.ts';

interface FounderAchievementsPageProps {
  onStartBooking: () => void;
  onGoHome: () => void;
  lang: Language;
}

export default function FounderAchievementsPage({
  onStartBooking,
  onGoHome,
  lang = 'de',
}: FounderAchievementsPageProps) {
  const t = translations[lang] || translations.de;

  const timelineEvents = [
    {
      year: '2026',
      dateLabel: lang === 'ur' ? '10 اگست 2026' : lang === 'en' ? 'August 10, 2026' : '10. August 2026',
      institution: lang === 'ur' ? 'لیپزگ یونیورسٹی، جرمنی' : lang === 'en' ? 'Leipzig University, Germany' : 'Universität Leipzig',
      degree: lang === 'ur' ? 'ڈاکٹریٹ (PhD) پولیٹیکل سائنس' : lang === 'en' ? 'Doctor of Philosophy (PhD) in Political Science' : 'Doktor der Politikwissenschaft (PhD)',
      highlight: lang === 'ur' 
        ? 'عوامی مقالہ دفاع (Public Dissertation Defense) کامیابی سے مکمل' 
        : lang === 'en' 
        ? 'Public Dissertation Defense Successfully Completed' 
        : 'Erfolgreiche öffentliche Dissertationsverteidigung am 10. August 2026',
      dissertationTitle: '“New Political Movements in Pakistan between Fundamentalism and Modernity: Jamaat-e-Islami as a New Emerging Phenomenon and New Cultural-Identitarian Political Movement (NCIPM).”',
      description: lang === 'ur'
        ? 'مقالہ جدیدیت اور بنیاد پرستی کے درمیان سیاسی تحریکوں، شناخت کے نئے بیانیوں اور سماجی و ثقافتی تبدیلیوں کا عمیق تجزیہ پیش کرتا ہے۔'
        : lang === 'en'
        ? 'Comprehensive academic inquiry examining the interplay between modernity, fundamentalism, and emerging cultural-identitarian political dynamics.'
        : 'Tiefgehende wissenschaftliche Analyse moderner politischer Strömungen, Identitätsbewegungen und der Schnittstelle zwischen Tradition, Recht und Moderne.',
      badge: lang === 'ur' ? 'ڈاکٹریٹ' : lang === 'en' ? 'Doctoral Degree' : 'Promotion (PhD)',
      icon: GraduationCap,
    },
    {
      year: '2022',
      dateLabel: '2022',
      institution: 'Selinus University of Science and Literature',
      degree: lang === 'ur' ? 'ڈاکٹر آف فلاسفی (PhD) پولیٹیکل سائنس' : lang === 'en' ? 'Doctor of Philosophy (PhD) in Political Science' : 'PhD in Political Science',
      highlight: lang === 'ur' ? 'اعلیٰ تعلیمی ڈاکٹریٹ کی ڈگری' : lang === 'en' ? 'Doctoral Award in Political Theory' : 'Verleihung des Doktortitels in Politikwissenschaft',
      description: lang === 'ur'
        ? 'سیاسی نظریات، تقابلی طرز حکمرانی اور بین الاقوامی اسٹریٹجک فریم ورک پر تحقیق۔'
        : lang === 'en'
        ? 'Advanced doctoral research in political theory, institutional structures, and global governance frameworks.'
        : 'Wissenschaftliche Vertiefung in politischer Theorie, institutioneller Governance und internationalen Ordnungsstrukturen.',
      badge: 'PhD',
      icon: Award,
    },
    {
      year: '2019 – 2021',
      dateLabel: lang === 'ur' ? 'ستمبر 2019 تا اکتوبر 2021' : lang === 'en' ? 'Sept 2019 – Oct 2021' : 'Sept. 2019 – Okt. 2021',
      institution: lang === 'ur' ? 'یونیورسٹی آف ویانا، آسٹریا' : lang === 'en' ? 'University of Vienna, Austria' : 'Universität Wien',
      degree: lang === 'ur' ? 'ماسٹر آف لا (LL.M.) انفارمیشن اینڈ میڈیا لا' : lang === 'en' ? 'Master of Laws (LL.M.) in Information and Media Law' : 'Master of Laws (LL.M.) in Informations- und Medienrecht',
      highlight: lang === 'ur' ? 'ڈیجیٹل قانونی ضوابط اور میڈیا قانون' : lang === 'en' ? 'Legal Frameworks & Digital Media Law' : 'Postgraduales Rechtsstudium (LL.M.)',
      description: lang === 'ur'
        ? 'ڈیجیٹل میڈیا قانون، کاپی رائٹ، ڈیٹا پروٹیکشن (GDPR)، اور کارپوریٹ انفارمیشن سسٹمز میں قانون کی بالادستی۔'
        : lang === 'en'
        ? 'Specialized legal training in information law, media regulation, digital compliance, IP, and data protection jurisprudence.'
        : 'Spezialisierte juristische Ausbildung im Bereich digitales Medienrecht, Datenschutz (DSGVO), IT-Recht und regulatorische Unternehmens-Compliance.',
      badge: 'LL.M.',
      icon: Scale,
    },
    {
      year: '2007',
      dateLabel: '2007',
      institution: lang === 'ur' ? 'لیپزگ یونیورسٹی، جرمنی' : lang === 'en' ? 'Leipzig University, Germany' : 'Universität Leipzig',
      degree: lang === 'ur' ? 'میگسٹر ڈگری ان فلسفہ و تقابلِ ادیان' : lang === 'en' ? 'Magister Degree in Philosophy and Religious Studies' : 'Magister Artium (M.A.) in Philosophie & Religionswissenschaft',
      highlight: lang === 'ur' ? 'فلسفیانہ تجزیہ، منطق اور اخلاقیات' : lang === 'en' ? 'Philosophical Rigor, Logic & Ethics' : 'Grundständiges Magisterstudium',
      description: lang === 'ur'
        ? 'منطق، اخلاقیات، تقابلِ ادیان اور تفکر کے بنیادی اصولوں پر مبنی کلاسیکی تعلیمی بنیاد۔'
        : lang === 'en'
        ? 'Rigorous academic grounding in epistemology, formal logic, ethics, and comparative religious systems.'
        : 'Fundierte akademische Ausbildung in Erkenntnistheorie, Logik, angewandter Wirtschaftsethik und vergleichender Religionswissenschaft.',
      badge: 'Magister Artium',
      icon: BookOpen,
    },
    {
      year: lang === 'ur' ? 'اعزازی تمغہ' : lang === 'en' ? 'Honorary Title' : 'Ehrendoktor',
      dateLabel: lang === 'ur' ? 'اعزازی ڈاکٹریٹ' : lang === 'en' ? 'Honorary Doctoral Title' : 'Ehrendoktortitel',
      institution: lang === 'ur' ? 'اکیڈمک اکیڈمی' : lang === 'en' ? 'Academic Honors' : 'Wissenschaftliche Ehrung',
      degree: lang === 'ur' ? 'اعزازی ڈاکٹریٹ (Honorary Doctorate)' : lang === 'en' ? 'Honorary Doctorate' : 'Ehrendoktorwürde',
      highlight: '“Prophet Muhammad "SAW" as a Perfect Role Model for Humanity”',
      description: lang === 'ur'
        ? 'سیرت النبی ﷺ بحیثیت انسانیت کے لیے کامل نمونہ حیات پر گرانقدر اور مستند تحقیقی کام کے اعتراف میں اعزازی ڈاکٹریٹ۔'
        : lang === 'en'
        ? 'Awarded an honorary doctoral title in recognition of his extensive research on Prophet Muhammad "SAW" as a universal paragon for humanity.'
        : 'Verleihung des Ehrendoktortitels für das wissenschaftliche Werk über universelle ethische Vorbildfunktion für die Menschheit.',
      badge: 'Honorary PhD',
      icon: ShieldCheck,
    },
  ];

  const interdisciplinaryDisciplines = [
    { 
      title: lang === 'ur' ? 'سیاسیات (Political Science)' : lang === 'en' ? 'Political Science' : 'Politikwissenschaft', 
      desc: lang === 'ur' ? 'حکومتی پالیسیاں اور تقابلی تجزیہ' : lang === 'en' ? 'Governance, policy analysis, and institutional dynamics' : 'Staatstheorie, Identitätsbewegungen & Politikanalyse' 
    },
    { 
      title: lang === 'ur' ? 'انفارمیشن اینڈ میڈیا لا (LL.M.)' : lang === 'en' ? 'Information & Media Law' : 'Informations- & Medienrecht', 
      desc: lang === 'ur' ? 'ڈیجیٹل قوانین، کمپلائنس اور ریگولیشنز' : lang === 'en' ? 'Digital compliance, media law, and GDPR frameworks' : 'Medienregulierung, Datenschutz (DSGVO), Urheberrecht & Compliance' 
    },
    { 
      title: lang === 'ur' ? 'فلسفہ و منطق (Philosophy)' : lang === 'en' ? 'Philosophy & Logic' : 'Philosophie & Ethik', 
      desc: lang === 'ur' ? 'تنقیدی سوچ، اخلاقیات اور تجزیاتی طریقہ کار' : lang === 'en' ? 'Critical thinking, epistemology, and ethical systems' : 'Analytische Logik, Ethik & methodische Urteilskraft' 
    },
    { 
      title: lang === 'ur' ? 'اسلامی علوم و ثقافت' : lang === 'en' ? 'Islamic & Cultural Studies' : 'Religions- & Kulturwissenschaft', 
      desc: lang === 'ur' ? 'ثقافتی تفہیم اور بین الاقوامی افہام و تفہیم' : lang === 'en' ? 'Intercultural discourse and Islamic scholarship' : 'Interdisziplinäre Kultur- und Gesellschaftsanalysen' 
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* HERO SECTION — Clean Academic Biography Header */}
      <section className="bg-slate-50 border-b border-slate-200 py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back breadcrumb */}
          <button
            onClick={onGoHome}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav_home}</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Portrait Column */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative">
                <div className="w-52 h-64 sm:w-60 sm:h-72 rounded-2xl overflow-hidden border border-slate-300 shadow-xs bg-white">
                  <img
                    src="/assets/abdul_sattar.png"
                    alt="Abdul Sattar"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/abdul_sattar.png';
                    }}
                  />
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-block px-3.5 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                    Kanzleiinhaber & Gründer
                  </span>
                </div>
              </div>
            </div>

            {/* Biography Column */}
            <div className="md:col-span-8 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <BadgeCheck className="w-4 h-4 text-slate-700" />
                <span>{lang === 'ur' ? 'بانی اور واحد مشیر' : lang === 'en' ? 'Founder & Principal Consultant' : 'Gründer & Kanzleiinhaber'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight font-serif-title">
                Abdul Sattar
              </h1>

              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                PhD (Political Science) • LL.M. (Information & Media Law) • Magister Artium (Philosophy)
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {lang === 'ur'
                  ? 'عبدالستار A u.S کے بانی اور روحِ رواں ہیں۔ ان کا وسیع تعلیمی سفر پولیٹیکل سائنس، انفارمیشن و میڈیا لا، فلسفہ اور اسلامی علوم کے ایک کثیر الجہتی امتزاج پر محیط ہے، جو ان کی مشاورتی خدمات کو منفرد اسٹریٹجک گہرائی بخشتا ہے۔'
                  : lang === 'en'
                  ? 'Abdul Sattar is the visionary founder and sole leader of A u.S. His academic path spans Political Science, Information & Media Law, Philosophy, and Islamic Studies, driving an interdisciplinary approach to political, legal, and corporate questions.'
                  : 'Abdul Sattar ist der Gründer und Kanzleiinhaber von A u.S. Sein wissenschaftliches Profil verbindet Politikwissenschaft, Informations- und Medienrecht, Philosophie sowie Islamwissenschaft zu einer außergewöhnlich tiefgründigen, interdisziplinären Beratungskompetenz.'}
              </p>

              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
                <button
                  onClick={onStartBooking}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{lang === 'ur' ? 'عبدالستار کے ساتھ ملاقات بک کریں' : lang === 'en' ? 'Book Consultation with Abdul Sattar' : 'Termin mit Abdul Sattar vereinbaren'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION — Mobile-Friendly Fluid Timeline */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest bg-slate-50 px-3.5 py-1 rounded-full border border-slate-200">
            {lang === 'ur' ? 'تعلیمی سفر اور کامیابیاں' : lang === 'en' ? 'Academic Journey & Timeline' : 'Akademischer Werdegang & Meilensteine'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mt-3 tracking-tight font-serif-title">
            {lang === 'ur' ? 'علمی سفر کے اہم سنگ میل' : lang === 'en' ? 'Milestones of Academic Excellence' : 'Akademische Laufbahn & Promotionen'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            {lang === 'ur'
              ? 'لیپزگ یونیورسٹی، یونیورسٹی آف ویانا اور بین الاقوامی اداروں سے اعلیٰ اسناد کا تاریخی تناظر۔'
              : lang === 'en'
              ? 'A chronologically structured overview of degrees, research dissertations, and academic achievements.'
              : 'Eine chronologische Übersicht der universitären Abschlüsse, Forschungsarbeiten und Ehrungen von Abdul Sattar.'}
          </p>
        </div>

        {/* Responsive Timeline Container */}
        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-8 space-y-10 sm:space-y-12 pb-6">
          {timelineEvents.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative pl-6 sm:pl-10 group">
                {/* Timeline Dot Icon */}
                <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-slate-800 flex items-center justify-center text-slate-800 shadow-2xs group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Milestone Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xs hover:border-slate-300 transition-all space-y-3">
                  {/* Top Meta Tag Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                        {item.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {item.institution}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                      {item.dateLabel}
                    </span>
                  </div>

                  {/* Degree Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug font-serif">
                    {item.degree}
                  </h3>

                  {/* Highlight sentence */}
                  <div className="text-xs font-bold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item.highlight}</span>
                  </div>

                  {/* Dissertation Title if exists */}
                  {item.dissertationTitle && (
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        {lang === 'ur' ? 'مقالہ برائے ڈاکٹریٹ (Dissertation Title):' : lang === 'en' ? 'Dissertation Title:' : 'Dissertationsthema:'}
                      </span>
                      <p className="font-semibold italic text-slate-900 leading-relaxed font-serif">
                        {item.dissertationTitle}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERDISCIPLINARY PILLARS */}
      <section className="py-16 px-4 sm:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest bg-white px-3.5 py-1 rounded-full border border-slate-200">
              {lang === 'ur' ? 'کثیر الجہتی فکری نقطہ نظر' : lang === 'en' ? 'Interdisciplinary Expertise' : 'Interdisziplinäre Denkkultur'}
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mt-2 font-serif-title">
              {lang === 'ur' ? 'چار ستونوں پر مبنی تعلیمی و مشاورتی برتری' : lang === 'en' ? 'Bridging Four Core Academic Disciplines' : 'Vier wissenschaftliche Säulen ganzheitlicher Beratung'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interdisciplinaryDisciplines.map((d, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 text-xs">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{d.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIRECT BOOKING BANNER */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white text-slate-900 text-center border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif-title text-slate-950">
            {lang === 'ur'
              ? 'عبدالستار کے ساتھ اپنے اسٹریٹجک معاملات پر گفتگو کریں'
              : lang === 'en'
              ? 'Schedule Your Consultation with Abdul Sattar'
              : 'Vereinbaren Sie Ihr persönliches Gespräch mit Abdul Sattar'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {lang === 'ur'
              ? 'سیاسی، قانونی اور اقتصادی تقاضوں کے عین مطابق اعلیٰ ترین سطح پر مشاورت حاصل کریں۔'
              : lang === 'en'
              ? 'Benefit directly from interdisciplinary academic mastery in political science, media law, and strategic corporate governance.'
              : 'Profitieren Sie von fundierter Expertise an der Schnittstelle von Wirtschaftsberatung, Informationsrecht und strategischer Unternehmensführung.'}
          </p>
          <div className="flex justify-center pt-3">
            <button
              onClick={onStartBooking}
              className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.hero_book_btn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
