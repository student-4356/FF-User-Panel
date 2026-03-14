/* =============================================
   FEATURE 26: Entry Fee Cashback
   - Top 50% players ko 25% cashback in coins
   - Triggers when result is published
   - Firebase: users/{uid}/coins += cashback
   ============================================= */
(function() {
  'use strict';

  // This runs when results/ node gets new data for current user
  function checkCashback(resultData) {
    if (!window.db || !window.U || !window.UD) return;
    // resultData = { rank, totalPlayers, entryFee, matchId, cashbackGiven }
    if (resultData.cashbackGiven) return; // already processed
    var rank = Number(resultData.rank) || 0;
    var total = Number(resultData.totalPlayers) || 1;
    var fee = Number(resultData.entryFee) || 0;
    if (!rank || !fee) return;

    // Top 50%?
    var isTop50 = rank <= Math.ceil(total / 2);
    // Winner gets full prize - no cashback needed
    var hasWon = Number(resultData.winnings) > 0;
    if (!isTop50 || hasWon) return;

    var cashback = Math.floor(fee * 0.25); // 25% of entry fee
    if (cashback <= 0) return;

    var uid = window.U.uid;
    window.db.ref('users/' + uid + '/coins').transaction(function(c) {
      return (c || 0) + cashback;
    });
    window.db.ref('results/' + resultData.resultKey + '/cashbackGiven').set(true);
    window.db.ref('users/' + uid + '/notifications').push({
      title: '🪙 Cashback Mila!',
      message: 'Top 50% finish ke liye +' + cashback + ' coins cashback!',
      timestamp: Date.now(), read: false, type: 'cashback'
    });
    if (window.toast) {
      setTimeout(function() {
        window.toast('🪙 +' + cashback + ' coins cashback — Top 50% finish!', 'ok');
      }, 3000);
    }
  }

  // Listen for new results for current user
  var _try = 0;
  var _int = setInterval(function() {
    _try++;
    if (window.db && window.U) {
      clearInterval(_int);
      window.db.ref('results').orderByChild('userId').equalTo(window.U.uid).on('child_added', function(s) {
        var d = s.val();
        if (d) {
          d.resultKey = s.key;
          checkCashback(d);
        }
      });
    }
    if (_try > 60) clearInterval(_int);
  }, 1000);

  window.f26Cashback = { check: checkCashback };
})();
