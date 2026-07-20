import assert from "node:assert/strict";
import {
  applyAttendance, applyManualAssignments, assignGroups, buildAttendanceCsv, canSendSurvey, drawPrizeAssignments, evaluateAttendance,
  filterEvents, getAttendanceStatus, getEarlyBirdEligible, getEventEndAt, getRecord, getSurveyRecipients, isValidHttpUrl, normalizeEvent, toggleLeave,
  parseRosterCsv, retainFailedRecipients, toggleFilteredRecipients, toggleRecipientSelection, validateManualAssignments,
} from "../src/v3/domain.js";
import { applyDocumentLanguage, createTranslator } from "../src/v3/i18n.js";

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

const manualValidation = validateManualAssignments(people.slice(0, 2), { T1: "A", T2: " " });
assert.deepEqual(manualValidation, { ok: false, unassignedIds: ["T2"] });
const manualPeople = applyManualAssignments(people.slice(0, 2), { T1: " A ", T2: "B" });
assert.deepEqual(manualPeople.map((person) => person.group), ["A", "B"]);
const parsedRoster = parseRosterCsv("employee_id,name,department,email\nE01,Ada,HR,ada@example.com");
assert.deepEqual(parsedRoster.people.map((person) => person.id), ["E01"]);
assert.equal(parsedRoster.people[0].email, "ada@example.com");
assert.throws(() => parseRosterCsv("employee_id,name\nE01,Ada\nE01,Grace"), /DUPLICATE_EMPLOYEE_ID/);

assert.equal(isValidHttpUrl("https://lms.example/events/E1/roster"), true);
assert.equal(isValidHttpUrl("javascript:alert(1)"), false);
assert.equal(isValidHttpUrl(""), false);

let selectedRecipients = toggleRecipientSelection(new Set(), "T1", true);
assert.deepEqual([...selectedRecipients], ["T1"]);
selectedRecipients = toggleRecipientSelection(selectedRecipients, "T1", false);
assert.deepEqual([...selectedRecipients], []);
selectedRecipients = toggleFilteredRecipients(new Set(["T3"]), ["T1", "T2"], true);
assert.deepEqual([...selectedRecipients].sort(), ["T1", "T2", "T3"]);
selectedRecipients = toggleFilteredRecipients(selectedRecipients, ["T1", "T2"], false);
assert.deepEqual([...selectedRecipients], ["T3"]);
const retainedRecipients = retainFailedRecipients(new Set(["T1", "T2"]), [{ personId: "T1", status: "sent" }, { personId: "T2", status: "failed" }]);
assert.deepEqual([...retainedRecipients], ["T2"]);

const afterEvent = { ...event, endTime: "17:00", survey: { timing: "after", url: "https://forms.example/x" } };
assert.equal(getEventEndAt(afterEvent).toISOString(), "2026-07-17T09:00:00.000Z");
const lockedSurvey = canSendSurvey(afterEvent, new Date("2026-07-17T16:59:59+08:00"));
assert.equal(lockedSurvey.ok, false);
assert.equal(lockedSurvey.code, "SURVEY_LOCKED");
assert.equal(canSendSurvey(afterEvent, new Date("2026-07-17T17:00:00+08:00")).ok, true);
assert.deepEqual(getSurveyRecipients(afterEvent, people.slice(0, 3), records).map((person) => person.id), ["T1", "T2"]);

const beforeEvent = { ...afterEvent, survey: { ...afterEvent.survey, timing: "before" } };
assert.deepEqual(getSurveyRecipients(beforeEvent, people.slice(0, 3), {}).map((person) => person.id), ["T1", "T2", "T3"]);
assert.equal(canSendSurvey({ ...beforeEvent, survey: { timing: "before", url: "" } }).code, "MISSING_SURVEY_LINK");
assert.equal(canSendSurvey({ ...beforeEvent, status: "cancelled" }).code, "EVENT_UNAVAILABLE");

const translationKeys = ["courseCreator", "courseDescription", "groupMode_manual", "openLmsRoster", "sendSelected", "surveyTiming", "surveyLocked", "extension", "action"];
for (const language of ["zh-TW", "zh-CN", "en", "ja"]) {
  const translate = createTranslator(language);
  for (const key of translationKeys) {
    assert.notEqual(translate(key), key);
    assert.equal(/\?{2,}/.test(translate(key)), false);
  }
}
assert.equal(createTranslator("zh-CN")("language"), "语言");

const fakeDocument = { documentElement: { lang: "" } };
applyDocumentLanguage(fakeDocument, "ja");
assert.equal(fakeDocument.documentElement.lang, "ja");
applyDocumentLanguage(fakeDocument, "invalid");
assert.equal(fakeDocument.documentElement.lang, "zh-TW");

console.log("ok - Event Check-In v3 domain workflows");
