import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { ChakriBetaBadgeButton } from '@/components/ui/ChakriBetaBadge';
import type { AuthUser } from '@/types/auth';
import { formatPhone, phoneCountry } from '@/utils/phone';
import { DiamondChip } from '@/components/dashboard/DiamondChip';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { SeekerMenuButton } from './SeekerSidebar';
import { UserMenu } from './UserMenu';

export function SeekerNavbar({ user, profilePercent }: { user: AuthUser; profilePercent: number }) {
  const { name, email, avatarUrl, phoneNumber } = user;
  const country = phoneCountry(phoneNumber);

  return (
    <header className="cdash-header">
      <div className="cdash-mainnav">
        <div className="cdash-mainnav-inner">
          <div className="cdash-mainnav-left !gap-3 md:!gap-4">
            <div className="jp-logo jp-logo--with-beta cdash-logo !items-center [&.jp-logo--with-beta]:!gap-2.5 [&_.jp-logo-img]:!h-[36px] [&_.jp-logo-img]:!max-w-[130px] [&_.jp-logo-beta]:!h-[22px] [&_.jp-logo-beta]:!px-2.5 [&_.jp-logo-beta]:!text-[10.5px] [&_.jp-logo-beta]:!font-bold [&_.jp-logo-beta]:!leading-none">
              <Link href="/dashboard/seeker" className="jp-logo-link" aria-label="Chakri.ai home">
                <Image
                  src="/jobpilot/chakri-logo.png"
                  alt="Chakri.ai"
                  width={795}
                  height={221}
                  className="jp-logo-img jp-logo-img--md"
                  priority
                  loading="eager"
                />
              </Link>
              <ChakriBetaBadgeButton />
            </div>

            <div
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-none border border-slate-300 bg-white text-slate-800 shadow-2xs select-none cursor-default"
              title={`Country: ${country.name}`}
            >
              <span className="text-lg leading-none select-none" role="img" aria-label="Country flag">
                {country.flag}
              </span>
              <span className="text-sm font-semibold text-slate-800 tracking-tight">{country.name}</span>
            </div>
          </div>

          <div className="cdash-mainnav-right">
            {phoneNumber && (
              <div
                className="hidden sm:inline-flex items-center gap-2.5 h-9 px-3 rounded-none border border-slate-300 bg-white text-slate-800 shadow-2xs select-none cursor-default"
                title="Registered contact number"
              >
                <Phone className="w-4 h-4 text-[#0a65cc] shrink-0" aria-hidden />
                <span className="text-sm font-semibold text-slate-800 tracking-tight">{formatPhone(phoneNumber)}</span>
              </div>
            )}

            <Suspense fallback={null}>
              <DiamondChip audience="seeker" />
            </Suspense>

            <NotificationBell href="/dashboard/seeker/notifications" />

            <UserMenu name={name || 'Seeker'} email={email} avatarUrl={avatarUrl} profilePercent={profilePercent} />

            <SeekerMenuButton />
          </div>
        </div>
      </div>
    </header>
  );
}
