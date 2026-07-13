import { Armchair, BookOpenCheck, CalendarDays, CheckCircle2, Clock3, Gift, Mail, MapPin, Send, ShieldCheck, Users } from "lucide-react";
import { formatAttendanceTimestamp, getAttendanceStatus, getRecord } from "../domain/checkinEngine.js";

function PageIntro({ eyebrow, title, description }) {
  return <div className="page-intro"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>;
}

export function EventsPage({ events, activeEventId, onSelect, language, t }) {
  return (
    <div className="page-stack">
      <PageIntro eyebrow="EVENTS" title={t("eventsTitle")} description={t("eventsDesc")} />
      <div className="event-list">
        {events.map((event) => <article className={`event-row ${event.id === activeEventId ? "selected" : ""}`} key={event.id}>
          <div className="event-date"><strong>{event.date.slice(8)}</strong><span>{event.date.slice(5, 7)} / {event.date.slice(0, 4)}</span></div>
          <div className="event-row-main"><span className={`event-state ${event.status}`}>{event.status === "live" ? t("live") : t("upcoming")}</span><h2>{event.title[language]}</h2><p><Clock3 size={15} /> {event.time}<MapPin size={15} /> {event.location[language]}</p><div className="event-flags">{event.seatingEnabled && <span><Armchair size={13} /> {language === "zh" ? "座位配置" : "Seating"}</span>}{event.materialName && <span><BookOpenCheck size={13} /> {language === "zh" ? "教材寄送" : "Materials"}</span>}</div></div>
          <div className="event-row-meta"><span>{t("capacity")}</span><strong>{event.capacity}</strong>{event.registrationFull && <small>{language === "zh" ? "報名額滿" : "Registration full"}</small>}</div>
          <button type="button" className={event.id === activeEventId ? "selected-button" : "outline-button"} onClick={() => onSelect(event.id)}>{event.id === activeEventId ? (language === "zh" ? "使用中" : "Active") : (language === "zh" ? "切換活動" : "Select")}</button>
        </article>)}
      </div>
    </div>
  );
}

export function MaterialsPage({ people, event, records, materialRecords, elapsedMinutes, onResend, language, t }) {
  const isZh = language === "zh";
  if (!event.materialName) return <div className="page-stack"><PageIntro eyebrow="MATERIALS" title={t("materialsTitle")} description={t("materialsDesc")} /><section className="empty-module"><BookOpenCheck size={24} /><h2>{isZh ? "此活動未設定教材" : "No materials configured for this event"}</h2><p>{isZh ? "活動建立時可選擇教材、測驗或問卷，系統會在 Check-in 後自動寄送。" : "Choose materials, a quiz or a survey when creating the event; the system sends them after check-in."}</p></section></div>;
  return (
    <div className="page-stack">
      <PageIntro eyebrow="MATERIALS" title={t("materialsTitle")} description={t("materialsDesc")} />
      <section className="material-summary"><Mail size={20} /><div><span>{isZh ? "目前教材" : "Current material"}</span><strong>{event.materialName[language]}</strong></div><small>{isZh ? "只會寄給已完成 Check-in 的人員" : "Sent only after a completed check-in"}</small></section>
      <section className="data-panel"><div className="table-scroll"><table className="material-table"><thead><tr><th>{t("name")}</th><th>Email</th><th>{t("checkinAt")}</th><th>{isZh ? "寄送狀態" : "Delivery"}</th><th>{isZh ? "最近寄送" : "Last sent"}</th><th>{isZh ? "操作" : "Action"}</th></tr></thead><tbody>{people.map((person) => {
        const record = getRecord(records, person.id);
        const checkin = formatAttendanceTimestamp(event, record.checkins[0]);
        const delivery = materialRecords[person.id];
        const sentAt = formatAttendanceTimestamp(event, delivery?.sentAt);
        const eligible = record.checkins.length > 0;
        return <tr key={person.id}><td><strong>{person.name[language]}</strong><small>{person.id}</small></td><td>{person.email}</td><td className="timestamp-cell">{checkin?.short || "—"}</td><td>{eligible ? <span className={`status-tag ${delivery ? "status-complete" : "status-pending"}`}>{delivery ? t("sent") : t("notSent")}</span> : <span className="subtle-tag">{isZh ? "尚未報到" : "Not checked in"}</span>}</td><td className="timestamp-cell">{sentAt?.short || "—"}{delivery?.resendCount ? <small>{isZh ? `已補寄 ${delivery.resendCount} 次` : `${delivery.resendCount} resend(s)`}</small> : null}</td><td><button className="outline-button compact-button" type="button" disabled={!eligible} onClick={() => onResend(person.id)}><Send size={13} /> {t("resend")}</button></td></tr>;
      })}</tbody></table></div></section>
    </div>
  );
}

