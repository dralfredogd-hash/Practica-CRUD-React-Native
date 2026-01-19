# Firebase Realtime Database Rules

Para que la aplicación pueda guardar reportes en sus tablas específicas, necesitas actualizar las reglas de Firebase Realtime Database.

## Pasos para actualizar las reglas:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto `induspack-reportaje`
3. Ve a **Realtime Database** → **Reglas**
4. Reemplaza el contenido con lo siguiente:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "admins": {
      ".read": true,
      ".write": false
    },
    "clients": {
      ".read": true,
      ".write": true
    },
    "employees": {
      ".read": true,
      ".write": true
    },
    "FlejeDatos": {
      ".read": true,
      ".write": true
    },
    "ImpresionDatos": {
      ".read": true,
      ".write": true
    },
    "LaminadoDatos": {
      ".read": true,
      ".write": true
    },
    "BolseoDatos": {
      ".read": true,
      ".write": true
    },
    "ManufacturaDatos": {
      ".read": true,
      ".write": true
    },
    "PeletizadoDatos": {
      ".read": true,
      ".write": true
    },
    "DiariaDobladoDatos": {
      ".read": true,
      ".write": true
    },
    "CorteRefiladoDatos": {
      ".read": true,
      ".write": true
    },
    "ResumenReportaje": {
      ".read": true,
      ".write": true
    }
  }
}
```

5. Haz clic en **Publicar**

## 📋 Estructura de Base de Datos

Con estas reglas, tu BD tendrá la siguiente estructura:

```
induspack-reportaje (root)
├── admins/                     (administradores - NUEVO)
│   ├── admin_1/
│   │   ├── username: "admin"
│   │   ├── password: "[hash_bcrypt]"
│   │   ├── nombre: "Administrador"
│   │   ├── email: "admin@induspack.com"
│   │   └── createdAt: "2026-01-16"
│   └── admin_2/
│       └── ...
├── clients/                    (usuarios)
├── employees/                  (empleados)
├── FlejeDatos/                 (reportes de Fleje)
│   ├── id_auto_1/
│   │   ├── fecha: "2026-01-15"
│   │   ├── filas: [...]
│   │   └── resumen_id: "..."
├── ImpresionDatos/             (reportes de Impresión)
├── LaminadoDatos/              (reportes de Laminado)
├── BolseoManufacturaDatos/     (reportes de Bolseo)
├── ManufacturaDatos/           (reportes de Manufactura)
├── PeletizadoDatos/            (reportes de Peletizado)
├── DiariaDobladoDatos/         (reportes de Diaria Doblado)
├── CorteRefiladoDatos/         (reportes de Corte Refilado)
└── ResumenReportaje/           (resumen de todos los reportes)
    ├── id_auto_1/
    │   ├── tipo: "fleje"
    │   ├── fecha: "2026-01-15"
    │   ├── cantidad_filas: 5
    │   └── ... (totales y promedios)
```

## ⚠️ Nota de Seguridad:
Estas reglas son permisivas y están bien para desarrollo/testing.
Para producción, usa autenticación y reglas más restrictivas como:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "admins": {
      ".read": true,
      ".write": false
    },
    "clients": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "employees": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "FlejeDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "ImpresionDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "LaminadoDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "BolseoDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "ManufacturaDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "PeletizadoDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "DiariaDobladoDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "CorteRefiladoDatos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "ResumenReportaje": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```
