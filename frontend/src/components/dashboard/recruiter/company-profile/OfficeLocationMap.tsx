'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OfficeGeoResult } from '@/types/company';
import { reverseGeocodeOffice } from '@/utils/office-geo';

const DHAKA: [number, number] = [23.8103, 90.4125];
const CITY_ZOOM = 12;
const PIN_ZOOM = 15;
const MAX_ZOOM = 19;
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const COORD_EPSILON = 1e-6;

interface OfficeLocationMapProps {
  lat: number | null;
  lng: number | null;
  onPick: (result: OfficeGeoResult) => void;
  onLocateMe: () => void;
  locating: boolean;
}

export function OfficeLocationMap({ lat, lng, onPick, onLocateMe, locating }: OfficeLocationMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onPickRef = useRef(onPick);
  const initialCenter = useRef({ lat, lng });

  useEffect(() => {
    onPickRef.current = onPick;
  });

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const L = (await import('leaflet')).default;
      if (cancelled || !elRef.current || mapRef.current) return;

      const { lat: startLat, lng: startLng } = initialCenter.current;
      const hasStart = startLat !== null && startLng !== null;
      const start: [number, number] = hasStart ? [startLat, startLng] : DHAKA;

      const map = L.map(elRef.current, { scrollWheelZoom: true, attributionControl: false }).setView(
        start,
        hasStart ? PIN_ZOOM : CITY_ZOOM,
      );
      L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM }).addTo(map);

      const icon = L.divIcon({
        className: 'cco-map-pin',
        html: '<span class="cco-map-pin-mark"></span>',
        iconSize: [28, 40],
        iconAnchor: [14, 38],
      });
      const marker = L.marker(start, { draggable: true, icon }).addTo(map);

      const emit = async (nextLat: number, nextLng: number) => {
        onPickRef.current(await reverseGeocodeOffice(nextLat, nextLng));
      };

      marker.on('dragend', () => {
        const point = marker.getLatLng();
        void emit(point.lat, point.lng);
      });
      map.on('click', (event) => {
        marker.setLatLng(event.latlng);
        void emit(event.latlng.lat, event.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      requestAnimationFrame(() => map.invalidateSize());
    }

    void boot();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (lat === null || lng === null || !map || !marker) return;

    const current = marker.getLatLng();
    if (Math.abs(current.lat - lat) < COORD_EPSILON && Math.abs(current.lng - lng) < COORD_EPSILON) return;
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], Math.max(map.getZoom(), PIN_ZOOM), { animate: true });
  }, [lat, lng]);

  return (
    <div className="cco-map-shell">
      <div className="relative isolate">
        <div ref={elRef} className="cco-map" role="application" aria-label="Office location map" />
        <button
          type="button"
          onClick={onLocateMe}
          disabled={locating}
          title="Your location (GPS)"
          aria-label="Your location"
          className="absolute bottom-3 right-3 z-[400] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gray-200/90 bg-white text-[#3c4043] shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-all hover:bg-[#f8f9fa] hover:text-[#1a73e8] active:bg-[#f1f3f4] disabled:opacity-60"
        >
          {locating ? (
            <svg className="h-5 w-5 animate-spin text-[#1a73e8]" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="6.5" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              <line x1="12" y1="1.5" x2="12" y2="4.5" />
              <line x1="12" y1="19.5" x2="12" y2="22.5" />
              <line x1="1.5" y1="12" x2="4.5" y2="12" />
              <line x1="19.5" y1="12" x2="22.5" y2="12" />
            </svg>
          )}
        </button>
      </div>
      <p className="cco-map-hint">Click the map or drag the pin to fine-tune your exact office location.</p>
    </div>
  );
}
