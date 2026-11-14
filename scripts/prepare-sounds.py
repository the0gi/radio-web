"""Prepare downloaded CC0 previews as mono, 24 kHz PCM loops. Requires numpy and macOS afconvert.
Usage: python prepare-sounds.py /absolute/path/to/source-directory
Source directory: rain.mp3, fire.mp3, airplane.mp3, birds.mp3, cafe.mp3.
"""
import sys,json,wave,subprocess,hashlib
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1]; source=Path(sys.argv[1]); target=root/'public/sounds';target.mkdir(exist_ok=True)
rate=24000; fade=rate*4; seconds=60
report_path=root/'research/sound-loop-checks.json'
keys=sys.argv[2:] or ['rain','fire','airplane','birds','cafe','noise']
report=[row for row in json.loads(report_path.read_text()) if row['id'] not in keys] if report_path.exists() else []
for key in keys:
 if key=='noise':x=np.random.default_rng(20261114).normal(0,.13,rate*34);length=rate*34
 else:
  decoded=source/(key+'-decoded.wav')
  subprocess.run(['/usr/bin/afconvert',str(source/(key+'.mp3')),str(decoded),'-f','WAVE','-d','LEI16@24000','-c','1'],check=True)
  with wave.open(str(decoded),'rb') as w:x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768
  # Skip opening handling noise; keep a full minute plus the four-second overlap.
  offset=rate*8;length=min(rate*(seconds+4),len(x)-offset);x=x[offset:offset+length]
 if len(x)<=fade*2:raise ValueError('Source too short: '+key)
 x=x-x.mean()
 # Wrap-around overlap: tail blends into head, then continues at sample fade.
 # Both joins follow the original sample sequence, avoiding a discontinuity.
 t=np.linspace(0,np.pi/2,fade)
 blend=x[-fade:]*np.cos(t)+x[:fade]*np.sin(t)
 y=np.concatenate([x[fade:-fade],blend]); y-=y.mean()
 target_rms={'fire':.12,'cafe':.09,'noise':.05}.get(key,.12)
 if key in ['fire','cafe']:
  y*=target_rms/np.sqrt(np.mean(y*y))
  y=.7*np.tanh(y/.7)  # tame isolated transients without making the entire ambience inaudible
 else:
  gain=min(target_rms/np.sqrt(np.mean(y*y)),.7/np.max(np.abs(y)));y*=gain
 pcm=(y*32767).round().astype('<i2');out=target/(key+'.wav')
 with wave.open(str(out),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(pcm.tobytes())
 jumps=np.abs(np.diff(pcm.astype(np.int32)));seam=abs(int(pcm[-1])-int(pcm[0]))
 report.append(dict(id=key,durationSeconds=len(pcm)/rate,sampleRate=rate,channels=1,bytes=out.stat().st_size,rms=round(float(np.sqrt(np.mean(y*y))),4),peak=round(float(np.max(np.abs(y))),4),seamStep=seam,internalStep99Percentile=round(float(np.percentile(jumps,99)),2),sha256=hashlib.sha256(out.read_bytes()).hexdigest(),processing='DC removal; 4-second equal-power wrap crossfade; RMS normalization with soft peak limiting for fire/cafe; 16-bit PCM'))
(root/'research/sound-loop-checks.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps([{k:v for k,v in r.items() if k in ['id','durationSeconds','bytes','seamStep','internalStep99Percentile']} for r in report],indent=2))
