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
  Image,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  maquina: '',
  producto: '',
  operador: '',
  inicio: '',
  finales: '',
  resto: '',
  neto: '',
  bolseo: '',
  doblado: '',
  impresion: '',
  parosTipo: 'Meca',
  paros: '',
  // Nueva estructura separada por tipo de producto
  std_kg_h: '',
  horasEfectivas: '',
  total: '',
});

export default function BolseoScreen() {
  const { toolbarColor, palette } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const [fecha, setFecha] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dia, setDia] = useState('');
  const [turno, setTurno] = useState('');
  const [elabora, setElabora] = useState('');
  const [tipoLimpieza, setTipoLimpieza] = useState('');
  const [notas, setNotas] = useState('');
  const [showTurnoModal, setShowTurnoModal] = useState(false);

  const [rows, setRows] = useState(() => Array.from({ length: 6 }).map((_, i) => emptyRow(i + 1)));
  const [selectedIds, setSelectedIds] = useState([]);

  const turnos = [
    { id: '1', label: 'Turno 1 (06:00 - 14:00)' },
    { id: '2', label: 'Turno 2 (14:00 - 22:00)' },
    { id: '3', label: 'Turno 3 (22:00 - 06:00)' },
    { id: 'd', label: 'Día completo' },
  ];

  const updateRow = (id, key, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const addRow = () => setRows((prev) => {
    const nextId = prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1;
    return [...prev, emptyRow(nextId)];
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

  const save = () => {
    const tableFields = ['maquina', 'producto', 'operador', 'inicio', 'finales', 'resto', 'neto', 'bolseo', 'doblado', 'impresion', 'parosTipo', 'paros', 'std_kg_h', 'horasEfectivas', 'total'];
    const validation = validateTableRows(rows, tableFields);

    if (!validation.isValid) {
      Alert.alert('Datos incompletos', validation.errorMessage);
      return;
    }

    console.log({ fecha, dia, turno, elabora, tipoLimpieza, notas, rows });
    Alert.alert('✅ Guardado exitoso', 'El reporte de producción ha sido registrado correctamente.', [
      { text: 'Aceptar' }
    ]);
  };

  const handleSaveReport = async () => {
    try {
      const tableFields = ['maquina', 'producto', 'operador', 'inicio', 'finales', 'resto', 'neto', 'bolseo', 'doblado', 'impresion', 'parosTipo', 'paros', 'std_kg_h', 'horasEfectivas', 'total'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      await saveReportToDB(rows, REPORT_TYPES.BOLSEO);
    } catch (error) {
      throw new Error(error.message || 'Error al guardar el reporte');
    }
  };

  const handleGenerateExcel = async () => {
    try {
      const tableFields = ['maquina', 'producto', 'operador', 'inicio', 'finales', 'resto', 'neto', 'bolseo', 'doblado', 'impresion', 'parosTipo', 'paros', 'std_kg_h', 'horasEfectivas', 'total'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      return await generateExcelReport(rows, REPORT_TYPES.BOLSEO);
    } catch (error) {
      throw new Error(error.message || 'Error al generar Excel');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toLocaleDateString('es-MX');
      setFecha(dateStr);
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      setDia(days[selectedDate.getDay()]);
    }
  };

  const selectTurno = (turnoId) => {
    const selected = turnos.find(t => t.id === turnoId);
    setTurno(selected.label);
    setShowTurnoModal(false);
  };

  const clearForm = () => {
    Alert.alert('Limpiar formulario', '¿Desea limpiar todos los campos del reporte?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Limpiar', 
        style: 'destructive',
        onPress: () => {
          setFecha('');
          setDia('');
          setTurno('');
          setElabora('');
          setTipoLimpieza('');
          setNotas('');
          setRows(Array.from({ length: 6 }).map((_, i) => emptyRow(i + 1)));
          setSelectedIds([]);
        }
      },
    ]);
  };

  const renderRow = ({ item }) => (
    <View style={styles.rowContainer}>
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
        styles.tableRow, 
        selectedIds.includes(item.id) && { 
          borderWidth: 2, 
          borderColor: palette.primary,
          backgroundColor: `${palette.primary}08`
        }
      ]}>
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Máquina</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.maquina} 
            onChangeText={(t) => updateRow(item.id, 'maquina', t)} 
            placeholder="Ej: B01" 
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelMedium}>Producto</Text>
          <TextInput 
            style={[styles.cellInput, styles.medium]} 
            value={item.producto} 
            onChangeText={(t) => updateRow(item.id, 'producto', t)} 
            placeholder="Nombre producto"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelMedium}>Operador</Text>
          <TextInput 
            style={[styles.cellInput, styles.medium]} 
            value={item.operador} 
            onChangeText={(t) => updateRow(item.id, 'operador', t)} 
            placeholder="Nombre operador"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Inicio</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.inicio} 
            onChangeText={(t) => updateRow(item.id, 'inicio', t)} 
            placeholder="0" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Finales</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.finales} 
            onChangeText={(t) => updateRow(item.id, 'finales', t)} 
            placeholder="0" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Resto</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.resto} 
            onChangeText={(t) => updateRow(item.id, 'resto', t)} 
            placeholder="0" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Neto</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.neto} 
            onChangeText={(t) => updateRow(item.id, 'neto', t)} 
            placeholder="0" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Bolseo</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.bolseo} 
            onChangeText={(t) => updateRow(item.id, 'bolseo', t)} 
            placeholder="B" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Doblado</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.doblado} 
            onChangeText={(t) => updateRow(item.id, 'doblado', t)} 
            placeholder="D" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Impresión</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.impresion} 
            onChangeText={(t) => updateRow(item.id, 'impresion', t)} 
            placeholder="Imp" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Tipo Paro</Text>
          <View style={[styles.cellInput, styles.small, { paddingHorizontal: 0 }]}>
            <Picker
              selectedValue={item.parosTipo}
              onValueChange={(val) => updateRow(item.id, 'parosTipo', val)}
              style={styles.picker}
            >
              <Picker.Item label="Meca" value="Meca" />
              <Picker.Item label="Elect" value="Elect" />
              <Picker.Item label="Mat" value="Mat" />
              <Picker.Item label="Op" value="Op" />
              <Picker.Item label="Min" value="Min" />
            </Picker>
          </View>
        </View>

        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Paros (min)</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.paros} 
            onChangeText={(t) => updateRow(item.id, 'paros', t)} 
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>std (kg/h)</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.std_kg_h} 
            onChangeText={(t) => updateRow(item.id, 'std_kg_h', t)} 
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Horas efectivas</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.horasEfectivas} 
            onChangeText={(t) => updateRow(item.id, 'horasEfectivas', t)} 
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.cellContainer}>
          <Text style={styles.cellLabelSmall}>Total</Text>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.total} 
            onChangeText={(t) => updateRow(item.id, 'total', t)} 
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Header 
        title="REPORTE DE PRODUCCIÓN" 
        subtitle="Bolseo" 
        showLogo={false}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado del Reporte */}
        <View style={styles.reportHeader}>
          <View style={styles.headerIcon}>
            <Icon name="factory" size={32} color={palette.primary} />
          </View>
          <Text style={styles.reportTitle}>Registro de Producción</Text>
          <Text style={styles.reportSubtitle}>Complete todos los campos para el reporte diario</Text>
        </View>

        {/* Información General */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Icon name="info" size={20} color={palette.primary} />
            <Text style={styles.cardTitle}>Información General</Text>
          </View>
          
          <View style={styles.formGrid}>
            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha *</Text>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar-today" size={18} color="#666" style={styles.inputIcon} />
                <Text style={[styles.inputText, !fecha && { color: '#999' }]}>
                  {fecha || 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Día */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Día</Text>
              <View style={styles.inputContainer}>
                <Icon name="event" size={18} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={dia}
                  onChangeText={setDia}
                  placeholder="Ej: Lunes"
                  placeholderTextColor="#999"
                  editable={false}
                />
              </View>
            </View>

            {/* Turno */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Turno *</Text>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowTurnoModal(true)}
              >
                <Icon name="schedule" size={18} color="#666" style={styles.inputIcon} />
                <Text style={[styles.inputText, !turno && { color: '#999' }]}>
                  {turno || 'Seleccionar turno'}
                </Text>
                <Icon name="arrow-drop-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Elabora */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Elabora *</Text>
              <View style={styles.inputContainer}>
                <Icon name="person" size={18} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={elabora}
                  onChangeText={setElabora}
                  placeholder="Nombre del responsable"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Tipo de Limpieza */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de Limpieza</Text>
              <View style={styles.inputContainer}>
                <Icon name="clean-hands" size={18} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={tipoLimpieza}
                  onChangeText={setTipoLimpieza}
                  placeholder="Ej: Completa, Parcial"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Notas */}
            <View style={[styles.inputGroup, { gridColumn: '1 / span 2' }]}>
              <Text style={styles.inputLabel}>Notas / Observaciones</Text>
              <View style={[styles.inputContainer, { minHeight: 80 }]}>
                <Icon name="notes" size={18} color="#666" style={[styles.inputIcon, { marginTop: 12 }]} />
                <TextInput 
                  style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
                  value={notas}
                  onChangeText={setNotas}
                  placeholder="Observaciones adicionales..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Tabla de Producción */}
        <View style={styles.tableCard}>
          <View style={styles.cardHeader}>
            <Icon name="table-chart" size={20} color={palette.primary} />
            <Text style={styles.cardTitle}>Detalle de Producción</Text>
            <View style={styles.rowCountBadge}>
              <Icon name="grid-view" size={16} color="#fff" />
              <Text style={styles.rowCountText}>{rows.length} registros</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Encabezado de la tabla */}
              <View style={styles.tableHeader}>
                <View style={styles.checkboxHeader} />
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Máquina</Text>
                  <Icon name="settings" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.medium]}>
                  <Text style={styles.headerCellText}>Producto</Text>
                  <Icon name="inventory" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.medium]}>
                  <Text style={styles.headerCellText}>Operador</Text>
                  <Icon name="engineering" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Inicio</Text>
                  <Icon name="play-arrow" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Finales</Text>
                  <Icon name="stop" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Resto</Text>
                  <Icon name="restart-alt" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Neto</Text>
                  <Icon name="calculate" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Bolseo</Text>
                  <Icon name="package" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Doblado</Text>
                  <Icon name="folded-hands" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Impresión</Text>
                  <Icon name="print" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Tipo Paro</Text>
                  <Icon name="list" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Paros (min)</Text>
                  <Icon name="pause" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>std (kg/h)</Text>
                  <Icon name="trending-up" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Horas efectivas</Text>
                  <Icon name="schedule" size={14} color="#666" />
                </View>
                <View style={[styles.headerCell, styles.small]}>
                  <Text style={styles.headerCellText}>Total</Text>
                  <Icon name="summary" size={14} color="#666" />
                </View>
              </View>

              {/* Filas de la tabla */}
              <FlatList 
                data={rows}
                keyExtractor={(r) => r.id.toString()}
                renderItem={renderRow}
                scrollEnabled={false}
                nestedScrollEnabled={true}
              />
            </View>
          </ScrollView>
          
          {/* Botón Agregar Nueva Fila */}
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
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={clearForm}
          >
            <Icon name="delete-sweep" size={20} color="#666" />
            <Text style={styles.secondaryButtonText}>Limpiar todo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton, { opacity: selectedIds.length ? 1 : 0.5 }]} 
            onPress={deleteRows}
            disabled={!selectedIds.length}
          >
            <Icon name="delete" size={20} color="#fff" />
            <Text style={styles.dangerButtonText}>
              Eliminar ({selectedIds.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ReportActions
          onSave={handleSaveReport}
          onGenerateExcel={handleGenerateExcel}
          palette={palette}
        />
      </ScrollView>

      {/* Modal de selección de turno */}
      <Modal
        visible={showTurnoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTurnoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Turno</Text>
              <TouchableOpacity onPress={() => setShowTurnoModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {turnos.map((turnoItem) => (
              <TouchableOpacity
                key={turnoItem.id}
                style={[
                  styles.turnoOption,
                  turno === turnoItem.label && { backgroundColor: `${palette.primary}15` }
                ]}
                onPress={() => selectTurno(turnoItem.id)}
              >
                <Icon 
                  name="schedule" 
                  size={20} 
                  color={turno === turnoItem.label ? palette.primary : '#666'} 
                />
                <Text style={[
                  styles.turnoText,
                  turno === turnoItem.label && { color: palette.primary, fontWeight: '600' }
                ]}>
                  {turnoItem.label}
                </Text>
                {turno === turnoItem.label && (
                  <Icon name="check-circle" size={20} color={palette.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
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
    padding: 20,
    paddingBottom: 40,
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(41, 128, 185, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
  rowCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2980b9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rowCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
    minWidth: '45%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    minHeight: 50,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  checkboxHeader: {
    width: 40,
  },
  headerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
    marginBottom: 4,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
  },
  cellContainer: {
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cellLabelSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  cellLabelMedium: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
    width: 120,
  },
  cellInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    minWidth: 60,
  },
  small: {
    width: 70,
  },
  medium: {
    width: 130,
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    marginTop: 12,
  },
  addRowText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  turnoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  turnoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  picker: {
    height: 44,
    width: '100%',
    color: '#333',
  },
});