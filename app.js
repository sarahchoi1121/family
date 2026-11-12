const KEY='familyfinance_v02';const CATS=['Groceries','Baby & Kids','Household','Pets','Transport','Mortgage & Housing','Utilities','Dining','Shopping','Health','Entertainment','Salary','Benefits','Other'];const defaults={transactions:[],accounts:['Cash','Bank account','Credit card'],rules:{},accountSnapshots:{}};let db;try{db=JSON.parse(localStorage.getItem(KEY))||structuredClone(defaults)}catch{db=structuredClone(defaults)};db.accounts ||=defaults.accounts;db.transactions ||= [];db.rules ||= {};db.accountSnapshots ||= {};for(const t of db.transactions){if(t.category&&!CATS.includes(t.category))CATS.push(t.category)}let receipt=[];const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n||0),today=()=>new Date().toLocaleDateString('en-CA'),uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){alert('Storage full. Export a backup before continuing.');throw e}render()}function opt(select,values){const el=$(select);const current=el.value;el.replaceChildren(...values.map(x=>{let o=document.createElement('option');o.value=o.textContent=x;return o}));if(values.includes(current))el.value=current}function categoryFor(s){let x=s.toLowerCase().trim();if(db.rules[x])return db.rules[x];if(/napp|pampers|huggies|baby|formula|wipes|toddler/.test(x))return 'Baby & Kids';if(/dog|cat|pet|kibble|litter|pedigree/.test(x))return 'Pets';if(/detergent|cleaner|bleach|tissue|toilet roll|washing liquid/.test(x))return 'Household';if(/petrol|diesel|parking|train|bus|fuel/.test(x))return 'Transport';if(/milk|bread|egg|banana|chicken|beef|rice|apple|cheese|yoghurt|potato|fruit|vegetable/.test(x))return 'Groceries';return 'Other'}function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function render(){refreshAddCategories();opt('account',window.FFAccounts?FFAccounts.names():db.accounts);opt('receiptAccount',window.FFAccounts?FFAccounts.names():db.accounts);$('accountsList').innerHTML=(window.FFAccounts?FFAccounts.groups().map(g=>g.label+(g.conflict?' ⚠ Check currency / balance':' ')):db.accounts).map(a=>`<div class="line">${escapeHtml(a)}</div>`).join('');const ym=today().slice(0,7),monthly=db.transactions.filter(t=>t.date?.startsWith(ym)&&(!window.FFCurrency||FFCurrency.currency(t)==='GBP')),inc=monthly.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),exp=monthly.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);$('income').textContent=money(inc);$('expenses').textContent=money(exp);$('balance').textContent=money(inc-exp);$('month').textContent=new Date().toLocaleString('en-GB',{month:'short',year:'numeric'});let totals={};monthly.filter(t=>t.type==='expense').forEach(t=>totals[t.category]=(totals[t.category]||0)+t.amount);$('breakdown').innerHTML=Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`<div style="margin:13px 0"><div class="line" style="padding:0;border:0"><span>${escapeHtml(c)}</span><strong>${money(n)}</strong></div><div class="bar"><span style="width:${exp?100*n/exp:0}%"></span></div></div>`).join('')||'<div class="empty">No expenses this month</div>';$('recent').innerHTML=transactionHtml(db.transactions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5));showHistory()}function transactionHtml(ts){return ts.map(t=>`<div class="line"><div><strong>${escapeHtml(t.merchant)}</strong><div class="muted">${escapeHtml(t.date)} · ${escapeHtml(t.category)} · ${escapeHtml(t.payer)} · ${escapeHtml(t.account)}</div></div><div style="text-align:right"><strong class="amount" style="color:${t.type==='income'?'#197e5a':'#263a32'}">${t.type==='income'?'+':t.type==='transfer'?'↔':'−'}${window.FFCurrency?FFCurrency.format(t.amount,FFCurrency.currency(t)):money(t.amount)}</strong><br><button class="secondary" style="padding:4px 8px;font-size:11px;margin-top:5px" data-edit="${escapeHtml(t.id)}">Edit</button> <button class="danger" style="padding:4px 8px;font-size:11px;margin-top:5px" data-delete="${escapeHtml(t.id)}">Delete</button></div></div>`).join('')||'<div class="empty">No transactions yet</div>'}function showHistory(){if($('history').classList.contains('hidden'))return;let q=$('search').value.toLowerCase();$('historyList').innerHTML=transactionHtml(db.transactions.filter(t=>(t.merchant+' '+t.category).toLowerCase().includes(q)).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,150))}document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('main section').forEach(x=>x.classList.add('hidden'));$(b.dataset.tab).classList.remove('hidden');document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));render()});function refreshAddCategories(){
 const kind=$('addFinancialGroup')?.value||'nonrecurring',el=$('category');if(!el)return;
 const entries=db.categoryProfile?.categories||[];
 const seen=new Set(),names=[];
 for(const c of entries){if(c.active===false||c.kind!==kind)continue;const name=String(c.name||'').trim(),key=name.normalize('NFKC').toLocaleLowerCase('en-GB');if(!key||seen.has(key))continue;seen.add(key);names.push(name)}
 names.sort((a,b)=>a.localeCompare(b,'en-GB'));const prev=el.value;
 el.replaceChildren(...names.map(name=>new Option(name,name)));
 if(names.includes(prev))el.value=prev;
 if(!names.length){el.add(new Option('No categories in this group — add in Settings',''));el.value=''}
 const hint=$('addCategoryHint');if(hint)hint.textContent=names.length?'Only categories belonging to the selected financial group are shown.':'Add or activate categories for this financial group in Settings.';
}
$('addFinancialGroup').onchange=()=>{ $('category').value='';refreshAddCategories()};
$('date').value=today();$('receiptDate').value=today();$('transactionForm').onsubmit=e=>{e.preventDefault();if(!$('category').value||!receiptCategories($('addFinancialGroup').value).includes($('category').value)){alert('Choose a category in the selected Financial Group.');return}const financialGroup=$('addFinancialGroup').value,transactionType=financialGroup==='income'?'income':'expense';db.transactions.push({id:uid(),type:transactionType,financialGroup,merchant:$('merchant').value.trim(),amount:Math.round(Number($('amount').value)*100)/100,date:$('date').value,category:$('category').value,payer:'',account:$('account').value,currency:$('transactionCurrency').value,...(window.FFWallet?.isGiftAccount($('account').value)&&transactionType==='expense'?{giftMerchant:FFWallet.selectedMerchant()}:{})});save();$('transactionForm').reset();$('date').value=today();$('addFinancialGroup').value=financialGroup;refreshAddCategories();alert('Transaction saved')};$('addAccount').onclick=()=>{let a=$('newAccount').value.trim();if(a&&!(window.FFAccounts?FFAccounts.groups().some(g=>FFAccounts.key(g.label)===FFAccounts.key(a)):db.accounts.includes(a))){db.accounts.push(a);$('newAccount').value='';save()}};$('search').oninput=showHistory;document.addEventListener('click',e=>{let id=e.target.dataset.delete;if(id&&confirm('Delete this transaction?')){db.transactions=db.transactions.filter(t=>t.id!==id);save()}});
const RECEIPT_GROUPS=[['recurring','Recurring'],['nonrecurring','Non-recurring'],['fixed','Fixed asset'],['income','Income']];
const receiptRound=n=>Math.round((Number(n)||0)*100)/100;
function receiptCategories(kind){const entries=db.categoryProfile?.categories||[];const seen=new Set();return entries.filter(c=>c.active!==false&&c.kind===kind).map(c=>String(c.name||'').trim()).filter(name=>{const key=name.normalize('NFKC').toLocaleLowerCase('en-GB');if(!key||seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>a.localeCompare(b,'en-GB'))}
function receiptGroupFor(category){const entry=(db.categoryProfile?.categories||[]).find(c=>c.name.toLowerCase()===String(category).toLowerCase());return entry?.kind||db.categoryGroups?.[String(category).toLowerCase()]||'nonrecurring'}
function receiptNewItem(name='',price=0,vat='0',coupon=false){let category=categoryFor(name),kind=receiptGroupFor(category),cats=receiptCategories(kind);if(!cats.includes(category))category=cats[0]||'';return {id:uid(),name,price,vat,kind,category,coupon}}
function addReceiptItem(name='',price=0){receipt.push(receiptNewItem(name,price));drawReceipt()}
function receiptAmounts(i){const gross=$('receiptVatMode').value==='exclusive'?receiptRound(i.price*(1+(Number(i.vat)||0)/100)):receiptRound(i.price);const net=$('receiptVatMode').value==='exclusive'?receiptRound(i.price):receiptRound(gross/(1+(Number(i.vat)||0)/100));return {net,gross,vat:receiptRound(gross-net)}}
function receiptSummary(){const totals=new Map();let sum=0,vat=0;for(const i of receipt){const a=receiptAmounts(i);sum+=a.gross;vat+=a.vat;totals.set(i.category||'Uncategorised',receiptRound((totals.get(i.category||'Uncategorised')||0)+a.gross))}sum=receiptRound(sum);vat=receiptRound(vat);let html=[...totals].sort((a,b)=>b[1]-a[1]).map(([c,n])=>`<div class="line"><span>${escapeHtml(c)}</span><strong>${money(n)}</strong></div>`).join('')||'<p class="muted">No items yet</p>'; $('receiptCategorySummary').innerHTML=html;return {sum,vat}}
function drawReceipt(){let host=$('receiptItems');host.replaceChildren();receipt.forEach((item,i)=>{let wrap=document.createElement('div');wrap.className='receipt-item';let name=document.createElement('input');name.value=item.name;name.placeholder='Item name';name.oninput=()=>{item.name=name.value};let row=document.createElement('div');row.className='grid2';let price=document.createElement('input');price.type='number';price.step='0.01';price.value=item.price;price.setAttribute('aria-label','Item price');price.oninput=()=>{item.price=Number(price.value)||0;reconcile()};let vat=document.createElement('select');[['0','VAT 0%'],['5','VAT 5%'],['20','VAT 20%']].forEach(([v,l])=>vat.add(new Option(l,v)));vat.value=item.vat||'0';vat.onchange=()=>{item.vat=vat.value;reconcile()};let group=document.createElement('select');RECEIPT_GROUPS.forEach(([v,l])=>group.add(new Option(l,v)));group.value=item.kind;let cat=document.createElement('select');function fillCats(){let cats=receiptCategories(item.kind);cat.replaceChildren(...cats.map(c=>new Option(c,c)));if(cats.includes(item.category))cat.value=item.category;else item.category=cat.value||'';if(!cats.length){cat.add(new Option('No active categories — add in Settings',''));item.category=''}}fillCats();group.onchange=()=>{item.kind=group.value;item.category='';fillCats();reconcile()};cat.onchange=()=>{item.category=cat.value;if(item.name.trim())db.rules[item.name.toLowerCase().trim()]=cat.value;reconcile()};let discount=document.createElement('label');discount.style.cssText='display:flex;gap:7px;align-items:center;font-size:12px;margin:8px 0';let check=document.createElement('input');check.type='checkbox';check.checked=!!item.coupon;check.style.width='auto';check.onchange=()=>{item.coupon=check.checked;reconcile()};discount.append(check,document.createTextNode('Coupon / discount (negative price)'));let del=document.createElement('button');del.className='danger';del.textContent='Remove';del.style.marginTop='8px';del.onclick=()=>{receipt.splice(i,1);drawReceipt()};let label=document.createElement('div');label.className='muted';label.style.marginTop='5px';label.textContent='Price · VAT';let second=document.createElement('div');second.className='grid2';second.append(group,cat);let label2=document.createElement('div');label2.className='muted';label2.style.marginTop='8px';label2.textContent='Financial group · Category';row.append(price,vat);wrap.append(name,label,row,label2,second,discount,del);host.append(wrap)});$('receiptEditor').classList.remove('hidden');reconcile()}
function reconcile(){const {sum,vat}=receiptSummary(),total=Number($('receiptTotal').value)||0,diff=receiptRound(total-sum);$('itemsSum').textContent=money(sum);$('receiptVatSum').textContent=money(vat);$('receiptDifference').textContent=money(diff);$('reconcile').textContent=total?Math.abs(diff)<.011?'✓ Category total matches receipt total':`⚠ Difference: ${money(diff)}. Review VAT mode, coupons, missing items and receipt total.`:'Enter receipt total to verify.'}
$('receiptTotal').oninput=reconcile;$('receiptVatMode').onchange=reconcile;$('addItem').onclick=()=>addReceiptItem();$('manualBtn').onclick=()=>{receipt=[];addReceiptItem()};
// Apple Shortcuts Live Text often emits every product name first and the right-hand
// price column afterwards. Never guess a product/price association from that layout.
function parseTescoLiveText(lines){
 const items=[];let started=false,footer=false,last=null,loosePrices=[],discounts=[];
 const stop=/^(?:subtotal|savings|promotions|total\s*:|gift\s*c[a-z]*|clubcard points|balance|new giftcard)/i;
 const moneyToken=/^[-−]?\s*[£€$E]?\s*\d+[.,]\d{2}$/i;
 const parseMoney=x=>{const n=Number(x.replace(/[^\d.,]/g,'').replace(',','.'));return /^\s*[-−]/.test(x)?-n:n};
 const skip=/^(?:tesco\b|mansfield\b|any questions|www\.|vat number|cc\s*[£€$E]?\s*\d|co\s*[£€$E]?\s*\d|£\s*\d+[.,]\d{2}\s*each|[0-9]+\s*items|\d{2}\/\d{2}\/\d{2,4})/i;
 for(const line of lines){
  if(stop.test(line)){footer=true;continue}
  if(footer)continue;
  if(moneyToken.test(line)){
   const n=parseMoney(line);if(n<0)discounts.push(n);else loosePrices.push(n);
   continue;
  }
  const m=line.match(/^(\d+)\s+([A-Za-z][\s\S]{5,})$/i);
  if(m&&!skip.test(line)){
   const qty=Number(m[1]);if(qty>0&&qty<=30){
    const raw=m[2].trim();const amount=raw.match(/\s+[£]\s*(\d+[.,]\d{2})\s*$/);
    const name=amount?raw.slice(0,amount.index).trim():raw;
    last=receiptNewItem(name,amount?Number(amount[1].replace(',','.')):0);
    last.quantity=qty;last.priceUnverified=!amount;items.push(last);started=true;continue;
   }
  }
  if(started&&last&&/^(?:vanilla|\d+g\b|\d+ml\b|\d+\s*pints?\b|pints?\b|\d+\s*pack\b)/i.test(line))last.name+=' '+line;
 }
 // Only match a detached price column when the count is EXACTLY the number of
 // missing prices. Otherwise leave zeros for manual verification: never guess.
 const missing=items.filter(i=>i.priceUnverified);
 let matched=false;
 if(missing.length>0&&loosePrices.length===missing.length){
  missing.forEach((item,i)=>{item.price=loosePrices[i];item.priceUnverified=false});matched=true;
 }
 for(const n of discounts)items.push(receiptNewItem('Tesco Clubcard discount — verify product',n,'0',true));
 return {items,discounts:discounts.length,matched,unmatched:missing.filter(i=>i.priceUnverified).length,loosePrices:loosePrices.length};
}
function parseText(){
 const lines=$('rawText').value.split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
 receipt=[];let pending='',couponSection=false,merchant='',discounts=[];
 const full=lines.join(' '),costco=/warehouse\s*receipt|costco/i.test(full),tesco=/tesco/i.test(full),aldi=/aldi\s*stores/i.test(full),sainsbury=/sainsbury/i.test(full),marks=/marksandspencer|m&s/i.test(full);
 merchant=costco?'Costco':tesco?'Tesco':aldi?'Aldi':sainsbury?"Sainsbury's":marks?'M&S':'';
 // Live Text column-split Tesco receipts require a separate, conservative parser.
 const tescoColumnSplit=tesco&&lines.filter(x=>/^\d+\s+(?:Tesco|Coca Cola)/i.test(x)).length>=3&&lines.filter(x=>/^[-−]?\s*[£€$E]?\s*\d+[.,]\d{2}\s*$/.test(x)).length>=2;
 if(tescoColumnSplit){
  const parsed=parseTescoLiveText(lines);receipt=parsed.items;
  $('receiptMerchant').value='Tesco';$('receiptTotal').value='';$('receiptDate').value='';$('receiptVatMode').value='inclusive';
  const validDate=lines.join(' ').match(/\b([0-3]\d)[.\/-]([01]\d)[.\/-](20\d{2}|\d{2})\b/);
  if(validDate){const year=validDate[3].length===2?'20'+validDate[3]:validDate[3];const candidate=year+'-'+validDate[2]+'-'+validDate[1];if(!Number.isNaN(Date.parse(candidate))&&Number(year)>=2020&&Number(year)<=new Date().getFullYear()+1)$('receiptDate').value=candidate}
  drawReceipt();$('status').textContent='Apple Live Text: '+receipt.filter(i=>!i.coupon).length+' products, '+parsed.discounts+' discounts. '+(parsed.matched?'Detached price column matched by item order — verify each price against receipt. ':'')+(parsed.unmatched?'⚠ '+parsed.unmatched+' prices still need manual entry; '+parsed.loosePrices+' detached price values found. ':'')+'Enter/verify receipt total and date before saving.';return;
 }
 const val=x=>Number(String(x).replace(/[£,\s]/g,''));
 const isFooter=x=>/^(?:\*+|total\b|subtotal\b|savings\b|promotions\b|balance\b|change\b|card\b|gift\s*card\b|new balance|clubcard points|nectar|points\b|cash\b|payment\b|vat\b|tax\b|net\b|items\b|card sales|goods\b|authori|terminal|merchant id|eft no|contactless|source\b|approved|thank you|please|your account|customer copy|verification|date\b|receipt\b|individual|copy of|reg\. in|awrs|mastercard|visa|smartshop|store\b|checkout\b|original price|price reduction|\d+\s*items\b|\d+\s*x\s*\d+\s*for\s*\d+)/i.test(x);
 for(let k=0;k<lines.length;k++){
  const line=lines[k];
  if(/^coupon\s*$/i.test(line)){couponSection=true;continue}
  if(/^(?:clubcard\s*(?:discount|saving)|discount\b)/i.test(line)){ 
    const m=line.match(/(-?£?\s*\d+[.,]\d{2})\s*$/);if(m){const n=-Math.abs(val(m[1]));receipt.push(receiptNewItem('Clubcard discount',n,'0',true));}continue;
  }
  if(isFooter(line)){pending='';continue}
  // Costco: preceding product name followed by SKU, quantity, price, total and VAT letter.
  const sku=line.match(/^\d{3,12}\s+\d+\s*[xX×]\s+-?\d+[.,]\d{2}\s+(-?\d+[.,]\d{2})\s*([AZ])?\s*$/i);
  if(sku){const n=val(sku[1]),name=pending||'Unidentified product',coupon=n<0||couponSection||/coupon|discount|irc /i.test(name);receipt.push(receiptNewItem(name,n,sku[2]?.toUpperCase()==='A'?'20':'0',coupon));pending='';couponSection=false;continue}
  // Aldi: product SKU at the start and VAT marker after amount.
  const aldiLine=line.match(/^\d{4,9}\s+(.{3,80}?)\s+£?\s*(\d+[.,]\d{2})\s*[A-Z]?$/i);
  if(aldiLine){receipt.push(receiptNewItem(aldiLine[1],val(aldiLine[2])));pending='';continue}
  // Generic: quantity + item + right-aligned amount, including M&S and Tesco.
  const generic=line.match(/^(?:(?:\d{5,12})\s+)?(?:\d+\s+)?(.{3,100}?)\s+£\s*(-?\d+[.,]\d{2})\s*[AZ]?$/i)||line.match(/^(?:\d+\s+)?(.{3,100}?)\s{2,}(-?\d+[.,]\d{2})\s*[AZ]?$/i);
  if(generic){let name=generic[1].trim(),n=val(generic[2]);if(!isFooter(name)&&!/^\d+$/.test(name)&&!/^(?:original price|price reduction|\d+\s*x\s*\d+)/i.test(name)){
   if(pending&&name.length<18&&/^(?:pints|\d+g|\d+ml)$/i.test(name))name=pending+' '+name;
   receipt.push(receiptNewItem(name,n,'0',n<0||couponSection));pending='';couponSection=false;continue;
  }}
  // A wrapped item description can precede a price-only line.
  const priceOnly=line.match(/^£\s*(\d+[.,]\d{2})$/);
  if(priceOnly&&pending){receipt.push(receiptNewItem(pending,val(priceOnly[1])));pending='';continue}
  if(/[a-z]/i.test(line)&&line.length<100&&!/\d+[.,]\d{2}/.test(line)&&!/^(?:\d{2}[:/]\d{2}|www\.|\d{4,})/i.test(line))pending=line;
 }
 // The original-price and promotion-summary sections are not additional transactions.
 let totalLine=lines.find(x=>/TOTAL\s*\(INCL\s*VAT\)/i.test(x))||lines.find(x=>/^\*{0,4}\s*TOTAL\s*[:£ ]/i.test(x))||lines.find(x=>/balance to pay/i.test(x))||lines.find(x=>/^\d+\s+BALANCE DUE/i.test(x));
 if(totalLine){const nums=totalLine.match(/\d+[.,]\d{2}/g);if(nums)$('receiptTotal').value=nums.at(-1).replace(',','.')}
 const date=full.match(/\b(\d{2})[./-](\d{2})[./-](20\d{2}|\d{2})\b/);if(date){let yr=date[3].length===2?'20'+date[3]:date[3];$('receiptDate').value=`${yr}-${date[2]}-${date[1]}`}
 if(merchant)$('receiptMerchant').value=merchant;
 // UK displayed receipt totals normally already include VAT. Never automatically add VAT.
 $('receiptVatMode').value='inclusive';
 drawReceipt();const counted=receipt.reduce((n,i)=>n+Number(!i.coupon),0);let {sum}=receiptSummary(),total=Number($('receiptTotal').value)||0;
 $('status').textContent=`Found ${counted} products and ${receipt.length-counted} discounts. ${total&&Math.abs(sum-total)>.011?'⚠ Incomplete scan: items differ from receipt total by '+money(total-sum)+'. ':''}Verify names, discounts and totals before saving.`;
}
$('parseBtn').onclick=parseText;
async function receiptImageVariants(file){
 const img=await createImageBitmap(file);const w=img.width,h=img.height;const max=2200,scale=Math.min(2.0,max/Math.max(w,h));const cw=Math.round(w*scale),ch=Math.round(h*scale);
 const c=document.createElement('canvas');c.width=cw;c.height=ch;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,cw,ch);ctx.drawImage(img,0,0,cw,ch);img.close?.();
 const raw=ctx.getImageData(0,0,cw,ch);const pixels=raw.data;
 // Grayscale with modest local contrast; avoid destructive thresholding on faded thermal paper.
 for(let i=0;i<pixels.length;i+=4){let g=.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2];g=Math.max(0,Math.min(255,(g-128)*1.65+145));pixels[i]=pixels[i+1]=pixels[i+2]=g;}
 ctx.putImageData(raw,0,0);return c;
}
function receiptOCRQuality(text){const lines=text.split(/\n/);let score=0;for(const l of lines){if(/(?:£\s*)?\d+[.,]\d{2}\s*[AZ]?\s*$/i.test(l))score+=3;if(/total|subtotal|balance due/i.test(l))score+=3;if(/tesco|aldi|sainsbury|costco|m&s/i.test(l))score+=4;}return score}
let selectedReceiptFile=null;for(const id of ['receiptFile','receiptUpload']){$(id).addEventListener('change',()=>{const file=$(id).files[0];if(!file)return;if(!file.type.startsWith('image/')){$('status').textContent='Please select an image file.';return}selectedReceiptFile=file;const other=id==='receiptFile'?'receiptUpload':'receiptFile';$(other).value='';$('receiptSelected').textContent='Selected: '+file.name; $('status').textContent='Photo ready. Tap Recognise text to scan.';});}
$('ocrBtn').onclick=async()=>{const file=selectedReceiptFile;if(!file){alert('Choose a receipt image first');return}const btn=$('ocrBtn');btn.disabled=true;let worker;try{
 $('status').textContent='Loading OCR engine (internet required)…';if(!window.Tesseract){await new Promise((res,rej)=>{let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=rej;document.head.append(s)})}
 worker=await Tesseract.createWorker('eng');await worker.setParameters({preserve_interword_spaces:'1'});
 $('status').textContent='Recognising receipt (first pass)…';const original=await worker.recognize(file);let best=original.data.text;
 try{$('status').textContent='Enhancing thermal receipt and recognising again…';const canvas=await receiptImageVariants(file);const enhanced=await worker.recognize(canvas);if(receiptOCRQuality(enhanced.data.text)>receiptOCRQuality(best))best=enhanced.data.text;}catch(err){console.warn('Enhanced OCR unavailable',err)}
 $('rawText').value=best;parseText();
 }catch(e){$('status').textContent='OCR unavailable. Use manual entry or paste receipt text. '+e.message}finally{if(worker)await worker.terminate().catch(()=>{});btn.disabled=false}};