export function SeatingPage({ people, event, records, language, t }) {
  const isZh = language === "zh";
  if (!event.seatingEnabled) return <div className="page-stack"><PageIntro eyebrow="SEATING" title={t("seatingTitle")} description={t("seatingDesc")} /><section className="empty-module"><Armchair size={24} /><h2>{isZh ? "此活動不需要座位配置" : "This event does not use seat assignments"}</h2><p>{isZh ? "報到成功後不會顯示座位，現場人員可直接引導入場。" : "No seat will appear after check-in; attendees can be admitted directly."}</p></section></div>;
  return (
    <div className="page-stack"><PageIntro eyebrow="SEATING" title={t("seatingTitle")} description={t("seatingDesc")} />
      <section className="seat-layout"><div className="seat-stage">{isZh ? "講台 / 主舞台" : "Stage"}</div><div className="seat-grid">{people.filter((person) => person.type === "registered").map((person) => { const record = getRecord(records, person.id); return <article key={person.id} className={`seat-card ${record.checkins.length ? "occupied" : ""}`}><span>{person.seat}</span><strong>{person.name[language]}</strong><small>{record.checkins.length ? (isZh ? "已報到" : "Checked in") : (isZh ? "待報到" : "Pending")}</small></article>; })}</div></section>
      <section className="data-panel"><div className="data-panel-header"><div><span className="section-kicker">SEAT DIRECTORY</span><h2>{isZh ? "座位與分組" : "Seats and groups"}</h2></div></div><div className="table-scroll"><table><thead><tr><th>{t("name")}</th><th>{isZh ? "座位" : "Seat"}</th><th>{isZh ? "分組" : "Group"}</th><th>{isZh ? "工作坊角色" : "Workshop role"}</th></tr></thead><tbody>{people.filter((person) => person.type === "registered").map((person) => <tr key={person.id}><td><strong>{person.name[language]}</strong><small>{person.id}</small></td><td>{person.seat}</td><td>{person.group}</td><td>{person.role}</td></tr>)}</tbody></table></div></section>
    </div>
  );
}

export function BenefitsPage({ people, event, template, records, benefitRecords, onIssue, language, t }) {
  const isZh = language === "zh";
  if (!event.earlyBirdQuota) return <div className="page-stack"><PageIntro eyebrow="BENEFITS" title={t("benefitsTitle")} description={t("benefitsDesc")} /><section className="empty-module"><Gift size={24} /><h2>{isZh ? "此活動未設定早鳥福利" : "No early-bird benefit configured"}</h2><p>{isZh ? "建立活動時可設定前 N 位正取且準時報到者的禮券或點數。" : "Set vouchers or points for the first N registered attendees who arrive on time."}</p></section></div>;
  const eligiblePeople = people.filter((person) => person.type === "registered" && person.sequence <= event.earlyBirdQuota);
  return <div className="page-stack"><PageIntro eyebrow="BENEFITS" title={t("benefitsTitle")} description={t("benefitsDesc")} />
    <section className="benefit-summary"><Gift size={20} /><div><span>{isZh ? `前 ${event.earlyBirdQuota} 位正取且準時報到` : `First ${event.earlyBirdQuota} registered attendees who arrive on time`}</span><strong>{event.earlyBirdBenefit?.[language]}</strong></div></section>
    <section className="data-panel"><div className="table-scroll"><table><thead><tr><th>{isZh ? "報名順位" : "Rank"}</th><th>{t("name")}</th><th>{t("checkinAt")}</th><th>{isZh ? "資格" : "Eligibility"}</th><th>{isZh ? "發放狀態" : "Issue status"}</th><th>{isZh ? "操作" : "Action"}</th></tr></thead><tbody>{eligiblePeople.map((person) => {
      const record = getRecord(records, person.id); const checkin = formatAttendanceTimestamp(event, record.checkins[0]); const onTime = record.checkins.length && record.checkins[0] <= (template.rules.lateAfterMin ?? Infinity); const benefit = benefitRecords[person.id];
      return <tr key={person.id}><td>#{person.sequence}</td><td><strong>{person.name[language]}</strong><small>{person.id}</small></td><td className="timestamp-cell">{checkin?.short || "—"}</td><td>{onTime ? <span className="status-tag status-complete">{isZh ? "符合" : "Eligible"}</span> : <span className="status-tag status-pending">{record.checkins.length ? (isZh ? "遲到" : "Late") : (isZh ? "待報到" : "Pending")}</span>}</td><td>{benefit?.issued ? <span className="status-tag status-complete">{t("issued")}</span> : <span className="subtle-tag">—</span>}</td><td><button className="primary-small compact-button" type="button" disabled={!onTime || benefit?.issued} onClick={() => onIssue(person.id)}><Gift size={13} /> {benefit?.issued ? t("issued") : t("issueBenefit")}</button></td></tr>;
    })}</tbody></table></div></section>
  </div>;
}

