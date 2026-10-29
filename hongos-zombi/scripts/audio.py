"""Offline Spanish synthesis; word times come from eSpeak's actual WORD events."""
import ctypes as C
import json, math, re, struct, subprocess, sys, wave
from pathlib import Path
import espeakng_loader

root = Path(__file__).resolve().parents[1]
cfg = json.loads((root / 'assets/config.json').read_text())
lib = espeakng_loader.load_library()
class Id(C.Union):
    _fields_ = [('number', C.c_int), ('name', C.c_char_p), ('string', C.c_char * 8)]
class Event(C.Structure):
    _fields_ = [('type', C.c_int), ('unique_identifier', C.c_uint), ('text_position', C.c_int), ('length', C.c_int), ('audio_position', C.c_int), ('sample', C.c_int), ('user_data', C.c_void_p), ('id', Id)]
lib.espeak_Initialize.argtypes = [C.c_int, C.c_int, C.c_char_p, C.c_int]
sr = lib.espeak_Initialize(2, 0, str(Path(espeakng_loader.get_data_path()).parent).encode(), 0)
if sr <= 0: raise RuntimeError('eSpeak initialization failed')
lib.espeak_SetVoiceByName(cfg['voice']['language'].encode())
lib.espeak_SetParameter(1, cfg['voice']['rate'], 0)
lib.espeak_SetParameter(3, cfg['voice']['pitch'], 0)
pcm, events = bytearray(), []
@C.CFUNCTYPE(C.c_int, C.POINTER(C.c_short), C.c_int, C.POINTER(Event))
def callback(samples, count, ev):
    if samples and count: pcm.extend(C.string_at(samples, count * 2))
    i = 0
    while ev and ev[i].type:
        if ev[i].type == 1: events.append((ev[i].text_position, ev[i].audio_position / 1000))
        i += 1
    return 0
lib.espeak_SetSynthCallback(callback)
lib.espeak_Synth.argtypes = [C.c_char_p, C.c_size_t, C.c_uint, C.c_int, C.c_uint, C.c_uint, C.c_void_p, C.c_void_p]
all_words = []
for scene in cfg['scenes']:
    pcm.clear(); events.clear()
    data = scene['text'].encode('utf-8')
    if lib.espeak_Synth(data, len(data) + 1, 0, 1, 0, 1, None, None): raise RuntimeError('Synthesis failed')
    lib.espeak_Synchronize()
    raw = root / 'assets' / f"{scene['id']}-raw.wav"
    with wave.open(str(raw), 'wb') as w:
        w.setparams((1, 2, sr, 0, 'NONE', 'not compressed')); w.writeframes(pcm)
    duration = len(pcm) / (2 * sr)
    available = scene['end'] - scene['start'] - 0.35
    tempo = max(0.6, duration / available)
    dest = root / 'assets' / f"{scene['id']}.wav"
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(raw),'-af',f'atempo={tempo},loudnorm=I=-18:TP=-2:LRA=7','-ar','48000',str(dest)],check=True)
    raw.unlink()
    tokens = list(re.finditer(r'\S+', scene['text']))
    starts = []
    for tok in tokens:
        found = [t for pos,t in events if tok.start() <= pos-1 < tok.end()]
        if not found: raise RuntimeError(f"No synthesis boundary: {tok.group()} / {events}")
        starts.append(min(found) / tempo)
    words = []
    for i,tok in enumerate(tokens):
        start = starts[i] + 0.12
        end = (starts[i+1] if i+1 < len(starts) else duration / tempo) + 0.12
        words.append({'text':tok.group(), 'start':round(start,4),'end':round(end,4)})
    scene['words'] = words
    scene['audioDuration'] = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(dest)]))
    all_words.extend([{**w,'start':w['start']+scene['start'],'end':w['end']+scene['start']} for w in words])
(root/'assets/timing.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2))
(root/'assets/words.json').write_text(json.dumps(all_words,ensure_ascii=False,indent=2))
# Original ambient score: A minor / F / C / G, slow pads and a restrained pulse.
rate=48000
with wave.open(str(root/'assets/music.wav'),'wb') as w:
    w.setparams((1,2,rate,0,'NONE','not compressed'))
    chords=[(110,164.8138,220,261.6256),(87.3071,130.8128,174.6141,220),(130.8128,196,261.6256,329.6276),(98,146.8324,196,246.9417)]
    block=bytearray()
    for n in range(rate*cfg['duration']):
        t=n/rate; ci=int(t/6)%4; phase=t%6; fade=min(1,phase/1.2,(6-phase)/1.2)
        signal=sum(math.sin(2*math.pi*f*t+0.2*math.sin(t*.4)) for f in chords[ci])/4
        signal*=0.22*max(0,fade)*(0.8+0.2*math.sin(t*.7))
        signal+=0.012*math.sin(2*math.pi*880*t)*math.exp(-8*(t%0.75))
        signal*=min(1,t/1.5,(46-t)/2)
        block.extend(struct.pack('<h',int(max(-1,min(1,signal))*32767)))
        if len(block)>=96000: w.writeframes(block); block.clear()
    w.writeframes(block)
