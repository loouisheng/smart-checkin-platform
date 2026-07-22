import { useMemo, useState } from "react";
import {
  ArrowLeft, CalendarPlus, Check, ClipboardList as ClipboardClock, Eye, Filter, Gift, GraduationCap, Info, LockKeyhole, Plus,
  RefreshCw, Search, Sparkles, Trash2,
} from "lucide-react";
import { useApp } from "./context.jsx";
import { filterEvents, hoursBetween, resizePrizeList, todayIso, validateRosterGrouping } from "./domain.js";
import { buildDemoRoster, categoryLabels, currentUser, modeLabels } from "./data.js";
import { formatDate, localize } from "./i18n.js";
import { EmptyState, EventBadge, EventMeta, LoadingButton, Modal, PageHeader, useEventOptions } from "./Shell.jsx";
import { createEventFilters, EventDateFilter } from "./EventFilters.jsx";
import { RosterPanel } from "./RosterPanel.jsx";
import "./event-management-enhancements.css";

const moduleIcons = { survey: ClipboardClock, earlyBird: Gift, lottery: Sparkles };
const defaultModules = { survey: false, earlyBird: false, lottery: false };
const emptyForm = {
  title: "", description: "", date: "", startTime: "09:00", endTime: "12:00", location: "",
  instructor: "", deputy: "", totalHours: 3, hoursAuto: true,
  category: "leadership", learningMode: "inPerson", grouping: false, rosterPeople: [],
  modules: defaultModules, surveyUrl: "", earlyQuota: 5, earlyReward: "",
  prizes: [{ name: "", quantity: 1 }], source: "self", lmsId: null, catalogId: null,
};

function createLmsForm(event, language) {
  return {
    ...emptyForm,
    title: localize(event.title, language),
    description: localize(event.description, language),
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: localize(event.location, language),
    instructor: localize(event.instructor, language),
    deputy: localize(event.deputy, language),
    totalHours: event.totalHours,
    hoursAuto: false,
    category: event.category,
    learningMode: event.learningMode,
    grouping: Boolean(event.grouping?.enabled),
    rosterPeople: (event.roster || []).map((person) => ({ ...person })),
    modules: { ...defaultModules },
    source: "lms",
    lmsId: event.lmsId,
    catalogId: event.id,
  };
}

function EntryCards({ onChoose }) {
  const { t } = useApp();
  return <div className="entry-cards">
    <button type="button" onClick={() => onChoose("self")}><span><CalendarPlus size={25} /></span><div><h2>{t("selfEvent")}</h2><p>{t("selfEventDesc")}</p></div><i>01</i></button>
    <button type="button" onClick={() => onChoose("lms")}><span><GraduationCap size={25} /></span><div><h2>{t("lmsEvent")}</h2><p>{t("lmsEventDesc")}</p></div><i>02</i></button>
  </div>;
}

function GroupingToggle({ enabled, onToggle, t }) {
  return <div className="grouping-toggle wide">
    <div><strong>{t("groupingToggle")}</strong><p>{t("groupingToggleDesc")}</p></div>
    <div className="grouping-toggle-control">
      <span>{enabled ? t("groupingOn") : t("groupingOff")}</span>
      <button type="button" role="switch" aria-checked={enabled} aria-label={t("groupingToggle")} className={enabled ? "toggle active" : "toggle"} onClick={() => onToggle(!enabled)}><span /></button>
    </div>
  </div>;
}

function PrizeEditor({ prizes, onChange, t }) {
  const update = (index, key, value) => onChange(prizes.map((prize, position) => position === index ? { ...prize, [key]: value } : prize));
  return <div className="prize-editor wide">
    <div className="prize-editor-head">
      <label><span>{t("prizeCount")}</span><input type="number" min="1" max="12" value={prizes.length} onChange={(event) => onChange(resizePrizeList(prizes, event.target.value))} /></label>
      <p>{t("prizeSetupDesc")}</p>
      <button className="secondary-button small" type="button" onClick={() => onChange([...prizes, { name: "", quantity: 1 }])}><Plus size={13} />{t("addPrize")}</button>
    </div>
    <div className="prize-rows">{prizes.map((prize, index) => <div className="prize-row" key={index}>
      <label><span>{t("prizeName")} {index + 1}</span><input value={prize.name} onChange={(event) => update(index, "name", event.target.value)} /></label>
      <label><span>{t("prizeQty")}</span><input type="number" min="1" value={prize.quantity} onChange={(event) => update(index, "quantity", event.target.value)} /></label>
      <button className="prize-remove" type="button" aria-label={t("removePrize")} disabled={prizes.length <= 1} onClick={() => onChange(prizes.filter((item, position) => position !== index))}><Trash2 size={14} /></button>
    </div>)}</div>
  </div>;
}

