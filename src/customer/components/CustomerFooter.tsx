import { Shield, Phone, Mail, MapPin, Clock, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../../lib/translations.ts';

interface CustomerFooterProps {
  onNavigateFounder?: () => void;
  lang: Language;
}

export default function CustomerFooter({ onNavigateFounder, lang }: CustomerFooterProps) {
  const t = translations[lang] || translations.de;

  return (
    <footer id="kontakt" className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Col 1: Firm info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 px-2 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs font-serif tracking-tight">
                A u.S
              </div>
              <span className="text-base sm:text-lg font-bold text-white tracking-tight font-serif">
                A u.S {t.nav_tagline}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t.footer_about_desc}
            </p>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>Firma: <strong className="text-slate-200">A u. S Wirtschaftsberatung e.K.</strong></p>
              <p>Inhaber: <strong className="text-slate-200">Dr. Abdul Sattar</strong></p>
              <p>Registergericht: <span className="text-slate-300">Amtsgericht Leipzig • HRA 18879</span></p>
              <p className="text-amber-400/90 text-[10px] font-medium pt-1">§ Keine Steuerberatung gem. StBerG</p>
            </div>
          </div>

          {/* Col 2: Founder & Standorte */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t.footer_founder_profile}
            </h4>
            <div className="space-y-2.5 text-xs">
              {onNavigateFounder && (
                <button
                  onClick={onNavigateFounder}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer text-left"
                >
                  <GraduationCap className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{t.footer_founder_link}</span>
                </button>
              )}
              <div className="flex items-start gap-2 text-slate-400 pt-1">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block">{t.footer_headquarters}</strong>
                  Lagerhofstraße 2, 04103 Leipzig
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Kontakt & Zeiten */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t.footer_office_hours_title}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+49 89 45289-100</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>kanzlei@aus-beratung.de</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] pt-1 text-slate-500">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{t.footer_office_hours_val}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Qualität & Vertrauen */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t.footer_cert_title}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.footer_cert_desc}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.footer_cert_badge}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {t.footer_rights}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">{t.footer_imprint}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer_privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer_terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
