import { useRef } from "react";
import { AlertTriangle, Check, Download, FileSpreadsheet, GraduationCap, Users } from "lucide-react";
import { useApp } from "./context.jsx";
import { buildRosterCsv, buildRosterTemplate, downloadCsv, parseRosterCsv, validateRosterGrouping } from "./domain.js";
import { localize } from "./i18n.js";
import "./roster.css";

const errorKeys = {
  ROSTER_EMPTY: "rosterEmpty",
  ROSTER_REQUIRED_COLUMNS: "rosterFormatError",
  ROSTER_REQUIRED_VALUE: "rosterFormatError",
  DUPLICATE_EMPLOYEE_ID: "rosterFormatError",
  ROSTER_GROUP_COLUMN_REQUIRED: "rosterGroupColumnRequired",
  ROSTER_GROUP_VALUE_REQUIRED: "rosterGroupValueRequired",
};

export function RosterPanel({ source, people, setPeople, grouping, mode, setMode, fileName, setFileName, setError, onUseProvided }) {
  const { language, t } = useApp();
  const inputRef = useRef(null);
  const isLms = source === "lms";
  const missingGroups = validateRosterGrouping(people, grouping).missingIds.length;

  const readFile = async (file) => {
    if (!file) return;
    try {
      const parsed = parseRosterCsv(await file.text(), { requireGroup: grouping });
      setPeople(parsed.people);
      setFileName(file.name);
      setMode("upload");
      setError("");
    } catch (error) {
      setError(t(errorKeys[error.message] || "rosterReadError"));
    }
  };

  const useProvidedRoster = () => {
    onUseProvided();
    setFileName("");
    setMode(isLms ? "lms" : "demo");
    setError("");
  };

  return <section className="roster-panel">
    <header>
      <div className="roster-panel-actions">
        <button className="secondary-button small" type="button" onClick={() => downloadCsv("event-checkin-roster-template.csv", buildRosterTemplate(grouping))}><Download size={13} />{t("downloadRosterTemplate")}</button>
        <button className="secondary-button small" type="button" disabled={!people.length} onClick={() => downloadCsv(fileName || "event-roster.csv", buildRosterCsv(people, { language, localize, withGroup: grouping }))}><Download size={13} />{t("downloadRoster")}</button>
      </div>
    </header>

    <div className="roster-options">
      <button className={mode !== "upload" ? "roster-option active" : "roster-option"} type="button" onClick={useProvidedRoster}>
        <span>{isLms ? <GraduationCap size={16} /> : <Users size={16} />}</span>
        <div><strong>{isLms ? t("lmsRosterLoaded") : t("demoRosterFull")}</strong><small>12 {t("peopleUnit")}</small></div>
      </button>
      <button className={mode === "upload" ? "roster-option active" : "roster-option"} type="button" onClick={() => inputRef.current?.click()}>
        <span><FileSpreadsheet size={16} /></span>
        <div><strong>{isLms ? t("replaceRoster") : t("uploadCsv")}</strong><small>{fileName || `employee_id, name, department, email${grouping ? ", group" : ""}`}</small></div>
      </button>
    </div>
    <input ref={inputRef} className="file-input-hidden" type="file" accept=".csv,text/csv" onChange={(event) => { readFile(event.target.files?.[0]); event.target.value = ""; }} />

    <div className="roster-summary">
      <Check size={14} /><span>{fileName || (isLms ? t("lmsRosterLoaded") : t("demoRosterFull"))}</span>
      <strong>{people.length} {t("peopleUnit")}</strong>
      {grouping && <em>{new Set(people.map((person) => person.group).filter(Boolean)).size} {t("group")}</em>}
    </div>

    {grouping && missingGroups > 0 && <p className="roster-warning"><AlertTriangle size={14} />{t("rosterGroupMissing")}</p>}

    <div className="roster-preview">
      <div className="roster-preview-head"><strong>{t("rosterPreview")}</strong><small>{people.length} {t("peopleUnit")}</small></div>
      {people.length ? <div className="roster-preview-scroll"><table>
        <thead><tr><th>{t("employeeId")}</th><th>{t("name")}</th><th>{t("department")}</th><th>Email</th><th>{t("extension")}</th>{grouping && <th>{t("group")}</th>}</tr></thead>
        <tbody>{people.map((person) => <tr key={person.id}>
          <td>{person.id}</td>
          <td>{localize(person.name, language)}</td>
          <td>{localize(person.department, language)}</td>
          <td className="roster-email">{person.email || "—"}</td>
          <td>{person.extension || "—"}</td>
          {grouping && <td>{person.group ? <span className="group-chip">{person.group}</span> : <span className="group-chip missing">{t("ungrouped")}</span>}</td>}
        </tr>)}</tbody>
      </table></div> : <p className="roster-preview-empty">{t("rosterEmptyPreview")}</p>}
    </div>
  </section>;
}
