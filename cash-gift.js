/* Cash count and eGift cards. Local-only snapshots; no effect on ledger totals. */
(()=>{
  const cashHost=document.getElementById('cashCountUI');
  const giftHost=document.getElementById('giftCardUI');
  if(!cashHost||!giftHost)return;
  const denominations=[5000,2000,1000,500,200,100,50,20,10,5,2,1];
  const labels=['£50','£20','£10','£5','£2','£1','50p','20p','10p','5p','2p','1p'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pounds=p=>(Number(p)/100).toLocaleString('en-GB',{style:'currency',currency:'GBP'});
  const date=()=>new Date().toLocaleDateString('en-CA');
  const id=()=>globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2);
  const amountToPence=x=>{const n=Number(x);return Number.isFinite(n)&&n>=0&&n<=1e9?Math.round(n*100):null};
  db.cashCount ||= {counts:{},date:'',history:[]};
  db.giftCards ||= [];
  const store=()=>{try{save()}catch(e){alert('Could not save: '+e.message);return false}return true};
  function cashPaint(){
    const c=db.cashCount;
    cashHost.innerHTML=`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${denominations.map((v,i)=>`<label style="font-weight:600">${labels[i]}<input data-cash="${v}" type="number" min="0" max="1000000" step="1" inputmode="numeric" value="${Number(c.counts[v])||0}" style="width:100%"/></label>`).join('')}</div><p style="font-size:20px;font-weight:700;margin:15px 0">Counted cash: <span id="cashCountTotal">£0.00</span></p><label>Count date<input type="date" id="cashCountDate" value="${esc(c.date||date())}"/></label><div class="btnrow" style="margin-top:12px"><button type="button" id="cashCountSave">Save cash count</button><button type="button" class="secondary" id="cashCountReset">Clear input</button></div><p class="notice" id="cashCountStatus"></p><details><summary>Previous cash counts</summary><div id="cashCountHistory"></div></details>`;
    cashHost.querySelectorAll('[data-cash]').forEach(el=>el.addEventListener('input',updateCashTotal));
    cashHost.querySelector('#cashCountSave').addEventListener('click',()=>{
      const counts={};for(const el of cashHost.querySelectorAll('[data-cash]')){const n=Number(el.value);if(!Number.isSafeInteger(n)||n<0||n>1000000){alert('Enter a whole number between 0 and 1,000,000 for each denomination.');return}counts[el.dataset.cash]=n}
      const dt=cashHost.querySelector('#cashCountDate').value;if(!/^\d{4}-\d\d-\d\d$/.test(dt)){alert('Select a valid count date.');return}
      const totalPence=denominations.reduce((s,v)=>s+v*counts[v],0);
      const previous=structuredClone(db.cashCount);
      db.cashCount={counts,date:dt,history:[...(previous.history||[]),{id:id(),date:dt,totalPence,counts,createdAt:new Date().toISOString()}]};
      if(store()){cashPaint();cashHost.querySelector('#cashCountStatus').textContent='Cash count saved locally. This does not change your bank or ledger balance.'}else db.cashCount=previous;
    });
    cashHost.querySelector('#cashCountReset').addEventListener('click',()=>{if(!confirm('Clear the on-screen cash quantities? Saved history will remain.'))return;cashHost.querySelectorAll('[data-cash]').forEach(el=>el.value='0');updateCashTotal()});
    updateCashTotal();cashHistory();
  }
  function updateCashTotal(){let total=0;cashHost.querySelectorAll('[data-cash]').forEach(el=>{const n=Number(el.value);if(Number.isSafeInteger(n)&&n>=0)total+=n*Number(el.dataset.cash)});cashHost.querySelector('#cashCountTotal').textContent=pounds(total)}
  function cashHistory(){cashHost.querySelector('#cashCountHistory').innerHTML=(db.cashCount.history||[]).slice(-10).reverse().map(h=>`<div class="line"><span>${esc(h.date)}</span><strong>${pounds(h.totalPence)}</strong></div>`).join('')||'<p class="notice">No previous cash counts.</p>'}
  function giftPaint(){
    giftHost.innerHTML=`<form id="giftAddForm"><label>Merchant / card name<input id="giftName" required maxlength="100" placeholder="Amazon, Tesco, John Lewis…"/></label><div class="grid2"><div><label>Starting balance (£)<input id="giftStarting" required type="number" min="0" step="0.01" inputmode="decimal"/></label></div><div><label>Expiry (optional)<input id="giftExpiry" type="date"/></label></div></div><button type="submit" style="margin-top:10px">Add eGift card</button></form><p style="font-size:20px;font-weight:700">Remaining eGift value: ${pounds(db.giftCards.reduce((s,c)=>s+Math.max(0,Number(c.balancePence)||0),0))}</p><div id="giftList">${db.giftCards.map(c=>`<div class="panel" style="padding:12px;margin:12px 0;border:1px solid #dce8e4"><strong>${esc(c.name)}</strong><div class="notice">Remaining ${pounds(c.balancePence)} · Expiry: ${esc(c.expiry||'Not set')}</div><div class="grid2"><div><label>Amount (£)<input data-gift-amount="${esc(c.id)}" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00"/></label></div><div><label>Transaction date<input data-gift-date="${esc(c.id)}" type="date" value="${date()}"/></label></div></div><div class="btnrow" style="margin-top:10px"><button type="button" data-gift-use="${esc(c.id)}">Use balance</button><button type="button" class="secondary" data-gift-topup="${esc(c.id)}">Add value</button><button type="button" class="secondary" data-gift-delete="${esc(c.id)}">Delete</button></div><details><summary>Card activity</summary>${(c.history||[]).slice().reverse().map(h=>`<div class="line"><span>${esc(h.date)} · ${esc(h.type)}</span><strong>${h.type==='receipt-balance'?'=':h.type==='use'?'-':'+'}${pounds(h.amountPence)}</strong></div>`).join('')||'<p class="notice">No activity yet.</p>'}</details></div>`).join('')||'<p class="notice">No eGift cards added.</p>'}</div>`;
    giftHost.querySelector('#giftAddForm').addEventListener('submit',e=>{e.preventDefault();const name=giftHost.querySelector('#giftName').value.trim();const val=amountToPence(giftHost.querySelector('#giftStarting').value);if(!name||val===null){alert('Enter a card name and valid balance.');return}db.giftCards.push({id:id(),name,balancePence:val,expiry:giftHost.querySelector('#giftExpiry').value,history:[]});if(store())giftPaint()});
    giftHost.querySelectorAll('[data-gift-use],[data-gift-topup],[data-gift-delete]').forEach(btn=>btn.addEventListener('click',()=>{
      const action=btn.hasAttribute('data-gift-use')?'use':btn.hasAttribute('data-gift-topup')?'topup':'delete';const card=db.giftCards.find(c=>c.id===btn.getAttribute('data-gift-'+action));if(!card)return;
      if(action==='delete'){if(!confirm('Delete '+card.name+' and its local activity history?'))return;db.giftCards=db.giftCards.filter(c=>c.id!==card.id);if(store())giftPaint();return}
      const input=giftHost.querySelectorAll('[data-gift-amount]');const amount=Array.from(input).find(el=>el.dataset.giftAmount===card.id);const p=amountToPence(amount?.value);if(p===null||p<=0){alert('Enter an amount greater than £0.');return}if(action==='use'&&p>card.balancePence){alert('Insufficient gift card balance.');return}
      const d=Array.from(giftHost.querySelectorAll('[data-gift-date]')).find(el=>el.dataset.giftDate===card.id)?.value;if(!/^\d{4}-\d\d-\d\d$/.test(d)){alert('Choose a transaction date.');return}
      card.balancePence+=(action==='use'?-p:p);card.history||=[];card.history.push({id:id(),date:d,type:action,amountPence:p});if(store())giftPaint();
    }));
  }
  cashPaint();giftPaint();
  // IndexedDB may load asynchronously after this module. Refresh when the panel is opened.
  document.getElementById('cashCountPanel').addEventListener('toggle',e=>{if(e.target.open){db.cashCount ||= {counts:{},date:'',history:[]};cashPaint()}});
  document.getElementById('giftCardPanel').addEventListener('toggle',e=>{if(e.target.open){db.giftCards ||= [];giftPaint()}});
})();
