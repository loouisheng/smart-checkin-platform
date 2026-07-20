import { useMemo, useState } from "react";
import {
  BookOpenCheck, Check, CheckCircle2, ClipboardList as ClipboardClock, Gift, History, Mail, Search, Send,
  Sparkles, Trophy, Users,
} from "lucide-react";
import { useApp } from "./context.jsx";
import { EventPicker } from "./EventPicker.jsx";
import { calculateKpis, getEarlyBirdEligible, getRecord } from "./domain.js";
import { formatDate, localize } from "./i18n.js";
import { AttendanceTable } from "./AttendanceTable.jsx";
import { EmptyState, KpiCards, LoadingButton, PageHeader } from "./Shell.jsx";

export function ReportsPage() {
  const { events, rostersByEvent, attendanceByEvent, activeEventId, t } = useApp();
  const event = events.find((item) => item.id === activeEventId && item.status !== "cancelled") || null;
  const people = event ? rostersByEvent[event.id] || [] : [];
  const records = event ? attendanceByEvent[event.id] || {} : {};
  if (!event) return <div className="page-stack reports-page"><PageHeader eyebrow="LIVE OPERATIONS" title={t("reportsTitle")} description={t("reportsDesc")} actions={<EventPicker />} /><EmptyState icon={Users} title={t("selectEventPrompt")} /></div>;
  const kpis = calculateKpis(people, records, event);
  return <div className="page-stack reports-page"><PageHeader eyebrow="LIVE OPERATIONS" title={t("reportsTitle")} description={t("reportsDesc")} actions={<EventPicker />} />
    <KpiCards values={kpis} />
    <section className="report-roster-panel"><div className="section-heading roster-section-heading"><div><span>ATTENDANCE ROSTER</span><h2>{t("liveRoster")}</h2></div></div>
      <AttendanceTable event={event} people={people} records={records} allowLeave />
    </section>
  </div>;
}

export function HistoryPage() {
  const { events, rostersByEvent, attendanceByEvent, activeEventId, language, t } = useApp();
  const historyEvents = events.filter((event) => ["completed", "cancelled"].includes(event.status));
  const selected = historyEvents.find((event) => event.id === activeEventId) || null;
  if (!selected) return <div className="page-stack"><PageHeader eyebrow="HISTORY" title={t("historyTitle")} description={t("historyDesc")} actions={<EventPicker includeHistory />} /><EmptyState icon={History} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack"><PageHeader eyebrow="HISTORY" title={t("historyTitle")} description={t("historyDesc")} actions={<EventPicker includeHistory />} />
    <section className="history-summary"><div><span className={"status-badge " + selected.status}>{t(selected.status)}</span><h2>{localize(selected.title, language)}</h2><p>{selected.date} · {selected.startTime}–{selected.endTime} · {localize(selected.location, language)}</p></div>{selected.cancellationReason && <aside><strong>{t("cancelReason")}</strong><p>{localize(selected.cancellationReason, language)}</p><small>{formatDate(selected.cancelledAt, language)}</small></aside>}</section>
    <AttendanceTable event={selected} people={rostersByEvent[selected.id] || []} records={attendanceByEvent[selected.id] || {}} />
  </div>;
}

function DeliveryStatus({ record, t, language }) {
  if (!record) return <span className="delivery-status pending">{t("notSent")}</span>;
  return <div className={`delivery-record ${record.status}`}><span>{record.status === "sent" ? t("sent") : t("failed")}</span><small>{formatDate(record.sentAt, language)} · ×{record.count}</small></div>;
}

