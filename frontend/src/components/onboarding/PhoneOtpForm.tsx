import Link from 'next/link';
import { OtpForm } from '@/components/ui/OtpForm';
import { resendPhoneOtpAction, verifyPhoneOtpAction } from '@/actions/onboarding.actions';

function toLocalNumber(phoneNumber: string) {
  if (phoneNumber.startsWith('880')) return `0${phoneNumber.slice(3)}`;
  if (phoneNumber.startsWith('91') && phoneNumber.length === 12) return phoneNumber.slice(2);
  return phoneNumber;
}

export function PhoneOtpForm({ phoneNumber, changeHref }: { phoneNumber: string; changeHref: string }) {
  return (
    <OtpForm
      title="Enter WhatsApp OTP"
      description={
        <>
          We sent a 6-digit verification code to <strong>{toLocalNumber(phoneNumber)}</strong> via WhatsApp.{' '}
          <Link href={changeHref} className="jp-link">
            Change
          </Link>
        </>
      }
      submitLabel="Verify & Continue"
      timerLabel="Resend in"
      fields={{ phoneNumber }}
      action={verifyPhoneOtpAction}
      resend={resendPhoneOtpAction.bind(null, phoneNumber)}
    />
  );
}
