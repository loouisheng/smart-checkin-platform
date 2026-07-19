import { useMemo, useRef, useState } from "react";
import {
  BookOpenCheck, CalendarPlus, Check, ClipboardList as ClipboardClock, Download, Eye, FileSpreadsheet, Filter, Gift,
  GraduationCap, Info, LockKeyhole, Search, Sparkles, Trash2, Upload, Users,
} from "lucide-react";
import { useApp } from "./context.jsx";
import { downloadCsv } from "./domain.js";
import { categoryLabels, modeLabels } from "./data.js";
import { localize } from "./i18n.js";
import { EmptyState, EventBadge, EventMeta, Modal, PageHeader, useEventOptions } from "./Shell.jsx";

const moduleIcons = { materials: BookOpenCheck, survey: ClipboardClock, earlyBird: Gift, lottery: Sparkles };
const defaultModules = { materials: false, survey: false, earlyBird: false, lottery: false };
const emptyForm = {
  title: "", organizer: "", date: "2026-08-01", startTime: "09:00", endTime: "12:00", location: "", capacity: 40,
  category: "leadership", learningMode: "inPerson", grouping: false, groupSize: 4,
  modules: defaultModules, materialName: "", materialUrl: "", surveyUrl: "", earlyQuota: 5, earlyReward: "",
  prizes: [{ name: "", quantity: 1 }, { name: "", quantity: 1 }], source: "self", lmsId: null, catalogId: null, rosterCount: 12,
};

function createLmsForm(event, language) {
  return {
    ...emptyForm,
    title: localize(event.title, language),
    organizer: localize(event.organizer, language),
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: localize(event.location, language),
    capacity: event.capacity,
    category: event.category,
    learningMode: event.learningMode,
    grouping: false,
    modules: { ...defaultModules },
    source: "lms",
    lmsId: event.lmsId,
    catalogId: event.id,
    rosterCount: 12,
  };
}

function EntryCards({ onChoose }) {
  const { t } = useApp();
  return <div className="entry-cards">
    <button type="button" onClick={() => onChoose("self")}><span><CalendarPlus size={25} /></span><div><h2>{t("selfEvent")}</h2><p>{t("selfEventDesc")}</p></div><i>01</i></button>
    <button type="button" onClick={() => onChoose("lms")}><span><GraduationCap size={25} /></span><div><h2>{t("lmsEvent")}</h2><p>{t("lmsEventDesc")}</p></div><i>02</i></button>
  </div>;
}

function RosterPicker({ source, mode, setMode, rosterCount, setRosterCount, fileName, setFileName, setError }) {
  const { t } = useApp();
  const inputRef = useRef(null);
  const chooseUpload = () => inputRef.current?.click();
  const downloadTemplate = () => downloadCsv("event-checkin-roster-template.csv", "\uFEFFemployee_id,name,department,email,teams_url,extension\r\nT001,Alice Chen,People,alice.chen@example.com,https://teams.microsoft.com/l/chat/0/0?users=alice.chen@example.com,2181");
  const readFile = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      const header = (lines[0] || "").toLowerCase();
      if (!header.includes("employee") || !header.includes("name")) {
        setError(t("rosterFormatError"));
        return;
      }
      const count = Math.max(0, lines.length - 1);
      if (!count) {
        setError(t("rosterEmpty"));
        return;
      }
      setMode("upload");
      setRosterCount(Math.min(count, 12));
      setFileName(file.name);
      setError("");
    } catch {
      setError(t("rosterReadError"));
    }
  };

  if (source === "lms") {
    return <section className="roster-picker">
      <header><div><h3>{t("rosterTitle")}</h3><p>{t("lmsRosterDesc")}</p></div><LockKeyhole size={18} /></header>
      <div className="roster-summary"><Users size={16} /><strong>{t("lmsRosterReady")} · {rosterCount} {t("peopleUnit")}</strong></div>
    </section>;
  }

  return <section className="roster-picker">
    <header><div><h3>{t("rosterTitle")}</h3><p>{t("rosterDesc")}</p></div><div className="roster-header-actions"><button className="secondary-button small roster-template-button" type="button" onClick={downloadTemplate}><Download size={14} />{t("downloadRosterTemplate")}</button><Upload size={18} /></div></header>
    <div className="roster-options">
      <button className={mode === "demo-full" ? "roster-option active" : "roster-option"} type="button" onClick={() => { setMode("demo-full"); setRosterCount(12); setFileName(""); }}>
        <span><Users size={17} /></span><div><strong>{t("demoRosterFull")}</strong><small>12 {t("peopleUnit")}</small></div>
      </button>
      <button className={mode === "demo-small" ? "roster-option active" : "roster-option"} type="button" onClick={() => { setMode("demo-small"); setRosterCount(6); setFileName(""); }}>
        <span><Users size={17} /></span><div><strong>{t("demoRosterSmall")}</strong><small>6 {t("peopleUnit")}</small></div>
      </button>
      <button className={mode === "upload" ? "roster-option active" : "roster-option"} type="button" onClick={chooseUpload}>
        <span><FileSpreadsheet size={17} /></span><div><strong>{t("uploadCsv")}</strong><small>{fileName || "employee_id, name, department, email"}</small></div>
      </button>
    </div>
    <input ref={inputRef} className="file-input-hidden" type="file" accept=".csv,text/csv" onChange={(event) => readFile(event.target.files?.[0])} />
    <div className="roster-summary"><Check size={15} /><span>{fileName || (mode === "demo-small" ? t("demoRosterSmall") : t("demoRosterFull"))}</span><strong>{rosterCount} {t("peopleUnit")}</strong></div>
  </section>;
}

