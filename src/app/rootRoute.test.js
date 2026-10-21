import { expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { sep } from "node:path";

// Route groups do not add URL segments: each of these pages would own '/'.
test("the permission-aware root is the only page registered at /", () => {
  const rootPages = readdirSync(new URL(".", import.meta.url), {
    recursive: true,
  }).filter((path) => {
    const segments = path.split(sep);
    if (segments.pop() !== "page.tsx") return false;
    return segments.every((segment) => /^\(.+\)$/.test(segment));
  });

  expect(rootPages).toEqual(["page.tsx"]);
});
