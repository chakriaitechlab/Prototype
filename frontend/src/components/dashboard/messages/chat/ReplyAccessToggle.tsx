import { Loader2, MessageSquareOff, MessageSquareText } from 'lucide-react';

interface ReplyAccessToggleProps {
  replyAccess: boolean;
  pending: boolean;
  className: string;
  onToggle: () => void;
}

export function ReplyAccessToggle({ replyAccess, pending, className, onToggle }: ReplyAccessToggleProps) {
  const Icon = pending ? Loader2 : replyAccess ? MessageSquareOff : MessageSquareText;

  return (
    <button type="button" onClick={onToggle} disabled={pending} className={className}>
      <Icon size={15} className={pending ? 'animate-spin' : undefined} aria-hidden />
      {replyAccess ? 'Turn off replies' : 'Allow replies'}
    </button>
  );
}
