import { getLocalizedServices } from '../data/servicesData.ts';
import { ServiceItem } from '../../types.ts';
import { 
  Calculator, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  Briefcase, 
  FileSpreadsheet, 
  Clock, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { Language, translations } from '../../lib/translations.ts';

interface StepServiceSelectProps {
  selectedServiceId: string;
  onSelectService: (service: ServiceItem) => void;
  onNext: () => void;
  lang?: Language;
}

export default function StepServiceSelect({
  selectedServiceId,
  onSelectService,
  onNext,
  lang = 'de',
}: StepServiceSelectProps) {
  const t = translations[lang] || translations.de;
  const services = getLocalizedServices(lang);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Calculator': return <Calculator className="w-5 h-5 text-slate-800" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-slate-800" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-slate-800" />;
      case 'PieChart': return <PieChart className="w-5 h-5 text-slate-800" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-slate-800" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5 text-slate-800" />;
      default: return <Calculator className="w-5 h-5 text-slate-800" />;
    }
  };

  const selectLabel = lang === 'ur' ? 'منتخب کریں ←' : lang === 'en' ? 'Select →' : 'Auswählen →';
  const selectedLabel = lang === 'ur' ? 'منتخب ✓' : lang === 'en' ? 'Selected ✓' : 'Ausgewählt ✓';

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-title">{t.step1_choose_service}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {t.step1_service_scope}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                    {getIcon(service.iconName)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {service.categoryLabel}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug font-serif">
                      {service.title}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {service.shortDesc}
                </p>

                <div className="space-y-1.5 mb-4">
                  {service.bulletPoints.slice(0, 3).map((bp, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                      <span>{bp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{service.durationLabel}</span>
                </span>
                <span className={`font-bold ${isSelected ? 'text-slate-950' : 'text-slate-600'}`}>
                  {isSelected ? selectedLabel : selectLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <span>{t.step1_next_btn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
