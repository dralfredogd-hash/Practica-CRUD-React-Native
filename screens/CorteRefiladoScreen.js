import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  useWindowDimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/ui/Header';
import ReportActions from '../components/ui/ReportActions';
import { saveReportToDB, generateExcelReport, validateTableRows } from '../utils/reportUtils';
import { REPORT_TYPES } from '../config/reportConfig';

export default function CorteRefiladoScreen() {
  const { palette } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const isLandscape = width > 768;
  
  const [semana, setSemana] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [maquina, setMaquina] = useState('');
  const [elaboro, setElaboro] = useState('');
  const [notas, setNotas] = useState('');
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rows, setRows] = useState([
    { id: 1, dia: '', producto: '', operador: '', med1: '', kg1: '', med2: '', kg2: '', med3: '', kg3: '', corte: '', laminado: '', impresion: '', paroMec: '', paroElect: '', paroEmp: '', paroOp: '', tiempo: '', std: '', horas: '' }
  ]);
  
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  
  const addRow = () => {
    const newId = Math.max(...rows.map(r => r.id)) + 1;
    setRows([...rows, { id: newId, dia: '', producto: '', operador: '', med1: '', kg1: '', med2: '', kg2: '', med3: '', kg3: '', corte: '', laminado: '', impresion: '', paroMec: '', paroElect: '', paroEmp: '', paroOp: '', tiempo: '', std: '', horas: '' }]);
  };
  
  const updateRow = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };
  
  const deleteRows = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar ${selectedIds.length} registro(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          setRows(rows.filter(row => !selectedIds.includes(row.id)));
          setSelectedIds([]);
        }}
      ]
    );
  };
  
  const clearForm = () => {
    Alert.alert(
      'Limpiar formulario',
      '¿Eliminar todos los datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', style: 'destructive', onPress: () => {
          setSemana('');
          setFechaDesde('');
          setFechaHasta('');
          setMaquina('');
          setElaboro('');
          setNotas('');
          setRows([{ id: 1, dia: '', producto: '', operador: '', med1: '', kg1: '', med2: '', kg2: '', med3: '', kg3: '', corte: '', laminado: '', impresion: '', paroMec: '', paroElect: '', paroEmp: '', paroOp: '', tiempo: '', std: '', horas: '' }]);
          setSelectedIds([]);
        }}
      ]
    );
  };
  
  const save = () => {
    const tableFields = ['dia', 'producto', 'operador', 'med1', 'kg1', 'med2', 'kg2', 'med3', 'kg3', 'corte', 'laminado', 'impresion', 'paroMec', 'paroElect', 'paroEmp', 'paroOp', 'tiempo', 'std', 'horas'];
    const validation = validateTableRows(rows, tableFields);

    if (!validation.isValid) {
      Alert.alert('Datos incompletos', validation.errorMessage);
      return;
    }

    Alert.alert('Éxito', 'Reporte guardado correctamente');
  };

  const handleSaveReport = async () => {
    try {
      const tableFields = ['dia', 'producto', 'operador', 'med1', 'kg1', 'med2', 'kg2', 'med3', 'kg3', 'corte', 'laminado', 'impresion', 'paroMec', 'paroElect', 'paroEmp', 'paroOp', 'tiempo', 'std', 'horas'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      await saveReportToDB(rows, REPORT_TYPES.CORTE_REFILADO);
    } catch (error) {
      throw new Error(error.message || 'Error al guardar el reporte');
    }
  };

  const handleGenerateExcel = async () => {
    try {
      const tableFields = ['dia', 'producto', 'operador', 'med1', 'kg1', 'med2', 'kg2', 'med3', 'kg3', 'corte', 'laminado', 'impresion', 'paroMec', 'paroElect', 'paroEmp', 'paroOp', 'tiempo', 'std', 'horas'];
      const validation = validateTableRows(rows, tableFields);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      return await generateExcelReport(rows, REPORT_TYPES.CORTE_REFILADO);
    } catch (error) {
      throw new Error(error.message || 'Error al generar Excel');
    }
  };

  const selectWeek = (week) => {
    setSemana(week);
    setShowWeekModal(false);
  };

  const resumen = useMemo(() => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    return days.map((d, i) => ({ 
      dia: d, 
      prod: '', 
      merma: '', 
      produc: '',
      id: i + 1 
    }));
  }, []);

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
        {/* Día */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="today" size={12} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Día</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.dia]} 
            value={item.dia} 
            onChangeText={(t) => updateRow(item.id, 'dia', t)} 
            placeholder="Lunes"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Producto */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="package-variant" size={12} color="#666" style={styles.cellIcon} />
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
        
        {/* Operador */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="engineering" size={12} color="#666" style={styles.cellIcon} />
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
        
        {/* Med 1 */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="straighten" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Med 1</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.med]} 
            value={item.med1} 
            onChangeText={(t) => updateRow(item.id, 'med1', t)} 
            placeholder="mm"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Kg 1 */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="scale" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Kg 1</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.kg]} 
            value={item.kg1} 
            onChangeText={(t) => updateRow(item.id, 'kg1', t)} 
            placeholder="0" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Med 2 */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="straighten" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Med 2</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.med]} 
            value={item.med2} 
            onChangeText={(t) => updateRow(item.id, 'med2', t)} 
            placeholder="mm"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Kg 2 */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="scale" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Kg 2</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.kg]} 
            value={item.kg2} 
            onChangeText={(t) => updateRow(item.id, 'kg2', t)} 
            placeholder="0" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Med 3 */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="straighten" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Med 3</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.med]} 
            value={item.med3} 
            onChangeText={(t) => updateRow(item.id, 'med3', t)} 
            placeholder="mm"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Kg 3 */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="scale" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Kg 3</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.kg]} 
            value={item.kg3} 
            onChangeText={(t) => updateRow(item.id, 'kg3', t)} 
            placeholder="0" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Corte */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="scissors-cutting" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Corte</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.corte} 
            onChangeText={(t) => updateRow(item.id, 'corte', t)} 
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Laminado */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="layers" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Laminado</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.laminado} 
            onChangeText={(t) => updateRow(item.id, 'laminado', t)} 
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Impresión */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="print" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Impresión</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.small]} 
            value={item.impresion} 
            onChangeText={(t) => updateRow(item.id, 'impresion', t)} 
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Paro Me */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="engine" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Me</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.paroMec} 
            onChangeText={(t) => updateRow(item.id, 'paroMec', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Paro Elect */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="bolt" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Elect</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.paroElect} 
            onChangeText={(t) => updateRow(item.id, 'paroElect', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Paro Emp */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Emp</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.paroEmp} 
            onChangeText={(t) => updateRow(item.id, 'paroEmp', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Paro Op */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="person-off" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Op</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.paro]} 
            value={item.paroOp} 
            onChangeText={(t) => updateRow(item.id, 'paroOp', t)} 
            placeholder="min"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Tiempo */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="timer" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Tiempo</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.time]} 
            value={item.tiempo} 
            onChangeText={(t) => updateRow(item.id, 'tiempo', t)} 
            placeholder="min" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Std */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="speed" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Std</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.time]} 
            value={item.std} 
            onChangeText={(t) => updateRow(item.id, 'std', t)} 
            placeholder="kg/h" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Horas */}
        <View style={styles.cellContainer}>
          <View style={styles.cellLabelContainer}>
            <Icon name="access-time" size={10} color="#666" style={styles.cellIcon} />
            <Text style={styles.cellLabel}>Horas</Text>
          </View>
          <TextInput 
            style={[styles.cellInput, styles.time]} 
            value={item.horas} 
            onChangeText={(t) => updateRow(item.id, 'horas', t)} 
            placeholder="hrs" 
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>
    </View>
  );

  // Estilos dinámicos que dependen de isLandscape
  const dynamicStyles = {
    mainContainer: {
      flexDirection: isLandscape ? 'row' : 'column',
      gap: 20,
      marginBottom: 24,
    },
    resumenCard: {
      width: isLandscape ? 280 : '100%',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Header 
        title="REPORTE DE PRODUCCIÓN" 
        subtitle="Corte y Refilado" 
        showLogo={false}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado del Reporte */}
        <View style={styles.reportHeader}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="scissors-cutting" size={32} color={palette.primary} />
          </View>
          <Text style={styles.reportTitle}>Reporte de Corte y Refilado</Text>
          <Text style={styles.reportSubtitle}>Registro detallado de mediciones, pesos y eficiencia</Text>
        </View>

        {/* Información General */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Icon name="date-range" size={20} color={palette.primary} />
            <Text style={styles.cardTitle}>Información Semanal</Text>
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

            {/* Fecha Desde */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha Desde *</Text>
              <View style={styles.inputContainer}>
                <Icon name="calendar-today" size={18} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={fechaDesde}
                  onChangeText={setFechaDesde}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Fecha Hasta */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha Hasta *</Text>
              <View style={styles.inputContainer}>
                <Icon name="event" size={18} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={fechaHasta}
                  onChangeText={setFechaHasta}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Máquina */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Máquina *</Text>
              <View style={styles.inputContainer}>
                <Icon name="settings" size={18} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={maquina}
                  onChangeText={setMaquina}
                  placeholder="Ej: CORTE-01"
                  placeholderTextColor="#999"
                />
              </View>
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

        {/* Contenedor Principal - Tabla y Resumen */}
        <View style={dynamicStyles.mainContainer}>
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
                        <Text style={styles.footerText}>Totales</Text>
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
                Agregar nuevo registro
              </Text>
            </TouchableOpacity>
          </View>

          {/* Panel de Resumen */}
          <View style={dynamicStyles.resumenCard}>
            <View style={styles.cardHeader}>
              <Icon name="summarize" size={20} color={palette.primary} />
              <Text style={styles.cardTitle}>Resumen Semanal</Text>
              <View style={styles.resumenBadge}>
                <Icon name="checklist" size={16} color="#fff" />
              </View>
            </View>
            
            <Text style={styles.resumenSubtitle}>Control de Producción</Text>
            
            <View style={styles.resumenTable}>
              <View style={styles.resumenHeader}>
                <Text style={[styles.resumenHeaderCell, { width: 90 }]}>Día</Text>
                <Text style={[styles.resumenHeaderCell, { width: 80 }]}>Prod (kg)</Text>
                <Text style={[styles.resumenHeaderCell, { width: 80 }]}>Merma (kg)</Text>
                <Text style={[styles.resumenHeaderCell, { width: 80 }]}>Product. (%)</Text>
              </View>
              
              {resumen.map((r) => (
                <View key={r.id} style={styles.resumenRow}>
                  <Text style={[styles.resumenCell, { width: 90, fontWeight: '600' }]}>{r.dia}</Text>
                  <TextInput 
                    style={[styles.resumenInput, { width: 80 }]} 
                    placeholder="0" 
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  <TextInput 
                    style={[styles.resumenInput, { width: 80 }]} 
                    placeholder="0" 
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  <TextInput 
                    style={[styles.resumenInput, { width: 80 }]} 
                    placeholder="%" 
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              ))}
              
              <View style={styles.resumenTotal}>
                <Text style={[styles.resumenTotalLabel, { width: 90 }]}>Total</Text>
                <TextInput 
                  style={[styles.resumenInput, styles.totalInput, { width: 80 }]} 
                  placeholder="Total" 
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <TextInput 
                  style={[styles.resumenInput, styles.totalInput, { width: 80 }]} 
                  placeholder="Total" 
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <TextInput 
                  style={[styles.resumenInput, styles.totalInput, { width: 80 }]} 
                  placeholder="%" 
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.resumenFooter}>
              <Icon name="info" size={16} color="#666" />
              <Text style={styles.resumenFooterText}>
                Eficiencia total = (Producción Total / STD Total) × 100
              </Text>
            </View>
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
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
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
  resumenBadge: {
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
  dia: {
    width: 70,
  },
  producto: {
    width: 120,
  },
  operador: {
    width: 100,
  },
  med: {
    width: 70,
  },
  kg: {
    width: 70,
  },
  small: {
    width: 80,
  },
  paro: {
    width: 50,
  },
  time: {
    width: 85,
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
  resumenSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  resumenTable: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resumenHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resumenHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
    textAlign: 'center',
  },
  resumenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resumenCell: {
    fontSize: 14,
    color: '#333',
  },
  resumenInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  resumenTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
  },
  resumenTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalInput: {
    backgroundColor: '#fff',
    borderColor: '#2980b9',
    fontWeight: '600',
  },
  resumenFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resumenFooterText: {
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