$('saveReceipt').onclick=()=>{let merchant=$('receiptMerchant').value.trim(),date=$('receiptDate').value;if(!merchant||!date||!receipt.length){alert('Enter merchant, date and at least one item');return}if(receipt.some(i=>!i.category||!receiptCategories(i.kind).includes(i.category))){alert('Choose a valid category for every item in its financial group.');return}if(receipt.some(i=>!Number.isFinite(i.price)||i.price===0)){alert('Verify and enter every item price before saving.');return}if(receipt.some(i=>i.price<0&&!i.coupon)){alert('Mark negative prices as coupons / discounts before saving.');return}if(receipt.some(i=>i.coupon&&i.price>0)){alert('Coupons / discounts must have negative prices.');return}let {sum}=receiptSummary(),total=Number($('receiptTotal').value);if(!total||Math.abs(receiptRound(total-sum))>.011){alert(`Receipt total ${money(total)} does not match category total ${money(sum)}. Check VAT, coupons and missing items before saving.`);return}let group=uid();receipt.forEach(i=>{let gross=receiptAmounts(i).gross;db.transactions.push({id:uid(),group,type:i.kind==='income'?'income':'expense',financialGroup:i.kind,merchant:merchant+' · '+i.name,amount:gross,date,category:i.category,payer:$('receiptPayer').value,account:$('receiptAccount').value,receiptVatRate:Number(i.vat),receiptVatMode:$('receiptVatMode').value,receiptCoupon:!!i.coupon})});save();receipt=[];drawReceipt();$('receiptEditor').classList.add('hidden');$('status').textContent='Itemised receipt saved.'};
function download(filename,text,mime){let blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}$('exportBtn').onclick=()=>download('family-finance-backup.json',JSON.stringify(db,null,2),'application/json');$('csvBtn').onclick=()=>{let cols=['date','type','merchant','amount','currency','category','payer','account'];let rows=[cols.join(','),...db.transactions.map(t=>cols.map(k=>'"'+String(t[k]??'').replace(/"/g,'""')+'"').join(','))];download('family-finance-transactions.csv','\ufeff'+rows.join('\r\n'),'text/csv')};$('importFile').onchange=async e=>{try{let x=JSON.parse(await e.target.files[0].text());if(!Array.isArray(x.transactions)||!Array.isArray(x.accounts))throw Error('Invalid backup');if(confirm('Replace all local data with this backup?')){if(window.FFPersist?.commit){await FFPersist.wait();await FFPersist.commit(structuredClone(x))}db=x;try{localStorage.setItem(KEY,JSON.stringify(db))}catch(err){console.warn('Backup stored in IndexedDB; local cache unavailable',err)}location.reload()}}catch(err){alert('Could not import backup: '+err.message)}};if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});render();
