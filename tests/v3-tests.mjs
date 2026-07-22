import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  applyAttendance, applyRosterGrouping, assignGroups, attendanceStatuses, buildAttendanceCsv, buildAttendanceMatrix, buildRosterCsv,
  buildRosterTemplate, calculateKpis, canSendSurvey, drawPrizeAssignments, evaluateAttendance, evaluateCompletion, filterEvents,
  getAttendanceStatus, getAttendedHours, getEarlyBirdEligible, getEventEndAt, getRecord, getRequiredHours, getSurveyRecipients,
  hoursBetween, isValidHttpUrl, normalizeEvent, parseRosterCsv, resizePrizeList, retainFailedRecipients, shiftIsoDate, toIsoDate,
  toggleAward, toggleFilteredRecipients, toggleLeave, toggleRecipientSelection, validateRosterGrouping,
} from "../src/v3/domain.js";
import { buildXlsx, columnName, safeFileName, uniqueFileNames, zipStore } from "../src/v3/xlsx.js";
import { applyDocumentLanguage, createTranslator } from "../src/v3/i18n.js";
import { currentUser, events as seedEvents, fetchLmsRosterUpdate, rostersByEvent } from "../src/v3/data.js";

const people = Array.from({ length: 10 }, (_, index) => ({
  id: `T${index + 1}`, name: { en: `Person ${index + 1}` }, department: { en: "People" },
  email: `p${index + 1}@example.com`, registered: true, leaveStatus: false,
}));
const event = { id: "E1", date: "2026-07-17", startTime: "09:00", endTime: "17:00", totalHours: 8, lifecycle: "activated", status: "live", rules: { lateAfterMin: 15, absentAfterMin: 30 }, title: { en: "Test" }, instructor: { en: "Coach" } };

const grouped = assignGroups(people, 4);
const counts = Object.values(grouped.reduce((result, person) => ({ ...result, [person.group]: (result[person.group] || 0) + 1 }), {}));
assert.equal(Math.max(...counts) - Math.min(...counts) <= 1, true);
assert.equal(Math.max(...counts) <= 4, true);

assert.equal(evaluateAttendance({ mode: "checkout", person: people[0], event, record: getRecord({}, people[0].id) }).code, "withoutCheckin");
let records = applyAttendance({}, people[0].id, "checkin", "card", "2026-07-17T09:04:00+08:00");
records = applyAttendance(records, people[1].id, "checkin", "manual", "2026-07-17T09:01:00+08:00");
assert.deepEqual(getEarlyBirdEligible(people, records, 1).map((person) => person.id), ["T2"]);
assert.equal(getAttendanceStatus(people[0], records.T1, event), "checkedIn");

// Completion needs 80% of the event's total hours (8h event => 6.4h).
assert.equal(getRequiredHours(event), 6.4);
assert.equal(hoursBetween("09:00", "17:00"), 8);
assert.equal(hoursBetween("09:30", "16:30"), 7);
assert.equal(hoursBetween("17:00", "09:00"), 0);
const completedRecord = { checkin: { at: "2026-07-17T09:00:00+08:00" }, checkout: { at: "2026-07-17T16:00:00+08:00" } };
const shortRecord = { checkin: { at: "2026-07-17T09:00:00+08:00" }, checkout: { at: "2026-07-17T13:00:00+08:00" } };
assert.equal(getAttendedHours(completedRecord), 7);
assert.equal(getAttendedHours({ checkin: { at: "2026-07-17T09:00:00+08:00" }, checkout: null }), 0);
assert.deepEqual(evaluateCompletion(event, completedRecord), { attendedHours: 7, requiredHours: 6.4, completed: true });
assert.equal(evaluateCompletion(event, shortRecord).completed, false);
assert.equal(getAttendanceStatus(people[0], completedRecord, event), "completed");
assert.equal(getAttendanceStatus(people[0], shortRecord, event), "incomplete");
assert.equal(getAttendanceStatus(people[0], getRecord({}, "T1"), event), "pending", "no-shows stay pending, the absent status is gone");
assert.equal(getAttendanceStatus(people[0], { checkin: { at: "2026-07-17T09:40:00+08:00" }, checkout: null }, event), "late");
assert.deepEqual(attendanceStatuses, ["pending", "checkedIn", "late", "completed", "incomplete", "leave"]);

