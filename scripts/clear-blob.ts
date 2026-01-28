// Script para borrar todos los videos de Vercel Blob
// Ejecutar con: npm run clear-blob

import { list, del } from '@vercel/blob';

async function clearBlob() {
  console.log('🗑️  Borrando todos los videos de Vercel Blob...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN no está configurado');
    process.exit(1);
  }
  
  try {
    const { blobs } = await list({ prefix: 'videos/' });
    
    if (blobs.length === 0) {
      console.log('📭 No hay videos para borrar');
      return;
    }
    
    console.log(`📁 Encontrados ${blobs.length} videos para borrar\n`);
    
    let deleted = 0;
    
    for (const blob of blobs) {
      console.log(`🗑️  Borrando: ${blob.pathname}`);
      await del(blob.url);
      deleted++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Borrados ${deleted} videos`);
    console.log('📦 Ahora puedes subir los videos comprimidos con:');
    console.log('   npm run upload-compressed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearBlob();
