/* ============================================================
   RAMA — The Retro Game · audio.js — chiptune-raga engine (music, sfx)
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Audio: chiptune-raga engine ---------------- */
const Audio2={
  AC:null, muted:false, master:null, droneG:null, iv:null, step:0, track:null, name:null,
  unlock(){ if(!this.AC){ try{
      this.AC=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.AC.createGain(); this.master.gain.value=.8;
      this.master.connect(this.AC.destination);
    }catch(e){} }
    if(this.AC&&this.AC.state==='suspended') this.AC.resume();
    if(this.name&&!this.iv) this.play(this.name,true);
  },
  tone(f,dur,type,vol,slide){
    if(!this.AC||this.muted)return;
    const t=this.AC.currentTime,o=this.AC.createOscillator(),g=this.AC.createGain();
    o.type=type; o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.linearRampToValueAtTime(Math.max(30,f+slide),t+dur);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+dur+.02);
  },
  noise(dur,vol,hp){
    if(!this.AC||this.muted)return;
    const t=this.AC.currentTime, n=this.AC.sampleRate*dur|0,
      buf=this.AC.createBuffer(1,n,this.AC.sampleRate), ch=buf.getChannelData(0);
    for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);
    const s=this.AC.createBufferSource(); s.buffer=buf;
    const f=this.AC.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp||2000;
    const g=this.AC.createGain(); g.gain.value=vol;
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  },
  /* Yaman-flavoured scale (Lydian): S R G M# P D N */
  RAGA:[0,2,4,6,7,9,11,12,14,16,18,19],
  TRACKS:{
    ayodhya:{bpm:96, root:146.83, mel:'triangle', vol:.06,
      seq:[0,null,2,4, 7,null,4,2, 4,null,7,9, 7,null,4,null,
           0,null,2,4, 7,null,9,11, 12,null,11,9, 7,null,4,2],
      tabla:[1,0,0,2, 0,0,1,0, 1,0,0,2, 0,2,1,0]},
    forest:{bpm:84, root:110.00, mel:'triangle', vol:.055,
      seq:[0,null,4,null, 7,null,4,2, 0,null,2,null, 4,null,null,null,
           7,null,9,null, 12,null,9,7, 4,null,7,null, 2,null,null,null],
      tabla:[1,0,0,0, 2,0,0,0, 1,0,0,2, 0,0,2,0]},
    dusk:{bpm:72, root:130.81, mel:'triangle', vol:.05,
      seq:[4,null,null,2, 0,null,null,null, 2,null,4,null, 7,null,null,null,
           4,null,null,7, 9,null,null,null, 7,null,4,null, 2,null,null,null],
      tabla:[1,0,0,0, 0,0,2,0, 1,0,0,0, 2,0,0,0]}
  },
  play(name,force){
    if(this.name===name&&!force)return;
    this.stop(); this.name=name;
    const tr=this.TRACKS[name]; if(!tr||!this.AC)return;
    this.track=tr; this.step=0;
    /* tanpura-style drone: root + fifth, slow detune shimmer */
    this.droneG=this.AC.createGain(); this.droneG.gain.value=.035;
    this.droneG.connect(this.master); this.droneNodes=[];
    [[1,0],[1.5,.6],[2,-.7]].forEach(([m,det])=>{
      const o=this.AC.createOscillator(); o.type='sawtooth';
      o.frequency.value=tr.root*m/2; o.detune.value=det*6;
      const g=this.AC.createGain(); g.gain.value=.5;
      o.connect(g); g.connect(this.droneG); o.start(); this.droneNodes.push(o);
    });
    const stepMs=60000/tr.bpm/4;
    this.iv=setInterval(()=>{
      const i=this.step%32, n=tr.seq[i];
      if(n!==null&&n!==undefined){
        const st=this.RAGA[n%this.RAGA.length]+Math.floor(n/12)*12;
        this.tone(tr.root*Math.pow(2,st/12)*2,stepMs/1000*2.6,tr.mel,tr.vol);
      }
      const tb=tr.tabla[i%16];
      if(tb===1){ this.tone(72,.09,'sine',.11,-24); }       /* dha */
      else if(tb===2){ this.noise(.05,.05,3600); }          /* na  */
      this.step++;
    },stepMs);
  },
  pause(){ if(this.iv){clearInterval(this.iv);this.iv=null;}
    if(this.droneG)this.droneG.gain.value=0; },
  resume(){ if(this.name&&!this.iv){const n=this.name;this.name=null;this.play(n);} },
  stop(){ this.pause();
    if(this.droneNodes){this.droneNodes.forEach(o=>{try{o.stop()}catch(e){}});this.droneNodes=null;}
    this.name=null; this.track=null; },
  bell(){ this.tone(1244,1.6,'triangle',.09); this.tone(1866,1.2,'triangle',.04); },
  chirp(){ this.tone(2200+Math.random()*800,.08,'square',.02,300); },
  uiA(){ this.tone(880,.07,'square',.06); },
  uiB(){ this.tone(660,.06,'square',.05,-120); },
  dharma(){ this.tone(587,.5,'triangle',.09); setTimeout(()=>this.tone(880,.7,'triangle',.09),160);
    setTimeout(()=>this.tone(1174,.9,'triangle',.07),340); },
  stepSfx(){ this.noise(.03,.015,5000); }
};
