# Publicaciones de Facebook en la web

La sección «Últimas publicaciones» del inicio y la ventana «Nuestras novedades» se llenan solas con los posts de la fanpage [facebook.com/AudecoPe](https://www.facebook.com/AudecoPe).

## Funcionamiento

1. Cada 3 horas, GitHub ejecuta el proceso [Sincronizar publicaciones de Facebook](../../actions/workflows/sincronizar-facebook.yml).
2. El proceso lee los posts de la fanpage con la API de Meta, usando el token guardado en el secreto `FB_PAGE_TOKEN`.
3. Guarda las 6 publicaciones más recientes en `novedades.json` y sus fotos en la carpeta `novedades/`. La web muestra las 3 últimas en el inicio.

Para sincronizar al momento: **Actions → Sincronizar publicaciones de Facebook → Run workflow**.

La app de Meta que da acceso a la fanpage se llama **AUDECO Web** y está en [developers.facebook.com/apps](https://developers.facebook.com/apps/).

## Si deja de actualizarse

GitHub envía un correo cuando la sincronización falla. Las causas más comunes:

- El token caducó.
- La cuenta que generó el token dejó de administrar la fanpage, cambió su contraseña o fue eliminada.

En cualquiera de los casos, la solución es generar un token nuevo (sección siguiente) y reemplazarlo en GitHub. La web no se cae: sigue mostrando los últimos posts que descargó.

## Generar un token nuevo (unos 5 minutos)

Hay que hacerlo desde una computadora, con una cuenta personal de Facebook que **administre la fanpage** y tenga rol de **Administrator** en la app AUDECO Web.

1. Abrir el [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. En **Meta App**, elegir **AUDECO Web**.
3. En **Add a Permission**, agregar `pages_show_list` y `pages_read_engagement`.
4. En **User or Page**, elegir **Get User Access Token** y pulsar **Generate Access Token**. Al pedirlo, elegir **Opt in to current Pages only** y marcar solo **Audeco**.
5. Pulsar el ícono **«i»** junto al token, luego **Open in Access Token Tool** y luego **Extend Access Token**. Copiar el token largo que aparece.
6. Volver al Explorer, pegar el token largo en **Access Token**, consultar `me/accounts?fields=name,access_token` y pulsar **Submit**.
7. Copiar el `access_token` que aparece junto a **"Audeco"**. Ese es el token de la página.
8. Comprobarlo en el [depurador de tokens](https://developers.facebook.com/tools/debug/accesstoken/): debe decir **Type: Page** y **Expires: Never**.
9. En GitHub, ir a **Settings → Secrets and variables → Actions**, abrir `FB_PAGE_TOKEN`, pulsar **Update**, pegar el token y guardar.
10. Lanzar **Run workflow** para comprobar que funciona.

> ⚠️ El token es como una contraseña de la fanpage. Solo debe guardarse en el secreto de GitHub, nunca en el código, en chats ni en correos.

## Cambio de la cuenta de Facebook que administra la fanpage

Antes de eliminar la cuenta de Facebook con la que se configuró todo, hay que seguir este orden:

1. **Crear la cuenta nueva** de Facebook.
2. **Darle control total de la fanpage.** Con la cuenta actual, en la página Audeco, ir a *Configuración → Acceso a la página* (o *Roles de la página*) y agregar la cuenta nueva **con control total**. Aceptar la invitación desde la cuenta nueva.
3. **Registrar la cuenta nueva como desarrolladora** en [developers.facebook.com](https://developers.facebook.com/), con **Get Started**. Debe hacerse desde el perfil personal, no desde la página.
4. **Darle acceso a la app.** Con la cuenta actual, en [developers.facebook.com/apps](https://developers.facebook.com/apps/), abrir **AUDECO Web → App roles → Roles** y agregar la cuenta nueva como **Administrator**. Aceptar la invitación desde la cuenta nueva.
5. **Generar un token nuevo con la cuenta nueva** (sección anterior) y reemplazarlo en GitHub.
6. **Comprobar** con **Run workflow** que la sincronización funciona.
7. **Recién entonces, eliminar la cuenta vieja.**

> ⚠️ Si la cuenta vieja es la única administradora de la fanpage y se elimina antes del paso 2, **la fanpage se pierde para siempre**.
