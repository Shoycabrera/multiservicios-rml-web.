# Imágenes de unidades

Esta carpeta recibe directamente las carpetas creadas por el optimizador portable.

Ejemplo:

```text
assets/img/unidades/
└── R090/
    ├── 01.webp
    ├── 02.webp
    ├── 03.webp
    └── fotos.json
```

Reglas:

- `01.webp` es siempre la foto principal que usa la tarjeta.
- `02.webp`, `03.webp`, etc. son fotos adicionales para una galería/carrusel futuro.
- `fotos.json` es generado por el optimizador y solo sirve para conocer la galería; la tarjeta NO depende de este archivo.
- Si `01.webp` no existe, la web usa automáticamente la imagen de muestra del modelo.
- Las imágenes NO controlan la visibilidad de una unidad. La visibilidad depende de `estado` en `inventario-unidades.js`.
- No guardar aquí los originales JPG/HEIC de cámara.

No hace falta crear carpetas vacías para todas las unidades. La carpeta de una unidad se agrega únicamente cuando existan fotos procesadas.
