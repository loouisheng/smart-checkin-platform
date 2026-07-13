import { CalendarPlus, CheckCircle2 } from "lucide-react";
import "./featureStyles.css";

export default function EmptyCheckinState({ onGoEvents, language }) {
  const isZh = language === "zh";
  return <section className="empty-checkin">
    <div className="empty-checkin-icon"><CalendarPlus size={31} /></div>
    <span className="section-kicker">SMART CHECK-IN</span>
    <h1>{isZh ? "智慧報到尚未啟用" : "Smart check-in is not active yet"}</h1>
    <p>{isZh ? "請先建立或選擇一個已啟用活動。新活動必須完成基本資料、名單匯入與模組設定，通過檢查後才能開始報到。" : "Create or select an activated event. New events need event details, an imported roster and completed module settings before check-in can begin."}</p>
    <div className="empty-checkin-steps"><span><CheckCircle2 size={13} /> 建立活動</span><span><CheckCircle2 size={13} /> 匯入名單</span><span><CheckCircle2 size={13} /> 確認啟用</span></div>
    <button className="primary-small heading-action" type="button" onClick={onGoEvents}><CalendarPlus size={15} /> {isZh ? "前往活動管理" : "Go to event management"}</button>
  </section>;
}
