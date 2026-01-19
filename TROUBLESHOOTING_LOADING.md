## 🔧 TROUBLESHOOTING: Solución de Problemas

Si algo no funciona, aquí están las soluciones.

---

## ❌ Problema 1: El Loading NO Aparece

### **Síntomas:**
- Hago login pero no veo el modal de carga
- Presiono "Entrar" pero nada sucede en la pantalla

### **Causas Posibles:**
1. ❌ El componente no está importado
2. ❌ El archivo LoadingOverlay.js no existe
3. ❌ El estado `loading` no existe
4. ❌ `setLoading(true)` no se ejecuta

### **Soluciones:**

**Paso 1: Verificar Import**
```javascript
// En LoginScreen.js, línea 20
// Debe tener:
import LoadingOverlay from '../components/LoadingOverlay';

// Si no está, agrégalo
```

**Paso 2: Verificar Estado**
```javascript
// En LoginScreen.js, línea 29
// Debe tener:
const [loading, setLoading] = useState(false);

// Si no está, agrégalo
```

**Paso 3: Verificar setLoading**
```javascript
// En submit() function, línea 32
// Debe tener:
const submit = () => {
  if (!identifier.trim()) {
    Alert.alert('Error', 'Proporciona un correo electrónico o nombre');
    return;
  }

  setLoading(true);  // ← Esta línea DEBE estar

  (async () => {
    // ... resto del código
  })();
};

// Si no está, agrégalo después del Alert
```

**Paso 4: Verificar Componente en Return**
```javascript
// En return, antes del <ScrollView>
// Debe tener:
<LoadingOverlay 
  visible={loading} 
  message="Iniciando sesión..."
/>

// Si no está, agrégalo
```

**Paso 5: Verificar el Archivo**
```
¿Existe: components/LoadingOverlay.js?

Si NO existe:
- Créalo (ver instrucciones en RESUMEN_IMPLEMENTACION_LOADING.md)

Si EXISTE pero está vacío:
- Cópialo desde GUIA_ANIMACION_CARGA.md
```

---

## ❌ Problema 2: Error: "Module not found"

### **Síntomas:**
```
ERROR: Cannot find module '../components/LoadingOverlay'
ERROR: LoadingOverlay is not exported
```

### **Causas:**
- Archivo en ubicación equivocada
- Problema con export/import
- Ruta incorrecta

### **Soluciones:**

**Verifica la estructura:**
```
✅ Correcto:
components/
  └── LoadingOverlay.js

❌ Incorrecto:
components/
  └── ui/
      └── LoadingOverlay.js  ← Aquí NO va
```

**Verifica el export:**
```javascript
// Al final de LoadingOverlay.js DEBE estar:
export default function LoadingOverlay({ ... }) {
  // código
}

// NO esto:
function LoadingOverlay({ ... }) { }
// export LoadingOverlay (nombre equivocado)
```

**Verifica el import:**
```javascript
// ✅ Correcto:
import LoadingOverlay from '../components/LoadingOverlay';

// ❌ Incorrecto:
import LoadingOverlay from './LoadingOverlay';
import { LoadingOverlay } from '../components/LoadingOverlay';
import LoadingOverlay from '../components/LoadingOverlay.js'; // .js no necesario
```

---

## ❌ Problema 3: El Loading Aparece pero NO Se Cierra

### **Síntomas:**
- Modal de carga aparece
- Pero nunca desaparece
- App queda congelada

### **Causas:**
- `setLoading(false)` nunca se ejecuta
- Error en async que rompe el flujo
- Exception sin catch

### **Soluciones:**

**Opción 1: Agregar logs**
```javascript
const submit = () => {
  console.log('1. Iniciando submit');
  setLoading(true);
  console.log('2. Loading = true');

  (async () => {
    try {
      console.log('3. Inside async');
      // ... código ...
      console.log('4. Login exitoso');
    } catch (err) {
      console.log('5. Error:', err);
      setLoading(false);
      console.log('6. Loading = false (error)');
    }
  })();
};
```

**Opción 2: Agregar timeout de seguridad**
```javascript
const submit = () => {
  setLoading(true);
  
  // Timeout de 10 segundos como máximo
  const timeout = setTimeout(() => {
    console.warn('Login timeout');
    setLoading(false);
  }, 10000);

  (async () => {
    try {
      // ... código ...
      clearTimeout(timeout);
    } catch (err) {
      clearTimeout(timeout);
      setLoading(false);
    }
  })();
};
```

