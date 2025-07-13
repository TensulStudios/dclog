import { NextRequest, NextResponse, userAgent } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const ua = userAgent(req)?.ua;

  const emojiName = url.searchParams.get("emoji");
  if (emojiName) {
    try {
      const response = await fetch("https://emoji.gg/api/");
      if (!response.ok) {
        throw new Error("Failed to fetch emoji list");
      }
      const emojis = await response.json();

      const foundEmoji = emojis.find((e: { title: string }) => e.title === emojiName);

      if (foundEmoji && foundEmoji.image) {
        return NextResponse.redirect(foundEmoji.image);
      }
    } catch (error) {
      console.error("Emoji fetch error:", error);
    }
  }
  const source = ["Mozilla/5.0 (compatible; Discordbot/", "Twitterbot/"].find(u => ua?.startsWith(u));
  const page = url.pathname.split("/").slice(-1)[0];
  return NextResponse.rewrite(new URL("/mini.png", req.url));
}
