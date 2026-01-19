#!/usr/bin/env node

/**
 * Script para generar hash bcrypt para administradores
 * Uso: node generate-admin-hash.js
 * 
 * Este script ayuda a generar hashes seguros para las credenciales
 * de administradores que se guardarán en Firebase.
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

// Crear interfaz de lectura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n');
console.log('════════════════════════════════════════════════════════════');
console.log('    🔐 GENERADOR DE HASH BCRYPT PARA ADMINISTRADORES');
console.log('════════════════════════════════════════════════════════════');
console.log('\n');

// Solicitar información
rl.question('📝 Ingresa el USERNAME del administrador: ', (username) => {
  rl.question('🔒 Ingresa la CONTRASEÑA del administrador: ', (password) => {
    rl.question('👤 Ingresa el NOMBRE del administrador (ej: "Juan Pérez"): ', (nombre) => {
      rl.question('📧 Ingresa el EMAIL (ej: "admin@induspack.com"): ', (email) => {
        
        // Validar inputs
        if (!username.trim() || !password.trim()) {
          console.log('\n❌ Username y contraseña no pueden estar vacíos');
          rl.close();
          process.exit(1);
        }

        console.log('\n⏳ Generando hash bcrypt (esto puede tardar unos segundos)...\n');

        // Generar hash
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            console.log('❌ Error al generar hash:', err.message);
            rl.close();
            process.exit(1);
          }

          // Mostrar resultados
          const now = new Date().toISOString();
          
          console.log('════════════════════════════════════════════════════════════');
          console.log('✅ HASH GENERADO EXITOSAMENTE');
          console.log('════════════════════════════════════════════════════════════\n');

          console.log('📋 DATOS DEL ADMINISTRADOR:\n');
          console.log(`   Username:  ${username}`);
          console.log(`   Nombre:    ${nombre}`);
          console.log(`   Email:     ${email}`);
          console.log(`   CreatedAt: ${now}`);

          console.log('\n🔐 CREDENCIAL HASHEADA:\n');
          console.log(`   Hash bcrypt: ${hash}\n`);

          console.log('════════════════════════════════════════════════════════════');
          console.log('📌 INSTRUCCIONES PARA FIREBASE:');
          console.log('════════════════════════════════════════════════════════════\n');

          console.log('1. Ve a Firebase Console → Realtime Database → Data');
          console.log('2. Crea/Selecciona la rama "admins"');
          console.log('3. Haz clic en + para agregar un nuevo registro');
          console.log('4. Usa este JSON como estructura:\n');

          const adminRecord = {
            username: username,
            password: hash,
            nombre: nombre || username,
            email: email || 'admin@induspack.com',
            createdAt: now,
            rol: 'admin',
            activo: true
          };

          console.log(JSON.stringify(adminRecord, null, 2));

          console.log('\n5. Copia cada valor exactamente como aparece arriba');
          console.log('6. ¡Hecho! El administrador ya puede hacer login\n');

          console.log('════════════════════════════════════════════════════════════');
          console.log('🧪 PRUEBAS:\n');
          console.log(`   Username en login: ${username}`);
          console.log(`   Contraseña en login: ${password}`);
          console.log('\n   El hash se verifica automáticamente en la app\n');

          console.log('════════════════════════════════════════════════════════════');
          console.log('⚠️  NOTAS IMPORTANTES:');
          console.log('════════════════════════════════════════════════════════════\n');
          console.log('✓ Nunca compartas el username o contraseña');
          console.log('✓ El hash es irreversible (seguro compartir)');
          console.log('✓ Cambia contraseñas cada 3-6 meses');
          console.log('✓ Usa contraseñas fuertes (16+ caracteres, variados)');
          console.log('✓ Este script usa bcrypt rounds: 10 (estándar seguro)\n');

          console.log('════════════════════════════════════════════════════════════\n');

          rl.close();
          process.exit(0);
        });
      });
    });
  });
});

// Manejar Ctrl+C
rl.on('close', () => {
  if (!process.exitCode) {
    process.exit(0);
  }
});
