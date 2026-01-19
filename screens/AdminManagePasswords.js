import React, { useContext } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import Header from '../components/ui/Header';
import { ThemeContext } from '../context/ThemeContext';

export default function AdminManagePasswords() {
  const { palette } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}> 
      <Header title="Gestionar Contraseñas" subtitle="Resetear contraseñas de empleados" />

      <View style={styles.card}>
        <Text style={styles.label}>Buscar usuario por correo</Text>
        <TextInput placeholder="usuario@ejemplo.com" style={styles.input} />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Esta es una interfaz de ejemplo. Integrar con backend después.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginTop: 12 },
  label: { fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#1976D2', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  note: { marginTop: 12, color: '#666', fontSize: 12 }
});
