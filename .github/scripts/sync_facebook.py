"""Descarga las últimas publicaciones de la fanpage de AUDECO y actualiza novedades.json.

Usa la API de Meta (Graph API) con un token de página guardado en el secreto
FB_PAGE_TOKEN. Las imágenes se guardan en novedades/ porque los enlaces de
Facebook a las fotos caducan a los pocos días.
"""
import datetime
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://graph.facebook.com/v25.0"
LIMITE = 6
RAIZ = pathlib.Path(__file__).resolve().parents[2]
CARPETA_IMG = RAIZ / "novedades"
ARCHIVO = RAIZ / "novedades.json"


def obtener(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()


def titulo_y_texto(mensaje):
    """Usa la primera oración como título si es corta; si no, todo va como texto."""
    texto = " ".join(l.strip() for l in mensaje.splitlines() if l.strip())
    fin = re.search(r"[.!?…](\s|$)", texto[:110])
    if fin:
        return texto[: fin.end()].strip(), texto[fin.end():].strip()
    return "", texto


def api(ruta, token, **params):
    params["access_token"] = token
    return json.loads(obtener(f"{API}/{ruta}?" + urllib.parse.urlencode(params)))


def info_token(token):
    """Datos del token según el depurador de Meta (tipo y vencimientos)."""
    try:
        return api("debug_token", token, input_token=token).get("data", {})
    except Exception as e:
        print("No se pudo revisar el token en el depurador de Meta:", e)
        return {}


def dias_de_acceso(info):
    """Días que quedan antes de que Meta pida renovar el permiso de datos (cada 90 días)."""
    vence = info.get("data_access_expires_at") or 0
    if not vence:
        return None
    fecha = datetime.datetime.fromtimestamp(vence, datetime.timezone.utc)
    dias = (fecha - datetime.datetime.now(datetime.timezone.utc)).days
    print(f"El acceso a los datos vence el {fecha:%d/%m/%Y} (en {dias} días)")
    return dias


def token_de_pagina(token, info):
    """Acepta un token de página o de usuario; con uno de usuario busca el de la página."""
    yo = api("me", token, fields="id,name")
    tipo = (info.get("type") or "").upper()
    print(f"Token de tipo «{tipo or 'desconocido'}» a nombre de «{yo.get('name')}»")
    if tipo == "PAGE":
        return token, yo["id"]
    try:
        paginas = api("me/accounts", token, fields="id,name,access_token").get("data", [])
    except urllib.error.HTTPError as e:
        # Un token de página no tiene «accounts»: si el depurador no dio el tipo, se usa tal cual
        if e.code == 400:
            print("El token no tiene «accounts»: se usa como token de página.")
            return token, yo["id"]
        raise
    print("Páginas que administra:", ", ".join(p["name"] for p in paginas) or "ninguna")
    elegida = next((p for p in paginas if "audeco" in p["name"].lower()), paginas[0] if paginas else None)
    if not elegida:
        raise SystemExit("El token no tiene acceso a ninguna página.")
    print(f"Usando la página «{elegida['name']}»")
    return elegida["access_token"], elegida["id"]


def main():
    token = os.environ.get("FB_PAGE_TOKEN", "").strip()
    if not token:
        print("Falta el secreto FB_PAGE_TOKEN: no se sincroniza.")
        return 0

    info = info_token(token)
    dias = dias_de_acceso(info)
    try:
        token, pagina = token_de_pagina(token, info)
        campos = "message,created_time,permalink_url,full_picture"
        posts = []
        # published_posts trae solo lo que publica la página; posts es el respaldo
        for ruta in ("published_posts", "posts"):
            posts = api(f"{pagina}/{ruta}", token, fields=campos, limit=LIMITE * 2).get("data", [])
            print(f"{ruta}: {len(posts)} publicaciones")
            if posts:
                break
    except urllib.error.HTTPError as e:
        # El cuerpo del error de Meta no incluye el token
        print("Error de la API de Meta:", e.code, e.read().decode("utf-8", "replace"))
        return 1

    if not posts:
        print("La API no devolvió publicaciones: se mantiene novedades.json sin cambios.")
        return 1

    CARPETA_IMG.mkdir(exist_ok=True)
    novedades, usadas = [], set()
    for post in posts:
        mensaje = post.get("message", "")
        if not mensaje and not post.get("full_picture"):
            continue
        titulo, texto = titulo_y_texto(mensaje)
        imagen = ""
        if post.get("full_picture"):
            nombre = post["id"].replace("_", "-") + ".jpg"
            destino = CARPETA_IMG / nombre
            if not destino.exists():
                try:
                    destino.write_bytes(obtener(post["full_picture"]))
                except Exception as e:
                    print("No se pudo bajar la imagen de", post["id"], e)
            if destino.exists():
                imagen = f"/novedades/{nombre}"
                usadas.add(nombre)
        novedades.append({
            "fecha": post["created_time"][:10],
            "tipo": "Publicación",
            "titulo": titulo,
            "texto": texto,
            "enlace": post.get("permalink_url") or "https://www.facebook.com/AudecoPe",
            "imagen": imagen,
        })
        if len(novedades) == LIMITE:
            break

    # Borra las imágenes de publicaciones que ya no se muestran
    for img in CARPETA_IMG.glob("*.jpg"):
        if img.name not in usadas:
            img.unlink()

    ARCHIVO.write_text(json.dumps(novedades, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(novedades)} publicaciones guardadas.")
    if dias is not None and dias < 15:
        # El proceso falla a propósito para que GitHub envíe un correo de aviso
        print(f"::error::Faltan {dias} días para que caduque el acceso a Facebook. "
              "Renovar en el Graph API Explorer con «Generate Access Token» "
              "(ver .github/GUIA-FACEBOOK.md).")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
