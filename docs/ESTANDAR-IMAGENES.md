# Estándar de imágenes — Multiservicios RML

## Objetivo

El procesamiento de fotos de una unidad es independiente del inventario y de GitHub. El optimizador recibe una carpeta de fotos, genera una carpeta terminada y esa carpeta se arrastra a `assets/img/unidades/`.

## IDs de unidad

IDs actuales:

- `R001` a `R100`
- `LM01` a `LM70`

El ID se escribe al procesar la carpeta. Siempre se guarda en mayúsculas.

## Entrada

La carpeta de entrada puede llamarse como sea.

La única regla obligatoria es que la foto principal se llame exactamente `1` antes de la extensión:

```text
Fotos nuevas/
├── 1.jpg          <- principal
├── IMG_4832.jpg
├── interior.jpeg
└── WhatsApp Image.png
```

Extensiones aceptables según soporte del procesador: JPG/JPEG, PNG, WebP y, cuando sea compatible, HEIC/HEIF.

Si existen dos principales (`1.jpg` y `1.png`) el proceso debe detenerse y pedir que se deje una sola. Si no existe `1.*`, no debe adivinar cuál es la principal.

## Salida

Para la unidad `R090`:

```text
R090/
├── 01.webp
├── 02.webp
├── 03.webp
├── 04.webp
└── fotos.json
```

- `01.webp` siempre proviene de `1.*`.
- Las demás imágenes pueden convertirse en cualquier orden estable; su orden visual no es contractual.
- Un solo WebP por foto.
- Máximo recomendado: 1600 px en el lado más largo.
- Calidad WebP inicial: 82.
- Mantener proporción.
- No hacer crop automático.
- Corregir orientación EXIF.
- No agrandar imágenes pequeñas.
- No modificar los originales.

## fotos.json

Se genera dentro de la carpeta de la unidad:

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

La tarjeta de la web NO necesita `fotos.json`: intenta directamente `assets/img/unidades/<ID>/01.webp`. `fotos.json` queda preparado para el carrusel o vista de detalle futura.

## Publicación

El optimizador no necesita conocer GitHub ni el repositorio. Su salida se copia o arrastra manualmente a:

```text
assets/img/unidades/
```

Para actualizar una unidad se vuelve a procesar el conjunto de fotos y se reemplaza la carpeta de esa unidad.

## Visibilidad

Las fotos nunca deciden si una unidad se publica. Solo `estado` en `inventario-unidades.js`:

- `disponible`
- `reservado`
- `proximamente`
- `oculto`
- `no-disponible` (opcional)

Si `01.webp` no existe, la web usa la imagen de muestra del modelo.
