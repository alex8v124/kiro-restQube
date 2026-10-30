import json
import os
from typing import Any, Dict, List

os.environ["DISABLE_BEDROCK_LIVE"] = "1"

import src.app as app  # noqa: E402


class FakeDynamoTable:
    """Tabla falsa para pruebas unitarias con monkeypatch de app.TABLE y paginación de scan."""

    def __init__(self, page_size: int = 50) -> None:
        self.items: Dict[str, Dict[str, Any]] = {}
        self.page_size = page_size
        self.scan_calls = 0

    def put_item(self, Item: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        pk = str(Item.get("id") or Item.get("jobId"))
        self.items[pk] = dict(Item)
        return {"ResponseMetadata": {"HTTPStatusCode": 200}}

    def get_item(self, Key: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        pk = str(Key.get("id") or Key.get("jobId"))
        if pk in self.items:
            return {"Item": dict(self.items[pk])}
        return {}

    def scan(self, **kwargs: Any) -> Dict[str, Any]:
        self.scan_calls += 1
        all_values: List[Dict[str, Any]] = [dict(v) for v in self.items.values()]
        start_idx = 0
        eks = kwargs.get("ExclusiveStartKey")
        if eks and "id" in eks:
            for idx, it in enumerate(all_values):
                if it.get("id") == eks["id"]:
                    start_idx = idx + 1
                    break

        page = all_values[start_idx : start_idx + self.page_size]
        result: Dict[str, Any] = {"Items": page}
        if start_idx + self.page_size < len(all_values) and page:
            result["LastEvaluatedKey"] = {"id": page[-1]["id"]}
        return result


def _make_event(method: str, path: str, body: dict | None = None) -> dict:
    return {
        "rawPath": path,
        "path": path,
        "httpMethod": method,
        "requestContext": {"http": {"method": method, "path": path}},
        "body": json.dumps(body) if body is not None else None,
        "isBase64Encoded": False,
    }


def test_health_endpoint(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    res = app.lambda_handler(_make_event("GET", "/health"))
    assert res["statusCode"] == 200
    assert res["headers"]["Content-Type"] == "application/json"
    payload = json.loads(res["body"])
    assert payload["status"] == "ok"
    assert payload["team"] == app.TEAM_ID


def test_items_persistence_crud_and_not_found(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    # 1. POST /items {"value": "<nonce>"} -> 200 o 201 con {"id": "<id nuevo>", "value": "<nonce>"}
    post_res = app.lambda_handler(_make_event("POST", "/items", {"value": "nonce-persistencia-999"}))
    assert post_res["statusCode"] in (200, 201)
    assert post_res["headers"]["Content-Type"] == "application/json"
    created = json.loads(post_res["body"])
    assert "id" in created
    assert created["value"] == "nonce-persistencia-999"
    item_id = created["id"]
    assert item_id in fake_table.items

    # 2. GET /items/{id} -> 200 con {"id": "<id>", "value": "<nonce>"}
    get_one = app.lambda_handler(_make_event("GET", f"/items/{item_id}"))
    assert get_one["statusCode"] == 200
    fetched = json.loads(get_one["body"])
    assert fetched["id"] == item_id
    assert fetched["value"] == "nonce-persistencia-999"

    # 3. GET /items/{id} inexistente -> 404
    not_found = app.lambda_handler(_make_event("GET", "/items/id-que-no-existe"))
    assert not_found["statusCode"] == 404

    # 4. GET /items -> 200 con arreglo JSON que incluye el ítem recién creado
    get_all = app.lambda_handler(_make_event("GET", "/items"))
    assert get_all["statusCode"] == 200
    items_list = json.loads(get_all["body"])
    assert isinstance(items_list, list)
    assert any(it["id"] == item_id and it["value"] == "nonce-persistencia-999" for it in items_list)


def test_items_scan_pagination_up_to_100(monkeypatch):
    # Simula páginas pequeñas de DynamoDB (page_size=25) con 60 ítems previos + 1 ítem nuevo en la página 3
    fake_table = FakeDynamoTable(page_size=25)
    monkeypatch.setattr(app, "TABLE", fake_table)

    for i in range(60):
        app.lambda_handler(_make_event("POST", "/items", {"value": f"item-antiguo-{i}"}))

    target_res = app.lambda_handler(_make_event("POST", "/items", {"value": "nonce-en-pagina-3"}))
    target_id = json.loads(target_res["body"])["id"]

    list_res = app.lambda_handler(_make_event("GET", "/items"))
    assert list_res["statusCode"] == 200
    items = json.loads(list_res["body"])

    # Debe haber paginado múltiples veces (3 páginas de 25) y encontrar el ítem recién creado
    assert fake_table.scan_calls >= 3
    assert len(items) == 61
    assert any(it["id"] == target_id and it["value"] == "nonce-en-pagina-3" for it in items)


def test_jobs_async_contract_with_fake_table(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    post_res = app.lambda_handler(_make_event("POST", "/jobs", {"input": "abc1"}))
    assert post_res["statusCode"] in (200, 201, 202)
    post_data = json.loads(post_res["body"])
    assert "jobId" in post_data
    job_id = post_data["jobId"]
    assert job_id in fake_table.items

    get_res = app.lambda_handler(_make_event("GET", f"/jobs/{job_id}"))
    assert get_res["statusCode"] == 200
    job_data = json.loads(get_res["body"])
    assert job_data["jobId"] == job_id
    assert job_data["status"] == "done"
    assert job_data["output"] == "1cba"


def test_jobs_delayed_ready_at_transition(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    fake_table.put_item(
        Item={
            "id": "job-test-delay",
            "jobId": "job-test-delay",
            "recordType": "job",
            "status": "queued",
            "input": "kiro2026",
            "readyAt": 0,
        }
    )
    get_res = app.lambda_handler(_make_event("GET", "/jobs/job-test-delay"))
    assert get_res["statusCode"] == 200
    job_data = json.loads(get_res["body"])
    assert job_data["status"] == "done"
    assert job_data["output"] == "6202orik"


def test_fen_domain_routes(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    nec_res = app.lambda_handler(_make_event("GET", "/necesidades"))
    assert nec_res["statusCode"] == 200

    ia_res = app.lambda_handler(
        _make_event(
            "POST",
            "/necesidades/ia",
            {
                "albergue": "Centro Temporal Catacaos",
                "texto": "Urgente: casos febriles y dengue requieren kits médicos y suero oral",
            },
        )
    )
    assert ia_res["statusCode"] == 201
    ia_data = json.loads(ia_res["body"])
    assert ia_data["categoria"] == "SALUD_EPIDEMIAS"
    assert ia_data["urgencia"] == "CRITICA"
