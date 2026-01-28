// Script para subir videos a Vercel Blob
// Ejecutar con: npx tsx scripts/upload-videos.ts
// Usar --compressed para subir desde la carpeta de videos comprimidos

import { put, list } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';

// Detectar si se pasa --compressed como argumento
const useCompressed = process.argv.includes('--compressed');
const VIDEOS_DIR = useCompressed ? './src/assets/videos-compressed' : './src/assets/videos';

interface UploadResult {
  localPath: string;
  blobUrl: string;
  pathname: string;
}

async function getAllVideoFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await getAllVideoFiles(fullPath));
    } else if (item.name.endsWith('.mp4')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function uploadVideos() {
  console.log('🎬 Iniciando subida de videos a Vercel Blob...\n');
  
  if (useCompressed) {
    console.log('📦 Modo: Subiendo videos COMPRIMIDOS\n');
  }
  
  // Verificar que existe el token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN no está configurado');
    console.error('   Asegúrate de tener el archivo .env.local con el token');
    process.exit(1);
  }
  
  // Verificar que existe el directorio
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.error(`❌ Error: No existe el directorio ${VIDEOS_DIR}`);
    if (useCompressed) {
      console.error('   Ejecuta primero: npm run compress-videos');
    }
    process.exit(1);
  }
  
  // Obtener todos los videos
  const videoFiles = await getAllVideoFiles(VIDEOS_DIR);
  console.log(`📁 Encontrados ${videoFiles.length} videos en ${VIDEOS_DIR}\n`);
  
  // Listar blobs existentes para evitar duplicados
  const existingBlobs = await list();
  const existingPaths = new Set(existingBlobs.blobs.map(b => b.pathname));
  
  const results: UploadResult[] = [];
  let uploaded = 0;
  let skipped = 0;
  
  for (const filePath of videoFiles) {
    // Crear el pathname para el blob (mantener estructura de carpetas)
    // Ejemplo: "1. Alevin A/05 Maria Martin.mp4"
    const relativePath = path.relative(VIDEOS_DIR, filePath).replace(/\\/g, '/');
    const blobPathname = `videos/${relativePath}`;
    
    // Verificar si ya existe
    if (existingPaths.has(blobPathname)) {
      console.log(`⏭️  Saltando (ya existe): ${relativePath}`);
      skipped++;
      continue;
    }
    
    console.log(`📤 Subiendo: ${relativePath}`);
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const blob = await put(blobPathname, fileBuffer, {
        access: 'public',
        contentType: 'video/mp4',
      });
      
      results.push({
        localPath: filePath,
        blobUrl: blob.url,
        pathname: blobPathname,
      });
      
      uploaded++;
      console.log(`   ✅ Subido: ${blob.url}\n`);
    } catch (error) {
      console.error(`   ❌ Error subiendo ${relativePath}:`, error);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resumen:`);
  console.log(`   ✅ Subidos: ${uploaded}`);
  console.log(`   ⏭️  Saltados: ${skipped}`);
  console.log(`   📁 Total: ${videoFiles.length}`);
  
  // Guardar URLs en un archivo JSON para referencia
  if (results.length > 0) {
    const outputPath = './scripts/uploaded-videos.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 URLs guardadas en: ${outputPath}`);
  }
  
  console.log('\n🎉 ¡Proceso completado!');
}

uploadVideos().catch(console.error);
