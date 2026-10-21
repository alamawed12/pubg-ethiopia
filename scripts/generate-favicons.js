const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/FLUXi/.gemini/antigravity/brain/d63ee079-87f1-47ef-ad04-314a0132e9fc/.user_uploaded/media_1792592327133_c4ff122a.png';
const baseDir = path.resolve(__dirname, '..');

async function createIco(pngBuffers) {
  // Create multi-res ICO container
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * numImages;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(numImages, 4);

  const entries = [];
  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([
    header,
    ...entries,
    ...pngBuffers.map((p) => p.buffer),
  ]);
}

async function run() {
  console.log('Generating helmet logo and favicons...');
  const baseImg = sharp(inputPath);

  // 1. Copy original 1000x1000 to public/images/pubg-helmet-logo.png
  await baseImg.clone().png().toFile(path.join(baseDir, 'public/images/pubg-helmet-logo.png'));
  console.log('Saved public/images/pubg-helmet-logo.png');

  // 2. High-res 512x512 app icon
  const icon512 = await baseImg.clone().resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(baseDir, 'public/favicon.png'), icon512);
  fs.writeFileSync(path.join(baseDir, 'src/app/icon.png'), icon512);
  console.log('Saved icon.png (512x512)');

  // 3. Apple touch icon 180x180
  const apple180 = await baseImg.clone().resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(baseDir, 'src/app/apple-icon.png'), apple180);
  fs.writeFileSync(path.join(baseDir, 'public/apple-touch-icon.png'), apple180);
  console.log('Saved apple-icon.png (180x180)');

  // 4. Standard sizes for ICO
  const s16 = await baseImg.clone().resize(16, 16).png().toBuffer();
  const s32 = await baseImg.clone().resize(32, 32).png().toBuffer();
  const s48 = await baseImg.clone().resize(48, 48).png().toBuffer();
  const s64 = await baseImg.clone().resize(64, 64).png().toBuffer();

  fs.writeFileSync(path.join(baseDir, 'public/favicon-16x16.png'), s16);
  fs.writeFileSync(path.join(baseDir, 'public/favicon-32x32.png'), s32);

  const icoBuffer = await createIco([
    { buffer: s16, size: 16 },
    { buffer: s32, size: 32 },
    { buffer: s48, size: 48 },
    { buffer: s64, size: 64 },
  ]);

  fs.writeFileSync(path.join(baseDir, 'public/favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(baseDir, 'src/app/favicon.ico'), icoBuffer);
  console.log('Saved favicon.ico with 16, 32, 48, 64px resolutions');

  console.log('All favicons successfully generated!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
