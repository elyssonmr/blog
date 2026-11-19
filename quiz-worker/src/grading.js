/**
 * Pure helpers (no Cloudflare bindings) so they can be unit tested with `node --test`.
 */

export const NAME_MIN = 3;
export const NAME_MAX = 80;

/**
 * Grades the submitted answers against the answer key.
 *
 * The total always comes from the answer key, never from the submission:
 * sending only the questions you know does not raise the score.
 *
 * @param {{id: string, answer: number}[]} questions answer key
 * @param {Record<string, unknown>} answers question id -> chosen option (1-based)
 */
export function gradeAnswers(questions, answers) {
  const total = questions.length;
  const correct = questions.filter((q) => Number(answers[q.id]) === q.answer).length;
  return { total, correct, score: total === 0 ? 0 : correct / total };
}

export function isPassing(score, minScore) {
  return score >= minScore;
}

/**
 * Normalises the name printed on the certificate.
 * Returns null when the name is not acceptable.
 */
export function normalizeName(raw) {
  if (typeof raw !== "string") return null;
  // Drop control characters and collapse whitespace.
  const name = raw.replace(/[\p{Cc}\p{Cf}]/gu, "").replace(/\s+/g, " ").trim();
  if (name.length < NAME_MIN || name.length > NAME_MAX) return null;
  return name;
}

/**
 * Validates the shape of the answers payload: a plain object of id -> integer.
 */
export function isValidAnswers(answers) {
  if (answers === null || typeof answers !== "object" || Array.isArray(answers)) return false;
  const entries = Object.entries(answers);
  if (entries.length > 200) return false;
  return entries.every(([k, v]) => /^[\w-]{1,32}$/.test(k) && Number.isInteger(v) && v > 0 && v < 100);
}
