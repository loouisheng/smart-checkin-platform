import { Check, CheckCircle2, Gift, Info, Sparkles, Trophy, Users } from "lucide-react";
import { useApp } from "./context.jsx";
import { EventPicker } from "./EventPicker.jsx";
import { buildAttendanceMatrix, calculateKpis, getEarlyBirdEligible, getRecord, todayIso } from "./domain.js";
import { formatDate, localize } from "./i18n.js";
import { AttendanceTable } from "./AttendanceTable.jsx";
import { downloadWorkbookBundle, safeFileName } from "./xlsx.js";
import { EmptyState, KpiCards, LoadingButton, PageHeader } from "./Shell.jsx";
export { SurveyPage } from "./SurveyPage.jsx";

export function ReportsPage() {
  const { events, rostersByEvent, attendanceByEvent, activeEventId, language, t, setNotice } = useApp();
  const event = events.find((item) => item.id === activeEventId && item.status !== "cancelled") || null;
  const people = event ? rostersByEvent[event.id] || [] : [];
  const records = event ? attendanceByEvent[event.id] || {} : {};

  /** One workbook per chosen event, bundled so the browser only sees a single download. */
  const exportReports = (selection, range) => {
    if (!selection.length) return;
    const workbooks = selection.map((item) => {
      const title = localize(item.title, language);
      return {
        filename: `${safeFileName(title, item.id)}-${item.date}.xlsx`,
        sheetName: title,
        matrix: buildAttendanceMatrix({ event: item, people: rostersByEvent[item.id] || [], records: attendanceByEvent[item.id] || {}, language, localize, statusLabel: t, label: t }),
      };
    });
    const suffix = [range?.from, range?.to].filter(Boolean).join("_") || todayIso();
    const count = downloadWorkbookBundle(`event-reports-${suffix}.zip`, workbooks);
    setNotice({ tone: "success", message: `${t("rangeExportDone")} · ${count}` });
  };

  const header = <PageHeader eyebrow="LIVE OPERATIONS" title={t("reportsTitle")} description={t("reportsDesc")} actions={<EventPicker onExport={exportReports} />} />;
  if (!event) return <div className="page-stack reports-page">{header}<EmptyState icon={Users} title={t("selectEventPrompt")} /></div>;
  const kpis = calculateKpis(people, records, event);
  return <div className="page-stack reports-page">{header}
    <KpiCards values={kpis} />
    <section className="report-roster-panel"><div className="section-heading roster-section-heading"><div><span>ATTENDANCE ROSTER</span><h2>{t("liveRoster")}</h2></div><small className="completion-rule"><Info size={13} />{t("completionRule")}<b>{t("totalHours")} {event.totalHours} {t("hoursUnit")}</b></small></div>
      <AttendanceTable event={event} people={people} records={records} allowLeave />
    </section>
  </div>;
}

