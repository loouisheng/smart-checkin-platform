import { useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, FileSpreadsheet, Filter, Search, X } from "lucide-react";
import { useApp } from "./context.jsx";
import { categoryLabels, currentUser } from "./data.js";
import { filterEvents, shiftIsoDate, todayIso } from "./domain.js";
import { localize } from "./i18n.js";
import { createEventFilters, EventDateFilter } from "./EventFilters.jsx";
import "./event-picker.css";

/**
 * Event chooser for the module pages. With `onExport` it also becomes the place to
 * pick several events — by hand or by date range — and pull their reports at once.
 */
export function EventPicker({ module, value, onChange, onExport }) {
  const { events, activeEventId, selectActiveEvent, language, t } = useApp();
  const detailsRef = useRef(null);
  const [filters, setFilters] = useState(() => createEventFilters(onExport ? { date: "", dateFrom: shiftIsoDate(todayIso(), -14), dateTo: todayIso() } : {}));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedId = value ?? activeEventId;
  const choose = onChange || selectActiveEvent;
  const eligible = useMemo(() => filterEvents(events, { module, ownerId: currentUser.id }), [events, module]);
  const selected = eligible.find((event) => event.id === selectedId) || null;
  const results = useMemo(() => filterEvents(events, { ...filters, module, ownerId: currentUser.id }), [events, filters, module]);
  const options = useMemo(() => ({
    categories: [...new Set(eligible.map((event) => event.category).filter(Boolean))],
    statuses: [...new Set(eligible.map((event) => event.status).filter(Boolean))],
  }), [eligible]);
  const update = (key, nextValue) => setFilters((current) => ({ ...current, [key]: nextValue }));
  const invalidRange = Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo);
  const checked = results.filter((event) => selectedIds.has(event.id));
  // Nothing ticked means "everything the current filters show".
  const exportTargets = checked.length ? checked : results;

  const select = (eventId) => {
    choose(eventId);
    detailsRef.current?.removeAttribute("open");
  };

  const toggleSelected = (eventId, isChecked) => setSelectedIds((current) => {
    const next = new Set(current);
    if (isChecked) next.add(eventId);
    else next.delete(eventId);
    return next;
  });

  const toggleAll = (isChecked) => setSelectedIds(isChecked ? new Set(results.map((event) => event.id)) : new Set());

  return <details className="event-picker" ref={detailsRef}>
    <summary>
      <span><CalendarDays size={15} />{t("browseEvents")}</span>
      <strong>{selected ? localize(selected.title, language) : t("selectEventPrompt")}</strong>
      <ChevronDown size={15} />
    </summary>
    <div className="event-picker-popover">
      <div className="event-picker-search">
        <label className="search-field"><Search size={16} /><input value={filters.query} onChange={(event) => update("query", event.target.value)} placeholder={t("searchEvent")} autoFocus /></label>
        <button type="button" className={filtersOpen ? "filter-toggle active" : "filter-toggle"} onClick={() => setFiltersOpen((current) => !current)} aria-expanded={filtersOpen}><Filter size={15} />{t("filters")}</button>
      </div>
      {onExport
        ? <div className="event-picker-range">
          <label><span>{t("rangeFrom")}</span><input type="date" value={filters.dateFrom} onChange={(event) => update("dateFrom", event.target.value)} /></label>
          <label><span>{t("rangeTo")}</span><input type="date" value={filters.dateTo} onChange={(event) => update("dateTo", event.target.value)} /></label>
        </div>
        : <div className="event-picker-date"><EventDateFilter value={filters.date} onChange={(nextValue) => update("date", nextValue)} /></div>}
      {filtersOpen && <div className="event-picker-filters">
        <select value={filters.source} onChange={(event) => update("source", event.target.value)} aria-label={t("allSources")}><option value="all">{t("allSources")}</option><option value="lms">{t("sourceLms")}</option><option value="self">{t("sourceSelf")}</option></select>
        <select value={filters.category} onChange={(event) => update("category", event.target.value)} aria-label={t("allTypes")}><option value="all">{t("allTypes")}</option>{options.categories.map((category) => <option key={category} value={category}>{localize(categoryLabels[category], language)}</option>)}</select>
        <select value={filters.status} onChange={(event) => update("status", event.target.value)} aria-label={t("allStatuses")}><option value="all">{t("allStatuses")}</option>{options.statuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select>
      </div>}
      <div className="event-picker-result-heading">
        <span>{results.length} {t("eventsUnit")}{checked.length ? ` · ${checked.length} ${t("selectedCount")}` : ""}</span>
        <button type="button" onClick={() => { setFilters(createEventFilters(onExport ? { date: "", dateFrom: "", dateTo: "" } : { date: "" })); setSelectedIds(new Set()); }}><X size={13} />{t("clearFilters")}</button>
      </div>
      {invalidRange && <p className="event-picker-error">{t("invalidDateRange")}</p>}
      {onExport && results.length > 0 && <label className="event-picker-select-all">
        <input type="checkbox" checked={checked.length === results.length && results.length > 0} onChange={(event) => toggleAll(event.target.checked)} />
        <span>{t("selectAllEvents")}</span>
      </label>}
      <div className="event-picker-results">
        {results.length ? results.map((event) => <div className={`event-picker-row ${event.id === selectedId ? "selected" : ""}`} key={event.id}>
          {onExport && <input type="checkbox" checked={selectedIds.has(event.id)} aria-label={localize(event.title, language)} onChange={(change) => toggleSelected(event.id, change.target.checked)} />}
          <button type="button" onClick={() => select(event.id)}>
            <span>{event.date}<small>{event.source === "lms" ? t("sourceLms") : t("sourceSelf")}</small></span>
            <strong>{localize(event.title, language)}</strong>
            <small>{localize(categoryLabels[event.category], language)} · {event.startTime}–{event.endTime}</small>
          </button>
        </div>) : <p className="event-picker-empty">{t("empty")}</p>}
      </div>
      {onExport && <div className="event-picker-export">
        <small>{t("rangeExportHint")}</small>
        <button className="primary-button" type="button" disabled={!exportTargets.length || invalidRange} onClick={() => onExport(exportTargets, { from: filters.dateFrom, to: filters.dateTo })}>
          <FileSpreadsheet size={15} />{t("rangeExport")} ({exportTargets.length})
        </button>
      </div>}
    </div>
  </details>;
}
