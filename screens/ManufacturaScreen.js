import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  useWindowDimensions,
  Modal,
} from 'react-native';
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
  operadores: '',
  producto: '',
  matEntrada: '',
  peso100: '',
  produccion: '',
  unidad: '',
  merma: '',
  std: '',
  tiempoEfectivo: '',
});

export default function ManufacturaScreen() {
  const { toolbarColor, palette } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [fecha, setFecha] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [elabora, setElabora] = useState('');
  const [notas, setNotas] = useState('');
  const [rows, setRows] = useState(Array.from({ length: 6 }).map((_, i) => emptyRow(i + 1)));
  const [selectedIds, setSelectedIds] = useState([]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFecha(selectedDate.toISOString().split('T')[0]);
    }
  };

  const addRow = () => {
    const newId = Math.max(...rows.map(r => r.id)) + 1;
    setRows([...rows, emptyRow(newId)]);
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const deleteRows = () => {
    if (selectedIds.length === 0) {
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

  const clearForm = () => {
    Alert.alert('Limpiar formulario', '¿Desea limpiar todos los campos del reporte?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpiar',
        style: 'destructive',
        onPress: () => {
          setFecha('');
          setElabora('');
          setNotas('');
          setRows(Array.from({ length: 6 }).map((_, i) => emptyRow(i + 1)));
          setSelectedIds([]);
        }
      },
    ]);
  };

  const handleSaveReport = async () => {
    try {
      const tableFields = ['operadores', 'producto', 'matEntrada', 'peso100', 'produccion', 'unidad', 'merma', 'std', 'tiempoEfectivo'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      await saveReportToDB(rows, REPORT_TYPES.MANUFACTURA);
    } catch (error) {
      throw new Error(error.message || 'Error al guardar el reporte');
    }
  };

  const handleGenerateExcel = async () => {
    try {
      const tableFields = ['operadores', 'producto', 'matEntrada', 'peso100', 'produccion', 'unidad', 'merma', 'std', 'tiempoEfectivo'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      return await generateExcelReport(rows, REPORT_TYPES.MANUFACTURA);
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
            <Text style={styles.inputLabel}>Operadores</Text>
            <View style={styles.inputContainer}>
              <Icon name="person" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.operadores}
                onChangeText={(t) => updateRow(item.id, 'operadores', t)}
                placeholder="Operador"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupSmall}>
            <Text style={styles.inputLabel}>Producto</Text>
            <View style={styles.inputContainer}>
              <Icon name="inventory" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.producto}
                onChangeText={(t) => updateRow(item.id, 'producto', t)}
                placeholder="Producto"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupTiny}>
            <Text style={styles.inputLabel}>MatEntrada(kg)</Text>
            <View style={styles.inputContainer}>
              <Icon name="scale" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.matEntrada}
                onChangeText={(t) => updateRow(item.id, 'matEntrada', t)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupTiny}>
            <Text style={styles.inputLabel}>Peso/100</Text>
            <View style={styles.inputContainer}>
              <Icon name="analytics" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.peso100}
                onChangeText={(t) => updateRow(item.id, 'peso100', t)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupTiny}>
            <Text style={styles.inputLabel}>Producción</Text>
            <View style={styles.inputContainer}>
              <Icon name="trending-up" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.produccion}
                onChangeText={(t) => updateRow(item.id, 'produccion', t)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupTiny}>
            <Text style={styles.inputLabel}>Unidad</Text>
            <View style={styles.inputContainer}>
              <Icon name="straighten" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.unidad}
                onChangeText={(t) => updateRow(item.id, 'unidad', t)}
                placeholder="UNIDAD"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupTiny}>
            <Text style={styles.inputLabel}>Merma</Text>
            <View style={styles.inputContainer}>
              <Icon name="layers" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.merma}
                onChangeText={(t) => updateRow(item.id, 'merma', t)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupTiny}>
            <Text style={styles.inputLabel}>Std</Text>
            <View style={styles.inputContainer}>
              <Icon name="assessment" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.std}
                onChangeText={(t) => updateRow(item.id, 'std', t)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroupTiny}>
            <Text style={styles.inputLabel}>Tiempo efectivo</Text>
            <View style={styles.inputContainer}>
              <Icon name="schedule" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={item.tiempoEfectivo}
                onChangeText={(t) => updateRow(item.id, 'tiempoEfectivo', t)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Header
        title="REPORTE DE MANUFACTURA"
        subtitle="Registro de Producción"
        showLogo={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información General */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Icon name="info" size={20} color={palette.primary} />
            <Text style={styles.cardTitle}>Información General</Text>
          </View>

          <View style={styles.formGrid}>
            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar-today" size={18} color="#666" style={styles.inputIcon} />
                <Text style={[styles.input, { color: fecha ? '#333' : '#999' }]}>
                  {fecha || 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Elaboró */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Elaboró</Text>
              <View style={styles.inputContainer}>
                <Icon name="person" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={elabora}
                  onChangeText={setElabora}
                  placeholder="Nombre"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Notas */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notas / Comentarios</Text>
            <View style={styles.inputContainer}>
              <Icon name="note" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={notas}
                onChangeText={setNotas}
                placeholder="Notas adicionales..."
                placeholderTextColor="#999"
                multiline
              />
            </View>
          </View>
        </View>

        {/* Tabla de Datos */}
        <View style={styles.tableCard}>
          <View style={styles.cardHeader}>
            <Icon name="table-chart" size={20} color={palette.primary} />
            <Text style={styles.cardTitle}>Detalle de Producción</Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(r) => r.id.toString()}
            renderItem={renderRow}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />

          <TouchableOpacity style={styles.addRowButton} onPress={addRow}>
            <Icon name="add-circle" size={20} color={palette.primary} />
            <Text style={[styles.addRowText, { color: palette.primary }]}>
              Agregar nueva fila
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={deleteRows}
            disabled={!selectedIds.length}
          >
            <Icon name="delete" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              Eliminar ({selectedIds.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearForm}
          >
            <Icon name="clear" size={20} color="#fff" />
            <Text style={styles.buttonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ReportActions
          onSave={handleSaveReport}
          onGenerateExcel={handleGenerateExcel}
          palette={palette}
        />
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(fecha || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#333',
    fontSize: 14,
  },
  rowContainerWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 12,
  },
  rowContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowTitle: {
    fontWeight: '700',
    fontSize: 12,
    color: '#333',
  },
  formRow: {
    flexDirection: 'column',
  },
  inputGroupSmall: {
    marginBottom: 8,
  },
  inputGroupTiny: {
    marginBottom: 8,
  },
  picker: {
    height: 44,
    width: '100%',
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 120,
    justifyContent: 'center',
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 12,
  },
  addRowText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  clearButton: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
