import { getTemplate } from "./templates.js";

export function eventStartValue(event) {
  const start = event.startTime || event.time?.match(/\d{1,2}:\d{2}/)?.[0] || "00:00";
  return new Date(`${event.date}T${start}:00`).getTime();
}

export function sortEventsByStart(events) {
  return [...events].sort((a, b) => eventStartValue(a) - eventStartValue(b));
}

export function buildEventTemplate(event) {
  const base = getTemplate(event?.templateId || "training");
  if (!event) return base;
  const enabled = event.modules || {};
  const modules = ["attendance"];
  if (enabled.waitlist) modules.push("waitlist");
  if (enabled.materials) modules.push("materials");
  if (enabled.seating) modules.push("seating");
  if (enabled.earlyBird) modules.push("earlyBird");
  if (enabled.lottery) modules.push("lottery");
  return {
    ...base,
    requireCheckout: event.requireCheckout ?? base.requireCheckout,
    allowReentry: event.allowReentry ?? false,
    modules,
    rules: {
      ...base.rules,
      lateAfterMin: event.rules?.lateAfterMin,
      absentAfterMin: event.rules?.absentAfterMin,
      earlyLeaveMin: event.rules?.earlyLeaveMin,
      waitlistReleaseMin: event.rules?.waitlistReleaseMin,
    },
  };
}

export function getEventReadiness(event, people = []) {
  const detailsReady = Boolean(
    event?.title?.zh?.trim() &&
    event?.organizer?.trim() &&
    event?.date &&
    event?.startTime &&
    event?.endTime &&
    event?.location?.zh?.trim() &&
    Number(event?.capacity) > 0 &&
    event.startTime < event.endTime,
  );
  const rosterReady = people.length > 0;
  const modulesReady = Boolean(
    (!event?.modules?.materials || event.materialName?.zh?.trim()) &&
    (!event?.modules?.earlyBird || (Number(event.earlyBirdQuota) > 0 && event.earlyBirdBenefit?.zh?.trim())) &&
    (!event?.modules?.lottery || (event.lottery?.prizeName?.trim() && Number(event.lottery?.winnerCount) > 0)),
  );
  return { detailsReady, rosterReady, modulesReady, ready: detailsReady && rosterReady && modulesReady };
}

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseRosterCsv(csvText) {
  const lines = String(csvText || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("名單檔案沒有可匯入的人員資料");
  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const aliases = {
    id: ["id", "employee_id", "員工編號", "識別碼"],
    name: ["name", "姓名"],
    department: ["department", "dept", "部門"],
    email: ["email", "信箱"],
    type: ["type", "registration", "身分", "報名身分"],
    seat: ["seat", "座位"],
  };
  const positions = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, headers.findIndex((header) => names.includes(header))]));
  if (positions.id < 0 || positions.name < 0 || positions.email < 0) throw new Error("CSV 至少需要 id、name、email 三個欄位");

  const seen = new Set();
  return lines.slice(1).map((line, index) => {
    const cells = splitCsvLine(line);
    const id = cells[positions.id]?.trim().toUpperCase();
    const name = cells[positions.name]?.trim();
    const email = cells[positions.email]?.trim();
    if (!id || !name || !email) throw new Error(`第 ${index + 2} 列缺少必要欄位`);
    if (seen.has(id)) throw new Error(`識別碼 ${id} 重複`);
    seen.add(id);
    const rawType = positions.type >= 0 ? cells[positions.type]?.trim().toLowerCase() : "registered";
    const type = ["waitlist", "候補"].includes(rawType) ? "waitlist" : "registered";
    const department = positions.department >= 0 ? cells[positions.department]?.trim() || "未分類" : "未分類";
    return {
      id,
      name: { zh: name, en: name },
      department: { zh: department, en: department },
      email,
      type,
      typeLabel: { zh: type === "waitlist" ? "候補" : "正取", en: type === "waitlist" ? "Waitlist" : "Registered" },
      sequence: index + 1,
      registered: true,
      access: true,
      seat: positions.seat >= 0 && cells[positions.seat]?.trim() ? cells[positions.seat].trim() : `A-${String(index + 1).padStart(2, "0")}`,
      group: `${(index % 4) + 1}`,
      role: ["引導者", "紀錄者", "分享者", "計時員"][index % 4],
    };
  });
}

export function drawWinners({ people, records, previousWinnerIds = [], count = 1, eligibility = "checkedIn", earlyBirdQuota = 50, random = Math.random }) {
  const previous = new Set(previousWinnerIds);
  const pool = people.filter((person) => {
    if (previous.has(person.id)) return false;
    if (eligibility === "allRegistered") return person.type === "registered";
    if (eligibility === "earlyBird") return person.type === "registered" && person.sequence <= earlyBirdQuota && records[person.id]?.checkins?.length > 0;
    return records[person.id]?.checkins?.length > 0;
  });
  const candidates = [...pool];
  const winners = [];
  const drawCount = Math.min(Math.max(1, Number(count) || 1), candidates.length);
  while (winners.length < drawCount) {
    const index = Math.floor(random() * candidates.length);
    winners.push(candidates.splice(index, 1)[0]);
  }
  return { winners, eligibleCount: pool.length };
}
