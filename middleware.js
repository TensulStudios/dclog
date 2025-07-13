import { NextResponse, userAgent } from 'next/server';

export async function middleware(req) {
  const url = new URL(req.url);
  const ua = userAgent(req)?.ua;

  if (!ua || ua.startsWith("vercel-")) {
    return NextResponse.rewrite(new URL("/vercel.html", req.url));
  }

  const emojiName = url.searchParams.get("emoji");
  if (emojiName) {
    const apiUrl = new URL('/api/emoji-image', req.url);
    apiUrl.searchParams.set('emoji', emojiName);
    return NextResponse.redirect(apiUrl);
  }

  return NextResponse.rewrite(new URL("/mini.png", req.url));
}
