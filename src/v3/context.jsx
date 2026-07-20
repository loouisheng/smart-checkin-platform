import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { events as seedEvents, initialAttendance, lmsCatalog, roster, rostersByEvent as seedRosters } from "./data.js";
import { applyAttendance, applyManualAssignments, assignGroups, canSendSurvey, drawPrizeAssignments, evaluateAttendance, getEarlyBirdEligible, getRecord, getSurveyRecipients, normalizeEvent, toggleLeave as updateLeave } from "./domain.js";
import { createTranslator, localize } from "./i18n.js";

const AppContext = createContext(null);
const clone = (value) => JSON.parse(JSON.stringify(value));

function initialDeliveries() {
  const result = {};
  for (const event of seedEvents) {
    const people = seedRosters[event.id] || [];
    result[event.id] = {
      materials: event.modules.materials ? Object.fromEntries(people.map((person) => [person.id, { status: "sent", sentAt: "2026-07-15T10:00:00+08:00", count: 1 }])) : {},
      survey: {},
      earlyBird: {},
    };
  }
  return result;
}

function delay(ms = 360) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem("event-checkin-language") || "zh-TW");
  const [page, setPageState] = useState(() => new URLSearchParams(window.location.search).get("page") || "checkin");
  const [events, setEvents] = useState(() => clone(seedEvents).map(normalizeEvent));
  const [rostersByEvent, setRostersByEvent] = useState(() => clone(seedRosters));
  const [attendanceByEvent, setAttendanceByEvent] = useState(() => clone(initialAttendance));
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [lotteryResults, setLotteryResults] = useState({});
  const [activeEventId, setActiveEventId] = useState(null);
  const [checkinEventId, setCheckinEventId] = useState(null);
  const [recentActivity, setRecentActivity] = useState({});
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const t = useMemo(() => createTranslator(language), [language]);
  const activeEvent = events.find((event) => event.id === activeEventId) || null;
  const activePeople = activeEvent ? rostersByEvent[activeEvent.id] || [] : [];
  const activeRecords = activeEvent ? attendanceByEvent[activeEvent.id] || {} : {};

  const setLanguage = useCallback((next) => {
    setLanguageState(next);
    localStorage.setItem("event-checkin-language", next);
  }, []);

  const navigate = useCallback((nextPage) => {
    setNotice(null);
    setPageState(nextPage);
    const url = new URL(window.location.href);
    url.searchParams.set("page", nextPage);
    window.history.replaceState({}, "", url);
  }, []);

  const selectActiveEvent = useCallback((eventId, nextPage) => {
    setActiveEventId(eventId);
    if (nextPage) navigate(nextPage);
  }, [navigate]);

  const openCheckin = useCallback((eventId) => {
    setActiveEventId(eventId);
    setCheckinEventId(eventId);
  }, []);

  const closeCheckin = useCallback(() => setCheckinEventId(null), []);

  const recordAttendance = useCallback(({ eventId, personId, mode, method, overrideLeave = false }) => {
    const event = events.find((item) => item.id === eventId);
    const people = rostersByEvent[eventId] || [];
    const person = people.find((item) => item.id === personId);
    const records = attendanceByEvent[eventId] || {};
    const evaluation = evaluateAttendance({ mode, person, event, record: getRecord(records, personId) });
    if (evaluation.requiresLeaveOverride && !overrideLeave) return evaluation;
    if (!evaluation.ok) return evaluation;
    const at = new Date().toISOString();
    setAttendanceByEvent((current) => ({ ...current, [eventId]: applyAttendance(current[eventId] || {}, personId, mode, method, at) }));
    const activity = { id: `${personId}-${at}`, personId, person, mode, method, at, ok: true, code: evaluation.code };
    setRecentActivity((current) => ({ ...current, [eventId]: [activity, ...(current[eventId] || [])].slice(0, 8) }));
    return { ...evaluation, activity };
  }, [attendanceByEvent, events, rostersByEvent]);

  const toggleLeave = useCallback((eventId, personId, value) => {
    setAttendanceByEvent((current) => ({ ...current, [eventId]: updateLeave(current[eventId] || {}, personId, value) }));
  }, []);

  const saveSelfEvent = useCallback((form) => {
    const lmsSource = form.source === "lms" ? lmsCatalog.find((item) => item.id === form.catalogId) : null;
    const id = form.source === "lms"
      ? `LMS-${form.lmsId}`
      : `SELF-${form.date.replaceAll("-", "")}-${Date.now().toString().slice(-4)}`;
    const makeLocalized = (value) => ({ "zh-TW": value, "zh-CN": value, en: value, ja: value });
    const groupingMode = lmsSource ? (lmsSource.grouping?.mode || (lmsSource.grouping?.enabled ? "automatic" : "none")) : (form.groupingMode || (form.grouping ? "automatic" : "none"));
    const event = {
      id,
      lmsId: form.source === "lms" ? form.lmsId : undefined,
      source: form.source === "lms" ? "lms" : "self",
      lifecycle: "activated",
      status: "upcoming",
      title: lmsSource ? clone(lmsSource.title) : makeLocalized(form.title),
      organizer: lmsSource ? clone(lmsSource.organizer) : makeLocalized(form.organizer),
      creator: lmsSource ? clone(lmsSource.creator) : makeLocalized(form.creator || form.organizer),
      description: lmsSource ? clone(lmsSource.description) : makeLocalized(form.description || ""),
      rosterUrl: lmsSource?.rosterUrl || null,
      location: lmsSource ? clone(lmsSource.location) : makeLocalized(form.location),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      learningMode: form.learningMode,
      audience: lmsSource?.audience || "all",
      capacity: Number(form.capacity),
      grouping: { mode: groupingMode, enabled: groupingMode !== "none", targetSize: groupingMode === "automatic" ? Number(lmsSource ? lmsSource.grouping?.targetSize : form.groupSize) : null, assignments: { ...(lmsSource?.grouping?.assignments || form.manualAssignments || {}) } },
      modules: { ...form.modules },
      materials: form.modules.materials ? { name: makeLocalized(form.materialName), url: form.materialUrl } : null,
      survey: form.modules.survey ? { url: form.surveyUrl, timing: form.surveyTiming || "after", autoSend: (form.surveyTiming || "after") === "after" } : null,
      earlyBird: form.modules.earlyBird ? { quota: Number(form.earlyQuota), reward: makeLocalized(form.earlyReward) } : null,
      lottery: form.modules.lottery ? { prizes: form.prizes.filter((prize) => prize.name).map((prize, index) => ({ id: `p${index + 1}`, name: makeLocalized(prize.name), quantity: Number(prize.quantity) })) } : null,
      rules: { lateAfterMin: 15, absentAfterMin: 30 },
    };
    const rosterCount = Math.max(1, Math.min(Number(form.rosterCount) || 12, roster.length));
    const selectedRoster = form.source === "lms" ? roster.slice(0, rosterCount) : (form.rosterPeople || []).map((person) => ({ ...person }));
    const people = event.grouping.mode === "automatic" ? assignGroups(selectedRoster, event.grouping.targetSize)
      : event.grouping.mode === "manual" ? applyManualAssignments(selectedRoster, event.grouping.assignments) : selectedRoster.map((person) => ({ ...person, group: null }));
    setEvents((current) => [...current.filter((item) => item.id !== id), event]);
    setRostersByEvent((current) => ({ ...current, [id]: people }));
    setAttendanceByEvent((current) => ({ ...current, [id]: {} }));
    setDeliveries((current) => ({ ...current, [id]: { materials: event.modules.materials ? Object.fromEntries(people.map((person) => [person.id, { status: "sent", sentAt: new Date().toISOString(), count: 1 }])) : {}, survey: {}, earlyBird: {} } }));
    setActiveEventId(id);
    setNotice({ tone: "success", message: t("createEvent") });
    return event;
  }, [t]);

  const importLms = useCallback(async (catalogId) => {
    const source = lmsCatalog.find((event) => event.id === catalogId);
    if (!source) throw new Error("INVALID_LMS_EVENT");
    if (events.some((event) => event.lmsId === source.lmsId)) throw new Error("DUPLICATE_LMS_EVENT");
    setBusy(true);
    await delay();
    const event = normalizeEvent({ ...clone(source), id: `LMS-${source.lmsId}`, lifecycle: "activated" });
    const people = event.grouping.mode === "automatic" ? assignGroups(roster, event.grouping.targetSize) : roster.map((person) => ({ ...person, group: null }));
    setEvents((current) => [...current, event]);
    setRostersByEvent((current) => ({ ...current, [event.id]: people }));
    setAttendanceByEvent((current) => ({ ...current, [event.id]: {} }));
    setDeliveries((current) => ({ ...current, [event.id]: { materials: event.modules.materials ? Object.fromEntries(people.map((person) => [person.id, { status: "sent", sentAt: new Date().toISOString(), count: 1 }])) : {}, survey: {}, earlyBird: {} } }));
    setActiveEventId(event.id);
    setBusy(false);
    return event;
  }, [events]);

  const cancelEvent = useCallback((eventId, reason) => {
    if (!reason.trim()) return false;
    setEvents((current) => current.map((event) => event.id === eventId ? { ...event, lifecycle: "cancelled", status: "cancelled", cancelledAt: new Date().toISOString(), cancellationReason: { "zh-TW": reason, "zh-CN": reason, en: reason, ja: reason } } : event));
    if (checkinEventId === eventId) setCheckinEventId(null);
    if (activeEventId === eventId) setActiveEventId(null);
    return true;
  }, [activeEventId, checkinEventId]);

  const sendDelivery = useCallback(async ({ eventId, type, personIds }) => {
    const event = events.find((item) => item.id === eventId);
    const link = type === "materials" ? event?.materials?.url : type === "survey" ? event?.survey?.url : "reward";
    let deliveryPersonIds = [...personIds];
    if (type === "survey") {
      const eligibility = canSendSurvey(event);
      if (!eligibility.ok) throw new Error(eligibility.code);
      const allowedIds = new Set(getSurveyRecipients(event, rostersByEvent[eventId] || [], attendanceByEvent[eventId] || {}).map((person) => person.id));
      deliveryPersonIds = deliveryPersonIds.filter((personId) => allowedIds.has(personId));
      if (!deliveryPersonIds.length) throw new Error("NO_SURVEY_RECIPIENTS");
    }
    if (!navigator.onLine) throw new Error("NETWORK_OFFLINE");
    if (!link) throw new Error("MISSING_LINK");
    setBusy(true);
    await delay();
    const now = new Date().toISOString();
    const people = rostersByEvent[eventId] || [];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const results = deliveryPersonIds.map((personId) => ({ personId, status: emailPattern.test(people.find((person) => person.id === personId)?.email || "") ? "sent" : "failed", error: emailPattern.test(people.find((person) => person.id === personId)?.email || "") ? null : "INVALID_EMAIL" }));
    setDeliveries((current) => {
      const category = current[eventId]?.[type] || {};
      const nextCategory = { ...category };
      results.forEach((result) => {
        const previous = category[result.personId] || {};
        nextCategory[result.personId] = { status: result.status, sentAt: now, count: (previous.count || 0) + 1, error: result.error };
      });
      return { ...current, [eventId]: { ...(current[eventId] || {}), [type]: nextCategory } };
    });
    setBusy(false);
    return { results, successCount: results.filter((result) => result.status === "sent").length, failureCount: results.filter((result) => result.status === "failed").length };
  }, [attendanceByEvent, events, rostersByEvent]);

  const runLottery = useCallback((eventId) => {
    const event = events.find((item) => item.id === eventId);
    const result = drawPrizeAssignments(rostersByEvent[eventId] || [], attendanceByEvent[eventId] || {}, event?.lottery?.prizes || []);
    setLotteryResults((current) => ({ ...current, [eventId]: result }));
    return result;
  }, [attendanceByEvent, events, rostersByEvent]);

  const value = {
    language, setLanguage, t, localize, page, navigate, events, rostersByEvent, attendanceByEvent, deliveries, lotteryResults,
    activeEventId, activeEvent, activePeople, activeRecords, selectActiveEvent, checkinEventId, openCheckin, closeCheckin,
    recentActivity, recordAttendance, toggleLeave, saveSelfEvent, importLms, cancelEvent, sendDelivery, runLottery,
    lmsCatalog, notice, setNotice, busy,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
