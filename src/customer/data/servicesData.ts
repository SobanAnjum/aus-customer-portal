import { ServiceItem } from '../../types.ts';
import { Language } from '../../lib/translations.ts';

export const corporateServices: ServiceItem[] = [
  {
    id: 'buchhaltung_laufend',
    title: 'Laufende Buchführung & Belegorganisation',
    category: 'accounting',
    categoryLabel: 'Buchhaltung',
    shortDesc: 'Laufende Buchführung im Rahmen der gesetzlich zulässigen Tätigkeiten, Erfassung und Ordnung von Geschäftsvorgängen.',
    fullDesc: 'Als Buchhalter unterstütze ich Selbstständige, Freiberufler und Unternehmen bei der laufenden kaufmännischen Organisation und bei vorbereitenden Buchhaltungsarbeiten. Mein Ziel ist es, Sie zuverlässig bei Ihren administrativen Aufgaben zu entlasten.',
    durationMinutes: 60,
    durationLabel: '60 Minuten',
    iconName: 'Calculator',
    popular: true,
    bulletPoints: [
      'Laufende Buchführung im Rahmen der gesetzlich zulässigen Tätigkeiten (§ 6 Nr. 3 & 4 StBerG)',
      'Erfassung und Ordnung von Geschäftsvorgängen',
      'Unterstützung bei der Vorbereitung der Buchhaltungsunterlagen',
      'Kontierung und Zuordnung von Belegen',
      'Vorbereitung von Unterlagen für den Steuerberater'
    ],
    targetAudience: 'Selbstständige, Freiberufler & kleine bis mittelständische Unternehmen (KMU)'
  },
  {
    id: 'buero_service',
    title: 'Büroservice & Administrative Organisation',
    category: 'office',
    categoryLabel: 'Büroservice',
    shortDesc: 'Allgemeine Büroorganisation, digitale Belegverwaltung, Schriftverkehr und administrative Unterstützung.',
    fullDesc: 'Für eine strukturierte und ordentliche Organisation Ihrer laufenden Unterlagen. Wir übernehmen allgemeine Büroorganisation, Schriftverkehr und Belegablage zuverlässig und unkompliziert.',
    durationMinutes: 45,
    durationLabel: '45 Minuten',
    iconName: 'FileSpreadsheet',
    popular: true,
    bulletPoints: [
      'Allgemeine Büroorganisation',
      'Digitale und organisatorische Belegverwaltung',
      'Schriftverkehr und administrative Unterstützung',
      'Ablage und Ordnung von Geschäftsunterlagen',
      'Unterstützung bei laufenden Verwaltungsaufgaben'
    ],
    targetAudience: 'Unternehmen, Freiberufler und Selbstständige aller Branchen'
  },
  {
    id: 'kaufmaennische_organisation',
    title: 'Laufende kaufmännische Betreuung',
    category: 'consulting',
    categoryLabel: 'Organisation',
    shortDesc: 'Persönliche, zuverlässige und unkomplizierte Zusammenarbeit für Selbstständige und KMU mit festem Ansprechpartner.',
    fullDesc: 'Ich unterstütze insbesondere kleine und mittelständische Unternehmen sowie Selbstständige, die ihre laufenden kaufmännischen und organisatorischen Aufgaben professionell erledigen lassen möchten.',
    durationMinutes: 60,
    durationLabel: '60 Minuten',
    iconName: 'Briefcase',
    popular: false,
    bulletPoints: [
      'Fester persönlicher Ansprechpartner (Dr. Abdul Sattar)',
      'Unterstützung bei der laufenden kaufmännischen Organisation',
      'Direkte Kommunikation und unkomplizierte Abläufe',
      'Zuverlässige Entlastung bei administrativen Routineaufgaben',
      'Persönlich vor Ort in Leipzig oder digital per Video-Call'
    ],
    targetAudience: 'KMU, Gewerbetreibende & Freiberufler'
  },
  {
    id: 'steuerberater_vorbereitung',
    title: 'Vorbereitung von Unterlagen für den Steuerberater',
    category: 'tax',
    categoryLabel: 'Vorbereitung',
    shortDesc: 'Strukturierte und lückenlose Vorbereitung aller Unterlagen zur Abstimmung mit dem Steuerberater des Kunden.',
    fullDesc: 'Keine Steuerberatung: Wir bieten keine steuerrechtliche Beratung an. Auf Wunsch werden die für die steuerliche Bearbeitung erforderlichen Unterlagen strukturiert und vorbereitet und mit dem zuständigen Steuerberater abgestimmt.',
    durationMinutes: 45,
    durationLabel: '45 Minuten',
    iconName: 'FileText',
    popular: false,
    bulletPoints: [
      'Strukturierte Vorbereitung aller erforderlichen Buchhaltungsunterlagen',
      'Lückenlose Kontierung und Belegzuordnung',
      'Organisatorische Abstimmung mit dem Steuerberater des Mandanten',
      'Wichtiger Hinweis: Keine eigene Steuerberatung gemäß StBerG'
    ],
    targetAudience: 'Mandanten mit externem Steuerberater zur Reduktion von Kanzleikosten'
  }
];

