/* =============================================
   FEATURE 34: Prize Breakdown Popup on Match Card
   - Match card pe "Prize" tap karo — full breakdown
   - 1st/2nd/3rd + per kill clearly dikhao
   - Win probability bhi dikhao
   ============================================= */
(function() {
  'use strict';

  function showBreakdown(matchId) {
    var t = window.MT && window.MT[matchId];
    if (!t || !window.openModal) return;
    var pool = Number(t.prizePool) || 0;
    var slots = Number(t.maxSlots) || 1;
    var mode = (t.mode || 'solo').toLowerCase();
    var first = Number(t.firstPrize) || 0;
    var second = Number(t.secondPrize) || 0;
    var third = Number(t.thirdPrize) || 0;
    var winChance = mode === 'solo' ? Math.round(1/slots*100) :
                    mode === 'duo'  ? Math.round(2/slots*100) : Math.round(4/slots*100);

    var h = '<div>' +
      '<div style="text-align:center;padding:14px;background:linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,140,0,.05));border-radius:14px;margin-bottom:14px">' +
        '<div style="font-size:11px;color:var(--txt2)">Total Prize Pool</div>' +
        '<div style="font-size:32px;font-weight:900;color:#ffd700">₹' + pool + '</div>' +
        '<div style="font-size:11px;color:var(--txt2);margin-top:2px">' + slots + ' slots · ' + mode.toUpperCase() + '</div>' +
      '</div>';

    var rows = [];
    if (first)  rows.push(['🥇', '1st Place', '₹' + first, '#ffd700']);
    if (second) rows.push(['🥈', '2nd Place', '₹' + second, '#c0c0c0']);
    if (third)  rows.push(['🥉', '3rd Place', '₹' + third, '#cd7f32']);

    rows.forEach(function(r) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<span style="font-size:20px">' + r[0] + '</span>' +
        '<span style="flex:1;font-size:13px">' + r[1] + '</span>' +
        '<span style="font-size:15px;font-weight:800;color:' + r[3] + '">' + r[2] + '</span>' +
      '</div>';
    });

    h += '<div style="margin-top:12px;padding:10px;background:rgba(0,255,156,.06);border-radius:10px;text-align:center">' +
      '<div style="font-size:11px;color:var(--txt2)">Tumhari Win Chance</div>' +
      '<div style="font-size:20px;font-weight:900;color:var(--green)">' + winChance + '%</div>' +
    '</div></div>';

    window.openModal('💰 Prize Details', h);
  }

  window.f34PrizeBreakdown = { show: showBreakdown };
  window.showPrizeBreakdown = showBreakdown;
})();
