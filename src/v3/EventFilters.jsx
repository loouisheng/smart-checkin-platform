import { CalendarDays } from "lucide-react";
import { useApp } from "./context.jsx";
import { todayIso } from "./domain.js";
import "./filters.css";

export function createEventFilters(overrides = {}) {
  return { query: "", source: "all", category: "all", status: "all", learningMode: "all", date: todayIso(), ...overrides };
}

/** Single day picker that defaults to today; the button switches between "today" and "all dates". */
export function EventDateFilter({ value, onChange, compact = false }) {
  const { t } = useApp();
  const today = todayIso();
  return <div className={compact ? "date-filter compact" : "date-filter"}>
    <span><CalendarDays size={12} />{t("filterDate")}</span>
    <div className="date-filter-control">
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} aria-label={t("filterDate")} />
      <button type="button" className={value ? "" : "active"} onClick={() => onChange(value ? "" : today)}>
        {value ? t("allDates") : t("today")}
      </button>
    </div>
  </div>;
}