function EventForm({ onDone, initialEvent = null }) {
  const { language, t, saveEvent } = useApp();
  const source = initialEvent ? "lms" : "self";
  const [form, setForm] = useState(() => initialEvent
    ? createLmsForm(initialEvent, language)
    : { ...emptyForm, date: todayIso(), modules: { ...defaultModules }, rosterPeople: buildDemoRoster(12, false) });
  const [rosterMode, setRosterMode] = useState(initialEvent ? "lms" : "demo");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleModule = (key) => setForm((current) => ({ ...current, modules: { ...current.modules, [key]: !current.modules[key] } }));

  const providedRoster = (grouped) => (source === "lms" ? (initialEvent.roster || []).map((person) => ({ ...person })) : buildDemoRoster(12, grouped));

  const toggleGrouping = (next) => {
    setError("");
    setForm((current) => ({ ...current, grouping: next, rosterPeople: rosterMode === "upload" ? current.rosterPeople : providedRoster(next) }));
  };

  const updateTime = (key, value) => setForm((current) => {
    const next = { ...current, [key]: value };
    if (current.hoursAuto !== false) next.totalHours = hoursBetween(next.startTime, next.endTime);
    return next;
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.description.trim() || !form.instructor.trim() || !form.deputy.trim() || Number(form.totalHours) <= 0 || form.startTime >= form.endTime) {
      setError(t("requiredFields"));
      return;
    }
    if (!form.rosterPeople.length) return setError(t("rosterEmpty"));
    if (!validateRosterGrouping(form.rosterPeople, form.grouping).ok) return setError(t("rosterGroupMissing"));
    if (form.modules.survey && !form.surveyUrl.trim()) return setError(t("missingLink"));
    if (form.modules.lottery && !form.prizes.every((prize) => prize.name.trim() && Number(prize.quantity) >= 1)) return setError(t("prizeRequired"));
    saveEvent({ ...form, source });
    onDone();
  };

  return <form className="event-form" onSubmit={submit}>
    {source === "lms" && <div className="lms-readonly-note"><LockKeyhole size={16} /><span>{t("lmsBasicReadonly")}</span></div>}
    <section className="form-section"><header><span>01</span><div><h2>{t("basicInfo")}</h2><p>{source === "lms" ? t("lmsBasicDesc") : t("selfEventDesc")}</p></div></header>
      <div className="form-grid">
        <label className="wide"><span>{t("eventName")} *</span><input readOnly={source === "lms"} value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label><span>{t("eventCreator")}</span><input readOnly value={localize(currentUser.name, language)} /></label>
        <label><span>{t("contactExtension")}</span><input readOnly value={currentUser.extension} /><small className="field-hint">{t("contactExtensionHint")}</small></label>
        <label className="wide"><span>{t("eventDescription")} *</span><textarea rows="4" readOnly={source === "lms"} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
        <label><span>{t("instructor")} *</span><input readOnly={source === "lms"} value={form.instructor} onChange={(event) => update("instructor", event.target.value)} /></label>
        <label><span>{t("deputy")} *</span><input readOnly={source === "lms"} value={form.deputy} onChange={(event) => update("deputy", event.target.value)} /></label>
        <label><span>{t("totalHours")} *</span><input readOnly={source === "lms"} type="number" min="0.5" step="0.5" value={form.totalHours} onChange={(event) => setForm((current) => ({ ...current, totalHours: event.target.value, hoursAuto: false }))} /><small className="field-hint">{t("completionRule")}</small></label>
        <label><span>{t("registeredCount")}</span><input readOnly value={form.rosterPeople.length} /><small className="field-hint">{t("registeredCountHint")}</small></label>
        <label><span>{t("date")}</span><input readOnly={source === "lms"} type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
        <label><span>{t("startTime")}</span><input readOnly={source === "lms"} type="time" value={form.startTime} onChange={(event) => updateTime("startTime", event.target.value)} /></label>
        <label><span>{t("endTime")}</span><input readOnly={source === "lms"} type="time" value={form.endTime} onChange={(event) => updateTime("endTime", event.target.value)} /></label>
        <label className="wide"><span>{t("location")} *</span><input readOnly={source === "lms"} value={form.location} onChange={(event) => update("location", event.target.value)} /></label>
        <label><span>{t("category")}</span><select disabled={source === "lms"} value={form.category} onChange={(event) => update("category", event.target.value)}>{Object.keys(categoryLabels).map((value) => <option key={value} value={value}>{localize(categoryLabels[value], language)}</option>)}</select></label>
        <label><span>{t("learningMode")}</span><select disabled={source === "lms"} value={form.learningMode} onChange={(event) => update("learningMode", event.target.value)}>{Object.keys(modeLabels).map((value) => <option key={value} value={value}>{localize(modeLabels[value], language)}</option>)}</select></label>
        <GroupingToggle enabled={form.grouping} onToggle={toggleGrouping} t={t} />
      </div>
    </section>

    <section className="form-section"><header><span>02</span><div><h2>{t("rosterTitle")}</h2><p>{source === "lms" ? t("lmsRosterDesc") : t("rosterDesc")}</p></div></header>
      <RosterPanel
        source={source}
        people={form.rosterPeople}
        setPeople={(people) => update("rosterPeople", people)}
        grouping={form.grouping}
        mode={rosterMode}
        setMode={setRosterMode}
        fileName={fileName}
        setFileName={setFileName}
        setError={setError}
        onUseProvided={() => update("rosterPeople", providedRoster(form.grouping))}
      />
    </section>

    <section className="form-section"><header><span>03</span><div><h2>{t("modules")}</h2><p>{t("modulesDesc")}</p></div></header>
      <div className="module-grid">{Object.entries(moduleIcons).map(([key, Icon]) => <button type="button" key={key} className={form.modules[key] ? "selected" : ""} onClick={() => toggleModule(key)} aria-pressed={form.modules[key]}>
        <span><Icon size={19} /></span><strong>{t(key)}</strong><i>{form.modules[key] && <Check size={14} />}</i>
      </button>)}</div>
      <div className="conditional-grid">
        {form.modules.survey && <label className="wide"><span>{t("surveyUrl")}</span><input type="url" value={form.surveyUrl} onChange={(event) => update("surveyUrl", event.target.value)} /><small className="field-hint">{t("surveyAfterOnly")}</small></label>}
        {form.modules.earlyBird && <><label><span>{t("earlyQuota")}</span><input type="number" min="1" value={form.earlyQuota} onChange={(event) => update("earlyQuota", event.target.value)} /></label><label><span>{t("earlyReward")}</span><input value={form.earlyReward} onChange={(event) => update("earlyReward", event.target.value)} /></label></>}
        {form.modules.lottery && <PrizeEditor prizes={form.prizes} onChange={(prizes) => update("prizes", prizes)} t={t} />}
      </div>
    </section>
    {error && <p className="form-error">{error}</p>}
    <div className="form-actions"><button className="primary-button" type="submit"><Check size={16} />{t("createEvent")}</button></div>
  </form>;
}

