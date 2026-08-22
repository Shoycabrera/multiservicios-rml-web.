// ============================================================
// INVENTARIO CENTRAL DE UNIDADES
// ============================================================
// Para AGREGAR una unidad: copia un bloque {...}, pégalo al final
// y cambia SOLO estos campos. Las tarjetas y WhatsApp se generan solos.
//
// ESTADO: usa uno de estos valores:
//   "disponible" | "reservado" | "proximamente" | "no-disponible" | "oculto"
// "oculto" conserva la unidad en el archivo pero no la publica en la web.
// Para ELIMINARLA definitivamente: borra su bloque completo.
//
// FOTO: coloca aquí la ruta, por ejemplo: "fotos/sol-04.jpg".
// Si foto queda vacía (""), se muestra el dibujo de auto de respaldo.
// ============================================================

window.INVENTARIO_UNIDADES = [
  {
    "modelo": "Kia Soluto",
    "unidad": "R090",
    "anio": 2025,
    "foto": "",
    "km": 34000,
    "transmision": "Automática",
    "color": "Blanco",
    "uso": "Particular",
    "estado": "disponible"
  },
  {
    "modelo": "Kia Soluto",
    "unidad": "SOL-02",
    "anio": 2023,
    "foto": "",
    "km": 22100,
    "transmision": "Automática",
    "color": "Negro",
    "uso": "Plataforma",
    "estado": "disponible"
  },
  {
    "modelo": "Kia Soluto",
    "unidad": "SOL-03",
    "anio": 2022,
    "foto": "",
    "km": 55700,
    "transmision": "Manual",
    "color": "Blanco",
    "uso": "Plataforma",
    "estado": "disponible"
  },
  {
    "modelo": "Hyundai Accent Solaris",
    "unidad": "LM040",
    "anio": 2022,
    "foto": "",
    "km": 41300,
    "transmision": "Automática",
    "color": "Blanco",
    "uso": "Plataforma",
    "estado": "disponible"
  },
  {
    "modelo": "Hyundai Accent Solaris",
    "unidad": "ACS-02",
    "anio": 2021,
    "foto": "",
    "km": 65000,
    "transmision": "Manual",
    "color": "Plata",
    "uso": "Taxi",
    "estado": "disponible"
  },
  {
    "modelo": "Hyundai Grand i10",
    "unidad": "GI10-01",
    "anio": 2023,
    "foto": "",
    "km": 15800,
    "transmision": "Automática",
    "color": "Rojo",
    "uso": "Particular",
    "estado": "disponible"
  },
  {
    "modelo": "Hyundai Grand i10",
    "unidad": "GI10-02",
    "anio": 2023,
    "foto": "",
    "km": 32500,
    "transmision": "Automática",
    "color": "Blanco",
    "uso": "Plataforma",
    "estado": "disponible"
  },
  {
    "modelo": "Hyundai Grand i10",
    "unidad": "GI10-03",
    "anio": 2022,
    "foto": "",
    "km": 48200,
    "transmision": "Manual",
    "color": "Gris",
    "uso": "Plataforma",
    "estado": "disponible"
  }
];
