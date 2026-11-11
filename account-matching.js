/* v1.0.8: case/whitespace-insensitive account matching, without changing imported records. */
(()=>{'use strict';
 const key=s=>String(s??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-GB');
 const clean=s=>String(s??'').trim().replace(/\s+/g,' ');
 function groups(){
  const names=[...(db.accounts||[]),...(db.transactions||[]).flatMap(t=>[t.account,t.transferTo]).filter(Boolean),...Object.keys(db.accountCurrencies||{}),...Object.keys(db.accountSnapshots||{})];
  const buckets=new Map();for(const n of names){const k=key(n);if(!k)continue;if(!buckets.has(k))buckets.set(k,[]);if(!buckets.get(k).includes(n))buckets.get(k).push(n)}
  const result=[];for(const [k,aliases] of buckets){
   const currencyValues=[...new Set(aliases.map(n=>db.accountCurrencies?.[n]).filter(Boolean))];
   const snapshots=aliases.map(n=>({name:n,s:db.accountSnapshots?.[n]})).filter(x=>x.s);
   const uniqueSnapshots=[...new Set(snapshots.map(x=>JSON.stringify({amount:x.s.amount,date:x.s.date})))];
   const conflict=currencyValues.length>1||uniqueSnapshots.length>1;
   const label=clean(aliases.find(n=>(db.accounts||[]).includes(n))||aliases[0]);
   if(conflict){for(const n of aliases)result.push({key:k+'|'+n,label:clean(n),aliases:[n],currency:db.accountCurrencies?.[n]||'GBP',snapshotKey:n,conflict:true});}
   else result.push({key:k,label,aliases,currency:currencyValues[0]||'GBP',snapshotKey:snapshots[0]?.name||label,conflict:false});
  }return result.sort((a,b)=>a.label.localeCompare(b.label,'en-GB'));
 }
 const find=n=>groups().find(g=>g.aliases.some(a=>key(a)===key(n))&&!g.conflict)||groups().find(g=>g.aliases.includes(n));
 const equal=(a,b)=>{const ga=find(a),gb=find(b);return ga&&gb?ga.key===gb.key:key(a)===key(b)};
 const names=()=>groups().map(g=>g.label);
 const canonical=n=>find(n)?.label||clean(n);
 const currency=n=>find(n)?.currency||'GBP';
 window.FFAccounts={key,groups,find,equal,names,canonical,currency};
})();
