import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Alert, useWindowDimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Text } from '@gluestack-ui/themed';
import Header from '../components/ui/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReportActions from '../components/ui/ReportActions';
import { saveReportToDB, generateExcelReport, validateTableRows } from '../utils/reportUtils';
import { REPORT_TYPES } from '../config/reportConfig';

const emptyRow = (id) => ({
  id,
  dia: '',
  turno: '',
  producto: '',
  operador: '',
  rollosBuenos: '',
  rollosMalos: '',
  kg: '',
  paroMec: '',
  paroElect: '',
});

export default function FlejeScreen() {
  const { toolbarColor, palette } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [rows, setRows] = useState(() => Array.from({ length: 4 }).map((_, i) => emptyRow(i + 1)));
  const [selectedIds, setSelectedIds] = useState([]);

  const updateRow = (id, key, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const addRow = () => setRows((p) => {
    const nextId = p.length ? Math.max(...p.map(r => r.id)) + 1 : 1;
    return [...p, emptyRow(nextId)];
  });

  const deleteRows = () => {
    if (!selectedIds || selectedIds.length === 0) {
      Alert.alert('Seleccione fila(s)', 'Por favor seleccione una o más filas a eliminar');
      return;
    }
    Alert.alert('Confirmar eliminación', `¿Eliminar ${selectedIds.length} fila(s)?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setRows((p) => p.filter((r) => !selectedIds.includes(r.id)));
          setSelectedIds([]);
        }
      },
    ]);
  };

  const clearSelectedRows = () => {
    if (!selectedIds || selectedIds.length === 0) {
      Alert.alert('Seleccione fila(s)', 'Por favor seleccione una o más filas a limpiar');
      return;
    }
    Alert.alert('Limpiar filas', `¿Limpiar campos en ${selectedIds.length} fila(s)?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpiar',
        style: 'destructive',
        onPress: () => {
          setRows((p) => p.map((r) => selectedIds.includes(r.id) ? emptyRow(r.id) : r));
          setSelectedIds([]);
        }
      },
    ]);
  };

  const clearAllRows = () => {
    Alert.alert('Limpiar todo', '¿Desea limpiar todos los campos del reporte?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpiar',
        style: 'destructive',
        onPress: () => {
          setRows(Array.from({ length: 4 }).map((_, i) => emptyRow(i + 1)));
          setSelectedIds([]);
        }
      },
    ]);
  };

  const handleSaveReport = async () => {
    try {
      const tableFields = ['dia', 'turno', 'producto', 'operador', 'rollosBuenos', 'rollosMalos', 'kg', 'paroMec', 'paroElect'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      await saveReportToDB(rows, REPORT_TYPES.FLEJE);
    } catch (error) {
      throw new Error(error.message || 'Error al guardar el reporte');
    }
  };

  const handleGenerateExcel = async () => {
    try {
      const tableFields = ['dia', 'turno', 'producto', 'operador', 'rollosBuenos', 'rollosMalos', 'kg', 'paroMec', 'paroElect'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      return await generateExcelReport(rows, REPORT_TYPES.FLEJE);
    } catch (error) {
      throw new Error(error.message || 'Error al generar Excel');
    }
  };

  const renderRow = ({ item }) => (
    <View style={styles.rowContainerWrapper}>
      <TouchableOpacity
        onPress={() => setSelectedIds((prev) =>
          prev.includes(item.id)
            ? prev.filter(id => id !== item.id)
            : [...prev, item.id]
        )}
        style={[
          styles.checkbox,
          selectedIds.includes(item.id) && { backgroundColor: palette.primary }
        ]}
      >
        {selectedIds.includes(item.id) && (
          <Icon name="check" size={18} color="#fff" />
        )}
      </TouchableOpacity>
      <View style={[
        styles.rowContainer,
        selectedIds.includes(item.id) && {
          borderWidth: 2,
          borderColor: palette.primary,
          backgroundColor: `${palette.primary}08`
        }
      ]}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowTitle}>Fila {item.id}</Text>
        </View>
        <View style={styles.formRow}>
        <View style={styles.inputGroupSmall}>
          <Text style={styles.inputLabel}>Día</Text>
          <View style={styles.inputContainer}>
            <Icon name="event" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={item.dia} onChangeText={(t) => updateRow(item.id, 'dia', t)} placeholder="Ej: Lunes" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupSmall}>
          <Text style={styles.inputLabel}>Turno</Text>
          <View style={styles.inputContainer}>
            <Icon name="schedule" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={item.turno} onChangeText={(t) => updateRow(item.id, 'turno', t)} placeholder="Ej: Diurno" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupSmall}>
          <Text style={styles.inputLabel}>Producto</Text>
          <View style={styles.inputContainer}>
            <Icon name="inventory" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={item.producto} onChangeText={(t) => updateRow(item.id, 'producto', t)} placeholder="Producto" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupSmall}>
          <Text style={styles.inputLabel}>Operador</Text>
          <View style={styles.inputContainer}>
            <Icon name="person" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={item.operador} onChangeText={(t) => updateRow(item.id, 'operador', t)} placeholder="Operador" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupTiny}>
          <Text style={styles.inputLabel}>Rollos buenos</Text>
          <View style={styles.inputContainer}>
            <Icon name="check-circle" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={String(item.rollosBuenos)} onChangeText={(t) => updateRow(item.id, 'rollosBuenos', t)} placeholder="0" keyboardType="numeric" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupTiny}>
          <Text style={styles.inputLabel}>Rollos malos</Text>
          <View style={styles.inputContainer}>
            <Icon name="cancel" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={String(item.rollosMalos)} onChangeText={(t) => updateRow(item.id, 'rollosMalos', t)} placeholder="0" keyboardType="numeric" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupTiny}>
          <Text style={styles.inputLabel}>Kg</Text>
          <View style={styles.inputContainer}>
            <Icon name="scale" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={String(item.kg)} onChangeText={(t) => updateRow(item.id, 'kg', t)} placeholder="0" keyboardType="numeric" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupTiny}>
          <Text style={styles.inputLabel}>Paro mec</Text>
          <View style={styles.inputContainer}>
            <Icon name="build" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={String(item.paroMec)} onChangeText={(t) => updateRow(item.id, 'paroMec', t)} placeholder="min" keyboardType="numeric" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.inputGroupTiny}>
          <Text style={styles.inputLabel}>Paro elect</Text>
          <View style={styles.inputContainer}>
            <Icon name="electrical-services" size={18} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} value={String(item.paroElect)} onChangeText={(t) => updateRow(item.id, 'paroElect', t)} placeholder="min" keyboardType="numeric" placeholderTextColor="#999" />
          </View>
        </View>
      </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Header title="Reporte Fleje" subtitle="Registro diario - Fleje" />
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        renderItem={renderRow}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        ListHeaderComponent={(
          <View>
            <View style={styles.topActions}>
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: palette.primary }]} onPress={addRow}>
                <Icon name="add" size={18} color="#fff" />
                <Text style={styles.addText}>Agregar fila</Text>
              </TouchableOpacity>
              {selectedIds.length > 0 && (
                <>
                  <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: '#d32f2f' }]} onPress={deleteRows}>
                    <Icon name="delete" size={18} color="#fff" />
                    <Text style={styles.deleteText}>Eliminar fila</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.clearBtn, { backgroundColor: '#ff9800' }]} onPress={clearSelectedRows}>
                    <Icon name="clear" size={18} color="#fff" />
                    <Text style={styles.clearText}>Limpiar fila</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={[styles.clearAllBtn, { backgroundColor: '#757575' }]} onPress={clearAllRows}>
                <Icon name="cleaning-services" size={18} color="#fff" />
                <Text style={styles.clearAllText}>Limpiar todo</Text>
              </TouchableOpacity>
            </View>
            <ReportActions
              onSave={handleSaveReport}
              onGenerateExcel={handleGenerateExcel}
              palette={palette}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  topActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10 },
  addText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10 },
  deleteText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10 },
  clearText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  clearAllBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10 },
  clearAllText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10 },
  saveText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowContainerWrapper: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  rowContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowTitle: { fontWeight: '700' },
  formRow: { flexDirection: 'column' },
  inputGroupSmall: { marginBottom: 8 },
  inputGroupTiny: { marginBottom: 8 },
  inputLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, color: '#333' },
});
