/* Private update file never leaves this browser. */
(()=>{'use strict';const $=id=>document.getElementById(id);let pending=null;
 const norm=s=>String(s||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-GB');
 const identity=t=>[t.date,norm(t.merchant),Number(t.amount).toFixed(2),norm(t.account)].join('|');
 const sameSource=(a,b)=>a.sourceSheet===b.sourceSheet&&Number(a.sourceRow)===Number(b.sourceRow);
 const changes=(a,b)=>['date','merchant','amount','category','account','note','originalSignedAmount'].some(k=>String(a[k]??'')!==String(b[k]??''));
 function plan(){const byId=new Map(db.transactions.map(t=>[t.id,t]));const existing=new Set(db.transactions.map(identity));let update=[],add=[],edited=[],conflicts=[],same=0,ambiguous=0;
  for(const next of pending.transactions){const prev=byId.get(next.id);
   if(prev){if(prev.editHistory?.length){edited.push(next);continue}
    // IDs derive from worksheet row number; refuse to overwrite if row identity changed.
    if(!sameSource(prev,next)||prev.date!==next.date||norm(prev.merchant)!==norm(next.merchant)){conflicts.push(next);continue}
    if(changes(prev,next))update.push([prev,next]);else same++;
   }else if(existing.has(identity(next))){ambiguous++}else add.push(next);
  }
  return {update,add,edited,conflicts,same,ambiguous};
 }
 function preview(){const p=plan(),inc=$('historyUpdateAdd').checked;$('historyUpdatePreview').textContent=`${pending.transactions.length.toLocaleString()} source records · ${p.update.length} matched updates · ${p.same} unchanged · ${p.edited.length} manually edited (protected) · ${p.conflicts.length} row-ID conflicts (skipped) · ${p.ambiguous} possible duplicates (skipped) · ${p.add.length} new IDs${inc?' (selected)':' (not selected)'}. Review backup before applying. Unmarked currencies remain unchanged for matched records.`;$('historyUpdateCommit').disabled=!(p.update.length||(inc&&p.add.length));return p}
 $('historyUpdateAdd').onchange=()=>pending&&preview();
 $('historyUpdateFile').onchange=async e=>{pending=null;$('historyUpdateCommit').disabled=true;try{const f=e.target.files?.[0];if(!f)return;if(f.size>35e6)throw Error('File too large');const x=JSON.parse(await f.text());if(x.format!=='family-finance-history-update-v1'||!Array.isArray(x.transactions)||x.transactions.length>30000||!x.transactions.every(t=>typeof t.id==='string'&&/^\d{4}-\d\d-\d\d$/.test(t.date)&&Number.isFinite(t.amount)&&t.amount>=0&&typeof t.account==='string'))throw Error('Invalid update file');pending=x;preview()}catch(err){$('historyUpdatePreview').textContent='Cannot read update file: '+err.message}};
 $('historyUpdateCommit').onclick=()=>{if(!pending)return;const p=preview(),withNew=$('historyUpdateAdd').checked;if(!confirm(`Update ${p.update.length} existing records${withNew?' and add '+p.add.length+' new IDs':''}? Manually edited records and conflicts will be skipped. Export a JSON backup first.`))return;
  const old=JSON.stringify(db);try{for(const [prev,next] of p.update){const keep={...prev};Object.assign(prev,{...next,type:prev.type,payer:prev.payer,currency:next.currency||prev.currency,editHistory:prev.editHistory,sourceUpdatedAt:new Date().toISOString()});if(keep.currency&&!next.currency)prev.currency=keep.currency}
   if(withNew){for(const t of p.add){db.transactions.push(t);if(!db.accounts.includes(t.account))db.accounts.push(t.account);if(!CATS.includes(t.category))CATS.push(t.category)}}
   save();$('historyUpdateStatus').textContent=`Updated ${p.update.length} existing records; added ${withNew?p.add.length:0}. Skipped ${p.edited.length+p.conflicts.length+p.ambiguous} protected/conflicting/possible duplicate rows. Export backup now.`;pending=null;$('historyUpdateCommit').disabled=true;
  }catch(err){db=JSON.parse(old);localStorage.setItem(KEY,old);render();$('historyUpdateStatus').textContent='Update failed; original local data restored: '+err.message}
 };
})();