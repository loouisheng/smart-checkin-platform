import { CalendarClock, CalendarRange } from "lucide-react";
import "./survey.css";

export function SurveySettings({ form, update, t }) {
  return <div className="survey-settings wide">
    <label><span>{t("surveyUrl")}</span><input type="url" value={form.surveyUrl} onChange={(event) => update("surveyUrl", event.target.value)} /></label>
    <fieldset><legend>{t("surveyTiming")}</legend><div className="survey-timing-options">
      <label className={form.surveyTiming === "before" ? "selected" : ""}><input type="radio" name="surveyTiming" value="before" checked={form.surveyTiming === "before"} onChange={() => update("surveyTiming", "before")} /><CalendarRange size={17} /><span><strong>{t("surveyBefore")}</strong><small>{t("surveyBeforeDesc")}</small></span></label>
      <label className={form.surveyTiming !== "before" ? "selected" : ""}><input type="radio" name="surveyTiming" value="after" checked={form.surveyTiming !== "before"} onChange={() => update("surveyTiming", "after")} /><CalendarClock size={17} /><span><strong>{t("surveyAfter")}</strong><small>{t("surveyAfterDesc")}</small></span></label>
    </div></fieldset>
  </div>;
}
