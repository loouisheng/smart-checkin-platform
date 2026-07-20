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

export function parseRosterCsv(text) {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("ROSTER_EMPTY");
  const headers = parseCsvRow(lines[0]).map((header) => header.trim().toLowerCase());
  const employeeIndex = headers.indexOf("employee_id");
  const nameIndex = headers.indexOf("name");
  if (employeeIndex < 0 || nameIndex < 0) throw new Error("ROSTER_REQUIRED_COLUMNS");
  const indexOf = (key) => headers.indexOf(key);
  const seen = new Set();
  const people = lines.slice(1).map((line) => {
    const cells = parseCsvRow(line);
    const id = String(cells[employeeIndex] || "").trim();
    const name = String(cells[nameIndex] || "").trim();
    if (!id || !name) throw new Error("ROSTER_REQUIRED_VALUE");
    if (seen.has(id)) throw new Error("DUPLICATE_EMPLOYEE_ID");
    seen.add(id);
    const department = String(cells[indexOf("department")] || "").trim();
    return {
      id,
      name: localized(name),
      department: localized(department),
      email: String(cells[indexOf("email")] || "").trim(),
      teamsUrl: String(cells[indexOf("teams_url")] || "").trim(),
      extension: String(cells[indexOf("extension")] || "").trim(),
      group: null,
      registered: true,
      leaveStatus: false,
    };
  });
  return { headers, people };
}

export function validateManualAssignments(people, assignments = {}) {
  const unassignedIds = (people || []).filter((person) => !String(assignments[person.id] || "").trim()).map((person) => person.id);
  return { ok: unassignedIds.length === 0, unassignedIds };
}

export function applyManualAssignments(people, assignments = {}) {
  return (people || []).map((person) => ({ ...person, group: String(assignments[person.id] || "").trim() || null }));
}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
