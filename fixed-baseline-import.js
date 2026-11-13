/* v1.2.37: private fixed baseline import. Never bundle private data in public website. */
(()=>{'use strict';const $=id=>document.getElementById(id);let pending=null;
const normalize=s=>String(s||'').trim().toLocaleLowerCase('en-GB').replace(/\s+/g,' ');
const cents=n=>Math.round(Number(n)*100);
function validate(data){if(data?.format!=='family-finance-fixed-baseline-v1'||data.asOf!=='2026-10-31'||!Array.isArray(data.accounts)||!Array.isArray(data.giftCards))throw Error('Unsupported baseline format');
const seen=new Set();for(const a of data.accounts){if(!a.account||!a.currency||!Number.isFinite(a.amount)||a.date!=='2026-10-31')throw Error('Invalid bank balance');if(seen.has(normalize(a.account)))throw Error('Duplicate bank account');seen.add(normalize(a.account))}
const merchants=new Set();for(const g of data.giftCards){if(!g.merchant||!Number.isFinite(g.amount)||g.amount<0)throw Error('Invalid gift card');if(merchants.has(normalize(g.merchant)))throw Error('Duplicate gift card');merchants.add(normalize(g.merchant))}
return data}
function preview(){const a=pending.accounts, cards=pending.giftCards;const existing=Object.keys(db.accountSnapshots||{}).length;const existingWallet=Object.keys(db.giftCardWallet?.merchants||{}).length;
$('fixedBaselinePreview').textContent=`${a.length} account baselines, ${cards.length} gift-card merchants, dated ${pending.asOf}. Existing: ${existing} bank snapshots, ${existingWallet} gift-card merchants. Only MISSING baselines are added; existing balances and transactions are NEVER overwritten. Comparison historical data is unchanged.`;$('fixedBaselineApply').disabled=false}
$('fixedBaselineFile').onchange=async e=>{pending=null;$('fixedBaselineApply').disabled=true;try{const file=e.target.files?.[0];if(!file)return;if(file.size>1e6)throw Error('File too large');pending=validate(JSON.parse(await file.text()));preview()}catch(err){$('fixedBaselinePreview').textContent='Cannot read private baseline: '+err.message}};
$('fixedBaselineApply').onclick=async()=>{if(!pending)return;const button=$('fixedBaselineApply');button.disabled=true;try{if(window.FFPersist?.wait)await FFPersist.wait();if(!window.FFPersist?.ready)throw Error('Storage not ready');
const groups=window.FFAccounts?.groups?.()||[];const resolved=pending.accounts.map(a=>{const group=groups.find(g=>normalize(g.label)===normalize(a.account)||(g.aliases||[]).some(x=>normalize(x)===normalize(a.account)));return {...a,key:group?.snapshotKey||a.account,group}});
const missing=resolved.filter(a=>!db.accountSnapshots?.[a.key]);const giftMissing=pending.giftCards.filter(g=>!Object.keys(db.giftCardWallet?.merchants||{}).some(k=>normalize(k)===normalize(g.merchant)));
if(!confirm(`Add ${missing.length} missing bank baselines and ${giftMissing.length} missing gift-card merchant baselines? Existing snapshots and cards remain unchanged. No Comparison or November transactions are imported. Back up your JSON first.`))return;
db.accountSnapshots||={};db.accountCurrencies||={};db.accounts||=[];db.giftCardWallet||={merchants:{}};db.giftCardWallet.merchants||={};
for(const a of missing){db.accountSnapshots[a.key]={amount:a.amount,date:a.date,mode:'closing'};db.accountCurrencies[a.key]=a.currency;if(!a.group&&!db.accounts.some(x=>normalize(x)===normalize(a.account)))db.accounts.push(a.account)}
for(const g of giftMissing)db.giftCardWallet.merchants[g.merchant]={opening:g.amount,adjustments:0};
// Gift-card aggregate is a reference only; NEVER create another asset account from its total.
// Preserve cash count if the user has already entered a count.
if(!Object.keys(db.cashDenominations||{}).length&&pending.cashDenominations)db.cashDenominations=structuredClone(pending.cashDenominations);
// Prevent repeated re-import from modifying the historical fixed baseline.
db.fixedBaselineImport={source:pending.source,date:pending.asOf,appliedAt:new Date().toISOString(),accountsAdded:missing.length,giftCardsAdded:giftMissing.length};
save();if(window.FFPersist?.wait)await FFPersist.wait();$('fixedBaselinePreview').textContent=`Saved: ${missing.length} new account baselines, ${giftMissing.length} new gift-card merchants. Existing records untouched. Refresh to see updated balances.`;pending=null;
}catch(err){$('fixedBaselinePreview').textContent='Import failed: '+err.message;button.disabled=false}};
})();