function LmsCatalog({ onSelect }) {
  const { lmsCatalog, events, language, t } = useApp();
  const [filters, setFilters] = useState(() => createEventFilters({ date: "" }));
  const [selectedId, setSelectedId] = useState(lmsCatalog[0]?.id);
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const filtered = useMemo(() => filterEvents(lmsCatalog, filters), [filters, lmsCatalog]);
  const selected = lmsCatalog.find((event) => event.id === selectedId);
  const alreadyImported = selected && events.some((event) => event.lmsId === selected.lmsId && event.status !== "cancelled");

  return <div className="lms-browser">
    <div className="lms-searchbar">
      <label className="search-field wide"><Search size={17} /><input value={filters.query} onChange={(event) => update("query", event.target.value)} placeholder={t("searchEvent")} /></label>
      <select value={filters.category} onChange={(event) => update("category", event.target.value)}><option value="all">{t("allTypes")}</option>{Object.keys(categoryLabels).map((value) => <option key={value} value={value}>{localize(categoryLabels[value], language)}</option>)}</select>
      <select value={filters.learningMode} onChange={(event) => update("learningMode", event.target.value)}><option value="all">{t("learningMode")}</option>{Object.keys(modeLabels).map((value) => <option key={value} value={value}>{localize(modeLabels[value], language)}</option>)}</select>
      <EventDateFilter value={filters.date} onChange={(value) => update("date", value)} />
    </div>
    <div className="lms-layout"><section className="lms-results">{filtered.length ? filtered.map((event) => <button key={event.id} type="button" className={event.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(event.id)}>
      <span><GraduationCap size={18} /></span><div><strong>{localize(event.title, language)}</strong><small>{event.date} · {localize(categoryLabels[event.category], language)} · {localize(modeLabels[event.learningMode], language)}</small></div>
    </button>) : <EmptyState title={t("empty")} />}</section>
      <aside className="lms-preview">{selected && <>
        <span className="readonly-label"><Info size={14} />{t("lmsSelectHint")}</span><h2>{localize(selected.title, language)}</h2><EventMeta event={selected} />
        <div className="lms-module-summary"><strong>{t("lmsProvidedInfo")}</strong><span><Check size={13} />{t("basicInfo")}</span><span><Check size={13} />{t("rosterTitle")} · {(selected.roster || []).length} {t("peopleUnit")}</span></div>
        <button className="primary-button full" type="button" disabled={alreadyImported} onClick={() => onSelect(selected)}>{alreadyImported ? t("alreadyManaged") : t("createEvent")}</button>
      </>}</aside>
    </div>
  </div>;
}

