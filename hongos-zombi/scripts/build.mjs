import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import config from '../config.js';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
process.chdir(root);
await mkdir('assets',{recursive:true}); await mkdir('compositions',{recursive:true});
await writeFile('assets/config.json',JSON.stringify(config,null,2));
execFileSync(process.env.PYTHON || 'python3',['scripts/audio.py'],{stdio:'inherit'});
const timed=JSON.parse(await readFile('assets/timing.json','utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
await copyFile('node_modules/gsap/dist/gsap.min.js','assets/gsap.min.js');
await writeFile('assets/settings.js',`window.HONGOS_CONFIG = ${JSON.stringify(config)};\n`);
for(const [i,s] of timed.scenes.entries()){
 const duration=s.end-s.start;
 await writeFile(`compositions/${s.id}.html`,`<template>
 <style>#root{position:absolute;inset:0} #${s.id}-canvas{position:absolute;inset:0;width:720px;height:1280px} .heading{position:absolute;left:74px;top:162px;width:572px;color:${config.palette.white};font:700 42px/1.05 Arial;letter-spacing:-1px;margin:0} .kicker{position:absolute;left:74px;top:125px;color:${config.palette.amber};font:700 21px Arial;letter-spacing:3px}</style>
 <div id="root" data-composition-id="${s.id}" data-width="720" data-height="1280">
 <canvas id="${s.id}-canvas" width="720" height="1280" data-layout-ignore></canvas>
 <div class="kicker">${esc(config.title)} · ${i+1}/7</div>
 <h1 class="heading" data-var-text="heading">${esc(s.heading)}</h1>
 </div>
 <script>
 (()=>{const c=document.getElementById('${s.id}-canvas');const state={time:0};const scene=${JSON.stringify({id:s.id})};
 const paint=()=>window.Hongos.draw(c,scene,state.time);paint();
 const tl=gsap.timeline({paused:true});tl.to(state,{time:${duration},duration:${duration},ease:'none',onUpdate:paint},0);
 window.__timelines=window.__timelines||{};window.__timelines['${s.id}']=tl;})();
 </script></template>`);
}
const words=timed.scenes.flatMap(s=>s.words.map(w=>({...w,start:w.start+s.start,end:w.end+s.start})));
await writeFile('compositions/captions.html',`<template><style>#root{position:absolute;inset:0}.word{position:absolute;left:74px;top:965px;width:572px;text-align:center;color:${config.palette.lime};font:700 61px/1.15 Arial;text-shadow:0 0 16px #c6ff3940}.word span{display:inline-block;padding:4px 0;border-bottom:3px solid ${config.palette.lime}}</style><div id="root" data-composition-id="captions" data-width="720" data-height="1280" data-no-timeline>${words.map((w,i)=>`<div id="word-${i}" class="clip word" data-start="${w.start}" data-duration="${(w.end-w.start).toFixed(4)}" data-track-index="1"><span>${esc(w.text)}</span></div>`).join('\n')}</div></template>`);
await writeFile('index.html',`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(config.title)}</title><style>html,body{margin:0;background:${config.palette.background}}#root{position:relative;width:720px;height:1280px;overflow:hidden}.scene{position:absolute;inset:0}</style><script src="assets/gsap.min.js"></script><script src="assets/settings.js"></script><script src="assets/draw.js"></script></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="46" data-width="720" data-height="1280" data-fps="30">
${timed.scenes.map((s,i)=>`<div id="${s.id}" class="clip scene" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.end-s.start}" data-width="720" data-height="1280" data-track-index="1" data-track-kind="graphics" data-variable-values='${JSON.stringify({heading:s.heading})}'></div>
<audio id="voice-${i}" class="clip" src="assets/${s.id}.wav" data-start="${s.start+.12}" data-duration="${s.audioDuration.toFixed(5)}" data-track-index="3" data-volume="1"></audio>`).join('\n')}
<div id="captions" data-no-timeline class="clip scene" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="46" data-width="720" data-height="1280" data-track-index="2" data-track-kind="captions" style="z-index:20;pointer-events:none"></div>
<audio id="music" class="clip" src="assets/music.wav" data-start="0" data-duration="46" data-track-index="4" data-volume="${config.musicGain}" data-fade-in="1.5" data-fade-out="2"></audio>
</div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true}).to({t:0},{t:46,duration:46,ease:'none'});</script></body></html>`);
function stamp(t){return new Date(Math.round(t*1000)).toISOString().slice(11,23).replace('.',',')}
await writeFile('assets/subtitles.srt',words.map((w,i)=>`${i+1}\n${stamp(w.start)} --> ${stamp(w.end)}\n${w.text}\n`).join('\n'));
console.log(`Built 7 scenes, ${words.length} synthesis-aligned word captions, 46 seconds.`);
