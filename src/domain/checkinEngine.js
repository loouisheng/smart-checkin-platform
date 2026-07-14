function minuteValue(value) {
  return typeof value === "number" ? value : value?.elapsedMinutes;
}

export function getRecord(records, personId) {
  return records[personId] || { checkins: [], checkout: null, admissionType: null };
}

export function formatAttendanceTimestamp(event, elapsedMinutes) {
  if (elapsedMinutes == null) return "—";
  const match = event.time.match(/(\d{1,2}):(\d{2})/);
  const startMinutes = match ? Number(match[1]) * 60 + Number(match[2]) : 0;
  const total = startMinutes + elapsedMinutes;
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { short: time, full: `${event.date} ${time}`, iso: `${event.date}T${time}:00` };
}

export function getAttendanceStatus({ person, event, template, elapsedMinutes, records }) {
  const record = getRecord(records, person.id);
  const rules = template.rules || {};
  const firstCheckin = minuteValue(record.checkins[0]);

  if (firstCheckin == null) {
    if (rules.absentAfterMin != null && elapsedMinutes > rules.absentAfterMin && person.type === "registered") {
      return { status: "absent", reason: "ABSENT_AFTER_LIMIT" };
    }
    return { status: "pending", reason: "WAITING_FOR_CHECKIN" };
  }

  const isLate = person.type !== "waitlist" && rules.lateAfterMin != null && firstCheckin > rules.lateAfterMin;
  const checkoutMinute = minuteValue(record.checkout);
  if (checkoutMinute != null && template.requireCheckout) {
    const earlyBy = event.endMinutes - checkoutMinute;
    if (rules.earlyLeaveMin != null && earlyBy >= rules.earlyLeaveMin) {
      return { status: "earlyLeave", reason: "EARLY_LEAVE", minutes: earlyBy };
    }
    if (isLate) return { status: "late", reason: "LATE", minutes: firstCheckin };
    return { status: "complete", reason: "COMPLETE" };
  }

  if (isLate) return { status: "late", reason: "LATE", minutes: firstCheckin };
  if (template.requireCheckout) return { status: "checkedIn", reason: "WAITING_FOR_CHECKOUT" };
  return { status: "complete", reason: "CHECKIN_COMPLETE" };
}

export function getWaitlistSlots({ event, template, elapsedMinutes, records, people }) {
  if (!template.modules.includes("waitlist")) return 0;
  if (!event.capacityLimited) return null;

  const releaseAt = template.rules.waitlistReleaseMin ?? 30;
  const registered = people.filter((person) => person.type === "registered");
  const registeredArrived = registered.filter((person) => getRecord(records, person.id).checkins.length > 0).length;
  const admittedWaitlist = people.filter((person) => person.type === "waitlist" && getRecord(records, person.id).checkins.length > 0).length;

  if (elapsedMinutes >= releaseAt) {
    return Math.max(0, event.capacity - registeredArrived - admittedWaitlist);
  }
  return Math.max(0, event.capacity - registered.length - admittedWaitlist);
}

