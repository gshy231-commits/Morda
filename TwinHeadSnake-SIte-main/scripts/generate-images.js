const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

async function generateImages() {
  // Generate OG image PNG from SVG
  const ogSvg = fs.readFileSync(path.join(publicDir, 'og-image.svg'));
  await sharp(ogSvg)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Generated og-image.png');

  // Generate favicon.ico from icon.svg (multiple sizes)
  const iconSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));
  
  // Generate 32x32 favicon
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));
  console.log('✓ Generated favicon-32.png');

  // Generate 16x16 favicon
  await sharp(iconSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16.png'));
  console.log('✓ Generated favicon-16.png');

  // Generate apple-touch-icon (180x180)
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  // Generate favicon.ico (we'll use the 32x32 PNG as ico)
  // For proper .ico, we'd need a different library, but browsers accept PNG
  await sharp(iconSvg)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Generated favicon.png');

  // Generate 192x192 and 512x512 for PWA
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Generated icon-192.png');

  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Generated icon-512.png');

  console.log('\n✅ All images generated successfully!');
}

generateImages().catch(console.error);
