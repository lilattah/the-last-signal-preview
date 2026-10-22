// The Last Signal: browser-local editorial prototype. No server, no shared persistence.
const TLS_DB_NAME='tls_editorial_v1';
function tlsOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open(TLS_DB_NAME,1);r.onupgradeneeded=()=>{const d=r.result;['episodes','polls','supporters','settings'].forEach(n=>{if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function tlsAll(store){const db=await tlsOpen();return new Promise((ok,no)=>{const t=db.transaction(store);const r=t.objectStore(store).getAll();r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function tlsGet(store,id){const db=await tlsOpen();return new Promise((ok,no)=>{const t=db.transaction(store);const r=t.objectStore(store).get(id);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function tlsPut(store,value){const db=await tlsOpen();return new Promise((ok,no)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=()=>ok(value);t.onerror=()=>no(t.error)})}
async function tlsDelete(store,id){const db=await tlsOpen();return new Promise((ok,no)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).delete(id);t.oncomplete=()=>ok();t.onerror=()=>no(t.error)})}
function tlsEscape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tlsId(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
async function tlsHash(user,password,salt){const data=new TextEncoder().encode(salt+':'+user+':'+password);const out=await crypto.subtle.digest('SHA-256',data);return Array.from(new Uint8Array(out)).map(x=>x.toString(16).padStart(2,'0')).join('')}
window.TLS={all:tlsAll,get:tlsGet,put:tlsPut,del:tlsDelete,esc:tlsEscape,id:tlsId,hash:tlsHash};