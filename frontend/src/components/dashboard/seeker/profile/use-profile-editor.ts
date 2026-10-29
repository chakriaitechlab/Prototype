'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ProfileDraft, SeekerProfile } from '@/types/profile';
import { changedFields, toDraft } from '@/utils/profile';

type ListSection = {
  [K in keyof ProfileDraft]: ProfileDraft[K] extends unknown[] ? K : never;
}[keyof ProfileDraft];

type ListItem<S extends ListSection> = ProfileDraft[S][number];

export function useProfileEditor(profile: SeekerProfile) {
  const [source, setSource] = useState(profile);
  const [saved, setSaved] = useState(() => toDraft(profile));
  const [draft, setDraft] = useState(saved);
  const [cvUrl, setCvUrl] = useState(profile.cvUrl);

  const changes = useMemo(() => changedFields(draft, saved), [draft, saved]);
  const dirty = Object.keys(changes).length > 0;

  if (source !== profile) {
    setSource(profile);
    setCvUrl(profile.cvUrl);
    if (!dirty) {
      const next = toDraft(profile);
      setSaved(next);
      setDraft(next);
    }
  }

  const update = useCallback(<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const addItem = useCallback(<S extends ListSection>(section: S, item: ListItem<S>) => {
    setDraft((current) => ({ ...current, [section]: [...current[section], item] }));
  }, []);

  const updateItem = useCallback(<S extends ListSection>(section: S, index: number, patch: Partial<ListItem<S>>) => {
    setDraft((current) => ({
      ...current,
      [section]: current[section].map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }, []);

  const removeItem = useCallback(<S extends ListSection>(section: S, index: number) => {
    setDraft((current) => ({ ...current, [section]: current[section].filter((_, i) => i !== index) }));
  }, []);

  const markSaved = useCallback((next: SeekerProfile) => {
    const nextDraft = toDraft(next);
    setSaved(nextDraft);
    setDraft(nextDraft);
    setCvUrl(next.cvUrl);
  }, []);

  return { draft, changes, dirty, cvUrl, setCvUrl, update, addItem, updateItem, removeItem, markSaved };
}

export type ProfileEditor = ReturnType<typeof useProfileEditor>;
