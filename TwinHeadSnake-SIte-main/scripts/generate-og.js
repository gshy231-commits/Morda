const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const snakePath = "M0.2,3.9C0.8,3.8,1.1,4,1.4,4.3c0.2,0.2,0.2,0.2,0.1,0.4C1.4,4.8,1.3,5,1.2,5.1c-0.1,0-0.7,0.1-1,0 M2.4,2.9l0.2,0.2H2.5C2.3,3.1,2,3.2,1.8,3.3C1.7,3.4,1.5,3.4,1.3,3.6C1.1,3.8,1.1,3.8,0.8,3.7C0.5,3.6,0.3,3.5,0.2,3.3c0-0.1,0-0.4,0-0.7s0-0.4,0.1-0.4c0,0,0.1,0,0.3,0c0.1,0,0.3,0,0.3,0s0.1,0,0.2,0c0.4,0.1,0.8,0.2,1,0.4C2.2,2.7,2.3,2.8,2.4,2.9z";

async function generateOG() {
  const width = 1200;
  const height = 630;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#030306');
  bgGrad.addColorStop(1, '#0a0a14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);
  
  // Glow effect
  const glowGrad = ctx.createRadialGradient(600, 315, 0, 600, 315, 300);
  glowGrad.addColorStop(0, 'rgba(0, 255, 170, 0.15)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);
  
  // Logo box
  const logoSize = 120;
  const logoX = (width - logoSize) / 2;
  const logoY = 120;
  
  const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
  logoGrad.addColorStop(0, '#00ffaa');
  logoGrad.addColorStop(1, '#00cc88');
  
  ctx.beginPath();
  ctx.roundRect(logoX, logoY, logoSize, logoSize, 24);
  ctx.fillStyle = logoGrad;
  ctx.fill();
  
  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TwinHeadSnake', width / 2, 320);
  
  // Subtitle
  ctx.fillStyle = '#6a6a7f';
  ctx.font = '32px sans-serif';
  ctx.fillText('Algorithmic Crypto Trading Signals', width / 2, 370);
  
  // Stats
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#00ffaa';
  ctx.fillText('+417%', 300, 480);
  
  ctx.fillStyle = '#4488ff';
  ctx.fillText('5.5x', 600, 480);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillText('275', 900, 480);
  
  // Stats labels
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#6a6a7f';
  ctx.fillText('Avg Growth', 300, 510);
  ctx.fillText('Profit Factor', 600, 510);
  ctx.fillText('Trades', 900, 510);
  
  // Bottom URL
  ctx.fillStyle = '#00ffaa';
  ctx.font = '24px sans-serif';
  ctx.fillText('twinheadsnake.com', width / 2, 590);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public/og-image.png'), buffer);
  console.log('Generated og-image.png');
}

generateOG().catch(console.error);
