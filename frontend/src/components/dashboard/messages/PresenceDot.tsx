export function PresenceDot({ online, className = '' }: { online: boolean; className?: string }) {
  if (!online) return null;
  return <span className={`absolute rounded-full bg-[#31a24c] ring-2 ring-white ${className}`} aria-label="Active now" />;
}
