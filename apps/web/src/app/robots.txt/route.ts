const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://lightcyan-lion-635016.hostingersite.com";

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /auth/
Disallow: /client-review/
Content-Signal: ai-train=no, search=yes, ai-input=yes

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
