// Script para listar videos en Vercel Blob
// Ejecutar con: npm run list-videos
import { list } from '@vercel/blob';

async function listVideos() {
  console.log('📋 Listando videos en Vercel Blob...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN no está configurado');
    process.exit(1);
  }
  
  try {
    const { blobs } = await list({ prefix: 'videos/' });
    
    if (blobs.length === 0) {
      console.log('📭 No hay videos subidos todavía');
      return;
    }
    
    // Agrupar por categoría
    const byCategory: Record<string, typeof blobs> = {};
    
    for (const blob of blobs) {
      const pathParts = blob.pathname.replace('videos/', '').split('/');
      const category = pathParts[pathParts.length - 2] || 'Sin categoría';
      
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(blob);
    }
    
    // Mostrar por categoría
    let totalSize = 0;
    
    for (const [category, categoryBlobs] of Object.entries(byCategory).sort()) {
      console.log(`\n📁 ${category}`);
      console.log('─'.repeat(40));
      
      for (const blob of categoryBlobs) {
        const fileName = blob.pathname.split('/').pop();
        const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        totalSize += blob.size;
        
        console.log(`   🎬 ${fileName} (${sizeMB} MB)`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Total: ${blobs.length} videos`);
    console.log(`💾 Tamaño total: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listVideos();
