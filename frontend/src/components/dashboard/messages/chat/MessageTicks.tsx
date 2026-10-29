import { AlertCircle, Check, CheckCheck, Clock } from 'lucide-react';
import type { MessageStatus } from '@/types/messages';

const LABELS: Record<MessageStatus, string> = {
  sending: 'Sending',
  failed: 'Not sent',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Seen',
};

export function MessageTicks({ status, onDark = false }: { status: MessageStatus; onDark?: boolean }) {
  const muted = onDark ? 'text-white/70' : 'text-[#9199a3]';
  const seen = onDark ? 'text-[#7fd3ff]' : 'text-[#0a65cc]';

  return (
    <span className="inline-flex shrink-0" title={LABELS[status]} aria-label={LABELS[status]}>
      {status === 'sending' && <Clock size={13} className={muted} aria-hidden />}
      {status === 'failed' && <AlertCircle size={14} className="text-rose-500" aria-hidden />}
      {status === 'sent' && <Check size={15} className={muted} aria-hidden />}
      {status === 'delivered' && <CheckCheck size={15} className={muted} aria-hidden />}
      {status === 'read' && <CheckCheck size={15} className={seen} aria-hidden />}
    </span>
  );
}
