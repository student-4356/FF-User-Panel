/* =============================================
   FEATURE 24: Result Screenshot — Admin upload, User dekhe
   Firebase: matches/{mid}/resultScreenshot = base64
   ============================================= */
(function() {
  'use strict';

  function checkResultScreenshots() {
    if (!window.db || !window.JR) return;
    // For each joined+completed match, check if resultScreenshot exists
    for (var k in window.JR) {
      var jr = window.JR[k];
      if (jr.resultStatus !== 'completed') continue;
      var mid = jr.matchId || jr.tournamentId;
      if (!mid) continue;
      (function(matchId, matchName) {
        window.db.ref('matches/' + matchId + '/resultScreenshot').once('value', function(s) {
          if (s.val()) {
            window._resultScreenshots = window._resultScreenshots || {};
            window._resultScreenshots[matchId] = s.val();
          }
        });
      })(mid, jr.matchName || 'Match');
    }
  }

  function showResultScreenshot(matchId, matchName) {
    var sc = window._resultScreenshots && window._resultScreenshots[matchId];
    if (!sc) {
      if (window.toast) window.toast('Result screenshot abhi available nahi hai', 'err');
      return;
    }
    if (!window.openModal) return;
    var h = '<div style="text-align:center">' +
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:10px">Admin-uploaded match result</div>' +
      '<img src="' + sc + '" style="width:100%;border-radius:10px;border:1px solid var(--border)">' +
      '<button onclick="if(window.closeModal)closeModal()" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:700;border:none;cursor:pointer">Close</button>' +
    '</div>';
    window.openModal('📸 ' + (matchName || 'Match') + ' Result', h);
  }

  // Hook into renderHistory / results display
  var _try = 0;
  var _int = setInterval(function() {
    _try++;
    if (window.db && window.JR) {
      clearInterval(_int);
      checkResultScreenshots();
    }
    if (_try > 60) clearInterval(_int);
  }, 1000);

  window.f24ResultSS = { check: checkResultScreenshots, show: showResultScreenshot };
  window.showResultScreenshot = showResultScreenshot;
})();
