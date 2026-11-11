/* Family Finance v0.8: all-year month-filtered comparisons by transaction type. */
(()=>{
 const from=$('compareFromMonth'),to=$('compareToMonth'),metric=$('compareMetric'),categoryMetric=$('compareCategoryMetric'),hide=$('compareHideZero');
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 for(let i=1;i<=12;i++){from.add(new Option(months[i-1],String(i)));to.add(new Option(months[i-1],String(i)))}
 from.value='1';to.value='12';
 const years=()=>[...new Set(db.transactions.map(t=>String(t.date||'').slice(0,4)).filter(x=>/^20\d{2}$/.test(x)))].sort();
 const cents=t=>Math.round(Math.abs(Number(t.amount||0))*100)||0;
 const fmt=n=>(n<0?'−':'')+money(Math.abs(n/100));
 const clean=x=>String(x||'Uncategorised').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-GB');
 function draw(){
  const a=Number(from.value),b=Number(to.value),ys=years();
  if(a>b){$('yearBars').textContent='Start month must be before or equal to end month.';$('categoryComparison').textContent='Choose a valid month range.';return}
  const tx=db.transactions.filter(t=>/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')&&Number(t.date.slice(5,7))>=a&&Number(t.date.slice(5,7))<=b&&(t.type==='income'||t.type==='expense'));
  const yearly=new Map(ys.map(y=>[y,{income:0,expense:0}]));
  const categories=new Map();
  for(const t of tx){
   const y=t.date.slice(0,4),n=cents(t);if(!yearly.has(y))continue;
   yearly.get(y)[t.type]+=n;
   const key=clean(t.category);
   if(!categories.has(key))categories.set(key,{name:String(t.category||'Uncategorised').trim()||'Uncategorised',vals:new Map()});
   const obj=categories.get(key);if(!obj.vals.has(y))obj.vals.set(y,{income:0,expense:0});
   obj.vals.get(y)[t.type]+=n;
  }
  const valueFor=(r,mode)=>mode==='net'?r.income-r.expense:r[mode];
  const vals=ys.map(y=>({year:y,v:valueFor(yearly.get(y),metric.value)}));
  const max=Math.max(1,...vals.map(x=>Math.abs(x.v)));
  $('yearBars').innerHTML=vals.length?vals.map(x=>`<div class="compare-line"><small>${x.year}</small><div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(Math.abs(x.v)/max*100).toFixed(1)}%"></div></div><strong>${fmt(x.v)}</strong></div>`).join(''):'<p class="notice">No dated transactions yet.</p>';
  const mode=categoryMetric.value;
  const cats=[...categories.values()].filter(c=>!hide.checked||ys.some(y=>valueFor(c.vals.get(y)||{income:0,expense:0},mode)!==0)).sort((x,y)=>x.name.localeCompare(y.name,'en-GB'));
  const headings=ys.map(y=>`<th scope="col">${y}</th>`).join('');
  const body=cats.map(c=>`<tr><td>${escapeHtml(c.name)}</td>${ys.map(y=>`<td>${fmt(valueFor(c.vals.get(y)||{income:0,expense:0},mode))}</td>`).join('')}</tr>`).join('');
  const total=ys.map(y=>`<td><strong>${fmt(valueFor(yearly.get(y),mode))}</strong></td>`).join('');
  $('categoryComparison').innerHTML=ys.length?`<table class="compare-table"><thead><tr><th scope="col">Category</th>${headings}</tr></thead><tbody>${body||`<tr><td colspan="${ys.length+1}">No matching ${mode} transactions in this period.</td></tr>`}<tr><td><strong>Total</strong></td>${total}</tr></tbody></table>`:'<p class="notice">Import historical transactions to compare years.</p>';
 }
 [from,to,metric,categoryMetric,hide].forEach(el=>el.addEventListener('change',draw));
 const prev=render;render=function(){prev();draw()};draw();
})();
