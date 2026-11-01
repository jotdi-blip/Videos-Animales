import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, rename, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
import { CONFIG, DURATION } from './config.js';

const root=dirname(fileURLToPath(import.meta.url));
const out=resolve(root,'output');
const reviewOnly=process.argv.includes('--review');
await mkdir(resolve(root,'work'),{recursive:true});
await mkdir(resolve(out,'review'),{recursive:true});
// Serve exclusively this project. No CDN, arbitrary file access, or audio assets.
const server=createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}
  const type={'.html':'text/html','.js':'text/javascript','.json':'application/json'}[extname(path)]||'application/octet-stream';
  const data=await readFile(path);
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);
 } catch {res.writeHead(404).end();}
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const address=`http://127.0.0.1:${server.address().port}`;
let browser,encoder;
const faults=[];
try {
 let executablePath=process.env.PUPPETEER_EXECUTABLE_PATH;
 if(!executablePath) {
  const managed=puppeteer.executablePath();
  executablePath=existsSync(managed)?managed:['/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome'].find(existsSync);
 }
 browser=await puppeteer.launch({headless:true,executablePath,args:[
  '--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox',
  '--disable-dev-shm-usage','--hide-scrollbars','--disable-background-timer-throttling',
  '--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows',
  '--force-color-profile=srgb','--disable-gpu-vsync'
 ]});
 const page=await browser.newPage();
 await page.setViewport({width:CONFIG.width,height:CONFIG.height,deviceScaleFactor:1});
 page.on('pageerror',e=>faults.push(String(e)));
 await page.goto(address,{waitUntil:'networkidle0'});
 await page.waitForFunction('window.ready === true',{timeout:60000});
 const getFrame=async t=>{
  await page.evaluate(t=>window.render(t),t);
  return Buffer.from(await page.screenshot({type:'png',optimizeForSpeed:true}));
 };
 // Compare hashes after deliberately seeking backwards and across scene changes.
 const seekTimes=[.6,4,11.5,20.4,28.1,37.5,46.8,53.4,56.5,63.2];
 const hashes=new Map();
 for(const t of seekTimes)hashes.set(t,createHash('sha256').update(await getFrame(t)).digest('hex'));
 for(const t of seekTimes.toReversed()){
  const hash=createHash('sha256').update(await getFrame(t)).digest('hex');
  if(hash!==hashes.get(t))throw new Error(`Non-deterministic render at ${t}s`);
 }
 console.log('Determinism: forward / reverse PNG hashes match.');
 const review=[];let start=0;
 for(const [i,scene] of CONFIG.scenes.entries()){
  for(const local of scene.review){
   // Review markers retain their proportional positions when duration changes.
   const reference=i===7?10:8;
   const t=start+local/reference*scene.duration;
   const data=await getFrame(t);
   const png=PNG.sync.read(data);
   const sample=new Set();let n=0;
   for(let k=0;k<png.data.length;k+=4*101){sample.add((png.data[k]>>4)*256+(png.data[k+1]>>4)*16+(png.data[k+2]>>4));n++;}
   if(sample.size<40)throw new Error(`Empty or incomplete scene ${scene.id} at ${t}s`);
   const file=`${String(i+1).padStart(2,'0')}-${scene.id}-${local.toFixed(1)}.png`;
   await writeFile(resolve(out,'review',file),data);
   review.push({scene:i+1,id:scene.id,time:t,file,colors:sample.size});
  }
  start+=scene.duration;
 }
 await writeFile(resolve(out,'review','manifest.json'),JSON.stringify({width:CONFIG.width,height:CONFIG.height,duration:DURATION,deterministic:true,frames:review},null,2));
 console.log(`Review: ${review.length} full-resolution PNGs saved.`);
 if(!reviewOnly){
  const frames=Math.round(DURATION*CONFIG.fps);
  if(Math.abs(frames/CONFIG.fps-DURATION)>1e-8)throw new Error('Scene durations must total a whole number of frames.');
  const tmp=resolve(out,`tlacuache.${process.pid}.tmp.mp4`);
  encoder=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-y',
   '-f','image2pipe','-framerate',String(CONFIG.fps),'-vcodec','png','-i','pipe:0',
   '-map','0:v:0','-an','-sn','-c:v','libx264','-preset','fast','-crf','19',
   '-pix_fmt','yuv420p','-r',String(CONFIG.fps),'-frames:v',String(frames),
   '-movflags','+faststart','-metadata','comment=Deterministic Three.js diorama',tmp
  ],{stdio:['pipe','ignore','inherit']});
  const finished=once(encoder,'close');
  encoder.stdin.on('error',e=>faults.push(String(e)));
  const begin=performance.now();
  for(let frame=0;frame<frames;frame++){
   if(encoder.exitCode!==null)throw new Error(`ffmpeg exited early: ${encoder.exitCode}`);
   const data=await getFrame(frame/CONFIG.fps);
   if(!encoder.stdin.write(data))await once(encoder.stdin,'drain');
   if(frame%90===0)console.log(`Frame ${frame}/${frames}; elapsed ${((performance.now()-begin)/1000).toFixed(0)}s`);
  }
  encoder.stdin.end();const [code]=await finished;
  if(code!==0)throw new Error(`ffmpeg failed: ${code}`);
  if(faults.length)throw new Error(faults.join('\n'));
  await rename(tmp,resolve(out,'tlacuache.mp4'));
  const info=await stat(resolve(out,'tlacuache.mp4'));
  console.log(`Complete: ${frames} frames, ${DURATION}s, ${(info.size/1048576).toFixed(2)} MiB.`);
 }
 if(faults.length)throw new Error(faults.join('\n'));
} finally {
 if(encoder&&encoder.exitCode===null)encoder.kill();
 if(browser)await browser.close();
 server.close();
}
