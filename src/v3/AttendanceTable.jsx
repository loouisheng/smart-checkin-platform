import { useMemo, useState } from "react";
import { Download, MessageCircle, Search } from "lucide-react";
import { useApp } from "./context.jsx";
import { buildAttendanceCsv, downloadCsv, getAttendanceStatus, getRecord } from "./domain.js";
import { formatDate, localize } from "./i18n.js";
import { EmptyState } from "./Shell.jsx";

export function AttendanceTable({ event, people, records, allowLeave = false, compact = false }) {
  const { language, t, toggleLeave } = useApp();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [group, setGroup] = useState("all");
  const [status, setStatus] = useState("all");

  const departments = useMemo(() => [...new Set(people.map((person) => localize(person.department, language)))], [people, language]);
  const groups = useMemo(() => [...new Set(people.map((person) => person.group).filter(Boolean))], [people]);
  const rows = useMemo(() => people.map((person) => {
    const record = getRecord(records, person.id);
    return { person, record, status: getAttendanceStatus(person, record, event) };
  }).filter(({ person, status: personStatus }) => {
    const keyword = query.trim().toLowerCase();
    const searchable = `${person.id} ${Object.values(person.name).join(" ")}`.toLowerCase();
    return (!keyword || searchable.includes(keyword))
      && (department === "all" || localize(person.department, language) === department)
      && (group === "all" || person.group === group)
      && (status === "all" || personStatus === status);
  }), [department, event, group, language, people, query, records, status]);

  const exportRows = () => {
    if (!rows.length) return;
    const csv = buildAttendanceCsv({ event, people: rows.map((row) => row.person), records, language, localize, statusLabel: t });
    downloadCsv(`${event.id}-attendance.csv`, csv);
  };

  return <section className={`table-panel ${compact ? "compact" : ""}`}>
    <div className="table-toolbar">
      <label className="search-field"><Search size={16} /><input value={query} onChange={(eventValue) => setQuery(eventValue.target.value)} placeholder={t("searchPerson")} /></label>
      {!compact && <>
        <select value={department} onChange={(eventValue) => setDepartment(eventValue.target.value)}><option value="all">{t("department")}</option>{departments.map((value) => <option key={value}>{value}</option>)}</select>
        {groups.length > 0 && <select value={group} onChange={(eventValue) => setGroup(eventValue.target.value)}><option value="all">{t("group")}</option>{groups.map((value) => <option key={value}>{value}</option>)}</select>}
        <select value={status} onChange={(eventValue) => setStatus(eventValue.target.value)}>
          <option value="all">{t("attendance")}</option>
          {["pending", "checkedIn", "checkedOut", "late", "absent", "leave"].map((value) => <option value={value} key={value}>{t(value)}</option>)}
        </select>
        <button className="secondary-button" type="button" onClick={exportRows} disabled={!rows.length}><Download size={15} />{t("exportCsv")}</button>
      </>}
    </div>
    {rows.length === 0 ? <EmptyState title={t("empty")} /> : <div className="table-scroll"><table className="roster-table">
      <thead><tr>
        <th>{t("name")}</th><th>{t("department")}</th><th>{t("group")}</th><th>{t("attendance")}</th>
        <th>{t("checkinAt")}</th><th>{t("checkoutAt")}</th><th className="center">{t("teams")}</th><th>{t("extension")}</th>
        {allowLeave && <th>{t("action")}</th>}
      </tr></thead>
      <tbody>{rows.map(({ person, record, status: personStatus }) => <tr key={person.id}>
        <td><strong>{localize(person.name, language)}</strong><small>{person.id}</small></td>
        <td>{localize(person.department, language)}</td><td>{person.group || "—"}</td>
        <td><span className={`attendance-pill ${personStatus}`}>{t(personStatus)}</span></td>
        <td>{record.checkin ? formatDate(record.checkin.at, language) : "—"}</td>
        <td>{record.checkout ? formatDate(record.checkout.at, language) : "—"}</td>
        <td className="center">{person.teamsUrl ? <a className="teams-link" href={person.teamsUrl} target="_blank" rel="noreferrer" aria-label={`Teams: ${localize(person.name, language)}`}><MessageCircle size={17} /></a> : <button className="teams-link disabled" type="button" disabled title={t("teamsUnavailable")}><MessageCircle size={17} /></button>}</td>
        <td>{person.extension || "—"}</td>
        {allowLeave && <td><button className="table-action" type="button" onClick={() => toggleLeave(event.id, person.id, personStatus !== "leave")}>{personStatus === "leave" ? t("clearLeave") : t("markLeave")}</button></td>}
      </tr>)}</tbody>
    </table></div>}
  </section>;
}