function EventForm({ onDone, initialEvent = null }) {
  const { language, t, saveSelfEvent } = useApp();
  const source = initialEvent ? "lms" : "self";
  const [form, setForm] = useState(() => initialEvent ? createLmsForm(initialEvent, language) : { ...emptyForm, modules: { ...defaultModules } });
  const [rosterMode, setRosterMode] = useState(initialEvent ? "lms" : "demo-full");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleModule = (key) => setForm((current) => ({ ...current, modules: { ...current.modules, [key]: !current.modules[key] } }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.organizer.trim() || !form.location.trim() || form.startTime >= form.endTime) {
      setError(t("requiredFields"));
      return;
    }
    if (form.modules.survey && !form.surveyUrl.trim()) return setError(t("missingLink"));
    if (form.modules.materials && (!form.materialName.trim() || !form.materialUrl.trim())) return setError(t("missingLink"));
    saveSelfEvent({ ...form, source, rosterCount: form.rosterCount });
    onDone();
  };

  return <form className="event-form" onSubmit={submit}>
    {source === "lms" && <div className="lms-readonly-note"><LockKeyhole size={16} /><span>{t("lmsBasicReadonly")}</span></div>}
    <section className="form-section"><header><span>01</span><div><h2>{t("basicInfo")}</h2><p>{source === "lms" ? t("lmsBasicDesc") : t("selfEventDesc")}</p></div></header>
      <div className="form-grid">
        <label className="wide"><span>{t("eventName")} *</span><input readOnly={source === "lms"} value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label><span>{t("organizer")} *</span><input readOnly={source === "lms"} value={form.organizer} onChange={(event) => update("organizer", event.target.value)} /></label>
        <label><span>{t("capacity")}</span><input readOnly={source === "lms"} type="number" min="1" value={form.capacity} onChange={(event) => update("capacity", event.target.value)} /></label>
        <label><span>{t("date")}</span><input readOnly={source === "lms"} type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
        <label><span>{t("startTime")}</span><input readOnly={source === "lms"} type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} /></label>
        <label><span>{t("endTime")}</span><input readOnly={source === "lms"} type="time" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} /></label>
        <label className="wide"><span>{t("location")} *</span><input readOnly={source === "lms"} value={form.location} onChange={(event) => update("location", event.target.value)} /></label>
        <label><span>{t("category")}</span><select disabled={source === "lms"} value={form.category} onChange={(event) => update("category", event.target.value)}>{Object.keys(categoryLabels).map((value) => <option key={value} value={value}>{localize(categoryLabels[value], language)}</option>)}</select></label>
        <label><span>{t("learningMode")}</span><select disabled={source === "lms"} value={form.learningMode} onChange={(event) => update("learningMode", event.target.value)}>{Object.keys(modeLabels).map((value) => <option key={value} value={value}>{localize(modeLabels[value], language)}</option>)}</select></label>
      </div>
    </section>

    <RosterPicker source={source} mode={rosterMode} setMode={setRosterMode} rosterCount={form.rosterCount} setRosterCount={(value) => update("rosterCount", value)} fileName={fileName} setFileName={setFileName} setError={setError} />

    <section className="form-section"><header><span>02</span><div><h2>{t("grouping")}</h2><p>{t("groupingDesc")}</p></div></header>
      <div className="inline-setting">
        <button className={form.grouping ? "toggle active" : "toggle"} type="button" onClick={() => update("grouping", !form.grouping)} aria-pressed={form.grouping}><span /></button>
        <strong>{t("grouping")}</strong>
        {form.grouping && <label><span>{t("groupSize")}</span><input type="number" min="2" value={form.groupSize} onChange={(event) => update("groupSize", event.target.value)} /></label>}
      </div>
    </section>

    <section className="form-section"><header><span>03</span><div><h2>{t("modules")}</h2><p>{t("modulesDesc")}</p></div></header>
      <div className="module-grid">{Object.entries(moduleIcons).map(([key, Icon]) => <button type="button" key={key} className={form.modules[key] ? "selected" : ""} onClick={() => toggleModule(key)} aria-pressed={form.modules[key]}>
        <span><Icon size={19} /></span><strong>{t(key)}</strong><i>{form.modules[key] && <Check size={14} />}</i>
      </button>)}</div>
      <div className="conditional-grid">
        {form.modules.materials && <><label><span>{t("materialName")}</span><input value={form.materialName} onChange={(event) => update("materialName", event.target.value)} /></label><label><span>{t("materialUrl")}</span><input type="url" value={form.materialUrl} onChange={(event) => update("materialUrl", event.target.value)} /></label></>}
        {form.modules.survey && <label className="wide"><span>{t("surveyUrl")}</span><input type="url" value={form.surveyUrl} onChange={(event) => update("surveyUrl", event.target.value)} /></label>}
        {form.modules.earlyBird && <><label><span>{t("earlyQuota")}</span><input type="number" min="1" value={form.earlyQuota} onChange={(event) => update("earlyQuota", event.target.value)} /></label><label><span>{t("earlyReward")}</span><input value={form.earlyReward} onChange={(event) => update("earlyReward", event.target.value)} /></label></>}
        {form.modules.lottery && form.prizes.map((prize, index) => <div className="prize-row wide" key={index}><label><span>{t("prizeName")} {index + 1}</span><input value={prize.name} onChange={(event) => update("prizes", form.prizes.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></label><label><span>{t("prizeQty")}</span><input type="number" min="1" value={prize.quantity} onChange={(event) => update("prizes", form.prizes.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: event.target.value } : item))} /></label></div>)}
      </div>
    </section>
    {error && <p className="form-error">{error}</p>}
    <div className="form-actions"><button className="primary-button" type="submit"><Check size={16} />{t("createEvent")}</button></div>
  </form>;
}

