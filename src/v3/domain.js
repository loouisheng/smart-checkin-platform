import { csvCell } from "./roster-domain.js";

export {
  applyRosterGrouping, buildRosterCsv, buildRosterTemplate, csvCell, isValidHttpUrl, parseRosterCsv, rosterColumns, validateRosterGrouping,
} from "./roster-domain.js";
export { retainFailedRecipients, toggleFilteredRecipients, toggleRecipientSelection } from "./delivery-domain.js";
export { canSendSurvey, getEventEndAt, getSurveyRecipients } from "./survey-domain.js";

export function toIsoDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function todayIso() {
  return toIsoDate(new Date());
}

export function shiftIsoDate(iso, days) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function filterEvents(events, filters = {}) {
  const { query = "", source = "all", category = "all", status = "all", learningMode = "all", date = "", dateFrom = "", dateTo = "", module, ownerId } = filters;
  const needle = query.trim().toLowerCase();
  const filtered = (events || []).filter((event) => {
    if (event.status === "cancelled") return false;
    if (ownerId && event.ownerId !== ownerId) return false;
    if (needle && !Object.values(event.title || {}).join(" ").toLowerCase().includes(needle)) return false;
    if (source !== "all" && source && event.source !== source) return false;
    if (category !== "all" && category && event.category !== category) return false;
    if (status !== "all" && status && event.status !== status) return false;
    if (learningMode !== "all" && learningMode && event.learningMode !== learningMode) return false;
    if (date && event.date !== date) return false;
    if (dateFrom && event.date < dateFrom) return false;
    if (dateTo && event.date > dateTo) return false;
    if (module && !event.modules?.[module]) return false;
    return true;
  });

  return [...filtered].sort((a, b) => `${a.date || ""}T${a.startTime || ""}`.localeCompare(`${b.date || ""}T${b.startTime || ""}`));
}

export function normalizeEvent(event) {
  const grouping = event.grouping || {};
  const localizedEmpty = { "zh-TW": "", "zh-CN": "", en: "", ja: "" };

  return {
    ...event,
    creator: event.creator || localizedEmpty,
    contactExtension: event.contactExtension || "",
    instructor: event.instructor || localizedEmpty,
    deputy: event.deputy || localizedEmpty,
    totalHours: Number(event.totalHours) || 0,
    description: event.description || localizedEmpty,
    rosterUrl: event.rosterUrl || null,
    grouping: { enabled: Boolean(grouping.enabled) },
    survey: event.survey ? { url: event.survey.url, autoSend: event.survey.autoSend !== false } : null,
    lottery: event.lottery ? { prizes: normalizePrizes(event.lottery.prizes) } : null,
  };
}

export function normalizePrizes(prizes) {
  return (prizes || [])
    .filter((prize) => String(prize?.name ?? "").trim() || typeof prize?.name === "object")
    .map((prize, index) => ({ id: prize.id || `p${index + 1}`, name: prize.name, quantity: Math.max(1, Number(prize.quantity) || 1) }));
}

export function resizePrizeList(prizes, count, blank = { name: "", quantity: 1 }) {
  const target = Math.min(12, Math.max(1, Number(count) || 1));
  const next = (prizes || []).slice(0, target);
  while (next.length < target) next.push({ ...blank });
  return next;
}

export function assignGroups(people, targetSize) {
  const size = Math.max(1, Number(targetSize) || 1);
  const groupCount = Math.max(1, Math.ceil(people.length / size));
  return people.map((person, index) => ({ ...person, group: String.fromCharCode(65 + (index % groupCount)) }));
}

export function getRecord(records, personId) {
  return records?.[personId] || { checkin: null, checkout: null, leave: false, audit: [] };
}

export const COMPLETION_RATIO = 0.8;
export const attendanceStatuses = ["pending", "checkedIn", "late", "completed", "incomplete", "leave"];

/** Hours between check-in and check-out; 0 while a person is still on site. */
export function getAttendedHours(record) {
  if (!record?.checkin?.at || !record?.checkout?.at) return 0;
  const hours = (new Date(record.checkout.at).getTime() - new Date(record.checkin.at).getTime()) / 3600000;
  return hours > 0 ? Math.round(hours * 100) / 100 : 0;
}

/** Duration between two HH:mm strings, rounded to one decimal. */
export function hoursBetween(start, end) {
  const parse = (value) => {
    const [hour, minute] = String(value || "").split(":").map(Number);
    return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : null;
  };
  const from = parse(start);
  const to = parse(end);
  if (from == null || to == null || to <= from) return 0;
  return Math.round(((to - from) / 60) * 10) / 10;
}

export function getRequiredHours(event) {
  return Math.round((Number(event?.totalHours) || 0) * COMPLETION_RATIO * 100) / 100;
}

/** Training counts as completed once attendance reaches 80% of the event's total hours. */
export function evaluateCompletion(event, record) {
  const attendedHours = getAttendedHours(record);
  const requiredHours = getRequiredHours(event);
  const checkedOut = Boolean(record?.checkout);
  return { attendedHours, requiredHours, completed: checkedOut && (requiredHours <= 0 || attendedHours >= requiredHours) };
}

