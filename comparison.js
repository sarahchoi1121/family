/* v0.9 year and category comparisons using Excel category mapping, not imported sign/type. */
(()=>{'use strict';
 const from=$('compareFromMonth'),to=$('compareToMonth'),metric=$('compareMetric'),categoryMetric=$('compareCategoryMetric'),hide=$('compareHideZero');
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 for(let i=1;i<=12;i++){from.add(new Option(months[i-1],String(i)));to.add(new Option(months[i-1],String(i)))}from.value='1';to.value='12';
 const years=()=>[...new Set(db.transactions.map(t=>String(t.date||'').slice(0,4)).filter(x=>/^20\d{2}$/.test(x)))].sort();
 const cents=t=>Math.round(Math.abs(Number(t.amount||0))*100)||0;
 const fmt=n=>(n<0?'−':'')+money(Math.abs(n/100));
 const zero=()=>({income:0,expense:0,recurring:0,nonrecurring:0,fixed:0});
 const get=(r,m)=>r[m]||0;
 function draw(){
  const a=Number(from.value),b=Number(to.value),ys=years();if(a>b){$('yearBars').textContent='Start month must not be after end month.';$('categoryComparison').textContent='Choose a valid month range.';return}
  const tx=db.transactions.filter(t=>/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')&&Number(t.date.slice(5,7))>=a&&Number(t.date.slice(5,7))<=b&&t.type!=='transfer');
  const yearly=new Map(ys.map(y=>[y,zero()])),categories=new Map();
  for(const t of tx){const y=t.date.slice(0,4);if(!yearly.has(y))continue;const n=cents(t),k=FFMapping.norm(t.category),group=FFMapping.classify(t.category);const r=yearly.get(y);
   // A negative entry in a source expense category is a refund/credit against that expense.
   // Imported transaction type can be unreliable; category is authoritative.
   const signed=(t.sourceAmount!==undefined&&Number.isFinite(Number(t.sourceAmount)))?Number(t.sourceAmount):null;
   const sign=signed!==null?(signed<0?-1:1):(t.type==='income'&&group!=='income'?-1:1);
   if(group==='income')r.income+=n;else{r.expense+=n*sign;r[group]+=n*sign}
   if(!categories.has(k))categories.set(k,{name:String(t.category||'Uncategorised').trim()||'Uncategorised',group,vals:new Map()});
   const cat=categories.get(k);if(!cat.vals.has(y))cat.vals.set(y,zero());const v=cat.vals.get(y);if(group==='income')v.income+=n;else{v.expense+=n*sign;v[group]+=n*sign}
  }
  const summary=$('compareFourSummary');
  if(summary){
   const groups=[['Income','income'],['Recurring','recurring'],['Non-recurring','nonrecurring'],['Fixed assets','fixed']];
   const head=ys.map(y=>`<th scope="col">${y}</th>`).join('');
   const rows=groups.map(([name,key])=>`<tr><td>${name}</td>${ys.map(y=>`<td>${fmt(get(yearly.get(y),key))}</td>`).join('')}</tr>`).join('');
   summary.innerHTML=ys.length?`<table class="compare-table"><thead><tr><th scope="col">Group</th>${head}</tr></thead><tbody>${rows}</tbody></table>`:'<p class="notice">Import historical transactions to view the summary.</p>';
  }
  const vals=ys.map(y=>({year:y,v:get(yearly.get(y),metric.value)})),max=Math.max(1,...vals.map(x=>Math.abs(x.v)));
  $('yearBars').innerHTML=vals.length?vals.map(x=>`<div class="compare-line"><small>${x.year}</small><div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(Math.abs(x.v)/max*100).toFixed(1)}%"></div></div><strong>${fmt(x.v)}</strong></div>`).join(''):'<p class="notice">No dated transactions yet.</p>';
  const mode=categoryMetric.value;
  const cats=[...categories.values()].filter(c=>!hide.checked||ys.some(y=>get(c.vals.get(y)||zero(),mode)!==0)).sort((x,y)=>x.name.localeCompare(y.name,'en-GB'));
  const headings=ys.map(y=>`<th scope="col">${y}</th>`).join('');
  const body=cats.map(c=>`<tr><td>${escapeHtml(c.name)}</td>${ys.map(y=>`<td>${fmt(get(c.vals.get(y)||zero(),mode))}</td>`).join('')}</tr>`).join('');
  const total=ys.map(y=>`<td><strong>${fmt(get(yearly.get(y),mode))}</strong></td>`).join('');
  $('categoryComparison').innerHTML=ys.length?`<table class="compare-table"><thead><tr><th scope="col">Category</th>${headings}</tr></thead><tbody>${body||`<tr><td colspan="${ys.length+1}">No matching transactions in this period.</td></tr>`}<tr><td><strong>Total</strong></td>${total}</tr></tbody></table>`:'<p class="notice">Import historical transactions to compare years.</p>';
 }
 [from,to,metric,categoryMetric,hide].forEach(el=>el.addEventListener('change',draw));
 const prev=render;render=function(){prev();draw()};draw();
})();