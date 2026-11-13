/* Expandable, currency-separated financial summary. No FX conversion. */
(()=>{'use strict';
 const $=id=>document.getElementById(id), mode=$('summaryMode'),year=$('summaryYear'),month=$('summaryMonth'),currency=$('summaryCurrency'),output=$('compareFourSummary');
 const labels=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const groups=[['Income','income'],['Recurring','recurring'],['Non-recurring','nonrecurring'],['Fixed assets','fixed']];
 const fmt=(n,c)=>FFCurrency.format(n/100,c),esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const closed=new Set();let signature='',lastData=null;
 const get=(m,k)=>m.get(k)||0;
 function build(){
  const tx=db.transactions||[];
  const sig=String(db._ledgerRevision||0)+'|'+tx.length+'|'+(db.monthlyArchive?.revision||0);
  if(sig===signature&&lastData)return lastData;
  const records=[],years=new Set(),currencies=new Set();
  const archived=db.monthlyArchive?.months||{};
  for(const [ym,entry] of Object.entries(archived)){
   for(const r of entry.records||[]){records.push({...r});years.add(r.y);currencies.add(r.c)}
  }
  for(const t of tx){
   const ym=(t.date||'').slice(0,7);
   if(archived[ym] && (t.comparisonMonthly===true || archived[ym].status==='closed'))continue;
   if(!/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')||t.type==='transfer')continue;
   const c=FFCurrency.currency(t),y=t.date.slice(0,4),m=+t.date.slice(5,7),historical=t.comparisonMonthly===true;
   const g=historical&&['income','recurring','nonrecurring','fixed'].includes(t.comparisonGroup)?t.comparisonGroup:FFMapping.classify(t.category);
   if(!['income','recurring','nonrecurring','fixed'].includes(g))continue;
   const raw=t.originalSignedAmount??t.sourceAmount;
   const hasSigned=historical&&raw!==undefined&&raw!==null&&raw!==''&&Number.isFinite(Number(raw));
   const n=Math.round(Math.abs(Number(t.amount||0))*100)||0;
   const signed=hasSigned?-Math.round(Number(raw)*100):(g==='income'?n:-n);
   const name=String(t.category||'Uncategorised').trim()||'Uncategorised';
   if(Array.isArray(t.categoryBreakdown)&&t.categoryBreakdown.length&&!historical){
    for(const part of t.categoryBreakdown){const pg=['income','recurring','nonrecurring','fixed'].includes(part.kind)?part.kind:FFMapping.classify(part.category);const ps=Math.round(Math.abs(Number(part.amount||0))*100)*(Number(part.amount)<0?-1:1);records.push({c,y,m,g:pg,name:String(part.category||'Uncategorised'),signed:pg==='income'?ps:-ps});}
   }else records.push({c,y,m,g,name,signed});years.add(y);currencies.add(c);
  }
  lastData={records,years:[...years].sort(),currencies:[...currencies].sort()};signature=sig;return lastData;
 }
 function draw(){
  const {records,years,currencies}=build();
  const prevYear=year.value,prevCurrency=currency.value;
  year.replaceChildren(...years.map(y=>new Option(y,y)));year.value=years.includes(prevYear)?prevYear:(years.at(-1)||'');
  if(!month.options.length)labels.forEach((label,i)=>month.add(new Option(label,String(i+1))));
  if(!month.value)month.value='1';
  currency.replaceChildren(new Option('All currencies (separate tables)','ALL'),...currencies.map(c=>new Option(c,c)));currency.value=currencies.includes(prevCurrency)?prevCurrency:'ALL';
  $('summaryYearWrap').hidden=mode.value!=='year';$('summaryMonthWrap').hidden=mode.value!=='month';
  const cols=mode.value==='year'?labels.map((l,i)=>({key:String(i+1),label:l})).concat([{key:'total',label:'Total'}]):years.map(y=>({key:y,label:y}));
  const visible=currency.value==='ALL'?currencies:[currency.value];
  const selected=records.filter(r=>mode.value==='year'?r.y===year.value:mode.value==='month'?r.m===+month.value:true);
  const colKey=r=>mode.value==='year'?String(r.m):r.y;

  let html='';
  for(const c of visible){
   const rows=selected.filter(r=>r.c===c),data=new Map(),cats=new Map();
   for(const r of rows){
    const k=colKey(r),gkey=r.g+'|'+k;
    data.set(gkey,get(data,gkey)+r.signed);data.set('net|'+k,get(data,'net|'+k)+r.signed);
    data.set(r.g+'|total',get(data,r.g+'|total')+r.signed);data.set('net|total',get(data,'net|total')+r.signed);
    const id=r.g+'|'+r.name.toLocaleLowerCase('en-GB');if(!cats.has(id))cats.set(id,{group:r.g,name:r.name,values:new Map()});
    const vals=cats.get(id).values;vals.set(k,get(vals,k)+r.signed);vals.set('total',get(vals,'total')+r.signed);
   }
   const header=cols.map(x=>`<th scope="col">${esc(x.label)}</th>`).join('');
   let body='';
   for(const [name,g] of groups){
    const key=c+'|'+g,open=!closed.has(key);
    body+=`<tr class="summary-group-row"><th scope="row"><button type="button" class="summary-expand" data-expand="${esc(key)}" aria-expanded="${open}">${open?'▾':'▸'} ${esc(name)}</button></th>${cols.map(x=>`<td>${fmt(get(data,g+'|'+x.key),c)}</td>`).join('')}</tr>`;
    if(open){const entries=[...cats.values()].filter(x=>x.group===g).sort((a,b)=>a.name.localeCompare(b.name,'en-GB'));
     body+=entries.map(cat=>`<tr class="summary-category"><td>${esc(cat.name)}</td>${cols.map(x=>`<td>${fmt(get(cat.values,x.key),c)}</td>`).join('')}</tr>`).join('');}
   }
   body+=`<tr class="net-summary-row"><th scope="row">Net</th>${cols.map(x=>{const n=get(data,'net|'+x.key);return `<td class="${n<0?'net-negative':n>0?'net-positive':'net-zero'}"><strong>${fmt(n,c)}</strong></td>`}).join('')}</tr>`;
   html+=`<h3>${esc(c)}</h3><div class="summary-scroll"><table class="compare-table"><thead><tr><th scope="col">Group / Category</th>${header}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  output.innerHTML=html||'<p class="notice">No transactions available for this selection.</p>';
 }
 output.addEventListener('click',e=>{const btn=e.target.closest('[data-expand]');if(!btn)return;const k=btn.dataset.expand;if(closed.has(k))closed.delete(k);else closed.add(k);draw()});
 function renderSummary(){draw()}
 [mode,year,month,currency].forEach(el=>el.addEventListener('change',renderSummary));
 const prev=render;render=function(){prev();if(!$('compare').classList.contains('hidden'))renderSummary()};
 renderSummary();
})();
