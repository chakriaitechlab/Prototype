import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { profileApi } from '@/lib/profile';
import { requireDashboard } from '@/utils/session';
import { firstNameOf } from '@/utils/format';
import { UserAvatar } from '@/components/ui/UserAvatar';

const PROFILE_HREF = '/dashboard/seeker/profile';

export async function ProfileAlert() {
  const [{ name, avatarUrl }, completion] = await Promise.all([
    requireDashboard('SEEKER'),
    profileApi.completion().catch(() => null),
  ]);
  const complete = completion?.profileCompleted ?? false;
  const displayName = firstNameOf(name, 'Seeker');

  return (
    <div className={`cdash-profile-alert${complete ? ' cdash-profile-alert--complete' : ''}`} data-purpose="profile-alert">
      <div className="cdash-profile-alert-left">
        <UserAvatar
          src={avatarUrl}
          name={displayName}
          className="cdash-profile-alert-avatar"
          fallbackClassName="cdash-profile-alert-avatar--fallback"
        />
        <div>
          <h3>{complete ? 'Your profile is 100% complete!' : 'Your profile is not complete yet.'}</h3>
          <p>
            {complete
              ? 'Your profile is fully complete and visible to top employers.'
              : 'Complete your profile and build your custom resume.'}
          </p>
        </div>
      </div>
      <Link href={PROFILE_HREF} className="cdash-profile-alert-cta">
        {complete ? 'View Profile' : 'Your Profile'}
        <ArrowRight size={18} aria-hidden />
      </Link>
    </div>
  );
}
