// Script para comprimir videos con FFmpeg antes de subirlos
// Ejecutar con: npm run compress-videos
// Requiere tener FFmpeg instalado: https://ffmpeg.org/download.html

import * as fs from 'fs';
import * as path from 'path';
import { execSync, exec } from 'child_process';

const VIDEOS_DIR = './src/assets/videos';
const OUTPUT_DIR = './src/assets/videos-compressed';

// Configuración de compresión
const CONFIG = {
  // Resolución máxima (altura). -1 mantiene aspect ratio
  // 720 = HD, 480 = SD (más pequeño)
  maxHeight: 720,
  
  // CRF: Constant Rate Factor (18-28, menor = mejor calidad, mayor tamaño)
  // 23 = default, 28 = buena compresión con calidad aceptable
  crf: 28,
  
  // Preset de velocidad: ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
  // Más lento = mejor compresión
  preset: 'medium',
  
  // Bitrate de audio (kbps). 128 es bueno, 96 para más compresión
  audioBitrate: 128,
};

interface VideoStats {
  original: number;
  compressed: number;
  savings: number;
  savingsPercent: number;
}

function checkFFmpeg(): boolean {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getAllVideoFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllVideoFiles(fullPath));
    } else if (item.name.toLowerCase().endsWith('.mp4')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function compressVideo(inputPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Crear directorio de salida si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Comando FFmpeg para comprimir
    // -y: sobrescribir sin preguntar
    // -i: input
    // -vf scale: redimensionar manteniendo aspect ratio
    // -c:v libx264: codec de video H.264
    // -crf: factor de calidad
    // -preset: velocidad vs compresión
    // -c:a aac: codec de audio
    // -b:a: bitrate de audio
    // -movflags +faststart: optimizado para web streaming
    const command = `ffmpeg -y -i "${inputPath}" -vf "scale=-2:${CONFIG.maxHeight}" -c:v libx264 -crf ${CONFIG.crf} -preset ${CONFIG.preset} -c:a aac -b:a ${CONFIG.audioBitrate}k -movflags +faststart "${outputPath}"`;
    
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error) => {
      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function main() {
  console.log('🎬 Compresor de Videos con FFmpeg\n');
  console.log('='.repeat(50));
  
  // Verificar FFmpeg
  if (!checkFFmpeg()) {
    console.error('❌ FFmpeg no está instalado o no está en el PATH');
    console.error('\n📥 Instalar FFmpeg:');
    console.error('   Windows: winget install FFmpeg');
    console.error('   macOS: brew install ffmpeg');
    console.error('   Linux: sudo apt install ffmpeg');
    process.exit(1);
  }
  console.log('✅ FFmpeg detectado\n');
  
  // Mostrar configuración
  console.log('⚙️  Configuración:');
  console.log(`   Resolución máxima: ${CONFIG.maxHeight}p`);
  console.log(`   CRF (calidad): ${CONFIG.crf}`);
  console.log(`   Preset: ${CONFIG.preset}`);
  console.log(`   Audio: ${CONFIG.audioBitrate}kbps\n`);
  
  // Obtener videos
  const videoFiles = getAllVideoFiles(VIDEOS_DIR);
  
  if (videoFiles.length === 0) {
    console.log('📭 No se encontraron videos en', VIDEOS_DIR);
    return;
  }
  
  console.log(`📁 Encontrados ${videoFiles.length} videos\n`);
  console.log('='.repeat(50));
  
  // Crear directorio de salida
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const stats: VideoStats = {
    original: 0,
    compressed: 0,
    savings: 0,
    savingsPercent: 0,
  };
  
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < videoFiles.length; i++) {
    const inputPath = videoFiles[i];
    const relativePath = path.relative(VIDEOS_DIR, inputPath);
    const outputPath = path.join(OUTPUT_DIR, relativePath);
    
    console.log(`\n[${i + 1}/${videoFiles.length}] 📹 ${relativePath}`);
    
    // Verificar si ya existe comprimido
    if (fs.existsSync(outputPath)) {
      const originalSize = fs.statSync(inputPath).size;
      const compressedSize = fs.statSync(outputPath).size;
      
      // Si ya existe y es más pequeño, saltar
      if (compressedSize < originalSize) {
        console.log(`   ⏭️  Ya comprimido (${formatBytes(compressedSize)})`);
        stats.original += originalSize;
        stats.compressed += compressedSize;
        skipped++;
        continue;
      }
    }
    
    const originalSize = fs.statSync(inputPath).size;
    stats.original += originalSize;
    
    console.log(`   📊 Original: ${formatBytes(originalSize)}`);
    console.log(`   ⏳ Comprimiendo...`);
    
    const success = await compressVideo(inputPath, outputPath);
    
    if (success && fs.existsSync(outputPath)) {
      const compressedSize = fs.statSync(outputPath).size;
      stats.compressed += compressedSize;
      
      const savings = originalSize - compressedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
      
      console.log(`   ✅ Comprimido: ${formatBytes(compressedSize)} (-${savingsPercent}%)`);
      processed++;
    } else {
      stats.compressed += originalSize; // Contar original si falla
      errors++;
    }
  }
  
  // Resumen final
  stats.savings = stats.original - stats.compressed;
  stats.savingsPercent = (stats.savings / stats.original) * 100;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN FINAL\n');
  console.log(`   ✅ Procesados: ${processed}`);
  console.log(`   ⏭️  Saltados: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📁 Total: ${videoFiles.length}`);
  console.log('\n💾 ESPACIO:');
  console.log(`   Original: ${formatBytes(stats.original)}`);
  console.log(`   Comprimido: ${formatBytes(stats.compressed)}`);
  console.log(`   Ahorro: ${formatBytes(stats.savings)} (${stats.savingsPercent.toFixed(1)}%)`);
  console.log(`\n📂 Videos comprimidos en: ${OUTPUT_DIR}`);
  
  // Verificar si cabe en 1GB
  if (stats.compressed <= 1024 * 1024 * 1024) {
    console.log('\n✅ ¡Los videos comprimidos caben en el plan Hobby de Vercel (1GB)!');
  } else {
    const overGB = stats.compressed - (1024 * 1024 * 1024);
    console.log(`\n⚠️  Todavía excede 1GB por ${formatBytes(overGB)}`);
    console.log('   Considera aumentar CRF o reducir resolución en el script.');
  }
}

main().catch(console.error);