function LmsCatalog({ onSelect }) {
  const { lmsCatalog, events, language, t } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const [selectedId, setSelectedId] = useState(lmsCatalog[0]?.id);
  const filtered = useMemo(() => lmsCatalog.filter((event) => {
    const searchable = Object.values(event.title).join(" ").toLowerCase();
    return (!query.trim() || searchable.includes(query.trim().toLowerCase()))
      && (category === "all" || event.category === category)
      && (mode === "all" || event.learningMode === mode);
  }), [category, lmsCatalog, mode, query]);
  const selected = lmsCatalog.find((event) => event.id === selectedId);
  const alreadyImported = selected && events.some((event) => event.lmsId === selected.lmsId && event.status !== "cancelled");

  return <div className="lms-browser">
    <div className="lms-searchbar"><label className="search-field wide"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchEvent")} /></label>
      <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{t("allTypes")}</option>{Object.keys(categoryLabels).map((value) => <option key={value} value={value}>{localize(categoryLabels[value], language)}</option>)}</select>
      <select value={mode} onChange={(event) => setMode(event.target.value)}><option value="all">{t("learningMode")}</option>{Object.keys(modeLabels).map((value) => <option key={value} value={value}>{localize(modeLabels[value], language)}</option>)}</select>
    </div>
    <div className="lms-layout"><section className="lms-results">{filtered.length ? filtered.map((event) => <button key={event.id} type="button" className={event.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(event.id)}>
      <span><GraduationCap size={18} /></span><div><strong>{localize(event.title, language)}</strong><small>{event.date} · {localize(categoryLabels[event.category], language)} · {localize(modeLabels[event.learningMode], language)}</small></div>
    </button>) : <EmptyState title={t("empty")} />}</section>
      <aside className="lms-preview">{selected && <>
        <span className="readonly-label"><Info size={14} />{t("lmsSelectHint")}</span><h2>{localize(selected.title, language)}</h2><EventMeta event={selected} />
        <div className="lms-module-summary"><strong>{t("lmsProvidedInfo")}</strong><span><Check size={13} />{t("basicInfo")}</span><span><Check size={13} />{t("rosterTitle")}</span></div>
        <button className="primary-button full" type="button" disabled={alreadyImported} onClick={() => onSelect(selected)}>{alreadyImported ? t("alreadyManaged") : t("createEvent")}</button>
      </>}</aside>
    </div>
  </div>;
}

