/* Family Finance v0.7: all-year and month-range comparisons; local only. */
(()=>{
 const from=$('compareFromMonth'),to=$('compareToMonth'),metric=$('compareMetric'),hide=$('compareHideZero');
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 for(let i=1;i<=12;i++){from.add(new Option(months[i-1],String(i)));to.add(new Option(months[i-1],String(i)))}
 from.value='1';to.value='10';
 const years=()=>[...new Set(db.transactions.map(t=>String(t.date||'').slice(0,4)).filter(x=>/^20\d{2}$/.test(x)))].sort();
 const cents=t=>Math.round(Number(t.amount||0)*100)||0;
 const fmt=n=>(n<0?'−':'')+money(Math.abs(n/100));
 const clean=x=>String(x||'Uncategorised').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-GB');
 function draw(){
  const a=Number(from.value),b=Number(to.value),ys=years(),valid=a<=b;
  if(!valid){$('yearBars').textContent='Start month must be before or equal to end month.';$('categoryComparison').textContent='Choose a valid month range.';return}
  const tx=db.transactions.filter(t=>/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t.date||'')&&Number(t.date.slice(5,7))>=a&&Number(t.date.slice(5,7))<=b&&(t.type==='income'||t.type==='expense'));
  const yearly=new Map(ys.map(y=>[y,{income:0,expense:0}]));
  const category=new Map();
  for(const t of tx){const y=t.date.slice(0,4),n=cents(t);if(!yearly.has(y))continue;yearly.get(y)[t.type]+=n;
   if(t.type==='expense'){const key=clean(t.category);if(!category.has(key))category.set(key,{name:String(t.category||'Uncategorised').trim()||'Uncategorised',vals:new Map()});const obj=category.get(key);obj.vals.set(y,(obj.vals.get(y)||0)+n)}
  }
  const vals=ys.map(y=>{const r=yearly.get(y);return {year:y,v:metric.value==='net'?r.income-r.expense:r[metric.value]}});
  const max=Math.max(1,...vals.map(x=>Math.abs(x.v)));
  $('yearBars').innerHTML=vals.length?vals.map(x=>`<div class="compare-line"><small>${x.year}</small><div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(Math.abs(x.v)/max*100).toFixed(1)}%"></div></div><strong>${fmt(x.v)}</strong></div>`).join(''):'<p class="notice">No dated transactions yet.</p>';
  const cats=[...category.values()].filter(c=>!hide.checked||ys.some(y=>(c.vals.get(y)||0)!==0)).sort((x,y)=>x.name.localeCompare(y.name,'en-GB'));
  const headings=ys.map(y=>`<th scope="col">${y}</th>`).join('');
  const body=cats.map(c=>`<tr><td>${escapeHtml(c.name)}</td>${ys.map(y=>`<td>${money((c.vals.get(y)||0)/100)}</td>`).join('')}</tr>`).join('');
  $('categoryComparison').innerHTML=ys.length?`<table class="compare-table"><thead><tr><th scope="col">Category</th>${headings}</tr></thead><tbody>${body||`<tr><td colspan="${ys.length+1}">No spending in this period.</td></tr>`}</tbody></table>`:'<p class="notice">Import historical transactions to compare years.</p>';
 }
 [from,to,metric,hide].forEach(el=>el.addEventListener('change',draw));
 const prev=render;render=function(){prev();draw()};draw();
})();
