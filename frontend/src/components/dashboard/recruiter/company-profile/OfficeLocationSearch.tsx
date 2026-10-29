'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import type { OfficeGeoResult } from '@/types/company';
import { searchOfficeLocations } from '@/utils/office-geo';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface OfficeLocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: OfficeGeoResult) => void;
  onNotFound: () => void;
}

export function OfficeLocationSearch({ value, onChange, onSelect, onNotFound }: OfficeLocationSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suggestions, setSuggestions] = useState<OfficeGeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const search = (query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const results = await searchOfficeLocations(query);
      setSuggestions(results);
      setOpen(results.length > 0);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);
  };

  const select = (result: OfficeGeoResult) => {
    onSelect(result);
    setOpen(false);
  };

  const searchNow = async () => {
    if (!value.trim()) return;
    setSearching(true);
    const [first] = await searchOfficeLocations(value);
    setSearching(false);
    if (first) select(first);
    else onNotFound();
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="cset-label">Map Location</label>
      <div className="relative">
        <input
          className="cset-input pr-10"
          placeholder="Search location (e.g. Banani, Gulshan, Dhanmondi, Dhaka...)"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            search(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions.length) select(suggestions[0]);
              else void searchNow();
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        {searching && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-[#0a65cc]" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 divide-y divide-gray-100 overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
          {suggestions.map((item) => (
            <button
              key={`${item.lat},${item.lng}`}
              type="button"
              onClick={() => select(item)}
              className="flex w-full cursor-pointer items-start gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-700 transition-colors hover:bg-[#f0f7ff]"
            >
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#0a65cc]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{item.mapLocation || item.city || item.address}</p>
                {item.address && item.address !== item.mapLocation && (
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">{item.address}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
