/**
 * Script de Otimização de Imagens - Fase 2
 * 
 * Objetivo: Recomprimir as 18 imagens responsivas (small/medium/large) 
 * para reduzir tamanho sem perda visível de qualidade.
 * 
 * Economia esperada: ~1.1 MB total (conforme PageSpeed Insights)
 * 
 * Configurações otimizadas:
 * - WebP quality: 78 (balance entre tamanho e qualidade)
 * - Effort: 6 (compressão mais agressiva)
 * - Preserve metadata: Não (remove EXIF desnecessário)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuração
const IMAGE_DIR = path.join(__dirname, '../public/v5-3/images/imagens v5-3-4');
const BACKUP_DIR = path.join(__dirname, '../public/v5-3/images/imagens v5-3-4-backup-phase2');
const QUALITY = 78;
const EFFORT = 6;

// Lista de todas as imagens a processar
const IMAGES_TO_OPTIMIZE = [
    // Hero
    'hero-small.webp',
    'hero-medium.webp',
    'hero.webp',

    // The Fall
    'the_fall-small.webp',
    'the_fall-medium.webp',
    'the_fall.webp',

    // Radar
    'radar-small.webp',
    'radar-medium.webp',
    'radar.webp',

    // Target
    'target-small.webp',
    'target-medium.webp',
    'target.webp',

    // Shot
    'shot-small.webp',
    'shot-medium.webp',
    'shot.webp',

    // CTA
    'cta-small.webp',
    'cta-medium.webp',
    'cta.webp',

    // Avatars (não têm versões responsivas, apenas originais)
    'avatar-dr-roberto.webp',
    'avatar-dra-juliana.webp',
];

// Utilitários
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function optimizeImage(filename) {
    const inputPath = path.join(IMAGE_DIR, filename);
    const outputPath = inputPath; // Sobrescrever original
    const backupPath = path.join(BACKUP_DIR, filename);

    try {
        // Verificar se arquivo existe
        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  ${filename} não encontrado, pulando...`);
            return null;
        }

        // Tamanho original
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;

        // Fazer backup
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        fs.copyFileSync(inputPath, backupPath);

        // Otimizar
        const tempPath = inputPath + '.tmp.webp';
        await sharp(inputPath)
            .webp({
                quality: QUALITY,
                effort: EFFORT,
                // Remove metadata para reduzir tamanho
            })
            .toFile(tempPath);

        // Verificar tamanho otimizado
        const optimizedStats = fs.statSync(tempPath);
        const optimizedSize = optimizedStats.size;
        const savings = originalSize - optimizedSize;
        const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

        // Apenas substituir se houver economia
        if (savings > 0) {
            fs.renameSync(tempPath, outputPath);
            console.log(`✅ ${filename}:`);
            console.log(`   ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}`);
            console.log(`   Economia: ${formatBytes(savings)} (${savingsPercent}%)`);
            return { filename, originalSize, optimizedSize, savings, savingsPercent };
        } else {
            // Sem economia, manter original
            fs.unlinkSync(tempPath);
            console.log(`⏭️  ${filename}: Sem economia, mantendo original`);
            return null;
        }

    } catch (error) {
        console.error(`❌ Erro ao processar ${filename}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Iniciando otimização de imagens - Fase 2\n');
    console.log(`📁 Diretório: ${IMAGE_DIR}`);
    console.log(`💾 Backup em: ${BACKUP_DIR}`);
    console.log(`⚙️  Configuração: WebP Quality ${QUALITY}, Effort ${EFFORT}\n`);
    console.log('═'.repeat(60));

    const results = [];

    for (const filename of IMAGES_TO_OPTIMIZE) {
        const result = await optimizeImage(filename);
        if (result) {
            results.push(result);
        }
        console.log(''); // Linha em branco entre imagens
    }

    // Relatório final
    console.log('═'.repeat(60));
    console.log('\n📊 RELATÓRIO FINAL\n');

    if (results.length === 0) {
        console.log('⚠️  Nenhuma imagem foi otimizada.');
        return;
    }

    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalSavings = totalOriginal - totalOptimized;
    const avgSavingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);

    console.log(`✅ Imagens otimizadas: ${results.length}/${IMAGES_TO_OPTIMIZE.length}`);
    console.log(`📦 Tamanho original total: ${formatBytes(totalOriginal)}`);
    console.log(`📦 Tamanho otimizado total: ${formatBytes(totalOptimized)}`);
    console.log(`💰 Economia total: ${formatBytes(totalSavings)} (${avgSavingsPercent}%)`);
    console.log(`\n🎯 Meta PageSpeed: ${formatBytes(totalSavings)} de ${formatBytes(1119 * 1024)} (esperado 1.119 MB)`);

    // Top 5 maiores economias
    console.log('\n🏆 Top 5 Maiores Economias:\n');
    results
        .sort((a, b) => b.savings - a.savings)
        .slice(0, 5)
        .forEach((r, i) => {
            console.log(`${i + 1}. ${r.filename}: ${formatBytes(r.savings)} (${r.savingsPercent}%)`);
        });

    console.log('\n✅ Otimização concluída!');
    console.log(`💾 Backup dos originais: ${BACKUP_DIR}`);
}

// Executar
main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
