# Hongos zombi

Objetivo: explicar el ciclo de Ophiocordyceps y distinguir la invasión muscular del control directo del cerebro. El guion y los siete cortes son los solicitados.

Entrega: HyperFrames 720×1280, 30 fps, 46 s = 1380 cuadros. H.264 + AAC en `output/hongos-zombi.mp4`, relativo a la raíz del repositorio.

Medio: espécimen anatómico esquemático, abdomen, tórax, cabeza, seis patas articuladas y antenas. Curvas de latitud y longitud a 1.6 px, contorno a 2.4 px, brillo de 3–9 px. Fondo #030b19, suelo en perspectiva #173148, hormiga #c6ff39, músculos y esporas #ffbd54, hifas #ff568b. El cerebro queda dentro de la cabeza y separado de las hifas.

Composición: sujeto de 460–600 px de ancho entre y=300 e y=900. Títulos de 42 px desde x=74 y=162. HUD 24–28 px. Subtítulos de una palabra de 61 px a y=965, ancho 572 px. Todos los textos se editan en config.js y se reconstruyen.

| Cuadros | Plano y acción |
|---|---|
| 0–119 | Hormiga caminando con etiqueta OBJETIVO y suelo en perspectiva. |
| 120–299 | Esporas en descenso, después entrada de puntos de infección. |
| 300–539 | Corte: fibras ámbar y red rosa creciendo entre músculos. |
| 540–809 | Cerebro intacto dentro de la cabeza; tacha a los 20.8 s, corrección a los 23.2 s. |
| 810–1049 | Ascenso por un tallo hacia la cara inferior de una hoja. |
| 1050–1259 | Mandíbulas sujetas, inmovilidad, tallo rosa creciendo y esporas. |
| 1260–1379 | Acercamiento al espécimen con tallo y pregunta final. |

Audio: eSpeak NG español local a 160 palabras/minuto, tono 42; ajuste temporal de 0.6× como mínimo para ocupar la escena, acelerando si la frase excede el corte. Tiempos por palabra de eventos WORD del motor. Voz a −18 LUFS, true peak −2 dB; base musical original de senos, acordes lentos y pulsos con ganancia 0.16. Ninguna API pagada.

Evitar: fotografías sustituidas por iconos, texto en movimiento, falsas cifras científicas, música que tape la voz, hifas dibujadas dentro del cerebro. El neón y HUD son requisitos del encargo.

QA: cuadros de escenas a 1, 7, 14, 24, 31, 40 y 44 s; revisión de cortes; verificación técnica con ffprobe. La interpretación anatómica es esquemática. Referencia científica: Fredericksen et al. (2017), PNAS, doi:10.1073/pnas.1711673114 (red fúngica alrededor de músculos, cerebro no invadido). La especie y el hospedador condicionan el comportamiento; la pregunta final conserva la formulación del guion.
