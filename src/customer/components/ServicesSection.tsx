import { useState } from 'react';
import { getLocalizedServices } from '../data/servicesData.ts';
import { 
  Calculator, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  Briefcase, 
  FileSpreadsheet, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  Users
} from 'lucide-react';
import { ServiceItem } from '../../types.ts';
import { Language, translations } from '../../lib/translations.ts';

interface ServicesSectionProps {
  onStartBooking?: (serviceId?: string) => void;
  onSelectService?: (serviceId: string) => void;
  lang?: Language;
}

export default function ServicesSection({ onStartBooking, onSelectService, lang = 'de' }: ServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = translations[lang] || translations.de;

  const triggerSelect = (id: string) => {
    if (onSelectService) {
      onSelectService(id);
    } else if (onStartBooking) {
      onStartBooking(id);
    }
  };

  const categories = [
    { id: 'all', label: t.services_filter_all },
    { id: 'accounting', label: t.services_filter_accounting },
    { id: 'office', label: t.services_filter_finance },
    { id: 'consulting', label: t.services_filter_consulting },
    { id: 'tax', label: t.services_filter_tax },
  ];

  const allServices = getLocalizedServices(lang);
  const filteredServices = selectedCategory === 'all'
    ? allServices
    : allServices.filter(s => s.category === selectedCategory);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-5 h-5 text-slate-800" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-slate-800" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-slate-800" />;
      case 'PieChart': return <PieChart className="w-5 h-5 text-slate-800" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-slate-800" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5 text-slate-800" />;
      default: return <Calculator className="w-5 h-5 text-slate-800" />;
    }
  };

  return (
    <section id="leistungen" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>{t.services_badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight font-serif-title">
            {t.services_title}
          </h2>
          <p className="mt-3 text-slate-600 text-xs sm:text-base leading-relaxed">
            {t.services_subtitle}
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 px-2 max-w-4xl mx-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service: ServiceItem) => (
            <div
              key={service.id}
              className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 flex flex-col p-6 sm:p-7 relative shadow-2xs hover:bg-white"
            >
              {service.popular && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-2xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{t.services_card_popular}</span>
                </div>
              )}

              {/* Service Icon & Category */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {getServiceIcon(service.iconName)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                  {service.categoryLabel}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 tracking-tight font-serif">
                {service.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5 flex-1">
                {service.shortDesc}
              </p>

              {/* Bullet Points */}
              <div className="space-y-2 mb-5 pt-4 border-t border-slate-200">
                {service.bulletPoints.slice(0, 3).map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Meta information */}
              <div className="bg-white rounded-xl p-3 mb-5 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.services_card_min}</span>
                  </span>
                  <strong className="text-slate-900 font-bold">{service.durationLabel}</strong>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.services_card_target}:</span>
                  </span>
                  <span className="truncate max-w-[150px] text-right font-medium text-slate-800" title={service.targetAudience}>
                    {service.targetAudience}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => triggerSelect(service.id)}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>{t.services_card_book}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
