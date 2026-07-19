export function assignGroups(people, targetSize) {
  const size = Math.max(1, Number(targetSize) || 1);
  const groupCount = Math.max(1, Math.ceil(people.length / size));
  return people.map((person, index) => ({ ...person, group: String.fromCharCode(65 + (index % groupCount)) }));
}

export function getRecord(records, personId) {
  return records?.[personId] || { checkin: null, checkout: null, leave: false, audit: [] };
}

export function getAttendanceStatus(person, record, event, now = new Date()) {
  const inheritedLeave = person.leaveStatus && record.leaveSource !== "manual" && !record.checkin;
  if (record.leave || inheritedLeave) return "leave";
  if (record.checkout) return "checkedOut";
  if (record.checkin) {
    const start = new Date(`${event.date}T${event.startTime}:00+08:00`);
    const lateAt = new Date(start.getTime() + (event.rules?.lateAfterMin || 0) * 60000);
    return new Date(record.checkin.at) > lateAt ? "late" : "checkedIn";
  }
  const absentAt = new Date(`${event.date}T${event.startTime}:00+08:00`).getTime() + (event.rules?.absentAfterMin || 30) * 60000;
  return now.getTime() > absentAt ? "absent" : "pending";
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

export function calculateKpis(people, records, event, now = new Date()) {
  const statuses = people.map((person) => getAttendanceStatus(person, getRecord(records, person.id), event, now));
  const arrived = statuses.filter((status) => ["checkedIn", "checkedOut", "late"].includes(status)).length;
  const needsAction = statuses.filter((status) => ["absent", "late"].includes(status)).length;
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

function csvCell(value) {
  const valueText = value == null ? "" : String(value);
  return /[",\n]/.test(valueText) ? `"${valueText.replaceAll('"', '""')}"` : valueText;
}

export function buildAttendanceCsv({ event, people, records, language, localize, statusLabel }) {
  const headers = ["Event ID", "Event", "Employee ID", "Name", "Department", "Group", "Attendance", "Check-in", "Check-out", "Email", "Teams URL", "Extension"];
  const rows = people.map((person) => {
    const record = getRecord(records, person.id);
    const status = getAttendanceStatus(person, record, event);
    return [event.id, localize(event.title, language), person.id, localize(person.name, language), localize(person.department, language), person.group || "", statusLabel(status), record.checkin?.at || "", record.checkout?.at || "", person.email, person.teamsUrl || "", person.extension || ""];
  });
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function downloadCsv(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
