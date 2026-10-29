// Única fuente de textos, colores y tiempos. Ejecuta npm run build al editar.
export default {
  width: 720, height: 1280, fps: 30, duration: 46,
  palette: { background: '#030b19', lime: '#c6ff39', amber: '#ffbd54', pink: '#ff568b', grid: '#173148', white: '#edf5ed' },
  scientificName: 'Camponotus',
  title: 'HONGOS ZOMBI', subtitle: 'Ophiocordyceps · anatomía de una infección',
  hud: { target: 'OBJETIVO', spores: 'ESPORAS', muscle: 'FIBRAS MUSCULARES', brain: 'CEREBRO INTACTO', myth: 'CONTROLA EL CEREBRO', truth: 'CONTROLA LOS MÚSCULOS', climb: 'ASCENSO', bite: 'MORDIDA FINAL', release: 'NUEVAS ESPORAS', end: 'EL CICLO CONTINÚA' },
  voice: { language: 'es', rate: 160, pitch: 42 },
  musicGain: 0.16,
  scenes: [
    { id: 'objetivo', start: 0, end: 4, heading: 'UNA HORMIGA. UN HONGO.', text: 'Este hongo convierte a una hormiga en zombi.' },
    { id: 'esporas', start: 4, end: 10, heading: 'LA INFECCIÓN EMPIEZA', text: 'Sus esporas caen sobre una hormiga carpintera y entran por su cuerpo.' },
    { id: 'interior', start: 10, end: 18, heading: 'INVASIÓN INTERIOR', text: 'Dentro, el hongo se multiplica y se extiende entre sus músculos.' },
    { id: 'cerebro', start: 18, end: 27, heading: 'EL CEREBRO SIGUE AHÍ', text: 'Se creía que tomaba el cerebro. Pero el cerebro casi no lo toca.' },
    { id: 'ascenso', start: 27, end: 35, heading: 'FUERA DEL NIDO', text: 'Controla los músculos: la hormiga deja su nido y sube a una planta.' },
    { id: 'ciclo', start: 35, end: 42, heading: 'UNA ÚLTIMA MORDIDA', text: 'Muerde una hoja con todas sus fuerzas y muere. De su cabeza crece un tallo que lanza esporas.' },
    { id: 'pregunta', start: 42, end: 46, heading: 'AHORA TE TOCA A TI', text: '¿Qué otro animal controlado conoces?' }
  ]
};