export function evaluateAction({ action, person, event, template, elapsedMinutes, records, people }) {
  if (!person || !person.registered) {
    return { code: "NOT_REGISTERED", tone: "error", allowed: false, nextSteps: ["MANUAL_REVIEW"] };
  }
  const record = getRecord(records, person.id);
  if (action === "checkout") {
    if (!template.requireCheckout) return { code: "CHECKOUT_NOT_REQUIRED", tone: "warning", allowed: false, nextSteps: [] };
    if (record.checkins.length === 0) return { code: "CHECKOUT_WITHOUT_CHECKIN", tone: "error", allowed: false, nextSteps: ["MANUAL_REVIEW"] };
    if (record.checkout != null) return { code: "ALREADY_CHECKED_OUT", tone: "warning", allowed: false, nextSteps: [] };
    return { code: "CHECKOUT_SUCCESS", tone: "success", allowed: true, nextSteps: [] };
  }

  if (template.modules.includes("accessControl") && person.access === false) {
    return { code: "ACCESS_DENIED", tone: "error", allowed: false, nextSteps: ["MANUAL_REVIEW"] };
  }
  if (template.rules.hardCutoffMin != null && elapsedMinutes > template.rules.hardCutoffMin) {
    return { code: "LATE_ENTRY_BLOCKED", tone: "error", allowed: false, nextSteps: ["MANUAL_REVIEW"] };
  }
  if (record.checkins.length > 0) {
    if (template.allowReentry) return { code: "REENTRY_SUCCESS", tone: "success", allowed: true, nextSteps: [], entryCount: record.checkins.length + 1 };
    return { code: "ALREADY_CHECKED_IN", tone: "warning", allowed: false, nextSteps: [] };
  }

  let admissionType = person.type === "waitlist" ? "onsiteWaitlist" : "registered";
  let admissionCode = null;
  if (person.type === "waitlist" && template.modules.includes("waitlist")) {
    if (event.capacityLimited) {
      const releaseAt = template.rules.waitlistReleaseMin ?? 30;
      if (event.registrationFull && elapsedMinutes < releaseAt) {
        return { code: "WAITLIST_NOT_OPEN", tone: "warning", allowed: false, nextSteps: ["WAIT_FOR_RELEASE"] };
      }
      if (getWaitlistSlots({ event, template, elapsedMinutes, records, people }) <= 0) {
        return { code: "NO_WAITLIST_SEAT", tone: "error", allowed: false, nextSteps: ["MANUAL_REVIEW"] };
      }
      admissionCode = event.registrationFull ? "WAITLIST_ADMITTED" : "WAITLIST_ONSITE_ADMISSION";
    } else {
      admissionCode = "WAITLIST_ONSITE_ADMISSION";
    }
  }

  const late = person.type !== "waitlist" && template.rules.lateAfterMin != null && elapsedMinutes > template.rules.lateAfterMin;
  const materialsEligible = Boolean(event.materialName && template.modules.includes("materials"));
  const earlyBirdEligible = Boolean(
    event.earlyBirdQuota > 0 && person.type === "registered" && person.sequence <= event.earlyBirdQuota && !late,
  );
  const nextSteps = [];
  if (event.seatingEnabled && person.seat) nextSteps.push("SHOW_SEAT");
  if (template.modules.includes("grouping") && person.group) nextSteps.push("SHOW_GROUP");
  if (template.modules.includes("identity")) nextSteps.push("VERIFY_IDENTITY");
  if (materialsEligible) nextSteps.push("SEND_MATERIALS");
  if (earlyBirdEligible) nextSteps.push("ISSUE_EARLY_BIRD");

  return {
    code: admissionCode || (late ? "LATE_CHECKIN" : "CHECKIN_SUCCESS"),
    tone: late ? "warning" : "success",
    allowed: true,
    nextSteps,
    admissionType,
    materialsEligible,
    earlyBirdEligible,
  };
}

export function applyAction(records, personId, action, elapsedMinutes, options = {}) {
  const current = getRecord(records, personId);
  if (action === "checkin") {
    return {
      ...records,
      [personId]: {
        ...current,
        checkins: [...current.checkins, elapsedMinutes],
        admissionType: options.admissionType || current.admissionType || "registered",
      },
    };
  }
  return { ...records, [personId]: { ...current, checkout: elapsedMinutes } };
}

export function computeStats({ people, event, template, elapsedMinutes, records, pendingReviews = 0 }) {
  const registered = people.filter((person) => person.type === "registered");
  const arrived = people.filter((person) => getRecord(records, person.id).checkins.length > 0);
  const anomalies = registered.filter((person) => {
    const status = getAttendanceStatus({ person, event, template, elapsedMinutes, records }).status;
    return ["late", "absent", "earlyLeave"].includes(status);
  }).length + pendingReviews;

  return {
    expected: Math.min(event.capacity, registered.length),
    arrived: arrived.length,
    unresolved: anomalies,
    openSeats: Math.max(0, event.capacity - arrived.length),
    entries: people.reduce((total, person) => total + getRecord(records, person.id).checkins.length, 0),
    waitlistSlots: getWaitlistSlots({ event, template, elapsedMinutes, records, people }),
  };
}

