import type { OfficeGeoResult } from '@/types/company';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim() ?? '';
const GEOAPIFY_URL = 'https://api.geoapify.com/v1/geocode';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const DEFAULT_COUNTRY = 'Bangladesh';
const SUGGESTION_LIMIT = 6;
const MIN_QUERY_LENGTH = 2;
const GEOLOCATION_TIMEOUT_MS = 12_000;

type AddressParts = Record<string, unknown>;

interface GeoapifyRow extends AddressParts {
  lat?: number;
  lon?: number;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
}

interface NominatimRow {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: AddressParts;
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cityOf(parts: AddressParts) {
  return (
    text(parts.city) ||
    text(parts.town) ||
    text(parts.village) ||
    text(parts.state_district) ||
    text(parts.county) ||
    text(parts.state)
  );
}

function fromGeoapify(row: GeoapifyRow, lat: number, lng: number): OfficeGeoResult {
  const city = cityOf(row);
  const country = text(row.country) || DEFAULT_COUNTRY;
  const address = text(row.formatted) || [text(row.address_line1), text(row.address_line2)].filter(Boolean).join(', ');
  const mapLocation = [city, country].filter(Boolean).join(', ') || address;
  return { lat, lng, address: address || mapLocation, city, country, mapLocation };
}

function fromNominatim(row: NominatimRow, lat: number, lng: number): OfficeGeoResult {
  const parts = row.address ?? {};
  const city = cityOf(parts);
  const country = text(parts.country);
  const street = [text(parts.house_number), text(parts.road)].filter(Boolean).join(' ');
  const address = text(row.display_name) || [street, city, country].filter(Boolean).join(', ');
  return { lat, lng, address, city, country, mapLocation: [city, country].filter(Boolean).join(', ') || address };
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function reverseGeocodeOffice(lat: number, lng: number): Promise<OfficeGeoResult> {
  if (GEOAPIFY_API_KEY) {
    const params = new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'json', apiKey: GEOAPIFY_API_KEY });
    const data = await getJson<{ results?: GeoapifyRow[] }>(`${GEOAPIFY_URL}/reverse?${params}`);
    const row = data?.results?.[0];
    if (row) return fromGeoapify(row, lat, lng);
  }

  const params = new URLSearchParams({ format: 'jsonv2', lat: String(lat), lon: String(lng), addressdetails: '1' });
  const row = await getJson<NominatimRow>(`${NOMINATIM_URL}/reverse?${params}`);
  if (row) return fromNominatim(row, lat, lng);

  return { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, city: '', country: '', mapLocation: '' };
}

export async function searchOfficeLocations(query: string): Promise<OfficeGeoResult[]> {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];

  if (GEOAPIFY_API_KEY) {
    const params = new URLSearchParams({
      text: q,
      bias: 'countrycode:bd',
      limit: String(SUGGESTION_LIMIT),
      format: 'json',
      apiKey: GEOAPIFY_API_KEY,
    });
    const data = await getJson<{ results?: GeoapifyRow[] }>(`${GEOAPIFY_URL}/autocomplete?${params}`);
    const rows = (data?.results ?? []).filter((row) => typeof row.lat === 'number' && typeof row.lon === 'number');
    if (rows.length) return rows.map((row) => fromGeoapify(row, row.lat!, row.lon!));
  }

  const params = new URLSearchParams({ format: 'jsonv2', q, addressdetails: '1', limit: '5', countrycodes: 'bd' });
  let rows = (await getJson<NominatimRow[]>(`${NOMINATIM_URL}/search?${params}`)) ?? [];
  if (rows.length === 0) {
    params.delete('countrycodes');
    rows = (await getJson<NominatimRow[]>(`${NOMINATIM_URL}/search?${params}`)) ?? [];
  }

  return rows.flatMap((row) => {
    const lat = Number(row.lat);
    const lng = Number(row.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [fromNominatim(row, lat, lng)] : [];
  });
}

export function getCurrentBrowserLocation(): Promise<{ lat: number; lng: number }> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.reject(new Error('Geolocation is not supported by your browser.'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) => {
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: 'Location permission was denied. Please allow location access in your browser.',
          [error.POSITION_UNAVAILABLE]: 'Location information is currently unavailable.',
          [error.TIMEOUT]: 'The request to get your location timed out.',
        };
        reject(new Error(messages[error.code] ?? 'Unable to retrieve your location.'));
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 0 },
    );
  });
}
