import { useMemo, useRef, useState } from "react";
import {
  Armchair,
  BookOpenCheck,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Gift,
  MapPin,
  Pencil,
  Sparkles,
  TicketCheck,
  Upload,
  Users,
  X,
} from "lucide-react";
import { getEventReadiness, parseRosterCsv, sortEventsByStart } from "../domain/eventManagementV2.js";
import "./featureStyles.css";

const moduleDefinitions = [
  { id: "materials", icon: BookOpenCheck, title: "教材管理", description: "完成 Check-in 後自動寄送教材，後台可查詢與重寄。" },
  { id: "seating", icon: Armchair, title: "座位管理", description: "預先分配座位，報到成功時立即顯示座位指引。" },
  { id: "earlyBird", icon: Gift, title: "早鳥福利", description: "依報名順位與準時報到條件，自動判斷福利資格。" },
  { id: "lottery", icon: Sparkles, title: "現場抽獎", description: "從符合資格的參與者中抽獎，保留中獎與排除紀錄。" },
  { id: "waitlist", icon: TicketCheck, title: "候補管理", description: "額滿活動可在正取逾時未到後，自動釋出候補名額。" },
];

function createEmptyForm() {
  return {
    id: "",
    title: "",
    organizer: "",
    contact: "",
    description: "",
    date: "2026-08-01",
    startTime: "09:00",
    endTime: "12:00",
    location: "",
    capacity: 50,
    capacityLimited: true,
    requireCheckout: true,
    lateAfterMin: 15,
    absentAfterMin: 30,
    earlyLeaveMin: 30,
    waitlistReleaseMin: 30,
    modules: { materials: false, seating: false, earlyBird: false, lottery: false, waitlist: false },
    materialName: "",
    earlyBirdQuota: 50,
    earlyBirdBenefit: "",
    lotteryPrize: "",
    lotteryWinnerCount: 1,
    lotteryEligibility: "checkedIn",
  };
}

function eventToForm(event) {
  return {
    ...createEmptyForm(),
    id: event.id,
    title: event.title.zh,
    organizer: event.organizer || "",
    contact: event.contact || "",
    description: event.description || "",
    date: event.date,
    startTime: event.startTime || event.time.split(" - ")[0],
    endTime: event.endTime || event.time.split(" - ")[1],
    location: event.location.zh,
    capacity: event.capacity,
    capacityLimited: event.capacityLimited,
    requireCheckout: event.requireCheckout,
    lateAfterMin: event.rules?.lateAfterMin ?? 15,
    absentAfterMin: event.rules?.absentAfterMin ?? 30,
    earlyLeaveMin: event.rules?.earlyLeaveMin ?? 30,
    waitlistReleaseMin: event.rules?.waitlistReleaseMin ?? 30,
    modules: { ...createEmptyForm().modules, ...event.modules },
    materialName: event.materialName?.zh || "",
    earlyBirdQuota: event.earlyBirdQuota || 50,
    earlyBirdBenefit: event.earlyBirdBenefit?.zh || "",
    lotteryPrize: event.lottery?.prizeName || "",
    lotteryWinnerCount: event.lottery?.winnerCount || 1,
    lotteryEligibility: event.lottery?.eligibility || "checkedIn",
  };
}

function getDurationMinutes(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute);
}

