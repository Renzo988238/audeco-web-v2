"""Descarga las últimas publicaciones de la fanpage de AUDECO y actualiza novedades.json.

Usa la API de Meta (Graph API) con un token de página guardado en el secreto
FB_PAGE_TOKEN. Las imágenes se guardan en novedades/ porque los enlaces de
Facebook a las fotos caducan a los pocos días.
"""
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


def main():
    token = os.environ.get("FB_PAGE_TOKEN", "").strip()
    if not token:
        print("Falta el secreto FB_PAGE_TOKEN: no se sincroniza.")
        return 0

    campos = "message,created_time,permalink_url,full_picture"
    url = f"{API}/me/posts?" + urllib.parse.urlencode(
        {"fields": campos, "limit": LIMITE * 2, "access_token": token}
    )
    try:
        datos = json.loads(obtener(url))
    except urllib.error.HTTPError as e:
        # El cuerpo del error de Meta no incluye el token
        print("Error de la API de Meta:", e.code, e.read().decode("utf-8", "replace"))
        return 1

    CARPETA_IMG.mkdir(exist_ok=True)
    novedades, usadas = [], set()
    for post in datos.get("data", []):
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
    return 0


if __name__ == "__main__":
    sys.exit(main())
