import assert from "node:assert/strict";
import {
  applyAttendance, assignGroups, buildAttendanceCsv, drawPrizeAssignments, evaluateAttendance,
  filterEvents, getAttendanceStatus, getEarlyBirdEligible, getRecord, normalizeEvent, toggleLeave,
} from "../src/v3/domain.js";

const people = Array.from({ length: 10 }, (_, index) => ({
  id: `T${index + 1}`, name: { en: `Person ${index + 1}` }, department: { en: "People" },
  email: `p${index + 1}@example.com`, registered: true, leaveStatus: false,
}));
const event = { id: "E1", date: "2026-07-17", startTime: "09:00", lifecycle: "activated", status: "live", rules: { lateAfterMin: 15, absentAfterMin: 30 }, title: { en: "Test" } };

const grouped = assignGroups(people, 4);
const counts = Object.values(grouped.reduce((result, person) => ({ ...result, [person.group]: (result[person.group] || 0) + 1 }), {}));
assert.equal(Math.max(...counts) - Math.min(...counts) <= 1, true);
assert.equal(Math.max(...counts) <= 4, true);

assert.equal(evaluateAttendance({ mode: "checkout", person: people[0], event, record: getRecord({}, people[0].id) }).code, "withoutCheckin");
let records = applyAttendance({}, people[0].id, "checkin", "card", "2026-07-17T09:04:00+08:00");
records = applyAttendance(records, people[1].id, "checkin", "manual", "2026-07-17T09:01:00+08:00");
assert.deepEqual(getEarlyBirdEligible(people, records, 1).map((person) => person.id), ["T2"]);
assert.equal(getAttendanceStatus(people[0], records.T1, event, new Date("2026-07-17T09:05:00+08:00")), "checkedIn");

const prizes = [{ id: "p1", name: { en: "Gold" }, quantity: 1 }, { id: "p2", name: { en: "Silver" }, quantity: 1 }];
const draw = drawPrizeAssignments(people, records, prizes, () => 0);
assert.equal(draw.assignments.length, 2);
assert.equal(new Set(draw.assignments.map((item) => item.person.id)).size, 2);

const leaveRecords = toggleLeave({}, people[2].id, true, "2026-07-17T08:00:00+08:00");
assert.equal(getAttendanceStatus(people[2], leaveRecords.T3, event), "leave");

const csv = buildAttendanceCsv({ event, people: people.slice(0, 2), records, language: "en", localize: (value) => value.en, statusLabel: (value) => value });
assert.equal(csv.startsWith("\uFEFF"), true);
assert.equal(csv.includes("Employee ID"), true);
assert.equal(csv.includes("T1"), true);

const filterFixtures = [
  { id: "E1", title: { en: "July Leadership" }, source: "lms", category: "leadership", status: "completed", date: "2026-07-12", startTime: "09:00", modules: { survey: true } },
  { id: "E2", title: { en: "August AI" }, source: "self", category: "digital", status: "upcoming", date: "2026-08-03", startTime: "10:00", modules: { survey: false } },
];

assert.deepEqual(filterEvents(filterFixtures, { query: "leadership" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { month: "2026-07" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { dateFrom: "2026-08-01", dateTo: "2026-08-31" }).map(({ id }) => id), ["E2"]);
assert.deepEqual(filterEvents(filterFixtures, { module: "survey" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { includeHistory: true }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { source: "self", category: "digital", status: "upcoming" }).map(({ id }) => id), ["E2"]);
assert.throws(() => filterEvents(filterFixtures, { dateFrom: "2026-08-31", dateTo: "2026-08-01" }), /INVALID_DATE_RANGE/);

const normalized = normalizeEvent({ id: "SELF-1", source: "self", grouping: { enabled: true, targetSize: 4 }, survey: { url: "https://forms.example/x" } });
assert.equal(normalized.grouping.mode, "automatic");
assert.equal(normalized.grouping.targetSize, 4);
assert.deepEqual(normalized.grouping.assignments, {});
assert.equal(normalized.survey.timing, "after");
assert.equal(normalized.rosterUrl, null);

console.log("ok - Event Check-In v3 domain workflows");
