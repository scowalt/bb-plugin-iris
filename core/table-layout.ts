// How a Table lays out a text column: sentences wrap over as many lines as they need; short
// labels, IDs, paths and hashes stay on one line (a row whose cell is still cut opens in full on a
// click). Shared by the Table view and iris_check, so the check says what the person will see.

/** A value this long with a space in it is a sentence: cut to one line it can't be read. */
export const SENTENCE_CHARS = 40;

/** Words with spaces between them, not a path that has a space in it ("~/Library/Application Support/..."). */
const pathLike = (v: string) => /(^|\s)\S*[\\/]\S*[\\/]/.test(v);
/** Words with spaces between them, not a path that has a space in it. */
const hasWords = (v: string) => /\s/.test(v.trim()) && !pathLike(v);
export const isSentence = (v: string) => hasWords(v) && v.trim().length >= SENTENCE_CHARS;

const sample = (values: readonly unknown[]) => values.filter((v): v is string => typeof v === "string" && v.trim() !== "").slice(0, 50);

/** A column whose values are mostly sentences of some length: the row's main text, which leads it when rows stack. */
export function proseColumn(values: readonly unknown[]): boolean {
  const text = sample(values);
  if (!text.length) return false;
  const prose = text.filter(hasWords);
  return prose.length / text.length >= 0.5 && text.reduce((n, v) => n + v.length, 0) / text.length >= 28;
}

/** Whether a left-aligned text column wraps, from a sample of its values. */
export function wrapsColumn(values: readonly unknown[]): boolean {
  // Mostly prose, or any one sentence: a short-answer column ("OK", "Right number") with one long
  // reason among them wraps too, instead of cutting that reason.
  return proseColumn(values) || sample(values).some((v) => isSentence(v));
}
