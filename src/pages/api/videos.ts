import type { APIRoute } from 'astro';
import { list } from '@vercel/blob';

// Cargar variables de entorno en desarrollo
if (import.meta.env.DEV) {
  const dotenv = await import('dotenv');
  dotenv.config({ path: '.env.local' });
}

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Verificar que el token está disponible
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN no está configurado');
      return new Response(JSON.stringify({ 
        error: 'Token de Blob no configurado',
        hint: 'Asegúrate de tener BLOB_READ_WRITE_TOKEN en las variables de entorno'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Listar todos los blobs que empiecen con "videos/"
    const { blobs } = await list({ prefix: 'videos/' });
    
    // Transformar los blobs a la estructura que necesitamos
    const videos = blobs
      .filter(blob => blob.pathname.endsWith('.mp4'))
      .map(blob => {
        // Pathname ejemplo: "videos/1. Alevin A/05 Maria Martin.mp4"
        const pathParts = blob.pathname.replace('videos/', '').split('/');
        const fileName = pathParts[pathParts.length - 1].replace('.mp4', '');
        const categoryFolder = pathParts[pathParts.length - 2] || 'Sin categoría';
        
        // Extraer orden de categoría
        const orderMatch = categoryFolder.match(/^(\d+)\./);
        const categoryOrder = orderMatch ? parseInt(orderMatch[1]) : 999;
        
        // Nombre limpio de categoría
        const categoryName = categoryFolder.replace(/^\d+\.\s*/, '');
        
        return {
          src: blob.url,
          category: categoryName,
          categoryOrder,
          fileName,
          size: blob.size,
        };
      });
    
    // Ordenar: por categoría, luego por nombre
    videos.sort((a, b) => {
      if (a.categoryOrder !== b.categoryOrder) {
        return a.categoryOrder - b.categoryOrder;
      }
      return a.fileName.localeCompare(b.fileName);
    });
    
    return new Response(JSON.stringify(videos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache 1 hora
      },
    });
  } catch (error) {
    console.error('Error listando videos:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener videos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