function EventDetails({ event }) {
  const { rostersByEvent, language, t } = useApp();
  if (!event) return null;
  const people = rostersByEvent[event.id] || [];
  const enabledModules = Object.entries(event.modules || {}).filter(([, enabled]) => enabled).map(([key]) => key);
  return <div className="event-detail-grid">
    <div className="wide"><span>{t("eventName")}</span><strong>{localize(event.title, language)}</strong></div>
    <div><span>{t("sourceLabel")}</span><strong>{event.source === "lms" ? t("sourceLms") : t("sourceSelf")}</strong></div>
    <div><span>{t("eventCreator")}</span><strong>{localize(event.creator, language)}</strong></div>
    <div><span>{t("contactExtension")}</span><strong>{event.contactExtension || "—"}</strong></div>
    <div><span>{t("instructor")}</span><strong>{localize(event.instructor, language)}</strong></div>
    <div><span>{t("deputy")}</span><strong>{localize(event.deputy, language)}</strong></div>
    <div><span>{t("totalHours")}</span><strong>{event.totalHours} {t("hoursUnit")}</strong></div>
    <div><span>{t("registeredCount")}</span><strong>{people.length} {t("peopleUnit")}</strong></div>
    <div className="wide"><span>{t("eventDescription")}</span><strong>{localize(event.description, language)}</strong></div>
    <div><span>{t("date")}</span><strong>{event.date} · {event.startTime}–{event.endTime}</strong></div>
    <div><span>{t("location")}</span><strong>{localize(event.location, language)}</strong></div>
    <div><span>{t("category")}</span><strong>{localize(categoryLabels[event.category], language)}</strong></div>
    <div><span>{t("learningMode")}</span><strong>{localize(modeLabels[event.learningMode], language)}</strong></div>
    <div><span>{t("grouping")}</span><strong>{event.grouping?.enabled ? `${t("groupingOn")} · ${new Set(people.map((person) => person.group).filter(Boolean)).size} ${t("group")}` : t("groupingOff")}</strong></div>
    <div className="wide"><span>{t("modules")}</span><div className="detail-modules">{enabledModules.length ? enabledModules.map((key) => <span key={key}>{t(key)}</span>) : <strong>{t("noModules")}</strong>}</div></div>
  </div>;
}

