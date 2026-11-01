# Tlacuache

Video de juguete low-poly hecho exclusivamente con geometría Three.js: **720 × 1280, 9:16, 30 fps, 66 s**, sin audio, letras, números ni subtítulos en pantalla. El MP4 ya renderizado está en [`output/tlacuache.mp4`](output/tlacuache.mp4); se puede reproducir sin instalar nada.

Para regenerarlo sin instalación local, ejecuta **Actions → Render tlacuache → Run workflow** en GitHub. El workflow instala Node, ffmpeg y Chrome, renderiza, verifica y guarda el MP4 tanto como artifact descargable como en `tlacuache/output/tlacuache.mp4` en la rama ejecutada. Los pushes a `main` que cambien este proyecto también lo ejecutan. Requiere internet en el runner y permisos de escritura para GitHub Actions.

En `config.js`, cambia `scenes[].duration` (segundos) y `colors` (colores hexadecimales). Los movimientos, cortes y capturas de revisión se ajustan proporcionalmente a cada duración; la suma debe corresponder a un número entero de cuadros. Las duraciones originales suman 66 s. `render(t)` calcula directamente cada estado; no usa reloj, aleatoriedad ni `requestAnimationFrame`.

Desarrollo opcional con Node 22+: `npm ci`, `npx puppeteer browsers install chrome --install-deps`, `npm run render`, `npm run verify`. ffmpeg debe estar disponible. `PUPPETEER_EXECUTABLE_PATH` permite usar un Chromium instalado; el script también detecta `/usr/bin/chromium`.

`npm run review` genera 25 PNG de los ocho episodios, incluidos primeros planos, en `output/review/`, comprueba escenas no vacías y compara hashes tras buscar tiempos en orden inverso. `npm run render` hace estas comprobaciones antes de capturar los 1980 cuadros PNG y pasarlos por pipe a ffmpeg. `npm run verify` confirma resolución, duración, frecuencia, cuadros y ausencia de otras pistas.

La anatomía y la leyenda están estilizadas como un diorama narrativo: la bolsa es un corte esquemático con trece puntos de lactancia y crías ampliadas en el plano macro; el veneno se representa con gotas verdes y partículas azules. Las escenas de peligro no son gráficas.
