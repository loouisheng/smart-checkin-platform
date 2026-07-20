export function toggleRecipientSelection(current, personId, selected) {
  const next = new Set(current || []);
  if (selected) next.add(personId);
  else next.delete(personId);
  return next;
}

export function toggleFilteredRecipients(current, filteredIds, selected) {
  const next = new Set(current || []);
  for (const personId of filteredIds || []) {
    if (selected) next.add(personId);
    else next.delete(personId);
  }
  return next;
}

export function retainFailedRecipients(current, results) {
  const resultByPerson = new Map((results || []).map((result) => [result.personId, result]));
  return new Set([...new Set(current || [])].filter((personId) => resultByPerson.get(personId)?.status !== "sent"));
}
