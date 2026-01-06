const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

async function optimizeLogos() {
  try {
    console.log('🎨 Optimizing logos with transparency and proper sizing...\n');

    // Shield logo - for icons, favicon, footer
    const shieldPath = path.join(publicDir, 'namecheaplogo.png');
    
    if (fs.existsSync(shieldPath)) {
      // High quality shield logo for footer (256x256)
      await sharp(shieldPath)
        .resize(256, 256, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(path.join(publicDir, 'logo-shield-hd.png'));
      console.log('✅ Created logo-shield-hd.png (256x256)');

      // Medium shield for general use (128x128)
      await sharp(shieldPath)
        .resize(128, 128, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(path.join(publicDir, 'logo-shield.png'));
      console.log('✅ Created logo-shield.png (128x128)');

      // Favicon sizes
      await sharp(shieldPath)
        .resize(64, 64, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 95 })
        .toFile(path.join(publicDir, 'favicon-64x64.png'));
      console.log('✅ Created favicon-64x64.png');

      await sharp(shieldPath)
        .resize(32, 32, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 95 })
        .toFile(path.join(publicDir, 'favicon-32x32.png'));
      console.log('✅ Created favicon-32x32.png');

      await sharp(shieldPath)
        .resize(16, 16, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 95 })
        .toFile(path.join(publicDir, 'favicon-16x16.png'));
      console.log('✅ Created favicon-16x16.png');

      // Apple touch icon
      await sharp(shieldPath)
        .resize(180, 180, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 100 })
        .toFile(path.join(publicDir, 'apple-touch-icon.png'));
      console.log('✅ Created apple-touch-icon.png (180x180)');
    }

    // Poster/Banner logo - for header
    const posterPath = path.join(publicDir, 'namecheaplogo_poster.png');
    
    if (fs.existsSync(posterPath)) {
      // HD banner for header (600px width, auto height)
      await sharp(posterPath)
        .resize(600, null, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(path.join(publicDir, 'logo-banner-hd.png'));
      console.log('✅ Created logo-banner-hd.png (600px width)');

      // Medium banner for smaller screens (400px width)
      await sharp(posterPath)
        .resize(400, null, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(path.join(publicDir, 'logo-banner.png'));
      console.log('✅ Created logo-banner.png (400px width)');
    }

    console.log('\n✨ Logo optimization complete!');
    console.log('📦 All logos are now transparent PNG with optimized sizes');

  } catch (error) {
    console.error('❌ Error optimizing logos:', error);
    process.exit(1);
  }
}

optimizeLogos();
