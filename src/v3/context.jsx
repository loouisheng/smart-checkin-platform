import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { currentUser, events as seedEvents, fetchLmsRosterUpdate, initialAttendance, lmsCatalog, rostersByEvent as seedRosters } from "./data.js";
import { applyAttendance, applyRosterGrouping, canSendSurvey, drawPrizeAssignments, evaluateAttendance, evaluateCompletion, getRecord, getSurveyRecipients, normalizeEvent, toggleAward as updateAward, toggleLeave as updateLeave } from "./domain.js";
import { applyDocumentLanguage, createTranslator, localize } from "./i18n.js";

const AppContext = createContext(null);
const clone = (value) => JSON.parse(JSON.stringify(value));

function initialDeliveries() {
  return Object.fromEntries(seedEvents.map((event) => [event.id, { survey: {}, earlyBird: {} }]));
}

function delay(ms = 360) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem("event-checkin-language") || "zh-TW");
  const [page, setPageState] = useState(() => new URLSearchParams(window.location.search).get("page") || "checkin");
  const [allEvents, setAllEvents] = useState(() => clone(seedEvents).map(normalizeEvent));
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
  useEffect(() => applyDocumentLanguage(document, language), [language]);

  // Managers may only see and operate the events they created themselves.
  const events = useMemo(() => allEvents.filter((event) => event.ownerId === currentUser.id), [allEvents]);

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
    // Check-out reports completion immediately, so the front desk can tell the person on the spot.
    const completion = mode === "checkout" ? evaluateCompletion(event, { ...getRecord(records, personId), checkout: { at, method } }) : null;
    return { ...evaluation, activity, completion };
  }, [attendanceByEvent, events, rostersByEvent]);

  const toggleLeave = useCallback((eventId, personId, value) => {
    setAttendanceByEvent((current) => ({ ...current, [eventId]: updateLeave(current[eventId] || {}, personId, value) }));
  }, []);

  const toggleAward = useCallback((eventId, personId, value) => {
    setAttendanceByEvent((current) => ({ ...current, [eventId]: updateAward(current[eventId] || {}, personId, value) }));
  }, []);

  /** Pulls the newest LMS registrations into an already managed event. */
  const refreshLmsRoster = useCallback(async (eventId) => {
    const event = events.find((item) => item.id === eventId);
    if (!event || event.source !== "lms") throw new Error("NOT_LMS_EVENT");
    if (!navigator.onLine) throw new Error("NETWORK_OFFLINE");
    setBusy(true);
    await delay();
    const update = fetchLmsRosterUpdate(rostersByEvent[eventId] || [], event.grouping.enabled);
    if (update.added) {
      setRostersByEvent((current) => ({ ...current, [eventId]: update.people }));
      setAllEvents((current) => current.map((item) => item.id === eventId ? { ...item, capacity: update.people.length, rosterSyncedAt: new Date().toISOString() } : item));
    } else {
      setAllEvents((current) => current.map((item) => item.id === eventId ? { ...item, rosterSyncedAt: new Date().toISOString() } : item));
    }
    setBusy(false);
    return { added: update.added, total: update.people.length };
  }, [events, rostersByEvent]);

  const saveEvent = useCallback((form) => {
    const lmsSource = form.source === "lms" ? lmsCatalog.find((item) => item.id === form.catalogId) : null;
    const id = form.source === "lms" ? `LMS-${form.lmsId}` : `SELF-${form.date.replaceAll("-", "")}-${Date.now().toString().slice(-4)}`;
    const makeLocalized = (value) => ({ "zh-TW": value, "zh-CN": value, en: value, ja: value });
    const grouped = Boolean(form.grouping);
    const event = normalizeEvent({
      id,
      lmsId: form.source === "lms" ? form.lmsId : undefined,
      source: form.source === "lms" ? "lms" : "self",
      ownerId: currentUser.id,
      lifecycle: "activated",
      status: "upcoming",
      title: lmsSource ? clone(lmsSource.title) : makeLocalized(form.title),
      // The event creator is always the contact, so the extension comes from the signed-in manager.
      creator: clone(currentUser.name),
      contactExtension: currentUser.extension,
      description: lmsSource ? clone(lmsSource.description) : makeLocalized(form.description || ""),
      location: lmsSource ? clone(lmsSource.location) : makeLocalized(form.location),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      learningMode: form.learningMode,
      audience: lmsSource?.audience || "all",
      instructor: lmsSource ? clone(lmsSource.instructor) : makeLocalized(form.instructor),
      deputy: lmsSource ? clone(lmsSource.deputy) : makeLocalized(form.deputy),
      totalHours: Number(lmsSource ? lmsSource.totalHours : form.totalHours) || 0,
      // Registered headcount always mirrors the roster so it matches the report KPIs.
      capacity: (form.rosterPeople || []).length,
      grouping: { enabled: grouped },
      modules: { ...form.modules },
      survey: form.modules.survey ? { url: form.surveyUrl } : null,
      earlyBird: form.modules.earlyBird ? { quota: Number(form.earlyQuota), reward: makeLocalized(form.earlyReward) } : null,
      lottery: form.modules.lottery
        ? { prizes: form.prizes.filter((prize) => String(prize.name).trim()).map((prize, index) => ({ id: `p${index + 1}`, name: makeLocalized(prize.name), quantity: Number(prize.quantity) })) }
        : null,
      rules: { lateAfterMin: 15, absentAfterMin: 30 },
    });
    const people = applyRosterGrouping(form.rosterPeople || [], grouped);
    setAllEvents((current) => [...current.filter((item) => item.id !== id), event]);
    setRostersByEvent((current) => ({ ...current, [id]: people }));
    setAttendanceByEvent((current) => ({ ...current, [id]: {} }));
    setDeliveries((current) => ({ ...current, [id]: { survey: {}, earlyBird: {} } }));
    setActiveEventId(id);
    setNotice({ tone: "success", message: t("createEvent") });
    return event;
  }, [t]);

  /** Edits an event that already exists, keeping its identity, history and source. */
  const updateEvent = useCallback((eventId, form) => {
    const existing = allEvents.find((item) => item.id === eventId);
    if (!existing) return null;
    const makeLocalized = (value) => ({ "zh-TW": value, "zh-CN": value, en: value, ja: value });
    const grouped = Boolean(form.grouping);
    const people = applyRosterGrouping(form.rosterPeople || [], grouped);
    const isLms = existing.source === "lms";
    const updated = normalizeEvent({
      ...existing,
      title: isLms ? existing.title : makeLocalized(form.title),
      description: isLms ? existing.description : makeLocalized(form.description || ""),
      location: isLms ? existing.location : makeLocalized(form.location),
      date: isLms ? existing.date : form.date,
      startTime: isLms ? existing.startTime : form.startTime,
      endTime: isLms ? existing.endTime : form.endTime,
      category: isLms ? existing.category : form.category,
      learningMode: isLms ? existing.learningMode : form.learningMode,
      instructor: isLms ? existing.instructor : makeLocalized(form.instructor),
      deputy: isLms ? existing.deputy : makeLocalized(form.deputy),
      totalHours: isLms ? existing.totalHours : Number(form.totalHours) || 0,
      capacity: people.length,
      grouping: { enabled: grouped },
      modules: { ...form.modules },
      survey: form.modules.survey ? { url: form.surveyUrl } : null,
      earlyBird: form.modules.earlyBird ? { quota: Number(form.earlyQuota), reward: makeLocalized(form.earlyReward) } : null,
      lottery: form.modules.lottery
        ? { prizes: form.prizes.filter((prize) => String(prize.name).trim()).map((prize, index) => ({ id: `p${index + 1}`, name: makeLocalized(prize.name), quantity: Number(prize.quantity) })) }
        : null,
    });
    setAllEvents((current) => current.map((item) => item.id === eventId ? updated : item));
    setRostersByEvent((current) => ({ ...current, [eventId]: people }));
    setNotice({ tone: "success", message: t("eventUpdated") });
    return updated;
  }, [allEvents, t]);

  const cancelEvent = useCallback((eventId, reason) => {
    if (!reason.trim()) return false;
    setAllEvents((current) => current.map((event) => event.id === eventId
      ? { ...event, lifecycle: "cancelled", status: "cancelled", cancelledAt: new Date().toISOString(), cancellationReason: { "zh-TW": reason, "zh-CN": reason, en: reason, ja: reason } }
      : event));
    if (checkinEventId === eventId) setCheckinEventId(null);
    if (activeEventId === eventId) setActiveEventId(null);
    return true;
  }, [activeEventId, checkinEventId]);

  const sendDelivery = useCallback(async ({ eventId, type, personIds }) => {
    const event = events.find((item) => item.id === eventId);
    const link = type === "survey" ? event?.survey?.url : "reward";
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
    const results = deliveryPersonIds.map((personId) => {
      const valid = emailPattern.test(people.find((person) => person.id === personId)?.email || "");
      return { personId, status: valid ? "sent" : "failed", error: valid ? null : "INVALID_EMAIL" };
    });
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
    recentActivity, recordAttendance, toggleLeave, toggleAward, refreshLmsRoster, saveEvent, updateEvent, cancelEvent, sendDelivery, runLottery,
    lmsCatalog, currentUser, notice, setNotice, busy,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
