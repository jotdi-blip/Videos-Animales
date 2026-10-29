# Hongos zombi · HyperFrames

Video vertical de 46 segundos, 720×1280, 30 fps. Siete escenas con dibujo anatómico wireframe, suelo de cuadrícula, brillo lima/ámbar/rosa, voz española, subtítulos de una palabra y música ambiental original.

## Editar y renderizar

Requisitos: Node 22+, Python 3.10+, FFmpeg y un navegador compatible.

```sh
cd hongos-zombi
npm ci
python -m pip install -r requirements.txt
npx hyperframes browser ensure
npm run build
npm run check
npm run preview
npm run render
npm run verify
```

`config.js` contiene guion, títulos, etiquetas HUD, colores, tiempos y voz. Después de editarlo, `npm run build` regenera narración, subtítulos y composiciones HTML editables. `assets/draw.js` contiene los especímenes animados: todos los fotogramas son funciones del tiempo, sin aleatoriedad ni peticiones de red. Las escenas viven en `compositions/`, los subtítulos en una pista única. La vista previa de HyperFrames permite editar la composición por su interfaz.

El archivo final se escribe en **`output/hongos-zombi.mp4` desde la raíz del repositorio**. Los subtítulos también están disponibles en `assets/subtitles.srt`; `assets/words.json` guarda tiempos por palabra. Los tiempos proceden de eventos WORD reales de eSpeak NG, reescalados junto al audio. No son divisiones uniformes de la frase.

## GitHub Actions

El workflow **Render hongos zombi** corre al abrir/actualizar el PR, en cambios a main y manualmente mediante **Actions → Render hongos zombi → Run workflow**. Instala dependencias, genera audio y escenas, comprueba la composición, toma fotogramas, renderiza y verifica H.264/AAC, dimensiones, duración, 1380 cuadros, fps y cobertura íntegra del guion. Descarga el artifact **hongos-zombi-720x1280-30fps** para obtener el MP4 y los subtítulos. El artifact de revisión contiene diagnósticos y snapshots.

## Internet, claves y licencias

**No se necesita API key**. La voz es sintética eSpeak NG en español, ejecutada localmente; no es una locución humana ni una voz neuronal de HeyGen. La música se sintetiza localmente con acordes y pulsos originales y volumen bajo. Las figuras se dibujan con Canvas y GSAP; no hay imágenes de terceros.

La instalación inicial sí necesita internet para npm, PyPI, paquetes de Ubuntu y el navegador de HyperFrames; Actions proporciona esa conexión. Una vez instaladas las dependencias y construido el proyecto, el render usa archivos locales. Algunas versiones de HyperFrames pueden intentar resolver fuentes durante su compilación. HyperFrames: Apache-2.0; GSAP: Standard License; eSpeak NG: GPL-3.0-or-later (dependencia instalada, sin copiar su código en este repositorio). La salida de voz generada no incorpora código de eSpeak.

## Ciencia y representación

Dibujo esquemático, no reconstrucción microscópica. El guion conserva los textos pedidos. Fredericksen et al., PNAS (2017), DOI: [10.1073/pnas.1711673114](https://doi.org/10.1073/pnas.1711673114), describe redes fúngicas asociadas a músculos sin invasión del cerebro en el sistema estudiado. El mecanismo preciso de manipulación sigue siendo objeto de investigación; la etiqueta del guion “controla los músculos” simplifica ese hallazgo.

Las skills oficiales consultadas fueron [hyperframes](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/SKILL.md), [hyperframes-cli](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-cli/SKILL.md), [media-use](https://github.com/heygen-com/hyperframes/blob/main/skills/media-use/SKILL.md) y [hyperframes-registry](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-registry/SKILL.md). La búsqueda del catálogo no devolvió una plantilla adecuada para esta anatomía; el dibujo es específico del proyecto.
