import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Mail, Search, Send } from "lucide-react";
import { useApp } from "./context.jsx";
import { retainFailedRecipients, toggleFilteredRecipients, toggleRecipientSelection } from "./domain.js";
import { formatDate, localize } from "./i18n.js";
import { EventPicker } from "./EventPicker.jsx";
import { EmptyState, LoadingButton, PageHeader } from "./Shell.jsx";
import "./materials.css";

function DeliveryStatus({ record, t, language }) {
  if (!record) return <span className="delivery-status pending">{t("notSent")}</span>;
  return <div className={`delivery-record ${record.status}`}><span>{record.status === "sent" ? t("sent") : t("failed")}</span><small>{formatDate(record.sentAt, language)} · ×{record.count}</small>{record.error && <small>{t("invalidEmail")}</small>}</div>;
}

export function MaterialsPage() {
  const { events, activeEvent, rostersByEvent, deliveries, sendDelivery, busy, language, t, setNotice } = useApp();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectAllRef = useRef(null);
  const event = events.find((item) => item.id === activeEvent?.id && item.modules.materials && item.status !== "cancelled") || null;
  const people = event ? rostersByEvent[event.id] || [] : [];
  const filtered = useMemo(() => people.filter((person) => !query.trim() || `${person.id} ${Object.values(person.name).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())), [people, query]);
  const filteredIds = filtered.map((person) => person.id);
  const selectedVisibleCount = filteredIds.filter((personId) => selectedIds.has(personId)).length;
  const allVisibleSelected = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;
  const records = deliveries[event?.id]?.materials || {};

  useEffect(() => { setSelectedIds(new Set()); setQuery(""); }, [event?.id]);
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected; }, [allVisibleSelected, selectedVisibleCount]);

  const send = async (ids, keepFailures = false) => {
    if (!event || !ids.length) return;
    try {
      const result = await sendDelivery({ eventId: event.id, type: "materials", personIds: ids });
      if (keepFailures) setSelectedIds((current) => retainFailedRecipients(current, result.results));
      setNotice({ tone: result.failureCount ? "error" : "success", message: result.failureCount ? `${t("partialDelivery")} · ${result.successCount}/${ids.length}` : `${t("batchComplete")} · ${result.successCount}` });
    } catch (error) {
      setNotice({ tone: "error", message: error.message === "NETWORK_OFFLINE" ? t("networkOffline") : t("missingLink") });
    }
  };

  if (!event) return <div className="page-stack"><PageHeader eyebrow="MATERIAL DELIVERY" title={t("materialsTitle")} description={t("materialsDesc")} actions={<EventPicker module="materials" />} /><EmptyState icon={BookOpenCheck} title={t("selectEventPrompt")} /></div>;
  return <div className="page-stack materials-page"><PageHeader eyebrow="MATERIAL DELIVERY" title={t("materialsTitle")} description={t("materialsDesc")} actions={<EventPicker module="materials" />} />
    <section className="module-hero"><span><BookOpenCheck size={25} /></span><div><small>{t("materials")}</small><h2>{localize(event.materials.name, language)}</h2><a href={event.materials.url} target="_blank" rel="noreferrer">{event.materials.url}</a></div><LoadingButton className="secondary-button" loading={busy} onClick={() => send(people.map((person) => person.id))}><Send size={15} />{t("resendAll")}</LoadingButton></section>
    <section className="delivery-panel"><div className="table-toolbar materials-toolbar"><label className="select-all-recipients"><input ref={selectAllRef} type="checkbox" checked={allVisibleSelected} onChange={(change) => setSelectedIds((current) => toggleFilteredRecipients(current, filteredIds, change.target.checked))} /><span>{t("selectFiltered")}</span></label><label className="search-field wide"><Search size={16} /><input value={query} onChange={(change) => setQuery(change.target.value)} placeholder={t("searchPerson")} /></label><LoadingButton className="primary-button" loading={busy} disabled={!selectedIds.size} onClick={() => send([...selectedIds], true)}><Send size={15} />{t("sendSelected")} ({selectedIds.size})</LoadingButton></div>
      <div className="delivery-list">{filtered.length ? filtered.map((person) => <article key={person.id}><input className="recipient-checkbox" type="checkbox" checked={selectedIds.has(person.id)} aria-label={`${t("selectRecipient")} ${localize(person.name, language)}`} onChange={(change) => setSelectedIds((current) => toggleRecipientSelection(current, person.id, change.target.checked))} /><span className="person-avatar">{localize(person.name, language).slice(0, 1)}</span><div><strong>{localize(person.name, language)}</strong><small>{person.id} · {person.email || t("missingEmail")}</small></div><DeliveryStatus record={records[person.id]} t={t} language={language} /><button className="secondary-button small" type="button" disabled={busy} onClick={() => send([person.id])}><Mail size={14} />{t("resend")}</button></article>) : <EmptyState title={t("empty")} />}</div>
    </section>
  </div>;
}