export function MaterialsPage() {
  const { events, activeEvent, activePeople, rostersByEvent, deliveries, sendDelivery, busy, language, t, selectActiveEvent, setNotice } = useApp();
  const materialEvents = events.filter((event) => event.modules.materials && event.status !== "cancelled");
  const event = materialEvents.find((item) => item.id === activeEvent?.id) || null;
  const actualPeople = event ? (rostersByEvent[event.id] || []) : [];
  const [query, setQuery] = useState("");
  const filtered = actualPeople.filter((person) => !query.trim() || `${person.id} ${Object.values(person.name).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const records = deliveries[event?.id]?.materials || {};

  const send = async (ids) => {
    try {
      await sendDelivery({ eventId: event.id, type: "materials", personIds: ids });
      setNotice({ tone: "success", message: `${t("batchComplete")} · ${ids.length}` });
    } catch (error) {
      setNotice({ tone: "error", message: error.message === "NETWORK_OFFLINE" ? t("networkOffline") : t("missingLink") });
    }
  };

  if (!event) return <div className="page-stack"><PageHeader eyebrow="MATERIAL DELIVERY" title={t("materialsTitle")} description={t("materialsDesc")} actions={<EventPicker module="materials" />} /><EmptyState icon={BookOpenCheck} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack"><PageHeader eyebrow="MATERIAL DELIVERY" title={t("materialsTitle")} description={t("materialsDesc")} actions={<EventPicker module="materials" />} />
    <section className="module-hero"><span><BookOpenCheck size={25} /></span><div><small>{t("materials")}</small><h2>{localize(event.materials.name, language)}</h2><a href={event.materials.url} target="_blank" rel="noreferrer">{event.materials.url}</a></div><LoadingButton className="primary-button" loading={busy} onClick={() => send(actualPeople.map((person) => person.id))}><Send size={15} />{t("resendAll")}</LoadingButton></section>
    <section className="delivery-panel"><div className="table-toolbar"><label className="search-field wide"><Search size={16} /><input value={query} onChange={(change) => setQuery(change.target.value)} placeholder={t("searchPerson")} /></label></div>
      <div className="delivery-list">{filtered.map((person) => <article key={person.id}><span className="person-avatar">{localize(person.name, language).slice(0, 1)}</span><div><strong>{localize(person.name, language)}</strong><small>{person.id} · {person.email}</small></div><DeliveryStatus record={records[person.id]} t={t} language={language} /><button className="secondary-button small" type="button" disabled={busy} onClick={() => send([person.id])}><Mail size={14} />{t("resend")}</button></article>)}</div>
    </section>
  </div>;
}

export function SurveyPage() {
  const { events, rostersByEvent, attendanceByEvent, activeEvent, deliveries, sendDelivery, busy, language, t, selectActiveEvent, setNotice } = useApp();
  const surveyEvents = events.filter((event) => event.modules.survey && event.status !== "cancelled");
  const event = surveyEvents.find((item) => item.id === activeEvent?.id) || null;
  const people = event ? (rostersByEvent[event.id] || []).filter((person) => getRecord(attendanceByEvent[event.id] || {}, person.id).checkin) : [];
  const records = deliveries[event?.id]?.survey || {};
  const send = async (ids) => {
    try {
      await sendDelivery({ eventId: event.id, type: "survey", personIds: ids });
      setNotice({ tone: "success", message: `${t("batchComplete")} · ${ids.length}` });
    } catch (error) {
      setNotice({ tone: "error", message: error.message === "NETWORK_OFFLINE" ? t("networkOffline") : t("missingLink") });
    }
  };
  if (!event) return <div className="page-stack"><PageHeader eyebrow="SURVEY DELIVERY" title={t("surveyTitle")} description={t("surveyDesc")} actions={<EventPicker module="survey" />} /><EmptyState icon={ClipboardClock} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack"><PageHeader eyebrow="SURVEY DELIVERY" title={t("surveyTitle")} description={t("surveyDesc")} actions={<EventPicker module="survey" />} />
    <section className="module-hero survey"><span><ClipboardClock size={25} /></span><div><small>{t("autoScheduled")}</small><h2>{localize(event.title, language)}</h2><a href={event.survey.url} target="_blank" rel="noreferrer">{event.survey.url}</a></div><LoadingButton className="primary-button" loading={busy} disabled={!people.length} onClick={() => send(people.map((person) => person.id))}><Send size={15} />{t("sendAll")}</LoadingButton></section>
    <section className="delivery-panel"><div className="section-heading"><div><span>ATTENDEES</span><h2>{people.length} {t("arrived")}</h2></div></div><div className="delivery-list">{people.length ? people.map((person) => <article key={person.id}><span className="person-avatar">{localize(person.name, language).slice(0, 1)}</span><div><strong>{localize(person.name, language)}</strong><small>{person.id} · {person.email}</small></div><DeliveryStatus record={records[person.id]} t={t} language={language} /><button className="secondary-button small" type="button" disabled={busy} onClick={() => send([person.id])}><Send size={14} />{t("send")}</button></article>) : <EmptyState title={t("empty")} />}</div></section>
  </div>;
}

export function EarlyBirdPage() {
  const { events, rostersByEvent, attendanceByEvent, activeEvent, deliveries, sendDelivery, busy, language, t, selectActiveEvent, setNotice } = useApp();
  const eligibleEvents = events.filter((event) => event.modules.earlyBird && event.status !== "cancelled");
  const event = eligibleEvents.find((item) => item.id === activeEvent?.id) || null;
  const eligible = event ? getEarlyBirdEligible(rostersByEvent[event.id] || [], attendanceByEvent[event.id] || {}, event.earlyBird.quota) : [];
  const records = deliveries[event?.id]?.earlyBird || {};
  const issue = async (ids) => {
    await sendDelivery({ eventId: event.id, type: "earlyBird", personIds: ids });
    setNotice({ tone: "success", message: `${t("batchComplete")} · ${ids.length}` });
  };
  if (!event) return <div className="page-stack"><PageHeader eyebrow="EARLY ARRIVAL" title={t("earlyTitle")} description={t("earlyDesc")} actions={<EventPicker module="earlyBird" />} /><EmptyState icon={Gift} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack"><PageHeader eyebrow="EARLY ARRIVAL" title={t("earlyTitle")} description={t("earlyDesc")} actions={<EventPicker module="earlyBird" />} />
    <section className="module-hero reward"><span><Gift size={25} /></span><div><small>{t("eligible")} · TOP {event.earlyBird.quota}</small><h2>{localize(event.earlyBird.reward, language)}</h2><p>{localize(event.title, language)}</p></div><LoadingButton className="primary-button" loading={busy} disabled={!eligible.length} onClick={() => issue(eligible.filter((person) => !records[person.id]).map((person) => person.id))}><CheckCircle2 size={15} />{t("issueAll")}</LoadingButton></section>
    <div className="rank-list">{eligible.length ? eligible.map((person, index) => <article key={person.id}><strong className="rank">{String(index + 1).padStart(2, "0")}</strong><span className="person-avatar">{localize(person.name, language).slice(0, 1)}</span><div><strong>{localize(person.name, language)}</strong><small>{person.id} · {formatDate(getRecord(attendanceByEvent[event.id], person.id).checkin.at, language)}</small></div><span className="eligible-badge"><Check size={14} />{t("eligible")}</span><button className="secondary-button small" type="button" disabled={busy || records[person.id]} onClick={() => issue([person.id])}>{records[person.id] ? t("issued") : t("issue")}</button></article>) : <EmptyState title={t("empty")} />}</div>
  </div>;
}

export function LotteryPage() {
  const { events, activeEvent, rostersByEvent, attendanceByEvent, lotteryResults, runLottery, language, t } = useApp();
  const lotteryEvents = events.filter((event) => event.modules.lottery && event.status !== "cancelled");
  const event = lotteryEvents.find((item) => item.id === activeEvent?.id) || null;
  const result = lotteryResults[event?.id];
  const eligibleCount = event ? (rostersByEvent[event.id] || []).filter((person) => getRecord(attendanceByEvent[event.id] || {}, person.id).checkin).length : 0;
  if (!event) return <div className="page-stack lottery-page"><PageHeader eyebrow="EVENT LOTTERY" title={t("lotteryTitle")} description={t("lotteryDesc")} actions={<EventPicker module="lottery" />} /><EmptyState icon={Sparkles} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack lottery-page"><PageHeader eyebrow="EVENT LOTTERY" title={t("lotteryTitle")} description={t("lotteryDesc")} actions={<EventPicker module="lottery" />} />
    <section className="lottery-stage"><div className="lottery-orbit"><span /><Trophy size={42} /></div><div><small>{eligibleCount} {t("eligible")}</small><h2>{localize(event.title, language)}</h2><div className="prize-chips">{event.lottery.prizes.map((prize) => <span key={prize.id}>{localize(prize.name, language)} × {prize.quantity}</span>)}</div></div><button className="lottery-button" type="button" disabled={!eligibleCount} onClick={() => runLottery(event.id)}><Sparkles size={18} />{t("draw")}</button></section>
    <section className="winner-panel"><div className="section-heading"><div><span>WINNERS</span><h2>{t("winners")}</h2></div>{result?.unassignedCount > 0 && <small>{t("unassigned")} · {result.unassignedCount}</small>}</div>
      {result?.assignments?.length ? <div className="winner-grid">{result.assignments.map(({ person, prize }, index) => <article key={`${person.id}-${prize.id}`} style={{ "--delay": `${index * 80}ms` }}><span><Trophy size={18} /></span><div><small>{localize(prize.name, language)}</small><strong>{localize(person.name, language)}</strong><p>{person.id} · {localize(person.department, language)}</p></div></article>)}</div> : <EmptyState icon={Sparkles} title={t("winners")} description={t("lotteryDesc")} />}
    </section>
  </div>;
}
