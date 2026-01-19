# Guía de Pruebas - Nuevas Funcionalidades de Perfiles

## 📱 Pre-requisitos para Pruebas

- Aplicación compilada y corriendo en Expo (✅ Estado actual: CORRIENDO)
- Acceso a dispositivo físico o emulador con Expo Go
- Acceso a base de datos Firebase (RTDB)
- Conexión a internet

---

## 🧪 Escenario 1: Registro y Creación de Usuario

### Pasos
1. Abre la aplicación en Expo Go
2. En pantalla de Register, ingresa:
   - Nombre: "Juan"
   - Apellido: "Pérez"
   - Contraseña: "Password123"
   - Confirmar: "Password123"
3. Tap en "Registrarse"

### Verificaciones
- ✅ Debe mostrar "Registro exitoso"
- ✅ Datos guardados en Firebase bajo `clients/{uid}`
- ✅ Campos guardados: `nombre`, `apellido`, `rol: 'user'`, `fechaRegistro`
- ✅ Perfil debe tener `profileImage: null` inicialmente

### Resultado Esperado en Firebase
```json
{
  "clients": {
    "abc123def456": {
      "key": "abc123def456",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "",
      "rol": "user",
      "fechaRegistro": "16/01/2026",
      "password": "$2a$10$...",
      "profileImage": null
    }
  }
}
```

---

## 🧪 Escenario 2: Login y Acceso a Perfil de Usuario

### Pasos
1. En pantalla de Login, ingresa:
   - Identificador: "Juan Pérez" (o el correo si existe)
   - Contraseña: "Password123"
2. Tap en "Iniciar Sesión"
3. Tap en el ícono del menú (hamburguesa)
4. Desplázate hacia abajo
5. Tap en "Mi Perfil"

### Verificaciones
- ✅ Login exitoso, redirecciona a MainScreen
- ✅ Drawer abre correctamente
- ✅ "Mi Perfil" aparece en el menú
- ✅ UserProfileScreen carga sin errores

