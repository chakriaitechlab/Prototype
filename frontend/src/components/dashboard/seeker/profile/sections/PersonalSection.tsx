'use client';

import { useRef, useTransition } from 'react';
import { BadgeCheck, Loader2, Mail, MapPin, Phone, Upload } from 'lucide-react';
import { uploadAvatarAction } from '@/actions/profile.actions';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { ActionState, AuthUser } from '@/types/auth';
import type { Availability, ProfileCompletion } from '@/types/profile';
import { formatPhone, phoneCountry } from '@/utils/phone';
import { AVAILABILITY_OPTIONS, availabilityLabel } from '@/utils/profile';
import type { ProfileEditor } from '../use-profile-editor';

interface PersonalSectionProps {
  editor: ProfileEditor;
  user: AuthUser;
  completion?: ProfileCompletion | null;
  onNotify: (state: ActionState) => void;
}

function VerifiedBadge() {
  return <BadgeCheck className="w-3.5 h-3.5 shrink-0" fill="#0a65cc" stroke="#ffffff" strokeWidth={2.2} />;
}

function VerifiedPill() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0a65cc] bg-[#edf5fd] px-2 py-0.5 rounded-full" title="Verified">
      <VerifiedBadge />
      Verified
    </span>
  );
}

export function PersonalSection({ editor, user, completion, onNotify }: PersonalSectionProps) {
  const { draft, update } = editor;
  const avatarRef = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();

  const isEmailVerified = completion ? completion.emailVerified : user.emailVerified;
  const isPhoneVerified = completion ? completion.phoneVerified : user.phoneVerified;

  const displayName = draft.fullName.trim() || 'Your name';
  const country = phoneCountry(user.phoneNumber);
  const localNumber = user.phoneNumber?.slice(country.dialCode.length) ?? '';

  const uploadAvatar = (file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    startUpload(async () => onNotify(await uploadAvatarAction(formData)));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-7 border-b border-[#e4e5e8]">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <UserAvatar
            src={user.avatarUrl}
            name={displayName}
            className="h-[104px] w-[104px] rounded-full text-3xl font-bold"
            fallbackClassName="bg-[#e7f0fa] text-[#0a65cc]"
          />
          <input
            ref={avatarRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              uploadAvatar(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[4px] border border-[#e4e5e8] bg-white hover:bg-[#f1f2f4] text-[#18191c] transition cursor-pointer"
            onClick={() => avatarRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a65cc]" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#5e6670]" />
            )}
            Change photo
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#18191c]">{displayName}</h2>
          {user.username && <p className="text-sm font-semibold text-[#0a65cc] mt-0.5">@{user.username}</p>}
          <p className="text-sm text-[#5e6670] mt-1">{draft.headline.trim() || 'Add a professional headline below'}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            {draft.location.trim() && (
              <span className="inline-flex items-center gap-1.5 bg-[#f1f2f4] text-[#474c54] font-medium text-xs px-2.5 py-1 rounded-[4px]">
                <MapPin className="w-3.5 h-3.5 text-[#5e6670]" />
                {draft.location}
              </span>
            )}
            <span className="inline-flex items-center bg-[#e7f0fa] text-[#0a65cc] font-semibold text-xs px-2.5 py-1 rounded-[4px]">
              {availabilityLabel(draft.availability)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-[#5e6670]">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#767f8c]" />
              {user.email}
              {isEmailVerified && <VerifiedBadge />}
            </span>
            {user.phoneNumber && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#767f8c]" />
                {formatPhone(user.phoneNumber)}
                {isPhoneVerified && <VerifiedBadge />}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <h3 className="cset-section-title">Basic Information</h3>
        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          <div>
            <label className="cset-label" htmlFor="profile-full-name">Full Name</label>
            <input
              id="profile-full-name"
              className="cset-input"
              placeholder="Your full name"
              type="text"
              maxLength={120}
              value={draft.fullName}
              onChange={(e) => update('fullName', e.target.value)}
            />
          </div>

          <div>
            <label className="cset-label" htmlFor="profile-username">Username</label>
            <input id="profile-username" className="cset-input" value={user.username ?? ''} placeholder="Not set" disabled />
            {user.username && (
              <p className="text-xs text-[#767f8c] mt-1.5">
                Your profile address is <span className="font-semibold text-[#18191c]">/{user.username}</span>
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="cset-label" htmlFor="profile-headline">Professional Headline</label>
            <input
              id="profile-headline"
              className="cset-input"
              placeholder="e.g. Senior Full-Stack Engineer · Next.js, Node.js & React"
              type="text"
              maxLength={140}
              value={draft.headline}
              onChange={(e) => update('headline', e.target.value)}
            />
          </div>

          <div>
            <label className="cset-label" htmlFor="profile-location">Location</label>
            <input
              id="profile-location"
              className="cset-input"
              placeholder="Dhaka, Bangladesh · Remote"
              type="text"
              maxLength={120}
              value={draft.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>

          <div>
            <label className="cset-label" htmlFor="profile-availability">Availability</label>
            <select
              id="profile-availability"
              className="cset-input cset-select"
              value={draft.availability}
              onChange={(e) => update('availability', e.target.value as Availability)}
            >
              {AVAILABILITY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#e4e5e8]">
        <h3 className="text-base font-semibold text-[#18191c] mb-1 flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#0a65cc]" />
          Contact Information
        </h3>
        <p className="text-xs text-[#767f8c] mb-5">Used for verified applications and job recruiter communication.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="cset-label flex items-center gap-1.5" htmlFor="profile-email">
              <span>Email Address</span>
              {isEmailVerified && <VerifiedPill />}
            </label>
            <input id="profile-email" className="cset-input" type="email" value={user.email} disabled />
          </div>

          <div>
            <label className="cset-label flex items-center gap-1.5" htmlFor="profile-phone">
              <span>Mobile Number</span>
              {isPhoneVerified && user.phoneNumber && <VerifiedPill />}
            </label>
            <div className="flex gap-2">
              <select className="cset-input cset-select !w-[130px] shrink-0" value={country.dialCode} disabled aria-label="Country code">
                <option value={country.dialCode}>{`${country.flag} ${country.name} (+${country.dialCode})`}</option>
              </select>
              <input id="profile-phone" className="cset-input flex-1" type="tel" value={localNumber} placeholder="Not set" disabled />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
