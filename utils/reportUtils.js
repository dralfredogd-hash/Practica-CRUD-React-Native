import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ref, set, push } from 'firebase/database';
import { rdb } from '../firebase';
import { REPORT_TABLE_NAMES } from '../config/reportConfig';
import XLSX from 'xlsx';

/**
 * Calcula resumen estadístico de un reporte
 */
export const calculateSummary = (rows, reportType) => {
  let filledRows;
  if (reportType === 'peletizado') {
    filledRows = rows.filter(r => r.producto && r.operadores);
  } else {
    filledRows = rows.filter(r => r.producto && r.operador);
  }

  if (filledRows.length === 0) return null;

  const summary = {
    tipo: reportType,
    fecha: new Date().toISOString().split('T')[0],
    cantidad_filas: filledRows.length,
    timestamp: Date.now(),
  };

  switch (reportType) {
    case 'fleje':
      summary.total_kg = filledRows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
      summary.total_rollos_buenos = filledRows.reduce((s, r) => s + (parseInt(r.rollosBuenos) || 0), 0);
      summary.total_rollos_malos = filledRows.reduce((s, r) => s + (parseInt(r.rollosMalos) || 0), 0);
      summary.promedio_kg = (summary.total_kg / filledRows.length).toFixed(2);
      summary.total_paro_mec = filledRows.reduce((s, r) => s + (parseFloat(r.paroMec) || 0), 0);
      summary.total_paro_elect = filledRows.reduce((s, r) => s + (parseFloat(r.paroElect) || 0), 0);
      break;

    case 'impresion':
    case 'laminado':
      summary.total_kg = filledRows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
      summary.total_metros = filledRows.reduce((s, r) => s + (parseFloat(r.metros) || 0), 0);
      summary.promedio_kg = (summary.total_kg / filledRows.length).toFixed(2);
      summary.total_paro_mec = filledRows.reduce((s, r) => s + (parseFloat(r.paroMec) || 0), 0);
      summary.total_paro_elect = filledRows.reduce((s, r) => s + (parseFloat(r.paroElect) || 0), 0);
      break;

    case 'bolseo':
      summary.total_kg = filledRows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
      summary.total_bolsas = filledRows.reduce((s, r) => s + (parseInt(r.bolsas) || 0), 0);
      summary.promedio_kg = (summary.total_kg / filledRows.length).toFixed(2);
      break;

    case 'peletizado':
      summary.total_kg = filledRows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
      summary.promedio_kg = (summary.total_kg / filledRows.length).toFixed(2);
      summary.total_paro_mec = filledRows.reduce((s, r) => s + (parseFloat(r.paroMec) || 0), 0);
      summary.total_paro_elect = filledRows.reduce((s, r) => s + (parseFloat(r.paroElect) || 0), 0);
      break;

    case 'diaria_doblado':
      summary.total_kg = filledRows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
      summary.total_piezas = filledRows.reduce((s, r) => s + (parseInt(r.piezas) || 0), 0);
      summary.promedio_kg = (summary.total_kg / filledRows.length).toFixed(2);
      break;

    case 'corte_refilado':
      summary.total_kg = filledRows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
      summary.total_metros = filledRows.reduce((s, r) => s + (parseFloat(r.metros) || 0), 0);
      summary.promedio_kg = (summary.total_kg / filledRows.length).toFixed(2);
      break;
  }

  return summary;
};

/**
 * Guarda reporte en Firebase
 */
export const saveReportToDB = async (rows, reportType) => {
  let filledRows;
  if (reportType === 'peletizado') {
    filledRows = rows.filter(r => r.producto && r.operadores);
  } else {
    filledRows = rows.filter(r => r.producto && r.operador);
  }

  if (filledRows.length === 0) {
    throw new Error('No hay filas válidas para guardar');
  }

  const summary = calculateSummary(rows, reportType);

  const resumenRef = push(ref(rdb, 'ResumenReportaje'));
  await set(resumenRef, summary);
  const summaryId = resumenRef.key;

  const tableName = REPORT_TABLE_NAMES[reportType];
  if (!tableName) {
    throw new Error(`Tipo de reporte desconocido: ${reportType}`);
  }

  const reportRef = push(ref(rdb, tableName));
  await set(reportRef, {
    fecha: summary.fecha,
    filas: filledRows,
    resumen_id: summaryId,
    timestamp: Date.now(),
  });

  return summaryId;
};

/**
 * Genera archivo Excel
 */
export const generateExcelReport = async (rows, reportType) => {
  let filledRows;
  if (reportType === 'peletizado') {
    filledRows = rows.filter(r => r.producto && r.operadores);
  } else {
    filledRows = rows.filter(r => r.producto && r.operador);
  }

  if (filledRows.length === 0) {
    throw new Error('No hay datos para generar Excel');
  }

  const summary = calculateSummary(rows, reportType);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(filledRows),
    'Detalle'
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      Object.entries(summary).map(([k, v]) => ({ Campo: k, Valor: v }))
    ),
    'Resumen'
  );

  const base64 = XLSX.write(workbook, {
    type: 'base64',
    bookType: 'xlsx',
  });

  const fileName = `${reportType}_${summary.fecha}_${Date.now()}.xlsx`;
  const fileUri = FileSystem.documentDirectory + fileName;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: 'base64',
  });

  // 🔎 Verificación de tamaño
  const info = await FileSystem.getInfoAsync(fileUri);
  console.log('Excel size:', info.size);

  return { uri: fileUri, name: fileName, success: true };
};

/**
 * Comparte archivo Excel
 */
export const shareExcelReport = async (filePath, fileName) => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartir no disponible en este dispositivo');
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: `Compartir ${fileName}`,
    UTI: 'com.microsoft.excel.xlsx',
  });
};

/**
 * Valida que si una fila tiene al menos UN campo lleno, TODOS los campos deben estar llenos
 * Excluye las filas completamente vacías
 * @param {Array} rows - Array de filas de datos
 * @param {Array} fieldNames - Array de nombres de campos a validar
 * @returns {Object} { isValid: boolean, errorMessage: string }
 */
export const validateTableRows = (rows, fieldNames) => {
  // Filtrar filas que no estén completamente vacías
  const filledRows = rows.filter(row => {
    const hasAnyValue = fieldNames.some(field => row[field] && row[field].toString().trim() !== '');
    return hasAnyValue;
  });

  // Validar que cada fila con datos tiene TODOS los campos llenos
  for (let i = 0; i < filledRows.length; i++) {
    const row = filledRows[i];
    const emptyFields = fieldNames.filter(field => !row[field] || row[field].toString().trim() === '');
    
    if (emptyFields.length > 0) {
      return {
        isValid: false,
        errorMessage: `Fila ${rows.indexOf(row) + 1}: Los siguientes campos son obligatorios: ${emptyFields.join(', ')}`
      };
    }
  }

  // Si no hay filas con datos
  if (filledRows.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Por favor complete al menos una fila en la tabla de Detalles de Producción'
    };
  }

  return { isValid: true, errorMessage: '' };
};
