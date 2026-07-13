import { useMemo, useState } from "react";
import Topbar from "./components/Topbar.jsx";
import SidebarV2 from "./components/SidebarV2.jsx";
import CheckinPage from "./components/CheckinPage.jsx";
import EmptyCheckinState from "./components/EmptyCheckinState.jsx";
import EventManagementPage from "./components/EventManagementPage.jsx";
import LotteryPage from "./components/LotteryPageV2.jsx";
import { BenefitsPage, MaterialsPage, ReportsPage, SeatingPage } from "./components/ManagementPages.jsx";
import { applyAction, computeStats, evaluateAction, formatAttendanceTimestamp } from "./domain/checkinEngine.js";
import { buildEventTemplate, drawWinners, sortEventsByStart } from "./domain/eventManagementV2.js";
import { events as sampleEvents, roster as sampleRoster } from "./data/mockData.js";
import { createTranslator } from "./i18n.js";

function hydrateEvent(event) {
  const modules = event.modules || {
    materials: Boolean(event.materialName),
    seating: Boolean(event.seatingEnabled),
    earlyBird: Boolean(event.earlyBirdQuota),
    lottery: event.templateId === "staff",
    waitlist: Boolean(event.capacityLimited),
  };
  return {
    ...event,
    lifecycle: event.lifecycle || "activated",
    organizer: event.organizer || "\u6d3b\u52d5\u4e3b\u8fa6\u55ae\u4f4d",
    contact: event.contact || "",
    description: event.description || "",
    startTime: event.startTime || event.time.split(" - ")[0],
    endTime: event.endTime || event.time.split(" - ")[1],
    requireCheckout: event.requireCheckout ?? event.templateId === "training",
    modules,
    lottery: event.lottery || (modules.lottery ? { prizeName: "\u73fe\u5834\u9a5a\u559c\u79ae\u5238", winnerCount: 2, eligibility: "checkedIn" } : null),
    rules: event.rules || { lateAfterMin: 15, absentAfterMin: 30, earlyLeaveMin: 30, waitlistReleaseMin: 30 },
  };
}

const initialEvents = sortEventsByStart(sampleEvents.map(hydrateEvent));
const emptyStats = { expected: 0, arrived: 0, unresolved: 0, openSeats: 0, entries: 0, waitlistSlots: 0 };

