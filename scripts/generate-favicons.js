const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../public/Namecheap-500x500.png');
const publicDir = path.join(__dirname, '../public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-64x64.png', size: 64 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('Generating favicons from:', sourceFile);
  
  if (!fs.existsSync(sourceFile)) {
    console.error('Source file not found:', sourceFile);
    process.exit(1);
  }

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);
    try {
      await sharp(sourceFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate favicon.ico (32x32 size - standard for browsers)
  try {
    await sharp(sourceFile)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico (32x32)');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
  }

  console.log('\n✨ All favicons generated successfully!');
}

generateFavicons().catch(console.error);
