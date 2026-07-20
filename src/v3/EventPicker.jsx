import { useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Filter, Search, X } from "lucide-react";
import { useApp } from "./context.jsx";
import { categoryLabels } from "./data.js";
import { filterEvents } from "./domain.js";
import { localize } from "./i18n.js";
import "./event-picker.css";

const initialFilters = { query: "", source: "all", category: "all", status: "all", month: "", dateFrom: "", dateTo: "" };

export function EventPicker({ module, includeHistory = false, value, onChange }) {
  const { events, activeEventId, selectActiveEvent, language, t } = useApp();
  const detailsRef = useRef(null);
  const [filters, setFilters] = useState(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selectedId = value ?? activeEventId;
  const choose = onChange || selectActiveEvent;
  const eligible = useMemo(() => filterEvents(events, { module, includeHistory }), [events, includeHistory, module]);
  const selected = eligible.find((event) => event.id === selectedId) || null;
  const result = useMemo(() => {
    try {
      return { events: filterEvents(events, { ...filters, module, includeHistory }), error: null };
    } catch (error) {
      return { events: [], error: error.message };
    }
  }, [events, filters, includeHistory, module]);
  const options = useMemo(() => ({
    categories: [...new Set(eligible.map((event) => event.category).filter(Boolean))],
    statuses: [...new Set(eligible.map((event) => event.status).filter(Boolean))],
    months: [...new Set(eligible.map((event) => String(event.date || "").slice(0, 7)).filter(Boolean))].sort(),
  }), [eligible]);
  const update = (key, nextValue) => setFilters((current) => ({ ...current, [key]: nextValue }));
  const clear = () => setFilters(initialFilters);
  const select = (eventId) => {
    choose(eventId);
    detailsRef.current?.removeAttribute("open");
  };

  return <details className="event-picker" ref={detailsRef}>
    <summary>
      <span><CalendarDays size={15} />{includeHistory ? t("selectHistory") : t("browseEvents")}</span>
      <strong>{selected ? localize(selected.title, language) : t("selectEventPrompt")}</strong>
      <ChevronDown size={15} />
    </summary>
    <div className="event-picker-popover">
      <div className="event-picker-search">
        <label className="search-field"><Search size={16} /><input value={filters.query} onChange={(event) => update("query", event.target.value)} placeholder={t("searchEvent")} autoFocus /></label>
        <button type="button" className={filtersOpen ? "filter-toggle active" : "filter-toggle"} onClick={() => setFiltersOpen((current) => !current)} aria-expanded={filtersOpen}><Filter size={15} />{t("filters")}</button>
      </div>
      {filtersOpen && <div className="event-picker-filters">
        <select value={filters.source} onChange={(event) => update("source", event.target.value)} aria-label={t("allSources")}><option value="all">{t("allSources")}</option><option value="lms">{t("sourceLms")}</option><option value="self">{t("sourceSelf")}</option></select>
        <select value={filters.category} onChange={(event) => update("category", event.target.value)} aria-label={t("allTypes")}><option value="all">{t("allTypes")}</option>{options.categories.map((category) => <option key={category} value={category}>{localize(categoryLabels[category], language)}</option>)}</select>
        <select value={filters.status} onChange={(event) => update("status", event.target.value)} aria-label={t("allStatuses")}><option value="all">{t("allStatuses")}</option>{options.statuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select>
        <select value={filters.month} onChange={(event) => update("month", event.target.value)} aria-label={t("eventMonth")}><option value="">{t("allMonths")}</option>{options.months.map((month) => <option key={month} value={month}>{month}</option>)}</select>
        <label><span>{t("dateFrom")}</span><input type="date" value={filters.dateFrom} onChange={(event) => update("dateFrom", event.target.value)} /></label>
        <label><span>{t("dateTo")}</span><input type="date" value={filters.dateTo} onChange={(event) => update("dateTo", event.target.value)} /></label>
      </div>}
      <div className="event-picker-result-heading"><span>{result.events.length} {t("eventsUnit")}</span><button type="button" onClick={clear}><X size={13} />{t("clearFilters")}</button></div>
      {result.error ? <p className="event-picker-error">{t("invalidDateRange")}</p> : <div className="event-picker-results">
        {result.events.length ? result.events.map((event) => <button type="button" key={event.id} className={event.id === selectedId ? "selected" : ""} onClick={() => select(event.id)}>
          <span>{event.date}<small>{event.source === "lms" ? t("sourceLms") : t("sourceSelf")}</small></span>
          <strong>{localize(event.title, language)}</strong>
          <small>{localize(categoryLabels[event.category], language)} · {event.startTime}–{event.endTime}</small>
        </button>) : <p className="event-picker-empty">{t("empty")}</p>}
      </div>}
    </div>
  </details>;
}
