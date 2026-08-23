# Prompt maestro — Optimizador Portable de Imágenes RML

Construye una herramienta portable para Windows llamada **RML Image Optimizer**. Su única responsabilidad es convertir las fotografías de UNA unidad por vez en una carpeta terminada lista para copiar o arrastrar al repositorio web.

No debe administrar inventario, estados, Git, GitHub, Google Drive, OneDrive ni archivos HTML/JS de la web. No debe necesitar conocer la ubicación del repositorio.

## Flujo de uso

1. Abrir la herramienta.
2. Escribir el ID de la unidad, por ejemplo `R090`.
3. Seleccionar una carpeta de entrada con las fotografías.
4. La herramienta valida que exista exactamente una foto principal cuyo nombre base sea `1` (`1.jpg`, `1.jpeg`, `1.png`, etc.).
5. Mostrar cantidad de imágenes encontradas y la principal detectada.
6. El usuario pulsa **Optimizar**.
7. La herramienta crea una carpeta de salida llamada exactamente como el ID, por ejemplo `R090/`.
8. El usuario arrastra esa carpeta a `assets/img/unidades/` del repositorio.

## Reglas de entrada

La foto principal debe llamarse exactamente `1` antes de la extensión. Ejemplos válidos:

- `1.jpg`
- `1.jpeg`
- `1.png`
- `1.webp`
- `1.heic` si el motor instalado puede decodificar HEIC

Las fotos secundarias pueden tener cualquier nombre y no necesitan orden:

- `IMG_4832.jpg`
- `interior.jpg`
- `WhatsApp Image 2026-08-23.jpeg`
- `lateral.png`

Ignorar archivos que no sean imágenes.

Si no existe `1.*`, detener el proceso con un mensaje claro. Si existen varias (`1.jpg` y `1.png`), detener el proceso por ambigüedad. Nunca escoger la principal automáticamente.

## Reglas del ID

Normalizar a mayúsculas y quitar espacios exteriores. Validar inicialmente estos patrones:

- `R001` a `R999`
- `LM01` a `LM99`

No consultar ni modificar `inventario-unidades.js`. El optimizador debe poder seguir funcionando si en el futuro se agregan IDs nuevos que cumplan el patrón.

## Procesamiento

Para cada imagen:

- leer sin modificar el original
- corregir orientación EXIF
- mantener proporción
- no hacer recorte automático
- máximo 1600 px en el lado más largo
- no agrandar imágenes menores
- convertir a WebP
- calidad WebP 82, configurable
- retirar metadata innecesaria de la copia web

La principal siempre se convierte en `01.webp`. Las secundarias se convierten en `02.webp`, `03.webp`, etc., usando un orden determinista estable (por ejemplo, nombre de archivo natural alfabético después de separar la principal). No es necesario conservar el nombre original.

## Carpeta de salida

Si se procesa `R090`, crear:

```text
R090/
├── 01.webp
├── 02.webp
├── 03.webp
└── fotos.json
```

La carpeta de salida debe ser autocontenida y lista para arrastrar a `assets/img/unidades/`.

No crear variantes `480/960/1600`. Solo un WebP optimizado por fotografía.

## fotos.json

Generar automáticamente:

```json
{
  "principal": "01.webp",
  "fotos": [
    "01.webp",
    "02.webp",
    "03.webp"
  ]
}
```

Debe reflejar exactamente las imágenes generadas.

## Actualización de una unidad

El flujo de actualización es intencionalmente simple: el usuario prepara nuevamente TODAS las fotos que desea conservar, procesa la unidad y obtiene una carpeta nueva. Luego reemplaza la carpeta anterior en el repositorio.

No implementar sincronización incremental, cachés, comparación de hashes ni limpieza remota en la primera versión.

## Interfaz

Crear una interfaz sencilla para Windows con:

- campo `Código de unidad`
- botón `Seleccionar carpeta`
- texto `Principal detectada: ...`
- texto `Imágenes encontradas: N`
- botón grande `OPTIMIZAR`
- progreso por imagen
- resumen de MB originales y MB finales
- botón `ABRIR CARPETA DE SALIDA`

Debe recordar la última carpeta de salida elegida, pero no depender de una instalación compleja.

## Salida esperada

Ejemplo:

```text
RML IMAGE OPTIMIZER
Unidad: R090
Principal: 1.jpg
Imágenes: 5

✓ 01.webp
✓ 02.webp
✓ 03.webp
✓ 04.webp
✓ 05.webp
✓ fotos.json

Originales: 24.8 MB
Salida: 2.4 MB
Reducción: 90.3%

LISTO PARA COPIAR
C:\RML-OPTIMIZADAS\R090
```

## Robustez

- No modificar originales.
- No sobrescribir silenciosamente una carpeta de salida existente: pedir confirmación antes de reemplazarla.
- Procesar rutas de Windows con espacios y Unicode.
- Si una imagen falla, mostrar cuál falló y no entregar una carpeta que parezca completa sin advertirlo.
- Escribir primero a una carpeta temporal y renombrarla al final cuando todo termine correctamente.
- `fotos.json` debe escribirse solo después de que todas las imágenes hayan sido generadas correctamente.

## Stack sugerido

Preferencia: Node.js + Sharp para el motor de imagen. La interfaz puede ser Electron/Tauri u otra opción sencilla si se quiere un `.exe`; también puede entregarse primero como script portable con un `.bat` de arranque. Priorizar sencillez y portabilidad sobre arquitectura compleja.

## Criterio de terminado

La herramienta está terminada cuando este flujo funciona:

1. Existe una carpeta cualquiera con `1.jpg`, `interior.jpg` y `IMG_4832.jpg`.
2. El usuario escribe `R090`.
3. Selecciona esa carpeta y pulsa Optimizar.
4. Se genera `R090/01.webp`, `02.webp`, `03.webp` y `fotos.json`.
5. Se puede arrastrar `R090/` a `assets/img/unidades/`.
6. La web usa automáticamente `R090/01.webp` como principal.
7. Si se elimina la carpeta `R090/`, la web vuelve automáticamente a la imagen de muestra del modelo sin cambiar el inventario.