// Awards are set by hand from the live roster.
const awarded = toggleAward({}, "T1", true, "2026-07-17T18:00:00+08:00");
assert.equal(awarded.T1.awarded, true);
assert.equal(toggleAward(awarded, "T1", false, "2026-07-17T18:05:00+08:00").T1.awarded, false);

const kpiRecords = { T1: completedRecord, T2: shortRecord };
assert.deepEqual(calculateKpis(people.slice(0, 4), kpiRecords, event), { expected: 4, arrived: 2, needsAction: 1, attendanceRate: 50 });

const prizes = [{ id: "p1", name: { en: "Gold" }, quantity: 1 }, { id: "p2", name: { en: "Silver" }, quantity: 1 }, { id: "p3", name: { en: "Bronze" }, quantity: 1 }];
const draw = drawPrizeAssignments(people, records, prizes, () => 0);
assert.equal(draw.assignments.length, 2, "only checked-in people can win");
assert.equal(new Set(draw.assignments.map((item) => item.person.id)).size, 2);
assert.equal(draw.unassignedCount, 1);

// Prize lists are modular: the manager decides how many prizes exist.
assert.equal(resizePrizeList([{ name: "A", quantity: 2 }], 3).length, 3);
assert.deepEqual(resizePrizeList([{ name: "A", quantity: 2 }], 3)[0], { name: "A", quantity: 2 });
assert.equal(resizePrizeList([{ name: "A" }, { name: "B" }, { name: "C" }], 1).length, 1);
assert.equal(resizePrizeList([], 0).length, 1);
assert.equal(resizePrizeList([], 99).length, 12);

const leaveRecords = toggleLeave({}, people[2].id, true, "2026-07-17T08:00:00+08:00");
assert.equal(getAttendanceStatus(people[2], leaveRecords.T3, event), "leave");

const exportOptions = { event, people: people.slice(0, 2), records: { ...records, T1: { ...completedRecord, awarded: true } }, language: "en", localize: (value) => value.en, statusLabel: (value) => value, label: (key) => key };
const csv = buildAttendanceCsv(exportOptions);
assert.equal(csv.startsWith("\uFEFF"), true);
assert.equal(csv.includes("employeeId"), true);
assert.equal(csv.includes("T1"), true);
const matrix = buildAttendanceMatrix(exportOptions);
assert.equal(matrix[0].includes("attendedHours"), true);
assert.equal(matrix[0].includes("awardStatus"), true);
assert.equal(matrix[1][matrix[0].indexOf("attendedHours")], 7);
assert.equal(matrix[1][matrix[0].indexOf("awardStatus")], "awarded");

// The Excel export must be a real xlsx package, not a renamed CSV.
const workbook = buildXlsx("Attendance", matrix);
assert.deepEqual([...workbook.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04], "starts with the ZIP signature");
const workbookText = new TextDecoder("latin1").decode(workbook);
for (const part of ["[Content_Types].xml", "xl/workbook.xml", "xl/worksheets/sheet1.xml", "_rels/.rels", "xl/_rels/workbook.xml.rels"]) {
  assert.equal(workbookText.includes(part), true, part + " is packaged");
}
assert.equal(workbookText.includes("PK\u0005\u0006"), true, "ends with a central directory record");
assert.equal(columnName(0), "A");
assert.equal(columnName(26), "AA");
assert.equal(safeFileName("A/B:C"), "A B C");
assert.equal(safeFileName("   "), "report");
assert.equal(zipStore([{ name: "a.txt", data: "hello" }]).length > 0, true);
assert.deepEqual(uniqueFileNames(["a.xlsx", "a.xlsx", "b.xlsx"]), ["a.xlsx", "a (2).xlsx", "b.xlsx"]);

// Date helpers back the single-day filter that defaults to today.
assert.equal(toIsoDate(new Date(2026, 6, 21)), "2026-07-21");
assert.equal(shiftIsoDate("2026-07-21", 4), "2026-07-25");
assert.equal(shiftIsoDate("2026-08-01", -1), "2026-07-31");

const filterFixtures = [
  { id: "E1", title: { en: "July Leadership" }, source: "lms", ownerId: "U-LOUIS", category: "leadership", status: "completed", date: "2026-07-12", startTime: "09:00", modules: { survey: true } },
  { id: "E2", title: { en: "August AI" }, source: "self", ownerId: "U-LOUIS", category: "digital", status: "upcoming", date: "2026-08-03", startTime: "10:00", modules: { survey: false } },
  { id: "E3", title: { en: "August Supplier Summit" }, source: "self", ownerId: "U-OTHER", category: "teamwork", status: "upcoming", date: "2026-08-03", startTime: "09:00", modules: { survey: true } },
  { id: "E4", title: { en: "Cancelled Day" }, source: "self", ownerId: "U-LOUIS", category: "teamwork", status: "cancelled", date: "2026-08-03", startTime: "08:00", modules: {} },
];

