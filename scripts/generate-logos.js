const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// SVG content for logo
const logoSvg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="180" height="180" rx="20" ry="20" fill="url(#logoGradient)"/>
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#1a1a1a" text-anchor="middle">NC</text>
  <rect x="10" y="10" width="180" height="180" rx="20" ry="20" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
</svg>
`;

// SVG content for favicon
const faviconSvg = `
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="120" height="120" rx="15" ry="15" fill="url(#faviconGradient)"/>
  <text x="64" y="78" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#1a1a1a" text-anchor="middle">NC</text>
  <rect x="4" y="4" width="120" height="120" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
</svg>
`;

async function generateImages() {
  try {
    // Generate logo PNG (200x200 and 40x40 for header)
    await sharp(Buffer.from(logoSvg))
      .resize(200, 200)
      .png()
      .toFile(path.join(publicDir, 'namecheap-logo.png'));
    
    await sharp(Buffer.from(logoSvg))
      .resize(40, 40)
      .png()
      .toFile(path.join(publicDir, 'namecheap-logo-small.png'));
    
    // Generate favicons in various sizes
    const sizes = [16, 32, 48, 64, 128, 180];
    for (const size of sizes) {
      await sharp(Buffer.from(faviconSvg))
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, `namecheap-favicon-${size}x${size}.png`));
    }
    
    // Generate ICO format (32x32)
    await sharp(Buffer.from(faviconSvg))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'namecheap-favicon.png'));
    
    console.log('✓ All images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateImages();
