const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcImage = path.resolve(__dirname, '../public/images/pubg-helmet-logo.png');
const resDir = path.resolve(__dirname, '../android-scanner/app/src/main/res');

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generate() {
  for (const [folder, size] of Object.entries(sizes)) {
    const dir = path.join(resDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(srcImage)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    await sharp(srcImage)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    console.log(`Generated ${folder} (${size}x${size})`);
  }
}

generate().catch(console.error);
