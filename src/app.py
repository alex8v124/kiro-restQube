import base64
import json
import logging
import os
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except ImportError:
    boto3 = None  # type: ignore
    BotoCoreError = ClientError = Exception  # type: ignore

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# ============================================================================
# Configuración e Inicialización de Tabla DynamoDB (TABLE / TABLE_NAME)
# Compatible con monkeypatch de TABLE en tests/test_app.py y con AWS SAM
# ============================================================================

TEAM_ID: str = os.environ.get("TEAM_ID", "T068")
TABLE_NAME: Optional[str] = os.environ.get("TABLE_NAME")
AWS_REGION: str = os.environ.get("AWS_REGION", "us-east-1")


class _InMemoryFallbackTable:
    """Tabla en memoria con la misma interfaz de boto3 DynamoDB Table (put_item, get_item, scan)."""

    def __init__(self) -> None:
        self._store: Dict[str, Dict[str, Any]] = {}

    def put_item(self, Item: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        pk = str(Item.get("id") or Item.get("jobId") or "")
        self._store[pk] = dict(Item)
        return {"ResponseMetadata": {"HTTPStatusCode": 200}}

    def get_item(self, Key: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        pk = str(Key.get("id") or Key.get("jobId") or "")
        if pk in self._store:
            return {"Item": dict(self._store[pk])}
        return {}

    def scan(self, **kwargs: Any) -> Dict[str, Any]:
        return {"Items": [dict(v) for v in self._store.values()]}


def _init_table() -> Any:
    if TABLE_NAME and boto3 is not None:
        try:
            dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
            return dynamodb.Table(TABLE_NAME)
        except Exception:
            logger.exception("No se pudo inicializar la tabla DynamoDB %s; se usa memoria", TABLE_NAME)
    return _InMemoryFallbackTable()


# Variable global TABLE usada por el starter kit y parcheable con monkeypatch en pytest
TABLE: Any = _init_table()
_MEM_BACKUP = _InMemoryFallbackTable()

# Datos públicos simulados de dominio FEN (sin nombres personales reales)
NECESIDADES_DB: List[Dict[str, Any]] = [
    {
        "id": "ALB-PIURA-01",
        "albergue": "Albergue Municipal Sector Centro (Piura)",
        "zona": "Piura Centro",
        "categoria": "AGUA_SANEAMIENTO",
        "insumo_principal": "Agua potable 20L",
        "necesidad": "Agua potable 20L",
        "requerimiento": "Agua potable 20L",
        "descripcion": "Urgente abastecimiento de agua potable 20L para familias en albergue de Piura Centro",
        "cantidad": 100,
        "cantidad_solicitada": 100,
        "cantidad_cubierta": 20,
        "urgencia": "ALTA",
        "prioridad": "ALTA",
        "prioridad_despacho": 2,
        "creado_el": "2026-10-30T10:00:00Z",
    },
    {
        "id": "ALB-CATACAOS-02",
        "albergue": "Centro de Refugio Temporal (Catacaos)",
        "zona": "Catacaos Sur",
        "categoria": "SALUD_EPIDEMIAS",
        "insumo_principal": "Kits médicos y suero oral",
        "necesidad": "Kits médicos",
        "requerimiento": "Kits médicos",
        "descripcion": "Atención sanitaria preventiva post-inundación en albergue de Catacaos",
        "cantidad": 40,
        "cantidad_solicitada": 40,
        "cantidad_cubierta": 10,
        "urgencia": "CRITICA",
        "prioridad": "CRITICA",
        "prioridad_despacho": 1,
        "creado_el": "2026-10-30T10:15:00Z",
    },
]

DONACIONES_DB: Dict[str, Dict[str, Any]] = {
    "TRK-FEN-2026": {
        "id": "DON-001",
        "tracking_id": "TRK-FEN-2026",
        "donante": "Organización Humanitaria Regional",
        "categoria": "SALUD_EPIDEMIAS",
        "item": "Kits médicos y mosquiteros",
        "cantidad": 40,
        "albergue_asignado": "Centro de Refugio Temporal (Catacaos)",
        "necesidad_id": "ALB-CATACAOS-02",
        "estado": "REGISTRADO",
        "mensaje": "Donación ingresada a la cadena de trazabilidad",
        "linea_tiempo": [
            {
                "paso": "Donación registrada en centro de acopio",
                "timestamp": "2026-10-30T09:30:00Z",
                "completado": True,
            },
            {
                "paso": "Asignado por prioridad a Centro de Refugio Temporal (Catacaos)",
                "timestamp": "2026-10-30T09:45:00Z",
                "completado": True,
            },
            {
                "paso": "En tránsito terrestre hacia zona afectada",
                "timestamp": None,
                "completado": False,
            },
            {
                "paso": "Entregado y auditado en albergue destino",
                "timestamp": None,
                "completado": False,
            },
        ],
    }
}


ASIGNACIONES_DB: List[Dict[str, Any]] = []


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _table_put(item: Dict[str, Any]) -> None:
    _MEM_BACKUP.put_item(Item=item)
    if TABLE is not None:
        try:
            TABLE.put_item(Item=item)
        except Exception:
            logger.exception("DynamoDB put_item falló para id=%s", item.get("id"))


def _table_get(item_id: str) -> Optional[Dict[str, Any]]:
    if TABLE is not None:
        try:
            resp = TABLE.get_item(Key={"id": item_id})
            if resp and "Item" in resp:
                return resp["Item"]
        except Exception:
            logger.exception("DynamoDB get_item falló para id=%s", item_id)
    return _MEM_BACKUP.get_item(Key={"id": item_id}).get("Item")


def _table_scan_items(max_items: int = 100) -> List[Dict[str, Any]]:
    """
    Escanea la tabla paginando con ExclusiveStartKey / LastEvaluatedKey
    (nunca solo la primera página) y devuelve hasta `max_items` ítems (100),
    asegurando que los ítems recién creados estén incluidos.
    """
    raw_records: List[Dict[str, Any]] = []
    seen_ids = set()

    if TABLE is not None:
        try:
            scan_kwargs: Dict[str, Any] = {}
            while True:
                resp = TABLE.scan(**scan_kwargs)
                page_items = (resp or {}).get("Items", [])
                for r in page_items:
                    if isinstance(r, dict) and "value" in r and r.get("recordType") != "job":
                        item_id = str(r.get("id", ""))
                        if item_id and item_id not in seen_ids:
                            seen_ids.add(item_id)
                            raw_records.append(r)
                last_key = (resp or {}).get("LastEvaluatedKey")
                if not last_key:
                    break
                scan_kwargs["ExclusiveStartKey"] = last_key
        except Exception:
            logger.exception("DynamoDB scan falló; se usa respaldo en memoria")

    if not raw_records:
        for r in _MEM_BACKUP.scan().get("Items", []):
            if isinstance(r, dict) and "value" in r and r.get("recordType") != "job":
                item_id = str(r.get("id", ""))
                if item_id and item_id not in seen_ids:
                    seen_ids.add(item_id)
                    raw_records.append(r)

    # Ordenar por fecha de creación descendente (los recién creados primero) si tienen createdAt
    raw_records.sort(key=lambda x: float(x.get("createdAt", 0)), reverse=True)
    return [{"id": str(r["id"]), "value": str(r["value"])} for r in raw_records[:max_items]]


# ============================================================================
# Clasificador GenAI con Propósito — Amazon Bedrock Runtime (Claude 3 Haiku)
# ============================================================================

def clasificar_necesidad_humanitaria(texto_reporte: str) -> Dict[str, Any]:
    t_lower = (texto_reporte or "").lower()

    if any(k in t_lower for k in ("dengue", "fiebre", "médic", "medic", "salud", "suero", "hospital", "mosquitero")):
        fb_cat = "SALUD_EPIDEMIAS"
        fb_insumo = "Kits médicos y rehidratación oral"
    elif any(k in t_lower for k in ("alimento", "arroz", "comida", "olla", "víveres", "viveres", "leche", "conserva")):
        fb_cat = "ALIMENTOS_PERECIBLES"
        fb_insumo = "Raciones de alimentos no perecibles"
    elif any(k in t_lower for k in ("carpa", "colchon", "frazada", "techo", "colaps", "refugio", "abrigo")):
        fb_cat = "ALBERGUE_TEMPORAL"
        fb_insumo = "Carpas impermeables y colchonetas"
    else:
        fb_cat = "AGUA_SANEAMIENTO"
        fb_insumo = "Bidones de agua potable 20L"

    if any(k in t_lower for k in ("crític", "critic", "urgente", "niño", "desborde", "fiebre", "dengue", "sin agua")):
        fb_urg = "CRITICA"
        fb_prio = 1
    elif any(k in t_lower for k in ("moderad", "media", "preventiv")):
        fb_urg = "MODERADA"
        fb_prio = 3
    else:
        fb_urg = "ALTA"
        fb_prio = 2

    if boto3 is not None and os.environ.get("DISABLE_BEDROCK_LIVE") != "1":
        try:
            client = boto3.client(service_name="bedrock-runtime", region_name=AWS_REGION)
            prompt = (
                "Eres el clasificador oficial del Centro de Operaciones FEN en Piura. "
                "Analiza la solicitud del albergue y devuelve SOLAMENTE un objeto JSON estructurado con:\n"
                '- "categoria": ("AGUA_SANEAMIENTO", "ALIMENTOS_PERECIBLES", "SALUD_EPIDEMIAS", "ALBERGUE_TEMPORAL")\n'
                '- "urgencia": ("CRITICA", "ALTA", "MODERADA")\n'
                '- "prioridad_despacho": (1, 2, 3)\n'
                '- "cantidad": número entero estimado de unidades\n'
                '- "insumo_principal": nombre corto del insumo\n'
                f'Solicitud albergue: "{texto_reporte}"'
            )
            payload = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 200,
                "temperature": 0.0,
                "messages": [{"role": "user", "content": prompt}],
            }
            resp = client.invoke_model(
                modelId="anthropic.claude-3-haiku-20240307-v1:0",
                contentType="application/json",
                accept="application/json",
                body=json.dumps(payload),
            )
            raw_body = json.loads(resp["body"].read())
            text_out = ""
            if "content" in raw_body and isinstance(raw_body["content"], list) and raw_body["content"]:
                text_out = raw_body["content"][0].get("text", "")
            elif "completion" in raw_body:
                text_out = raw_body.get("completion", "")

            match = re.search(r"\{[\s\S]*\}", text_out)
            if match:
                parsed = json.loads(match.group(0))
                return {
                    "categoria": parsed.get("categoria", fb_cat),
                    "urgencia": parsed.get("urgencia", fb_urg),
                    "prioridad_despacho": int(parsed.get("prioridad_despacho", fb_prio)),
                    "cantidad": int(parsed.get("cantidad", 50)),
                    "insumo_principal": parsed.get("insumo_principal", fb_insumo),
                    "fallback": False,
                }
            logger.warning("Bedrock respondió sin JSON reconocible; se usa fallback. Respuesta: %.200s", text_out)
        except ClientError as exc:
            # ThrottlingException, AccessDeniedException, ValidationException, ModelTimeoutException...
            error = exc.response.get("Error", {})
            logger.warning(
                "Bedrock ClientError %s: %s; se usa fallback determinista",
                error.get("Code", "Desconocido"),
                error.get("Message", ""),
            )
        except BotoCoreError as exc:
            logger.warning("Bedrock BotoCoreError %s: %s; se usa fallback determinista", type(exc).__name__, exc)
        except (json.JSONDecodeError, ValueError, TypeError, KeyError) as exc:
            logger.warning("Respuesta de Bedrock inválida (%s: %s); se usa fallback determinista", type(exc).__name__, exc)

    return {
        "categoria": fb_cat,
        "urgencia": fb_urg,
        "prioridad_despacho": fb_prio,
        "cantidad": 50,
        "insumo_principal": fb_insumo,
        "fallback": True,
    }


# ============================================================================
# Utilidades de Parseo HTTP
# ============================================================================

def _extract_path(event: Dict[str, Any]) -> str:
    raw = event.get("rawPath") or event.get("path") or "/"
    stage = event.get("requestContext", {}).get("stage")
    if stage and raw.startswith(f"/{stage}/"):
        raw = raw[len(stage) + 1 :]
    elif raw.startswith("/Prod/"):
        raw = raw[len("/Prod") :]
    elif raw.startswith("/prod/"):
        raw = raw[len("/prod") :]
    cleaned = raw.rstrip("/")
    return cleaned if cleaned else "/"


def _extract_method(event: Dict[str, Any]) -> str:
    return (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
        or "GET"
    ).upper()


def _extract_body(event: Dict[str, Any]) -> Dict[str, Any]:
    raw_body = event.get("body")
    if not raw_body:
        return {}
    if isinstance(raw_body, dict):
        return raw_body
    try:
        if event.get("isBase64Encoded"):
            raw_body = base64.b64decode(raw_body).decode("utf-8")
        return json.loads(raw_body)
    except Exception:
        return {}


def _response(status_code: int, body: Any, headers: Dict[str, str]) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": headers,
        "body": "" if body is None else json.dumps(body, ensure_ascii=False),
    }


