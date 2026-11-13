(()=>{'use strict';
const NAME='family-finance-workbook-v05',KEY='familyfinance_v02';
let queue=Promise.resolve(), ready=false;
const open=()=>new Promise((ok,no)=>{const r=indexedDB.open(NAME,2);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('archive'))d.createObjectStore('archive');if(!d.objectStoreNames.contains('ledger'))d.createObjectStore('ledger')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error||Error('IndexedDB unavailable'));r.onblocked=()=>no(Error('Database blocked by another tab'))});
const read=async(store,key)=>{const d=await open();try{return await new Promise((ok,no)=>{const r=d.transaction(store,'readonly').objectStore(store).get(key);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}finally{d.close()}};
const commit=async(ledger,archive)=>{const d=await open();try{await new Promise((ok,no)=>{const tx=d.transaction(archive?'archive ledger'.split(' '):['ledger'],'readwrite');tx.objectStore('ledger').put({data:ledger,updated:Date.now()},'current');if(archive)tx.objectStore('archive').put(archive,'workbook');tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error||Error('IndexedDB write failed'));tx.onabort=()=>no(tx.error||Error('IndexedDB transaction aborted'))})}finally{d.close()}};
const originalSave=save;
function localCopy(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(e){console.warn('Local storage capacity exceeded; ledger retained in IndexedDB',e);return false}}
function writeLater(){const snapshot=structuredClone(db);queue=queue.catch(()=>{}).then(()=>commit(snapshot));return queue}
window.FFPersist={get ready(){return ready},wait:()=>queue,read,commit,localCopy,
 async importWorkbook(next,archive,progress){await queue;if(progress)progress('Writing ledger to IndexedDB…');await commit(next,archive);db=next;/* Large imports must not synchronously stringify into localStorage or render thousands of rows. IndexedDB is canonical. */return true}};
save=function(){db._ledgerRevision=(db._ledgerRevision||0)+1;render();writeLater().catch(err=>{console.error('Ledger persistence failed',err);alert('Could not save data: '+err.message+'. Keep your backup and do not close this page.')});if(!ready)localCopy()};
(async()=>{try{const stored=await read('ledger','current');if(stored?.data&&Array.isArray(stored.data.transactions)){
 // IndexedDB is canonical after a large import; retain local-only transactions if their IDs are absent.
 const current=db;const saved=stored.data;const ids=new Set(saved.transactions.map(t=>t.id));for(const t of current.transactions||[]){if(!ids.has(t.id)){saved.transactions.push(t);ids.add(t.id)}}
 for(const a of current.accounts||[])if(!saved.accounts.includes(a))saved.accounts.push(a);
 db=saved;for(const t of db.transactions){if(t.category&&!CATS.includes(t.category))CATS.push(t.category)}
 render();
 }else if(db.transactions.length){await commit(structuredClone(db))}
 ready=true;
 const status=document.getElementById('fullStatus');if(status)status.textContent='Storage ready. Large histories are saved in IndexedDB.';
}catch(err){ready=false;const status=document.getElementById('fullStatus');if(status)status.textContent='Storage unavailable: '+err.message;console.error(err)}})();
})();