import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import CheckinPage from "./components/CheckinPage.jsx";
import {
  BenefitsPage,
  EventsPage,
  MaterialsPage,
  ReportsPage,
  SeatingPage,
  SettingsPage,
} from "./components/ManagementPages.jsx";
import { applyAction, computeStats, evaluateAction, formatAttendanceTimestamp } from "./domain/checkinEngine.js";
import { getTemplate } from "./domain/templates.js";
import { events, roster } from "./data/mockData.js";
import { createTranslator } from "./i18n.js";

export default function App() {
  const [language, setLanguage] = useState("zh");
  const [activePage, setActivePage] = useState(() => {
    const page = new URLSearchParams(window.location.search).get("page");
    return ["checkin", "events", "materials", "seating", "benefits", "reports", "settings"].includes(page) ? page : "checkin";
  });
  const [activeEventId, setActiveEventId] = useState(events[0].id);
  const [elapsedMinutes, setElapsedMinutes] = useState(5);
  const [inputValue, setInputValue] = useState("");
  const [records, setRecords] = useState({});
  const [materialRecords, setMaterialRecords] = useState({});
  const [benefitRecords, setBenefitRecords] = useState({});
  const [result, setResult] = useState(null);

  const t = useMemo(() => createTranslator(language), [language]);
  const activeEvent = events.find((event) => event.id === activeEventId) || events[0];
  const template = getTemplate(activeEvent.templateId);
  const stats = computeStats({ people: roster, event: activeEvent, template, elapsedMinutes, records });

  function selectEvent(eventId) {
    setActiveEventId(eventId);
    setRecords({});
    setMaterialRecords({});
    setBenefitRecords({});
    setResult(null);
    setElapsedMinutes(5);
  }

  function scan(action) {
    const id = inputValue.trim().toUpperCase();
    const person = roster.find((item) => item.id === id);
    const evaluation = evaluateAction({
      action,
      person,
      event: activeEvent,
      template,
      elapsedMinutes,
      records,
      people: roster,
    });
    const timestamp = formatAttendanceTimestamp(activeEvent, elapsedMinutes);
    const completeResult = { ...evaluation, person: person || null, timestamp };

    if (evaluation.allowed && person) {
      setRecords((current) => applyAction(current, person.id, action, elapsedMinutes, {
        admissionType: evaluation.admissionType,
      }));
      if (action === "checkin" && evaluation.materialsEligible) {
        setMaterialRecords((current) => ({
          ...current,
          [person.id]: { status: "sent", sentAt: elapsedMinutes, resendCount: current[person.id]?.resendCount || 0 },
        }));
      }
      if (action === "checkin" && evaluation.earlyBirdEligible) {
        setBenefitRecords((current) => ({ ...current, [person.id]: { eligible: true, issued: false } }));
      }
    }

    setResult(completeResult);
    setInputValue("");
  }

  function resendMaterial(personId) {
    setMaterialRecords((current) => ({
      ...current,
      [personId]: {
        status: "sent",
        sentAt: elapsedMinutes,
        resendCount: (current[personId]?.resendCount || 0) + 1,
      },
    }));
  }

  function issueBenefit(personId) {
    setBenefitRecords((current) => ({ ...current, [personId]: { ...current[personId], eligible: true, issued: true, issuedAt: elapsedMinutes } }));
  }

  let content;
  if (activePage === "events") content = <EventsPage events={events} activeEventId={activeEventId} onSelect={selectEvent} language={language} t={t} />;
  else if (activePage === "materials") content = <MaterialsPage people={roster} event={activeEvent} records={records} materialRecords={materialRecords} elapsedMinutes={elapsedMinutes} onResend={resendMaterial} language={language} t={t} />;
  else if (activePage === "seating") content = <SeatingPage people={roster} event={activeEvent} records={records} language={language} t={t} />;
  else if (activePage === "benefits") content = <BenefitsPage people={roster} event={activeEvent} template={template} records={records} benefitRecords={benefitRecords} elapsedMinutes={elapsedMinutes} onIssue={issueBenefit} language={language} t={t} />;
  else if (activePage === "reports") content = <ReportsPage stats={stats} event={activeEvent} language={language} t={t} />;
  else if (activePage === "settings") content = <SettingsPage event={activeEvent} template={template} language={language} t={t} />;
  else content = <CheckinPage
    activeEvent={activeEvent}
    template={template}
    language={language}
    t={t}
    people={roster}
    records={records}
    elapsedMinutes={elapsedMinutes}
    setElapsedMinutes={setElapsedMinutes}
    inputValue={inputValue}
    setInputValue={setInputValue}
    onScan={scan}
    result={result}
  />;

  return (
    <div className="app-shell">
      <Sidebar active={activePage} onChange={setActivePage} t={t} />
      <div className="app-main">
        <Topbar language={language} setLanguage={setLanguage} t={t} />
        <main className="main-content">{content}</main>
      </div>
    </div>
  );
}







