import { Component, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3, Bell, CalendarDays, Check, ChevronDown, ClipboardList as ClipboardClock, Gift, Globe2,
  Languages, Menu, ScanLine, Sparkles, X,
} from "lucide-react";
import { useApp } from "./context.jsx";
import { languages, localize } from "./i18n.js";

const functionalityItems = [
  { id: "checkin", key: "navCheckin", icon: ScanLine },
];

export function Sidebar({ mobileOpen, onMobileClose }) {
  const { page, navigate, t, activeEvent } = useApp();
  const managementItems = [
    { id: "events", key: "navEvents", icon: CalendarDays },
    activeEvent?.modules?.earlyBird && { id: "earlybird", key: "navEarlyBird", icon: Gift },
    activeEvent?.modules?.lottery && { id: "lottery", key: "navLottery", icon: Sparkles },
    activeEvent?.modules?.survey && { id: "survey", key: "navSurvey", icon: ClipboardClock },
    { id: "reports", key: "navReports", icon: BarChart3 },
  ].filter(Boolean);
  const groups = [
    { label: "functionality", items: functionalityItems },
    { label: "management", items: managementItems },
  ];

  const go = (id) => {
    navigate(id);
    onMobileClose?.();
  };

  return <aside className={`ec-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
    <button className="sidebar-close" type="button" onClick={onMobileClose} aria-label="Close menu"><X size={20} /></button>
    <div className="sidebar-brand"><span className="brand-mark">E</span><div><strong>Event Check-In</strong><small>Operations console</small></div></div>
    <nav className="sidebar-groups" aria-label="Primary navigation">
      {groups.map((group) => <section key={group.label}>
        <h2>{t(group.label)}</h2>
        {group.items.map(({ id, key, icon: Icon }) => <button key={id} type="button" className={page === id ? "active" : ""} onClick={() => go(id)}>
          <Icon size={18} strokeWidth={1.8} /><span>{t(key)}</span>
        </button>)}
      </section>)}
    </nav>
    <div className="system-health"><span /><div><strong>{t("systemOnline")}</strong><small>LMS · Email · RFID</small></div></div>
  </aside>;
}

export function Topbar({ onMenu }) {
  const { language, setLanguage, t, currentUser } = useApp();
  const [languageOpen, setLanguageOpen] = useState(false);
  const languagePickerRef = useRef(null);
  const currentLanguage = languages.find((item) => item.id === language) || languages[0];

  useEffect(() => {
    const closeOnOutsidePress = (event) => {
      if (!languagePickerRef.current?.contains(event.target)) setLanguageOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, []);

  return <header className="ec-topbar">
    <button className="mobile-menu" type="button" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button>
    <div className="topbar-title"><span>{t("product")}</span><small>{t("caption")}</small></div>
    <div className="topbar-actions">
      <div className="language-picker" ref={languagePickerRef}>
        <button className="language-select" type="button" aria-haspopup="listbox" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>
          <Languages size={17} /><span>{currentLanguage.label}</span><ChevronDown className={languageOpen ? "open" : ""} size={15} />
        </button>
        {languageOpen && <div className="language-menu" role="listbox" aria-label={t("language")}>
          {languages.map((item) => <button key={item.id} type="button" role="option" aria-selected={item.id === language} className={item.id === language ? "selected" : ""} onClick={() => { setLanguage(item.id); setLanguageOpen(false); }}>
            <span>{item.short || item.id}</span><strong>{item.label}</strong>{item.id === language && <Check size={16} />}
          </button>)}
        </div>}
      </div>
      <div className="profile"><span>{currentUser.initials}</span><div><strong>{localize(currentUser.name, language)}</strong><small>{t("operator")}</small></div></div>
    </div>
  </header>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return <div className="page-header"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function Notice() {
  const { notice, setNotice } = useApp();
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice, setNotice]);
  if (!notice) return null;
  return <div className={"notice " + (notice.tone || "info")} role="status"><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)}><X size={16} /></button></div>;
}

export function Modal({ open, title, children, onClose, actions, wide = false }) {
  if (!open) return null;
  // Rendered through a portal: the page transition animates a transform, which would
  // otherwise make this fixed overlay resolve against the page instead of the viewport.
  return createPortal(<div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
    <section className={wide ? "modal wide" : "modal"} role="dialog" aria-modal="true" aria-label={title}>
      <header><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></header>
      <div className="modal-body">{children}</div>
      {actions && <footer>{actions}</footer>}
    </section>
  </div>, document.body);
}

export function EmptyState({ icon: Icon = Globe2, title, description }) {
  return <div className="empty-state"><span><Icon size={25} /></span><strong>{title}</strong>{description && <p>{description}</p>}</div>;
}

export function LoadingButton({ loading, children, ...props }) {
  return <button {...props} disabled={loading || props.disabled}>{loading ? <span className="button-spinner" /> : children}</button>;
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Event Check-In UI error", error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="fatal-error"><span>!</span><h1>Event Check-In</h1><p>{this.state.error.message}</p><button type="button" onClick={() => window.location.reload()}>Reload</button></main>;
  }
}

export function EventBadge({ event }) {
  const { t } = useApp();
  return <span className={`status-badge ${event.status}`}>{t(event.status)}</span>;
}

export function EventMeta({ event }) {
  const { language, t } = useApp();
  return <div className="event-meta">
    <span><CalendarDays size={15} />{event.date} · {event.startTime}–{event.endTime}</span>
    <span><Globe2 size={15} />{localize(event.location, language)}</span>
    <span>{t("capacity")} {event.capacity}</span>
  </div>;
}

export function KpiCards({ values }) {
  const { t } = useApp();
  const cards = [
    ["expected", values.expected, CalendarDays],
    ["arrived", values.arrived, ScanLine],
    ["needsAction", values.needsAction, Bell],
    ["attendanceRate", `${values.attendanceRate}%`, BarChart3],
  ];
  return <div className="kpi-grid">{cards.map(([key, value, Icon]) => <article key={key}><span><Icon size={19} /></span><div><small>{t(key)}</small><strong>{value}</strong></div></article>)}</div>;
}

export function useEventOptions(events) {
  return useMemo(() => {
    const categories = [...new Set(events.map((event) => event.category))];
    const statuses = [...new Set(events.map((event) => event.status))];
    return { categories, statuses };
  }, [events]);
}
