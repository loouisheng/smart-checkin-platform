import { CalendarClock, CheckCircle2, ClipboardList, LockKeyhole, Send } from "lucide-react";
import { useApp } from "./context.jsx";
import { canSendSurvey, getSurveyRecipients } from "./domain.js";
import { formatDate, localize } from "./i18n.js";
import { EventPicker } from "./EventPicker.jsx";
import { EmptyState, LoadingButton, PageHeader } from "./Shell.jsx";
import "./survey.css";

function DeliveryStatus({ record, t, language }) {
  if (!record) return <span className="delivery-status pending">{t("notSent")}</span>;
  return <div className={`delivery-record ${record.status}`}><span>{record.status === "sent" ? t("sent") : t("failed")}</span><small>{formatDate(record.sentAt, language)} · ×{record.count}</small>{record.error && <small>{t("invalidEmail")}</small>}</div>;
}

export function SurveyPage() {
  const { events, rostersByEvent, attendanceByEvent, activeEvent, deliveries, sendDelivery, busy, language, t, setNotice } = useApp();
  const event = events.find((item) => item.id === activeEvent?.id && item.modules.survey && item.status !== "cancelled") || null;
  const people = event ? getSurveyRecipients(event, rostersByEvent[event.id] || [], attendanceByEvent[event.id] || {}) : [];
  const records = deliveries[event?.id]?.survey || {};
  const eligibility = event ? canSendSurvey(event) : { ok: false, code: "NO_EVENT", unlockAt: null };
  const send = async (ids) => {
    try {
      const result = await sendDelivery({ eventId: event.id, type: "survey", personIds: ids });
      setNotice({ tone: result.failureCount ? "error" : "success", message: result.failureCount ? `${t("partialDelivery")} · ${result.successCount}/${ids.length}` : `${t("batchComplete")} · ${result.successCount}` });
    } catch (error) {
      const key = { NETWORK_OFFLINE: "networkOffline", MISSING_SURVEY_LINK: "missingLink", MISSING_LINK: "missingLink", SURVEY_LOCKED: "surveyLocked", NO_SURVEY_RECIPIENTS: "noSurveyRecipients", EVENT_UNAVAILABLE: "eventUnavailable" }[error.message] || "deliveryFailed";
      setNotice({ tone: "error", message: t(key) });
    }
  };

  if (!event) return <div className="page-stack"><PageHeader eyebrow="SURVEY DELIVERY" title={t("surveyTitle")} description={t("surveyDesc")} actions={<EventPicker module="survey" />} /><EmptyState icon={ClipboardList} title={t("selectEventPrompt")} /></div>;
  const isBefore = event.survey.timing === "before";
  return <div className="page-stack"><PageHeader eyebrow="SURVEY DELIVERY" title={t("surveyTitle")} description={t("surveyDesc")} actions={<EventPicker module="survey" />} />
    <section className="module-hero survey"><span><ClipboardList size={25} /></span><div><small>{isBefore ? t("surveyBefore") : t("surveyAfter")}</small><h2>{localize(event.title, language)}</h2><a href={event.survey.url} target="_blank" rel="noreferrer">{event.survey.url}</a></div><LoadingButton className="primary-button" loading={busy} disabled={!eligibility.ok || !people.length} onClick={() => send(people.map((person) => person.id))}><Send size={15} />{t("sendAll")}</LoadingButton></section>
    <div className={eligibility.ok ? "survey-lock-notice survey-ready-notice" : "survey-lock-notice"}>{eligibility.ok ? <CheckCircle2 size={17} /> : <LockKeyhole size={17} />}<strong>{eligibility.ok ? t("surveyReady") : t("surveyLocked")}</strong>{!isBefore && eligibility.unlockAt && <span>{t("surveyUnlockAt")}：{formatDate(eligibility.unlockAt, language)}</span>}</div>
    <section className="delivery-panel"><div className="section-heading"><div><span>{isBefore ? "REGISTRANTS" : "ATTENDEES"}</span><h2>{people.length} {isBefore ? t("registeredPeople") : t("arrived")}</h2></div></div><div className="delivery-list">{people.length ? people.map((person) => <article key={person.id}><span className="person-avatar">{localize(person.name, language).slice(0, 1)}</span><div><strong>{localize(person.name, language)}</strong><small>{person.id} · {person.email}</small></div><DeliveryStatus record={records[person.id]} t={t} language={language} /><button className="secondary-button small" type="button" disabled={busy || !eligibility.ok} onClick={() => send([person.id])}><Send size={14} />{t("send")}</button></article>) : <EmptyState icon={CalendarClock} title={t("noSurveyRecipients")} />}</div></section>
  </div>;
}
