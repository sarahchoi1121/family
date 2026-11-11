/* Family Finance v0.6: calculated from local ledger; never sends financial data to server. */
(()=>{
 const period=$('comparePeriod'),metric=$('compareMetric'),a=$('compareYearA'),b=$('compareYearB');
 const years=()=>Array.from(new Set(db.transactions.map(t=>String(t.date||'').slice(0,4)).filter(x=>/^20\d\d$/.test(x)))).sort();
 const relevant=t=>t.type==='income'||t.type==='expense';
 // 2026 historical import ends on 1 November. Compare identical month/day cutoffs.
 const cutoff='11-01';
 const eligible=t=>{if(!relevant(t)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date||''))return false;return period.value!=='ytd'||t.date.slice(5)<=cutoff};
 const rows=()=>db.transactions.filter(eligible);
 const sum=(ts,type)=>Math.round(ts.filter(t=>t.type===type).reduce((n,t)=>n+Math.round(Number(t.amount||0)*100),0))/100;
 const value=(ts,m)=>m==='net'?sum(ts,'income')-sum(ts,'expense'):sum(ts,m);
 const signed=n=>(n<0?'−':'')+money(Math.abs(n));
 function draw(){
  const ys=years();let previousA=a.value,previousB=b.value;
  for(let el of [a,b]){el.replaceChildren(...ys.map(y=>new Option(y,y)))}
  a.value=ys.includes(previousA)?previousA:ys[Math.max(0,ys.length-2)]||'';
  b.value=ys.includes(previousB)?previousB:ys[ys.length-1]||'';
  const rs=rows(),vals=ys.map(y=>({year:y,v:value(rs.filter(t=>t.date.startsWith(y)),metric.value)})),max=Math.max(1,...vals.map(x=>Math.abs(x.v)));
  $('yearBars').innerHTML=vals.length?vals.map(x=>`<div class="compare-line"><small>${x.year}</small><div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(Math.abs(x.v)/max*100).toFixed(1)}%"></div></div><strong>${signed(x.v)}</strong></div>`).join(''):'<p class="notice">No dated transactions yet.</p>';
  const cats=[...new Set(rs.filter(t=>t.type==='expense').map(t=>t.category||'Uncategorised'))].sort();
  const byYear=(y,c)=>Math.round(rs.filter(t=>t.type==='expense'&&t.date.startsWith(y)&&(t.category||'Uncategorised')===c).reduce((v,t)=>v+Math.round(Number(t.amount||0)*100),0))/100;
  $('categoryComparison').innerHTML=ys.length?`<table class="compare-table"><thead><tr><th>Category</th><th>${a.value}</th><th>${b.value}</th><th>Change</th></tr></thead><tbody>${cats.map(c=>{let x=byYear(a.value,c),y=byYear(b.value,c);let delta=x===0?(y===0?'—':'New'):((y-x)/Math.abs(x)*100).toFixed(1)+'%';return `<tr><td>${escapeHtml(c)}</td><td>${money(x)}</td><td>${money(y)}</td><td>${delta}</td></tr>`}).join('')}</tbody></table>`:'<p class="notice">Import historical transactions to see category comparisons.</p>';
 }
 [period,metric,a,b].forEach(el=>el.addEventListener('change',draw));
 const prev=render;render=function(){prev();draw()};draw();
})();
