/* FEATURE 33: Prize Breakdown Popup on Match Card
   Tap prize → beautiful modal with 1st/2nd/3rd + per kill + win% */
(function(){
'use strict';
function show(id){
  var t=window.MT&&window.MT[id]; if(!t||!window.openModal) return;
  var mode=(t.mode||'solo').toLowerCase();
  var slots=Number(t.maxSlots)||1;
  var wc=mode==='solo'?Math.round(1/slots*100):mode==='duo'?Math.round(2/slots*100):Math.round(4/slots*100);
  var rows=[
    t.firstPrize  ?['🥇','1st Place','₹'+t.firstPrize,'#ffd700']:null,
    t.secondPrize ?['🥈','2nd Place','₹'+t.secondPrize,'#c0c0c0']:null,
    t.thirdPrize  ?['🥉','3rd Place','₹'+t.thirdPrize,'#cd7f32']:null,
    
  ].filter(Boolean);
  var h='<div><div style="text-align:center;padding:14px;background:linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,140,0,.05));border-radius:14px;margin-bottom:14px">'
    +'<div style="font-size:11px;color:var(--txt2)">Total Prize Pool</div>'
    +'<div style="font-size:32px;font-weight:900;color:#ffd700">₹'+(t.prizePool||0)+'</div>'
    +'<div style="font-size:11px;color:var(--txt2)">'+(slots)+' slots · '+mode.toUpperCase()+'</div></div>';
  rows.forEach(function(r){
    h+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-size:20px">'+r[0]+'</span><span style="flex:1;font-size:13px">'+r[1]+'</span>'
      +'<span style="font-size:15px;font-weight:800;color:'+r[3]+'">'+r[2]+'</span></div>';
  });
  h+='<div style="margin-top:12px;padding:10px;background:rgba(0,255,156,.06);border-radius:10px;text-align:center">'
    +'<div style="font-size:11px;color:var(--txt2)">Tumhari Win Chance</div>'
    +'<div style="font-size:20px;font-weight:900;color:var(--primary,#00ff9c)">'+wc+'%</div></div></div>';
  window.openModal('💰 Prize Details',h);
}
window.f33Prize={show:show}; window.showPrizeBreakdown=show;
})();