export function EarlyBirdPage() {
  const { events, rostersByEvent, attendanceByEvent, activeEvent, deliveries, sendDelivery, busy, language, t, setNotice } = useApp();
  const event = events.find((item) => item.id === activeEvent?.id && item.modules.earlyBird && item.status !== "cancelled") || null;
  const eligible = event ? getEarlyBirdEligible(rostersByEvent[event.id] || [], attendanceByEvent[event.id] || {}, event.earlyBird.quota) : [];
  const records = deliveries[event?.id]?.earlyBird || {};
  const issue = async (ids) => {
    if (!ids.length) return;
    await sendDelivery({ eventId: event.id, type: "earlyBird", personIds: ids });
    setNotice({ tone: "success", message: `${t("batchComplete")} · ${ids.length}` });
  };
  if (!event) return <div className="page-stack"><PageHeader eyebrow="EARLY ARRIVAL" title={t("earlyTitle")} description={t("earlyDesc")} actions={<EventPicker module="earlyBird" />} /><EmptyState icon={Gift} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack"><PageHeader eyebrow="EARLY ARRIVAL" title={t("earlyTitle")} description={t("earlyDesc")} actions={<EventPicker module="earlyBird" />} />
    <section className="module-hero reward"><span><Gift size={25} /></span><div><small>{t("eligible")} · TOP {event.earlyBird.quota}</small><h2>{localize(event.earlyBird.reward, language)}</h2><p>{localize(event.title, language)}</p></div><LoadingButton className="primary-button" loading={busy} disabled={!eligible.length} onClick={() => issue(eligible.filter((person) => !records[person.id]).map((person) => person.id))}><CheckCircle2 size={15} />{t("issueAll")}</LoadingButton></section>
    <div className="rank-list">{eligible.length ? eligible.map((person, index) => <article key={person.id}><strong className="rank">{String(index + 1).padStart(2, "0")}</strong><span className="person-avatar">{localize(person.name, language).slice(0, 1)}</span><div><strong>{localize(person.name, language)}</strong><small>{person.id} · {formatDate(getRecord(attendanceByEvent[event.id], person.id).checkin.at, language)}</small></div><span className="eligible-badge"><Check size={14} />{t("eligible")}</span><span className={records[person.id] ? "issue-status done" : "issue-status"}>{records[person.id] ? t("issued") : t("notIssued")}</span></article>) : <EmptyState title={t("empty")} />}</div>
  </div>;
}

export function LotteryPage() {
  const { events, activeEvent, rostersByEvent, attendanceByEvent, lotteryResults, runLottery, language, t } = useApp();
  const event = events.find((item) => item.id === activeEvent?.id && item.modules.lottery && item.status !== "cancelled") || null;
  const result = lotteryResults[event?.id];
  const prizes = event?.lottery?.prizes || [];
  const eligibleCount = event ? (rostersByEvent[event.id] || []).filter((person) => getRecord(attendanceByEvent[event.id] || {}, person.id).checkin).length : 0;
  const totalWinners = prizes.reduce((sum, prize) => sum + Number(prize.quantity || 0), 0);
  if (!event) return <div className="page-stack lottery-page"><PageHeader eyebrow="EVENT LOTTERY" title={t("lotteryTitle")} description={t("lotteryDesc")} actions={<EventPicker module="lottery" />} /><EmptyState icon={Sparkles} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack lottery-page"><PageHeader eyebrow="EVENT LOTTERY" title={t("lotteryTitle")} description={t("lotteryDesc")} actions={<EventPicker module="lottery" />} />
    <section className="lottery-stage">
      <div className="lottery-orbit"><span /><Trophy size={40} /></div>
      <div className="lottery-copy">
        <small>{eligibleCount} {t("eligible")} · {prizes.length} {t("prizeName")} · {totalWinners} {t("peopleUnit")}</small>
        <h2>{localize(event.title, language)}</h2>
        <div className="prize-chips">{prizes.map((prize) => <span key={prize.id}>{localize(prize.name, language)} × {prize.quantity}</span>)}</div>
      </div>
      <button className="lottery-button" type="button" disabled={!eligibleCount} onClick={() => runLottery(event.id)}>
        <Sparkles size={19} />{result ? t("drawAgain") : t("draw")}
      </button>
    </section>
    <section className="winner-panel"><div className="section-heading"><div><span>WINNERS</span><h2>{t("winners")}</h2></div>{result?.unassignedCount > 0 && <small>{t("unassigned")} · {result.unassignedCount}</small>}</div>
      {result?.assignments?.length ? <div className="winner-grid">{result.assignments.map(({ person, prize }, index) => <article key={`${person.id}-${prize.id}`} style={{ "--delay": `${index * 80}ms` }}><span><Trophy size={18} /></span><div><small>{localize(prize.name, language)}</small><strong>{localize(person.name, language)}</strong><p>{person.id} · {localize(person.department, language)}</p></div></article>)}</div> : <EmptyState icon={Sparkles} title={t("lotteryReady")} description={t("lotteryDesc")} />}
    </section>
  </div>;
}
