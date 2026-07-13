import { AlertTriangle, CheckCircle2, Clock3, MapPin, ShieldX } from "lucide-react";

const icons = { success: CheckCircle2, warning: AlertTriangle, error: ShieldX, idle: Clock3 };

const resultText = {
  zh: {
    CHECKIN_SUCCESS: ["可入場", "已完成簽到，請依下一步提示引導。"],
    LATE_CHECKIN: ["遲到入場", "已記錄遲到狀態，請依活動規則處理。"],
    WAITLIST_ADMITTED: ["候補可入場", "正取逾 30 分鐘未到，名額已自動釋出。"],
    WAITLIST_ONSITE_ADMISSION: ["現場候補已報到", "此活動未滿額或不受座位限制，已保留候補身分紀錄。"],
    CHECKOUT_SUCCESS: ["簽退完成", "簽到與簽退的出勤紀錄已完整留存。"],
    CHECKOUT_NOT_REQUIRED: ["不需要簽退", "此活動只需要完成 Check-in。"],
    CHECKOUT_WITHOUT_CHECKIN: ["無法簽退", "查無 Check-in 紀錄，請交由現場人員確認。"],
    ALREADY_CHECKED_IN: ["已完成簽到", "此人員不需要再次報到。"],
    ALREADY_CHECKED_OUT: ["已完成簽退", "此人員不需要再次簽退。"],
    REENTRY_SUCCESS: ["再次入場已記錄", "已更新本次活動的入場次數。"],
    LATE_ENTRY_BLOCKED: ["不可入場", "已超過此活動設定的最晚入場時間。"],
    ACCESS_DENIED: ["入場遭拒", "請轉交管理員確認人員權限。"],
    WAITLIST_NOT_OPEN: ["候補尚未開放", "正取名額會在開始 30 分鐘後依未到狀態釋出。"],
    NO_WAITLIST_SEAT: ["目前沒有候補名額", "所有可釋出的名額已使用，請維持候補順位。"],
    NOT_REGISTERED: ["查無報名資料", "請確認識別碼，或交由管理員建立人工紀錄。"],
  },
  en: {
    CHECKIN_SUCCESS: ["Admission approved", "Check-in is complete. Follow the next-step guidance."],
    LATE_CHECKIN: ["Late admission", "Late status is recorded; follow the event policy."],
    WAITLIST_ADMITTED: ["Waitlist admitted", "A reserved attendee did not arrive after 30 minutes, so a seat was released."],
    WAITLIST_ONSITE_ADMISSION: ["On-site waitlist checked in", "This event is not full or is not seat-limited; the waitlist status is retained."],
    CHECKOUT_SUCCESS: ["Check-out complete", "The two-way attendance record is complete."],
    CHECKOUT_NOT_REQUIRED: ["No check-out needed", "This event only requires check-in."],
    CHECKOUT_WITHOUT_CHECKIN: ["Cannot check out", "No check-in record; send to manual review."],
    ALREADY_CHECKED_IN: ["Already checked in", "No additional action is required."],
    ALREADY_CHECKED_OUT: ["Already checked out", "No additional action is required."],
    REENTRY_SUCCESS: ["Re-entry recorded", "The repeat entry count has been updated."],
    LATE_ENTRY_BLOCKED: ["Admission denied", "The strict entry cutoff has passed."],
    ACCESS_DENIED: ["Access denied", "Send this person to manual review."],
    WAITLIST_NOT_OPEN: ["Waitlist not open", "Reserved seats are released after 30 minutes based on no-shows."],
    NO_WAITLIST_SEAT: ["No waitlist seat", "All released seats are in use. Keep the waitlist position."],
    NOT_REGISTERED: ["Registration not found", "Verify the ID or create a manual record."],
  },
};

const nextStepText = {
  zh: {
    SHOW_SEAT: "請引導至指定座位",
    SHOW_GROUP: "告知分組與工作坊角色",
    VERIFY_IDENTITY: "請核對身分證件",
    SEND_MATERIALS: "教材已自動寄送至 Email",
    ISSUE_EARLY_BIRD: "符合早鳥資格，請發放福利",
    MANUAL_REVIEW: "請轉交現場管理員人工確認",
    WAIT_FOR_RELEASE: "請保留候補順位並等待名額釋出",
  },
  en: {
    SHOW_SEAT: "Guide the attendee to the assigned seat",
    SHOW_GROUP: "Share the group and workshop role",
    VERIFY_IDENTITY: "Verify identity documents",
    SEND_MATERIALS: "Materials were sent automatically by email",
    ISSUE_EARLY_BIRD: "Early-bird eligible; issue the benefit",
    MANUAL_REVIEW: "Send to the operator for manual review",
    WAIT_FOR_RELEASE: "Keep the waitlist position and wait for a released seat",
  },
};

export default function ResultPanel({ result, activeEvent, language, t }) {
  const tone = result?.tone || "idle";
  const Icon = icons[tone];
  const [title, description] = result ? resultText[language][result.code] || [result.code, ""] : [t("waiting"), t("waitingHint")];
  const seat = result?.allowed && activeEvent.seatingEnabled ? result.person?.seat : null;

  return (
    <aside className={`result-panel tone-${tone}`}>
      <div className="result-topline"><span>LIVE RESULT</span>{result?.person && <small>{result.person.id}</small>}</div>
      <div className="result-icon"><Icon size={32} strokeWidth={1.8} /></div>
      <div className="result-copy">
        <h2>{title}</h2><p>{description}</p>
        {result?.timestamp && <span className="result-timestamp">{result.timestamp.full}</span>}
        {result?.person && <div className="person-summary"><strong>{result.person.name[language]}</strong><span>{result.person.department[language]}</span></div>}
      </div>
      {seat && <div className="seat-guidance"><MapPin size={17} /><div><span>{language === "zh" ? "您的座位" : "Assigned seat"}</span><strong>{seat}</strong></div></div>}
      {result?.earlyBirdEligible && <div className="benefit-guidance"><span>{language === "zh" ? "早鳥福利" : "EARLY-BIRD BENEFIT"}</span><strong>{activeEvent.earlyBirdBenefit?.[language]}</strong></div>}
      <div className="next-steps">
        <span>{t("nextStep")}</span>
        {result?.nextSteps?.length ? <ul>{result.nextSteps.map((step) => <li key={step}>{nextStepText[language][step] || step}</li>)}</ul> : <strong>{result ? (language === "zh" ? "可處理下一位人員" : "Continue with the next attendee") : t("nextDefault")}</strong>}
      </div>
    </aside>
  );
}

