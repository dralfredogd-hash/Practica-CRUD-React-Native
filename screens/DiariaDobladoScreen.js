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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ReportActions from '../components/ui/ReportActions';
import { saveReportToDB, generateExcelReport, validateTableRows } from '../utils/reportUtils';
import { REPORT_TYPES } from '../config/reportConfig';

const emptyRow = (id) => ({ 
  id, 
  turno: '', 
  maq: '', 
  producto: '', 
  operador: '', 
  entradaMP: '', 
  merma: '', 
  prodKg: '', 
  paroMec: '', 
  paroElect: '', 
  faltaMaterial: '', 
  otro: '', 
  std: '', 
  total: '', 
  efectivas: '' 
});

export default function DiariaDobladoScreen() {
  const { toolbarColor, palette } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const [semana, setSemana] = useState('');
  const [fecha, setFecha] = useState('');
  const [elaboro, setElaboro] = useState('');
  const [notas, setNotas] = useState('');
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const [rows, setRows] = useState(() => Array.from({ length: 8 }).map((_, i) => emptyRow(i + 1)));
  const [selectedIds, setSelectedIds] = useState([]);

  const semanas = [
    'Semana 1',
    'Semana 2', 
    'Semana 3',
    'Semana 4',
  ];

  const diasSemana = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  const updateRow = (id, key, value) => setRows((p) => p.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  
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
  
  const save = () => { 
    const tableFields = ['turno', 'maq', 'producto', 'operador', 'entradaMP', 'merma', 'prodKg', 'paroMec', 'paroElect', 'faltaMaterial', 'otro', 'std', 'total', 'efectivas'];
    const validation = validateTableRows(rows, tableFields);

    if (!validation.isValid) {
      Alert.alert('Datos incompletos', validation.errorMessage);
      return;
    }

    console.log({ semana, fecha, elaboro, notas, rows }); 
    Alert.alert('✅ Guardado exitoso', 'El reporte diario de doblado ha sido registrado correctamente.', [
      { text: 'Aceptar' }
    ]);
  };

  const handleSaveReport = async () => {
    try {
      const tableFields = ['turno', 'maq', 'producto', 'operador', 'entradaMP', 'merma', 'prodKg', 'paroMec', 'paroElect', 'faltaMaterial', 'otro', 'std', 'total', 'efectivas'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      await saveReportToDB(rows, REPORT_TYPES.DIARIA_DOBLADO);
    } catch (error) {
      throw new Error(error.message || 'Error al guardar el reporte');
    }
  };

  const handleGenerateExcel = async () => {
    try {
      const tableFields = ['turno', 'maq', 'producto', 'operador', 'entradaMP', 'merma', 'prodKg', 'paroMec', 'paroElect', 'faltaMaterial', 'otro', 'std', 'total', 'efectivas'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      return await generateExcelReport(rows, REPORT_TYPES.DIARIA_DOBLADO);
    } catch (error) {
      throw new Error(error.message || 'Error al generar Excel');
    }
  };

  const clearForm = () => {
    Alert.alert('Limpiar formulario', '¿Desea limpiar todos los campos del reporte?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Limpiar', 
        style: 'destructive',
        onPress: () => {
          setSemana('');
          setFecha('');
          setElaboro('');
          setNotas('');
          setRows(Array.from({ length: 8 }).map((_, i) => emptyRow(i + 1)));
          setSelectedIds([]);
        }
      },
    ]);
  };

  const selectWeek = (week) => {
    setSemana(week);
    setShowWeekModal(false);
  };

  const handleDateSelect = (dayIndex) => {
    const today = new Date();
    const selectedDate = new Date();
    const diff = dayIndex - today.getDay();
    selectedDate.setDate(today.getDate() + diff);
    
    const dateStr = selectedDate.toLocaleDateString('es-MX');
    const diaNombre = diasSemana[dayIndex];
    
    setFecha(`${dateStr} - ${diaNombre}`);
    setShowDateModal(false);
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
          <View style={styles.cellLabelContainer}>
            <Icon name="schedule" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Turno</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.turno]} 
            value={item.turno} 
            onChangeText={(t) => updateRow(item.id, 'turno', t)} 
            placeholder="1, 2, 3"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="settings" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Máquina</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.maq]} 
            value={item.maq} 
            onChangeText={(t) => updateRow(item.id, 'maq', t)} 
            placeholder="Ej: D01"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="package-variant" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Producto</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.producto]} 
            value={item.producto} 
            onChangeText={(t) => updateRow(item.id, 'producto', t)} 
            placeholder="Producto"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="engineering" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Operador</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.operador]} 
            value={item.operador} 
            onChangeText={(t) => updateRow(item.id, 'operador', t)} 
            placeholder="Operador"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="input" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Entrada MP</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.num]} 
            value={item.entradaMP} 
            onChangeText={(t) => updateRow(item.id, 'entradaMP', t)} 
            placeholder="kg" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="trash-can" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Merma</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.num]} 
            value={item.merma} 
            onChangeText={(t) => updateRow(item.id, 'merma', t)} 
            placeholder="kg" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="output" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Prod. Kg</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.num]} 
            value={item.prodKg} 
            onChangeText={(t) => updateRow(item.id, 'prodKg', t)} 
            placeholder="kg" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="engine" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Paro Mec</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.paroMec} 
            onChangeText={(t) => updateRow(item.id, 'paroMec', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="bolt" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Paro Elect</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.paroElect} 
            onChangeText={(t) => updateRow(item.id, 'paroElect', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Falta Mat</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.faltaMaterial} 
            onChangeText={(t) => updateRow(item.id, 'faltaMaterial', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="person-off" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Otro</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.otro} 
            onChangeText={(t) => updateRow(item.id, 'otro', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="speed" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Std</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.std]} 
            value={item.std} 
            onChangeText={(t) => updateRow(item.id, 'std', t)} 
            placeholder="kg/h" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="calculate" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Total</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.std]} 
            value={item.total} 
            onChangeText={(t) => updateRow(item.id, 'total', t)} 
            placeholder="kg" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="check-circle" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Efectivas</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.std]} 
            value={item.efectivas} 
            onChangeText={(t) => updateRow(item.id, 'efectivas', t)} 
            placeholder="hrs" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Header 
        title="REPORTE DIARIO" 
        subtitle="Doblado" 
        showLogo={false}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado del Reporte */}
        <View style={styles.reportHeader}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="folded-hands" size={32} color={palette.primary} />
          </View>
          <Text style={styles.reportTitle}>Reporte Diario de Doblado</Text>
          <Text style={styles.reportSubtitle}>Registro de producción y eficiencia por turno</Text>
        </View>

        {/* Información General */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Icon name="today" size={20} color={palette.primary} />
            <Text style={styles.cardTitle}>Información del Reporte</Text>
          </View>
          
          <View style={styles.formGrid}>
            {/* Semana */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Semana *</Text>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowWeekModal(true)}
              >
                <Icon name="calendar-view-week" size={18} color="#666" style={styles.inputIcon} />
                <Text style={[styles.inputText, !semana && { color: '#999' }]}>
                  {semana || 'Seleccionar semana'}
                </Text>
                <Icon name="arrow-drop-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha *</Text>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowDateModal(true)}
              >
                <Icon name="calendar-today" size={18} color="#666" style={styles.inputIcon} />
                <Text style={[styles.inputText, !fecha && { color: '#999' }]}>
                  {fecha || 'Seleccionar fecha'}
                </Text>
                <Icon name="arrow-drop-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Elaboró */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Elaboró *</Text>
              <View style={styles.inputContainer}>
                <Icon name="person" size={18} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={elaboro}
                  onChangeText={setElaboro}
                  placeholder="Nombre del responsable"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Notas */}
            <View style={[styles.inputGroup, { width: '100%' }]}>
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
            <Text style={styles.cardTitle}>Producción por Turno</Text>
            <View style={styles.rowCountBadge}>
              <Icon name="grid-view" size={16} color="#fff" />
              <Text style={styles.rowCountText}>{rows.length} turnos</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.tableScrollContent}
          >
            <View>
              {/* ELIMINADO: Encabezado de la tabla completo */}
              
              {/* Solo filas de la tabla */}
              <FlatList 
                data={rows}
                keyExtractor={(r) => r.id.toString()}
                renderItem={renderRow}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                ListFooterComponent={
                  <View style={styles.tableFooter}>
                    <View style={styles.footerLabel}>
                      <Icon name="functions" size={16} color="#666" />
                      <Text style={styles.footerText}>Totales diarios</Text>
                    </View>
                    <Text style={styles.footerPlaceholder}>—</Text>
                  </View>
                }
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.addRowButton} onPress={addRow}>
            <Icon name="add-circle" size={20} color={palette.primary} />
            <Text style={[styles.addRowText, { color: palette.primary }]}>
              Agregar nuevo turno
            </Text>
          </TouchableOpacity>
        </View>

        {/* Indicadores de Eficiencia */}
        <View style={styles.metricsCard}>
          <View style={styles.cardHeader}>
            <Icon name="analytics" size={20} color={palette.primary} />
            <Text style={styles.cardTitle}>Indicadores de Eficiencia</Text>
            <View style={styles.metricsBadge}>
              <Icon name="trending-up" size={16} color="#fff" />
            </View>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                <Icon name="speed" size={24} color="#3498db" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Eficiencia Total</Text>
                <TextInput 
                  style={styles.metricInput}
                  placeholder="%"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                <Icon name="check-circle" size={24} color="#2ecc71" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Cumplimiento STD</Text>
                <TextInput 
                  style={styles.metricInput}
                  placeholder="%"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                <MaterialCommunityIcons name="scatter-plot" size={24} color="#9b59b6" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Merma %</Text>
                <TextInput 
                  style={styles.metricInput}
                  placeholder="%"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(241, 196, 15, 0.1)' }]}>
                <Icon name="timer" size={24} color="#f1c40f" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Tiempo Efectivo</Text>
                <TextInput 
                  style={styles.metricInput}
                  placeholder="hrs"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
          
          <View style={styles.metricsFooter}>
            <Icon name="info" size={16} color="#666" />
            <Text style={styles.metricsFooterText}>
              Eficiencia = (Producción Total / STD Total) × 100
            </Text>
          </View>
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

      {/* Modal de selección de semana */}
      <Modal
        visible={showWeekModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWeekModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Semana</Text>
              <TouchableOpacity onPress={() => setShowWeekModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {semanas.map((semanaItem) => (
              <TouchableOpacity
                key={semanaItem}
                style={[
                  styles.weekOption,
                  semana === semanaItem && { backgroundColor: `${palette.primary}15` }
                ]}
                onPress={() => selectWeek(semanaItem)}
              >
                <Icon 
                  name="calendar-view-week" 
                  size={20} 
                  color={semana === semanaItem ? palette.primary : '#666'} 
                />
                <Text style={[
                  styles.weekText,
                  semana === semanaItem && { color: palette.primary, fontWeight: '600' }
                ]}>
                  {semanaItem}
                </Text>
                {semana === semanaItem && (
                  <Icon name="check-circle" size={20} color={palette.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal de selección de fecha */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Día</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.daysGrid}>
              {diasSemana.map((dia, index) => {
                const today = new Date();
                const selectedDate = new Date();
                const diff = index - today.getDay();
                selectedDate.setDate(today.getDate() + diff);
                
                const dateStr = selectedDate.toLocaleDateString('es-MX');
                const fullDate = `${dateStr} - ${dia}`;
                const isToday = index === today.getDay();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayOption,
                      fecha === fullDate && { backgroundColor: `${palette.primary}15` }
                    ]}
                    onPress={() => handleDateSelect(index)}
                  >
                    <Text style={[
                      styles.dayName,
                      fecha === fullDate && { color: palette.primary, fontWeight: '600' }
                    ]}>
                      {dia}
                    </Text>
                    <Text style={styles.dayDate}>
                      {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
                    </Text>
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>Hoy</Text>
                      </View>
                    )}
                    {fecha === fullDate && (
                      <Icon name="check-circle" size={20} color={palette.primary} style={styles.dayCheck} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  metricsCard: {
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
    marginBottom: 16,
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
  metricsBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  inputGroup: {
    width: '48%',
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
  tableScrollContent: {
    paddingBottom: 10,
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
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cellIcon: {
    marginRight: 2,
  },
  cellLabel: {
    fontSize: 9,
    color: '#666',
    fontWeight: '600',
  },
  cellInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    minWidth: 50,
  },
  turno: {
    width: 70,
  },
  maq: {
    width: 80,
  },
  producto: {
    width: 140,
  },
  operador: {
    width: 120,
  },
  num: {
    width: 110,
  },
  paro: {
    width: 90,
  },
  std: {
    width: 90,
  },
  tableFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  footerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginLeft: 8,
  },
  footerPlaceholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
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
    marginTop: 16,
  },
  addRowText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  metricInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  metricsFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  metricsFooterText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
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
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayOption: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    position: 'relative',
  },
  dayName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dayDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  todayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#27ae60',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  dayCheck: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  weekOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  weekText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});