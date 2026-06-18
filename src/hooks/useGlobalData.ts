import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ── Types ─────────────────────────────────────────────────────
export interface Sport {
  id: string;
  name: string;
  type: 'team' | 'individual';
  icon: string;
  category: string;
  stat_schema: Array<{ key: string; label: string; type: string }>;
  display_order: number;
}

export interface Country {
  iso_code: string;
  name: string;
  flag: string;
  region: string;
  sub_region?: string;
}

export interface Competition {
  id: string;
  name: string;
  sport: string;
  sport_id?: string;
  country?: string;
  country_id?: string;
  region?: string;
  tier: string;
  scope?: string;
  gender?: string;
  age_group?: string;
  governing_body?: string;
  data_source?: string;
  verification_status?: string;
}

export interface Team {
  id: string;
  name: string;
  sport_id?: string;
  country_id?: string;
  city?: string;
  short_name?: string;
  crest_url?: string;
  data_source?: string;
  verification_status?: string;
}

// ── Hooks ─────────────────────────────────────────────────────
export function useSports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('sports')
      .select('*')
      .eq('active', true)
      .order('display_order')
      .then(({ data }) => {
        setSports((data as Sport[]) ?? []);
        setLoading(false);
      });
  }, []);

  const byCategory = sports.reduce<Record<string, Sport[]>>((acc, s) => {
    const cat = s.category ?? 'Other';
    (acc[cat] ??= []).push(s);
    return acc;
  }, {});

  return { sports, byCategory, loading };
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('countries')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setCountries((data as Country[]) ?? []);
        setLoading(false);
      });
  }, []);

  const byRegion = countries.reduce<Record<string, Country[]>>((acc, c) => {
    (acc[c.region] ??= []).push(c);
    return acc;
  }, {});

  return { countries, byRegion, loading };
}

export function useCompetitionSearch(query: string, sportId?: string, countryId?: string, tier?: string) {
  const [results, setResults] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim() && !sportId && !countryId) { setResults([]); return; }
    setLoading(true);

    let q = supabase.from('competitions').select('*').eq('verification_status', 'approved');

    if (query.trim()) {
      q = q.ilike('name', `%${query}%`);
    }
    if (sportId) {
      q = q.or(`sport_id.eq.${sportId},sport.ilike.${query}`);
    }
    if (countryId) {
      q = q.or(`country_id.eq.${countryId},country.eq.${countryId}`);
    }
    if (tier) {
      q = q.eq('tier', tier);
    }

    const { data } = await q.order('name').limit(20);
    setResults((data as Competition[]) ?? []);
    setLoading(false);
  }, [query, sportId, countryId, tier]);

  useEffect(() => {
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [search]);

  return { results, loading };
}

export function useTeamSearch(query: string, sportId?: string, countryId?: string) {
  const [results, setResults] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);

    let q = supabase.from('teams').select('*').eq('verification_status', 'approved');
    q = q.ilike('name', `%${query}%`);
    if (sportId) q = q.eq('sport_id', sportId);
    if (countryId) q = q.eq('country_id', countryId);

    const { data } = await q.order('name').limit(15);
    setResults((data as Team[]) ?? []);
    setLoading(false);
  }, [query, sportId, countryId]);

  useEffect(() => {
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [search]);

  return { results, loading };
}
