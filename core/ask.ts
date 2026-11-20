// iris_ask's labels: bb shows "Waiting: <title>" while the picker waits and "Answered: <title>"
// after, and refuses a request whose label is over 80 characters. A title of up to 120 is
// accepted, so a long one is cut at a word to fit.

/** bb's limit on a pending interaction's label. */
export const ASK_LABEL_MAX = 80;

function fit(prefix: string, title: string): string {
  const whole = `${prefix}${title}`;
  if (whole.length <= ASK_LABEL_MAX) return whole;
  const room = title.slice(0, ASK_LABEL_MAX - prefix.length - 1);
  const atWord = room.replace(/\s+\S*$/, "");
  return `${prefix}${(atWord.length >= room.length / 2 ? atWord : room).trimEnd()}…`;
}

export function askLabels(title: string): { pending: string; completed: string } {
  return { pending: fit("Waiting: ", title), completed: fit("Answered: ", title) };
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const ASK_TIMEOUTS = {
  "30 minutes": 30 * MINUTE_MS,
  "1 hour": HOUR_MS,
  "4 hours": 4 * HOUR_MS,
  "8 hours": 8 * HOUR_MS,
  "24 hours": 24 * HOUR_MS,
  "3 days": 72 * HOUR_MS,
  "7 days": 168 * HOUR_MS,
} as const;

export type AskTimeout = keyof typeof ASK_TIMEOUTS;

export const DEFAULT_ASK_TIMEOUT: AskTimeout = "1 hour";

export function askTimeoutMs(setting: unknown, timeoutMinutes: number | undefined): number {
  if (timeoutMinutes !== undefined) return timeoutMinutes * MINUTE_MS;
  return typeof setting === "string" && Object.hasOwn(ASK_TIMEOUTS, setting) ? ASK_TIMEOUTS[setting as AskTimeout] : ASK_TIMEOUTS[DEFAULT_ASK_TIMEOUT];
}