**Opción 3: Asegurar setLoading(false)**
```javascript
const submit = () => {
  setLoading(true);

  (async () => {
    try {
      // ... código de login ...
      if (!match) {
        setLoading(false);  // ← Debe estar
        Alert.alert('Error', 'Contraseña incorrecta');
        return;
      }

      // Si todo está bien
      setAuthenticated(true);
      setLoading(false);  // ← O automático al navegar
    } catch (err) {
      setLoading(false);  // ← SIEMPRE en catch
      Alert.alert('Error', err.message);
    }
  })();
};
```

---

## ❌ Problema 4: El Spinner NO Rota / NO Anima

### **Síntomas:**
- Modal aparece
- Pero el spinner está estático
- O está roto visualmente

### **Causas:**
- ActivityIndicator no está renderizando bien
- Problema de color
- Problema de tamaño

### **Soluciones:**

**Verificar ActivityIndicator:**
```javascript
// Debe estar en LoadingOverlay.js

// ✅ Correcto:
<ActivityIndicator 
  size="large" 
  color={palette.primary || '#d35400'} 
/>

// ❌ Si no ve:
- Verifica que `palette` viene del Context
- Verifica que el color es válido hex
- Prueba con color fijo: color="#d35400"
```

**Si sigue sin verse:**
```javascript
// Dentro de LoadingOverlay.js, agregar log:
console.log('Palette:', palette);
console.log('Color:', palette.primary || '#d35400');

// Si no imprime, Context no funciona
```

---

## ❌ Problema 5: El Loading Se Ve Feo / Mal Posicionado

### **Síntomas:**
- Modal aparece en lugar equivocado
- Texto no se ve
- Spinner muy pequeño/grande
- Colores raros

### **Causas:**
- Estilos incorrectos
- Problema con dimensiones de pantalla
- Tema no cargado

### **Soluciones:**

**Si está en lugar equivocado:**
```javascript
// En LoadingOverlay.js, línea ~67
const modalBox = styles.loadingBox;

// Debe tener:
loadingBox: {
  width: '75%',
  maxWidth: 300,
  borderRadius: 20,
  padding: 32,
  alignItems: 'center',
  // ... más propiedades
}

// Si falta algo, agrégalo
```

**Si el texto no se ve:**
```javascript
// Verificar color de texto
<Text style={[styles.message, { color: '#333' }]}>
  {message}
</Text>

// Si no funciona, prueba:
color: '#000'  // Negro total
```

**Si el spinner es muy pequeño/grande:**
```javascript
// Cambiar size en ActivityIndicator
<ActivityIndicator 
  size="large"  // 'small', 'large'
  color={palette.primary} 
/>
```

---

## ❌ Problema 6: El Loading Aparece pero Desaparece MUY Rápido

### **Síntomas:**
- El modal aparece y desaparece en <100ms
- No da tiempo a verlo

### **Causas:**
- setLoading(false) se ejecuta inmediatamente
- Delay de Firebase es muy corto
- Login local sin async

### **Soluciones:**

**Para AdminLoginScreen (local validation):**
```javascript
// Ya tiene setTimeout de 800ms
// Si aún es muy rápido, aumenta:

setTimeout(() => {
  if (username === 'Admin' && password === 'AdminInduspack') {
    // ...
  }
  setLoading(false);
}, 2000);  // 2 segundos en lugar de 800ms
```

**Para LoginScreen (Firebase):**
- Es normal que sea rápido (Firebase es rápido)
- Si quieres hacerlo más visible:

```javascript
// Agregar delay artificial (solo en dev):
await new Promise(resolve => setTimeout(resolve, 500));
```

---

## ❌ Problema 7: Error de Context

### **Síntomas:**
```
ERROR: Cannot read property 'palette' of undefined
ERROR: useContext is not a Hook
```

### **Causas:**
- LoadingOverlay no está dentro de ThemeProvider
- Import mal de useContext
- Context no inicializado

### **Soluciones:**

**Verificar App.js:**
```javascript
// Debe tener:
import { ThemeContext, ThemeProvider } from './context/ThemeContext';

// En el return:
<ThemeProvider>
  {/* Tu app aquí */}
</ThemeProvider>
```

**Verificar LoadingOverlay:**
```javascript
// Debe tener:
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// En función:
const { palette } = useContext(ThemeContext);
```

---

## ❌ Problema 8: Loading Aparece en Pantalla Equivocada

### **Síntomas:**
- Login funciona pero loading no aparece
- O aparece en MainScreen

### **Causas:**
- LoadingOverlay agregado en lugar equivocado
- En el JSX correcto pero fuera del return principal

### **Soluciones:**

