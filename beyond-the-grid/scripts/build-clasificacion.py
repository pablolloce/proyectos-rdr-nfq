#!/usr/bin/env python3
"""Genera public/recursos/clasificacion-rdr.json.

Cruza cuatro fuentes:
  - data/clasificacion-procesos-rdr.html  (clasificación oficial: 91 procesos, 8 categorías)
  - public/recursos/procesos-rdr-data.json (inventario, cadenas, listeners, publicaciones)
  - data/cadenas-rdr-v157.md               (texto extraído de Cadenas_RDR_v157.pptx;
                                            agrupaciones por diapositiva — ORIENTATIVO)

El eje del explorador son los 91 procesos del inventario. Cada proceso agrega sus
cadenas Control-M, sus listeners online, sus colas de infraestructura y sus
workflows de publicación (la publicación es información del proceso, no una
clasificación). Lo que no encaja en ningún proceso va al "cajón desastre".
"""
import html as H
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_HTML = ROOT / "data" / "clasificacion-procesos-rdr.html"
SRC_PPTX = ROOT / "data" / "cadenas-rdr-v157.md"
SRC_DATA = ROOT / "public" / "recursos" / "procesos-rdr-data.json"
OUT = ROOT / "public" / "recursos" / "clasificacion-rdr.json"

# Claves estables por categoría oficial (el emoji/nombre viene del HTML fuente).
CAT_KEYS = {
    "Extracciones (fichero)": "extracciones",
    "Cargadores Excel/CSV": "cargadores",
    "Cargas de servicios externos": "cargas-externas",
    "Conciliaciones": "conciliaciones",
    "Gestión y operación": "gestion",
    "Handler ESB (petición/respuesta)": "handler-esb",
    "Alta/Setup de entidades (API)": "alta-setup",
    "Recepción mensajes externos (MQ)": "recepcion-mq",
}
ONLINE_CATS = {"handler-esb", "alta-setup", "recepcion-mq"}

# Entidad de cola KYRS.RDR.<ENTIDAD>.<ACCION> → servicio ESB dueño.
QUEUE_ENTITY_PID = {
    "CALENDAR": "P-077", "CONFIRMATIONS": "P-078", "PARTY": "P-079",
    "DEALMANDATES": "P-080", "DEALTYPES": "P-081", "DICTIONARY": "P-082",
    "AGREEMENT": "P-083", "COUNTRY": "P-084", "PORTFOLIO": "P-085",
    "SECURITIES": "P-086", "SETTLEMENT": "P-087",
    "CONTACT": "P-088", "MODCONTACT": "P-088",
    "PARTYSETUP": "P-089", "SISETUP": "P-090", "MODSDI": "P-090",
    "ALERT_SSI": "P-090",
}


def strip_tags(s):
    return re.sub(r"\s+", " ", H.unescape(re.sub("<[^>]+>", " ", s))).strip()


def parse_clasificacion():
    body = SRC_HTML.read_text(encoding="utf-8")
    cats, procesos = [], []
    pat = re.compile(
        r'<h2 class="cat-header" style="border-left:4px solid (#[0-9a-f]+)">(.*?)'
        r'<span class="cat-desc">(.*?)</span></h2><table>(.*?)</table>',
        re.S,
    )
    for m in pat.finditer(body):
        color, title_html, desc, table = m.groups()
        title = strip_tags(title_html)
        emoji, rest = title.split(" ", 1)
        nombre = re.sub(r"\s*\(\d+\)\s*$", "", rest).strip()
        key = CAT_KEYS[nombre]
        cats.append({
            "key": key,
            "nombre": nombre,
            "emoji": emoji,
            "color": color,
            "desc": strip_tags(desc),
            "eje": "ONLINE" if key in ONLINE_CATS else "BATCH",
        })
        ths = [strip_tags(t).lower() for t in re.findall(r"<th>(.*?)</th>", table)]
        for row in re.finditer(r"<tr>(.*?)</tr>", table, re.S):
            tds = re.findall(r"<td[^>]*>(.*?)</td>", row.group(1), re.S)
            if not tds or not strip_tags(tds[0]).startswith("P-"):
                continue
            rec = dict(zip(ths, (strip_tags(t) for t in tds)))
            procesos.append({
                "id": rec["id"],
                "categoria": key,
                "colasDoc": rec.get("cola jms (listener)", ""),
                "wikiRef": rec.get("ref. wiki", ""),
            })
    return cats, procesos


def split_csv(s):
    return [x.strip() for x in (s or "").split(",") if x.strip()]


