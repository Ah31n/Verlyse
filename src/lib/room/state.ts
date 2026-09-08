// The Keeping Room — vertical-slice state machine.
// PULL -> READ -> RETURN, expressed as discrete attention states.
export type RoomState =
  | 'arrival'
  | 'discovery'
  | 'focus'
  | 'settle'
  | 'entry'
  | 'ending'
  | 'next'
  | 'return'
  | 'category'
  | 'dossier'

export const STATE_ORDER: RoomState[] = [
  'arrival', 'discovery', 'focus', 'settle', 'entry', 'ending', 'next', 'return',
]

// Reading itself hands off to the canonical /article/:id (ArticleDetail).
// `entry` is the moment the room resolves into the page; `ending` is the return.
export const STATE_LABEL: Record<RoomState, string> = {
  arrival: '01 · Arrival',
  discovery: '02 · Archive discovery',
  focus: '03 · Article focus',
  settle: '04 · Focus settle',
  entry: '05 · Article entry',
  ending: '07 · Ending',
  next: '08 · Next',
  return: '09 · Return',
  category: '10 · Category',
  dossier: '11 · Creator dossier',
}

export const STATE_HINT: Record<RoomState, string> = {
  arrival: 'The threshold. The archive waits in the dark.',
  discovery: 'Nineteen plates on a brass thread. Attention chooses one.',
  focus: 'One plate comes forward; the room dims around it.',
  settle: 'The plate settles face-on. Enter, or return.',
  entry: 'The plate becomes the article. Reading begins.',
  ending: 'The story closes. The room reforms behind the page.',
  next: 'The thread offers the newest voice — folio №19.',
  return: 'Back among the plates. Nothing is lost; one is read.',
  category: 'A category along the thread — the room never becomes a list.',
  dossier: 'A contributor record. The canonical creator page holds the rest.',
}

export function nextState(s: RoomState): RoomState {
  const i = STATE_ORDER.indexOf(s)
  return STATE_ORDER[Math.min(i + 1, STATE_ORDER.length - 1)]
}
export function prevState(s: RoomState): RoomState {
  const i = STATE_ORDER.indexOf(s)
  return STATE_ORDER[Math.max(i - 1, 0)]
}
