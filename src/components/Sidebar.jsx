import { BarChart3, BookOpenCheck, CalendarDays, Gift, ScanLine, Settings, Armchair } from "lucide-react";

const items = [
  ["checkin", "navCheckin", ScanLine],
  ["events", "navEvents", CalendarDays],
  ["materials", "navMaterials", BookOpenCheck],
  ["seating", "navSeating", Armchair],
  ["benefits", "navBenefits", Gift],
  ["reports", "navReports", BarChart3],
  ["settings", "navSettings", Settings],
];

export default function Sidebar({ active, onChange, t }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-context">
        <span>{t("workspace")}</span>
        <strong>EventOps 01</strong>
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {items.map(([id, label, Icon]) => (
          <button key={id} type="button" className={`nav-button ${active === id ? "active" : ""}`} onClick={() => onChange(id)}>
            <Icon size={19} strokeWidth={1.8} />
            <span>{t(label)}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="health-dot" />
        <div><strong>System online</strong><span>RFID · QR</span></div>
      </div>
    </aside>
  );
}



