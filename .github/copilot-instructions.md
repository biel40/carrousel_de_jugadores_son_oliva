# Instrucciones para GitHub Copilot - Carrusel Son Oliva

## 📋 Descripción del Proyecto

Este es un carrusel de videos a pantalla completa desarrollado con **Astro** para mostrar videos de jugadores del club Son Oliva. Los videos se organizan por categorías (equipos) y se precargan completamente al iniciar la aplicación.

## 🏗️ Arquitectura

### Stack Tecnológico
- **Framework**: Astro 5.x
- **Lenguaje**: TypeScript
- **Estilos**: CSS puro con variables CSS
- **Videos**: MP4 importados dinámicamente con `import.meta.glob`

### Componentes Principales

#### `VideoCarousel.astro`
Componente principal que maneja:
- Importación dinámica de videos desde `src/assets/videos/**/*.mp4`
- Ordenación por categoría (número en nombre de carpeta) y nombre de archivo
- Sistema de precarga con pantalla de loading y barra de progreso
- Controles de navegación (flechas, play/pause)
- Navegación por teclado
- Diseño responsive con múltiples breakpoints

### Estructura de Videos
```
src/assets/videos/
├── [número]. [Categoría]/
│   └── [número] [Nombre Jugador].mp4
```
Ejemplo: `1. Alevin A/05 Maria Martin.mp4`

## 🎯 Convenciones de Código

### TypeScript
- Usar tipos explícitos para interfaces (`VideoInfo`)
- Preferir `const` sobre `let` cuando sea posible
- Usar optional chaining (`?.`) para accesos seguros

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
