import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import Header from '../components/ui/Header';
import { ThemeContext } from '../context/ThemeContext';

export default function AdminDashboard() {
  const { palette } = useContext(ThemeContext);
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: palette.bg }]}> 
      <Header title="Panel de Administración" subtitle="Dashboard" />
      <View style={styles.card}>
        <Text style={styles.title}>Dashboard (próximamente)</Text>
        <Text>En esta sección se mostrarán métricas y estadísticas de los reportes semanales.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 }
});
