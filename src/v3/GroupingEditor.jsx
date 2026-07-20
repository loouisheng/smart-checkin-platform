import { LockKeyhole, Shuffle, UserRoundCog, UsersRound } from "lucide-react";
import { localize } from "./i18n.js";
import "./grouping.css";

const modes = [
  ["none", UsersRound],
  ["automatic", Shuffle],
  ["manual", UserRoundCog],
];

export function GroupingEditor({ source, form, setForm, language, t, lmsEvent }) {
  if (source === "lms") {
    return <div className="lms-grouping-readonly"><LockKeyhole size={17} /><div><strong>{t(`groupMode_${lmsEvent?.grouping?.mode || "none"}`)}</strong><p>{t("lmsGroupingManagedExternally")}</p></div></div>;
  }
  const update = (values) => setForm((current) => ({ ...current, ...values }));
  return <>
    <div className="group-mode-options">{modes.map(([mode, Icon]) => <button type="button" key={mode} className={form.groupingMode === mode ? "selected" : ""} onClick={() => update({ groupingMode: mode, grouping: mode !== "none" })} aria-pressed={form.groupingMode === mode}><Icon size={18} /><span><strong>{t(`groupMode_${mode}`)}</strong><small>{t(`groupMode_${mode}Desc`)}</small></span></button>)}</div>
    {form.groupingMode === "automatic" && <label className="automatic-group-size"><span>{t("groupSize")}</span><input type="number" min="2" value={form.groupSize} onChange={(event) => update({ groupSize: event.target.value })} /></label>}
    {form.groupingMode === "manual" && <div className="manual-group-list">
      {(form.rosterPeople || []).map((person) => <label key={person.id}><span><strong>{localize(person.name, language)}</strong><small>{person.id}</small></span><input value={form.manualAssignments?.[person.id] || ""} onChange={(event) => setForm((current) => ({ ...current, manualAssignments: { ...(current.manualAssignments || {}), [person.id]: event.target.value } }))} placeholder={t("groupNamePlaceholder")} /></label>)}
    </div>}
  </>;
}