export function getAttendanceStatus(person, record, event) {
  const inheritedLeave = person.leaveStatus && record.leaveSource !== "manual" && !record.checkin;
  if (record.leave || inheritedLeave) return "leave";
  if (record.checkout) return evaluateCompletion(event, record).completed ? "completed" : "incomplete";
  if (record.checkin) {
    const start = new Date(`${event.date}T${event.startTime}:00+08:00`);
    const lateAt = new Date(start.getTime() + (event.rules?.lateAfterMin || 0) * 60000);
    return new Date(record.checkin.at) > lateAt ? "late" : "checkedIn";
  }
  return "pending";
}

export function evaluateAttendance({ mode, person, event, record }) {
  if (!event || event.lifecycle !== "activated" || event.status === "cancelled") return { ok: false, code: "eventUnavailable" };
  if (!person) return { ok: false, code: "personNotFound" };
  if (mode === "checkin" && record.checkin) return { ok: false, code: "duplicateCheckin" };
  if (mode === "checkout" && !record.checkin) return { ok: false, code: "withoutCheckin" };
  if (mode === "checkout" && record.checkout) return { ok: false, code: "duplicateCheckout" };
  const inheritedLeave = person.leaveStatus && record.leaveSource !== "manual";
  return { ok: true, code: mode === "checkin" ? "successCheckin" : "successCheckout", requiresLeaveOverride: mode === "checkin" && (record.leave || inheritedLeave) };
}

export function applyAttendance(records, personId, mode, method, at = new Date().toISOString(), operator = "Louis Chen") {
  const current = getRecord(records, personId);
  const entry = { at, method, operator };
  return { ...records, [personId]: { ...current, leave: mode === "checkin" ? false : current.leave, [mode]: entry, audit: [...(current.audit || []), { type: mode, ...entry }] } };
}

export function toggleLeave(records, personId, nextValue, at = new Date().toISOString(), operator = "Louis Chen") {
  const current = getRecord(records, personId);
  return { ...records, [personId]: { ...current, leave: nextValue, leaveSource: "manual", audit: [...(current.audit || []), { type: nextValue ? "leave-set" : "leave-cleared", at, operator }] } };
}

export function toggleAward(records, personId, nextValue, at = new Date().toISOString(), operator = "Louis Chen") {
  const current = getRecord(records, personId);
  return { ...records, [personId]: { ...current, awarded: nextValue, audit: [...(current.audit || []), { type: nextValue ? "award-set" : "award-cleared", at, operator }] } };
}

export function calculateKpis(people, records, event) {
  const statuses = people.map((person) => getAttendanceStatus(person, getRecord(records, person.id), event));
  const arrived = statuses.filter((status) => ["checkedIn", "late", "completed", "incomplete"].includes(status)).length;
  const needsAction = statuses.filter((status) => ["late", "incomplete"].includes(status)).length;
  return { expected: people.length, arrived, needsAction, attendanceRate: people.length ? Math.round((arrived / people.length) * 100) : 0 };
}

export function getEarlyBirdEligible(people, records, quota) {
  return people.filter((person) => getRecord(records, person.id).checkin && !getRecord(records, person.id).leave).sort((a, b) => new Date(getRecord(records, a.id).checkin.at) - new Date(getRecord(records, b.id).checkin.at)).slice(0, Math.max(0, Number(quota) || 0));
}

export function drawPrizeAssignments(people, records, prizes, random = Math.random) {
  const pool = people.filter((person) => getRecord(records, person.id).checkin && !getRecord(records, person.id).leave);
  const candidates = [...pool];
  const assignments = [];
  for (const prize of prizes || []) for (let index = 0; index < Number(prize.quantity || 0) && candidates.length; index += 1) {
    const winnerIndex = Math.floor(random() * candidates.length);
    assignments.push({ person: candidates.splice(winnerIndex, 1)[0], prize });
  }
  return { assignments, eligibleCount: pool.length, unassignedCount: (prizes || []).reduce((sum, prize) => sum + Number(prize.quantity || 0), 0) - assignments.length };
}

/** Shared table for both the CSV and the Excel exports. */
export function buildAttendanceMatrix({ event, people, records, language, localize, statusLabel, label = (key) => key }) {
  const headers = [
    "Event ID", label("eventName"), label("date"), label("instructor"), label("employeeId"), label("name"), label("department"),
    label("group"), label("attendance"), label("checkinAt"), label("checkoutAt"), label("attendedHours"), label("requiredHours"),
    label("awardStatus"), "Email", label("extension"),
  ];
  const rows = people.map((person) => {
    const record = getRecord(records, person.id);
    const completion = evaluateCompletion(event, record);
    return [
      event.id, localize(event.title, language), event.date, localize(event.instructor, language), person.id,
      localize(person.name, language), localize(person.department, language), person.group || "",
      statusLabel(getAttendanceStatus(person, record, event)),
      record.checkin?.at || "", record.checkout?.at || "",
      completion.attendedHours, completion.requiredHours,
      record.awarded ? label("awarded") : label("notAwarded"),
      person.email || "", person.extension || "",
    ];
  });
  return [headers, ...rows];
}

export function buildAttendanceCsv(options) {
  return `\uFEFF${buildAttendanceMatrix(options).map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function downloadCsv(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
