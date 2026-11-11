/* Currency is stored per transaction. No FX conversion. */
(()=>{'use strict';
 const code=x=>/^[A-Z]{3}$/.test(String(x||'').toUpperCase())?String(x).toUpperCase():null;
 const suffix=s=>{const m=String(s||'').match(/(?:^|[\s_\-(/])(?:HKD|JPY|GBP|USD|EUR|AUD|CAD|CNY|TWD|SGD|CHF|NZD)(?=$|[\s_\-)/])/i);return m?m[0].match(/[A-Z]{3}/i)[0].toUpperCase():null};
 const currency=t=>code(t.currency)||suffix(t.category)||'GBP';
 const format=(value,c)=>{try{return new Intl.NumberFormat('en-GB',{style:'currency',currency:c}).format(value)}catch{return c+' '+Number(value||0).toFixed(2)}};
 window.FFCurrency={currency,format,code};
 const sel=document.getElementById('transactionCurrency');
 const existing=[...new Set(db.transactions.map(currency))];
 for(const c of existing)if(![...sel.options].some(o=>o.value===c))sel.add(new Option(c,c));
 // Capture currency at form submission, including the original receipt flow where currency is absent.
 const form=document.getElementById('transactionForm');
 form.addEventListener('submit',()=>{const t=db.transactions[db.transactions.length-1];if(t&&!t.currency){t.currency=sel.value;try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){console.warn('Currency save failed',e)}}});
})();
