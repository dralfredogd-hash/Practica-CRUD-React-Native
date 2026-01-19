import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * LoadingOverlay Component
 * 
 * Un componente de carga elegante y personalizable para mostrar 
 * durante operaciones asincrónicas (login, registro, etc.)
 * 
 * Props:
 * - visible: boolean - Controla si el modal está visible
 * - message: string - Mensaje a mostrar (ej: "Iniciando sesión...")
 * - variant: 'default' | 'minimal' - Estilo del componente
 */

export default function LoadingOverlay({ 
  visible = false, 
  message = 'Por favor espera...',
  variant = 'default'
}) {
  const { palette } = useContext(ThemeContext);

  if (variant === 'minimal') {
    // Versión minimalista - solo spinner
    return (
      <Modal 
        visible={visible} 
        transparent 
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.container}>
          <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
          <ActivityIndicator 
            size="large" 
            color={palette.primary || '#d35400'} 
            style={styles.spinner}
          />
        </View>
      </Modal>
    );
  }

  // Versión default - spinner + mensaje
  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
        
        <View style={[styles.loadingBox, { backgroundColor: '#fff' }]}>
          {/* Spinner animado */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator 
              size="large" 
              color={palette.primary || '#d35400'} 
            />
          </View>
          
          {/* Mensaje */}
          <Text style={[styles.message, { color: '#333' }]}>
            {message}
          </Text>
          
          {/* Línea de carga animada (opcional) */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { backgroundColor: palette.primary || '#d35400' }
              ]} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingBox: {
    width: '75%',
    maxWidth: 300,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  spinnerContainer: {
    marginBottom: 24,
  },
  spinner: {
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    // La animación se añade dinámicamente si se requiere
  },
});
