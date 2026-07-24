// @ts-check

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const historyCache = new WeakMap();

/** @param {number} value */
export function localDateKey(value = Date.now()) {
  const date = new Date(Number.isFinite(value) ? value : Date.now());
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** @param {unknown} value */
function dateParts(value) {
  if (typeof value !== "string") return null;
  const match = DATE_KEY.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > monthDays[month - 1]) return null;
  return { year, month, day };
}

/** @param {string} key */
function calendarOrdinal(key) {
  const parts = dateParts(key);
  return parts ? Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000) : NaN;
}

/** @param {unknown} value */
export function normalizePracticeDays(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(item => dateParts(item)))].sort();
}

/** @param {unknown} value */
function practiceEntries(value) {
  if (!Array.isArray(value)) return { practiceDays: [], entries: [] };
  const cached = historyCache.get(value);
  if (cached) return cached;
  const practiceDays = normalizePracticeDays(value);
  const result = { practiceDays, entries: practiceDays.map(key => ({ key, ordinal: calendarOrdinal(key) })) };
  historyCache.set(value, result);
  return result;
}

/** @param {unknown} save @param {number} now */
export function selectDailyPractice(save, now = Date.now()) {
  const source = save && typeof save === "object" ? /** @type {any} */ (save) : {};
  const { practiceDays, entries } = practiceEntries(source.practiceDays);
  const todayKey = localDateKey(now);
  const todayOrdinal = calendarOrdinal(todayKey);
  let bestStreak = 0, run = 0, previous = NaN;
  for (const entry of entries) {
    run = entry.ordinal === previous + 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = entry.ordinal;
  }
  const pastOrToday = entries.filter(entry => entry.ordinal <= todayOrdinal);
  const latest = pastOrToday.at(-1);
  let currentStreak = 0;
  if (latest && todayOrdinal - latest.ordinal <= 1) {
    currentStreak = 1;
    for (let index = pastOrToday.length - 2; index >= 0; index -= 1) {
      if (pastOrToday[index].ordinal !== latest.ordinal - currentStreak) break;
      currentStreak += 1;
    }
  }
  return {
    practiceDays,
    todayKey,
    goalComplete: practiceDays.includes(todayKey),
    currentStreak,
    bestStreak,
    lifetimePracticeDays: practiceDays.length,
    returning: Boolean(latest && todayOrdinal - latest.ordinal > 1),
  };
}

/** @param {any} save @param {number} now */
export function recordPracticeDay(save, now = Date.now()) {
  const status = selectDailyPractice(save, now);
  if (status.goalComplete) return { save, recorded: false, status };
  const practiceDays = [...status.practiceDays, status.todayKey].sort();
  const nextSave = { ...save, practiceDays };
  const currentStreak = status.returning || status.currentStreak === 0 ? 1 : status.currentStreak + 1;
  return {
    save: nextSave,
    recorded: true,
    status: {
      ...status,
      practiceDays,
      goalComplete: true,
      currentStreak,
      bestStreak: Math.max(status.bestStreak, currentStreak),
      lifetimePracticeDays: status.lifetimePracticeDays + 1,
      returning: false,
    },
  };
}
