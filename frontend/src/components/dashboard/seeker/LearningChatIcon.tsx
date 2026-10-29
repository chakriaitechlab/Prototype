export function LearningChatIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <rect x="11.15" y="1.6" width="1.7" height="4.4" rx="0.85" />
      <rect x="7.05" y="3.05" width="1.45" height="3.35" rx="0.725" transform="rotate(-32 7.775 4.725)" />
      <rect x="15.5" y="3.05" width="1.45" height="3.35" rx="0.725" transform="rotate(32 16.225 4.725)" />
      <path d="M11.15 8.55C9.45 7.35 7.35 6.75 5.15 6.75 3.95 6.75 2.7 7.05 1.65 7.6v10.35c1.1-.6 2.4-.95 3.5-.95 2.05 0 3.9.65 6 1.85V8.55Z" />
      <path d="M12.85 8.55v10.3c2.1-1.2 3.95-1.85 6-1.85 1.1 0 2.4.35 3.5.95V7.6c-1.05-.55-2.3-.85-3.5-.85-2.2 0-4.3.6-6 1.8Z" />
    </svg>
  );
}
