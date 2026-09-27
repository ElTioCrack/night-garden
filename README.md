# Night Garden

Página de dedicatoria de una sola vista: un jardín nocturno animado con flores, luciérnagas y corazones, hecha **sin frameworks** (HTML, CSS y JavaScript puros). Al tocar el botón empieza la música, aparecen mensajes que rotan y una polaroid que se puede arrastrar por la pantalla.

Publicada en **https://night-garden.ilianfelipez.site**.

## Cómo funciona

1. Al cargar, el jardín crece con animaciones CSS y aparece el botón **"Toca aquí ♥"**.
2. Al tocarlo:
   - Suena la canción en bucle, con el volumen subiendo de a poco (los navegadores solo permiten audio después de un toque).
   - Aparece una ficha con el título y el autor de la canción durante unos segundos.
   - Se encienden luciérnagas y corazones, y empiezan a rotar los mensajes (el primero siempre es el mismo; los demás salen en orden aleatorio sin repetirse hasta completar la vuelta).
   - A los 3 segundos entra una polaroid flotando en la esquina.
3. La polaroid se puede **arrastrar** (dedo o mouse) sin salirse de la pantalla; un toque sin moverla la abre en grande. También se mueve con las flechas del teclado.
4. El botón **♪** pausa y reanuda la música.

Respeta `prefers-reduced-motion`: con esa opción activada se reducen las animaciones.

## Estructura

```
night-garden/
├── compose.yaml     # cómo corre el contenedor (no se publica)
├── nginx.conf       # cómo lo sirve nginx (no se publica)
└── public/          # lo único que ve internet
    ├── index.html
    ├── style.css
    ├── script.js
    ├── picture.jpeg
    └── my-one-and-only-love.mp3   # NO está en git (ver abajo)
```

Los mensajes, el nombre y los tiempos se editan al inicio de `public/script.js` (`PRIMER_MENSAJE`, `MENSAJES`, `SEGUNDOS_POR_MENSAJE`, etc.).

## La canción no está en el repositorio

`my-one-and-only-love.mp3` es una grabación con derechos de autor, así que está en `.gitignore` y no se sube a GitHub. En un clon nuevo hay que copiarla a mano en `public/` con ese mismo nombre; sin ella la página funciona igual, solo que sin música.

## Correrlo

Necesita Docker con el plugin Compose.

```bash
docker compose up -d
```

Queda en `http://127.0.0.1:8082`. Solo escucha en localhost; en la Raspberry Pi lo publica Cloudflare Tunnel.

Para verlo sin Docker basta con servir la carpeta `public/`:

```bash
cd public && python3 -m http.server 8000
```

## Actualizar

Los archivos de `public/` están montados directamente en el contenedor: **al guardar un cambio ya se sirve**, no hace falta reiniciar nada.

nginx cachea el CSS y el JS por 7 días. Por eso `index.html` los carga con un número de versión (`style.css?v=4`, `script.js?v=4`): **al cambiar `style.css` o `script.js`, subir ese número** o quien ya visitó la página seguirá viendo la versión anterior.

## Seguridad del contenedor

- nginx sin root (`nginx-unprivileged`, usuario 101), sin capacidades del kernel y con `no-new-privileges`.
- Sistema de archivos del contenedor y contenido montados en **solo lectura**.
- Límite de 64 MB de RAM, 50 procesos y logs de 5 MB × 2.
- Cabeceras `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`.