export function ReportsPage({ stats, event, language, t }) {
  const cards = [[language === "zh" ? "已報到" : "Arrived", stats.arrived, Users], [language === "zh" ? "需處理" : "Needs action", stats.unresolved, ShieldCheck], [language === "zh" ? "現場空位" : "On-site seats", stats.openSeats, CalendarDays], [language === "zh" ? "可候補名額" : "Waitlist slots", event.capacityLimited && event.registrationFull ? stats.waitlistSlots : "—", CheckCircle2]];
  return <div className="page-stack"><PageIntro eyebrow="OPERATIONS" title={t("reportsTitle")} description={t("reportsDesc")} /><div className="report-grid">{cards.map(([label, value, Icon]) => <article key={label}><Icon size={21} /><span>{label}</span><strong>{value}</strong><small>{language === "zh" ? "即時活動指標" : "Live event metric"}</small></article>)}</div></div>;
}

export function SettingsPage({ event, template, language, t }) {
  const isZh = language === "zh";
  const rules = [
    [isZh ? "遲到判定" : "Late threshold", template.rules.lateAfterMin != null ? `${template.rules.lateAfterMin} min` : "—"],
    [isZh ? "未到釋位" : "No-show release", template.rules.waitlistReleaseMin != null && event.capacityLimited && event.registrationFull ? `${template.rules.waitlistReleaseMin} min` : (isZh ? "不適用" : "Not applicable")],
    [isZh ? "最晚入場" : "Entry cutoff", template.rules.hardCutoffMin != null ? `${template.rules.hardCutoffMin} min` : (isZh ? "不限制" : "No cutoff")],
    [isZh ? "簽退規則" : "Check-out", template.requireCheckout ? (isZh ? "需要簽退" : "Required") : (isZh ? "不需要簽退" : "Not required")],
  ];
  return <div className="page-stack"><PageIntro eyebrow="CONFIGURATION" title={t("settingsTitle")} description={t("settingsDesc")} /><div className="settings-grid"><section className="data-panel"><span className="section-kicker">ACTIVE EVENT</span><h2>{event.title[language]}</h2><div className="setting-list"><div><span className="setting-icon"><CalendarDays size={17} /></span><strong>{isZh ? "報到方式" : "Attendance method"}</strong><small>{isZh ? "現場 RFID、QR Code 或人工輸入" : "On-site RFID, QR code or manual entry"}</small></div><div><span className="setting-icon"><Armchair size={17} /></span><strong>{isZh ? "座位指引" : "Seat guidance"}</strong><small>{event.seatingEnabled ? (isZh ? "已啟用，報到結果會顯示座位" : "Enabled; the result shows an assigned seat") : (isZh ? "未啟用" : "Disabled")}</small></div><div><span className="setting-icon"><BookOpenCheck size={17} /></span><strong>{isZh ? "教材自動寄送" : "Automatic materials"}</strong><small>{event.materialName?.[language] || (isZh ? "未設定教材" : "No materials configured")}</small></div></div></section><section className="data-panel"><span className="section-kicker">RULES</span><h2>{isZh ? "活動判定規則" : "Event decision rules"}</h2><div className="rule-list">{rules.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section></div></div>;
}