function ManagedEvents() {
  const { events, language, t, cancelEvent, refreshLmsRoster, rostersByEvent, busy, setNotice } = useApp();
  const [syncingId, setSyncingId] = useState(null);
  const [filters, setFilters] = useState(createEventFilters);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [reason, setReason] = useState("");
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const { categories, statuses } = useEventOptions(events.filter((event) => event.status !== "cancelled"));
  const filtered = useMemo(() => filterEvents(events, { ...filters, ownerId: currentUser.id }), [events, filters]);

  const confirmCancel = () => {
    if (cancelEvent(cancelTarget.id, reason)) {
      setCancelTarget(null);
      setReason("");
    }
  };

  const syncRoster = async (eventId) => {
    setSyncingId(eventId);
    try {
      const result = await refreshLmsRoster(eventId);
      setNotice({ tone: "success", message: result.added ? `${result.added} ${t("rosterAdded")} · ${result.total} ${t("peopleUnit")}` : t("rosterSynced") });
    } catch (error) {
      setNotice({ tone: "error", message: error.message === "NETWORK_OFFLINE" ? t("networkOffline") : t("deliveryFailed") });
    }
    setSyncingId(null);
  };

  return <>
    <div className="managed-filter">
      <label className="search-field wide"><Search size={17} /><input value={filters.query} onChange={(event) => update("query", event.target.value)} placeholder={t("searchEvent")} /></label>
      <Filter size={15} />
      <select value={filters.source} onChange={(event) => update("source", event.target.value)}><option value="all">{t("allSources")}</option><option value="lms">{t("sourceLms")}</option><option value="self">{t("sourceSelf")}</option></select>
      <select value={filters.category} onChange={(event) => update("category", event.target.value)}><option value="all">{t("allTypes")}</option>{categories.map((value) => <option key={value} value={value}>{localize(categoryLabels[value], language)}</option>)}</select>
      <select value={filters.status} onChange={(event) => update("status", event.target.value)}><option value="all">{t("allStatuses")}</option>{statuses.map((value) => <option key={value} value={value}>{t(value)}</option>)}</select>
      <EventDateFilter value={filters.date} onChange={(value) => update("date", value)} />
    </div>
    <div className="managed-list">{filtered.length ? filtered.map((event) => <article key={event.id}>
      <div className="event-source-icon">{event.source === "lms" ? <GraduationCap size={20} /> : <CalendarPlus size={20} />}</div>
      <div className="managed-copy"><div><EventBadge event={event} /><span>{event.source === "lms" ? t("sourceLms") : t("sourceSelf")}</span></div><h2>{localize(event.title, language)}</h2><EventMeta event={event} />
        <div className="managed-modules">{Object.entries(event.modules).filter(([, value]) => value).map(([key]) => <span key={key}>{t(key)}</span>)}{event.grouping?.enabled && <span>{t("groupingOn")}</span>}</div>
        {event.rosterSyncedAt && <small className="roster-synced-at">{t("rosterSyncedAt")}：{formatDate(event.rosterSyncedAt, language)} · {(rostersByEvent[event.id] || []).length} {t("peopleUnit")}</small>}
      </div>
      <div className="managed-actions">
        {event.source === "lms" && <LoadingButton className="secondary-button" loading={syncingId === event.id} disabled={busy} onClick={() => syncRoster(event.id)}><RefreshCw size={14} />{t("refreshRoster")}</LoadingButton>}
        <button className="secondary-button" type="button" onClick={() => setDetailTarget(event)}><Eye size={14} />{t("viewEvent")}</button>
        <button className="danger-button" type="button" onClick={() => setCancelTarget(event)}><Trash2 size={14} />{t("cancelEvent")}</button>
      </div>
    </article>) : <EmptyState title={t("empty")} />}</div>

    <Modal open={Boolean(detailTarget)} title={t("viewEvent")} onClose={() => setDetailTarget(null)} actions={<button className="primary-button" type="button" onClick={() => setDetailTarget(null)}>{t("close")}</button>}>
      <EventDetails event={detailTarget} />
    </Modal>

    <Modal open={Boolean(cancelTarget)} title={t("cancelEvent")} onClose={() => setCancelTarget(null)} actions={<><button className="secondary-button" type="button" onClick={() => setCancelTarget(null)}>{t("cancel")}</button><button className="danger-button" type="button" disabled={!reason.trim()} onClick={confirmCancel}>{t("confirm")}</button></>}>
      <p>{cancelTarget && localize(cancelTarget.title, language)}</p><label className="modal-field"><span>{t("cancelReason")}</span><textarea rows="4" value={reason} onChange={(event) => setReason(event.target.value)} autoFocus /></label>
    </Modal>
  </>;
}

export default function EventManagementPage() {
  const { t } = useApp();
  const [creationMode, setCreationMode] = useState(null);
  const [lmsDraft, setLmsDraft] = useState(null);
  const creating = creationMode !== null;
  const done = () => { setCreationMode(null); setLmsDraft(null); };

  return <div className="page-stack">
    <PageHeader eyebrow="EVENT MANAGEMENT" title={t("eventsTitle")} description={t("eventsDesc")}
      actions={creating
        ? <button className="secondary-button" type="button" onClick={done}><ArrowLeft size={15} />{t("backToEvents")}</button>
        : <button className="primary-button" type="button" onClick={() => setCreationMode("choose")}><CalendarPlus size={16} />{t("newEventCta")}</button>} />
    {!creating ? <ManagedEvents />
      : creationMode === "self" ? <EventForm onDone={done} />
      : creationMode === "lms" && !lmsDraft ? <LmsCatalog onSelect={(event) => setLmsDraft(event)} />
      : creationMode === "lms" && lmsDraft ? <EventForm onDone={done} initialEvent={lmsDraft} />
      : <EntryCards onChoose={setCreationMode} />}
  </div>;
}