function Field({ label, children, wide = false, hint }) {
  return <label className={`builder-field ${wide ? "field-wide" : ""}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function EventManagementPage({
  events,
  rostersByEvent,
  activeEventId,
  onSelect,
  onSave,
  sampleRoster,
  language,
}) {
  const isZh = language === "zh";
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [importedPeople, setImportedPeople] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef(null);
  const orderedEvents = useMemo(() => sortEventsByStart(events), [events]);

  const previewEvent = {
    title: { zh: form.title, en: form.title },
    organizer: form.organizer,
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    location: { zh: form.location, en: form.location },
    capacity: Number(form.capacity),
    modules: form.modules,
    materialName: form.modules.materials ? { zh: form.materialName, en: form.materialName } : null,
    earlyBirdQuota: form.modules.earlyBird ? Number(form.earlyBirdQuota) : 0,
    earlyBirdBenefit: form.modules.earlyBird ? { zh: form.earlyBirdBenefit, en: form.earlyBirdBenefit } : null,
    lottery: form.modules.lottery ? { prizeName: form.lotteryPrize, winnerCount: Number(form.lotteryWinnerCount), eligibility: form.lotteryEligibility } : null,
  };
  const readiness = getEventReadiness(previewEvent, importedPeople);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleModule(moduleId) {
    setForm((current) => ({ ...current, modules: { ...current.modules, [moduleId]: !current.modules[moduleId] } }));
  }

  function startNew() {
    setForm(createEmptyForm());
    setImportedPeople([]);
    setImportMessage("");
    setEditorOpen(true);
  }

  function editEvent(event) {
    setForm(eventToForm(event));
    setImportedPeople(rostersByEvent[event.id] || []);
    setImportMessage((rostersByEvent[event.id] || []).length ? `目前名單共 ${(rostersByEvent[event.id] || []).length} 人` : "尚未匯入名單");
    setEditorOpen(true);
  }

  async function importFile(file) {
    if (!file) return;
    try {
      const people = parseRosterCsv(await file.text());
      setImportedPeople(people);
      setImportMessage(`已匯入 ${people.length} 人：正取 ${people.filter((person) => person.type === "registered").length}、候補 ${people.filter((person) => person.type === "waitlist").length}`);
    } catch (error) {
      setImportedPeople([]);
      setImportMessage(error.message);
    }
  }

  function useDemoRoster() {
    setImportedPeople(sampleRoster);
    setImportMessage(`已載入展示名單 ${sampleRoster.length} 人，可直接進行流程展示`);
  }

  function downloadTemplate() {
    const content = "id,name,department,email,type,seat\nT001,王小明,產品部,user@example.com,registered,A-01\nW001,陳小美,行銷部,waitlist@example.com,waitlist,A-02";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" }));
    link.download = "活動名單匯入範本.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function buildEvent(lifecycle) {
    const id = form.id || `EVT-${form.date.replaceAll("-", "")}-${Date.now().toString().slice(-4)}`;
    const registeredCount = importedPeople.filter((person) => person.type === "registered").length;
    return {
      id,
      lifecycle,
      templateId: "training",
      title: { zh: form.title.trim() || "未命名活動", en: form.title.trim() || "Untitled event" },
      organizer: form.organizer.trim(),
      contact: form.contact.trim(),
      description: form.description.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      time: `${form.startTime} - ${form.endTime}`,
      location: { zh: form.location.trim(), en: form.location.trim() },
      capacity: Number(form.capacity) || 0,
      capacityLimited: form.capacityLimited,
      registrationFull: form.capacityLimited && registeredCount >= Number(form.capacity),
      seatingEnabled: form.modules.seating,
      requireCheckout: form.requireCheckout,
      modules: form.modules,
      materialName: form.modules.materials && form.materialName.trim() ? { zh: form.materialName.trim(), en: form.materialName.trim() } : null,
      earlyBirdQuota: form.modules.earlyBird ? Number(form.earlyBirdQuota) : 0,
      earlyBirdBenefit: form.modules.earlyBird ? { zh: form.earlyBirdBenefit.trim(), en: form.earlyBirdBenefit.trim() } : null,
      lottery: form.modules.lottery ? { prizeName: form.lotteryPrize.trim(), winnerCount: Number(form.lotteryWinnerCount), eligibility: form.lotteryEligibility } : null,
      rules: {
        lateAfterMin: Number(form.lateAfterMin),
        absentAfterMin: Number(form.absentAfterMin),
        earlyLeaveMin: Number(form.earlyLeaveMin),
        waitlistReleaseMin: Number(form.waitlistReleaseMin),
      },
      startMinutes: 0,
      endMinutes: getDurationMinutes(form.startTime, form.endTime),
      status: lifecycle === "draft" ? "draft" : "upcoming",
    };
  }

  function save(lifecycle) {
    const event = buildEvent(lifecycle);
    onSave(event, importedPeople, lifecycle === "activated");
    setForm((current) => ({ ...current, id: event.id }));
    if (lifecycle === "activated") setEditorOpen(false);
  }

  return (
    <div className="page-stack event-management-page">
      <div className="page-heading-row">
        <div className="page-intro"><span>EVENT MANAGEMENT</span><h1>{isZh ? "活動管理" : "Event management"}</h1><p>{isZh ? "建立活動、匯入名單並依需求開啟模組；通過檢查後才正式啟用。" : "Create events, import rosters and enable only the modules each event needs."}</p></div>
        <button className="primary-small heading-action" type="button" onClick={startNew}><CalendarPlus size={16} /> {isZh ? "新增活動" : "New event"}</button>
      </div>

      {!editorOpen && <>
        <section className="event-overview-strip">
          <div><span>{isZh ? "活動總數" : "Events"}</span><strong>{events.length}</strong></div>
          <div><span>{isZh ? "已啟用" : "Activated"}</span><strong>{events.filter((event) => event.lifecycle === "activated").length}</strong></div>
          <div><span>{isZh ? "草稿待完成" : "Drafts"}</span><strong>{events.filter((event) => event.lifecycle === "draft").length}</strong></div>
          <p>{isZh ? "活動依開始時間排序；只有已啟用活動可以切換至智慧報到。" : "Events are sorted by start time. Only activated events can be used at check-in."}</p>
        </section>
        <div className="event-list">
          {orderedEvents.map((event) => {
            const rosterCount = (rostersByEvent[event.id] || []).length;
            const enabledModules = moduleDefinitions.filter((module) => event.modules?.[module.id]);
            const isActive = event.id === activeEventId;
            return <article className={`event-row event-admin-row ${isActive ? "selected" : ""}`} key={event.id}>
              <div className="event-date"><strong>{event.date.slice(8)}</strong><span>{event.date.slice(5, 7)} / {event.date.slice(0, 4)}</span></div>
              <div className="event-row-main">
                <div className="event-title-line"><span className={`event-state ${event.lifecycle}`}>{event.lifecycle === "draft" ? (isZh ? "草稿" : "Draft") : (isActive ? (isZh ? "使用中" : "Active") : (isZh ? "已啟用" : "Activated"))}</span><h2>{event.title[language]}</h2></div>
                <p><Clock3 size={15} /> {event.time}<MapPin size={15} /> {event.location[language]}<Users size={15} /> {rosterCount} / {event.capacity}</p>
                <div className="event-flags">{enabledModules.length ? enabledModules.map(({ id, title, icon: Icon }) => <span key={id}><Icon size={13} /> {title}</span>) : <span>{isZh ? "僅核心報到" : "Core check-in only"}</span>}</div>
              </div>
              <div className="event-row-actions">
                <button className="outline-button compact-button" type="button" onClick={() => editEvent(event)}><Pencil size={13} /> {isZh ? "編輯設定" : "Edit"}</button>
                <button className="primary-small compact-button" type="button" disabled={event.lifecycle !== "activated"} onClick={() => onSelect(event.id)}><TicketCheck size={13} /> {isActive ? (isZh ? "前往報到" : "Open check-in") : (isZh ? "切換活動" : "Select")}</button>
              </div>
            </article>;
          })}
        </div>
      </>}

      {editorOpen && <div className="event-builder">
        <div className="builder-topbar">
          <div><span className="section-kicker">{form.id ? "EDIT EVENT" : "NEW EVENT"}</span><h2>{form.id ? (isZh ? "編輯活動設定" : "Edit event") : (isZh ? "建立新活動" : "Create event")}</h2></div>
          <button className="text-button compact-button" type="button" onClick={() => setEditorOpen(false)}><X size={15} /> {isZh ? "返回列表" : "Back"}</button>
        </div>
        <div className="builder-steps"><span className="done"><Check size={14} /> 1. 基本資料</span><span><Check size={14} /> 2. 規則設定</span><span><Check size={14} /> 3. 功能模組</span><span><Check size={14} /> 4. 名單與啟用</span></div>

        <section className="builder-section">
          <div className="builder-section-heading"><span>01</span><div><h3>基本資料</h3><p>作為活動列表、報到頁與通知內容的共同資料來源。</p></div></div>
          <div className="builder-form-grid">
            <Field label="活動名稱" wide><input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="例如：跨部門領導力工作坊" /></Field>
            <Field label="主辦單位"><input value={form.organizer} onChange={(event) => update("organizer", event.target.value)} placeholder="人才發展部" /></Field>
            <Field label="聯絡窗口"><input value={form.contact} onChange={(event) => update("contact", event.target.value)} placeholder="Email 或分機" /></Field>
            <Field label="活動日期"><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></Field>
            <Field label="開始時間"><input type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} /></Field>
            <Field label="結束時間"><input type="time" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} /></Field>
            <Field label="活動地點"><input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="台北總部 12F" /></Field>
            <Field label="人數上限"><input type="number" min="1" value={form.capacity} onChange={(event) => update("capacity", event.target.value)} /></Field>
            <Field label="活動說明" wide><textarea rows="3" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="簡述活動目的、對象與現場注意事項" /></Field>
          </div>
        </section>

        <section className="builder-section">
          <div className="builder-section-heading"><span>02</span><div><h3>報到與出勤規則</h3><p>規則由活動自行設定，不需要修改系統程式。</p></div></div>
          <div className="rule-toggle-row">
            <button type="button" className={form.requireCheckout ? "active" : ""} onClick={() => update("requireCheckout", !form.requireCheckout)}><span className="toggle-visual" /><strong>需要 Check-out</strong><small>適合培訓、學分與完整出勤紀錄</small></button>
            <button type="button" className={form.capacityLimited ? "active" : ""} onClick={() => update("capacityLimited", !form.capacityLimited)}><span className="toggle-visual" /><strong>座位／人數有限</strong><small>啟用容量控管與額滿判定</small></button>
          </div>
          <div className="builder-form-grid compact-grid">
            <Field label="遲到判定（分鐘）"><input type="number" min="0" value={form.lateAfterMin} onChange={(event) => update("lateAfterMin", event.target.value)} /></Field>
            <Field label="未到判定（分鐘）"><input type="number" min="0" value={form.absentAfterMin} onChange={(event) => update("absentAfterMin", event.target.value)} /></Field>
            {form.requireCheckout && <Field label="早退判定（距結束分鐘）"><input type="number" min="0" value={form.earlyLeaveMin} onChange={(event) => update("earlyLeaveMin", event.target.value)} /></Field>}
          </div>
        </section>

        <section className="builder-section">
          <div className="builder-section-heading"><span>03</span><div><h3>功能模組</h3><p>只開啟活動真正需要的能力，啟用後才會出現在側邊選單。</p></div></div>
          <div className="module-selector-grid">
            {moduleDefinitions.map(({ id, icon: Icon, title, description }) => <button key={id} type="button" className={form.modules[id] ? "selected" : ""} onClick={() => toggleModule(id)}><span className="module-icon"><Icon size={18} /></span><span><strong>{title}</strong><small>{description}</small></span><span className="module-check">{form.modules[id] && <Check size={14} />}</span></button>)}
          </div>
          <div className="conditional-settings">
            {form.modules.materials && <Field label="教材名稱／內容"><input value={form.materialName} onChange={(event) => update("materialName", event.target.value)} placeholder="例如：課程講義 PDF 與課後測驗" /></Field>}
            {form.modules.earlyBird && <><Field label="早鳥名額"><input type="number" min="1" value={form.earlyBirdQuota} onChange={(event) => update("earlyBirdQuota", event.target.value)} /></Field><Field label="早鳥福利"><input value={form.earlyBirdBenefit} onChange={(event) => update("earlyBirdBenefit", event.target.value)} placeholder="例如：200 元電子禮券" /></Field></>}
            {form.modules.lottery && <><Field label="抽獎獎項"><input value={form.lotteryPrize} onChange={(event) => update("lotteryPrize", event.target.value)} placeholder="例如：超商禮券 500 元" /></Field><Field label="每輪中獎人數"><input type="number" min="1" value={form.lotteryWinnerCount} onChange={(event) => update("lotteryWinnerCount", event.target.value)} /></Field><Field label="抽獎資格"><select value={form.lotteryEligibility} onChange={(event) => update("lotteryEligibility", event.target.value)}><option value="checkedIn">限已報到者</option><option value="allRegistered">所有正取者</option><option value="earlyBird">限已報到早鳥</option></select></Field></>}
            {form.modules.waitlist && <Field label="候補釋位時間"><input type="number" min="0" value={form.waitlistReleaseMin} onChange={(event) => update("waitlistReleaseMin", event.target.value)} /><small>活動開始後幾分鐘，自動釋出未到正取名額</small></Field>}
          </div>
        </section>

        <section className="builder-section">
          <div className="builder-section-heading"><span>04</span><div><h3>匯入活動名單</h3><p>支援 CSV，必要欄位為 id、name、email；可另含 department、type、seat。</p></div></div>
          <div className="roster-import-panel">
            <input ref={fileInputRef} hidden type="file" accept=".csv,text/csv" onChange={(event) => importFile(event.target.files?.[0])} />
            <div className="import-illustration"><FileSpreadsheet size={27} /></div>
            <div className="import-copy"><strong>{importedPeople.length ? `${importedPeople.length} 人已準備匯入` : "尚未匯入活動名單"}</strong><span>{importMessage || "匯入後會檢查必要欄位、重複識別碼與正取／候補身分。"}</span></div>
            <div className="import-actions"><button className="outline-button compact-button" type="button" onClick={downloadTemplate}>下載範本</button><button className="outline-button compact-button" type="button" onClick={useDemoRoster}>載入展示名單</button><button className="primary-small compact-button" type="button" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> 選擇 CSV</button></div>
          </div>
          {importedPeople.length > 0 && <div className="import-preview"><span>前 5 筆預覽</span>{importedPeople.slice(0, 5).map((person) => <div key={person.id}><strong>{person.name.zh}</strong><span>{person.id}</span><span>{person.department.zh}</span><span>{person.typeLabel.zh}</span><span>{person.seat}</span></div>)}</div>}
        </section>

        <section className="activation-panel">
          <div><span className="section-kicker">PRE-FLIGHT CHECK</span><h3>啟用前檢查</h3><p>啟用後，智慧報到與已選模組會立即開放給現場工作人員。</p></div>
          <div className="readiness-list">
            <span className={readiness.detailsReady ? "ready" : ""}>{readiness.detailsReady ? <CheckCircle2 size={16} /> : <Clock3 size={16} />} 基本資料與時間完整</span>
            <span className={readiness.rosterReady ? "ready" : ""}>{readiness.rosterReady ? <CheckCircle2 size={16} /> : <Clock3 size={16} />} 已匯入活動名單</span>
            <span className={readiness.modulesReady ? "ready" : ""}>{readiness.modulesReady ? <CheckCircle2 size={16} /> : <Clock3 size={16} />} 模組必要設定完成</span>
          </div>
          <div className="activation-actions"><button className="outline-button" type="button" onClick={() => save("draft")}>儲存草稿</button><button className="activate-button" type="button" disabled={!readiness.ready} onClick={() => save("activated")}><CheckCircle2 size={16} /> 確認啟用活動</button></div>
        </section>
      </div>}
    </div>
  );
}
