import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync, statSync} from 'node:fs';
import config from '../config.js';
const file=process.argv[2] || '../output/hongos-zombi.mp4';
assert(statSync(file).size>100000,'Empty or implausibly small render');
const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file]));
const v=info.streams.find(s=>s.codec_type==='video'), a=info.streams.find(s=>s.codec_type==='audio');
assert.equal(v.width,720);assert.equal(v.height,1280);assert.equal(v.avg_frame_rate,'30/1');assert.equal(v.codec_name,'h264');assert.equal(Number(v.nb_frames),1380);assert(a,'Narration/music audio track missing');assert.equal(a.codec_name,'aac');assert(Math.abs(Number(info.format.duration)-46)<.08);
const words=JSON.parse(readFileSync('assets/words.json'));
assert.equal(words.map(w=>w.text).join(' '),config.scenes.map(s=>s.text).join(' '));
for(let i=0;i<words.length;i++){assert(words[i].end>words[i].start);assert(words[i].end<=46);if(i)assert(words[i].start>=words[i-1].end-.001);}
console.log('Verified: H.264/AAC, 720×1280, 30 fps, 1380 frames, 46 s; all script words captioned in order.');