**Estructura correcta:**
```javascript
const LoginScreen = () => {
  const [loading, setLoading] = useState(false);

  return (
    <KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="..." />  // ← Aquí
      <ScrollView>
        {/* Contenido principal */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
```

**Estructura incorrecta:**
```javascript
// ❌ Aquí NO:
<View>
  <LoadingOverlay visible={loading} message="..." />
</View>

// ❌ Tampoco aquí:
const submit = () => {
  return <LoadingOverlay ... />  // ❌ NO
};
```

---

## ❌ Problema 9: El AlertDialog Aparece Detrás del Loading

### **Síntomas:**
- Error de login
- Alert no es visible
- Modal de loading tapa el Alert

### **Causas:**
- setLoading(false) no se ejecuta antes del Alert
- Z-index incorrecto

### **Soluciones:**

**Agregar setLoading(false) ANTES del Alert:**
```javascript
// ✅ Correcto:
if (!match) {
  setLoading(false);  // Primero
  Alert.alert('Error', 'Contraseña incorrecta');  // Luego
  return;
}

// ❌ Incorrecto:
if (!match) {
  Alert.alert('Error', 'Contraseña incorrecta');
  setLoading(false);  // Tarde
  return;
}
```

---

## ❌ Problema 10: "Cannot find module 'react'"

### **Síntomas:**
```
ERROR: Cannot find module 'react'
ERROR: React is not defined
```

### **Causas:**
- React no está instalado
- Problema con node_modules
- Problema con dependencias

### **Soluciones:**

```bash
# En terminal, en la carpeta del proyecto:
npm install
# o
yarn install

# Si sigue sin funcionar:
rm -rf node_modules
npm install
```

---

## ✅ Problema: ¿Cómo Sé que está Funcionando?

### **Señales de que TODO está bien:**

```
✅ Login Screen:
   1. Abro app
   2. Intento login
   3. Veo modal con spinner
   4. Dura 1-3 segundos
   5. Navega a siguiente pantalla

✅ Admin Screen:
   1. Presiono "¿Eres administrador?"
   2. Intento login
   3. Veo modal con spinner
   4. Dura ~0.8 segundos
   5. Navega a AdminDashboard

✅ Error:
   1. Intento con credenciales malas
   2. Veo modal con spinner
   3. Se cierra
   4. Veo Alert de error
```

---

## 🆘 Si Nada Funciona

### **Pasos nucleares:**

1. **Verificar archivos existen:**
```bash
# ¿Existen estos archivos?
- components/LoadingOverlay.js
- screens/LoginScreen.js
- screens/AdminLoginScreen.js
```

2. **Verificar no hay errores:**
```
Abre "Metro bundler" o terminal
¿Ves errores rojos grandes?
¿Dice "ERROR"?
```

3. **Reiniciar todo:**
```bash
# En terminal:
npm start -- --reset-cache

# O:
rm -rf node_modules
npm install
npm start
```

4. **Verificar desde cero:**
- Copia exactamente el código de GUIA_ANIMACION_CARGA.md
- Pégalo sin cambios
- Prueba si funciona

---

## 📞 Preguntas Frecuentes

**P: ¿Por qué el loading se ve en lugar equivocado?**  
R: Debe estar dentro de KeyboardAvoidingView, antes del ScrollView.

**P: ¿Por qué no se ve el mensaje?**  
R: Verifica que el color del texto no es transparent, usa `color: '#333'`.

**P: ¿Por qué cuelga la app?**  
R: `setLoading(false)` no se ejecuta. Verifica el catch block.

**P: ¿Por qué aparece muy rápido?**  
R: En admin es normal, en login significa Firebase es rápido.

**P: ¿Cómo agrego un delay para probarlo?**  
R: Usa `setTimeout(() => setLoading(false), 2000)`.

---

## 🎯 Última Opción: Reset Total

Si nada funciona, reboot completo:

```javascript
// 1. Elimina LoadingOverlay.js
// 2. Deshacer cambios en LoginScreen.js
// 3. Deshacer cambios en AdminLoginScreen.js
// 4. Reinicia npm
// 5. Vuelve a empezar siguiendo INSTRUCCIONES_LOADING.md
```

---

**Recuerda:** 99% de los problemas vienen de:
1. ❌ Typos en imports
2. ❌ Estado no declarado
3. ❌ setLoading no ejecutado
4. ❌ Archivo en lugar equivocado

**Verifica esos 4 puntos primero.** ✅

---

¿Sigue sin funcionar? Revisa la estructura completa en ANALISIS_TECNICO_LOADING.md 📚
