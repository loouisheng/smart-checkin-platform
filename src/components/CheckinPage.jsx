import { Clock3, MapPin, QrCode, Radio, Search } from "lucide-react";
import { formatAttendanceTimestamp, getAttendanceStatus, getRecord } from "../domain/checkinEngine.js";
import ResultPanel from "./ResultPanel.jsx";

const statusLabels = {
  zh: { pending: "待報到", checkedIn: "已簽到", complete: "完成", late: "遲到", absent: "未到", earlyLeave: "早退" },
  en: { pending: "Pending", checkedIn: "Checked in", complete: "Complete", late: "Late", absent: "Absent", earlyLeave: "Early leave" },
};

const reasonLabels = {
  WAITING_FOR_CHECKIN: "等待簽到",
  WAITING_FOR_CHECKOUT: "等待簽退",
  COMPLETE: "簽到與簽退完成",
  CHECKIN_COMPLETE: "簽到完成",
  LATE: "超過準時門檻",
  ABSENT_AFTER_LIMIT: "逾未到判定時間",
  EARLY_LEAVE: "提早簽退",
};

export default function CheckinPage({
  activeEvent,
  template,
  language,
  t,
  people,
  records,
  elapsedMinutes,
  setElapsedMinutes,
  inputValue,
  setInputValue,
  onScan,
  result,
}) {
  const isZh = language === "zh";

  return (
    <div className="page-stack">
      <section className="event-banner">
        <div className="event-banner-main">
          <div className="live-badge"><Radio size={14} /> {activeEvent.status === "live" ? t("live") : t("upcoming")}</div>
          <div><p>{activeEvent.id}</p><h1>{activeEvent.title[language]}</h1></div>
        </div>
        <div className="event-meta">
          <span><Clock3 size={16} /> {activeEvent.date} · {activeEvent.time}</span>
          <span><MapPin size={16} /> {activeEvent.location[language]}</span>
        </div>
      </section>

      <section className="checkin-grid">
        <article className="scan-panel">
          <div className="panel-header">
            <div><span className="section-kicker">SMART CHECK-IN</span><h2>{t("checkinTitle")}</h2><p>{t("checkinHint")}</p></div>
            <div className="time-control"><label htmlFor="elapsed">{t("elapsed")}</label><div><input id="elapsed" type="number" min="0" value={elapsedMinutes} onChange={(event) => setElapsedMinutes(Number(event.target.value))} /><span>{t("minutes")}</span></div></div>
          </div>

          <div className="scan-field">
            <Search size={22} />
            <input value={inputValue} onChange={(event) => setInputValue(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === "Enter" && onScan("checkin")} placeholder={isZh ? "例如 T001" : "e.g. T001"} aria-label={t("identifier")} />
            <span>RFID / QR</span>
          </div>
          <div className="scan-actions">
            <button className="primary-action" type="button" onClick={() => onScan("checkin")}>{t("checkin")}</button>
            <button className="secondary-action" type="button" disabled={!template.requireCheckout} onClick={() => onScan("checkout")}>{t("checkout")}</button>
          </div>
          <div className="scan-support">
            <span className="scan-support-icon"><QrCode size={30} strokeWidth={1.7} /></span>
            <div><strong>{isZh ? "快速掃描 QR Code" : "Scan a QR code"}</strong><p>{isZh ? "將員工卡或活動票券對準掃描器，也可直接輸入識別碼。" : "Present an employee card or event ticket, or enter an identifier manually."}</p></div>
            <div className="scan-channel-tags"><span>QR Code</span><span>RFID</span><span>{isZh ? "手動輸入" : "Manual"}</span></div>
          </div>
        </article>
        <ResultPanel result={result} activeEvent={activeEvent} language={language} t={t} />
      </section>

      <section className="operations-grid roster-only">
        <article className="data-panel roster-panel">
          <div className="data-panel-header"><div><span className="section-kicker">ROSTER</span><h2>{t("roster")}</h2></div><button type="button" className="text-button">CSV</button></div>
          <div className="table-scroll">
            <table className="attendance-table">
              <thead><tr><th>{t("name")}</th><th>{t("department")}</th><th>{t("identity")}</th><th>{t("checkinAt")}</th><th>{t("checkoutAt")}</th><th>{t("status")}</th><th>{t("reason")}</th></tr></thead>
              <tbody>{people.map((person) => {
                const record = getRecord(records, person.id);
                const attendance = getAttendanceStatus({ person, event: activeEvent, template, elapsedMinutes, records });
                const checkin = formatAttendanceTimestamp(activeEvent, record.checkins[0]);
                const checkout = formatAttendanceTimestamp(activeEvent, record.checkout);
                const identity = record.admissionType === "onsiteWaitlist" ? (isZh ? "現場候補" : "On-site waitlist") : person.typeLabel[language];
                return <tr key={person.id}>
                  <td><strong>{person.name[language]}</strong><small>{person.id}</small></td>
                  <td>{person.department[language]}</td><td>{identity}</td>
                  <td className="timestamp-cell" title={checkin?.full}>{checkin?.short || "—"}</td>
                  <td className="timestamp-cell" title={checkout?.full}>{checkout?.short || "—"}</td>
                  <td><span className={`status-tag status-${attendance.status}`}>{statusLabels[language][attendance.status]}</span></td>
                  <td className="reason-cell">{reasonLabels[attendance.reason] || attendance.reason}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

