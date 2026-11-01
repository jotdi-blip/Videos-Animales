export const CONFIG = {
  width: 720,
  height: 1280,
  fps: 30,
  scenes: [
    { id: 'familia', duration: 8, review: [1.4, 4.4, 7.1] },
    { id: 'veneno', duration: 8, review: [1.3, 4.0, 7.0] },
    { id: 'dientes', duration: 8, review: [1.0, 4.4, 7.1] },
    { id: 'defensa', duration: 8, review: [1.0, 4.3, 7.0] },
    { id: 'bolsa', duration: 8, review: [1.4, 4.0, 7.0] },
    { id: 'arbol', duration: 8, review: [1.5, 4.2, 7.0] },
    { id: 'patio', duration: 8, review: [1.0, 3.8, 7.0] },
    { id: 'fuego', duration: 10, review: [1.7, 5.3, 7.4, 9.5] }
  ],
  colors: {
    sky: '#101e40', soil: '#86513f', soilDark: '#633e38',
    grass: '#729f78', grassEdge: '#96c485', paving: '#d6b997',
    fur: '#bec6cc', face: '#fff1db', ear: '#282735', eye: '#151823',
    tail: '#e99caa', nose: '#ed9fac', wall: '#dc9f87', wallCap: '#f5c7a2',
    teal: '#5eafa9', yellow: '#ffcc75', plant: '#438c73',
    blood: '#bd4d62', antibody: '#55cfff', venom: '#a0df60',
    legendSky: '#6d373a', legendGround: '#be7955', stone: '#929095',
    fire: '#ff9b45', ember: '#ff592c'
  }
};
export const DURATION = CONFIG.scenes.reduce((s, x) => s + x.duration, 0);
export function sceneAt(t) {
  let start = 0;
  for (let index = 0; index < CONFIG.scenes.length; index++) {
    const scene = CONFIG.scenes[index];
    if (t < start + scene.duration || index === CONFIG.scenes.length - 1) {
      const local = Math.max(0, Math.min(scene.duration, t - start));
      return { index, local, progress: local / scene.duration, start };
    }
    start += scene.duration;
  }
}
