import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ── Types ─────────────────────────────────────────────────────
export type Locale = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'hi' | 'ru' | 'tr';
export type UnitSystem = 'metric' | 'imperial';
export type Dir = 'ltr' | 'rtl';

const RTL_LOCALES: Locale[] = ['ar'];

export interface LocaleContextValue {
  locale: Locale;
  dir: Dir;
  unitSystem: UnitSystem;
  timezone: string;
  setLocale: (l: Locale) => void;
  setUnitSystem: (u: UnitSystem) => void;
  setTimezone: (tz: string) => void;
  formatDate: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (n: number, opts?: Intl.NumberFormatOptions) => string;
  t: (key: string) => string;
}

// ── Minimal translation table ─────────────────────────────────
const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'nav.discover':    'Discover',
    'nav.performance': 'Performance',
    'nav.events':      'Events',
    'sport.select':    'Select Sport',
    'country.select':  'Select Country',
    'tier.professional': 'Professional',
    'tier.semi_pro':   'Semi-Pro',
    'tier.amateur':    'Amateur',
    'tier.college':    'College / University',
    'tier.youth_academy': 'Youth Academy',
    'tier.school':     'School',
    'tier.grassroots': 'Grassroots',
    'tier.recreational': 'Recreational',
    'scope.global':    'Global',
    'scope.continental': 'Continental',
    'scope.national':  'National',
    'scope.regional':  'Regional',
    'scope.local':     'Local',
    'unit.metric':     'Metric',
    'unit.imperial':   'Imperial',
  },
  ar: {
    'nav.discover':    'اكتشاف',
    'nav.performance': 'الأداء',
    'nav.events':      'الفعاليات',
    'sport.select':    'اختر الرياضة',
    'country.select':  'اختر البلد',
    'tier.professional': 'احترافي',
    'tier.semi_pro':   'شبه احترافي',
    'tier.amateur':    'هاوٍ',
    'tier.college':    'جامعي',
    'tier.youth_academy': 'أكاديمية الشباب',
    'tier.school':     'مدرسي',
    'tier.grassroots': 'شعبي',
    'tier.recreational': 'ترفيهي',
    'scope.global':    'عالمي',
    'scope.continental': 'قاري',
    'scope.national':  'وطني',
    'scope.regional':  'إقليمي',
    'scope.local':     'محلي',
    'unit.metric':     'متري',
    'unit.imperial':   'إمبريالي',
  },
  fr: {
    'nav.discover':    'Découvrir',
    'nav.performance': 'Performance',
    'nav.events':      'Événements',
    'sport.select':    'Choisir un sport',
    'country.select':  'Choisir un pays',
    'tier.professional': 'Professionnel',
    'tier.semi_pro':   'Semi-pro',
    'tier.amateur':    'Amateur',
    'tier.college':    'Universitaire',
    'tier.youth_academy': 'Académie jeunes',
    'tier.school':     'Scolaire',
    'tier.grassroots': 'Populaire',
    'tier.recreational': 'Récréatif',
    'scope.global':    'Mondial',
    'scope.continental': 'Continental',
    'scope.national':  'National',
    'scope.regional':  'Régional',
    'scope.local':     'Local',
    'unit.metric':     'Métrique',
    'unit.imperial':   'Impérial',
  },
  es: { 'nav.discover': 'Descubrir', 'nav.performance': 'Rendimiento', 'nav.events': 'Eventos', 'sport.select': 'Seleccionar deporte', 'country.select': 'Seleccionar país', 'tier.professional': 'Profesional', 'tier.semi_pro': 'Semipro', 'tier.amateur': 'Amateur', 'tier.college': 'Universitario', 'tier.youth_academy': 'Academia juvenil', 'tier.school': 'Escolar', 'tier.grassroots': 'Base', 'tier.recreational': 'Recreativo', 'scope.global': 'Global', 'scope.continental': 'Continental', 'scope.national': 'Nacional', 'scope.regional': 'Regional', 'scope.local': 'Local', 'unit.metric': 'Métrico', 'unit.imperial': 'Imperial' },
  de: { 'nav.discover': 'Entdecken', 'nav.performance': 'Leistung', 'nav.events': 'Events', 'sport.select': 'Sport wählen', 'country.select': 'Land wählen', 'tier.professional': 'Professionell', 'tier.semi_pro': 'Halbprofi', 'tier.amateur': 'Amateur', 'tier.college': 'Hochschule', 'tier.youth_academy': 'Jugendakademie', 'tier.school': 'Schule', 'tier.grassroots': 'Basis', 'tier.recreational': 'Freizeit', 'scope.global': 'Global', 'scope.continental': 'Kontinental', 'scope.national': 'National', 'scope.regional': 'Regional', 'scope.local': 'Lokal', 'unit.metric': 'Metrisch', 'unit.imperial': 'Imperial' },
  pt: { 'nav.discover': 'Descobrir', 'nav.performance': 'Desempenho', 'nav.events': 'Eventos', 'sport.select': 'Selecionar esporte', 'country.select': 'Selecionar país', 'tier.professional': 'Profissional', 'tier.semi_pro': 'Semi-pro', 'tier.amateur': 'Amador', 'tier.college': 'Universitário', 'tier.youth_academy': 'Academia jovem', 'tier.school': 'Escolar', 'tier.grassroots': 'Popular', 'tier.recreational': 'Recreativo', 'scope.global': 'Global', 'scope.continental': 'Continental', 'scope.national': 'Nacional', 'scope.regional': 'Regional', 'scope.local': 'Local', 'unit.metric': 'Métrico', 'unit.imperial': 'Imperial' },
  zh: { 'nav.discover': '发现', 'nav.performance': '表现', 'nav.events': '赛事', 'sport.select': '选择运动', 'country.select': '选择国家', 'tier.professional': '职业', 'tier.semi_pro': '半职业', 'tier.amateur': '业余', 'tier.college': '大学', 'tier.youth_academy': '青训学院', 'tier.school': '学校', 'tier.grassroots': '基层', 'tier.recreational': '休闲', 'scope.global': '全球', 'scope.continental': '洲际', 'scope.national': '国家', 'scope.regional': '地区', 'scope.local': '本地', 'unit.metric': '公制', 'unit.imperial': '英制' },
  hi: { 'nav.discover': 'खोजें', 'nav.performance': 'प्रदर्शन', 'nav.events': 'कार्यक्रम', 'sport.select': 'खेल चुनें', 'country.select': 'देश चुनें', 'tier.professional': 'पेशेवर', 'tier.semi_pro': 'अर्ध-पेशेवर', 'tier.amateur': 'शौकिया', 'tier.college': 'विश्वविद्यालय', 'tier.youth_academy': 'युवा अकादमी', 'tier.school': 'विद्यालय', 'tier.grassroots': 'जमीनी स्तर', 'tier.recreational': 'मनोरंजक', 'scope.global': 'वैश्विक', 'scope.continental': 'महाद्वीपीय', 'scope.national': 'राष्ट्रीय', 'scope.regional': 'क्षेत्रीय', 'scope.local': 'स्थानीय', 'unit.metric': 'मीट्रिक', 'unit.imperial': 'इम्पीरियल' },
  ru: { 'nav.discover': 'Открыть', 'nav.performance': 'Результаты', 'nav.events': 'События', 'sport.select': 'Выбрать спорт', 'country.select': 'Выбрать страну', 'tier.professional': 'Профессиональный', 'tier.semi_pro': 'Полупрофессиональный', 'tier.amateur': 'Любительский', 'tier.college': 'Студенческий', 'tier.youth_academy': 'Молодёжная академия', 'tier.school': 'Школьный', 'tier.grassroots': 'Любительский', 'tier.recreational': 'Досуговый', 'scope.global': 'Мировой', 'scope.continental': 'Континентальный', 'scope.national': 'Национальный', 'scope.regional': 'Региональный', 'scope.local': 'Местный', 'unit.metric': 'Метрическая', 'unit.imperial': 'Имперская' },
  tr: { 'nav.discover': 'Keşfet', 'nav.performance': 'Performans', 'nav.events': 'Etkinlikler', 'sport.select': 'Spor Seç', 'country.select': 'Ülke Seç', 'tier.professional': 'Profesyonel', 'tier.semi_pro': 'Yarı-profesyonel', 'tier.amateur': 'Amatör', 'tier.college': 'Üniversite', 'tier.youth_academy': 'Gençlik Akademisi', 'tier.school': 'Okul', 'tier.grassroots': 'Temel', 'tier.recreational': 'Rekreasyon', 'scope.global': 'Global', 'scope.continental': 'Kıtasal', 'scope.national': 'Ulusal', 'scope.regional': 'Bölgesel', 'scope.local': 'Yerel', 'unit.metric': 'Metrik', 'unit.imperial': 'İmparatorluk' },
};

