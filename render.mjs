import http from 'node:http';
import {readFile, mkdir, mkdtemp, rm, rename, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn, spawnSync} from 'node:child_process';
import {PNG} from 'pngjs';
import puppeteer from 'puppeteer';
import config from './config.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const v={...config.video};
for(const [env,key] of [['WIDTH','width'],['HEIGHT','height'],['FPS','fps']])if(process.env[env])v[key]=Number(process.env[env]);
for(const key of ['width','height','fps','duration'])if(!Number.isFinite(v[key])||v[key]<=0)throw new Error(`Parámetro inválido: ${key}`);
if(!Number.isInteger(v.width)||!Number.isInteger(v.height)||v.width%2||v.height%2||v.width/v.height!==9/16)throw new Error('Usa dimensiones pares 9:16 (720×1280 o 1080×1920)');
if(!Number.isInteger(v.duration*v.fps))throw new Error('La duración debe producir un número entero de cuadros');
if(config.scenes[0].start!==0||config.scenes.at(-1).end!==v.duration||config.scenes.some((s,i)=>s.end<=s.start||(i&&s.start!==config.scenes[i-1].end)))throw new Error('Las escenas deben cubrir toda la duración sin huecos');
const mime={'.html':'text/html','.js':'text/javascript','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,framesDir;
try{
 const args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars'];
 const launch={headless:true,args};
 if(process.env.PUPPETEER_EXECUTABLE_PATH)launch.executablePath=process.env.PUPPETEER_EXECUTABLE_PATH;
 browser=await puppeteer.launch(launch);const page=await browser.newPage();await page.setViewport({width:v.width,height:v.height,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle0'});await page.waitForFunction('window.ready === true',{timeout:60000});await page.evaluate(()=>document.fonts.ready);
 const check=process.argv.includes('--check');
 if(check){
   await mkdir(path.join(root,'work'),{recursive:true});
   for(const [i,s] of config.scenes.entries()){await page.evaluate(t=>window.render(t),(s.start+s.end)/2);await page.screenshot({path:path.join(root,`work/scene-${i+1}.png`),type:'png'});}
   const captures=[];for(const t of [20,2,36,20]){await page.evaluate(t=>window.render(t),t);const png=await page.screenshot({type:'png',path:path.join(root,`work/hash-${captures.length}.png`)});captures.push(PNG.sync.read(png));}
   let maxDifference=0;for(let i=0;i<captures[0].data.length;i++)maxDifference=Math.max(maxDifference,Math.abs(captures[0].data[i]-captures[3].data[i]));if(maxDifference>2)throw new Error(`El estado depende del orden de renderizado: diferencia ${maxDifference}`);
   for(const t of [0,4,10,18,27,35,42,46])await page.evaluate(t=>window.render(t),t);
   if(errors.length)throw new Error(errors.join('\n'));
   console.log('OK: 7 escenas, límites y render(20) reproducible después de saltos (tolerancia 2/255 por canal).');
 }else{
   if(spawnSync('ffmpeg',['-version'],{stdio:'ignore'}).status!==0)throw new Error('ffmpeg no disponible');
   await mkdir(path.join(root,'work'),{recursive:true});framesDir=await mkdtemp(path.join(root,'work/frames-'));
   const total=v.duration*v.fps;for(let frame=0;frame<total;frame++){
     await page.evaluate(t=>window.render(t),frame/v.fps);
     await page.screenshot({path:path.join(framesDir,`${String(frame).padStart(6,'0')}.png`),type:'png',captureBeyondViewport:false});
     if(frame%v.fps===0)console.log(`Captura ${frame}/${total} (${(frame/v.fps).toFixed(0)} s)`);
     if(errors.length)throw new Error(errors.join('\n'));
   }
   const dest=path.resolve(root,v.output),temp=dest.replace(/\.mp4$/,'.tmp.mp4');if(!dest.endsWith('.mp4'))throw new Error('La salida debe ser MP4');await mkdir(path.dirname(dest),{recursive:true});
   await new Promise((resolve,reject)=>{const ff=spawn('ffmpeg',['-y','-framerate',String(v.fps),'-i',path.join(framesDir,'%06d.png'),'-frames:v',String(total),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',temp],{stdio:['ignore','ignore','inherit']});ff.on('error',reject);ff.on('close',code=>code===0?resolve():reject(new Error(`ffmpeg terminó con ${code}`)));});
   await access(temp);await rename(temp,dest);console.log(`Video listo: ${dest}`);
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));if(framesDir&&!process.env.KEEP_FRAMES)await rm(framesDir,{recursive:true,force:true});}
