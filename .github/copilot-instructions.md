# Instrucciones para GitHub Copilot - Carrusel Son Oliva

## 📋 Descripción del Proyecto

Este es un carrusel de videos a pantalla completa desarrollado con **Astro** para mostrar videos de jugadores del club Son Oliva. Los videos se almacenan en **Vercel Blob** y se cargan dinámicamente.

## 🏗️ Arquitectura

### Stack Tecnológico
- **Framework**: Astro 5.x con adaptador Vercel
- **Lenguaje**: TypeScript
- **Estilos**: CSS puro con variables CSS
- **Almacenamiento de Videos**: Vercel Blob
- **Despliegue**: Vercel

### Componentes Principales

#### `VideoCarouselBlob.astro` (Principal)
Componente que maneja:
- Carga dinámica de videos desde Vercel Blob via API
- Fallback a videos locales en desarrollo
- Sistema de precarga con pantalla de loading y barra de progreso
- Controles de navegación (flechas, play/pause)
- Navegación por teclado
- Diseño responsive con múltiples breakpoints

#### `VideoCarousel.astro` (Legacy)
Versión original que usa videos locales con `import.meta.glob`

#### `/api/videos.ts`
Endpoint que lista videos desde Vercel Blob

### Estructura de Videos en Vercel Blob
```
videos/
├── [número]. [Categoría]/
│   └── [número] [Nombre Jugador].mp4
```
Ejemplo: `videos/1. Alevin A/05 Maria Martin.mp4`

## 🎬 Gestión de Videos

### Subir videos a Vercel Blob
```bash
npm run upload-compressed
```
> ⚠️ **IMPORTANTE**: Usar SIEMPRE `npm run upload-compressed` para subir videos desde la carpeta `videos-compressed`. El Blob Storage de Vercel tiene almacenamiento limitado, por lo que solo se deben subir videos comprimidos y optimizados.

Requiere `BLOB_READ_WRITE_TOKEN` en `.env.local`

### Listar videos en Vercel Blob
```bash
npm run list-videos
```

### Configurar Token
1. Ve a Vercel Dashboard → Storage → Crear Blob Store
2. Copia el `BLOB_READ_WRITE_TOKEN`
3. Añádelo a `.env.local` para desarrollo local
4. Vercel lo inyecta automáticamente en producción

## 🎯 Convenciones de Código

### TypeScript
- Usar tipos explícitos para interfaces (`VideoInfo`)
- Preferir `const` sobre `let` cuando sea posible
- Usar optional chaining (`?.`) para accesos seguros
- **No añadir comentarios adicionales** en métodos o funciones salvo que sean imprescindibles
- **Documentar con JSDoc** todo lo posible en métodos (descripción, parámetros, retorno, ejemplos si es relevante)
- **Sube al blob solo los videos optimizados y comprimidos en .mp4**

### CSS
- Usar `rem` para tamaños de fuente
- Usar `px` para tamaños fijos de elementos UI
- Implementar mobile-first cuando sea posible
- Respetar safe areas con `env(safe-area-inset-*)`
- Usar `100dvh` para altura dinámica en móviles

### Astro
- El frontmatter (entre `---`) contiene lógica de servidor
- El `<script>` contiene lógica de cliente
- Los estilos son scoped por defecto

## ⚡ Notas importantes de Astro 5.x

### Modo de salida (output)
- En Astro 5.x, el modo `hybrid` ha sido **eliminado**
- Usar `output: 'static'` (por defecto), que ahora soporta endpoints dinámicos
- Los endpoints con `export const prerender = false` se ejecutan en el servidor

### Variables de entorno
- Astro **NO** carga automáticamente variables de `.env.local` sin prefijo `PUBLIC_`
- Las variables sin prefijo `PUBLIC_` solo están disponibles en el servidor
- Para desarrollo local con endpoints que usan `process.env`, hay que:
  1. Usar `dotenv` manualmente en el endpoint, o
  2. Pasar `--env-file=.env.local` en el script de dev (puede no funcionar)
  
```typescript
// Ejemplo: cargar dotenv en desarrollo dentro del endpoint
if (import.meta.env.DEV) {
  const dotenv = await import('dotenv');
  dotenv.config({ path: '.env.local' });
}
```

### Despliegue en Vercel
- Vercel inyecta automáticamente las variables de entorno configuradas en el dashboard
- No es necesario el workaround de dotenv en producción

## 🔧 Funcionalidades Clave

### Sistema de Precarga
```typescript
// Cargar videos en lotes para no saturar la red
const batchSize = 3;
// Usar evento 'canplaythrough' para garantizar reproducción fluida
video.addEventListener('canplaythrough', onReady);
```

### Navegación
- Navegación circular (del último vuelve al primero)
- Reinicio de video al cambiar (`currentTime = 0`)
- Bloqueo de navegación hasta completar precarga

## 📝 Tareas Comunes

### Agregar nueva categoría
1. Crear carpeta en `src/assets/videos/` con formato `[N]. [Nombre]/`
2. El número N determina el orden

### Modificar controles
- Editar la sección `<div class="carousel-controls">` en VideoCarousel.astro
- Los estilos responsive están en media queries al final del `<style>`

### Ajustar precarga
- Modificar `batchSize` en `preloadAllVideos()` para cambiar velocidad de carga
- El evento `canplaythrough` garantiza reproducción sin buffering

## ⚠️ Consideraciones

- Los videos deben estar en formato MP4
- El autoplay requiere que el video esté `muted`
- En móviles, el autoplay puede estar bloqueado por políticas del navegador
- Todos los videos se cargan en memoria, considerar el tamaño total

## 🧪 Testing Manual

1. Verificar que la barra de progreso avanza correctamente
2. Probar navegación con teclado (←, →, Espacio)
3. Verificar en diferentes dispositivos/orientaciones
4. Comprobar que los videos no se pausan ni hacen buffering