export function getLocalizedServices(lang: Language = 'de'): ServiceItem[] {
  if (lang === 'en') {
    return [
      {
        id: 'buchhaltung_laufend',
        title: 'Ongoing Bookkeeping & Document Organization',
        category: 'accounting',
        categoryLabel: 'Bookkeeping',
        shortDesc: 'Ongoing bookkeeping within statutory permitted activities, recording and organizing business transactions.',
        fullDesc: 'As a professional bookkeeper, Dr. Abdul Sattar supports freelancers, self-employed individuals, and businesses in their daily commercial organization and preparatory bookkeeping.',
        durationMinutes: 60,
        durationLabel: '60 Minutes',
        iconName: 'Calculator',
        popular: true,
        bulletPoints: [
          'Ongoing bookkeeping within statutory permitted limits (§ 6 No. 3 & 4 StBerG)',
          'Recording and systematic organization of business transactions',
          'Preparation of bookkeeping documents and vouchers',
          'Account assignment and voucher classification',
          'Preparation of documents for your appointed tax consultant'
        ],
        targetAudience: 'Self-employed, freelancers & small-to-medium enterprises (SMEs)'
      },
      {
        id: 'buero_service',
        title: 'Office Service & Administrative Organization',
        category: 'office',
        categoryLabel: 'Office Service',
        shortDesc: 'General office management, digital document administration, business correspondence, and administrative support.',
        fullDesc: 'Structured and organized management of ongoing documents. We relieve your business of administrative burdens with personal and reliable assistance.',
        durationMinutes: 45,
        durationLabel: '45 Minutes',
        iconName: 'FileSpreadsheet',
        popular: true,
        bulletPoints: [
          'General office organization and workflow management',
          'Digital and organizational document administration',
          'Business correspondence and administrative assistance',
          'Filing and systematic sorting of business records',
          'Ongoing administrative task handling'
        ],
        targetAudience: 'Companies, self-employed professionals, and businesses in Leipzig and online'
      },
      {
        id: 'kaufmaennische_organisation',
        title: 'Ongoing Commercial & Operational Support',
        category: 'consulting',
        categoryLabel: 'Organization',
        shortDesc: 'Personal, dependable, and straightforward collaboration for SMEs and self-employed professionals.',
        fullDesc: 'Dedicated support for small and medium-sized enterprises and self-employed individuals who want their commercial and organizational tasks handled professionally.',
        durationMinutes: 60,
        durationLabel: '60 Minutes',
        iconName: 'Briefcase',
        popular: false,
        bulletPoints: [
          'Dedicated personal contact partner (Dr. Abdul Sattar)',
          'Continuous support with day-to-day commercial management',
          'Direct communication and pragmatic problem-solving',
          'Reliable relief from routine administrative overhead',
          'In person in Leipzig or nationwide via video consultation'
        ],
        targetAudience: 'SMEs, commercial businesses, and independent entrepreneurs'
      },
      {
        id: 'steuerberater_vorbereitung',
        title: 'Preparation of Documents for Tax Advisors',
        category: 'tax',
        categoryLabel: 'Preparation',
        shortDesc: 'Structured and complete preparation of records for coordination with the client’s appointed tax advisor.',
        fullDesc: 'Notice: A u. S Wirtschaftsberatung e.K. does not provide legal tax advisory services. We structure and prepare records for coordination with your certified tax consultant.',
        durationMinutes: 45,
        durationLabel: '45 Minutes',
        iconName: 'FileText',
        popular: false,
        bulletPoints: [
          'Structured preparation of all necessary bookkeeping records',
          'Complete document classification and voucher indexing',
          'Smooth organizational coordination with your external tax accountant',
          'Important Notice: No tax consulting provided (reserved for Steuerberater)'
        ],
        targetAudience: 'Clients with external tax advisors wanting organized preparatory work'
      }
    ];
  }

  if (lang === 'ur') {
    return [
      {
        id: 'buchhaltung_laufend',
        title: 'بک کیپنگ اور ریکارڈ کی باقاعدہ تنظیم',
        category: 'accounting',
        categoryLabel: 'بک کیپنگ',
        shortDesc: 'جرمن قانون کے تحت مجاز معمول کی بک کیپنگ، کاروباری لین دین کا اندراج اور رسیدوں کی باضابطہ تنظیم۔',
        fullDesc: 'ڈاکٹر عبدالستار خود روزگار افراد، فری لانسرز اور کمپنیوں کو معمول کی تجارتی تنظیم اور بک کیپنگ کی تیاری میں پیشہ ورانہ معاونت فراہم کرتے ہیں۔',
        durationMinutes: 60,
        durationLabel: '60 منٹ',
        iconName: 'Calculator',
        popular: true,
        bulletPoints: [
          'قانونی طور پر مجاز حدود میں معمول کی بک کیپنگ (§ 6 No. 3 & 4 StBerG)',
          'کاروباری سرگرمیوں کا بروقت اندراج اور باقاعدہ ترتیب',
          'بک کیپنگ ریکارڈ اور دستاویزات کی تیاری میں مدد',
          'رسیدوں کی درجہ بندی اور کھاتوں کے مطابق تقسیم',
          'ٹیکس مشیر (Steuerberater) کے لیے ریکارڈ کی تیاری'
        ],
        targetAudience: 'خود روزگار افراد، فری لانسرز اور چھوٹے و درمیانے درجے کے کاروباری ادارے (KMU)'
      },
      {
        id: 'buero_service',
        title: 'آفس سروس اور انتظامی معاونت',
        category: 'office',
        categoryLabel: 'آفس سروس',
        shortDesc: 'دفتری امور کی عام تنظیم، ڈیجیٹل ریکارڈ مینجمنٹ، دفتری خط و کتابت اور انتظامی کاموں میں مدد۔',
        fullDesc: 'آپ کے تجارتی کاغذات اور ریکارڈ کو باقاعدہ اور منظم رکھنا۔ ہم آپ کے روزمرہ انتظامی بوجھ کو قابل اعتماد طریقے سے ہلکا کرتے ہیں۔',
        durationMinutes: 45,
        durationLabel: '45 منٹ',
        iconName: 'FileSpreadsheet',
        popular: true,
        bulletPoints: [
          'عام دفتری تنظیم اور ورک فلو کا انتظام',
          'ڈیجیٹل اور تنظیمی ریکارڈ مینجمنٹ',
          'تجارتی خط و کتابت اور انتظامی معاونت',
          'کاروباری فائلوں کی منظم فائلنگ اور ترتیب',
          'معمول کے انتظامی اور دفتری فرائض کی انجام دہی'
        ],
        targetAudience: 'تمام شعبوں کے کاروباری ادارے، دکاندار اور خود روزگار پیشہ ور افراد'
      },
      {
        id: 'kaufmaennische_organisation',
        title: 'مستقل تجارتی و کاروباری معاونت',
        category: 'consulting',
        categoryLabel: 'تنظیم',
        shortDesc: 'ایک مخصوص رابطہ کار (ڈاکٹر عبدالستار) کے ساتھ ذاتی، قابل اعتماد اور آسان شراکت داری۔',
        fullDesc: 'ہم خاص طور پر چھوٹے اور درمیانے کاروباروں اور خود روزگار افراد کی مدد کرتے ہیں جو اپنے تجارتی اور دفتری امور پیشہ ورانہ مہارت سے چلانا چاہتے ہیں۔',
        durationMinutes: 60,
        durationLabel: '60 منٹ',
        iconName: 'Briefcase',
        popular: false,
        bulletPoints: [
          'مستقل ذاتی رابطہ کار (ڈاکٹر عبدالستار)',
          'تجارتی اور دفتری معاملات میں مستقل مشاورت',
          'براہ راست اور شفاف رابطہ بغیر کسی پیچیدگی کے',
          'روزمرہ دفتری کاموں سے قابل اعتماد نجات',
          'لائپزگ میں ذاتی ملاقات یا ملک بھر سے ویڈیو کانفرنس'
        ],
        targetAudience: 'چھوٹے اور درمیانے کاروبار، تاجر اور آزاد پیشہ ور'
      },
      {
        id: 'steuerberater_vorbereitung',
        title: 'ٹیکس مشیر کے لیے دستاویزات کی تیاری',
        category: 'tax',
        categoryLabel: 'تیاری',
        shortDesc: 'کلائنٹ کے ٹیکس مشیر کے ساتھ ہم آہنگی کے لیے تمام تجارتی دستاویزات کی مکمل اور باضابطہ تیاری۔',
        fullDesc: 'اہم نوٹ: ہم ٹیکس مشاورت (Steuerberatung) پیش نہیں کرتے۔ ہم آپ کے ٹیکس مشیر کے لیے مطلوبہ تمام ریکارڈ کو منظم اور تیار کرتے ہیں۔',
        durationMinutes: 45,
        durationLabel: '45 منٹ',
        iconName: 'FileText',
        popular: false,
        bulletPoints: [
          'ٹیکس پروسیسنگ کے لیے مطلوبہ تمام ریکارڈ کی منظم تیاری',
          'رسیدوں اور اخراجات کا جامع و شفاف ریکارڈ',
          'کلائنٹ کے متعلقہ ٹیکس مشیر کے ساتھ تنظیمی ہم آہنگی',
          'اہم قانونی وضاحت: ہماری طرف سے کوئی ٹیکس ایڈوائزری نہیں دی جاتی'
        ],
        targetAudience: 'وہ کلائنٹس جن کا ٹیکس مشیر موجود ہے اور وہ تیاری کا کام آؤٹ سورس کرنا چاہتے ہیں'
      }
    ];
  }

  return corporateServices;
}
