import type { Route } from "next";

// Only these prefixes are honored as a post-auth redirect target, so a
// crafted `redirectTo` query param can't be used as an open redirect to an
// arbitrary path or origin - it's an allow-list, not a same-origin check.
const SAFE_REDIRECT_PREFIXES = ["/houses/invite/", "/houses/join/"];

export function getSafeRedirect(value: string | null | undefined): Route {
  if (!value) {
    return "/";
  }
  // Cast is safe: value is only ever used if it matches one of the known
  // dynamic invite/join route patterns, which are valid Routes even though
  // Next's typed-routes plugin can't verify a runtime string statically.
  return SAFE_REDIRECT_PREFIXES.some((prefix) => value.startsWith(prefix))
    ? (value as Route)
    : "/";
}
