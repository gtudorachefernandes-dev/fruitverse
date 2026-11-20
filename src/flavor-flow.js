export function createFlavorFlow(initial = 0) {
  let selected = initial;
  let requested = initial;
  let revision = 0;
  return {
    get selected() { return selected; },
    get requested() { return requested; },
    get pristine() { return revision === 0; },
    request(index) { requested = index; return ++revision; },
    isCurrent(token) { return revision === token; },
    commit(index) { selected = index; },
    reject() { requested = selected; },
  };
}
