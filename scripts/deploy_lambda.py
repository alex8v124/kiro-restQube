"""
Script de Despliegue Directo a AWS Lambda (Sin requerir SAM CLI).
Detecta automáticamente la función Lambda activa en us-east-1 y su runtime
(Python o Node.js), empaqueta el código unificado con /health, /items, /jobs
y rutas de negocio FEN, actualiza la función y ejecuta la prueba de /jobs.
"""

import io
import json
import os
import time
import urllib.request
import zipfile
import boto3


REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
TARGET_URL_SUBSTRING = "lpcdw5nz4ndpl5ztzrxqp55wn40egvhl"


def build_zip_for_runtime(runtime: str, handler_name: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        if "python" in runtime.lower():
            # Incluye tanto src/app.py como lambda_function.py / app.py en raíz
            with open("src/app.py", "r", encoding="utf-8") as f:
                code = f.read()
            zf.writestr("src/app.py", code)
            zf.writestr("app.py", code)
            zf.writestr("lambda_function.py", code)
        else:
            # Node.js runtime (index.mjs / index.js)
            with open("backend/index.mjs", "r", encoding="utf-8") as f:
                code = f.read()
            zf.writestr("index.mjs", code)
    buf.seek(0)
    return buf.read()


def main():
    client = boto3.client("lambda", region_name=REGION)
    funcs = client.list_functions()["Functions"]

    target_fn = None
    target_url = None

    for fn in funcs:
        fname = fn["FunctionName"]
        try:
            url_cfg = client.get_function_url_config(FunctionName=fname)
            furl = url_cfg.get("FunctionUrl", "")
            if TARGET_URL_SUBSTRING in furl or "ayuda-trazable" in fname.lower():
                target_fn = fn
                target_url = furl.rstrip("/")
                break
        except Exception:
            if "ayuda-trazable" in fname.lower() or "fen" in fname.lower():
                target_fn = fn

    if not target_fn and funcs:
        target_fn = funcs[0]

    if not target_fn:
        raise RuntimeError("No se encontraron funciones Lambda en la cuenta/región.")

    fn_name = target_fn["FunctionName"]
    runtime = target_fn.get("Runtime", "python3.12")
    handler = target_fn.get("Handler", "lambda_function.lambda_handler")

    print(f"-> Función detectada: {fn_name} (Runtime: {runtime}, Handler: {handler})")
    zip_bytes = build_zip_for_runtime(runtime, handler)

    print("-> Actualizando código en AWS Lambda...")
    client.update_function_code(FunctionName=fn_name, ZipFile=zip_bytes)

    waiter = client.get_waiter("function_updated")
    waiter.wait(FunctionName=fn_name)
    print("-> Código desplegado exitosamente.")

    if target_url:
        print(f"-> Probando POST {target_url}/jobs con {{\"input\": \"abc1\"}}...")
        req = urllib.request.Request(
            f"{target_url}/jobs",
            data=json.dumps({"input": "abc1"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req) as resp:
            job_resp = json.loads(resp.read().decode("utf-8"))
            print("   Respuesta POST /jobs:", job_resp)

        job_id = job_resp["jobId"]
        time.sleep(1)
        with urllib.request.urlopen(f"{target_url}/jobs/{job_id}") as resp2:
            status_resp = json.loads(resp2.read().decode("utf-8"))
            print("   Respuesta GET /jobs/{jobId}:", status_resp)


if __name__ == "__main__":
    main()
