/* Family Finance bank reconciliation v1.1.1. Local-only; no currency conversion. */
(()=>{
  db.reconciliationHistory ||= [];
  const host=document.getElementById('bankReconciliation');
  if(!host)return;
  const esc=escapeHtml;
  const key=name=>window.FFAccounts?FFAccounts.key(name):String(name).trim().toLowerCase();
  const groups=()=>window.FFAccounts?FFAccounts.groups():db.accounts.map(a=>({label:a,snapshotKey:a,aliases:[a]}));
  const groupFor=name=>groups().find(g=>key(g.label)===key(name));
  const cur=name=>window.FFAccounts?FFAccounts.currency(name):(db.accountCurrencies?.[name]||'GBP');
  const fmt=(n,c)=>window.FFCurrency?FFCurrency.format(n,c):`${c} ${Number(n).toFixed(2)}`;
  const txnCur=t=>window.FFCurrency?FFCurrency.currency(t):(t.currency||'GBP');
  const minor=n=>Math.round(Number(n)*100);
  const dateToday=()=>new Date().toLocaleDateString('en-CA');
  const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
  const same=(a,b)=>window.FFAccounts?FFAccounts.equal(a,b):key(a)===key(b);
  function movement(name,start,end){
    let sum=0,count=0,skipped=0;
    for(const t of db.transactions){
      if(!validDate(t.date)||t.date<=start||t.date>end)continue;
      const source=same(t.account,name),destination=t.type==='transfer'&&t.transferTo&&same(t.transferTo,name);
      if(!source&&!destination)continue;
      if(t.type==='transfer'){
        if(source){if(txnCur(t)===cur(name)){sum-=minor(t.amount);count++}else skipped++}
        if(destination){const incomingCurrency=t.currencyTo||txnCur(t);if(incomingCurrency===cur(name)){sum+=minor(t.transferAmountTo??t.amount);count++}else skipped++}
      }else if(source&&(t.type==='income'||t.type==='expense')){
        if(txnCur(t)!==cur(name)){skipped++;continue}
        sum+=(t.type==='income'?1:-1)*minor(t.amount);count++;
      }
    }
    return {amount:sum/100,count,skipped};
  }
  function paint(){
    const currentAccount=host.querySelector('#recAccount')?.value;
    const currentDate=host.querySelector('#recDate')?.value||dateToday();
    const actual=host.querySelector('#recActual')?.value||'';
    const list=groups();
    host.innerHTML=`<p class="notice">Compare the bank's actual balance with transactions recorded after a confirmed opening balance. Each account uses its own currency; no conversion. Transactions on the opening date are included in that opening balance, not counted again.</p>
      <label>Account</label><select id="recAccount">${list.map(g=>`<option value="${esc(g.label)}">${esc(g.label)} (${esc(cur(g.label))})</option>`).join('')}</select>
      <label>Statement date</label><input id="recDate" type="date" value="${esc(currentDate)}" />
      <label>Actual bank balance (enter manually)</label><input id="recActual" type="number" step="0.01" placeholder="Enter bank statement balance" value="${esc(actual)}" />
      <div id="recPreview" class="receipt-item" style="margin-top:12px"></div>
      <button id="recSave" type="button" style="margin-top:10px;width:100%">Save reconciliation</button>
      <details style="margin-top:12px"><summary>Previous reconciliation records</summary><div id="recHistory"></div></details>`;
    if(list.some(g=>g.label===currentAccount))host.querySelector('#recAccount').value=currentAccount;
    for(const id of ['recAccount','recDate','recActual'])host.querySelector('#'+id).addEventListener('input',update);
    host.querySelector('#recSave').addEventListener('click',commit);
    update();
  }
  function calculate(){
    const name=host.querySelector('#recAccount').value;
    const group=groupFor(name),snap=db.accountSnapshots?.[group?.snapshotKey||name];
    const date=host.querySelector('#recDate').value;
    if(!snap||!validDate(snap.date)||!Number.isFinite(Number(snap.amount)))return {error:'Set a confirmed opening balance first under Bank balances & reconciliation.'};
    if(!validDate(date)||date>dateToday())return {error:'Choose a valid statement date (today or earlier).'};
    if(date<snap.date)return {error:'Statement date is earlier than the confirmed opening balance. Choose a later date.'};
    const m=movement(name,snap.date,date),expected=(minor(snap.amount)+minor(m.amount))/100;
    const raw=host.querySelector('#recActual').value.trim();
    const actual=raw!==''&&Number.isFinite(Number(raw))?Number(raw):null;
    const difference=actual===null?null:(minor(actual)-minor(expected))/100;
    return {name,date,snap,m,expected,actual,difference,currency:cur(name),group};
  }
  function update(){
    const r=calculate(),p=host.querySelector('#recPreview');
    if(r.error){p.textContent=r.error;host.querySelector('#recSave').disabled=true}
    else{
      p.innerHTML=`<div class="line"><span>Opening balance · ${esc(r.snap.date)}</span><strong>${esc(fmt(r.snap.amount,r.currency))}</strong></div>
        <div class="line"><span>History movement (${r.m.count} transactions)</span><strong>${esc(fmt(r.m.amount,r.currency))}</strong></div>
        <div class="line"><span>Calculated balance · ${esc(r.date)}</span><strong>${esc(fmt(r.expected,r.currency))}</strong></div>
        <div class="line"><span>Difference (actual − calculated)</span><strong>${r.difference===null?'Enter actual balance':esc(fmt(r.difference,r.currency))}</strong></div>
        ${r.m.skipped?`<p class="notice">Warning: ${r.m.skipped} account movements have a different currency and were excluded. Check their currency before reconciling.</p>`:''}
        ${r.difference!==null?`<p class="notice">${Math.abs(r.difference)<0.005?'✓ Reconciled: balances match.':'⚠ Difference detected: review missing, duplicated or miscategorised transactions.'}</p>`:''}`;
      host.querySelector('#recSave').disabled=r.actual===null||r.m.skipped>0;
    }
    const name=host.querySelector('#recAccount').value;
    const history=db.reconciliationHistory.filter(x=>same(x.account,name)).slice().sort((a,b)=>b.date.localeCompare(a.date));
    host.querySelector('#recHistory').innerHTML=history.length?history.map(x=>`<div class="line"><div><strong>${esc(x.date)}</strong><div class="muted">${esc(x.currency)} · ${esc(x.createdAt||'')}</div></div><div style="text-align:right">${esc(fmt(x.actual,x.currency))}<br><small>Difference: ${esc(fmt(x.difference,x.currency))}</small></div></div>`).join(''):'<p class="notice">No saved reconciliations for this account.</p>';
  }
  function commit(){
    const r=calculate();if(r.error||r.actual===null||r.m.skipped)return;
    if(Math.abs(r.difference)>=0.005&&!confirm('The balances do not match. Save this reconciliation with a difference?'))return;
    const record={id:uid(),account:r.name,currency:r.currency,date:r.date,openingDate:r.snap.date,openingAmount:Number(r.snap.amount),movement:r.m.amount,transactionCount:r.m.count,calculated:r.expected,actual:r.actual,difference:r.difference,createdAt:new Date().toISOString()};
    db.reconciliationHistory.push(record);
    // A reconciliation is an audit record, not a silent correction to the opening balance.
    save();update();render();alert('Reconciliation record saved on this device.');
  }
  paint();
  const originalRender=render;
  render=function(){originalRender();const selected=host.querySelector('#recAccount')?.value;const names=groups().map(g=>g.label);if(!names.includes(selected))paint();else update()};
})();
