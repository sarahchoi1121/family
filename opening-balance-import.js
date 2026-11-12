/* Opening balance CSV import, local only. */
(()=>{'use strict';
const file=document.getElementById('openingBalanceFile'),preview=document.getElementById('openingBalancePreview'),apply=document.getElementById('openingBalanceApply');
if(!file||!preview||!apply)return;
let pending=[];
const currencies=new Set(['GBP','HKD','USD','EUR','JPY','AUD','CAD','CNY','SGD','CHF','TWD','NZD']);
const modeSelect=document.getElementById('openingBalanceMode');
const normalize=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const csvRows=text=>{const out=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))out.push(row);row=[];field=''}else field+=c}if(quoted)throw Error('Unclosed quote in CSV');row.push(field);if(row.some(x=>x.trim()))out.push(row);return out};
file.addEventListener('change',async()=>{pending=[];apply.disabled=true;preview.textContent='Reading CSV…';try{
if(!file.files?.[0]){preview.textContent='No file selected';return}
const rows=csvRows((await file.files[0].text()).replace(/^\uFEFF/,''));if(rows.length<2)throw Error('CSV must have a header and at least one account');
const header=rows.shift().map(x=>normalize(x));const ix=['account','currency','balance','date'].map(x=>header.indexOf(x));if(ix.some(x=>x<0))throw Error('Required headers: Account,Currency,Balance,Date');
const seen=new Set();for(let i=0;i<rows.length;i++){const r=rows[i],account=String(r[ix[0]]||'').trim(),currency=String(r[ix[1]]||'').trim().toUpperCase(),raw=String(r[ix[2]]||'').trim(),date=String(r[ix[3]]||'').trim();const amount=Number(raw);if(!account||account.length>100||!currencies.has(currency)||!raw||!Number.isFinite(amount)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Invalid row '+(i+2)+'. Check account, currency, amount and a valid YYYY-MM-DD date');if(seen.has(normalize(account)))throw Error('Duplicate account in CSV: '+account);seen.add(normalize(account));pending.push({account,currency,amount:Math.round(amount*100)/100,date})}
preview.textContent=pending.length+' opening balances ready: '+pending.map(x=>x.account+' ('+x.currency+' '+x.amount.toFixed(2)+' · '+x.date+')').join(' · ');apply.disabled=false;
}catch(e){preview.textContent='Cannot preview: '+e.message}});
apply.addEventListener('click',async()=>{if(!pending.length)return;try{
if(window.FFPersist?.wait)await FFPersist.wait();
const groups=()=>window.FFAccounts?FFAccounts.groups():db.accounts.map(a=>({label:a,snapshotKey:a,aliases:[a]}));
const changes=[];for(const item of pending){const g=groups().find(g=>normalize(g.label)===normalize(item.account)||g.aliases?.some(a=>normalize(a)===normalize(item.account)));const key=g?.snapshotKey||item.account;const old=db.accountSnapshots?.[key];const existingCur=g?window.FFAccounts?.currency(g.label):null;
if(g&&existingCur!==item.currency){const hasTxn=(db.transactions||[]).some(t=>!t.comparisonMonthly&&(g.aliases||[g.label]).some(a=>normalize(a)===normalize(t.account)||normalize(a)===normalize(t.transferTo)));if(hasTxn)throw Error('Currency conflict for '+item.account+' with existing transactions. Set its currency manually first.')}
changes.push({...item,key,exists:!!old,existingCur,group:g})}
const replacements=changes.filter(x=>x.exists).length;const mode=modeSelect?.value==='opening'?'opening':'closing';if(!confirm('Import '+changes.length+' '+mode+' balances using each CSV date? '+replacements+' existing balances will be REPLACED. '+(mode==='opening'?'Transactions ON and after each date will count.':'Only transactions AFTER each date will count.')+' This does not import transactions.'))return;
db.accountSnapshots ||= {};db.accountCurrencies ||= {};db.accounts ||= [];
for(const c of changes){if(!c.group)db.accounts.push(c.account);db.accountCurrencies[c.key]=c.currency;if(c.group)for(const alias of c.group.aliases||[])db.accountCurrencies[alias]=c.currency;db.accountSnapshots[c.key]={amount:c.amount,date:c.date,mode}}
save();if(window.FFPersist?.wait)await FFPersist.wait();preview.textContent='Saved '+changes.length+' opening balances. Check Bank balances & reconciliation.';apply.disabled=true;pending=[];file.value='';
}catch(e){preview.textContent='Import stopped: '+e.message;alert(preview.textContent)}});
})();
