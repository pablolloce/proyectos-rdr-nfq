/**
 * ============================================================================
 *  GENERADOR DE OFERTAS RDR  ·  Apps Script (backend de la página /ofertas)
 * ============================================================================
 *
 *  Recibe los 11 datos de una oferta y genera, a partir de las plantillas,
 *  un Google Doc y un Google Sheet en la carpeta de ofertas, sustituyendo
 *  los marcadores {{DATO1}} … {{DATO11}}.
 *
 *  DESPLIEGUE (proyecto Apps Script INDEPENDIENTE, no ligado a ningún Excel):
 *   1. script.google.com -> Nuevo proyecto -> pegar este fichero entero.
 *   2. Implementar -> Nueva implementación -> Aplicación web:
 *        - Ejecutar como: YO (necesita permisos de Drive/Docs/Sheets sobre
 *          las plantillas y la carpeta).
 *        - Quién tiene acceso: Cualquier persona.
 *   3. Copiar la URL /exec en links.json -> "ofertasBackend".
 *   4. La primera ejecución pedirá autorizar Drive/Docs/Sheets.
 *
 *  API:
 *    GET  ?action=ping                  -> { ok:true }
 *    POST text/plain JSON:
 *      { action:'generarOferta', plantilla:'bbva-sa', datos:{ dato1..dato11 } }
 *      -> { ok:true, data:{ docUrl, sheetUrl, carpetaUrl } }
 * ============================================================================
 */

var CONFIG = {
  // Plantillas por tipo de oferta. 'bbva-mx' quedará aquí cuando exista.
  PLANTILLAS: {
    'bbva-sa': {
      nombre: 'Oferta BBVA SA',
      doc:   '1zSDmYSZRAbQ23Iiov66eSwDzsh2yq5Ff',
      sheet: '1o0EmAnxV8d9Lx40r2Mh1WsK__aD033AH'
    }
  },
  CARPETA_ID: '14SheFmcOITLPPuo-t5FEKacIKzRQOgFl'
};

function doGet(e)  { return _serve(e); }
function doPost(e) { return _serve(e); }

function _serve(e) {
  try {
    var p = {};
    if (e && e.parameter) for (var k in e.parameter) p[k] = e.parameter[k];
    if (e && e.postData && e.postData.contents) {
      var body = JSON.parse(e.postData.contents);
      for (var kb in body) p[kb] = body[kb];
    }
    var action = p.action || 'ping';
    var data;
    switch (action) {
      case 'ping': data = { ok: true, plantillas: Object.keys(CONFIG.PLANTILLAS) }; break;
      case 'generarOferta': data = generarOferta(p.plantilla, p.datos); break;
      default: throw new Error('Acción desconocida: ' + action);
    }
    return _json({ ok: true, action: action, data: data });
  } catch (err) {
    return _json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Genera el Doc + Sheet de una oferta sustituyendo {{DATO1}}..{{DATO11}}. */
function generarOferta(plantilla, datos) {
  var tpl = CONFIG.PLANTILLAS[plantilla || 'bbva-sa'];
  if (!tpl) throw new Error('Plantilla desconocida: ' + plantilla);
  if (!datos || !datos.dato1) throw new Error('Faltan los datos de la oferta.');

  var carpeta = DriveApp.getFolderById(CONFIG.CARPETA_ID);
  var base = String(datos.dato11 || datos.dato1);

  // ── Google Doc ──
  var docCopia = DriveApp.getFileById(tpl.doc).makeCopy('Oferta ' + base, carpeta);
  var doc = DocumentApp.openById(docCopia.getId());
  var partes = [doc.getBody(), doc.getHeader(), doc.getFooter()];
  for (var i = 1; i <= 11; i++) {
    var v = _valor(datos, i);
    for (var s = 0; s < partes.length; s++) {
      // replaceText usa regex: llaves escapadas para buscar el literal {{DATOi}}.
      if (partes[s]) partes[s].replaceText('\\{\\{DATO' + i + '\\}\\}', v);
    }
  }
  doc.saveAndClose();

  // ── Google Sheet ──
  var sheetCopia = DriveApp.getFileById(tpl.sheet).makeCopy('Oferta ' + base + ' (detalle)', carpeta);
  var ss = SpreadsheetApp.openById(sheetCopia.getId());
  for (var j = 1; j <= 11; j++) {
    // TextFinder busca el LITERAL (sin regex): las llaves no molestan.
    ss.createTextFinder('{{DATO' + j + '}}').matchEntireCell(false).replaceAllWith(_valor(datos, j));
  }
  SpreadsheetApp.flush();

  return {
    docUrl: 'https://docs.google.com/document/d/' + docCopia.getId() + '/edit',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/' + sheetCopia.getId() + '/edit',
    carpetaUrl: carpeta.getUrl()
  };
}

function _valor(datos, i) {
  var v = datos['dato' + i];
  return v === undefined || v === null ? '' : String(v);
}
