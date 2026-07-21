/* ============================================================
   RAMA V1 · core/firebase.js
   THE ONLY FILE TO EDIT for Firebase. Paste your config below —
   everything else (auth, cloud save, leaderboard) activates
   automatically. Until then, the game runs fully offline
   (guest-first design: play instantly, sign in only to sync).

   Uses the Firebase COMPAT SDK (loaded via <script> tags in
   index.html, not npm) so this stays a plain ES module with
   zero build step — matches the rest of the V1 engine.
============================================================ */

export const FIREBASE_CONFIG = null; /* e.g.
export const FIREBASE_CONFIG = {
  apiKey:"...", authDomain:"your-project.firebaseapp.com",
  projectId:"your-project", storageBucket:"...",
  messagingSenderId:"...", appId:"..."
}; */

export const Cloud = {
  ready: false, offline: true, user: null, db: null,
  _last: null, _t: null,

  init(){
    if(!FIREBASE_CONFIG || typeof firebase === 'undefined'){ this.offline = true; return; }
    try{
      firebase.initializeApp(FIREBASE_CONFIG);
      this.db = firebase.firestore();
      this.offline = false; this.ready = true;
    }catch(e){ this.offline = true; }
  },

  signIn(){
    if(this.offline) return Promise.reject(new Error('offline'));
    const prov = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(prov).catch(err => {
      const code = err && err.code || '';
      if(['auth/popup-blocked','auth/popup-closed-by-user',
          'auth/cancelled-popup-request',
          'auth/operation-not-supported-in-this-environment'].includes(code)){
        return firebase.auth().signInWithRedirect(prov);   // mobile-safe fallback
      }
      throw err;
    });
  },

  signOut(){ if(!this.offline) firebase.auth().signOut(); this.user = null; },

  onAuth(cb){
    if(this.offline){ cb(null); return; }
    try{ firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{}); }catch(e){}
    firebase.auth().getRedirectResult().catch(()=>{});
    firebase.auth().onAuthStateChanged(u => { this.user = u; cb(u); });
  },

  async load(uid){
    if(this.offline || !uid) return null;
    try{ const d = await this.db.collection('saves').doc(uid).get();
      return d.exists ? d.data() : null; }catch(e){ return null; }
  },

  save(data){
    if(this.offline || !this.user) return;
    this._last = data;
    clearTimeout(this._t);
    this._t = setTimeout(() => this._write(), 1200);
  },
  _write(){
    if(this.offline || !this.user || !this._last) return;
    this.db.collection('saves').doc(this.user.uid).set(this._last, { merge: true })
      .catch(() => { clearTimeout(this._t); this._t = setTimeout(() => this._write(), 4000); });
  },
  flush(){ if(this._last){ clearTimeout(this._t); this._write(); } },

  submitScore(name, photo, score){
    if(this.offline || !this.user) return;
    this.db.collection('leaderboard').doc(this.user.uid).set({
      name: name || 'Pilgrim', photo: photo || '', score,
      t: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }).catch(() => {});
  },
  async top(n = 10){
    if(this.offline) return [];
    try{ const q = await this.db.collection('leaderboard').orderBy('score', 'desc').limit(n).get();
      return q.docs.map(d => d.data()); }catch(e){ return []; }
  },
};
