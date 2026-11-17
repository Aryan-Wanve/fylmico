import { NextRequest, NextResponse } from "next/server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://lightcyan-lion-635016.hostingersite.com";

export function proxy(request: NextRequest) {
  const wantsMarkdown =
    request.nextUrl.searchParams.get("format") === "markdown" ||
    request.headers.get("accept")?.includes("text/markdown");

  if (request.nextUrl.pathname === "/" && wantsMarkdown) {
    const body = `# Fylmico: Creative Production Management\n\nFylmico is project and production management software for filmmakers, production houses, and content teams. It helps teams plan productions, coordinate crews, and keep creative work organized.\n\n## What teams can manage\n\n- Projects from concept through completion\n- Shoot schedules, meetings, and deadlines\n- Tasks assigned across a crew\n- Production files and shared resources\n- Storyboards, frames, drawings, and shot plans\n- Team communication and updates\n- Equipment, location, and resource bookings\n- Project progress and analytics\n\n## Getting started\n\nCreate an account, set up a team workspace (called a house in Fylmico), organize projects, and invite collaborators.\n\n## Links\n\n- [Homepage](${siteUrl}/)\n- [Product features](${siteUrl}/#features)\n- [How it works](${siteUrl}/#how-it-works)\n- [House guide](${siteUrl}/houses/learn)\n`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        Vary: "Accept"
      }
    });
  }

  return NextResponse.next();
}

export const config = { matcher: ["/"] };
