/* Account balances v0.4. Historical Excel movements are NOT opening balances. */
(()=>{
  db.accountSnapshots ||= {};
  const dateToday=()=>new Date().toLocaleDateString('en-CA');
  const cents=n=>Math.round(Number(n)*100);
  const signed=t=>t.type==='income'?cents(t.amount):t.type==='expense'?-cents(t.amount):0;
  function accountBalance(name){
    const snapshot=db.accountSnapshots[name];
    if(!snapshot || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date) || !Number.isFinite(Number(snapshot.amount)))return null;
    let result=cents(snapshot.amount);
    for(const t of db.transactions){
      if(!t.date || t.date<=snapshot.date)continue;
      if(t.type==='transfer' && t.transferTo){
        if(t.account===name)result-=cents(t.amount);
        if(t.transferTo===name)result+=cents(t.amount);
      }else if(t.account===name && (t.type==='income'||t.type==='expense'))result+=signed(t);
    }
    return result/100;
  }
  function balanceRow(name){
    const b=accountBalance(name),snap=db.accountSnapshots[name];
    return `<div class="line"><div><strong>${escapeHtml(name)}</strong><div class="muted">${snap?'Confirmed '+escapeHtml(snap.date):'Not reconciled'}</div></div><strong>${b===null?'Not set':money(b)}</strong></div>`;
  }
  function drawBalances(){
    $('homeAccountBalances').innerHTML=db.accounts.map(balanceRow).join('');
    let host=$('balanceSettings');host.replaceChildren();
    db.accounts.forEach(name=>{
      let snap=db.accountSnapshots[name]||{};
      let panel=document.createElement('div');panel.className='receipt-item';
      let title=document.createElement('strong');title.textContent=name;
      let grid=document.createElement('div');grid.className='grid2';
      let amountBox=document.createElement('div'),dateBox=document.createElement('div');
      let al=document.createElement('label');al.textContent='Confirmed balance (£)';
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
      let info=document.createElement('div');info.className='muted';info.style.marginTop='8px';info.textContent='Calculated now: '+(accountBalance(name)===null?'Not set':money(accountBalance(name)));
      panel.append(title,grid,btn,info);host.append(panel);
    });
    for(const id of ['transferFrom','transferTo'])opt(id,db.accounts);
  }
  $('transferDate').value=dateToday();
  $('transferForm').onsubmit=e=>{
    e.preventDefault();const from=$('transferFrom').value,to=$('transferTo').value,amount=Number($('transferAmount').value),date=$('transferDate').value;
    if(!from||!to||from===to||!Number.isFinite(amount)||amount<=0||!date){alert('Choose different accounts, a date and positive amount.');return}
    db.transactions.push({id:uid(),type:'transfer',merchant:'Transfer: '+from+' → '+to,amount:Math.round(amount*100)/100,date,category:'Internal transfer',payer:'Joint',account:from,transferTo:to});
    save();$('transferAmount').value='';drawBalances();alert('Transfer saved (not counted as income or spending).');
  };
  const originalRender=render;
  render=function(){originalRender();drawBalances()};
  render();
})();
