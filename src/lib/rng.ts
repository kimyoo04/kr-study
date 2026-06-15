// Shared randomness. Injecting the rng keeps callers deterministic in tests.

export type Rng = () => number

/** Fisher-Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Deterministic LCG rng seeded by `seed` — for stable shuffles in tests/exams. */
export function seeded(seed: number): Rng {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}
