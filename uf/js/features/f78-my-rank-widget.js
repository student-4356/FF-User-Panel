/* =============================================
   FEATURE 33: My Leaderboard Rank Widget
   - Home pe user ka apna rank dikhta hai
   - Sunday Special eligible hai ya nahi
   - Top 96/200/400 badge
   ============================================= */
(function() {
  'use strict';

  var _rank = null;
  var _total = null;

  function fetchRank() {
    if (!window.db || !window.U) return;
    var uid = window.U.uid;
    window.db.ref('users').orderByChild('stats/earnings').once('value', function(s) {
      var users = [];
      if (s.exists()) s.forEach(function(c) {
        users.push({ uid: c.key, earnings: (c.val().stats || {}).earnings || 0 });
      });
      users.sort(function(a, b) { return b.earnings - a.earnings; });
      _total = users.length;
      var idx = users.findIndex(function(u) { return u.uid === uid; });
      _rank = idx >= 0 ? idx + 1 : _total + 1;
      renderWidget();
    });
  }

  function getEligibilityBadge() {
    if (!_rank) return '';
    if (_rank <= 96)  return '<span style="background:rgba(255,60,60,.15);color:#ff4500;border-radius:20px;padding:2px 10px;font-size:10px;font-weight:800">🔴 Sunday Special Eligible</span>';
    if (_rank <= 200) return '<span style="background:rgba(255,170,0,.12);color:#ffaa00;border-radius:20px;padding:2px 10px;font-size:10px;font-weight:700">🟡 Top 200</span>';
    if (_rank <= 400) return '<span style="background:rgba(0,212,255,.1);color:var(--blue);border-radius:20px;padding:2px 10px;font-size:10px;font-weight:700">🔵 Top 400</span>';
    return '<span style="background:rgba(255,255,255,.06);color:var(--txt2);border-radius:20px;padding:2px 10px;font-size:10px">Play more to qualify!</span>';
  }

  function renderWidget() {
    var el = document.getElementById('f33RankWidget');
    if (!el || !_rank) return;
    el.style.display = 'flex';
    el.innerHTML =
      '<div style="flex:1">' +
        '<div style="font-size:11px;color:var(--txt2)">Tumhara Rank</div>' +
        '<div style="font-size:22px;font-weight:900;color:var(--primary)">#' + _rank + ' <span style="font-size:12px;color:var(--txt2);font-weight:400">of ' + _total + '</span></div>' +
      '</div>' +
      '<div>' + getEligibilityBadge() + '</div>';
  }

  // Inject widget into home
  function injectWidget() {
    var home = document.getElementById('homeList');
    if (!home || document.getElementById('f33RankWidget')) return;
    var div = document.createElement('div');
    div.id = 'f33RankWidget';
    div.style.cssText = 'display:none;align-items:center;gap:10px;background:rgba(0,255,156,.05);border:1px solid rgba(0,255,156,.12);border-radius:14px;padding:10px 14px;margin-bottom:10px';
    home.insertBefore(div, home.firstChild);
    fetchRank();
  }

  var _try = 0, _int = setInterval(function() {
    _try++;
    if (window.db && window.U && window.UD) {
      clearInterval(_int);
      setTimeout(injectWidget, 1500);
      // Refresh rank every 5 min
      setInterval(fetchRank, 5 * 60 * 1000);
    }
    if (_try > 60) clearInterval(_int);
  }, 1000);

  // Hook renderHome
  var _h = setInterval(function() {
    if (window.renderHome && !window._f33Hooked) {
      clearInterval(_h);
      window._f33Hooked = true;
      var orig = window.renderHome;
      window.renderHome = function() {
        orig.apply(this, arguments);
        setTimeout(injectWidget, 100);
      };
    }
  }, 500);

  window.f33RankWidget = { fetch: fetchRank, render: renderWidget };
})();
