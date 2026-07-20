import { useRef } from "react";
import { Check, Download, ExternalLink, FileSpreadsheet, LockKeyhole, Upload, Users } from "lucide-react";
import { useApp } from "./context.jsx";
import { roster } from "./data.js";
import { downloadCsv, isValidHttpUrl, parseRosterCsv } from "./domain.js";

export function RosterPicker({ source, mode, setMode, rosterPeople, setRosterPeople, fileName, setFileName, setError, rosterUrl }) {
  const { t } = useApp();
  const inputRef = useRef(null);
  const downloadTemplate = () => downloadCsv("event-checkin-roster-template.csv", "\uFEFFemployee_id,name,department,email,teams_url,extension\r\nT001,Alice Chen,People,alice.chen@example.com,https://teams.microsoft.com/l/chat/0/0?users=alice.chen@example.com,2181");
  const chooseDemo = (nextMode, count) => {
    setMode(nextMode);
    setRosterPeople(roster.slice(0, count).map((person) => ({ ...person, group: null })));
    setFileName("");
    setError("");
  };
  const readFile = async (file) => {
    if (!file) return;
    try {
      const parsed = parseRosterCsv(await file.text());
      setMode("upload");
      setRosterPeople(parsed.people);
      setFileName(file.name);
      setError("");
    } catch (error) {
      setError(["ROSTER_EMPTY", "ROSTER_REQUIRED_COLUMNS", "ROSTER_REQUIRED_VALUE", "DUPLICATE_EMPLOYEE_ID"].includes(error.message) ? t("rosterFormatError") : t("rosterReadError"));
    }
  };

  if (source === "lms") {
    const valid = isValidHttpUrl(rosterUrl);
    return <section className="roster-picker lms-roster-link">
      <header><div><h3>{t("rosterTitle")}</h3><p>{t("lmsRosterExternalDesc")}</p></div><LockKeyhole size={18} /></header>
      {valid ? <a className="primary-button" href={rosterUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} />{t("openLmsRoster")}</a>
        : <><button className="secondary-button" type="button" disabled><ExternalLink size={15} />{t("openLmsRoster")}</button><p className="form-error">{t("invalidLmsRosterUrl")}</p></>}
    </section>;
  }

  return <section className="roster-picker">
    <header><div><h3>{t("rosterTitle")}</h3><p>{t("rosterDesc")}</p></div><div className="roster-header-actions"><button className="secondary-button small roster-template-button" type="button" onClick={downloadTemplate}><Download size={14} />{t("downloadRosterTemplate")}</button><Upload size={18} /></div></header>
    <div className="roster-options">
      <button className={mode === "demo-full" ? "roster-option active" : "roster-option"} type="button" onClick={() => chooseDemo("demo-full", 12)}><span><Users size={17} /></span><div><strong>{t("demoRosterFull")}</strong><small>12 {t("peopleUnit")}</small></div></button>
      <button className={mode === "demo-small" ? "roster-option active" : "roster-option"} type="button" onClick={() => chooseDemo("demo-small", 6)}><span><Users size={17} /></span><div><strong>{t("demoRosterSmall")}</strong><small>6 {t("peopleUnit")}</small></div></button>
      <button className={mode === "upload" ? "roster-option active" : "roster-option"} type="button" onClick={() => inputRef.current?.click()}><span><FileSpreadsheet size={17} /></span><div><strong>{t("uploadCsv")}</strong><small>{fileName || "employee_id, name, department, email"}</small></div></button>
    </div>
    <input ref={inputRef} className="file-input-hidden" type="file" accept=".csv,text/csv" onChange={(event) => readFile(event.target.files?.[0])} />
    <div className="roster-summary"><Check size={15} /><span>{fileName || (mode === "demo-small" ? t("demoRosterSmall") : t("demoRosterFull"))}</span><strong>{rosterPeople.length} {t("peopleUnit")}</strong></div>
  </section>;
}
