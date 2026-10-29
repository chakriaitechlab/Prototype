export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="mt-1 flex" aria-live="polite" aria-label={`${name} is typing`}>
      <span className="inline-flex items-center gap-1 rounded-[18px] bg-[#f1f2f4] px-3.5 py-3">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-[#9199a3]" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
    </div>
  );
}
