/* Year comparisons: strict currency partitioning, no FX conversion. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),from=$('compareFromMonth'),to=$('compareToMonth'),metric=$('compareMetric'),catMetric=$('compareCategoryMetric'),hide=$('compareHideZero'),currencySel=$('compareCurrency');
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 for(let i=1;i<=12;i++){from.add(new Option(months[i-1],String(i)));to.add(new Option(months[i-1],String(i)))}from.value='1';to.value='12';
 const fmt=(n,c)=>FFCurrency.format(n/100,c),cents=t=>Math.round(Math.abs(Number(t.amount||0))*100)||0;
 const zero=()=>({income:0,expense:0,recurring:0,nonrecurring:0,fixed:0});
 const val=(r,k)=>r?.[k]||0;
 const years=()=>[...new Set(db.transactions.map(t=>String(t.date||'').slice(0,4)).filter(x=>/^20\d{2}$/.test(x)))].sort();
 function draw(){
  const old=currencySel.value,all=[...new Set(db.transactions.map(FFCurrency.currency))].sort();currencySel.replaceChildren(new Option('All currencies (separate totals)','ALL'),...all.map(c=>new Option(c,c)));currencySel.value=all.includes(old)?old:'ALL';
  const a=+from.value,b=+to.value,ys=years();if(a>b){$('yearBars').textContent='Start month must not be after end month.';$('categoryComparison').textContent='Choose a valid month range.';return}
  const tx=db.transactions.filter(t=>/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')&&+t.date.slice(5,7)>=a&&+t.date.slice(5,7)<=b&&t.type!=='transfer'&&(currencySel.value==='ALL'||FFCurrency.currency(t)===currencySel.value));
  const currencies=[...new Set(tx.map(FFCurrency.currency))].sort(), data=new Map(),cats=new Map();
  for(const t of tx){const c=FFCurrency.currency(t),y=t.date.slice(0,4),group=FFMapping.classify(t.category),n=cents(t),signed=(t.sourceAmount!==undefined&&Number.isFinite(Number(t.sourceAmount)))?Number(t.sourceAmount):null,sign=signed!==null?(signed<0?-1:1):(t.type==='income'&&group!=='income'?-1:1);const key=c+'|'+y;
   if(!data.has(key))data.set(key,zero());const r=data.get(key);if(group==='income')r.income+=n;else{r.expense+=n*sign;r[group]+=n*sign}
   const name=String(t.category||'Uncategorised').trim()||'Uncategorised',k=c+'|'+FFMapping.norm(name);if(!cats.has(k))cats.set(k,{name,c,group,vals:new Map()});const cat=cats.get(k);if(!cat.vals.has(y))cat.vals.set(y,zero());const v=cat.vals.get(y);if(group==='income')v.income+=n;else{v.expense+=n*sign;v[group]+=n*sign}
  }
  const groups=[['Income','income'],['Recurring','recurring'],['Non-recurring','nonrecurring'],['Fixed assets','fixed']];
  const head=ys.map(y=>`<th scope="col">${y}</th>`).join('');
  $('compareFourSummary').innerHTML=currencies.length?currencies.map(c=>`<h3>${c}</h3><table class="compare-table"><thead><tr><th>Group</th>${head}</tr></thead><tbody>${groups.map(([name,k])=>`<tr><td>${name}</td>${ys.map(y=>`<td>${fmt(val(data.get(c+'|'+y),k),c)}</td>`).join('')}</tr>`).join('')}<tr class="net-summary-row"><th scope="row">Net</th>${ys.map(y=>{const r=data.get(c+'|'+y);const net=val(r,'income')-val(r,'recurring')-val(r,'nonrecurring')-val(r,'fixed');return `<td class="${net<0?'net-negative':net>0?'net-positive':'net-zero'}"><strong>${fmt(net,c)}</strong></td>`}).join('')}</tr></tbody></table>`).join(''):'<p class="notice">No transactions for selected period and currency.</p>';
  const mode=metric.value;let bars='';for(const c of currencies){const values=ys.map(y=>({y,n:val(data.get(c+'|'+y),mode)})),max=Math.max(1,...values.map(x=>Math.abs(x.n)));bars+=`<h3>${c}</h3>`+values.map(x=>`<div class="compare-line"><small>${x.y}</small><div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(Math.abs(x.n)/max*100).toFixed(1)}%"></div></div><strong>${fmt(x.n,c)}</strong></div>`).join('')}$('yearBars').innerHTML=bars||'<p class="notice">No dated transactions for this currency.</p>';
  const cm=catMetric.value;let tables='';for(const c of currencies){const rows=[...cats.values()].filter(x=>x.c===c&&(!hide.checked||ys.some(y=>val(x.vals.get(y),cm)!==0))&&(cm==='income'?x.group==='income':cm==='expense'?x.group!=='income':x.group===cm)).sort((x,y)=>x.name.localeCompare(y.name,'en-GB'));
   const body=rows.map(x=>`<tr><td>${escapeHtml(x.name)}</td>${ys.map(y=>`<td>${fmt(val(x.vals.get(y),cm),c)}</td>`).join('')}</tr>`).join('');
   tables+=`<h3>${c}</h3><table class="compare-table"><thead><tr><th>Category</th>${head}</tr></thead><tbody>${body||`<tr><td colspan="${ys.length+1}">No matching categories</td></tr>`}<tr><td><strong>Total</strong></td>${ys.map(y=>`<td><strong>${fmt(val(data.get(c+'|'+y),cm),c)}</strong></td>`).join('')}</tr></tbody></table>`
  }$('categoryComparison').innerHTML=tables||'<p class="notice">No matching transactions.</p>';
 }
 [from,to,metric,catMetric,hide,currencySel].forEach(el=>el.addEventListener('change',draw));const prev=render;render=function(){prev();draw()};draw();
})();
