import assert from "node:assert/strict";
import {
  applyAction,
  computeStats,
  evaluateAction,
  formatAttendanceTimestamp,
  getAttendanceStatus,
  getWaitlistSlots,
} from "../src/domain/checkinEngine.js";
import { getTemplate } from "../src/domain/templates.js";
import { events, roster } from "../src/data/mockData.js";

const tests = [];
const test = (name, run) => tests.push({ name, run });
const event = events[0];
const training = getTemplate("training");

test("training requires check-in before check-out", () => {
  const result = evaluateAction({ action: "checkout", person: roster[0], event, template: training, elapsedMinutes: 20, records: {}, people: roster });
  assert.equal(result.code, "CHECKOUT_WITHOUT_CHECKIN");
  assert.equal(result.allowed, false);
});

test("check-in and check-out timestamps are derived from the event start", () => {
  const records = applyAction({}, roster[0].id, "checkin", 5);
  const completed = applyAction(records, roster[0].id, "checkout", 470);
  assert.equal(formatAttendanceTimestamp(event, completed[roster[0].id].checkins[0]).full, "2026-07-10 09:05");
  assert.equal(formatAttendanceTimestamp(event, completed[roster[0].id].checkout).full, "2026-07-10 16:50");
});

test("lecture check-in completes without check-out", () => {
  const template = getTemplate("lecture");
  const records = applyAction({}, roster[0].id, "checkin", 5);
  const status = getAttendanceStatus({ person: roster[0], event: events[1], template, elapsedMinutes: 5, records });
  assert.equal(status.status, "complete");
});

test("expo allows repeat entry", () => {
  const template = getTemplate("expo");
  const records = applyAction({}, roster[0].id, "checkin", 2);
  const result = evaluateAction({ action: "checkin", person: roster[0], event, template, elapsedMinutes: 45, records, people: roster });
  assert.equal(result.code, "REENTRY_SUCCESS");
  assert.equal(result.entryCount, 2);
});

test("exam blocks entry after cutoff", () => {
  const result = evaluateAction({ action: "checkin", person: roster[1], event, template: getTemplate("exam"), elapsedMinutes: 21, records: {}, people: roster });
  assert.equal(result.code, "LATE_ENTRY_BLOCKED");
  assert.equal(result.allowed, false);
});

test("a full, seat-limited event releases no-show seats after 30 minutes", () => {
  const waitlistPerson = roster.find((person) => person.id === "W001");
  const beforeRelease = evaluateAction({ action: "checkin", person: waitlistPerson, event, template: training, elapsedMinutes: 29, records: {}, people: roster });
  const afterRelease = evaluateAction({ action: "checkin", person: waitlistPerson, event, template: training, elapsedMinutes: 31, records: {}, people: roster });
  assert.equal(beforeRelease.code, "WAITLIST_NOT_OPEN");
  assert.equal(afterRelease.code, "WAITLIST_ADMITTED");
  assert.equal(getWaitlistSlots({ event, template: training, elapsedMinutes: 31, records: {}, people: roster }), 8);
});

test("an unrestricted event records waitlist attendees as on-site waitlist immediately", () => {
  const waitlistPerson = roster.find((person) => person.id === "W001");
  const openEvent = { ...event, capacityLimited: false, registrationFull: false };
  const result = evaluateAction({ action: "checkin", person: waitlistPerson, event: openEvent, template: training, elapsedMinutes: 2, records: {}, people: roster });
  assert.equal(result.code, "WAITLIST_ONSITE_ADMISSION");
  assert.equal(result.allowed, true);
  assert.equal(result.admissionType, "onsiteWaitlist");
});

test("early-bird eligibility requires registered rank and on-time check-in", () => {
  const eligible = evaluateAction({ action: "checkin", person: roster[0], event, template: training, elapsedMinutes: 5, records: {}, people: roster });
  const late = evaluateAction({ action: "checkin", person: roster[0], event, template: training, elapsedMinutes: 16, records: {}, people: roster });
  const outOfQuota = evaluateAction({ action: "checkin", person: roster[3], event, template: training, elapsedMinutes: 5, records: {}, people: roster });
  assert.equal(eligible.earlyBirdEligible, true);
  assert.equal(late.earlyBirdEligible, false);
  assert.equal(outOfQuota.earlyBirdEligible, false);
});

test("stats retain operational metrics and include released waitlist capacity", () => {
  const records = applyAction({}, roster[0].id, "checkin", 5);
  const stats = computeStats({ people: roster, event, template: training, elapsedMinutes: 31, records });
  assert.deepEqual(Object.keys(stats), ["expected", "arrived", "unresolved", "openSeats", "entries", "waitlistSlots"]);
  assert.equal(stats.arrived, 1);
  assert.equal(stats.waitlistSlots, 7);
});

let failures = 0;
for (const item of tests) {
  try { item.run(); console.log(`ok - ${item.name}`); }
  catch (error) { failures += 1; console.error(`not ok - ${item.name}`); console.error(error); }
}
if (failures > 0) process.exitCode = 1;

