/* ============================================================
   RAMA — The Retro Game · firebase.js — PASTE YOUR FIREBASE CONFIG HERE (one place only)
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Firebase config (PASTE YOURS HERE) ---------------- */
const FIREBASE_CONFIG = {
  apiKey:"AIzaSyCbPr0N0PUAJ3cN6SxYoIV3Ra4-__NEOLg",
  authDomain:"rama-664f4.firebaseapp.com",
  projectId:"rama-664f4",
  storageBucket:"rama-664f4.firebasestorage.app",
  messagingSenderId:"1038648975266",
  appId:"1:1038648975266:web:8ae72d951bcdc4312ddcfb",
  measurementId:"G-BB98CEJWSE"
};

/* ---------------- Cloud adapter (Firestore + local fallback) -------- */
const Cloud = {
  ready:false, offline:true, user:null, db:null, _t:null,
  init(){
    if(!FIREBASE_CONFIG){ this.offline=true; return; }
    try{
      firebase.initializeApp(FIREBASE_CONFIG);
      this.db = firebase.firestore();
      this.offline=false; this.ready=true;
    }catch(e){ this.offline=true; }
  },
  signIn(){
    if(this.offline) return Promise.reject(new Error('offline'));
    const prov = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(prov).catch(err=>{
      /* popup blocked (common on mobile) -> full-page redirect flow */
      const code=err&&err.code||'';
      if(code==='auth/popup-blocked'||code==='auth/popup-closed-by-user'||
         code==='auth/cancelled-popup-request'||code==='auth/operation-not-supported-in-this-environment'){
        return firebase.auth().signInWithRedirect(prov);
      }
      throw err;
    });
  },
  onAuth(cb){
    if(this.offline){ cb(null); return; }
    try{ firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{}); }catch(e){}
    firebase.auth().getRedirectResult().catch(()=>{});
    firebase.auth().onAuthStateChanged(cb);
  },
  async load(uid){
    if(this.offline||!uid) return null;
    try{ const d=await this.db.collection('saves').doc(uid).get();
      return d.exists? d.data():null; }catch(e){ return null; }
  },
  save(uid,data){
    if(this.offline||!uid) return;
    this._last=data;
    clearTimeout(this._t);
    this._t=setTimeout(()=>{ this._write(); },1200);
  },
  _write(){
    if(this.offline||!this.user||!this._last) return;
    this.db.collection('saves').doc(this.user.uid)
      .set(this._last,{merge:true}).catch(()=>{ toast&&toast('⚠ cloud save failed — retrying'); 
        clearTimeout(this._t); this._t=setTimeout(()=>this._write(),4000); });
  },
  flush(){ if(this._last){ clearTimeout(this._t); this._write(); } },
  submitScore(uid,name,photo,score){
    if(this.offline||!uid) return;
    this.db.collection('leaderboard').doc(uid).set({
      name:name||'Pilgrim', photo:photo||'', score:score,
      t:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true}).catch(()=>{});
  },
  async top(n=10){
    if(this.offline) return [];
    try{ const q=await this.db.collection('leaderboard')
        .orderBy('score','desc').limit(n).get();
      return q.docs.map(d=>d.data()); }catch(e){ return []; }
  }
};

