// @ts-check

export const ACTIVITY_MODES = Object.freeze([
  "read",
  "choice",
  "spell",
  "missing-letter",
  "word-hunt",
]);

const NEW_MODES = new Set(["missing-letter", "word-hunt"]);
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

/** @param {unknown} value */
export function normalizeModes(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter(mode => ACTIVITY_MODES.includes(mode))));
}

/** @param {string} value */
export function normalizeWord(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

/** @param {string} left @param {string} right */
export function damerauLevenshtein(left, right) {
  const a = normalizeWord(left);
  const b = normalizeWord(right);
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }
  return matrix[a.length][b.length];
}

/** @template T @param {T[]} values @param {() => number} random */
function shuffled(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const raw = Number(random());
    const bounded = Number.isFinite(raw) ? Math.max(0, Math.min(0.999999, raw)) : 0;
    const j = Math.floor(bounded * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** @param {string} word @param {() => number} [random] */
export function createMissingLetterPrompt(word, random = Math.random) {
  const target = String(word ?? "").toLowerCase();
  const positions = Array.from(target, (character, index) => /[a-z]/.test(character) ? index : -1)
    .filter(index => index >= 0);
  if (positions.length < 2) return null;
  const position = positions[Math.floor(Math.max(0, Math.min(0.999999, Number(random()) || 0)) * positions.length)];
  const answer = target[position];
  const distractors = shuffled(ALPHABET.filter(letter => letter !== answer), random).slice(0, 3);
  return {
    kind: "missing-letter",
    displayParts: [target.slice(0, position), target.slice(position + 1)],
    missingIndex: position,
    choices: shuffled([answer, ...distractors], random),
    answer,
  };
}

/**
 * @param {{word:string,grade?:string}} target
 * @param {Record<string, unknown>} progress
 * @param {{word:string,grade?:string}[]} catalog
 * @param {() => number} [random]
 */
export function createWordHuntPrompt(target, progress, catalog, random = Math.random) {
  if (!target?.word || !progress || !Array.isArray(catalog)) return null;
  const introduced = catalog.filter(candidate =>
    candidate?.word &&
    candidate.word !== target.word &&
    Object.prototype.hasOwnProperty.call(progress, candidate.word) &&
    damerauLevenshtein(candidate.word, target.word) >= 2,
  );
  const ordered = [
    ...shuffled(introduced.filter(word => word.grade === target.grade), random),
    ...shuffled(introduced.filter(word => word.grade !== target.grade), random),
  ];
  const selected = [];
  for (const candidate of ordered) {
    if ([target, ...selected].every(word => damerauLevenshtein(word.word, candidate.word) >= 2)) {
      selected.push(candidate);
      if (selected.length === 3) break;
    }
  }
  if (!selected.length) return null;
  return {
    kind: "word-hunt",
    target: target.word,
    choices: shuffled([target.word, ...selected.map(word => word.word)], random),
  };
}

/** @param {{word:string,grade?:string}} word @param {{progress:Record<string,unknown>,allWords:{word:string,grade?:string}[],random?:()=>number}} context */
function candidatesFor(word, context) {
  const random = context.random ?? Math.random;
  const missing = createMissingLetterPrompt(word.word, random);
  const hunt = createWordHuntPrompt(word, context.progress, context.allWords, random);
  return [
    { mode: "read" },
    { mode: "choice" },
    { mode: "spell" },
    ...(missing ? [{ mode: "missing-letter", prompt: missing }] : []),
    ...(hunt ? [{ mode: "word-hunt", prompt: hunt }] : []),
  ];
}

/** @param {{word:string,grade?:string}} word @param {{progress:Record<string,unknown>,allWords:{word:string,grade?:string}[],random?:()=>number}} context */
export function eligibleActivities(word, context) {
  return candidatesFor(word, context).map(candidate => candidate.mode);
}

/**
 * @param {{word:{word:string,grade?:string},retry?:boolean}[]} selectedCards
 * @param {{progress:Record<string,unknown>,allWords:{word:string,grade?:string}[],random?:()=>number}} context
 */
export function composeMissionActivities(selectedCards, context) {
  const counts = Object.fromEntries(ACTIVITY_MODES.map(mode => [mode, 0]));
  const cards = [];
  for (const selected of selectedCards) {
    let candidates = candidatesFor(selected.word, context);
    const lastTwo = cards.slice(-2).map(card => card.mode);
    if (lastTwo.length === 2 && lastTwo[0] === lastTwo[1]) {
      const alternatives = candidates.filter(candidate => candidate.mode !== lastTwo[0]);
      if (alternatives.length) candidates = alternatives;
    }
    const minimum = Math.min(...candidates.map(candidate => counts[candidate.mode] ?? 0));
    const leastUsed = candidates.filter(candidate => (counts[candidate.mode] ?? 0) === minimum);
    const raw = Number((context.random ?? Math.random)());
    const choice = leastUsed[Math.floor(Math.max(0, Math.min(0.999999, raw || 0)) * leastUsed.length)];
    counts[choice.mode] = (counts[choice.mode] ?? 0) + 1;
    cards.push({ ...selected, mode: choice.mode, ...(choice.prompt ? { prompt: choice.prompt } : {}) });
  }

  if (cards.length >= 4 && !cards.some(card => NEW_MODES.has(card.mode))) {
    const replacementIndex = selectedCards.findIndex(card =>
      candidatesFor(card.word, { ...context, random: () => 0 }).some(candidate => NEW_MODES.has(candidate.mode)),
    );
    if (replacementIndex >= 0) {
      const candidate = candidatesFor(selectedCards[replacementIndex].word, context)
        .find(option => NEW_MODES.has(option.mode));
      if (candidate) cards[replacementIndex] = {
        ...selectedCards[replacementIndex],
        mode: candidate.mode,
        ...(candidate.prompt ? { prompt: candidate.prompt } : {}),
      };
    }
  }
  return cards;
}

/**
 * @param {{word:{word:string,grade?:string},mode:string,retry?:boolean}} card
 * @param {{mode:string}[]} cards
 * @param {{progress:Record<string,unknown>,allWords:{word:string,grade?:string}[],random?:()=>number}} context
 */
export function createRetryCard(card, cards, context) {
  if (!card || card.retry || cards.length >= 12) return null;
  if (!NEW_MODES.has(card.mode)) return { word: card.word, mode: "read", retry: true };
  const candidates = candidatesFor(card.word, context).filter(candidate => candidate.mode !== card.mode);
  if (!candidates.length) return { word: card.word, mode: "read", retry: true };
  const counts = Object.fromEntries(ACTIVITY_MODES.map(mode => [
    mode,
    cards.filter(existing => existing.mode === mode).length,
  ]));
  const minimum = Math.min(...candidates.map(candidate => counts[candidate.mode] ?? 0));
  const choice = candidates.find(candidate => (counts[candidate.mode] ?? 0) === minimum) ?? candidates[0];
  return { word: card.word, mode: choice.mode, retry: true, ...(choice.prompt ? { prompt: choice.prompt } : {}) };
}
