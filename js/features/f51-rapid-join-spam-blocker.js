/* ====== ANTI-SPAM FEATURE f51: RAPID JOIN SPAM BLOCKER ======
   - Ek user ek second mein multiple matches join karne ki koshish kare to block
   - Join attempts rate limit: max 3 in 60 seconds
   - Bot-like behavior detect karta hai
   - Cooldown timer show karta hai
*/
(function(){
'use strict';

var JOIN_WINDOW_MS = 60000; // 1 minute window
var MAX_JOINS_PER_WINDOW = 3;
var joinTimestamps = [];

window.checkJoinRateLimit = function() {
  var now = Date.now();
  // Clean old entries
  joinTimestamps = joinTimestamps.filter(function(t) { return now - t < JOIN_WINDOW_MS; });

  if (joinTimestamps.length >= MAX_JOINS_PER_WINDOW) {
    var oldestInWindow = joinTimestamps[0];
    var waitMs = JOIN_WINDOW_MS - (now - oldestInWindow);
    var waitSec = Math.ceil(waitMs / 1000);

    // Log suspicious rapid join attempt
    if (window.db && window.U) {
      window.db.ref('adminAlerts').push({
        type: 'rapid_join_spam',
        uid: window.U.uid,
        attemptCount: joinTimestamps.length,
        windowMs: JOIN_WINDOW_MS,
        timestamp: Date.now(),
        severity: 'MEDIUM',
        message: window.U.uid + ' ne ' + joinTimestamps.length + ' matches join karne ki koshish ki 60 seconds mein (spam detected)'
      });
    }

    if (window.toast) toast('⏳ Join spam detected! ' + waitSec + 's baad try karo.', 'err');
    return false;
  }

  joinTimestamps.push(now);
  return true;
};

/* ── Hook into doJoin ── */
var _hookI = setInterval(function() {
  if (window.doJoin && !window._rjsHooked) {
    clearInterval(_hookI);
    window._rjsHooked = true;
    var orig = window.doJoin;
    window.doJoin = function(id) {
      if (!window.checkJoinRateLimit()) return;
      orig(id);
    };
  }
}, 700);

/* ── Visual rate limit indicator ── */
window.getJoinCooldownStatus = function() {
  var now = Date.now();
  var recent = joinTimestamps.filter(function(t) { return now - t < JOIN_WINDOW_MS; });
  var remaining = MAX_JOINS_PER_WINDOW - recent.length;
  return {
    remaining: remaining,
    total: MAX_JOINS_PER_WINDOW,
    isLimited: remaining <= 0
  };
};

console.log('[Anti-Spam] ✅ f51: Rapid Join Spam Blocker loaded');
})();
