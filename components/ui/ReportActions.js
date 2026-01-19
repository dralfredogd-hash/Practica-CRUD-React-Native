import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { shareExcelReport } from '../../utils/reportUtils';

const ReportActions = ({ 
  onSave, 
  onGenerateExcel, 
  palette, 
  isLoading = false 
}) => {
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave();
      Alert.alert('✅ Éxito', 'Reporte guardado en la base de datos');
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'Error al guardar el reporte');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateExcel = async () => {
    try {
      setGenerating(true);
      const result = await onGenerateExcel();
      Alert.alert(
        '✅ Excel generado',
        `Archivo creado: ${result.name}\n\n¿Deseas compartirlo?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Compartir',
            onPress: async () => {
              await shareExcelReport(result.uri, result.name);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'Error al generar Excel');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={handleSave}
        disabled={saving || isLoading}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon name="cloud-upload" size={18} color="#fff" />
            <Text style={styles.buttonText}>Guardar Reporte</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2196F3' }]}
        onPress={handleGenerateExcel}
        disabled={generating || isLoading}
      >
        {generating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon name="file-download" size={18} color="#fff" />
            <Text style={styles.buttonText}>Generar Excel</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
};

export default ReportActions;
