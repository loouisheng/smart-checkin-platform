function parseCsvRow(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

const localized = (value) => ({ "zh-TW": value, "zh-CN": value, en: value, ja: value });

export function csvCell(value) {
  const valueText = value == null ? "" : String(value);
  return /[",\n]/.test(valueText) ? `"${valueText.replaceAll('"', '""')}"` : valueText;
}

export function parseRosterCsv(text, { requireGroup = false } = {}) {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("ROSTER_EMPTY");
  const headers = parseCsvRow(lines[0]).map((header) => header.trim().toLowerCase());
  const employeeIndex = headers.indexOf("employee_id");
  const nameIndex = headers.indexOf("name");
  if (employeeIndex < 0 || nameIndex < 0) throw new Error("ROSTER_REQUIRED_COLUMNS");
  const indexOf = (key) => headers.indexOf(key);
  const groupIndex = indexOf("group");
  if (requireGroup && groupIndex < 0) throw new Error("ROSTER_GROUP_COLUMN_REQUIRED");
  const seen = new Set();
  const people = lines.slice(1).map((line) => {
    const cells = parseCsvRow(line);
    const id = String(cells[employeeIndex] || "").trim();
    const name = String(cells[nameIndex] || "").trim();
    if (!id || !name) throw new Error("ROSTER_REQUIRED_VALUE");
    if (seen.has(id)) throw new Error("DUPLICATE_EMPLOYEE_ID");
    seen.add(id);
    const group = groupIndex < 0 ? "" : String(cells[groupIndex] || "").trim();
    if (requireGroup && !group) throw new Error("ROSTER_GROUP_VALUE_REQUIRED");
    return {
      id,
      name: localized(name),
      department: localized(String(cells[indexOf("department")] || "").trim()),
      email: String(cells[indexOf("email")] || "").trim(),
      teamsUrl: String(cells[indexOf("teams_url")] || "").trim(),
      extension: String(cells[indexOf("extension")] || "").trim(),
      group: group || null,
      registered: true,
      leaveStatus: false,
    };
  });
  return { headers, people };
}

export const rosterColumns = ["employee_id", "name", "department", "email", "teams_url", "extension"];

export function buildRosterTemplate(withGroup = false) {
  const headers = [...rosterColumns, ...(withGroup ? ["group"] : [])];
  const rows = [
    ["181201", "Alice Chen", "People", "alice.chen@example.com", "https://teams.microsoft.com/l/chat/0/0?users=alice.chen@example.com", "2181", "A"],
    ["181202", "Brian Lin", "Product", "brian.lin@example.com", "https://teams.microsoft.com/l/chat/0/0?users=brian.lin@example.com", "2264", "B"],
  ].map((row) => (withGroup ? row : row.slice(0, rosterColumns.length)));
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function buildRosterCsv(people, { language = "zh-TW", localize = (value) => value, withGroup = false } = {}) {
  const headers = [...rosterColumns, ...(withGroup ? ["group"] : [])];
  const rows = (people || []).map((person) => {
    const row = [person.id, localize(person.name, language), localize(person.department, language), person.email || "", person.teamsUrl || "", person.extension || ""];
    return withGroup ? [...row, person.group || ""] : row;
  });
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function applyRosterGrouping(people, grouped) {
  return (people || []).map((person) => ({ ...person, group: grouped ? person.group || null : null }));
}

export function validateRosterGrouping(people, grouped) {
  if (!grouped) return { ok: true, missingIds: [] };
  const missingIds = (people || []).filter((person) => !String(person.group || "").trim()).map((person) => person.id);
  return { ok: missingIds.length === 0, missingIds };
}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
