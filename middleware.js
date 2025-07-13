import { NextResponse, userAgent } from 'next/server';

function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function decrypt(encryptedText, key) {
  const [ivHex, encryptedHex] = encryptedText.split(':');
  const iv = hexToUint8Array(ivHex);
  const encryptedData = hexToUint8Array(encryptedHex);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    encryptedData
  );

  return new TextDecoder().decode(decryptedBuffer);
}

export async function middleware(req) {
  const url = new URL(req.url);
  const ua = userAgent(req)?.ua;
  const encryptedWebhook = url.searchParams.get('webhook');
  const name = url.searchParams.get('name');

  if (!encryptedWebhook) {
    return NextResponse.next();
  }

  const secretKeyHex = process.env.ENCRYPTION_KEY;
  if (!secretKeyHex || secretKeyHex.length !== 64) {
    console.error('Invalid ENCRYPTION_KEY, must be 32 bytes hex string');
    return NextResponse.next();
  }
  const key = new Uint8Array(secretKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  let webhookUrl;
  try {
    webhookUrl = await decrypt(encryptedWebhook, key);
  } catch (e) {
    console.error('Failed to decrypt webhook URL:', e);
    return NextResponse.next();
  }

  async function sendDiscordWebhook(message) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
  }

  if (name) {
    await sendDiscordWebhook(`API triggered: ${name}`);
  }

  if (!ua || ua.startsWith('vercel-')) {
    return NextResponse.rewrite(new URL('/vercel.html', req.url));
  }

  return NextResponse.rewrite('https://media.tenor.com/ORLWQWjdWhQAAAAi/discordskull081719-discord.gif');
}
