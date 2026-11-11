/* History filters: all data remains on-device; no currency conversion. */
(()=>{'use strict';
 const ids=['historyYear','historyMonth','historyCategory','historyCurrency','historyAccount','historyType'];
 const els=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const kind=t=>t.type==='transfer'?'transfer':t.type==='income'?'income':window.FFMapping?FFMapping.classify(t.category):'nonrecurring';
 const accountKey=s=>window.FFAccounts?FFAccounts.find(s)?.key||FFAccounts.key(s):String(s||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-GB');
 const curr=t=>window.FFCurrency?FFCurrency.currency(t):t.currency||'GBP';
 const values=(items,all)=>[["",all],...items.map(x=>[String(x),String(x)])];
 function setOptions(el,options){const old=el.value;el.replaceChildren(...options.map(([v,label])=>new Option(label,v)));el.value=options.some(([v])=>v===old)?old:''}
 function refreshOptions(){const ts=db.transactions||[];
  setOptions(els.historyYear,values([...new Set(ts.map(t=>String(t.date||'').slice(0,4)).filter(x=>/^\d{4}$/.test(x)))].sort((a,b)=>b.localeCompare(a)),'All years'));
  setOptions(els.historyMonth,[['','All months'],...months.map((m,i)=>[String(i+1).padStart(2,'0'),m])]);
  setOptions(els.historyCategory,values([...new Set(ts.map(t=>String(t.category||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b)),'All categories'));
  setOptions(els.historyCurrency,values([...new Set(ts.map(curr))].sort(),'All currencies'));
  const accountLabels=window.FFAccounts?FFAccounts.groups().map(g=>[g.key,g.label]):[];if(!window.FFAccounts){for(const a of [...(db.accounts||[]),...ts.map(t=>t.account)]){const key=accountKey(a);if(key&&!accountLabels.some(x=>x[0]===key))accountLabels.push([key,String(a).trim()])}}setOptions(els.historyAccount,[['','All accounts'],...accountLabels.sort((a,b)=>a[1].localeCompare(b[1],'en-GB'))]);
  setOptions(els.historyType,[['','All types'],['income','Income'],['recurring','Recurring'],['nonrecurring','Non-recurring'],['fixed','Fixed assets'],['transfer','Transfers']]);
 }
 function update(){refreshOptions();const q=String(document.getElementById('search').value||'').toLocaleLowerCase().trim();
  const f=Object.fromEntries(ids.map(id=>[id,els[id].value]));
  const matches=(db.transactions||[]).filter(t=>{
   const date=String(t.date||'');
   return (!q||[t.merchant,t.category,t.account,t.payer,t.date].some(x=>String(x||'').toLocaleLowerCase().includes(q)))
    &&(!f.historyYear||date.slice(0,4)===f.historyYear)
    &&(!f.historyMonth||date.slice(5,7)===f.historyMonth)
    &&(!f.historyCategory||String(t.category||'')===f.historyCategory)
    &&(!f.historyCurrency||curr(t)===f.historyCurrency)
    &&(!f.historyAccount||accountKey(t.account)===f.historyAccount)
    &&(!f.historyType||kind(t)===f.historyType);
  }).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  document.getElementById('historyList').innerHTML=transactionHtml(matches);
  const sums=new Map();for(const t of matches){if(t.type==='transfer')continue;const c=curr(t);const v=(t.type==='income'?1:-1)*Number(t.amount||0);sums.set(c,(sums.get(c)||0)+v)}
  const fmt=(v,c)=>window.FFCurrency?FFCurrency.format(v,c):c+' '+v.toFixed(2);
  const stats=document.getElementById('historyStats');stats.textContent=matches.length+' transaction'+(matches.length===1?'':'s')+(sums.size?' · Net by currency: '+[...sums].sort(([a],[b])=>a.localeCompare(b)).map(([c,v])=>fmt(v,c)).join(' · '):'');
  document.getElementById('historyFilterCount').textContent=Object.values(f).filter(Boolean).length?'('+Object.values(f).filter(Boolean).length+' active)':'';
 }
 // Replace the original history renderer; render/save/import flows already call it.
 window.showHistory=update;
 document.getElementById('search').oninput=update;
 ids.forEach(id=>els[id].addEventListener('change',update));
 document.getElementById('historyClear').addEventListener('click',()=>{ids.forEach(id=>els[id].value='');document.getElementById('search').value='';update()});
 update();
})();
