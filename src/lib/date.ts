// Date helpers. Stamps are kept as YYYY-MM-DD strings so progress/exam records
// compare and persist as plain calendar days (matching how lastPlayed/takenAt
// are stored).

/** Today as a YYYY-MM-DD string. */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
