#!/usr/bin/env node
/**
 * Image Compression Script - Phase 2 Optimization
 * 
 * Compresses all WebP images in /public/v5-3/images/imagens v5-3-4/
 * using Sharp with optimal settings for web performance.
 * 
 * Settings:
 * - Quality: 78 (balance between size and visual quality)
 * - Effort: 6 (maximum compression without perceptible loss)
 * - Metadata: stripped (reduces file size)
 * 
 * Creates automatic backup before compression.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../public/v5-3/images/imagens v5-3-4');
const BACKUP_DIR = path.join(__dirname, '../public/v5-3/images/imagens v5-3-4-backup-phase2');

// Compression settings
const COMPRESSION_SETTINGS = {
    quality: 78,
    effort: 6,
    metadata: 'none'
};

/**
 * Create backup directory and copy all images
 */
async function createBackup() {
    console.log('📦 Creating backup...');

    if (fs.existsSync(BACKUP_DIR)) {
        console.log('⚠️  Backup directory already exists. Skipping backup creation.');
        return;
    }

    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const files = fs.readdirSync(SOURCE_DIR);
    for (const file of files) {
        if (file.endsWith('.webp')) {
            fs.copyFileSync(
                path.join(SOURCE_DIR, file),
                path.join(BACKUP_DIR, file)
            );
        }
    }

    console.log(`✅ Backup created: ${BACKUP_DIR}`);
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filepath) {
    const stats = fs.statSync(filepath);
    return (stats.size / 1024).toFixed(2);
}

/**
 * Compress a single WebP image
 */
async function compressImage(filename) {
    const inputPath = path.join(SOURCE_DIR, filename);
    const outputPath = path.join(SOURCE_DIR, filename);

    const sizeBefore = getFileSizeKB(inputPath);

    try {
        await sharp(inputPath)
            .webp({
                quality: COMPRESSION_SETTINGS.quality,
                effort: COMPRESSION_SETTINGS.effort
            })
            .withMetadata(false) // Strip metadata
            .toFile(outputPath + '.tmp');

        // Replace original with compressed version
        fs.renameSync(outputPath + '.tmp', outputPath);

        const sizeAfter = getFileSizeKB(outputPath);
        const savings = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1);

        return {
            filename,
            sizeBefore: parseFloat(sizeBefore),
            sizeAfter: parseFloat(sizeAfter),
            savings: parseFloat(savings)
        };
    } catch (error) {
        console.error(`❌ Error compressing ${filename}:`, error.message);
        return null;
    }
}

/**
 * Main compression function
 */
async function compressAllImages() {
    console.log('🖼️  Starting image compression...\n');

    await createBackup();

    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.webp'));
    const results = [];

    for (const file of files) {
        process.stdout.write(`Compressing ${file}...`);
        const result = await compressImage(file);
        if (result) {
            results.push(result);
            console.log(` ✅ ${result.sizeBefore}KB → ${result.sizeAfter}KB (-${result.savings}%)`);
        } else {
            console.log(' ❌ Failed');
        }
    }

    // Generate summary report
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPRESSION REPORT');
    console.log('='.repeat(70));

    const totalBefore = results.reduce((sum, r) => sum + r.sizeBefore, 0);
    const totalAfter = results.reduce((sum, r) => sum + r.sizeAfter, 0);
    const totalSavings = totalBefore - totalAfter;
    const totalSavingsPercent = ((totalSavings / totalBefore) * 100).toFixed(1);

    console.log(`\nTotal images compressed: ${results.length}`);
    console.log(`Total size before: ${totalBefore.toFixed(2)} KB`);
    console.log(`Total size after: ${totalAfter.toFixed(2)} KB`);
    console.log(`Total savings: ${totalSavings.toFixed(2)} KB (${totalSavingsPercent}%)`);

    // Highlight top 5 savings
    console.log('\n📈 Top 5 compressions:');
    const topSavings = results
        .sort((a, b) => (b.sizeBefore - b.sizeAfter) - (a.sizeBefore - a.sizeAfter))
        .slice(0, 5);

    topSavings.forEach((result, index) => {
        const saved = result.sizeBefore - result.sizeAfter;
        console.log(`   ${index + 1}. ${result.filename}: -${saved.toFixed(2)} KB (-${result.savings}%)`);
    });

    console.log('\n✅ Compression complete!');
    console.log(`📁 Backup location: ${BACKUP_DIR}\n`);
}

// Run compression
compressAllImages().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
