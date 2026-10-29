import { Laptop, Smartphone } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import type { LoginSession } from '@/types/settings';

const isMobile = ({ device, userAgent }: LoginSession) =>
  /mobile/i.test(device) || /mobile/i.test(userAgent ?? '');

export function LoginSessions({ sessions }: { sessions: LoginSession[] }) {
  return (
    <section className="cset-section">
      <h3 className="cset-section-title">Active Login Sessions</h3>
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg max-w-2xl overflow-hidden bg-white">
        {sessions.length ? (
          sessions.map((session, index) => {
            const mobile = isMobile(session);
            const Icon = mobile ? Smartphone : Laptop;
            return (
              <div key={session.id} className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50/50">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-gray-100 text-gray-600">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {session.device || (mobile ? 'Mobile browser' : 'Desktop browser')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {session.ip || 'IP unavailable'} · {formatDateTime(session.createdAt)}
                    </p>
                  </div>
                </div>
                {index === 0 && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Current Session
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex items-center gap-3 p-4 text-sm text-gray-600">
            <Laptop size={18} /> Current web session{' '}
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
          </div>
        )}
      </div>
    </section>
  );
}
