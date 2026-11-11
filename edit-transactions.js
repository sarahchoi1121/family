/* v1.0.5: edit stored transactions locally; original import archive is unchanged. */
(()=>{'use strict';
 const host=document.getElementById('editTransactionHost');
 const currencyList=['GBP','HKD','JPY','USD','EUR','AUD','CAD','CNY','SGD','CHF','TWD','NZD'];
 const field=(label,el)=>{const wrap=document.createElement('div');const l=document.createElement('label');l.textContent=label;wrap.append(l,el);return wrap};
 const input=(value,type='text')=>{const el=document.createElement('input');el.type=type;el.value=value??'';if(type==='number')el.step='0.01';return el};
 const select=(values,value)=>{const el=document.createElement('select');[...new Set(values)].forEach(x=>el.add(new Option(x,x)));el.value=value;return el};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(!b)return;const t=db.transactions.find(x=>String(x.id)===b.dataset.edit);if(!t)return;
 if(t.type==='transfer'){alert('Transfer editing is not supported yet; use a backup before changing transfers.');return}
 host.replaceChildren();const box=document.createElement('div');box.className='panel';box.style.cssText='position:fixed;z-index:999;inset:5% 3%;overflow:auto;box-shadow:0 0 0 100vmax #0007;background:white';
 const h=document.createElement('h2');h.textContent='Edit transaction';const notice=document.createElement('p');notice.className='notice';notice.textContent='Changes update local reports; the imported Excel archive stays unchanged. Export a backup first.';
 const merchant=input(t.merchant),amount=input(t.amount,'number'),date=input(t.date,'date'),category=input(t.category),payer=input(t.payer),account=select([...db.accounts,t.account],t.account),type=select(['income','expense'],t.type),currency=select([...currencyList,t.currency|| (window.FFCurrency?FFCurrency.currency(t):'GBP')],t.currency||(window.FFCurrency?FFCurrency.currency(t):'GBP'));
 const form=document.createElement('form');[["Description",merchant],["Amount",amount],["Date",date],["Type",type],["Category",category],["Payer",payer],["Account",account],["Currency",currency]].forEach(([l,v])=>form.append(field(l,v)));
 const saveBtn=document.createElement('button');saveBtn.textContent='Save changes';saveBtn.type='submit';const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.type='button';cancel.className='secondary';cancel.style.marginLeft='8px';cancel.onclick=()=>host.replaceChildren();form.append(saveBtn,cancel);box.append(h,notice,form);host.append(box);
 form.onsubmit=ev=>{ev.preventDefault();const n=Number(amount.value);if(!merchant.value.trim()||!category.value.trim()||!date.value||!Number.isFinite(n)||n<0){alert('Check description, category, date and amount.');return}const before={date:t.date,type:t.type,merchant:t.merchant,amount:t.amount,category:t.category,payer:t.payer,account:t.account,currency:t.currency};t.editHistory||=[];t.editHistory.push({at:new Date().toISOString(),before});Object.assign(t,{merchant:merchant.value.trim(),amount:Math.round(n*100)/100,date:date.value,type:type.value,category:category.value.trim(),payer:payer.value.trim(),account:account.value,currency:currency.value});if(!CATS.includes(t.category))CATS.push(t.category);host.replaceChildren();save()};
 });
})();
