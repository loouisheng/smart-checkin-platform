export function getEventEndAt(event) {
  return new Date(`${event.date}T${event.endTime}:00+08:00`);
}

export function canSendSurvey(event, now = new Date()) {
  if (!event || event.status === "cancelled" || event.lifecycle === "cancelled") return { ok: false, code: "EVENT_UNAVAILABLE", unlockAt: null };
  if (!event.survey?.url) return { ok: false, code: "MISSING_SURVEY_LINK", unlockAt: null };
  const unlockAt = getEventEndAt(event);
  if ((event.survey.timing || "after") === "after" && now.getTime() < unlockAt.getTime()) return { ok: false, code: "SURVEY_LOCKED", unlockAt: unlockAt.toISOString() };
  return { ok: true, code: "SURVEY_READY", unlockAt: unlockAt.toISOString() };
}

export function getSurveyRecipients(event, people, records) {
  if ((event?.survey?.timing || "after") === "before") return (people || []).filter((person) => person.registered !== false);
  return (people || []).filter((person) => Boolean(records?.[person.id]?.checkin));
}
