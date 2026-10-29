export function DayDivider({ label }: { label: string }) {
  return (
    <div className="sticky top-2 z-[1] my-3 flex justify-center" role="separator">
      <span className="rounded-full bg-white/95 px-3 py-1 text-[11.5px] font-semibold text-[#5e6670] shadow-xs ring-1 ring-[#e4e5e8]" suppressHydrationWarning>
        {label}
      </span>
    </div>
  );
}
