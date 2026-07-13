import { Armchair, BarChart3, BookOpenCheck, CalendarDays, Gift, ScanLine, Sparkles } from "lucide-react";

const items = [
  { id: "checkin", labels: { zh: "智慧報到", en: "Smart check-in" }, icon: ScanLine },
  { id: "events", labels: { zh: "活動管理", en: "Events" }, icon: CalendarDays },
  { id: "materials", labels: { zh: "教材管理", en: "Materials" }, icon: BookOpenCheck, module: "materials" },
  { id: "seating", labels: { zh: "座位管理", en: "Seating" }, icon: Armchair, module: "seating" },
  { id: "benefits", labels: { zh: "早鳥福利", en: "Early-bird" }, icon: Gift, module: "earlyBird" },
  { id: "lottery", labels: { zh: "現場抽獎", en: "Lottery" }, icon: Sparkles, module: "lottery" },
  { id: "reports", labels: { zh: "數據報表", en: "Reports" }, icon: BarChart3, activeOnly: true },
];

export default function SidebarV2({ active, onChange, t, activeEvent, language }) {
  const hasActiveEvent = activeEvent?.lifecycle === "activated";
  const visibleItems = items.filter((item) => !item.module && !item.activeOnly || hasActiveEvent && (item.activeOnly || activeEvent.modules?.[item.module]));

  return <aside className="sidebar">
    <div className="sidebar-context"><span>{t("workspace")}</span><strong>{activeEvent?.title?.[language] || (language === "zh" ? "尚未選擇活動" : "No event selected")}</strong></div>
    <nav className="sidebar-nav" aria-label="Primary navigation">
      {visibleItems.map(({ id, labels, icon: Icon }) => <button key={id} type="button" className={`nav-button ${active === id ? "active" : ""}`} onClick={() => onChange(id)}><Icon size={19} strokeWidth={1.8} /><span>{labels[language]}</span></button>)}
    </nav>
    <div className="sidebar-footer"><span className="health-dot" /><div><strong>{language === "zh" ? "系統連線正常" : "System online"}</strong><span>RFID · QR</span></div></div>
  </aside>;
}