export default function AppV2() {
  const [language, setLanguage] = useState("zh");
  const [activePage, setActivePage] = useState(() => {
    const page = new URLSearchParams(window.location.search).get("page");
    return ["checkin", "events", "materials", "seating", "benefits", "lottery", "reports"].includes(page) ? page : "events";
  });
  const [eventList, setEventList] = useState(initialEvents);
  const [rostersByEvent, setRostersByEvent] = useState(() => Object.fromEntries(initialEvents.map((event) => [event.id, sampleRoster])));
  const [activeEventId, setActiveEventId] = useState(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(5);
  const [inputValue, setInputValue] = useState("");
  const [recordsByEvent, setRecordsByEvent] = useState({});
  const [materialsByEvent, setMaterialsByEvent] = useState({});
  const [benefitsByEvent, setBenefitsByEvent] = useState({});
  const [lotteriesByEvent, setLotteriesByEvent] = useState({});
  const [result, setResult] = useState(null);

  const t = useMemo(() => createTranslator(language), [language]);
  const activeEvent = eventList.find((event) => event.id === activeEventId) || null;
  const people = activeEvent ? rostersByEvent[activeEvent.id] || [] : [];
  const template = activeEvent ? buildEventTemplate(activeEvent) : null;
  const records = activeEvent ? recordsByEvent[activeEvent.id] || {} : {};
  const materialRecords = activeEvent ? materialsByEvent[activeEvent.id] || {} : {};
  const benefitRecords = activeEvent ? benefitsByEvent[activeEvent.id] || {} : {};
  const lotteryState = activeEvent ? lotteriesByEvent[activeEvent.id] || { winners: [], lastDraw: [], drawNumber: 0 } : { winners: [], lastDraw: [], drawNumber: 0 };
  const stats = activeEvent ? computeStats({ people, event: activeEvent, template, elapsedMinutes, records }) : emptyStats;

  function updateEventMap(setter, eventId, updater) {
    setter((current) => ({ ...current, [eventId]: updater(current[eventId] || {}) }));
  }

  function selectEvent(eventId) {
    const event = eventList.find((item) => item.id === eventId);
    if (!event || event.lifecycle !== "activated") return;
    setActiveEventId(eventId);
    setResult(null);
    setElapsedMinutes(5);
    setInputValue("");
    setActivePage("checkin");
  }

  function saveEvent(event, importedPeople, activate) {
    const nextEvent = hydrateEvent(event);
    setEventList((current) => sortEventsByStart([...current.filter((item) => item.id !== nextEvent.id), nextEvent]));
    setRostersByEvent((current) => ({ ...current, [nextEvent.id]: importedPeople }));
    if (activate) {
      setActiveEventId(nextEvent.id);
      setResult(null);
      setElapsedMinutes(5);
      setActivePage("checkin");
    }
  }

  function scan(action) {
    if (!activeEvent) return;
    const id = inputValue.trim().toUpperCase();
    const person = people.find((item) => item.id === id);
    const evaluation = evaluateAction({ action, person, event: activeEvent, template, elapsedMinutes, records, people });
    const timestamp = formatAttendanceTimestamp(activeEvent, elapsedMinutes);
    const completeResult = { ...evaluation, person: person || null, timestamp };

    if (evaluation.allowed && person) {
      updateEventMap(setRecordsByEvent, activeEvent.id, (current) => applyAction(current, person.id, action, elapsedMinutes, { admissionType: evaluation.admissionType }));
      if (action === "checkin" && evaluation.materialsEligible) {
        updateEventMap(setMaterialsByEvent, activeEvent.id, (current) => ({ ...current, [person.id]: { status: "sent", sentAt: elapsedMinutes, resendCount: current[person.id]?.resendCount || 0 } }));
      }
      if (action === "checkin" && evaluation.earlyBirdEligible) {
        updateEventMap(setBenefitsByEvent, activeEvent.id, (current) => ({ ...current, [person.id]: { eligible: true, issued: false } }));
      }
    }
    setResult(completeResult);
    setInputValue("");
  }

  function resendMaterial(personId) {
    if (!activeEvent) return;
    updateEventMap(setMaterialsByEvent, activeEvent.id, (current) => ({ ...current, [personId]: { status: "sent", sentAt: elapsedMinutes, resendCount: (current[personId]?.resendCount || 0) + 1 } }));
  }

  function issueBenefit(personId) {
    if (!activeEvent) return;
    updateEventMap(setBenefitsByEvent, activeEvent.id, (current) => ({ ...current, [personId]: { ...current[personId], eligible: true, issued: true, issuedAt: elapsedMinutes } }));
  }

  function simulateLotteryAttendance() {
    if (!activeEvent) return;
    const simulated = people.slice(0, 6).reduce((current, person, index) => applyAction(current, person.id, "checkin", 3 + index), records);
    setRecordsByEvent((current) => ({ ...current, [activeEvent.id]: simulated }));
  }

  function runLottery() {
    if (!activeEvent) return;
    const draw = drawWinners({
      people,
      records,
      previousWinnerIds: lotteryState.winners.map((winner) => winner.id),
      count: activeEvent.lottery?.winnerCount || 1,
      eligibility: activeEvent.lottery?.eligibility || "checkedIn",
      earlyBirdQuota: activeEvent.earlyBirdQuota || 50,
    });
    if (!draw.winners.length) return;
    const drawNumber = lotteryState.drawNumber + 1;
    const winners = draw.winners.map((winner) => ({ ...winner, drawNumber }));
    setLotteriesByEvent((current) => ({ ...current, [activeEvent.id]: { drawNumber, lastDraw: winners, winners: [...lotteryState.winners, ...winners] } }));
  }

  function resetLottery() {
    if (!activeEvent) return;
    setLotteriesByEvent((current) => ({ ...current, [activeEvent.id]: { winners: [], lastDraw: [], drawNumber: 0 } }));
  }

  let content;
  if (activePage === "events") content = <EventManagementPage events={eventList} rostersByEvent={rostersByEvent} activeEventId={activeEventId} onSelect={selectEvent} onSave={saveEvent} sampleRoster={sampleRoster} language={language} />;
  else if (!activeEvent || activeEvent.lifecycle !== "activated" || people.length === 0) content = <EmptyCheckinState onGoEvents={() => setActivePage("events")} language={language} />;
  else if (activePage === "materials" && activeEvent.modules.materials) content = <MaterialsPage people={people} event={activeEvent} records={records} materialRecords={materialRecords} elapsedMinutes={elapsedMinutes} onResend={resendMaterial} language={language} t={t} />;
  else if (activePage === "seating" && activeEvent.modules.seating) content = <SeatingPage people={people} event={activeEvent} records={records} language={language} t={t} />;
  else if (activePage === "benefits" && activeEvent.modules.earlyBird) content = <BenefitsPage people={people} event={activeEvent} template={template} records={records} benefitRecords={benefitRecords} elapsedMinutes={elapsedMinutes} onIssue={issueBenefit} language={language} t={t} />;
  else if (activePage === "lottery" && activeEvent.modules.lottery) content = <LotteryPage event={activeEvent} people={people} records={records} lotteryState={lotteryState} onDraw={runLottery} onReset={resetLottery} onSimulate={simulateLotteryAttendance} language={language} />;
  else if (activePage === "reports") content = <ReportsPage stats={stats} event={activeEvent} language={language} t={t} />;
  else content = <CheckinPage activeEvent={activeEvent} template={template} language={language} t={t} people={people} records={records} elapsedMinutes={elapsedMinutes} setElapsedMinutes={setElapsedMinutes} inputValue={inputValue} setInputValue={setInputValue} onScan={scan} result={result} />;

  return <div className="app-shell">
    <SidebarV2 active={activePage} onChange={setActivePage} t={t} activeEvent={activeEvent} language={language} />
    <div className="app-main"><Topbar language={language} setLanguage={setLanguage} t={t} /><main className="main-content">{content}</main></div>
  </div>;
}