assert.deepEqual(filterEvents(filterFixtures, { query: "leadership" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { date: "2026-08-03" }).map(({ id }) => id), ["E3", "E2"]);
assert.deepEqual(filterEvents(filterFixtures, { date: "2026-08-03", ownerId: "U-LOUIS" }).map(({ id }) => id), ["E2"]);
assert.deepEqual(filterEvents(filterFixtures, { ownerId: "U-LOUIS" }).map(({ id }) => id), ["E1", "E2"], "cancelled events stay hidden");
assert.deepEqual(filterEvents(filterFixtures, { module: "survey", ownerId: "U-LOUIS" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { source: "self", category: "digital", status: "upcoming" }).map(({ id }) => id), ["E2"]);

const normalized = normalizeEvent({ id: "SELF-1", source: "self", grouping: { enabled: true }, totalHours: "6", survey: { url: "https://forms.example/x" }, lottery: { prizes: [{ name: { en: "Gold" }, quantity: "3" }] } });
assert.deepEqual(normalized.grouping, { enabled: true });
assert.equal(normalized.survey.timing, undefined, "survey timing was removed");
assert.equal(normalized.lottery.prizes[0].quantity, 3);
assert.equal(normalized.lottery.prizes[0].id, "p1");
assert.equal(normalized.totalHours, 6);
assert.equal(normalizeEvent({ id: "SELF-2", grouping: {} }).grouping.enabled, false);
assert.equal(normalizeEvent({ id: "SELF-2", grouping: {} }).totalHours, 0);

// Rosters carry their own group column; the system never assigns groups for the manager.
const parsedRoster = parseRosterCsv("employee_id,name,department,email\nE01,Ada,HR,ada@example.com");
assert.deepEqual(parsedRoster.people.map((person) => person.id), ["E01"]);
assert.equal(parsedRoster.people[0].email, "ada@example.com");
assert.equal(parsedRoster.people[0].group, null);
assert.throws(() => parseRosterCsv("employee_id,name\nE01,Ada\nE01,Grace"), /DUPLICATE_EMPLOYEE_ID/);
assert.throws(() => parseRosterCsv("employee_id,name\nE01,Ada", { requireGroup: true }), /ROSTER_GROUP_COLUMN_REQUIRED/);
assert.throws(() => parseRosterCsv("employee_id,name,group\nE01,Ada,", { requireGroup: true }), /ROSTER_GROUP_VALUE_REQUIRED/);
const groupedRoster = parseRosterCsv("employee_id,name,group\nE01,Ada,A\nE02,Grace,B", { requireGroup: true });
assert.deepEqual(groupedRoster.people.map((person) => person.group), ["A", "B"]);

assert.deepEqual(validateRosterGrouping(groupedRoster.people, true), { ok: true, missingIds: [] });
assert.deepEqual(validateRosterGrouping([{ id: "E01", group: "A" }, { id: "E02", group: " " }], true), { ok: false, missingIds: ["E02"] });
assert.equal(validateRosterGrouping([{ id: "E02", group: null }], false).ok, true);
assert.deepEqual(applyRosterGrouping(groupedRoster.people, false).map((person) => person.group), [null, null]);

const template = buildRosterTemplate(true);
assert.equal(template.startsWith("\uFEFFemployee_id,name,department,email,teams_url,extension,group"), true);
assert.equal(buildRosterTemplate(false).includes(",group"), false);
const rosterCsv = buildRosterCsv(groupedRoster.people, { language: "en", localize: (value) => value.en, withGroup: true });
assert.equal(rosterCsv.includes("E01,Ada"), true);
assert.equal(rosterCsv.trim().endsWith("B"), true);

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

// Surveys are always sent after the event ends.
const surveyEvent = { ...event, survey: { url: "https://forms.example/x" } };
assert.equal(getEventEndAt(surveyEvent).toISOString(), "2026-07-17T09:00:00.000Z");
const lockedSurvey = canSendSurvey(surveyEvent, new Date("2026-07-17T16:59:59+08:00"));
assert.equal(lockedSurvey.ok, false);
assert.equal(lockedSurvey.code, "SURVEY_LOCKED");
assert.equal(canSendSurvey(surveyEvent, new Date("2026-07-17T17:00:00+08:00")).ok, true);
assert.deepEqual(getSurveyRecipients(surveyEvent, people.slice(0, 3), records).map((person) => person.id), ["T1", "T2"]);
assert.equal(canSendSurvey({ ...surveyEvent, survey: { url: "" } }).code, "MISSING_SURVEY_LINK");
assert.equal(canSendSurvey({ ...surveyEvent, status: "cancelled" }).code, "EVENT_UNAVAILABLE");

// Seed data: every event the console shows must belong to the signed-in manager, and today must have events.
const todayIsoDate = toIsoDate(new Date());
const ownedEvents = seedEvents.filter((item) => item.ownerId === currentUser.id);
assert.equal(ownedEvents.length < seedEvents.length, true, "seed data includes at least one event owned by someone else");
assert.equal(filterEvents(seedEvents, { date: todayIsoDate, ownerId: currentUser.id }).length > 0, true, "today has visible events");
assert.equal(seedEvents.every((item) => "materials" in item.modules === false), true, "the materials module was removed");
// The creator is always the contact, so every event carries their extension instead of a separate organizer.
assert.equal(seedEvents.every((item) => item.contactExtension && !item.organizer), true, "events expose a contact extension");
assert.equal(ownedEvents.every((item) => item.contactExtension === currentUser.extension), true, "own events use the signed-in manager's extension");
for (const item of seedEvents.filter((entry) => entry.grouping.enabled)) {
  assert.equal(validateRosterGrouping(rostersByEvent[item.id], true).ok, true, `${item.id} roster is fully grouped`);
}
// Registered headcount has to match what the report KPIs count.
for (const item of seedEvents) {
  assert.equal(item.capacity, rostersByEvent[item.id].length, item.id + " capacity matches its roster");
  assert.equal(calculateKpis(rostersByEvent[item.id], {}, item).expected, item.capacity);
  assert.equal(item.totalHours > 0, true, item.id + " has total hours");
  assert.equal(Boolean(item.instructor && item.deputy), true, item.id + " has an instructor and a deputy");
}

// LMS roster refresh brings in later registrations without dropping anyone.
const baseRoster = rostersByEvent[seedEvents[0].id];
const firstSync = fetchLmsRosterUpdate(baseRoster, true);
assert.equal(firstSync.added, 2);
assert.equal(firstSync.people.length, baseRoster.length + 2);
assert.equal(firstSync.people.slice(0, baseRoster.length).every((person, index) => person.id === baseRoster[index].id), true);
assert.equal(firstSync.people.every((person) => Boolean(person.group)), true, "new registrations are grouped by LMS");
assert.equal(fetchLmsRosterUpdate(firstSync.people, true).people.length, baseRoster.length + 4);
assert.equal(fetchLmsRosterUpdate(firstSync.people, false).people.slice(-1)[0].group, null);

const translationKeys = ["eventCreator", "eventDescription", "groupingToggle", "prizeCount", "prizeQty", "filterDate", "allDates", "modeCheckoutActive", "rosterPreview", "contactExtension", "sendAll", "instructor", "totalHours", "deputy", "completed", "incomplete", "awarded", "rangeExport", "extension", "action"];
for (const language of ["zh-TW", "zh-CN", "en", "ja"]) {
  const translate = createTranslator(language);
  for (const key of translationKeys) {
    assert.notEqual(translate(key), key);
    assert.equal(/\?{2,}/.test(translate(key)), false);
  }
}
assert.equal(createTranslator("zh-CN")("language"), "语言");
assert.equal(createTranslator("zh-TW")("capacity"), "參加人數");
assert.equal(createTranslator("zh-TW")("contactExtension"), "聯絡分機");
assert.equal(createTranslator("zh-TW")("survey"), "問卷發送");
assert.equal(createTranslator("zh-TW")("lottery"), "活動抽獎");

const fakeDocument = { documentElement: { lang: "" } };
applyDocumentLanguage(fakeDocument, "ja");
assert.equal(fakeDocument.documentElement.lang, "ja");
applyDocumentLanguage(fakeDocument, "invalid");
assert.equal(fakeDocument.documentElement.lang, "zh-TW");

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(indexHtml, /<title>Event Check-In<\/title>/);

console.log("ok - Event Check-In v3 domain workflows");
