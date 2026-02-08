
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicDirs = [
    path.join(rootDir, 'public', 'assets'),
    path.join(rootDir, 'public', 'axis-antivacancia-v4', 'assets', 'img'),
];

async function optimizeImages() {
    console.log('🚀 Starting Image Optimization...');

    for (const dir of publicDirs) {
        if (!fs.existsSync(dir)) {
            console.warn(`⚠️ Directory not found: ${dir}`);
            continue;
        }

        const files = fs.readdirSync(dir, { recursive: true })
            .filter(file => file.match(/\.(png|jpg|jpeg)$/i));

        for (const file of files) {
            const absolutePath = path.join(dir, String(file));
            const relativePath = path.relative(rootDir, absolutePath);
            const ext = path.extname(absolutePath);
            const basename = path.basename(absolutePath, ext);
            const dirPath = path.dirname(absolutePath);
            const webpPath = path.join(dirPath, `${basename}.webp`);

            // Skip if WebP already exists and is newer
            if (fs.existsSync(webpPath)) {
                const srcStats = fs.statSync(absolutePath);
                const destStats = fs.statSync(webpPath);
                if (destStats.mtime > srcStats.mtime) {
                    console.log(`⏩ Skpping ${relativePath} (WebP up to date)`);
                    continue;
                }
            }

            try {
                await sharp(absolutePath)
                    .webp({ quality: 80, effort: 6 }) // High compression, slower build
                    .resize({ width: 1920, withoutEnlargement: true }) // Cap max width
                    .toFile(webpPath);

                const originalSize = (fs.statSync(absolutePath).size / 1024).toFixed(2);
                const newSize = (fs.statSync(webpPath).size / 1024).toFixed(2);
                const savings = (100 - (Number(newSize) / Number(originalSize) * 100)).toFixed(1);

                console.log(`✅ Optimized: ${relativePath}`);
                console.log(`   └─ ${originalSize}KB -> ${newSize}KB (${savings}% savings)`);

            } catch (err) {
                console.error(`❌ Failed to optimize ${relativePath}:`, err.message);
            }
        }
    }
    console.log('✨ Optimization Complete!');
}

optimizeImages();
