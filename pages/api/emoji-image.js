import fetch from 'node-fetch';
import sharp from 'sharp';

export default async function handler(req, res) {
  const { emoji } = req.query;
  if (!emoji) {
    res.status(400).send('Missing emoji query param');
    return;
  }

  try {
    const response = await fetch('https://emoji.gg/api/');
    if (!response.ok) {
      res.status(500).send('Failed to fetch emoji list');
      return;
    }
    const emojis = await response.json();
    const foundEmoji = emojis.find(e => e.title === emoji);

    if (!foundEmoji || !foundEmoji.image) {
      res.status(404).send('Emoji not found');
      return;
    }

    const imageResponse = await fetch(foundEmoji.image);
    if (!imageResponse.ok) {
      res.status(500).send('Failed to fetch emoji image');
      return;
    }

    const imageBuffer = await imageResponse.buffer();

    const resizedImage = await sharp(imageBuffer)
      .resize(128, 128)
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(resizedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}
