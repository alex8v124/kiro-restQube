import json
import os
from typing import Any, Dict

os.environ["DISABLE_BEDROCK_LIVE"] = "1"

import src.app as app  # noqa: E402


class FakeDynamoTable:
    """Tabla falsa para pruebas unitarias con monkeypatch de app.TABLE."""

    def __init__(self) -> None:
        self.items: Dict[str, Dict[str, Any]] = {}

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
        return {"Items": [dict(v) for v in self.items.values()]}


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
    payload = json.loads(res["body"])
    assert payload["status"] == "ok"
    assert payload["team"] == app.TEAM_ID


def test_items_persistence_with_fake_table(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    # 1. POST /items
    post_res = app.lambda_handler(_make_event("POST", "/items", {"value": "nonce-piura-123"}))
    assert post_res["statusCode"] == 201
    created = json.loads(post_res["body"])
    assert "id" in created
    assert created["value"] == "nonce-piura-123"
    item_id = created["id"]
    assert item_id in fake_table.items

    # 2. GET /items/{id}
    get_one = app.lambda_handler(_make_event("GET", f"/items/{item_id}"))
    assert get_one["statusCode"] == 200
    fetched = json.loads(get_one["body"])
    assert fetched["value"] == "nonce-piura-123"

    # 3. GET /items
    get_all = app.lambda_handler(_make_event("GET", "/items"))
    assert get_all["statusCode"] == 200
    items_list = json.loads(get_all["body"])
    assert any(it["id"] == item_id and it["value"] == "nonce-piura-123" for it in items_list)


def test_jobs_async_contract_with_fake_table(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    # POST /jobs con {"input": "abc1"} -> responde 202 con {"jobId": "<id>"} y guarda en TABLE
    post_res = app.lambda_handler(_make_event("POST", "/jobs", {"input": "abc1"}))
    assert post_res["statusCode"] in (200, 201, 202)
    post_data = json.loads(post_res["body"])
    assert "jobId" in post_data
    job_id = post_data["jobId"]
    assert job_id in fake_table.items

    # GET /jobs/{jobId} -> 200 con {"jobId": "<id>", "status": "done", "output": "1cba"}
    get_res = app.lambda_handler(_make_event("GET", f"/jobs/{job_id}"))
    assert get_res["statusCode"] == 200
    job_data = json.loads(get_res["body"])
    assert job_data["jobId"] == job_id
    assert job_data["status"] == "done"
    assert job_data["output"] == "1cba"


def test_jobs_delayed_ready_at_transition(monkeypatch):
    fake_table = FakeDynamoTable()
    monkeypatch.setattr(app, "TABLE", fake_table)

    # Si un job estuviera en "queued" pero su readyAt ya se cumplió al leer, pasa a "done"
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
