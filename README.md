# 🎥 Carrusel de Jugadores - Son Oliva

Carrusel de videos a pantalla completa para mostrar a los jugadores del club Son Oliva. Desarrollado con Astro para un rendimiento óptimo.

## ✨ Características

- **Carrusel de videos a pantalla completa** con navegación fluida
- **Precarga completa de videos** al iniciar la aplicación con barra de progreso
- **Organización por categorías** (Alevín, Benjamín, Cadete, Infantil, Juvenil, Femenino, etc.)
- **Controles intuitivos**: flechas de navegación, play/pause, navegación por teclado
- **Diseño responsive** optimizado para móviles, tablets y escritorio
- **Soporte para dispositivos con notch** y safe areas

## 🛠️ Tecnologías

- [Astro](https://astro.build/) v5.x
- TypeScript
- CSS moderno (CSS Grid, Flexbox, CSS Variables)

## 📁 Estructura del Proyecto

```
├── public/                  # Archivos estáticos
├── src/
│   ├── assets/
│   │   └── videos/          # Videos organizados por categoría
│   │       ├── 1. Alevin A/
│   │       ├── 3. Benjamin A comp/
│   │       ├── 5. Cadete A/
│   │       └── ...
│   ├── components/
│   │   └── VideoCarousel.astro  # Componente principal del carrusel
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 📹 Agregar Videos

1. Crea una carpeta dentro de `src/assets/videos/` con el formato: `[número]. [Nombre Categoría]/`
   - Ejemplo: `1. Alevin A/`, `5. Cadete A/`
   - El número determina el orden de aparición en el carrusel

2. Coloca los videos `.mp4` dentro de la carpeta correspondiente
   - El nombre del archivo se usa como nombre del jugador
   - Ejemplo: `05 Maria Martin.mp4`

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## ⌨️ Controles

| Acción | Control |
|--------|---------|
| Video anterior | `←` Flecha izquierda / Botón izquierdo |
| Video siguiente | `→` Flecha derecha / Botón derecho |
| Play/Pause | `Espacio` / Botón play/pause |

## 🔧 Sistema de Carga

El carrusel implementa un sistema de precarga inteligente:

1. **Pantalla de carga inicial**: Muestra spinner y barra de progreso
2. **Carga en lotes**: Los videos se cargan en grupos de 3 para no saturar la red
3. **Evento `canplaythrough`**: Garantiza que cada video tiene suficientes datos para reproducirse sin interrupciones
4. **Navegación bloqueada**: Los controles se habilitan solo cuando todos los videos están listos

## 📱 Responsive Design

- **Desktop**: Controles amplios y espaciados
- **Tablet**: Ajustes de tamaño y espaciado
- **Móvil Portrait**: Controles optimizados para uso táctil
- **Móvil Landscape**: Layout compacto
- **Dispositivos con notch**: Respeta safe areas con `env(safe-area-inset-*)`

## 📄 Licencia

Proyecto privado para el club Son Oliva.