function EventDetails({ event }) {
  const { rostersByEvent, language, t } = useApp();
  if (!event) return null;
  const enabledModules = Object.entries(event.modules || {}).filter(([, enabled]) => enabled).map(([key]) => key);
  return <div className="event-detail-grid">
    <div className="wide"><span>{t("eventName")}</span><strong>{localize(event.title, language)}</strong></div>
    <div><span>{t("sourceLabel")}</span><strong>{event.source === "lms" ? t("sourceLms") : t("sourceSelf")}</strong></div>
    <div><span>{t("organizer")}</span><strong>{localize(event.organizer, language)}</strong></div>
    <div><span>{t("date")}</span><strong>{event.date} · {event.startTime}–{event.endTime}</strong></div>
    <div><span>{t("location")}</span><strong>{localize(event.location, language)}</strong></div>
    <div><span>{t("category")}</span><strong>{localize(categoryLabels[event.category], language)}</strong></div>
    <div><span>{t("learningMode")}</span><strong>{localize(modeLabels[event.learningMode], language)}</strong></div>
    <div><span>{t("rosterTitle")}</span><strong>{(rostersByEvent[event.id] || []).length} {t("peopleUnit")}</strong></div>
    <div><span>{t("grouping")}</span><strong>{event.grouping?.enabled ? `${t("enabled")} · ${t("groupSize")} ${event.grouping.targetSize}` : t("disabled")}</strong></div>
    <div className="wide"><span>{t("modules")}</span><div className="detail-modules">{enabledModules.length ? enabledModules.map((key) => <span key={key}>{t(key)}</span>) : <strong>{t("noModules")}</strong>}</div></div>
  </div>;
}

function ManagedEvents() {
  const { events, language, t, cancelEvent } = useApp();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [reason, setReason] = useState("");
  const visibleEvents = events.filter((event) => event.status !== "cancelled");
  const { categories, statuses } = useEventOptions(visibleEvents);
  const filtered = visibleEvents.filter((event) => {
    const searchable = Object.values(event.title).join(" ").toLowerCase();
    return (!query.trim() || searchable.includes(query.trim().toLowerCase()))
      && (source === "all" || event.source === source)
      && (category === "all" || event.category === category)
      && (status === "all" || event.status === status);
  }).sort((a, b) => a.date.localeCompare(b.date));

  const confirmCancel = () => {
    if (cancelEvent(cancelTarget.id, reason)) {
      setCancelTarget(null);
      setReason("");
    }
  };

  return <>
    <div className="managed-filter"><label className="search-field wide"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchEvent")} /></label>
      <Filter size={15} /><select value={source} onChange={(event) => setSource(event.target.value)}><option value="all">{t("allSources")}</option><option value="lms">{t("sourceLms")}</option><option value="self">{t("sourceSelf")}</option></select>
      <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{t("allTypes")}</option>{categories.map((value) => <option key={value} value={value}>{localize(categoryLabels[value], language)}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t("allStatuses")}</option>{statuses.map((value) => <option key={value} value={value}>{t(value)}</option>)}</select>
    </div>
    <div className="managed-list">{filtered.length ? filtered.map((event) => <article key={event.id}>
      <div className="event-source-icon">{event.source === "lms" ? <GraduationCap size={20} /> : <CalendarPlus size={20} />}</div>
      <div className="managed-copy"><div><EventBadge event={event} /><span>{event.source === "lms" ? t("sourceLms") : t("sourceSelf")}</span></div><h2>{localize(event.title, language)}</h2><EventMeta event={event} />
        <div className="managed-modules">{Object.entries(event.modules).filter(([, value]) => value).map(([key]) => <span key={key}>{t(key)}</span>)}</div>
      </div>
      <div className="managed-actions"><button className="secondary-button" type="button" onClick={() => setDetailTarget(event)}><Eye size={14} />{t("viewEvent")}</button>
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
  const [tab, setTab] = useState("browse");
  const [creationMode, setCreationMode] = useState(null);
  const [lmsDraft, setLmsDraft] = useState(null);
  const done = () => { setTab("browse"); setCreationMode(null); setLmsDraft(null); };

  return <div className="page-stack">
    <PageHeader eyebrow="EVENT MANAGEMENT" title={t("eventsTitle")} description={t("eventsDesc")} />
    <div className="segmented-tabs"><button type="button" className={tab === "create" ? "active" : ""} onClick={() => { setTab("create"); setCreationMode(null); setLmsDraft(null); }}><CalendarPlus size={16} />{t("newEvent")}</button><button type="button" className={tab === "browse" ? "active" : ""} onClick={() => setTab("browse")}><Search size={16} />{t("browseEvents")}</button></div>
    {tab === "browse" ? <ManagedEvents />
      : creationMode === "self" ? <EventForm onDone={done} />
      : creationMode === "lms" && !lmsDraft ? <LmsCatalog onSelect={(event) => setLmsDraft(event)} />
      : creationMode === "lms" && lmsDraft ? <EventForm onDone={done} initialEvent={lmsDraft} />
      : <EntryCards onChoose={setCreationMode} />}
  </div>;
}
