# Tortugas · ciencia 3D en 46 segundos

Video vertical 720×1280, 30 fps y 46 s (1.380 cuadros), sin pista de audio. Three.js y fuentes se sirven desde npm; no usa CDN ni recursos remotos al renderizar.

## Sin instalar nada

Fusiona el PR en `main`: **Actions → Render científico 3D** genera `output/tortugas.mp4`, lo agrega con un commit automático y conserva el MP4 como artifact durante 30 días. También puedes ejecutar **Run workflow** en la rama que contiene estos archivos. El primer workflow debe existir en la rama predeterminada para aparecer en el selector de GitHub. No requiere claves ni servicios de pago; requiere Actions habilitado y permiso de escritura para `GITHUB_TOKEN`. El render por software puede tardar varios minutos.

## Cambiar el tema

Edita `config.js`: `scenes` contiene textos, palabras clave, etiquetas y tiempos; `colors` cambia la paleta; `brand`, `title` y `safe` ajustan encabezado y márgenes. Mantén escenas contiguas que cubran `video.duration`. Los modelos científicos están dentro de `index.html`: para un tema distinto a tortugas, cambia también esas geometrías y el comportamiento de cada escena. Los subtítulos se agrupan de seis palabras y se iluminan palabra por palabra.

Para Full HD, cambia `video.width` a `1080` y `video.height` a `1920`; el HUD escala proporcionalmente. `video.output` fija el nombre del archivo (si lo cambias, actualiza también las rutas del workflow).

## Uso local opcional

Requiere Node 22+, Chrome de Puppeteer y ffmpeg. `npm ci`, `node render.mjs --check` y `node render.mjs`. Si ya tienes Chromium: `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium node render.mjs`. También admite `WIDTH=1080 HEIGHT=1920`. `--check` guarda siete imágenes en `work/` y comprueba que volver al mismo tiempo después de varios saltos produce los mismos píxeles con tolerancia de 1/255 por canal para el redondeo de sombras del navegador. `KEEP_FRAMES=1` conserva las capturas.

`window.render(t)` asigna el estado completo desde segundos absolutos, sin reloj, aleatoriedad ni bucle de animación. El renderizador captura PNG secuenciales y ffmpeg produce H.264 / yuv420p con faststart. Para inspeccionar el HTML, sírvelo desde la raíz (por ejemplo `python3 -m http.server 8000`) y abre `http://localhost:8000/?t=20`; las flechas permiten avanzar o retroceder un segundo.

## Contexto científico

La respiración cloacal intercambia gases con el agua a través de bursas irrigadas: no reemplaza los pulmones en todas las tortugas. El valor cercano a dos tercios para *Rheodytes leukops* es aproximado y depende de las condiciones. La supervivencia invernal de otras especies también depende del metabolismo reducido y la tolerancia a la anoxia; no debe atribuirse solo a las bursas. Los dibujos son esquemas, sin escala anatómica.

Referencias: [Australian Museum: Fitzroy River Turtle](https://australian.museum/learn/animals/reptiles/fitzroy-river-turtle/); [Jackson, 2002: Hibernating without oxygen](https://doi.org/10.1242/jeb.205.23.3579).
