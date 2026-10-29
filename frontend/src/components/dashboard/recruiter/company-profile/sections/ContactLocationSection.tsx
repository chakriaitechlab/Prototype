'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import type { ActionState, AuthUser } from '@/types/auth';
import type { OfficeGeoResult } from '@/types/company';
import { getCurrentBrowserLocation, reverseGeocodeOffice } from '@/utils/office-geo';
import { phoneCountry } from '@/utils/phone';
import { AccountStatusPill } from '../AccountStatusPill';
import { OfficeLocationMap } from '../OfficeLocationMap';
import { OfficeLocationSearch } from '../OfficeLocationSearch';
import type { CompanyEditor } from '../use-company-editor';

const DEFAULT_COUNTRY = 'Bangladesh';

interface ContactLocationSectionProps {
  editor: CompanyEditor;
  user: AuthUser;
  isVerified: boolean;
  onNotify: (state: ActionState) => void;
}

function ManagedLabel({ label, verified, show }: { label: string; verified: boolean; show: boolean }) {
  return (
    <label className="cset-label flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {show && <AccountStatusPill verified={verified} />}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-normal text-[#767f8c]">
        <Lock size={12} /> Managed by account
      </span>
    </label>
  );
}

export function ContactLocationSection({ editor, user, isVerified, onNotify }: ContactLocationSectionProps) {
  const { draft, patch } = editor;
  const [locating, setLocating] = useState(false);
  const { dialCode } = phoneCountry(user.phoneNumber);
  const localNumber = user.phoneNumber?.slice(dialCode.length) ?? '';

  const applyGeo = (result: OfficeGeoResult) =>
    patch({
      lat: result.lat,
      lng: result.lng,
      address: result.address,
      city: result.city,
      country: result.country || DEFAULT_COUNTRY,
      mapLocation: result.mapLocation || result.address,
    });

  const selectLocation = (result: OfficeGeoResult) => {
    applyGeo(result);
    onNotify({ message: `Selected: ${result.mapLocation || result.city || result.address}` });
  };

  const locateMe = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getCurrentBrowserLocation();
      applyGeo(await reverseGeocodeOffice(lat, lng));
      onNotify({ message: 'Your current location has been selected!' });
    } catch (err) {
      onNotify({ error: err instanceof Error ? err.message : 'Could not detect your current location' });
    } finally {
      setLocating(false);
    }
  };

  return (
    <section className="cset-section cset-section--ruled">
      <h3 className="cset-section-title">Office &amp; Contact Details</h3>
      <div className="cset-stack">
        <OfficeLocationSearch
          value={draft.mapLocation}
          onChange={(mapLocation) => patch({ mapLocation })}
          onSelect={selectLocation}
          onNotFound={() => onNotify({ error: 'Could not find that location' })}
        />

        <OfficeLocationMap
          lat={draft.lat}
          lng={draft.lng}
          onPick={applyGeo}
          onLocateMe={() => void locateMe()}
          locating={locating}
        />

        <div>
          <label className="cset-label">Office Address</label>
          <textarea
            className="cset-input cco-address"
            rows={3}
            placeholder="Full office address"
            value={draft.address}
            onChange={(e) => patch({ address: e.target.value })}
          />
        </div>

        <div>
          <ManagedLabel label="Phone" verified={user.phoneVerified} show={Boolean(localNumber)} />
          <div className="cset-phone">
            <div className="cset-phone-code cursor-not-allowed">
              <svg viewBox="0 0 20 14" width="18" height="13" aria-hidden>
                <rect width="20" height="14" fill="#006a4e" />
                <circle cx="9" cy="7" r="4" fill="#f42a41" />
              </svg>
              +{dialCode}
            </div>
            <input
              className="cset-phone-input cursor-not-allowed"
              type="tel"
              disabled
              readOnly
              placeholder="Phone number..."
              value={localNumber}
            />
          </div>
        </div>

        <div>
          <ManagedLabel label="Email" verified={user.emailVerified} show />
          <div className="cset-input-wrap">
            <span className="cset-input-icon text-[#767f8c]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            <input
              className="cset-input cset-input--with-icon"
              type="email"
              disabled
              readOnly
              placeholder="Email address"
              value={user.email}
            />
          </div>
        </div>

        {!isVerified && (
          <>
            <div>
              <label className="cset-label">Trade license no.</label>
              <input
                className="cset-input"
                value={draft.tradeLicense}
                onChange={(e) => patch({ tradeLicense: e.target.value })}
              />
            </div>
            <div>
              <label className="cset-label">RL no. (agencies)</label>
              <input className="cset-input" value={draft.rlNo} onChange={(e) => patch({ rlNo: e.target.value })} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
