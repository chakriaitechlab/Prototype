import Link from 'next/link';
import { ArrowRight, Bookmark, Clock, Loader2, MessageSquare } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { FavoriteItem } from '@/types/favorites';
import { formatDate } from '@/utils/format';
import { candidateProfilePath, chatPath } from '@/utils/routes';
import { FavoriteMenu } from './FavoriteMenu';

interface FavoriteCardProps {
  item: FavoriteItem;
  removing: boolean;
  onRemove: () => void;
}

export function FavoriteCard({ item, removing, onRemove }: FavoriteCardProps) {
  const { candidateId, name, title, username, avatarUrl, createdAt } = item;
  const href = candidateProfilePath(username);
  const messageHref = chatPath('RECRUITER', username ?? candidateId);

  return (
    <article className="group relative flex flex-col justify-between border border-[#e4e5e8] bg-white p-4 transition-all duration-200 hover:border-[#0a65cc] hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start gap-3">
          <Link href={href} className="shrink-0" tabIndex={-1}>
            <UserAvatar
              src={avatarUrl}
              name={name}
              className="h-11 w-11 border border-[#e4e5e8] text-base font-bold shadow-2xs"
              fallbackClassName="bg-gradient-to-br from-[#0a65cc] to-[#084f9e] text-white"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={href} className="block">
              <h2 className="truncate text-sm font-bold text-[#18191c] transition-colors group-hover:text-[#0a65cc]">
                {name}
              </h2>
            </Link>
            <p className="mt-0.5 truncate text-xs text-[#5e6670]" title={title}>
              {title}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center border border-[#0a65cc]/25 bg-[#e7f0fa] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#0a65cc]">
                Job seeker
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="shrink-0 border border-[#e4e5e8] p-1.5 text-[#0a65cc] transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            aria-label={`Remove ${name} from saved candidates`}
            title="Remove from saved"
          >
            {removing ? (
              <Loader2 size={16} className="animate-spin text-[#767f8c]" aria-hidden />
            ) : (
              <Bookmark size={16} fill="currentColor" aria-hidden />
            )}
          </button>
        </div>

        <div className="mb-3 flex items-center gap-1.5 text-[11px] text-[#767f8c]">
          <Clock size={12} className="shrink-0 text-[#9199a3]" aria-hidden />
          <span>Saved on {formatDate(createdAt)}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-[#f1f2f4] pt-3">
        <Link
          href={href}
          className="jp-btn jp-btn--primary h-8! flex-1 border-[#0a65cc]! px-3! text-xs!"
        >
          <span>View Profile</span>
          <ArrowRight size={13} aria-hidden />
        </Link>
        <Link
          href={messageHref}
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#e4e5e8] text-[#5e6670] transition-colors hover:border-[#0a65cc]/50 hover:bg-[#e7f0fa] hover:text-[#0a65cc]"
          title={`Message ${name}`}
          aria-label={`Message ${name}`}
        >
          <MessageSquare size={14} aria-hidden />
        </Link>
        <FavoriteMenu name={name} profileHref={href} messageHref={messageHref} onRemove={onRemove} />
      </div>
    </article>
  );
}
