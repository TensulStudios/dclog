import { NextRequest, NextResponse, userAgent } from 'next/server';

const webhook = process.env.WEBHOOK_URL

export async function middleware(req){
  const ua = userAgent(req)?.ua;
  if(!ua || ua.startsWith("vercel-")){
    return NextResponse.rewrite(new URL("/vercel.html",req.url));
  }
  const source = ["Mozilla/5.0 (compatible; Discordbot/","Twitterbot/"].find(u=>ua?.startsWith(u))
  const page = req.url.split("/").slice(-1)[0]
  return NextResponse.rewrite(new URL("/mini.png",req.url))
}
