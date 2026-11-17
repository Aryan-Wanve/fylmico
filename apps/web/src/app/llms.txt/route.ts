const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://lightcyan-lion-635016.hostingersite.com";

export function GET() {
  const body = `# Fylmico

> Fylmico is project and production management software for filmmakers, production houses, and content teams.

Fylmico helps creative teams coordinate production work in one web application. Its public product overview describes tools for projects, calendars, task tracking, crew management, file management, storyboarding, team communication, bookings, and analytics.

## Product overview

- Homepage: ${siteUrl}/
- Product information: ${siteUrl}/#features
- Getting started: ${siteUrl}/#how-it-works
- Learn about teams ("houses"): ${siteUrl}/houses/learn

## Intended audience

Filmmakers, production houses, content creators, and social media teams.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
