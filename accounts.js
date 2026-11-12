/* Account balances v0.4. Historical Excel movements are NOT opening balances. */
(()=>{
  db.accountSnapshots ||= {};
  db.accountCurrencies ||= {};
  const accountCurrency=name=>window.FFAccounts?FFAccounts.currency(name):(db.accountCurrencies[name]||'GBP');
  const sameAccount=(a,b)=>window.FFAccounts?FFAccounts.equal(a,b):a===b;
  const groups=()=>window.FFAccounts?FFAccounts.groups():db.accounts.map(name=>({label:name,aliases:[name],snapshotKey:name,currency:accountCurrency(name),conflict:false}));
  const fmt=(n,c)=>window.FFCurrency?FFCurrency.format(n,c):money(n);
  const dateToday=()=>new Date().toLocaleDateString('en-CA');
  const cents=n=>Math.round(Number(n)*100);
  const signed=t=>t.type==='income'?cents(t.amount):t.type==='expense'?-cents(t.amount):0;
  function accountBalance(name){
    const group=groups().find(g=>g.label===name)||{snapshotKey:name};const snapshot=db.accountSnapshots[group.snapshotKey];
    if(!snapshot || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date) || !Number.isFinite(Number(snapshot.amount)))return null;
    let result=cents(snapshot.amount);
    for(const t of db.transactions){if(t.comparisonMonthly)continue;
      if(!t.date || (snapshot.mode==='opening'?t.date<snapshot.date:t.date<=snapshot.date))continue;
      if(t.type!=='transfer' && (window.FFCurrency?FFCurrency.currency(t):(t.currency||'GBP'))!==accountCurrency(name))continue;
      if(t.type==='transfer' && t.transferTo){
        if(sameAccount(t.account,name))result-=cents(t.amount);
        if(sameAccount(t.transferTo,name))result+=cents(t.transferAmountTo??t.amount);
      }else if(sameAccount(t.account,name) && (t.type==='income'||t.type==='expense'))result+=signed(t);
    }
    return result/100;
  }
  function balanceRow(name){
    const b=accountBalance(name),group=groups().find(g=>g.label===name),snap=db.accountSnapshots[group?.snapshotKey||name];
    return `<div class="line"><div><strong>${escapeHtml(name)}</strong><div class="muted">${snap?'Confirmed '+escapeHtml(snap.date):'Not reconciled'}</div></div><strong>${b===null?'Not set':fmt(b,accountCurrency(name))}</strong></div>`;
  }
  function drawBalances(){
    const accountGroups=groups();const known=accountGroups.map(g=>({name:g.label,b:accountBalance(g.label)})).filter(x=>x.b!==null);const grouped={};known.forEach(x=>{const c=accountCurrency(x.name);grouped[c]=(grouped[c]||0)+x.b});const totals=Object.entries(grouped).map(([c,n])=>fmt(n,c)).join(' · ');const missing=accountGroups.length-known.length;const expanded=localStorage.getItem('ff_balance_expanded')==='1';$('homeAccountBalances').innerHTML=`<button type="button" id="balanceToggle" class="balance-toggle" aria-expanded="${expanded}"><span><span class="balance-total">${known.length?escapeHtml(totals):'Not reconciled'}</span><br><small>${known.length} confirmed · ${missing} unverified ${missing?'· total excludes unverified accounts':''}</small></span><span>${expanded?'▲':'▼'}</span></button><div id="balanceDetail" class="balance-detail" ${expanded?'':'hidden'}>${accountGroups.map(g=>balanceRow(g.label)).join('')}</div>`;$('balanceToggle').onclick=()=>{const detail=$('balanceDetail');detail.hidden=!detail.hidden;$('balanceToggle').setAttribute('aria-expanded',String(!detail.hidden));$('balanceToggle').lastElementChild.textContent=detail.hidden?'▼':'▲';localStorage.setItem('ff_balance_expanded',detail.hidden?'0':'1')};
    let host=$('balanceSettings');const recHost=document.getElementById('bankReconciliation');if(recHost&&host.contains(recHost)){document.querySelector('#settings')?.append(recHost);recHost.hidden=true;}host.replaceChildren();
    const wrap=document.createElement('div');wrap.style.overflowX='auto';
    const table=document.createElement('table');table.style.cssText='width:100%;min-width:670px;border-collapse:collapse;font-size:13px';
    table.innerHTML='<thead><tr><th>Account</th><th>Currency</th><th>Balance</th><th>As of date</th><th>Transactions</th><th>Difference</th><th>Actions</th></tr></thead>';
    const tbody=document.createElement('tbody');table.append(tbody);wrap.append(table);host.append(wrap);
    const countFor=name=>db.transactions.filter(t=>sameAccount(t.account,name)||(t.type==='transfer'&&sameAccount(t.transferTo,name))).length;
    accountGroups.forEach(group=>{
      const name=group.label, snap=db.accountSnapshots[group.snapshotKey]||{},currency=accountCurrency(name),balance=accountBalance(name),count=countFor(name);
      const latest=(db.reconciliationHistory||[]).filter(r=>sameAccount(r.account,name)).sort((a,b)=>String(b.createdAt||b.date).localeCompare(String(a.createdAt||a.date)))[0];
      const tr=document.createElement('tr');
      const cells=[name,currency,balance===null?'Not set':fmt(balance,currency),snap.date||'Not set',String(count),latest&&Number.isFinite(Number(latest.difference))?fmt(latest.difference,currency):'Not set'];
      for(const val of cells){const td=document.createElement('td');td.textContent=val;td.style.cssText='padding:10px 7px;border-bottom:1px solid #dce6e2;white-space:nowrap';tr.append(td)}
      const action=document.createElement('td');action.style.cssText='padding:8px;border-bottom:1px solid #dce6e2';
      const edit=document.createElement('button');edit.type='button';edit.className='secondary';edit.textContent='Edit / Reconcile';edit.style.cssText='padding:8px;font-size:12px;white-space:nowrap';action.append(edit);
      if(count===0){const del=document.createElement('button');del.type='button';del.textContent='Delete';del.className='danger';del.style.cssText='padding:8px;font-size:12px;margin-left:5px';del.onclick=()=>{
        const referenced=(db.transactions||[]).some(t=>sameAccount(t.account,name)||sameAccount(t.transferTo,name))||(db.reconciliationHistory||[]).some(r=>sameAccount(r.account,name));
        if(referenced){alert('Account has linked transactions or reconciliation history. Cannot delete.');return}
        if(!confirm('Delete unused account '+name+'? This removes its confirmed balance and account settings.'))return;
        db.accounts=db.accounts.filter(a=>!sameAccount(a,name));for(const alias of group.aliases){delete db.accountCurrencies[alias];delete db.accountSnapshots[alias]};delete db.accountSnapshots[group.snapshotKey];save();drawBalances();
      };action.append(del)}tr.append(action);tbody.append(tr);
      const detail=document.createElement('tr');detail.hidden=true;const td=document.createElement('td');td.colSpan=7;td.style.cssText='padding:14px;background:#f3f8f6';detail.append(td);tbody.append(detail);
      const editBox=document.createElement('div');editBox.style.cssText='display:flex;gap:10px;flex-wrap:wrap;align-items:end';
      const amountBox=document.createElement('div'),dateBox=document.createElement('div'),currencyBox=document.createElement('div');
      const al=document.createElement('label');al.textContent='Confirmed balance ('+currency+')';const amount=document.createElement('input');amount.type='number';amount.step='0.01';amount.value=snap.amount??'';amountBox.append(al,amount);
      const dl=document.createElement('label');dl.textContent='As of date';const date=document.createElement('input');date.type='date';date.value=snap.date||dateToday();dateBox.append(dl,date);
      const cl=document.createElement('label');cl.textContent='Currency';const cs=document.createElement('select');['GBP','HKD','JPY','USD','EUR','AUD','CAD','CNY','SGD','CHF','TWD','NZD',...Object.values(db.accountCurrencies)].filter((x,i,a)=>a.indexOf(x)===i).forEach(c=>cs.add(new Option(c,c)));cs.value=currency;currencyBox.append(cl,cs);
      cs.onchange=()=>{if(cs.value===accountCurrency(name))return;if(!confirm('Change currency? Existing transactions and balances are not converted.')){cs.value=accountCurrency(name);return}for(const alias of group.aliases){db.accountCurrencies[alias]=cs.value;delete db.accountSnapshots[alias]};save();drawBalances()};
      const modeBox=document.createElement('div'),ml=document.createElement('label'),ms=document.createElement('select');ml.textContent='Balance type';[['closing','Closing (end of day)'],['opening','Opening (start of day)']].forEach(([v,t])=>ms.add(new Option(t,v)));ms.value=snap.mode||'closing';modeBox.append(ml,ms);const btn=document.createElement('button');btn.className='secondary';btn.textContent='Save balance';btn.onclick=()=>{if(amount.value.trim()===''||!Number.isFinite(Number(amount.value))||!date.value){alert('Enter valid balance and date');return}if(date.value>dateToday()&&!confirm('Date is in future. Continue?'))return;db.accountSnapshots[group.snapshotKey]={amount:Math.round(Number(amount.value)*100)/100,date:date.value,mode:ms.value};save();drawBalances()};
      editBox.append(currencyBox,amountBox,dateBox,modeBox,btn);td.append(editBox);
      const recMount=document.createElement('div');recMount.className='inline-reconciliation';recMount.style.marginTop='12px';td.append(recMount);
      edit.onclick=()=>{const opening=detail.hidden;tbody.querySelectorAll('tr').forEach(row=>{if(row!==tr)row.hidden=row.dataset.detail==='yes'});detail.hidden=!opening; if(opening){const rec=document.getElementById('bankReconciliation');if(rec){rec.hidden=false;recMount.append(rec);const sel=rec.querySelector('#recAccount');if(sel){sel.value=name;sel.dispatchEvent(new Event('input',{bubbles:true}))}}}};
      detail.dataset.detail='yes';
    });
    for(const id of ['transferFrom','transferTo'])opt(id,accountGroups.map(g=>g.label));
  }
  $('transferDate').value=dateToday();
  $('transferForm').onsubmit=e=>{
    e.preventDefault();const from=$('transferFrom').value,to=$('transferTo').value,amount=Number($('transferAmount').value),date=$('transferDate').value;
    if(!from||!to||sameAccount(from,to)||!Number.isFinite(amount)||amount<=0||!date){alert('Choose different accounts, a date and positive amount.');return}
    if(accountCurrency(from)!==accountCurrency(to)){alert('Cross-currency transfers need separate actual sent and received amounts. This form currently supports same-currency transfers only.');return}
    db.transactions.push({id:uid(),type:'transfer',merchant:'Transfer: '+from+' → '+to,amount:Math.round(amount*100)/100,date,category:'Internal transfer',payer:'Joint',account:from,transferTo:to,currency:accountCurrency(from)});
    save();$('transferAmount').value='';drawBalances();alert('Transfer saved (not counted as income or spending).');
  };
  const originalRender=render;
  render=function(){originalRender();if(!$('settings').classList.contains('hidden')||!$('home').classList.contains('hidden'))drawBalances()};
  render();
})();
