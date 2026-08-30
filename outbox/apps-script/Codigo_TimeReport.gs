/**
 * ============================================================================
 *  TIME REPORT WEB  ·  Apps Script (backend de /timereport y /timereport-gestion)
 * ============================================================================
 *
 *  Almacén del Time Report del equipo: proyectos del trimestre, reparto de
 *  horas por quincena/persona/día, estados (Nivel 2) por quincena y personas
 *  bloqueadas. Los datos viven en un Google Sheet PROPIO de este script (se
 *  crea solo en el primer guardado; su ID queda en Propiedades del script).
 *
 *  DESPLIEGUE (proyecto Apps Script INDEPENDIENTE):
 *   1. script.google.com -> Nuevo proyecto -> pegar este fichero.
 *   2. Implementar -> Aplicación web (Ejecutar como YO, Cualquier persona).
 *   3. Pegar la URL /exec en links.json -> "timereportBackend".
 *
 *  API (GET query o POST text/plain JSON):
 *   ?action=snapshot&q=2026Q3 -> { proyectos, reparto, bloqueadas, qs }
 *   POST { action:'guardarProyectos', q, proyectos:[{id,sdatool,nombre,feature,horas,estados}] }
 *   POST { action:'guardarReparto',  q, desdeQuincena, filas:[{quincena,persona,proyectoId,dias}] }
 *        (borra las filas del Q con quincena >= desdeQuincena y escribe las nuevas;
 *         las filas de personas bloqueadas que se conservan YA vienen incluidas)
 *   POST { action:'guardarBloqueadas', q, personas:[nombres] }
 * ============================================================================
 */

var HOJAS = {
  // 'Personas' va al FINAL para no romper hojas creadas con la versión previa.
  proyectos: ['TR_Proyectos', ['Q', 'Id', 'SDATOOL', 'Nombre', 'Feature', 'Horas', 'Estados', 'Actualizado', 'Personas']],
  reparto: ['TR_Reparto', ['Q', 'Quincena', 'Persona', 'ProyectoId', 'Dias', 'Actualizado']],
  bloqueadas: ['TR_Bloqueadas', ['Q', 'Personas', 'Actualizado']]
};

function _ss() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('DATA_SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create('RDR TimeReport Web (datos)');
  props.setProperty('DATA_SPREADSHEET_ID', ss.getId());
  return ss;
}

function _hoja(clave) {
  var def = HOJAS[clave];
  var ss = _ss();
  var sh = ss.getSheetByName(def[0]);
  if (!sh) {
    sh = ss.insertSheet(def[0]);
    sh.getRange(1, 1, 1, def[1].length).setValues([def[1]]);
  }
  return sh;
}

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
      case 'ping': data = { ok: 1 }; break;
      case 'snapshot': data = getSnapshot(p.q); break;
      case 'guardarProyectos': data = guardarProyectos(p.q, p.proyectos); break;
      case 'guardarReparto': data = guardarReparto(p.q, p.desdeQuincena, p.filas); break;
      case 'guardarBloqueadas': data = guardarBloqueadas(p.q, p.personas); break;
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

function _filas(sh) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
}

function _q(v) { return String(v || '').replace(/[_\s]+/g, '').toUpperCase(); }

function getSnapshot(q) {
  q = _q(q);
  var qsSet = {};
  var proyectos = [];
  _filas(_hoja('proyectos')).forEach(function (r) {
    var rq = _q(r[0]);
    if (rq) qsSet[rq] = 1;
    if (rq !== q) return;
    var estados = {}, personasProy = [];
    try { estados = JSON.parse(r[6] || '{}'); } catch (e2) {}
    try { personasProy = JSON.parse(r[8] || '[]'); } catch (e5) {}
    proyectos.push({ id: String(r[1]), sdatool: String(r[2] || ''), nombre: String(r[3] || ''), feature: String(r[4] || ''), horas: Number(r[5]) || 0, estados: estados, personas: personasProy });
  });
  var reparto = [];
  _filas(_hoja('reparto')).forEach(function (r) {
    var rq = _q(r[0]);
    if (rq) qsSet[rq] = 1;
    if (rq !== q) return;
    var dias = {};
    try { dias = JSON.parse(r[4] || '{}'); } catch (e3) {}
    reparto.push({ quincena: Number(r[1]) || 0, persona: String(r[2] || ''), proyectoId: String(r[3] || ''), dias: dias });
  });
  var bloqueadas = [];
  _filas(_hoja('bloqueadas')).forEach(function (r) {
    if (_q(r[0]) !== q) return;
    try { bloqueadas = JSON.parse(r[1] || '[]'); } catch (e4) {}
  });
  return {
    generadoEn: new Date().toISOString(),
    q: q, proyectos: proyectos, reparto: reparto, bloqueadas: bloqueadas,
    qs: Object.keys(qsSet).sort()
  };
}

function _borrarDelQ(sh, q, filtroExtra) {
  var last = sh.getLastRow();
  if (last < 2) return;
  var vals = sh.getRange(2, 1, last - 1, 2).getValues();
  for (var i = vals.length - 1; i >= 0; i--) {
    if (_q(vals[i][0]) !== q) continue;
    if (filtroExtra && !filtroExtra(vals[i])) continue;
    sh.deleteRow(i + 2);
  }
}

function guardarProyectos(q, proyectos) {
  q = _q(q);
  if (!q) throw new Error('Falta el Q.');
  var sh = _hoja('proyectos');
  _borrarDelQ(sh, q);
  var now = new Date();
  var rows = (proyectos || []).map(function (p) {
    return [q, String(p.id), String(p.sdatool || ''), String(p.nombre || ''), String(p.feature || ''), Number(p.horas) || 0, JSON.stringify(p.estados || {}), now, JSON.stringify(p.personas || [])];
  });
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 9).setValues(rows);
  return { n: rows.length };
}

function guardarReparto(q, desdeQuincena, filas) {
  q = _q(q);
  if (!q) throw new Error('Falta el Q.');
  var desde = Number(desdeQuincena) || 1;
  var sh = _hoja('reparto');
  _borrarDelQ(sh, q, function (fila) { return (Number(fila[1]) || 0) >= desde; });
  var now = new Date();
  var rows = (filas || [])
    .filter(function (f) { return (Number(f.quincena) || 0) >= desde; })
    .map(function (f) {
      return [q, Number(f.quincena) || 0, String(f.persona || ''), String(f.proyectoId || ''), JSON.stringify(f.dias || {}), now];
    });
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 6).setValues(rows);
  return { n: rows.length, desde: desde };
}

function guardarBloqueadas(q, personas) {
  q = _q(q);
  if (!q) throw new Error('Falta el Q.');
  var sh = _hoja('bloqueadas');
  _borrarDelQ(sh, q);
  sh.getRange(sh.getLastRow() + 1, 1, 1, 3).setValues([[q, JSON.stringify(personas || []), new Date()]]);
  return { n: (personas || []).length };
}
