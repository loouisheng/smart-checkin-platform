import { useMemo, useState } from "react";
import {
  ArrowLeft, BadgeCheck, CheckCircle2, Clock3, Nfc as Contactless, Filter, Keyboard, LogIn, LogOut, MapPin, Radio, Search,
  TimerReset, UserRound, Users, XCircle,
} from "lucide-react";
import { useApp } from "./context.jsx";
import { filterEvents, getRecord } from "./domain.js";
import { formatDate, localize } from "./i18n.js";
import { EmptyState, EventBadge, EventMeta, PageHeader, useEventOptions } from "./Shell.jsx";
import { createEventFilters, EventDateFilter } from "./EventFilters.jsx";
import { categoryLabels, currentUser } from "./data.js";

function EventSelection() {
  const { events, language, t, openCheckin, selectActiveEvent, activeEventId } = useApp();
  const [filters, setFilters] = useState(createEventFilters);
  const [selectedId, setSelectedId] = useState(activeEventId);
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const available = useMemo(() => events.filter((event) => event.lifecycle === "activated" && ["live", "upcoming"].includes(event.status)), [events]);
  const { categories } = useEventOptions(available);
  const filtered = useMemo(() => filterEvents(available, { ...filters, ownerId: currentUser.id }), [available, filters]);
  const selected = available.find((event) => event.id === selectedId) || null;

  const choose = (event) => {
    setSelectedId(event.id);
    selectActiveEvent(event.id);
  };

  return <div className="page-stack">
    <PageHeader eyebrow="SMART CHECK-IN" title={t("checkinTitle")} description={t("checkinDesc")} />
    <div className="event-picker-layout">
      <section className="event-catalog">
        <div className="filter-bar">
          <label className="search-field wide"><Search size={17} /><input value={filters.query} onChange={(event) => update("query", event.target.value)} placeholder={t("searchEvent")} /></label>
          <div className="filter-row"><Filter size={15} />
            <select value={filters.source} onChange={(event) => update("source", event.target.value)}><option value="all">{t("allSources")}</option><option value="lms">{t("sourceLms")}</option><option value="self">{t("sourceSelf")}</option></select>
            <select value={filters.category} onChange={(event) => update("category", event.target.value)}><option value="all">{t("allTypes")}</option>{categories.map((value) => <option value={value} key={value}>{localize(categoryLabels[value], language)}</option>)}</select>
            <select value={filters.status} onChange={(event) => update("status", event.target.value)}><option value="all">{t("allStatuses")}</option><option value="live">{t("live")}</option><option value="upcoming">{t("upcoming")}</option></select>
            <EventDateFilter value={filters.date} onChange={(value) => update("date", value)} />
          </div>
        </div>
        <div className="selectable-event-list">
          {filtered.length === 0 ? <EmptyState title={t("noEvent")} /> : filtered.map((event) => <button type="button" key={event.id} className={selected?.id === event.id ? "selected" : ""} onClick={() => choose(event)}>
            <span className="event-date-box"><strong>{event.date.slice(8)}</strong><small>{event.date.slice(5, 7)}</small></span>
            <span className="event-list-copy"><span><EventBadge event={event} /><i>{event.source === "lms" ? "LMS" : "SELF"}</i></span><strong>{localize(event.title, language)}</strong><small>{event.startTime}–{event.endTime} · {localize(event.location, language)}</small></span>
          </button>)}
        </div>
      </section>
      <aside className="event-preview">
        {selected ? <>
          <div className="event-preview-accent"><span>{selected.source === "lms" ? "LMS" : "SELF"}</span><EventBadge event={selected} /></div>
          <h2>{localize(selected.title, language)}</h2>
          <p>{localize(selected.creator, language)} · {t("contactExtension")} {selected.contactExtension || "—"}</p>
          <div className="preview-details">
            <div><Clock3 size={18} /><span>{t("eventTime")}</span><strong>{selected.date}<br />{selected.startTime}–{selected.endTime}</strong></div>
            <div><MapPin size={18} /><span>{t("location")}</span><strong>{localize(selected.location, language)}</strong></div>
          </div>
          <div className="module-dots">
            {Object.entries(selected.modules).filter(([, enabled]) => enabled).map(([key]) => <span key={key}>{t(key)}</span>)}
            {selected.grouping.enabled && <span>{t("groupingOn")}</span>}
          </div>
          <button className="primary-button full" type="button" onClick={() => openCheckin(selected.id)}><Radio size={17} />{t("startCheckin")}</button>
        </> : <EmptyState title={t("noEvent")} />}
      </aside>
    </div>
  </div>;
}