// ── Context ───────────────────────────────────────────────────
const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  dir: 'ltr',
  unitSystem: 'metric',
  timezone: 'UTC',
  setLocale: () => {},
  setUnitSystem: () => {},
  setTimezone: () => {},
  formatDate: (iso) => iso,
  formatNumber: (n) => String(n),
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [locale, setLocaleState] = useState<Locale>('en');
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');
  const [timezone, setTimezoneState] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  );

  // Load from user profile on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_profiles')
      .select('locale, timezone, unit_system')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.locale) setLocaleState(data.locale as Locale);
        if (data.timezone) setTimezoneState(data.timezone);
        if (data.unit_system) setUnitSystemState(data.unit_system as UnitSystem);
      });
  }, [user]);

  // Apply dir to <html>
  useEffect(() => {
    const dir: Dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const dir: Dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  const persist = useCallback(async (patch: Record<string, string>) => {
    if (!user) return;
    await supabase.from('user_profiles').update(patch).eq('id', user.id);
  }, [user]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    persist({ locale: l });
  }, [persist]);

  const setUnitSystem = useCallback((u: UnitSystem) => {
    setUnitSystemState(u);
    persist({ unit_system: u });
  }, [persist]);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
    persist({ timezone: tz });
  }, [persist]);

  const formatDate = useCallback((iso: string, opts?: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...opts,
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }, [locale, timezone]);

  const formatNumber = useCallback((n: number, opts?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(locale, opts).format(n);
    } catch {
      return String(n);
    }
  }, [locale]);

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, dir, unitSystem, timezone, setLocale, setUnitSystem, setTimezone, formatDate, formatNumber, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

// Tier labels ordered for display
export const TIER_ORDER = [
  'professional', 'semi_pro', 'amateur', 'college',
  'youth_academy', 'school', 'grassroots', 'recreational',
  'continental', 'international', 'friendly',
] as const;

export const TIER_COLORS: Record<string, string> = {
  professional:  '#B8F135',
  semi_pro:      '#2F80ED',
  amateur:       '#1FB57A',
  college:       '#F5A623',
  youth_academy: '#EF5350',
  school:        '#A78BFA',
  grassroots:    '#64B5F6',
  recreational:  '#7C8DA6',
  continental:   '#2F80ED',
  international: '#B8F135',
  friendly:      '#7C8DA6',
};
