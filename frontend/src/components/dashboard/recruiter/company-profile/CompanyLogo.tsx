'use client';

import { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LOGO_ACCEPT } from '@/utils/company-profile';

interface CompanyLogoProps {
  logoUrl: string | null;
  name: string;
  uploading: boolean;
  onUpload: (file: File) => void;
}

export function CompanyLogo({ logoUrl, name, uploading, onUpload }: CompanyLogoProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative inline-flex items-center justify-center">
      <div className="relative rounded-full bg-white p-1 shadow-xl ring-4 ring-white">
        <UserAvatar
          src={logoUrl}
          name={name}
          className="h-[124px] w-[124px] rounded-full text-4xl font-bold"
          fallbackClassName="bg-[#e7f0fa] text-[#0a65cc]"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={LOGO_ACCEPT}
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Update company logo"
        aria-label="Change company logo"
        className="absolute bottom-1 right-1 flex cursor-pointer items-center justify-center rounded-full border border-[#ccd0d5] bg-[#f0f2f5] p-2.5 text-[#050505] shadow-md ring-2 ring-white transition hover:bg-[#e4e6eb] active:scale-95"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[#0a65cc]" /> : <Camera className="h-4 w-4 text-[#050505]" />}
      </button>
    </div>
  );
}
