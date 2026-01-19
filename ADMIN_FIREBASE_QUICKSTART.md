# ⚡ QUICKSTART: Admin Firebase en 5 Minutos

## 🚀 Instrucciones Rápidas

### **Paso 1: Generar Hash (1 minuto)**

En terminal, en la raíz del proyecto:

```bash
node scripts/generate-admin-hash.js
```

Ingresa:
- Username: `admin`
- Contraseña: `AdminInduspack` (o la que quieras)
- Nombre: `Administrador`
- Email: `admin@induspack.com`

**Resultado:** Te mostrará un hash bcrypt. ✅ Cópialo

---

### **Paso 2: Actualizar Firebase Rules (2 minutos)**

1. Ve a: https://console.firebase.google.com/
2. Proyecto: `induspack-reportaje`
3. **Realtime Database** → **Reglas**
4. Reemplaza TODO con esto:

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

5. Clic en **Publicar**

---

### **Paso 3: Crear Admin en Firebase (2 minutos)**

1. En Firebase Console, **Realtime Database** → **Data**
2. Haz clic en el **+** (add child)
3. Nombre: `admins` → Enter
4. Haz clic en **+** nuevamente debajo de `admins`
5. ID: `admin_1` → Enter

Ahora agrega estos campos (clic en **+** para cada uno):

```
username: admin
password: [PEGA EL HASH QUE GENERASTE]
nombre: Administrador
email: admin@induspack.com
createdAt: 2026-01-16
rol: admin
activo: true
```

---

### **Paso 4: Prueba (1 minuto)**

1. `npm start`
2. Abre la app
3. Login → "¿Eres administrador?"
4. Ingresa: `admin` / `AdminInduspack`
5. ✅ Debería funcionar

---

## 📊 Resultado

Tu estructura en Firebase debería verse así:

```
admins/
└── admin_1/
    ├── username: "admin"
    ├── password: "$2a$10$..." ← Hash
    ├── nombre: "Administrador"
    ├── email: "admin@induspack.com"
    ├── createdAt: "2026-01-16"
    ├── rol: "admin"
    └── activo: true
```

---

## ✅ Verificación

- [ ] Hash generado
- [ ] Reglas publicadas en Firebase
- [ ] Tabla `admins` creada
- [ ] Registro `admin_1` creado con datos
- [ ] App probada - Login funciona
- [ ] AdminDashboard aparece

---

## 🎯 Listo

Tu app ahora:
- ✅ Tiene credenciales de admin en Firebase
- ✅ No tiene hardcode inseguro
- ✅ Usa bcrypt para validar
- ✅ Soporta múltiples admins

**¡Completado en 5 minutos!** 🚀

---

## ❓ Si Algo No Funciona

**No veo el hash:**
```bash
npm install bcryptjs
node scripts/generate-admin-hash.js
```

**Error en Firebase:**
- Verifica que publicaste las reglas
- Verifica que los datos se guardaron
- Refresh la página de Firebase

**Login no funciona:**
- Verifica que el hash está completo
- Verifica que el username coincide (mayúsculas)
- Verifica que `admins` existe

---

Para detalles completos, lee: [ADMIN_LOGIN_FIREBASE_SEGURO.md](./ADMIN_LOGIN_FIREBASE_SEGURO.md)