### En la Pantalla de Perfil
- ✅ Header azul (#d35400) visible en la parte superior
- ✅ Foto de perfil circular con icono de cámara
- ✅ Nombre completo: "Juan Pérez"
- ✅ Campos editables:
  - Nombre: "Juan"
  - Apellido: "Pérez"
  - Correo: (vacío o valor guardado)
- ✅ Campos de solo lectura:
  - Fecha de Registro: "16/01/2026"
  - Rol: "Usuario"
- ✅ Tarjetas de estadísticas (Reportes: 0, Hoy: 0, Semana: 0)
- ✅ Botón "Cerrar Sesión" al final

---

## 🧪 Escenario 3: Cargar Foto de Perfil

### Pasos
1. En pantalla de perfil, tap en el círculo de foto
2. Se abre selector de documentos
3. Selecciona una imagen de tu dispositivo (JPG, PNG)
4. La imagen se carga y muestra en la interfaz

### Verificaciones
- ✅ Icono de cámara desaparece
- ✅ Foto se muestra en círculo
- ✅ Mensaje: "Foto de perfil actualizada"
- ✅ En Firebase, `profileImage` contiene base64 completo
- ✅ Al recargar, foto persiste

### Resultado Esperado en Firebase
```json
{
  "profileImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

---

## 🧪 Escenario 4: Editar Datos de Perfil

### Pasos
1. En UserProfileScreen, tap en campo "Nombre"
2. Se abre Modal de edición
3. Cambia "Juan" por "Carlos"
4. Tap en "Guardar"

### Verificaciones
- ✅ Modal desliza desde abajo
- ✅ Campo con valor actual ("Juan")
- ✅ Se puede escribir nuevo valor
- ✅ Mensaje: "Datos actualizados correctamente"
- ✅ En Firebase, `nombre` actualizado a "Carlos"
- ✅ En interfaz, nombre actualizado sin recargar

### Repetir para
- Apellido
- Correo Electrónico

---

## 👨‍💼 Escenario 5: Login como Administrador

### Pre-requisito
- Tener usuario con `rol: 'admin'` en Firebase

### Pasos
1. En LoginScreen, ingresa credenciales de admin
2. Contraseña: (la contraseña del admin)
3. Tap "Iniciar Sesión"

### Verificaciones
- ✅ Login exitoso
- ✅ Redirecciona a AdminDashboard (no MainScreen)
- ✅ Drawer muestra opciones de admin:
  - Dashboard
  - Empleados registrados
  - Mi Perfil

---

## 👨‍💼 Escenario 6: Ver Lista de Usuarios (Admin)

### Pasos
1. Tap en ícono del menú (hamburguesa)
2. Tap en "Mi Perfil"

### Verificaciones
- ✅ AdminProfileScreen carga
- ✅ Header: "Panel de Administración"
- ✅ Barra de búsqueda funcional
- ✅ Tarjetas de estadísticas:
  - Total Usuarios (cuenta correcta)
  - Administradores (filtra por rol)
  - Operadores (otros roles)
- ✅ Lista de usuarios con tarjetas

### En Cada Tarjeta de Usuario
- ✅ Avatar (foto o icono)
- ✅ Nombre completo
- ✅ Badge "Admin" si aplica
- ✅ Correo electrónico
- ✅ Fecha de registro
- ✅ Botón "Cambiar" (cambiar contraseña)

---

## 👨‍💼 Escenario 7: Buscar Usuario (Admin)

### Pasos
1. En AdminProfileScreen, tap en barra de búsqueda
2. Escribe "Juan"
3. Observa cómo filtra

### Verificaciones
- ✅ Búsqueda por nombre funciona
- ✅ Búsqueda por apellido funciona
- ✅ Búsqueda por email funciona
- ✅ Búsqueda es insensible a mayúsculas/minúsculas
- ✅ Botón X limpia búsqueda
- ✅ Mensaje "No se encontraron usuarios" si no hay matches

---

## 👨‍💼 Escenario 8: Cambiar Contraseña de Usuario (Admin)

### Pasos
1. En AdminProfileScreen, ubica usuario "Juan Pérez"
2. Tap en botón "Cambiar"
3. Se abre Modal
4. Ingresa:
   - Nueva contraseña: "NuevaPass123"
   - Confirmar: "NuevaPass123"
5. Tap "Guardar Contraseña"

### Validaciones
- ❌ Si contraseña < 8 caracteres: "La contraseña debe tener al menos 8 caracteres"
- ❌ Si no coinciden: "Las contraseñas no coinciden"
- ❌ Si está vacío: "Ingresa una nueva contraseña"

### Verificaciones Exitosas
- ✅ Mensaje: "Contraseña actualizada para Juan Pérez"
- ✅ En Firebase, `password` hasheada correctamente
- ✅ Modal se cierra automáticamente
- ✅ El usuario "Juan Pérez" puede hacer login con nueva contraseña

### Verificar Persistencia
1. Logout del admin
2. Login con "Juan Pérez" y "NuevaPass123"
3. ✅ Debe funcionar correctamente

---

## 🔒 Escenario 9: Seguridad - Contraseña Hasheada

### Pasos
1. Como admin, cambia contraseña de un usuario
2. Abre Firebase Console
3. Ve a RTDB → clients → {usuario} → password

### Verificaciones
- ✅ Campo `password` NO contiene contraseña en texto plano
- ✅ Inicia con "$2a$10$" (formato bcrypt)
- ✅ Tiene longitud ~60 caracteres
- ✅ Es diferente cada vez que se cambia (debido al salt)

### Ejemplo correcto:
```
$2a$10$xN9oj0sKjd9KLjK0jL9x9O0j9K8j0K9j0j9K8K8K8K8K8K8K8K8K8K
```

---

## 🌐 Escenario 10: Logout y Limpieza

### Pasos
1. En UserProfileScreen o AdminProfileScreen
2. Tap en "Cerrar Sesión"
3. Confirma en alerta
4. Debería regresar a LoginScreen

### Verificaciones
- ✅ Contexto se limpia (isAdmin, registeredUser, etc.)
- ✅ Drawer desaparece
- ✅ Solo aparecen pantallas de Auth (Register, Login)
- ✅ Puede hacer login nuevamente sin problemas

---

## ⚠️ Escenarios de Error

### Intento de Editar con Campo Vacío
1. Tap en campo de nombre
2. Borra el contenido
3. Tap "Guardar"

**Resultado**: ✅ Debe mostrar error si validación existe

### Intento de Cambiar Contraseña con Menos de 8 Caracteres
1. Como admin, intenta cambiar contraseña
2. Ingresa "pass" (4 caracteres)
3. Tap "Guardar Contraseña"

**Resultado**: ✅ Muestra "La contraseña debe tener al menos 8 caracteres"

### Intento de Cambiar Contraseña con Campos que No Coinciden
1. Campo 1: "Password123"
2. Campo 2: "Password124"
3. Tap "Guardar Contraseña"

**Resultado**: ✅ Muestra "Las contraseñas no coinciden"

---

## 📊 Matriz de Pruebas

| Escenario | Acción | Resultado Esperado | Estado |
|-----------|--------|-------------------|--------|
| 1 | Registrar usuario | Datos guardados en Firebase | ⏳ Pendiente |
| 2 | Login y abrir perfil | Perfil carga correctamente | ⏳ Pendiente |
| 3 | Cargar foto | Imagen se muestra y persiste | ⏳ Pendiente |
| 4 | Editar nombre | Dato actualizado en Firebase | ⏳ Pendiente |
| 5 | Login admin | Redirecciona a AdminDashboard | ⏳ Pendiente |
| 6 | Ver lista usuarios | Todos los usuarios listados | ⏳ Pendiente |
| 7 | Buscar usuario | Filtrado funciona | ⏳ Pendiente |
| 8 | Cambiar contraseña | Password hasheada, usuario puede login | ⏳ Pendiente |
| 9 | Verificar hash | Password en formato bcrypt | ⏳ Pendiente |
| 10 | Logout | Contexto limpio, regresa a Login | ⏳ Pendiente |

---

## 📱 Checklist Final

### Antes de Deployar
- [ ] Todos los 10 escenarios pasaron
- [ ] No hay errores en consola
- [ ] Firebase RTDB actualiza en tiempo real
- [ ] Fotos se cargan sin lag
- [ ] Búsqueda es rápida (<100ms)
- [ ] Botones responden al tap
- [ ] Modales se abren/cierran suavemente
- [ ] Estilos visuales se ven profesionales

### Compatibilidad
- [ ] Probado en Android
- [ ] Probado en iOS (si es posible)
- [ ] Probado en web (si es aplicable)

### Performance
- [ ] Carga inicial < 3 segundos
- [ ] Búsqueda sin lag en lista de 100+ usuarios
- [ ] Cambio de foto sin freeze
- [ ] Modal no tiene jank al abrir

---

## 🚀 Próximas Pruebas

Después de validar funcionalidad básica:

1. **Pruebas de Carga**
   - 1000 usuarios en sistema
   - Búsqueda sigue siendo rápida?

2. **Pruebas de Imagen**
   - Imágenes grandes (>5MB)
   - Diferentes formatos (WebP, PNG, GIF)

3. **Pruebas de Red**
   - Conexión lenta
   - Conexión intermitente
   - Sin conexión

4. **Pruebas de Seguridad**
   - Intentar inyectar SQL
   - Intentar acceder a otra data
   - Tokens/autenticación

---

## 📝 Notas Importantes

- La aplicación actualmente está en: **http://localhost:8081** (Expo)
- QR Code activo para Expo Go
- Metro bundler compilando exitosamente
- No hay errores TypeScript
- Base de datos Firebase lista

### Comando para Recargar
- Presiona `r` en la terminal de Expo para recargar
- Presiona `a` para abrir en Android
- Presiona `w` para abrir en web

---

**Última actualización**: 16 de enero de 2026  
**Estado**: ✅ Aplicación lista para pruebas