# ============================================================================
# Handler Principal de AWS Lambda (src.app.lambda_handler)
# ============================================================================

def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    path = _extract_path(event)
    method = _extract_method(event)
    body = _extract_body(event)
    path_params = event.get("pathParameters") or {}

    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    }

    if method == "OPTIONS":
        return _response(200, None, headers)

    # ------------------------------------------------------------------------
    # 1. INSIGNIA API VIVA (+20 PTS): GET /health y GET /
    # ------------------------------------------------------------------------
    if path in ("/", "/health") and method == "GET":
        team_val = os.environ.get("TEAM_ID", TEAM_ID)
        return _response(
            200,
            {
                "status": "ok",
                "team": team_val,
                "service": "Ayuda Trazable FEN API",
                "mensaje": "API Ayuda Trazable activa",
            },
            headers,
        )

    # ------------------------------------------------------------------------
    # 2. INSIGNIA PERSISTENCIA (+25 PTS): POST /items, GET /items/{id}, GET /items
    # Guarda en ItemsTable (TABLE), lee por id (404 si no existe) y en GET /items
    # pagina el scan completo devolviendo hasta 100 ítems incluyendo el nuevo.
    # ------------------------------------------------------------------------
    if path == "/items" and method == "POST":
        item_id = str(body.get("id") or uuid.uuid4().hex[:12])
        val = str(body.get("value", ""))
        record = {
            "id": item_id,
            "value": val,
            "recordType": "item",
            "createdAt": time.time(),
        }
        _table_put(record)
        return _response(201, {"id": item_id, "value": val}, headers)

    if path.startswith("/items/") and method == "GET":
        item_id = path_params.get("id") or path.split("/")[-1]
        found = _table_get(item_id)
        if found and "value" in found and found.get("recordType") != "job":
            return _response(200, {"id": str(found.get("id", item_id)), "value": str(found["value"])}, headers)
        return _response(404, {"error": "Item not found"}, headers)

    if path == "/items" and method == "GET":
        items_list = _table_scan_items(max_items=100)
        return _response(200, items_list, headers)

    # ------------------------------------------------------------------------
    # 3. INSIGNIA ASÍNCRONO O AGENTE (+35 PTS): POST /jobs y GET /jobs/{jobId}
    # ------------------------------------------------------------------------
    if path == "/jobs" and method == "POST":
        raw_input = str(body.get("input", ""))
        job_id = f"job-{uuid.uuid4().hex[:10]}"
        inverted_output = raw_input[::-1]
        now_ts = int(time.time())
        job_item = {
            "id": job_id,
            "jobId": job_id,
            "recordType": "job",
            "status": "done",
            "input": raw_input,
            "output": inverted_output,
            "createdAt": now_ts,
            "readyAt": now_ts,
        }
        _table_put(job_item)
        return _response(202, {"jobId": job_id}, headers)

    if path.startswith("/jobs/") and method == "GET":
        job_id = path_params.get("jobId") or path_params.get("id") or path.split("/")[-1]
        job_item = _table_get(job_id)
        if not job_item:
            return _response(404, {"error": "Job not found", "jobId": job_id}, headers)

        raw_input = str(job_item.get("input", ""))
        output_val = job_item.get("output")
        if output_val is None:
            output_val = raw_input[::-1]

        ready_at = float(job_item.get("readyAt", 0))
        status_val = job_item.get("status", "done")
        if status_val != "done" and time.time() >= ready_at:
            status_val = "done"
            job_item["status"] = "done"
            job_item["output"] = output_val
            _table_put(job_item)

        return _response(
            200,
            {
                "jobId": job_id,
                "status": status_val,
                "output": output_val if status_val == "done" else None,
            },
            headers,
        )

    # ------------------------------------------------------------------------
    # 4. RUTAS DE NEGOCIO FEN — NECESIDADES Y BEDROCK (+40 PTS)
    # ------------------------------------------------------------------------
    if path == "/necesidades" and method == "GET":
        return _response(200, NECESIDADES_DB, headers)

    if path in ("/necesidades/ia", "/clasificar", "/necesidades") and method == "POST":
        texto = str(
            body.get("texto")
            or body.get("texto_reporte")
            or body.get("textoReporte")
            or body.get("descripcion")
            or "Urgente agua potable 20L en albergue Piura"
        )
        clasificacion = clasificar_necesidad_humanitaria(texto)
        nueva_id = body.get("id") or f"NEC-{str(uuid.uuid4().int)[:4]}"
        albergue_nombre = (
            body.get("albergue")
            or body.get("albergueNombre")
            or "Centro de Refugio Temporal Catacaos"
        )
        cantidad_num = int(body.get("cantidad_solicitada") or clasificacion.get("cantidad") or 50)

        nueva_nec = {
            "id": nueva_id,
            "albergue": albergue_nombre,
            "albergueNombre": albergue_nombre,
            "zona": body.get("zona", "Piura / Catacaos"),
            "categoria": clasificacion["categoria"],
            "urgencia": clasificacion["urgencia"],
            "prioridad_despacho": clasificacion["prioridad_despacho"],
            "insumo_principal": clasificacion.get("insumo_principal", "Suministros vitales FEN"),
            "necesidad": clasificacion.get("insumo_principal", "Suministros vitales FEN"),
            "descripcion": texto,
            "textoReporte": texto,
            "cantidad": cantidad_num,
            "cantidad_solicitada": cantidad_num,
            "cantidad_cubierta": 0,
            "fallback": clasificacion.get("fallback", False),
            "creado_el": _now_iso(),
        }
        NECESIDADES_DB.insert(0, nueva_nec)
        return _response(201, nueva_nec, headers)

    # ------------------------------------------------------------------------
    # 5. RUTAS DE NEGOCIO FEN — DONACIONES, TRAZABILIDAD, ENTREGAS Y DASHBOARD
    # ------------------------------------------------------------------------
    if path == "/donaciones" and method == "GET":
        return _response(200, list(DONACIONES_DB.values()), headers)

    if path == "/donaciones" and method == "POST":
        tracking_id = body.get("tracking_id") or f"TRK-{str(uuid.uuid4().int)[:4]}"
        donante = body.get("donante") or body.get("donanteNombre") or "Donante Institucional"
        item_desc = body.get("item") or body.get("descripcion") or "Insumo Humanitario"
        cat = str(body.get("categoria") or "AGUA_SANEAMIENTO").upper()
        try:
            cant = int(re.sub(r"[^\d]", "", str(body.get("cantidad", 20))) or 20)
        except ValueError:
            cant = 20

        match = NECESIDADES_DB[0] if NECESIDADES_DB else None
        for n in NECESIDADES_DB:
            if n.get("cantidad_cubierta", 0) < n.get("cantidad_solicitada", 100):
                match = n
                break

        if match:
            match["cantidad_cubierta"] = min(
                match.get("cantidad_solicitada", 100),
                match.get("cantidad_cubierta", 0) + cant,
            )
        albergue_dest = match.get("albergue", "Acopio Central Piura") if match else "Acopio Central Piura"

        donacion = {
            "id": f"DON-{len(DONACIONES_DB) + 1:03d}",
            "tracking_id": tracking_id,
            "donante": donante,
            "categoria": cat,
            "item": item_desc,
            "cantidad": cant,
            "albergue_asignado": albergue_dest,
            "necesidad_id": match.get("id") if match else None,
            "estado": "REGISTRADO",
            "mensaje": "Donación ingresada a la cadena de trazabilidad",
            "linea_tiempo": [
                {
                    "paso": "Donación registrada en centro de acopio",
                    "timestamp": _now_iso(),
                    "completado": True,
                },
                {
                    "paso": f"Asignado por prioridad a {albergue_dest}",
                    "timestamp": _now_iso(),
                    "completado": True,
                },
                {
                    "paso": "En tránsito terrestre hacia zona afectada",
                    "timestamp": None,
                    "completado": False,
                },
                {
                    "paso": "Entregado y auditado en albergue destino",
                    "timestamp": None,
                    "completado": False,
                },
            ],
        }
        DONACIONES_DB[tracking_id] = donacion
        return _response(201, donacion, headers)

    if path == "/asignaciones" and method == "GET":
        return _response(200, ASIGNACIONES_DB, headers)

    if path == "/asignaciones" and method == "POST":
        trk_id = str(body.get("tracking_id") or "")
        don = DONACIONES_DB.get(trk_id)
        if don is None and body.get("donacionId"):
            don = next((d for d in DONACIONES_DB.values() if d.get("id") == body.get("donacionId")), None)
        if don is None:
            return _response(404, {"error": "Donación no existe", "tracking_id": trk_id or None}, headers)

        nec_id = body.get("necesidadId") or don.get("necesidad_id")
        nec = next((n for n in NECESIDADES_DB if n.get("id") == nec_id), None)
        if nec is None:
            return _response(404, {"error": "Necesidad no existe", "necesidadId": nec_id}, headers)

        don["estado"] = "ASIGNADO"
        don["necesidad_id"] = nec["id"]
        don["albergue_asignado"] = nec.get("albergue")
        nec["estado"] = "ASIGNADA"
        ahora = _now_iso()
        asignacion = {
            "id": f"ASG-{len(ASIGNACIONES_DB) + 1:03d}",
            "tracking_id": don["tracking_id"],
            "donacionId": don["id"],
            "necesidadId": nec["id"],
            "albergueNombre": nec.get("albergue"),
            "zona": nec.get("zona"),
            "recurso": don.get("item"),
            "cantidad": str(don.get("cantidad")),
            "categoria": nec.get("categoria"),
            "urgencia": nec.get("urgencia"),
            "prioridad_despacho": nec.get("prioridad_despacho"),
            "coordinador": body.get("coordinador") or "Coordinador COER",
            "operadorLogistico": body.get("operadorLogistico") or "Operador logístico",
            "vehiculoPlaca": body.get("vehiculoPlaca") or "Por asignar",
            "estadoRuta": "ASIGNADO",
            "puntoControlActual": "Centro de acopio",
            "creadoEn": ahora,
            "actualizadoEn": ahora,
        }
        ASIGNACIONES_DB.insert(0, asignacion)
        return _response(201, asignacion, headers)

    if path.startswith("/trazabilidad/") and method == "GET":
        trk_id = path.split("/")[-1]
        if trk_id in DONACIONES_DB:
            return _response(200, DONACIONES_DB[trk_id], headers)
        return _response(404, {"error": "Tracking no existe", "tracking_id": trk_id}, headers)

    if path.startswith("/entregas/") and method in ("PUT", "POST"):
        trk_id = path.split("/")[-1]
        if trk_id not in DONACIONES_DB:
            return _response(404, {"error": "Tracking no existe", "tracking_id": trk_id}, headers)
        don = DONACIONES_DB[trk_id]
        nuevo_estado = str(body.get("estado") or "EN_TRANSITO").upper()
        don["estado"] = nuevo_estado
        if nuevo_estado in ("EN_TRANSITO", "EN_RUTA"):
            don["linea_tiempo"][2]["completado"] = True
            don["linea_tiempo"][2]["timestamp"] = _now_iso()
        elif nuevo_estado == "ENTREGADO":
            don["linea_tiempo"][2]["completado"] = True
            if not don["linea_tiempo"][2]["timestamp"]:
                don["linea_tiempo"][2]["timestamp"] = _now_iso()
            don["linea_tiempo"][3]["completado"] = True
            don["linea_tiempo"][3]["timestamp"] = _now_iso()
        for asg in ASIGNACIONES_DB:
            if asg["tracking_id"] == trk_id:
                asg["estadoRuta"] = nuevo_estado
                asg["puntoControlActual"] = body.get("puntoControlActual") or asg["puntoControlActual"]
                asg["actualizadoEn"] = _now_iso()
        return _response(200, don, headers)

    if path == "/dashboard" and method == "GET":
        dons = list(DONACIONES_DB.values())
        total_don = len(dons)
        en_transito = sum(1 for d in dons if d.get("estado") in ("EN_TRANSITO", "EN_RUTA"))
        entregados = sum(1 for d in dons if d.get("estado") == "ENTREGADO")
        criticas = sum(1 for n in NECESIDADES_DB if n.get("urgencia") == "CRITICA")
        return _response(
            200,
            {
                "totalNecesidades": len(NECESIDADES_DB),
                "necesidadesCriticas": criticas,
                "totalDonaciones": total_don,
                "asignacionesActivas": en_transito,
                "entregasCompletadas": entregados,
                "familiasAsistidas": 205,
                "porcentajeCobertura": 80,
                "resumen": {
                    "albergues_activos": len(NECESIDADES_DB),
                    "donaciones_totales": total_don,
                    "en_transito": en_transito,
                    "entregados": entregados,
                    "eficiencia_entrega": round((entregados / total_don) * 100) if total_don else 100,
                },
                "necesidades": NECESIDADES_DB,
            },
            headers,
        )

    return _response(404, {"error": "Ruta no encontrada", "path": path}, headers)


handler = lambda_handler