def main():
    data = json.loads(SRC_DATA.read_text(encoding="utf-8"))
    cats, cls = parse_clasificacion()
    cls_by_id = {c["id"]: c for c in cls}
    inv = {i["ID"]: i for i in data["inventory"]}
    assert set(cls_by_id) == set(inv), "IDs de clasificación e inventario no coinciden"

    chain2pid = {}
    for pid, i in inv.items():
        for c in split_csv(i["CADENAS_CONTROLM"]):
            chain2pid[c] = pid

    ev2pid = {}
    for pid, i in inv.items():
        for e in split_csv(i.get("EVENTOS_JMS", "")):
            ev2pid[e] = pid

    # ---- listeners online por proceso + cajón de eventos de plataforma
    listeners = defaultdict(list)
    listener_queues = {}
    cajon_eventos = []
    assembly_rows = []
    for o in data["online"]:
        ev = (o.get("EVENTO_GS") or "").strip()
        nombre = (o.get("NOMBRE") or "").strip()
        colas = split_csv(o.get("COLA_ESCUCHA", ""))
        if o.get("TIPO_ENTRADA") == "COLA_ASSEMBLY":
            assembly_rows.append(o)
            continue
        pid = ev2pid.get(ev) or ev2pid.get(nombre)
        if pid:
            listeners[pid].append(nombre)
            for q in colas:
                listener_queues[q] = pid
        else:
            cajon_eventos.append({
                "nombre": nombre,
                "clase": o.get("CLASE_EVENTO", ""),
                "tipoEntrada": o.get("TIPO_ENTRADA", ""),
            })

    # ---- colas de infraestructura (assembly): por cola exacta o entidad KYRS
    colas_infra = defaultdict(list)
    cajon_colas = []
    kyrs = re.compile(r"^KYRS\.RDR\.(?:AP\.)?([A-Z_]+)\.")
    for o in assembly_rows:
        q = (o.get("COLA_ESCUCHA") or o.get("NOMBRE") or "").strip()
        pid = listener_queues.get(q)
        if not pid:
            m = kyrs.match(q)
            if m:
                pid = QUEUE_ENTITY_PID.get(m.group(1))
        if pid:
            colas_infra[pid].append(q)
        else:
            cajon_colas.append(q)

    # ---- publicación: información del proceso (no clasificación)
    publicacion = defaultdict(list)
    for p in data["publishing"]:
        pid = next((k for k, i in inv.items()
                    if i["NOMBRE_NATURAL"] == p.get("NOMBRE_NATURAL")), None)
        if pid:
            publicacion[pid].append(p["WORKFLOW"])
        # (todas las 71 casan por nombre; si algo dejara de casar, iría al cajón)

    # ---- hints de la PPTX: cadenas dibujadas en la misma diapositiva → procesos
    #      relacionados. ORIENTATIVO: la fuente no es 100 % fiable.
    slide_groups = []
    if SRC_PPTX.exists():
        chains = set(chain2pid)
        current = set()
        for line in SRC_PPTX.read_text(encoding="utf-8").splitlines():
            if line.startswith("<!-- Slide number:"):
                if current:
                    slide_groups.append(current)
                current = set()
                continue
            tok = line.strip()
            if tok in chains:
                current.add(chain2pid[tok])
        if current:
            slide_groups.append(current)
    relacionados = defaultdict(set)
    for group in slide_groups:
        if 1 < len(group) <= 8:  # diapositivas-mosaico grandes = señal demasiado difusa
            for pid in group:
                relacionados[pid] |= group - {pid}

    # ---- ensamblado final
    procesos = []
    for pid in sorted(inv):
        i, c = inv[pid], cls_by_id[pid]
        procesos.append({
            "id": pid,
            "nombre": i["NOMBRE_NATURAL"],
            "tipo": i["TIPO"],
            "categoria": c["categoria"],
            "descripcion": i.get("DESCRIPCION", ""),
            "sistemas": split_csv(i.get("SISTEMAS_CONECTADOS", "")),
            "entidades": split_csv(i.get("ENTIDADES", "")),
            "tecnologias": split_csv(i.get("TECNOLOGIAS", "")),
            "javas": split_csv(i.get("JAVAS_PRINCIPALES", "")),
            "complejidad": i.get("COMPLEJIDAD", ""),
            "criterioComplejidad": i.get("CRITERIO_COMPLEJIDAD", ""),
            "ejecucionesAnual": i.get("EJECUCIONES_ANUAL", ""),
            "estado": i.get("ESTADO", ""),
            "colasDoc": c["colasDoc"],
            "wikiRef": c["wikiRef"],
            "cadenas": split_csv(i["CADENAS_CONTROLM"]),
            "listeners": sorted(listeners.get(pid, [])),
            "colasInfra": sorted(set(colas_infra.get(pid, []))),
            "publicacion": sorted(publicacion.get(pid, [])),
            "relacionados": sorted(relacionados.get(pid, [])),
        })

    out = {
        "categorias": cats,
        "procesos": procesos,
        "cajon": {
            "descripcion": (
                "Elementos del análisis técnico que no encajan en ninguno de los 91 "
                "procesos del inventario: eventos genéricos de la plataforma "
                "GoldenSource y colas sin proceso asignado. Pendientes de revisión."
            ),
            "eventos": sorted(cajon_eventos, key=lambda e: e["nombre"].lower()),
            "colas": sorted(set(cajon_colas)),
        },
        "fuentes": {
            "clasificacion": "clasificacion-procesos-rdr.html (wiki Componentes y cesiones + assembly_file.xml)",
            "cadenas": "Cadenas_RDR_v157.pptx (conexiones orientativas, no verificado al 100 %)",
            "inventario": "procesos-rdr-data.json",
        },
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")),
                   encoding="utf-8")

    # resumen de control
    n_rel = sum(len(p["relacionados"]) for p in procesos)
    print(f"procesos: {len(procesos)}  categorias: {len(cats)}")
    print(f"cadenas asignadas: {sum(len(p['cadenas']) for p in procesos)} / {len(data['chains'])}")
    print(f"listeners asignados: {sum(len(p['listeners']) for p in procesos)}")
    print(f"publicaciones asignadas: {sum(len(p['publicacion']) for p in procesos)} / {len(data['publishing'])}")
    print(f"cajón: {len(out['cajon']['eventos'])} eventos, {len(out['cajon']['colas'])} colas")
    print(f"relaciones pptx: {n_rel} aristas ({sum(1 for p in procesos if p['relacionados'])} procesos)")
    print(f"→ {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
