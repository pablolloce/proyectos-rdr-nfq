// Opcional: Pon aquí el ID de tu hoja si el script no está vinculado directamente
// const SHEET_ID = 'TU_ID_DE_LA_HOJA_AQUI'; 

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet(); // O SpreadsheetApp.openById(SHEET_ID)
}

// Función para peticiones GET (Cargar datos al inicio)
function doGet(e) {
  const ss = getSpreadsheet();
  
  // 1. Obtener Restaurantes
  const sheetRest = ss.getSheetByName('Restaurantes');
  const dataRest = sheetRest.getDataRange().getValues();
  dataRest.shift(); // Quitar cabeceras
  
  const restaurantes = dataRest.map(row => ({
    nombre: row[0],
    descCorta: row[1],
    carta: row[2],
    foto: row[3],
    descLarga: row[4]
  })).filter(r => r.nombre); // Filtrar filas vacías

  // 2. Obtener Semanas Válidas (Donde Festivo / Teletrabajo es 'N')
  const sheetSem = ss.getSheetByName('Semana');
  const dataSem = sheetSem.getDataRange().getDisplayValues(); // getDisplayValues para el formato DD/MM/YYYY
  dataSem.shift(); // Quitar cabeceras
  
  const semanas = dataSem
    .filter(row => row[1] === 'N')
    .map(row => row[0]);

  // Enviar respuesta JSON
  return ContentService.createTextOutput(JSON.stringify({
    restaurantes: restaurantes,
    semanas: semanas
  })).setMimeType(ContentService.MimeType.JSON);
}

// Función para peticiones POST (Guardar la elección del compañero)
function doPost(e) {
  try {
    const ss = getSpreadsheet();
    const sheetEquipo = ss.getSheetByName('Equipo');
    
    // Parsear los datos que vienen de la web
    const data = JSON.parse(e.postData.contents);
    
    // Preparar fila: Semana, Compañero, Elección 1, Elección 2, Taper/Glovo, No estoy
    const nuevaFila = [
      data.semana,
      data.nombre,
      data.eleccion1 || '',
      data.eleccion2 || '',
      data.taperGlovo ? 'Sí' : 'No',
      data.noEstoy ? 'Sí' : 'No'
    ];
    
    sheetEquipo.appendRow(nuevaFila);
    
    // Aquí puedes añadir llamadas a funciones extra que recalculen la pestaña "Semana",
    // aunque mi recomendación es que uses fórmulas como =CONTAR.SI.CONJUNTO() en el Excel para actualizar "Semana" automáticamente.
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Configuración de pre-vuelo (CORS) para GitHub Pages
function doOptions(e) {
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}