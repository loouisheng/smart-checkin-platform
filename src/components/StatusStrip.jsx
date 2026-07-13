export default function StatusStrip({ stats, t, allowReentry }) {
  const items = [
    [t("arrived"), `${stats.arrived} / ${stats.expected}`],
    [t("unresolved"), stats.unresolved],
    [t("openSeats"), stats.openSeats],
    [allowReentry ? t("entries") : t("expected"), allowReentry ? stats.entries : stats.expected],
  ];

  return (
    <section className="status-strip" aria-label="Live status">
      {items.map(([label, value], index) => (
        <div className="status-cell" key={label}>
          <span className={`status-marker marker-${index}`} />
          <div><small>{label}</small><strong>{value}</strong></div>
        </div>
      ))}
    </section>
  );
}
