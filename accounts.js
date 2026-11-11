/* Account balances v0.4. Historical Excel movements are NOT opening balances. */
(()=>{
  db.accountSnapshots ||= {};
  db.accountCurrencies ||= {};
  const accountCurrency=name=>db.accountCurrencies[name]||'GBP';
  const fmt=(n,c)=>window.FFCurrency?FFCurrency.format(n,c):money(n);
  const dateToday=()=>new Date().toLocaleDateString('en-CA');
  const cents=n=>Math.round(Number(n)*100);
  const signed=t=>t.type==='income'?cents(t.amount):t.type==='expense'?-cents(t.amount):0;
  function accountBalance(name){
    const snapshot=db.accountSnapshots[name];
    if(!snapshot || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date) || !Number.isFinite(Number(snapshot.amount)))return null;
    let result=cents(snapshot.amount);
    for(const t of db.transactions){
      if(!t.date || t.date<=snapshot.date)continue;
      if(t.type!=='transfer' && (window.FFCurrency?FFCurrency.currency(t):(t.currency||'GBP'))!==accountCurrency(name))continue;
      if(t.type==='transfer' && t.transferTo){
        if(t.account===name)result-=cents(t.amount);
        if(t.transferTo===name)result+=cents(t.transferAmountTo??t.amount);
      }else if(t.account===name && (t.type==='income'||t.type==='expense'))result+=signed(t);
    }
    return result/100;
  }
  function balanceRow(name){
    const b=accountBalance(name),snap=db.accountSnapshots[name];
    return `<div class="line"><div><strong>${escapeHtml(name)}</strong><div class="muted">${snap?'Confirmed '+escapeHtml(snap.date):'Not reconciled'}</div></div><strong>${b===null?'Not set':fmt(b,accountCurrency(name))}</strong></div>`;
  }
  function drawBalances(){
    const known=db.accounts.map(name=>({name,b:accountBalance(name)})).filter(x=>x.b!==null);const grouped={};known.forEach(x=>{const c=accountCurrency(x.name);grouped[c]=(grouped[c]||0)+x.b});const totals=Object.entries(grouped).map(([c,n])=>fmt(n,c)).join(' · ');const missing=db.accounts.length-known.length;const expanded=localStorage.getItem('ff_balance_expanded')==='1';$('homeAccountBalances').innerHTML=`<button type="button" id="balanceToggle" class="balance-toggle" aria-expanded="${expanded}"><span><span class="balance-total">${known.length?escapeHtml(totals):'Not reconciled'}</span><br><small>${known.length} confirmed · ${missing} unverified ${missing?'· total excludes unverified accounts':''}</small></span><span>${expanded?'▲':'▼'}</span></button><div id="balanceDetail" class="balance-detail" ${expanded?'':'hidden'}>${db.accounts.map(balanceRow).join('')}</div>`;$('balanceToggle').onclick=()=>{const detail=$('balanceDetail');detail.hidden=!detail.hidden;$('balanceToggle').setAttribute('aria-expanded',String(!detail.hidden));$('balanceToggle').lastElementChild.textContent=detail.hidden?'▼':'▲';localStorage.setItem('ff_balance_expanded',detail.hidden?'0':'1')};
    let host=$('balanceSettings');host.replaceChildren();
    db.accounts.forEach(name=>{
      let snap=db.accountSnapshots[name]||{};
      let panel=document.createElement('div');panel.className='receipt-item';
      let title=document.createElement('strong');title.textContent=name;
      let grid=document.createElement('div');grid.className='grid2';
      let amountBox=document.createElement('div'),dateBox=document.createElement('div');
      let al=document.createElement('label');al.textContent='Confirmed balance ('+accountCurrency(name)+')';
      let amount=document.createElement('input');amount.type='number';amount.step='0.01';amount.placeholder='e.g. 1250.00';amount.value=snap.amount??'';
      let dl=document.createElement('label');dl.textContent='As of date';
      let date=document.createElement('input');date.type='date';date.value=snap.date||dateToday();
      amountBox.append(al,amount);dateBox.append(dl,date);grid.append(amountBox,dateBox);
      let btn=document.createElement('button');btn.className='secondary';btn.style.marginTop='8px';btn.textContent='Save confirmed balance';
      btn.onclick=()=>{
        if(amount.value.trim()===''||!Number.isFinite(Number(amount.value))||!date.value){alert('Enter a valid balance and date');return}
        if(date.value>dateToday()&&!confirm('This date is in the future. Continue?'))return;
        db.accountSnapshots[name]={amount:Math.round(Number(amount.value)*100)/100,date:date.value};save();drawBalances();
      };
      let currencyBox=document.createElement('div');let cl=document.createElement('label');cl.textContent='Account currency';let cs=document.createElement('select');['GBP','HKD','JPY','USD','EUR','AUD','CAD','CNY','SGD','CHF','TWD','NZD',...Object.values(db.accountCurrencies)].filter((x,i,a)=>a.indexOf(x)===i).forEach(c=>cs.add(new Option(c,c)));cs.value=accountCurrency(name);cs.onchange=()=>{if(cs.value===accountCurrency(name))return;if(!confirm('Change account currency to '+cs.value+'? Existing transaction currencies and confirmed balances will NOT be converted. Please verify the balance and transaction currencies.')){cs.value=accountCurrency(name);return}db.accountCurrencies[name]=cs.value;delete db.accountSnapshots[name];save();drawBalances()};currencyBox.append(cl,cs);
      let info=document.createElement('div');info.className='muted';info.style.marginTop='8px';info.textContent='Calculated now: '+(accountBalance(name)===null?'Not set':fmt(accountBalance(name),accountCurrency(name)));
      panel.append(title,currencyBox,grid,btn,info);host.append(panel);
    });
    for(const id of ['transferFrom','transferTo'])opt(id,db.accounts);
  }
  $('transferDate').value=dateToday();
  $('transferForm').onsubmit=e=>{
    e.preventDefault();const from=$('transferFrom').value,to=$('transferTo').value,amount=Number($('transferAmount').value),date=$('transferDate').value;
    if(!from||!to||from===to||!Number.isFinite(amount)||amount<=0||!date){alert('Choose different accounts, a date and positive amount.');return}
    if(accountCurrency(from)!==accountCurrency(to)){alert('Cross-currency transfers need separate actual sent and received amounts. This form currently supports same-currency transfers only.');return}
    db.transactions.push({id:uid(),type:'transfer',merchant:'Transfer: '+from+' → '+to,amount:Math.round(amount*100)/100,date,category:'Internal transfer',payer:'Joint',account:from,transferTo:to,currency:accountCurrency(from)});
    save();$('transferAmount').value='';drawBalances();alert('Transfer saved (not counted as income or spending).');
  };
  const originalRender=render;
  render=function(){originalRender();drawBalances()};
  render();
})();