function RecentActivity({ eventId }) {
  const { recentActivity, language, t } = useApp();
  const rows = recentActivity[eventId] || [];
  return <section className="recent-panel">
    <header><div><span>LIVE FEED</span><h2>{t("recent")}</h2></div><i><span />LIVE</i></header>
    {rows.length === 0 ? <EmptyState icon={Clock3} title={t("noRecords")} /> : <div className="recent-list">{rows.map((item) => <article key={item.id}>
      <span className={`recent-status ${item.mode}`}>{item.mode === "checkin" ? <LogIn size={16} /> : <LogOut size={16} />}</span>
      <div><strong>{localize(item.person.name, language)}</strong><small>{item.person.id} · {item.method === "card" ? t("cardMethod") : t("manualMethod")}</small></div>
      <span>{item.mode === "checkin" ? t("checkin") : t("checkout")}</span><time>{formatDate(item.at, language)}</time>
    </article>)}</div>}
  </section>;
}

function CheckinWorkspace() {
  const { checkinEventId, events, rostersByEvent, attendanceByEvent, language, t, closeCheckin, recordAttendance } = useApp();
  const event = events.find((item) => item.id === checkinEventId);
  const people = rostersByEvent[checkinEventId] || [];
  const records = attendanceByEvent[checkinEventId] || {};
  const [mode, setMode] = useState("checkin");
  const [method, setMethod] = useState("card");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(null);
  const isCheckout = mode === "checkout";

  const matches = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return people.filter((person) => `${person.id} ${Object.values(person.name).join(" ")}`.toLowerCase().includes(keyword)).slice(0, 6);
  }, [people, query]);

  if (!event) return <EventSelection />;

  const switchMode = (next) => {
    setMode(next);
    setFeedback(null);
    setQuery("");
  };

  const process = (person, selectedMethod = method) => {
    let result = recordAttendance({ eventId: event.id, personId: person.id, mode, method: selectedMethod });
    if (result.requiresLeaveOverride) {
      if (!window.confirm(t("leaveOverride"))) return;
      result = recordAttendance({ eventId: event.id, personId: person.id, mode, method: selectedMethod, overrideLeave: true });
    }
    setFeedback({ ...result, person });
    if (result.ok) setQuery("");
  };

  return <div className={`page-stack checkin-workspace mode-${mode}`}>
    <button className="back-button" type="button" onClick={closeCheckin}><ArrowLeft size={16} />{t("back")}</button>
    <section className="checkin-event-header">
      <div><span>{event.source === "lms" ? "LMS EVENT" : "SELF-CREATED EVENT"}</span><h1>{localize(event.title, language)}</h1><EventMeta event={event} /></div>
      <div className={`mode-switch mode-${mode}`} role="group" aria-label={t("attendanceMode")}>
        <span className="mode-switch-thumb" aria-hidden="true" />
        <button type="button" className={mode === "checkin" ? "active" : ""} aria-pressed={mode === "checkin"} onClick={() => switchMode("checkin")}><LogIn size={15} />{t("checkin")}</button>
        <button type="button" className={isCheckout ? "active" : ""} aria-pressed={isCheckout} onClick={() => switchMode("checkout")}><LogOut size={15} />{t("checkout")}</button>
      </div>
    </section>
    <div key={mode} className={`mode-banner ${mode}`} role="status">
      <span>{isCheckout ? <LogOut size={16} /> : <LogIn size={16} />}</span>
      <strong>{isCheckout ? t("modeCheckoutActive") : t("modeCheckinActive")}</strong>
      <small>{isCheckout ? t("checkoutModeHint") : t("checkinModeHint")}</small>
    </div>
    <div className="method-tabs">
      <button type="button" className={method === "card" ? "active" : ""} onClick={() => { setMethod("card"); setFeedback(null); }}><Contactless size={19} />{t("card")}</button>
      <button type="button" className={method === "manual" ? "active" : ""} onClick={() => { setMethod("manual"); setFeedback(null); }}><Keyboard size={19} />{t("manual")}</button>
    </div>
    <section className={`checkin-stage mode-${mode} ${feedback?.ok ? "has-success" : feedback ? "has-error" : ""}`}>
      {feedback ? <div className="checkin-feedback">
        <span className={feedback.ok ? "success-icon" : "error-icon"}>{feedback.ok ? <CheckCircle2 size={34} /> : <XCircle size={34} />}</span>
        <div><small>{isCheckout ? t("checkout") : t("checkin")}</small><h2>{t(feedback.code)}</h2>
          <p>{localize(feedback.person.name, language)} · {feedback.person.id}</p>
          {feedback.ok && <div className="feedback-chips">
            {event.grouping.enabled && <span className="feedback-chip group"><Users size={15} />{t("group")} <strong>{feedback.person.group || t("ungrouped")}</strong></span>}
            {feedback.completion && <span className={feedback.completion.completed ? "feedback-chip completed" : "feedback-chip incomplete"}>
              {feedback.completion.completed ? <BadgeCheck size={15} /> : <TimerReset size={15} />}
              <strong>{feedback.completion.completed ? t("completed") : t("incomplete")}</strong>
              {feedback.completion.attendedHours} / {feedback.completion.requiredHours} {t("hoursUnit")}
            </span>}
          </div>}
        </div>
        <button className="secondary-button" type="button" onClick={() => setFeedback(null)}>{t("close")}</button>
      </div> : <div className="stage-swap" key={`${mode}-${method}`}>{method === "card" ? <div className="card-reader">
        <div className="connection-orbit"><span /><Contactless size={55} /></div>
        <span className="connection-label"><i />{t("readerReady")}</span>
        <h2>{t("waitingCard")}</h2>
        <p>{isCheckout ? t("checkoutModeHint") : t("checkinModeHint")}</p>
        <div className="demo-cards">{people.slice(0, 5).map((person) => <button key={person.id} type="button" onClick={() => process(person, "card")}><UserRound size={14} />{person.id}</button>)}</div>
      </div> : <div className="manual-entry">
        <span className="manual-icon">{isCheckout ? <LogOut size={27} /> : <LogIn size={27} />}</span><h2>{t("manual")}</h2>
        <label className="search-field hero"><Search size={18} /><input autoFocus value={query} onChange={(eventValue) => setQuery(eventValue.target.value)} placeholder={t("searchPerson")} /></label>
        {query && <div className="person-results">{matches.length ? matches.map((person) => <button type="button" key={person.id} onClick={() => process(person, "manual")}>
          <span>{localize(person.name, language).slice(0, 1)}</span><div><strong>{localize(person.name, language)}</strong><small>{person.id} · {localize(person.department, language)}</small></div><i>{getRecord(records, person.id).checkin ? t("checkedIn") : t("pending")}</i>
        </button>) : <EmptyState title={t("personNotFound")} />}</div>}
      </div>}</div>}
    </section>
    <RecentActivity eventId={event.id} />
  </div>;
}

export default function CheckinPage() {
  const { checkinEventId } = useApp();
  return checkinEventId ? <CheckinWorkspace /> : <EventSelection />;
}
