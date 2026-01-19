export const REPORT_TYPES = {
  FLEJE: 'fleje',
  IMPRESION: 'impresion',
  LAMINADO: 'laminado',
  BOLSEO: 'bolseo',
  MANUFACTURA: 'manufactura',
  PELETIZADO: 'peletizado',
  DIARIA_DOBLADO: 'diaria_doblado',
  CORTE_REFILADO: 'corte_refilado',
};

export const REPORT_LABELS = {
  fleje: 'Reporte Fleje',
  impresion: 'Reporte Impresión',
  laminado: 'Reporte Laminado',
  bolseo: 'Reporte Bolseo',
  manufactura: 'Reporte Manufactura',
  peletizado: 'Reporte Peletizado',
  diaria_doblado: 'Reporte Diaria Doblado',
  corte_refilado: 'Reporte Corte Refilado',
};

// Mapeo de tipos de reporte a tablas en la BD
export const REPORT_TABLE_NAMES = {
  fleje: 'FlejeDatos',
  impresion: 'ImpresionDatos',
  laminado: 'LaminadoDatos',
  bolseo: 'BolseoDatos',
  manufactura: 'ManufacturaDatos',
  peletizado: 'PeletizadoDatos',
  diaria_doblado: 'DiariaDobladoDatos',
  corte_refilado: 'CorteRefiladoDatos',
};

export const REPORT_FIELDS = {
  fleje: [
    'dia',
    'producto',
    'operador',
    'rollosBuenos',
    'rollosMalos',
    'kg',
    'paroMec',
    'paroElect',
  ],
  impresion: [
    'dia',
    'producto',
    'operador',
    'metros',
    'kg',
    'tono',
    'tonoCantidad',
    'mezcla8020',
    'paroMec',
    'paroElect',
  ],
  laminado: [
    'dia',
    'producto',
    'operador',
    'metros',
    'kg',
    'adhesivo',
    'acetatoEtilo',
    'paroMec',
    'paroElect',
  ],
  bolseo: [
    'dia',
    'producto',
    'operador',
    'bolsas',
    'kg',
    'paroMec',
  ],
  diaria_doblado: [
    'dia',
    'producto',
    'operador',
    'piezas',
    'kg',
    'paroMec',
  ],
  corte_refilado: [
    'dia',
    'producto',
    'operador',
    'metros',
    'kg',
    'paroMec',
  ],
};
