/**
 * Result of building a deduplication set from a list of items.
 */
export interface DedupResult<T> {
  /**
   * Map of dedup key to array of items that share that key.
   * Only keys with more than one item are included.
   */
  duplicates: Map<string, T[]>;
  /** Set of all dedup keys encountered */
  seen: Set<string>;
}

/**
 * Builds a deduplication set from a list of items using a key function.
 *
 * Useful for detecting intra-Excel duplicates: rows within the same file
 * that produce the same dedup key. The `duplicates` map contains only
 * keys that appear more than once, with all items sharing that key.
 *
 * @example
 * const rows = [
 *   { id: "a", hash: "h1" },
 *   { id: "b", hash: "h2" },
 *   { id: "c", hash: "h1" }, // duplicate of "a"
 * ];
 * const result = buildDedupSet(rows, (r) => r.hash);
 * // result.seen = Set { "h1", "h2" }
 * // result.duplicates = Map { "h1" => [{ id: "a", ... }, { id: "c", ... }] }
 *
 * @template T - The item type
 * @param items - The list of items to check for duplicates
 * @param keyFn - Function that extracts the dedup key from an item
 * @returns An object with a `seen` set of all keys and a `duplicates` map of duplicate groups
 */
export function buildDedupSet<T>(
  items: T[],
  keyFn: (item: T) => string
): DedupResult<T> {
  const seen = new Set<string>();
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = keyFn(item);
    seen.add(key);

    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  // Filter to only keys with more than one item
  const duplicates = new Map<string, T[]>();
  for (const [key, group] of groups) {
    if (group.length > 1) {
      duplicates.set(key, group);
    }
  }

  return { duplicates, seen };
}
