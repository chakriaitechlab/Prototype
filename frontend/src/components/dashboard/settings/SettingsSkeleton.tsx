export function SettingsSkeleton() {
  return (
    <section className="cset-section" aria-busy="true">
      <div className="cset-privacy-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="cset-privacy-card h-[76px] animate-pulse" />
        ))}
      </div>
    </section>
  );
}
