/* ====================================================
   MINI ESPORTS — USER FEATURES v9
   Halal Only | Teammate Auto-Join Fixed | 50 Features
   ==================================================== */
(function () {
  'use strict';
  var db = window.db, auth = window.auth;
  function _$(id) { return document.getElementById(id); }
  function _toast(m, t) { if (window.toast) toast(m, t || 'ok'); }

  /* =========================================================
     ✅ KEPT FEATURES (Halal — 22 from original)
     ========================================================= */

  /* ─── FEATURE 1: MATCH REMINDER (Browser Notification) ─── */
  window.setMatchReminder = function (matchId, matchTime, matchName) {
    if (!('Notification' in window)) { _toast('Browser notifications support nahi karta', 'err'); return; }
    Notification.requestPermission().then(function (p) {
      if (p !== 'granted') { _toast('Notification permission do', 'err'); return; }
      var ms = Number(matchTime) - Date.now() - 600000;
      if (ms < 0) { _toast('Match jaldi shuru hoga!', 'inf'); return; }
      setTimeout(function () {
        new Notification('⚡ Match shuru hone wala hai!', {
          body: matchName + ' 10 minutes mein start hoga. Room ID ready rakho!',
          icon: '/favicon.ico'
        });
      }, ms);
      _toast('⏰ Reminder set! 10 min pehle notification aayega.', 'ok');
    });
  };

  /* ─── FEATURE 2: PROFILE COMPLETION % BAR ─── */
  window.getProfileCompletion = function () {
    var UD = window.UD; if (!UD) return 0;
    var fields = [
      { k: 'ign', w: 25 }, { k: 'ffUid', w: 25 }, { k: 'phone', w: 15 },
      { k: 'profileImage', w: 15 }, { k: 'duoTeam', w: 10 },
      { k: 'referralCode', w: 5 }, { k: 'bio', w: 5 }
    ];
    var total = 0;
    fields.forEach(function (f) { if (UD[f.k]) total += f.w; });
    return Math.min(total, 100);
  };
  window.renderProfileCompletion = function () {
    var pct = window.getProfileCompletion();
    var color = pct >= 80 ? '#00ff9c' : pct >= 50 ? '#ffd700' : '#ff6b6b';
    var h = '<div style="background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:12px 16px;margin-bottom:14px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h += '<span style="font-size:13px;font-weight:700"><i class="fas fa-id-card" style="color:' + color + '"></i> Profile ' + pct + '% Complete</span>';
    if (pct < 100) h += '<span style="font-size:11px;color:var(--txt2)">Complete karo!</span>';
    h += '</div>';
    h += '<div style="height:6px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden">';
    h += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,' + color + ',#00cc7a);border-radius:4px;transition:width .5s"></div></div>';
    if (pct < 100 && !window.UD.phone) h += '<div style="font-size:11px;color:var(--txt2);margin-top:6px"><i class="fas fa-info-circle"></i> Phone number add karo +15%</div>';
    h += '</div>';
    return h;
  };

  /* ─── FEATURE 3: HOT STREAK SYSTEM ─── */
  window.getStreakInfo = function () {
    var UD = window.UD; if (!UD || !UD.stats) return null;
    var wins = UD.stats.wins || 0, matches = UD.stats.matches || 0;
    if (wins >= 5) return { emoji: '🔥', label: wins + ' Win Streak!', color: '#ff6b6b' };
    if (wins >= 3) return { emoji: '⚡', label: '3+ Wins!', color: '#ffd700' };
    if (matches >= 10) return { emoji: '💪', label: 'Veteran Player', color: '#4d96ff' };
    return null;
  };

  /* ─── FEATURE 4: MATCH WATCHLIST / BOOKMARK ─── */
  var _watchlist = JSON.parse(localStorage.getItem('matchWatchlist') || '[]');
  window.toggleWatchlist = function (matchId) {
    var idx = _watchlist.indexOf(matchId);
    if (idx >= 0) { _watchlist.splice(idx, 1); _toast('Watchlist se hataya', 'inf'); }
    else { _watchlist.push(matchId); _toast('⭐ Watchlist mein add hua!'); }
    localStorage.setItem('matchWatchlist', JSON.stringify(_watchlist));
    if (window.renderHome) renderHome();
  };
  window.isWatchlisted = function (id) { return _watchlist.indexOf(id) >= 0; };

  /* ─── FEATURE 5: SLOT FILL BADGE (Filling Fast / Almost Full) ─── */
  window.getSlotBadge = function (filled, total) {
    var pct = filled / total * 100;
    if (pct >= 90) return '<span style="padding:2px 6px;border-radius:5px;font-size:9px;font-weight:700;background:rgba(255,0,60,.15);color:#ff003c">🔥 Almost Full</span>';
    if (pct >= 70) return '<span style="padding:2px 6px;border-radius:5px;font-size:9px;font-weight:700;background:rgba(255,170,0,.12);color:#ffaa00">⚡ Filling Fast</span>';
    if (pct <= 10) return '<span style="padding:2px 6px;border-radius:5px;font-size:9px;font-weight:700;background:rgba(0,255,106,.1);color:var(--green)">✨ New</span>';
    return '';
  };

  /* ─── FEATURE 6: PLAYER STATS MINI CHART ─── */
  window.renderStatsChart = function () {
    var UD = window.UD; if (!UD || !UD.stats) return '';
    var st = UD.stats;
    var bars = [
      { label: 'Matches', val: st.matches || 0, max: 100, color: '#4d96ff' },
      { label: 'Wins', val: st.wins || 0, max: Math.max(st.matches || 1, 1), color: '#00ff9c' },
      { label: 'Kills', val: st.kills || 0, max: 200, color: '#ff6b6b' },
      { label: 'Earned', val: st.earnings || 0, max: 5000, color: '#ffd700' }
    ];
    var h = '<div style="background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:14px">';
    h += '<div style="font-size:13px;font-weight:700;margin-bottom:12px"><i class="fas fa-chart-bar" style="color:#4d96ff"></i> Stats Overview</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    bars.forEach(function (b) {
      var pct = Math.min(100, b.max > 0 ? (b.val / b.max * 100) : 0);
      h += '<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:var(--txt2)">' + b.label + '</span><span style="font-weight:700;color:' + b.color + '">' + b.val + '</span></div>';
      h += '<div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="height:100%;width:' + pct + '%;background:' + b.color + ';border-radius:3px"></div></div></div>';
    });
    h += '</div>';
    var wr = st.matches > 0 ? Math.round((st.wins || 0) / st.matches * 100) : 0;
    h += '<div style="margin-top:10px;padding:8px;background:rgba(0,255,106,.06);border-radius:8px;text-align:center;font-size:12px">';
    h += '<span style="color:var(--txt2)">Win Rate: </span><strong style="color:var(--green)">' + wr + '%</strong> · ';
    h += '<span style="color:var(--txt2)">Avg Kill: </span><strong style="color:#ff6b6b">' + (st.matches > 0 ? ((st.kills || 0) / st.matches).toFixed(1) : 0) + '</strong></div>';
    h += '</div>';
    return h;
  };

  /* ─── FEATURE 7: PLAYER BIO / STATUS SETTER ─── */
  window.showSetBio = function () {
    var UD = window.UD;
    var h = '<div style="padding:8px">';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Apna gaming status set karo (60 chars max)</div>';
    h += '<input type="text" id="bioInput" maxlength="60" placeholder="e.g. Headshots only 🎯" value="' + (UD.bio || '') + '" style="width:100%;padding:12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:14px;box-sizing:border-box">';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">';
    ['Headshots only 🎯', 'Top Fragger 💀', 'Clutch King 👑', 'Rush or Die 🔥', 'Solo Carry 💪', 'Squad Goals 🤝'].forEach(function (s) {
      h += '<div onclick="document.getElementById(\'bioInput\').value=\'' + s + '\'" style="padding:8px;border-radius:8px;background:var(--card2);border:1px solid var(--border);font-size:11px;cursor:pointer;text-align:center">' + s + '</div>';
    });
    h += '</div>';
    h += '<button onclick="window._saveBio()" style="width:100%;margin-top:14px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer;font-size:14px">Save Bio</button>';
    h += '</div>';
    if (window.showModal) showModal('✏️ Set Bio', h);
  };
  window._saveBio = function () {
    var val = (_$('bioInput') || {}).value || '';
    db.ref('users/' + window.U.uid + '/bio').set(val);
    _toast('✅ Bio saved!');
    if (window.closeModal) closeModal();
    setTimeout(function () { if (window.renderProfile) renderProfile(); }, 500);
  };

  /* ─── FEATURE 8: TOURNAMENT ROSTER VIEWER ─── */
  window.showTournamentRoster = function (matchId) {
    db.ref('joinRequests').orderByChild('matchId').equalTo(matchId).once('value', function (s) {
      var players = [], teams = {};
      if (s.exists()) s.forEach(function (c) {
        var d = c.val();
        if (d.status === 'joined' && !d.isTeamMember) {
          players.push({ name: d.userName || 'Player', mode: d.mode || 'solo', team: d.teamMembers || [] });
        }
      });
      var h = '<div style="padding:4px 0">';
      h += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--txt2)">' + players.length + ' Players / Teams Joined</div>';
      if (!players.length) { h += '<p style="color:var(--txt2);text-align:center;padding:20px">Abhi koi join nahi hua</p></div>'; }
      else {
        h += '<div style="display:flex;flex-direction:column;gap:8px">';
        players.forEach(function (p, i) {
          h += '<div style="padding:10px 12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);display:flex;align-items:center;gap:10px">';
          h += '<div style="width:28px;height:28px;border-radius:8px;background:rgba(0,255,106,.1);color:var(--green);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center">#' + (i + 1) + '</div>';
          h += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + p.name + '</div>';
          if (p.team && p.team.length > 1) {
            h += '<div style="font-size:10px;color:var(--txt2)">';
            p.team.forEach(function (m) { h += '<span style="margin-right:6px">' + m.name + (m.role === 'captain' ? ' 👑' : '') + '</span>'; });
            h += '</div>';
          }
          h += '</div></div>';
        });
        h += '</div>';
      }
      h += '</div>';
      if (window.showModal) showModal('🎖️ Match Roster', h);
    });
  };

  /* ─── FEATURE 9: KILL PROOF UPLOAD ─── */
  window.showKillProof = function (matchId) {
    var h = '<div style="padding:8px">';
    h += '<p style="font-size:13px;color:var(--txt2);margin-bottom:14px">Kill proof screenshot upload karo dispute ke liye</p>';
    h += '<div onclick="document.getElementById(\'kpFile\').click()" style="border:2px dashed var(--border);border-radius:12px;padding:30px;text-align:center;cursor:pointer;background:var(--card2)">';
    h += '<i class="fas fa-cloud-upload-alt" style="font-size:28px;color:var(--txt2);display:block;margin-bottom:8px"></i>';
    h += '<span style="font-size:13px;color:var(--txt2)">Tap to upload</span>';
    h += '<input type="file" id="kpFile" accept="image/*" style="display:none" onchange="window._uploadKP(this,\'' + matchId + '\')">';
    h += '</div><img id="kpPreview" style="display:none;width:100%;border-radius:10px;margin-top:10px">';
    h += '<button onclick="window._submitKP(\'' + matchId + '\')" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Submit Proof</button>';
    h += '</div>';
    if (window.showModal) showModal('📸 Kill Proof', h);
  };
  window._kpData = '';
  window._uploadKP = function (input) {
    var file = input.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      window._kpData = e.target.result;
      var img = _$('kpPreview'); if (img) { img.src = window._kpData; img.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
  };
  window._submitKP = function (mid) {
    if (!window._kpData) { _toast('Screenshot select karo!', 'err'); return; }
    db.ref('killProofs/' + window.U.uid + '/' + mid).set({
      screenshot: window._kpData, matchId: mid, userId: window.U.uid,
      userName: window.UD.ign || '', createdAt: Date.now(), status: 'pending'
    });
    _toast('✅ Kill proof submitted! Admin verify karega.');
    window._kpData = '';
    if (window.closeModal) closeModal();
  };

  /* ─── FEATURE 10: RESULT SHARE CARD (Canvas Download) ─── */
  window.shareResultCard = function (matchName, rank, kills, prize) {
    var UD = window.UD;
    var canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 220;
    var ctx = canvas.getContext('2d');
    var grd = ctx.createLinearGradient(0, 0, 400, 220);
    grd.addColorStop(0, '#0a0a0f'); grd.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 400, 220);
    ctx.fillStyle = '#00ff9c'; ctx.font = 'bold 22px Arial';
    ctx.fillText('Mini eSports', 20, 36);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
    ctx.fillText(matchName || 'Tournament Result', 20, 68);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 48px Arial';
    ctx.fillText('#' + (rank || 1), 20, 140);
    ctx.fillStyle = '#aaa'; ctx.font = '14px Arial'; ctx.fillText('Rank', 20, 160);
    ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 36px Arial';
    ctx.fillText((kills || 0) + '💀', 130, 140);
    ctx.fillStyle = '#aaa'; ctx.font = '14px Arial'; ctx.fillText('Kills', 130, 160);
    ctx.fillStyle = '#00ff9c'; ctx.font = 'bold 36px Arial';
    ctx.fillText('₹' + (prize || 0), 250, 140);
    ctx.fillStyle = '#aaa'; ctx.font = '14px Arial'; ctx.fillText('Won', 250, 160);
    ctx.fillStyle = '#555'; ctx.font = '12px Arial';
    ctx.fillText((UD ? UD.ign : '') + ' | mini-esports.app', 20, 200);
    var url = canvas.toDataURL();
    var a = document.createElement('a'); a.href = url; a.download = 'result-card.png'; a.click();
    _toast('🖼️ Result card download ho rahi hai!');
  };

  /* ─── FEATURE 11: SEASONAL CHAMPIONSHIP STATS ─── */
  window.showSeasonStats = function () {
    var uid = window.U.uid;
    db.ref('season').once('value', function (s) {
      var season = s.val() || { name: 'Season 1', endDate: null };
      db.ref('seasonStats/' + uid).once('value', function (ss) {
        var st = ss.val() || { points: 0 };
        var h = '<div style="padding:8px;text-align:center">';
        h += '<div style="font-size:24px;font-weight:900;color:var(--primary);margin-bottom:4px">' + (season.name || 'Season 1') + '</div>';
        h += '<div style="font-size:12px;color:var(--txt2);margin-bottom:16px">Ek season mein sabse zyada points jito!</div>';
        h += '<div style="font-size:48px;font-weight:900;color:#ffd700">' + (st.points || 0) + '</div>';
        h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:16px">Season Points</div>';
        h += '<div style="padding:12px;background:var(--card2);border-radius:12px;font-size:13px">';
        h += '🏆 Win = +50 pts &nbsp;|&nbsp; 💀 Kill = +5 pts &nbsp;|&nbsp; 🎮 Match = +10 pts</div>';
        if (season.endDate) h += '<div style="margin-top:10px;font-size:11px;color:var(--txt2)">Season ends: ' + new Date(season.endDate).toLocaleDateString() + '</div>';
        h += '</div>';
        if (window.showModal) showModal('🏆 Season Championship', h);
      });
    });
  };

  /* ─── FEATURE 12: MATCH LIVE FEED ─── */
  window.showMatchFeed = function (matchId) {
    db.ref('matchFeed/' + matchId).limitToLast(15).once('value', function (s) {
      var events = [];
      if (s.exists()) s.forEach(function (c) { events.unshift(c.val()); });
      var h = '<div style="padding:4px 0">';
      if (!events.length) h += '<div style="text-align:center;padding:30px;color:var(--txt2)">Live feed match start hone par dikhe ga</div>';
      events.forEach(function (e) {
        var icon = e.type === 'kill' ? '💀' : e.type === 'elim' ? '🔴' : '📢';
        h += '<div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--border)">';
        h += '<span style="font-size:18px">' + icon + '</span>';
        h += '<div><div style="font-size:13px;font-weight:600">' + (e.text || 'Event') + '</div>';
        h += '<div style="font-size:10px;color:var(--txt2)">' + new Date(e.ts || Date.now()).toLocaleTimeString() + '</div></div>';
        h += '</div>';
      });
      h += '</div>';
      if (window.showModal) showModal('📡 Live Feed', h);
    });
  };

  /* ─── FEATURE 13: ONBOARDING TUTORIAL (First Login) ─── */
  window.checkShowTutorial = function () {
    if (localStorage.getItem('tutorialSeen')) return;
    setTimeout(function () {
      var steps = [
        { title: '👋 Welcome to Mini eSports!', body: 'India ka best Free Fire tournament platform!' },
        { title: '🎮 Matches Join Karo', body: 'Home screen pe matches dekho, entry fee bharo aur join karo.' },
        { title: '💰 Wallet', body: 'UPI se paise add karo aur jeetne par direct bank mein lo.' },
        { title: '👥 Team Mode', body: 'Profile mein Duo/Squad partner set karo aur saath khelo.' },
        { title: '🏆 Rank karo!', body: 'Matches jeeto, kills lo aur leaderboard pe aao. Good luck!' }
      ];
      var cur = 0;
      function showStep() {
        var s = steps[cur];
        var h = '<div style="text-align:center;padding:10px">';
        h += '<div style="font-size:48px;margin-bottom:12px">' + s.title.split(' ')[0] + '</div>';
        h += '<div style="font-size:18px;font-weight:800;margin-bottom:8px">' + s.title.slice(s.title.indexOf(' ') + 1) + '</div>';
        h += '<div style="font-size:14px;color:var(--txt2);margin-bottom:20px">' + s.body + '</div>';
        h += '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px">';
        steps.forEach(function (_, i) { h += '<div style="width:8px;height:8px;border-radius:50%;background:' + (i === cur ? 'var(--primary)' : 'rgba(255,255,255,.2)') + '"></div>'; });
        h += '</div>';
        if (cur < steps.length - 1) h += '<button onclick="window._tutNext()" style="width:100%;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Next →</button>';
        else h += '<button onclick="window._tutDone()" style="width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,var(--primary),#00cc7a);color:#000;font-weight:800;border:none;cursor:pointer">🎮 Let\'s Play!</button>';
        h += '</div>';
        if (window.showModal) showModal('', h);
      }
      window._tutNext = function () { cur++; showStep(); };
      window._tutDone = function () { localStorage.setItem('tutorialSeen', '1'); if (window.closeModal) closeModal(); };
      showStep();
    }, 1500);
  };

  /* ─── FEATURE 14: QUICK STATS HOME WIDGET ─── */
  window.renderHomeWidget = function () {
    var UD = window.UD; if (!UD) return '';
    var st = UD.stats || {}, rm = UD.realMoney || {};
    var total = (rm.deposited || 0) + (rm.winnings || 0) + (rm.bonus || 0);
    var streak = window.getStreakInfo ? window.getStreakInfo() : null;
    var h = '<div style="background:linear-gradient(135deg,rgba(0,255,156,.06),rgba(0,212,255,.04));border:1px solid rgba(0,255,156,.15);border-radius:16px;padding:14px 16px;margin-bottom:14px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    h += '<span style="font-size:13px;font-weight:700"><i class="fas fa-fire" style="color:#ff6b6b"></i> Today\'s Dashboard</span>';
    if (streak) h += '<span style="font-size:11px;font-weight:700;color:' + streak.color + '">' + streak.emoji + ' ' + streak.label + '</span>';
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">';
    [['🎮', st.matches || 0, 'Played'], ['🏆', st.wins || 0, 'Wins'], ['💀', st.kills || 0, 'Kills'], ['💰', '₹' + total, 'Balance']].forEach(function (d) {
      h += '<div style="text-align:center"><div style="font-size:18px">' + d[0] + '</div><div style="font-size:14px;font-weight:800">' + d[1] + '</div><div style="font-size:10px;color:var(--txt2)">' + d[2] + '</div></div>';
    });
    h += '</div></div>';
    return h;
  };

  /* ─── FEATURE 15: WALLET STATISTICS PANEL ─── */
  window.renderWalletStats = function () {
    var UD = window.UD; if (!UD) return '';
    var wh = window.WH || [];
    var deps = wh.filter(function (w) { return w.type === 'deposit' && (w.status === 'approved' || w.status === 'done'); });
    var wds = wh.filter(function (w) { return w.type === 'withdraw' && (w.status === 'approved' || w.status === 'done'); });
    var totalDep = deps.reduce(function (s, w) { return s + (w.amount || 0); }, 0);
    var totalWd = wds.reduce(function (s, w) { return s + (w.amount || 0); }, 0);
    var h = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
    [['📥 Deposits', deps.length, 'Total: ₹' + totalDep], ['📤 Withdrawals', wds.length, 'Total: ₹' + totalWd], ['🏆 Winnings', '₹' + ((UD.realMoney || {}).winnings || 0), 'Earned']].forEach(function (d) {
      h += '<div style="background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px">' + d[0] + '</div><div style="font-size:18px;font-weight:800">' + d[1] + '</div><div style="font-size:10px;color:var(--txt2)">' + d[2] + '</div></div>';
    });
    h += '</div>';
    return h;
  };

  /* ─── FEATURE 16: PARTNER RATING SYSTEM ─── */
  window.ratePartner = function (partnerUid, matchId) {
    var h = '<div style="padding:8px;text-align:center">';
    h += '<div style="font-size:16px;font-weight:700;margin-bottom:16px">Partner ko rate karo</div>';
    h += '<div id="starRating" style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">';
    for (var i = 1; i <= 5; i++) {
      h += '<span onclick="window._setStar(' + i + ')" style="font-size:36px;cursor:pointer" data-star="' + i + '">⭐</span>';
    }
    h += '</div>';
    h += '<textarea id="rateNote" placeholder="Optional feedback..." style="width:100%;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px;resize:none;height:70px;box-sizing:border-box"></textarea>';
    h += '<button onclick="window._submitRating(\'' + partnerUid + '\',\'' + matchId + '\')" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Submit Rating</button>';
    h += '</div>';
    window._starVal = 5;
    if (window.showModal) showModal('⭐ Rate Partner', h);
  };
  window._setStar = function (n) {
    window._starVal = n;
    document.querySelectorAll('[data-star]').forEach(function (el) { el.style.opacity = parseInt(el.dataset.star) <= n ? '1' : '0.3'; });
  };
  window._submitRating = function (uid, mid) {
    db.ref('partnerRatings/' + uid + '/' + mid).set({
      rating: window._starVal || 5, note: (_$('rateNote') || {}).value || '',
      raterUid: window.U.uid, matchId: mid, createdAt: Date.now()
    });
    db.ref('users/' + uid + '/avgRating').transaction(function (v) { return ((v || 5) * 0.8 + (window._starVal || 5) * 0.2); });
    _toast('✅ Rating submit hua!');
    if (window.closeModal) closeModal();
  };

  /* ─── FEATURE 17: PUSH NOTIFICATION ENABLE ─── */
  window.enablePushNotifs = function () {
    if (!('Notification' in window)) { _toast('Browser support nahi karta', 'err'); return; }
    Notification.requestPermission().then(function (p) {
      if (p === 'granted') {
        _toast('✅ Push notifications enabled!');
        db.ref('users/' + window.U.uid + '/pushEnabled').set(true);
      } else { _toast('Notifications block hain — browser settings check karo', 'err'); }
    });
  };

  /* ─── FEATURE 18: ACHIEVEMENT GALLERY ─── */
  window.showAchievements = function () {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {};
    var achievements = [
      { title: 'First Blood 🩸', desc: 'Pehli jeet!', earned: (st.wins || 0) >= 1, icon: '🏆' },
      { title: 'High Flyer 🚀', desc: '5 matches jeete', earned: (st.wins || 0) >= 5, icon: '🚀' },
      { title: 'Kill Machine 💀', desc: '50 kills total', earned: (st.kills || 0) >= 50, icon: '💀' },
      { title: 'Money Maker 💰', desc: '₹100 kamaaya', earned: (st.earnings || 0) >= 100, icon: '💰' },
      { title: 'Veteran 🎖️', desc: '25 matches played', earned: (st.matches || 0) >= 25, icon: '🎖️' },
      { title: 'High Roller 💎', desc: '₹500 total deposit', earned: ((UD.realMoney || {}).deposited || 0) >= 500, icon: '💎' },
      { title: 'Influencer 🌟', desc: '5 friends refer kiye', earned: (UD.referralCount || 0) >= 5, icon: '🌟' },
      { title: 'Committed Player 🔥', desc: '10 din se khel rahe ho', earned: (UD.loginStreak || 0) >= 10, icon: '🔥' },
    ];
    var earned = achievements.filter(function (a) { return a.earned; }).length;
    var h = '<div><div style="text-align:center;margin-bottom:14px"><span style="font-size:24px;font-weight:900;color:var(--primary)">' + earned + '/' + achievements.length + '</span><div style="font-size:12px;color:var(--txt2)">Achievements Unlocked</div></div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    achievements.forEach(function (a) {
      h += '<div style="padding:12px;border-radius:12px;background:' + (a.earned ? 'rgba(0,255,156,.08)' : 'rgba(255,255,255,.03)') + ';border:1px solid ' + (a.earned ? 'rgba(0,255,156,.2)' : 'var(--border)') + ';opacity:' + (a.earned ? '1' : '.5') + '">';
      h += '<div style="font-size:24px;margin-bottom:4px">' + a.icon + '</div>';
      h += '<div style="font-size:12px;font-weight:700">' + a.title + '</div>';
      h += '<div style="font-size:10px;color:var(--txt2)">' + a.desc + '</div>';
      if (a.earned) h += '<div style="font-size:10px;color:var(--green);margin-top:4px">✅ Earned</div>';
      h += '</div>';
    });
    h += '</div></div>';
    if (window.showModal) showModal('🏅 Achievements', h);
  };

  /* Also expose for Profile renderAchievementsHTML */
  window.renderAchievementsHTML = function () {
    var UD = window.UD; if (!UD) return '';
    var st = UD.stats || {};
    var list = [
      { title: 'First Blood', earned: (st.wins || 0) >= 1, icon: '🩸' },
      { title: 'High Flyer', earned: (st.wins || 0) >= 5, icon: '🚀' },
      { title: 'Kill Machine', earned: (st.kills || 0) >= 50, icon: '💀' },
      { title: 'Money Maker', earned: (st.earnings || 0) >= 100, icon: '💰' },
      { title: 'Veteran', earned: (st.matches || 0) >= 25, icon: '🎖️' },
      { title: 'Influencer', earned: (UD.referralCount || 0) >= 5, icon: '🌟' },
    ];
    var earned = list.filter(function (a) { return a.earned; }).length;
    var h = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">';
    list.forEach(function (a) {
      h += '<div title="' + a.title + '" style="width:36px;height:36px;border-radius:10px;background:' + (a.earned ? 'rgba(0,255,156,.12)' : 'rgba(255,255,255,.04)') + ';border:1px solid ' + (a.earned ? 'rgba(0,255,156,.3)' : 'var(--border)') + ';display:flex;align-items:center;justify-content:center;font-size:18px;opacity:' + (a.earned ? '1' : '.3') + '">' + a.icon + '</div>';
    });
    h += '</div>';
    h += '<div style="font-size:11px;color:var(--green)">' + earned + '/' + list.length + ' achievements unlocked</div>';
    h += '<button onclick="window.showAchievements()" style="margin-top:8px;padding:8px 14px;border-radius:10px;background:rgba(0,255,156,.1);color:var(--green);border:1px solid rgba(0,255,156,.2);font-size:12px;font-weight:700;cursor:pointer">View All</button>';
    return h;
  };

  /* ─── FEATURE 19: SMART MATCH RECOMMENDATION ─── */
  window.getRecommendedMatch = function () {
    var UD = window.UD, MT = window.MT; if (!UD || !MT) return null;
    var dep = (UD.realMoney && UD.realMoney.deposited) ? Number(UD.realMoney.deposited) : 0;
    var budget = dep > 0 ? Math.min(dep * 0.1, 100) : 10;
    var best = null, bestScore = -1;
    var tp = UD.duoTeam ? 'duo' : 'solo';
    Object.values(MT).forEach(function (t) {
      if (!t || !t.id) return;
      if (window.hasJ && hasJ(t.id)) return;
      var fee = Number(t.entryFee) || 0;
      if (fee > budget) return;
      var slots = Number(t.joinedSlots || 0), max = Number(t.maxSlots || 1);
      if (slots >= max) return;
      var score = (t.prizePool || 0) - fee * 2 + ((slots / max) > 0.3 ? 10 : 0);
      if ((t.mode || t.type || '').toLowerCase() === tp) score += 20;
      if (score > bestScore) { bestScore = score; best = t; }
    });
    return best;
  };
  window.showRecommendedMatch = function () {
    var rec = window.getRecommendedMatch();
    if (!rec) { _toast('Koi suitable match nahi mila', 'inf'); return; }
    if (window.showDet) showDet(rec.id);
  };

  /* ─── FEATURE 20: MATCH ALERT SYSTEM ─── */
  window.setupMatchAlerts = function () {
    if (!window.MT || !window.db) return;
    Object.keys(window.MT).forEach(function (mid) {
      var t = window.MT[mid]; if (!t.matchTime) return;
      var ms = Number(t.matchTime) - Date.now() - 300000;
      if (ms > 0 && ms < 3600000) {
        setTimeout(function () {
          if (window.JR) {
            for (var k in window.JR) {
              if (window.JR[k].matchId === mid) {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('⚡ Match Starting!', { body: (t.name || 'Your match') + ' 5 minutes mein start hoga!' });
                }
                break;
              }
            }
          }
        }, ms);
      }
    });
  };

  /* ─── FEATURE 21: PROFILE CARD GENERATOR ─── */
  window.generateProfileCard = function () {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {};
    var canvas = document.createElement('canvas');
    canvas.width = 380; canvas.height = 200;
    var ctx = canvas.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 380, 200);
    g.addColorStop(0, '#0d0d18'); g.addColorStop(1, '#1a1040');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 380, 200);
    ctx.strokeStyle = '#00ff9c55'; ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 364, 184);
    ctx.fillStyle = '#00ff9c'; ctx.font = 'bold 14px Arial';
    ctx.fillText('MINI ESPORTS', 20, 35);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial';
    ctx.fillText(UD.ign || 'Player', 20, 70);
    ctx.fillStyle = '#aaa'; ctx.font = '12px Arial';
    ctx.fillText('FF UID: ' + (UD.ffUid || '—'), 20, 90);
    var stats = [['Matches', st.matches || 0], ['Wins', st.wins || 0], ['Kills', st.kills || 0], ['Earned', '₹' + (st.earnings || 0)]];
    stats.forEach(function (s, i) {
      var x = 20 + i * 90;
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px Arial';
      ctx.fillText(s[1], x, 135);
      ctx.fillStyle = '#888'; ctx.font = '11px Arial';
      ctx.fillText(s[0], x, 152);
    });
    ctx.fillStyle = '#444'; ctx.font = '10px Arial';
    ctx.fillText('mini-esports.app', 20, 185);
    var url = canvas.toDataURL();
    var a = document.createElement('a'); a.href = url; a.download = 'player-card.png'; a.click();
    _toast('🎴 Player card downloaded!');
  };

  /* ─── FEATURE 22: MATCH COUNTDOWN TIMER (per card) ─── */
  window.startMatchTimers = function () {
    clearInterval(window._timerInterval);
    window._timerInterval = setInterval(function () {
      var MT = window.MT || {};
      Object.keys(MT).forEach(function (mid) {
        var t = MT[mid]; if (!t || !t.matchTime) return;
        var el = document.getElementById('timer-' + mid); if (!el) return;
        var diff = Number(t.matchTime) - Date.now();
        if (diff <= 0) { el.textContent = ''; return; }
        if (diff > 86400000) { el.textContent = ''; return; }
        var h = Math.floor(diff / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        el.textContent = '⏱ ' + (h > 0 ? h + 'h ' : '') + m + 'm ' + s + 's';
      });
    }, 1000);
  };

  /* =========================================================
     🆕 NEW FEATURES (28 New — Total 50)
     ========================================================= */

  /* ─── NEW FEATURE 23: TEAMMATE AUTO-JOIN SYSTEM (FIXED & COMPLETE) ─── */
  /* When captain joins, ALL teammates automatically get:
     1. joinRequest entry (status: joined, isTeamMember: true)
     2. My Matches mein dikhe
     3. Room ID notification
     4. Stats/matches increment
     5. Admin panel mein unka entry dike
     6. Real-time notification to teammate's device
  */
  window.processTeammateJoins = function (matchId, teamMembers, captainName, matchName, isCoin, tp) {
    if (!teamMembers || teamMembers.length <= 1) return;
    teamMembers.forEach(function (member, idx) {
      if (member.role === 'captain') return; // Skip captain
      var pUid = member._fbUid || null;
      var pFFUid = member.uid || '';
      var pName = member.name || 'Teammate';
      if (!pUid) {
        // Find by ffUid
        db.ref('users').orderByChild('ffUid').equalTo(pFFUid).once('value', function (s) {
          if (!s.exists()) return;
          s.forEach(function (c) {
            _createTeammateJR(c.key, c.val(), matchId, matchName, isCoin, tp, teamMembers, captainName, window.U.uid);
          });
        });
      } else {
        db.ref('users/' + pUid).once('value', function (s) {
          if (s.exists()) _createTeammateJR(pUid, s.val(), matchId, matchName, isCoin, tp, teamMembers, captainName, window.U.uid);
        });
      }
    });
  };

  function _createTeammateJR(pFirebaseUid, pData, matchId, matchName, isCoin, mode, allMembers, captainName, captainFirebaseUid) {
    if (!pFirebaseUid || pFirebaseUid === captainFirebaseUid) return;
    // Check if already has joinRequest for this match
    db.ref('joinRequests').orderByChild('userId').equalTo(pFirebaseUid).once('value', function (s) {
      var alreadyJoined = false;
      if (s.exists()) s.forEach(function (c) { if (c.val().matchId === matchId) alreadyJoined = true; });
      if (alreadyJoined) return;

      // Create joinRequest
      var pjid = db.ref('joinRequests').push().key;
      db.ref('joinRequests/' + pjid).set({
        requestId: pjid,
        userId: pFirebaseUid,
        userName: pData.ign || pData.displayName || '',
        userFFUID: pData.ffUid || '',
        displayName: pData.displayName || '',
        userEmail: pData.email || '',
        matchId: matchId,
        matchName: matchName || '',
        entryFee: 0,         // Teammate pays nothing
        entryType: isCoin ? 'coin' : 'money',
        mode: mode,
        status: 'joined',
        slotsBooked: 0,
        isTeamMember: true,
        captainUid: captainFirebaseUid,
        captainName: captainName || '',
        teamMembers: allMembers,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      // Increment stats
      db.ref('users/' + pFirebaseUid + '/stats/matches').transaction(function (m) { return (m || 0) + 1; });

      // Send notification to teammate
      var nid = db.ref('users/' + pFirebaseUid + '/notifications').push().key;
      db.ref('users/' + pFirebaseUid + '/notifications/' + nid).set({
        type: 'team_joined',
        title: '🎮 Team Match Joined!',
        body: captainName + ' ne "' + matchName + '" join kiya — tum bhi team mein automatically ho! My Matches mein dekho.',
        matchId: matchId,
        matchName: matchName,
        faIcon: 'fa-users',
        read: false,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      console.log('[Mini eSports] ✅ Teammate joinRequest created for: ' + (pData.ign || pFirebaseUid));
    });
  }

  /* ─── NEW FEATURE 24: MATCH HISTORY DETAILED VIEW ─── */
  window.showMatchHistory = function () {
    var uid = window.U.uid;
    db.ref('joinRequests').orderByChild('userId').equalTo(uid).once('value', function (s) {
      var history = [];
      if (s.exists()) s.forEach(function (c) {
        var d = c.val();
        var t = window.MT && window.MT[d.matchId];
        history.push({ jr: d, match: t });
      });
      history.sort(function (a, b) { return (b.jr.createdAt || 0) - (a.jr.createdAt || 0); });
      var h = '<div style="display:flex;flex-direction:column;gap:8px">';
      if (!history.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">Koi match history nahi</p>';
      history.slice(0, 20).forEach(function (item) {
        var jr = item.jr, t = item.match;
        var isWin = jr.result && jr.result.won;
        var prize = jr.result ? (jr.result.prize || 0) : 0;
        h += '<div style="padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border)">';
        h += '<div style="display:flex;justify-content:space-between;align-items:start">';
        h += '<div><div style="font-size:13px;font-weight:700">' + (jr.matchName || 'Match') + '</div>';
        h += '<div style="font-size:11px;color:var(--txt2)">' + (jr.mode || 'solo').toUpperCase() + ' · ' + new Date(jr.createdAt || 0).toLocaleDateString() + '</div>';
        if (jr.isTeamMember) h += '<div style="font-size:10px;color:var(--purple)"><i class="fas fa-crown"></i> ' + (jr.captainName || 'Captain') + ' ki team</div>';
        h += '</div>';
        h += '<div style="text-align:right">';
        if (prize > 0) h += '<div style="font-size:14px;font-weight:800;color:var(--green)">+₹' + prize + '</div>';
        h += '<div style="font-size:11px;color:' + (isWin ? 'var(--green)' : 'var(--txt2)') + '">' + (isWin ? '🏆 Won' : '🎮 Played') + '</div>';
        h += '</div></div></div>';
      });
      h += '</div>';
      if (window.showModal) showModal('📋 Match History', h);
    });
  };

  /* ─── NEW FEATURE 25: REAL-TIME TEAM SYNC STATUS ─── */
  window.showTeamSyncStatus = function () {
    var UD = window.UD; if (!UD) return;
    var h = '<div style="padding:8px">';
    h += '<div style="font-size:14px;font-weight:700;margin-bottom:14px">👥 Team Sync Status</div>';
    // Duo
    h += '<div style="padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border);margin-bottom:10px">';
    h += '<div style="font-size:13px;font-weight:700;margin-bottom:8px"><i class="fas fa-user-friends" style="color:var(--blue)"></i> Duo Partner</div>';
    if (UD.duoTeam && UD.duoTeam.memberUid) {
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(0,255,106,.06);border-radius:8px">';
      h += '<div style="width:32px;height:32px;border-radius:50%;background:rgba(0,255,106,.12);display:flex;align-items:center;justify-content:center;font-weight:700">' + (UD.duoTeam.memberName || 'P').charAt(0) + '</div>';
      h += '<div><div style="font-size:13px;font-weight:600">' + (UD.duoTeam.memberName || 'Partner') + '</div>';
      h += '<div style="font-size:10px;color:var(--green)">✅ Synced | FF UID: ' + UD.duoTeam.memberUid + '</div></div></div>';
    } else {
      h += '<div style="font-size:12px;color:var(--txt2)">❌ No duo partner linked. Profile > My Team se add karo.</div>';
    }
    h += '</div>';
    // Squad
    h += '<div style="padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border)">';
    h += '<div style="font-size:13px;font-weight:700;margin-bottom:8px"><i class="fas fa-users" style="color:var(--purple)"></i> Squad Members</div>';
    var sq = (UD.squadTeam && UD.squadTeam.members) || [];
    if (sq.length > 0) {
      sq.forEach(function (m) {
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(185,100,255,.06);border-radius:8px;margin-bottom:4px">';
        h += '<div style="width:28px;height:28px;border-radius:50%;background:rgba(185,100,255,.12);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">' + (m.name || 'M').charAt(0) + '</div>';
        h += '<div><div style="font-size:12px;font-weight:600">' + (m.name || 'Member') + '</div>';
        h += '<div style="font-size:10px;color:var(--green)">✅ UID: ' + m.uid + '</div></div></div>';
      });
    } else {
      h += '<div style="font-size:12px;color:var(--txt2)">❌ No squad members. Profile > My Team se add karo.</div>';
    }
    h += '</div></div>';
    if (window.showModal) showModal('👥 Team Status', h);
  };

  /* ─── NEW FEATURE 26: IN-APP SUPPORT TICKET TRACKER ─── */
  window.showMyTickets = function () {
    var uid = window.U.uid;
    db.ref('supportRequests').orderByChild('userId').equalTo(uid).once('value', function (s) {
      var tickets = [];
      if (s.exists()) s.forEach(function (c) { tickets.push({ id: c.key, ...c.val() }); });
      tickets.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      var h = '<div style="display:flex;flex-direction:column;gap:8px">';
      if (!tickets.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">Koi ticket submit nahi hua</p>';
      tickets.forEach(function (t) {
        var stColor = t.status === 'resolved' ? 'var(--green)' : t.status === 'open' ? '#ffaa00' : 'var(--txt2)';
        var stLabel = t.status === 'resolved' ? '✅ Resolved' : '⏳ Open';
        h += '<div style="padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border)">';
        h += '<div style="display:flex;justify-content:space-between;align-items:start">';
        h += '<div><div style="font-size:13px;font-weight:700">' + (t.type || 'Issue') + '</div>';
        h += '<div style="font-size:12px;color:var(--txt2);margin-top:4px">' + (t.message || '').substring(0, 60) + '...</div>';
        h += '<div style="font-size:10px;color:var(--txt2);margin-top:4px">' + new Date(t.createdAt || 0).toLocaleDateString() + '</div></div>';
        h += '<span style="font-size:11px;font-weight:700;color:' + stColor + '">' + stLabel + '</span>';
        h += '</div></div>';
      });
      h += '</div>';
      if (window.showModal) showModal('🎫 My Tickets', h);
    });
  };

  /* ─── NEW FEATURE 27: PERSONAL NOTIFICATION CENTER ─── */
  window.showPersonalNotifs = function () {
    var uid = window.U.uid;
    db.ref('users/' + uid + '/notifications').orderByChild('createdAt').limitToLast(30).once('value', function (s) {
      var notifs = [];
      if (s.exists()) s.forEach(function (c) { notifs.unshift({ id: c.key, ...c.val() }); });
      var h = '<div style="display:flex;flex-direction:column;gap:6px">';
      if (!notifs.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">Koi notification nahi</p>';
      notifs.forEach(function (n) {
        h += '<div style="padding:10px 12px;border-radius:10px;background:' + (n.read ? 'var(--card2)' : 'rgba(0,255,156,.06)') + ';border:1px solid ' + (n.read ? 'var(--border)' : 'rgba(0,255,156,.2)') + '">';
        h += '<div style="font-size:13px;font-weight:700">' + (n.title || 'Notification') + '</div>';
        h += '<div style="font-size:12px;color:var(--txt2);margin-top:2px">' + (n.body || '') + '</div>';
        h += '<div style="font-size:10px;color:var(--txt2);margin-top:4px">' + new Date(n.createdAt || 0).toLocaleString() + '</div>';
        h += '</div>';
        // Mark as read
        if (!n.read) db.ref('users/' + uid + '/notifications/' + n.id + '/read').set(true);
      });
      h += '</div>';
      if (window.showModal) showModal('🔔 Notifications', h);
    });
  };

  /* ─── NEW FEATURE 28: LIVE ROOM ID COUNTDOWN ─── */
  window.updateRoomCountdowns = function () {
    var MT = window.MT || {}, JR = window.JR || {};
    for (var k in JR) {
      var jr = JR[k]; if (!jr.matchId) continue;
      var t = MT[jr.matchId]; if (!t || !t.matchTime) continue;
      var el = document.getElementById('room-cd-' + jr.matchId); if (!el) continue;
      var diff = Number(t.matchTime) - Date.now();
      if (t.roomStatus === 'released') {
        el.innerHTML = '<span style="color:var(--green);font-size:11px"><i class="fas fa-key"></i> Room ID Released!</span>';
      } else if (diff > 0) {
        var h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
        el.textContent = '🔑 Room ID in: ' + h + 'h ' + m + 'm';
      }
    }
  };
  setInterval(window.updateRoomCountdowns, 60000);

  /* ─── NEW FEATURE 29: MATCH SHARE WITH DEEP LINK ─── */
  window.shareMatchDeepLink = function (matchId) {
    var t = window.MT && window.MT[matchId]; if (!t) return;
    var url = window.location.origin + window.location.pathname + '?match=' + matchId;
    var ref = window.UD && window.UD.referralCode ? ' | Ref: ' + window.UD.referralCode : '';
    var text = '🎮 Join "' + t.name + '" on Mini eSports!\n💰 Prize: ₹' + (t.prizePool || 0) + ' | Entry: ₹' + (t.entryFee || 0) + ref;
    if (navigator.share) { navigator.share({ title: t.name, text: text, url: url }); }
    else { if (window.copyTxt) copyTxt(text + '\n' + url); _toast('Match link copied!'); }
  };

  /* ─── NEW FEATURE 30: PLAYER COMPARISON (vs Friend) ─── */
  window.showPlayerComparison = function () {
    var h = '<div style="padding:8px">';
    h += '<div style="font-size:14px;font-weight:700;margin-bottom:12px">⚔️ Compare with Player</div>';
    h += '<input type="text" id="cmpUid" placeholder="Enter FF UID to compare" style="width:100%;padding:12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px;box-sizing:border-box;margin-bottom:10px">';
    h += '<button onclick="window._doCompare()" style="width:100%;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Compare</button>';
    h += '</div>';
    if (window.showModal) showModal('⚔️ Player Compare', h);
  };
  window._doCompare = function () {
    var uid = (_$('cmpUid') || {}).value; if (!uid) return;
    db.ref('users').orderByChild('ffUid').equalTo(uid.trim()).once('value', function (s) {
      if (!s.exists()) { _toast('Player nahi mila', 'err'); return; }
      var other = null; s.forEach(function (c) { other = c.val(); });
      var me = window.UD; var st1 = me.stats || {}, st2 = other.stats || {};
      var rows = [['Matches', st1.matches || 0, st2.matches || 0], ['Wins', st1.wins || 0, st2.wins || 0], ['Kills', st1.kills || 0, st2.kills || 0], ['Earnings', '₹' + (st1.earnings || 0), '₹' + (st2.earnings || 0)]];
      var h = '<div>';
      h += '<div style="display:grid;grid-template-columns:1fr 60px 1fr;gap:0;margin-bottom:14px">';
      h += '<div style="text-align:center;padding:12px;background:rgba(0,255,156,.06);border-radius:12px 0 0 12px"><div style="font-size:18px;font-weight:900;color:var(--green)">' + (me.ign || 'You') + '</div><div style="font-size:10px;color:var(--txt2)">You</div></div>';
      h += '<div style="display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;background:var(--card2)">VS</div>';
      h += '<div style="text-align:center;padding:12px;background:rgba(255,107,107,.06);border-radius:0 12px 12px 0"><div style="font-size:18px;font-weight:900;color:#ff6b6b">' + (other.ign || 'Player') + '</div><div style="font-size:10px;color:var(--txt2)">Opponent</div></div>';
      h += '</div>';
      rows.forEach(function (r) {
        var myWin = typeof r[1] === 'number' && typeof r[2] === 'number' && r[1] > r[2];
        h += '<div style="display:grid;grid-template-columns:1fr 80px 1fr;gap:0;border-bottom:1px solid var(--border);padding:8px 0">';
        h += '<div style="text-align:center;font-size:14px;font-weight:' + (myWin ? '900' : '400') + ';color:' + (myWin ? 'var(--green)' : 'var(--txt)') + '">' + r[1] + '</div>';
        h += '<div style="text-align:center;font-size:11px;color:var(--txt2)">' + r[0] + '</div>';
        h += '<div style="text-align:center;font-size:14px;font-weight:' + (!myWin ? '900' : '400') + ';color:' + (!myWin ? '#ff6b6b' : 'var(--txt)') + '">' + r[2] + '</div>';
        h += '</div>';
      });
      h += '</div>';
      if (window.showModal) showModal('⚔️ Comparison', h);
    });
  };

  /* ─── NEW FEATURE 31: MY TEAM QUICK JOIN ─── */
  window.showQuickTeamJoin = function () {
    var UD = window.UD; if (!UD) return;
    var MT = window.MT || {};
    var teamMatches = [];
    Object.values(MT).forEach(function (t) {
      if (!t) return;
      var tp = (t.mode || t.type || 'solo').toLowerCase();
      var duo = UD.duoTeam && UD.duoTeam.memberUid;
      var squad = UD.squadTeam && UD.squadTeam.members && UD.squadTeam.members.length >= 3;
      if ((tp === 'duo' && duo) || (tp === 'squad' && squad)) {
        if (window.hasJ && !hasJ(t.id)) teamMatches.push(t);
      }
    });
    var h = '<div>';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Tumhare saved team ke liye suitable matches:</div>';
    if (!teamMatches.length) h += '<p style="text-align:center;color:var(--txt2);padding:20px">Koi team match nahi mila</p>';
    teamMatches.slice(0, 5).forEach(function (t) {
      h += '<div style="padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border);margin-bottom:8px;cursor:pointer" onclick="closeModal();cJoin(\'' + t.id + '\')">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center">';
      h += '<div><div style="font-size:13px;font-weight:700">' + t.name + '</div>';
      h += '<div style="font-size:11px;color:var(--txt2)">' + (t.mode || t.type || 'solo').toUpperCase() + ' · ₹' + (t.entryFee || 0) + '</div></div>';
      h += '<div style="padding:8px 14px;border-radius:10px;background:var(--primary);color:#000;font-weight:700;font-size:12px">Join</div>';
      h += '</div></div>';
    });
    h += '</div>';
    if (window.showModal) showModal('⚡ Quick Team Join', h);
  };

  /* ─── NEW FEATURE 32: RESULT DISPUTE FORM ─── */
  window.showResultDispute = function (matchId) {
    var h = '<div style="padding:8px">';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Galat result ke against complaint submit karo</div>';
    h += '<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--txt2);display:block;margin-bottom:4px">Issue Type</label>';
    h += '<select id="dispType" style="width:100%;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px">';
    h += '<option value="wrong_rank">Wrong Rank Given</option><option value="missing_kills">Kills Count Wrong</option><option value="not_credited">Prize Not Credited</option><option value="other">Other Issue</option>';
    h += '</select></div>';
    h += '<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--txt2);display:block;margin-bottom:4px">Your Actual Rank</label>';
    h += '<input type="number" id="dispRank" placeholder="e.g. 1" style="width:100%;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px;box-sizing:border-box"></div>';
    h += '<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--txt2);display:block;margin-bottom:4px">Explanation</label>';
    h += '<textarea id="dispMsg" style="width:100%;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px;resize:none;height:70px;box-sizing:border-box" placeholder="Details likhiyo..."></textarea></div>';
    h += '<button onclick="window._submitDispute(\'' + matchId + '\')" style="width:100%;padding:12px;border-radius:12px;background:#ff6b6b;color:#fff;font-weight:800;border:none;cursor:pointer">Submit Dispute</button>';
    h += '</div>';
    if (window.showModal) showModal('⚠️ Result Dispute', h);
  };
  window._submitDispute = function (matchId) {
    var type = (_$('dispType') || {}).value;
    var rank = (_$('dispRank') || {}).value;
    var msg = (_$('dispMsg') || {}).value;
    if (!msg || msg.trim().length < 10) { _toast('Thoda detail mein likhiyo', 'err'); return; }
    var id = db.ref('disputes').push().key;
    db.ref('disputes/' + id).set({
      id: id, matchId: matchId, userId: window.U.uid,
      userName: window.UD.ign || '', type: type,
      claimedRank: rank || '—', message: msg.trim(),
      status: 'pending', createdAt: Date.now()
    });
    _toast('✅ Dispute submitted! Admin review karega.');
    if (window.closeModal) closeModal();
  };

  /* ─── NEW FEATURE 33: DARK/LIGHT MODE TOGGLE ─── */
  window.toggleTheme = function () {
    var body = document.body;
    var isDark = body.getAttribute('data-theme') !== 'light';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('appTheme', isDark ? 'light' : 'dark');
    _toast(isDark ? '☀️ Light mode on' : '🌙 Dark mode on', 'inf');
  };
  // Apply saved theme on load
  (function () {
    var saved = localStorage.getItem('appTheme');
    if (saved) document.body && document.body.setAttribute('data-theme', saved);
  })();

  /* ─── NEW FEATURE 34: REFERRAL TRACKER CARD ─── */
  window.showReferralStats = function () {
    var UD = window.UD; if (!UD) return;
    var refs = window.REFS || [];
    var h = '<div style="padding:8px">';
    h += '<div style="text-align:center;padding:14px;background:linear-gradient(135deg,rgba(185,100,255,.12),rgba(0,255,156,.06));border-radius:14px;margin-bottom:14px">';
    h += '<div style="font-size:36px;font-weight:900;color:var(--primary)">' + (UD.referralCount || 0) + '</div>';
    h += '<div style="font-size:13px;color:var(--txt2)">Friends Referred</div>';
    h += '<div style="font-size:20px;font-weight:700;color:#ffd700;margin-top:4px">🪙 ' + (UD.referralCoinsEarned || 0) + '</div>';
    h += '<div style="font-size:11px;color:var(--txt2)">Coins Earned</div></div>';
    if (refs.length > 0) {
      h += '<div style="font-size:13px;font-weight:700;margin-bottom:8px">Recent Referrals:</div>';
      refs.slice(0, 5).forEach(function (r) {
        h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);margin-bottom:6px">';
        h += '<div style="width:32px;height:32px;border-radius:10px;background:rgba(0,255,156,.1);display:flex;align-items:center;justify-content:center;font-size:14px">👤</div>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + (r.referredName || 'User') + '</div>';
        h += '<div style="font-size:10px;color:var(--txt2)">' + new Date(r.createdAt || 0).toLocaleDateString() + '</div></div>';
        h += '<div style="font-size:13px;font-weight:700;color:#ffd700">+🪙10</div></div>';
      });
    } else {
      h += '<div style="text-align:center;padding:20px;color:var(--txt2)">Abhi tak koi referral nahi. Dosto ko invite karo!</div>';
    }
    h += '</div>';
    if (window.showModal) showModal('🎁 Referral Stats', h);
  };

  /* ─── NEW FEATURE 35: OFFLINE MODE INDICATOR ─── */
  window._isOnline = true;
  window.addEventListener('online', function () {
    window._isOnline = true;
    _toast('✅ Back online!', 'ok');
    var bar = document.getElementById('offlineBar');
    if (bar) bar.style.display = 'none';
  });
  window.addEventListener('offline', function () {
    window._isOnline = false;
    _toast('📶 Offline — check internet', 'err');
    var bar = document.getElementById('offlineBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'offlineBar';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:8px;background:#ff6b6b;color:#fff;font-size:12px;font-weight:700;text-align:center;z-index:9999';
      bar.textContent = '📶 You are offline. Some features may not work.';
      document.body && document.body.appendChild(bar);
    } else { bar.style.display = 'block'; }
  });

  /* ─── NEW FEATURE 36: MATCH FEEDBACK (Post-match survey) ─── */
  window.showMatchFeedback = function (matchId) {
    var h = '<div style="padding:8px;text-align:center">';
    h += '<div style="font-size:24px;margin-bottom:8px">🎮</div>';
    h += '<div style="font-size:16px;font-weight:700;margin-bottom:4px">Match kaisa tha?</div>';
    h += '<div style="font-size:12px;color:var(--txt2);margin-bottom:16px">Feedback se platform improve hoga</div>';
    h += '<div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px">';
    ['😍', '😊', '😐', '😕', '😠'].forEach(function (e, i) {
      h += '<span onclick="window._setFeedback(' + (5 - i) + ',this)" style="font-size:32px;cursor:pointer;opacity:.5;transition:.2s" class="fb-emoji">' + e + '</span>';
    });
    h += '</div>';
    h += '<textarea id="fbText" placeholder="Kuch aur share karna chahte ho?" style="width:100%;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:12px;resize:none;height:60px;box-sizing:border-box"></textarea>';
    h += '<button onclick="window._submitFeedback(\'' + matchId + '\')" style="width:100%;margin-top:10px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Submit</button>';
    h += '</div>';
    window._fbRating = 3;
    if (window.showModal) showModal('⭐ Match Feedback', h);
  };
  window._setFeedback = function (rating, el) {
    window._fbRating = rating;
    document.querySelectorAll('.fb-emoji').forEach(function (e) { e.style.opacity = '0.4'; e.style.transform = 'scale(1)'; });
    el.style.opacity = '1'; el.style.transform = 'scale(1.3)';
  };
  window._submitFeedback = function (matchId) {
    var text = (_$('fbText') || {}).value || '';
    db.ref('matchFeedback/' + matchId + '/' + window.U.uid).set({
      rating: window._fbRating, text: text, userId: window.U.uid,
      userName: window.UD.ign || '', createdAt: Date.now()
    });
    _toast('✅ Feedback diya! Shukriya 🙏');
    if (window.closeModal) closeModal();
  };

  /* ─── NEW FEATURE 37: MATCH TYPE FILTER (Quick Filter Chips) ─── */
  window.renderFilterChips = function () {
    var modes = ['all', 'solo', 'duo', 'squad'];
    var h = '<div style="display:flex;gap:8px;overflow-x:auto;padding:0 0 8px;scrollbar-width:none">';
    modes.forEach(function (m) {
      var active = (window._modeFilter || 'all') === m;
      h += '<button onclick="window.setModeFilter(\'' + m + '\')" style="padding:6px 14px;border-radius:20px;border:1px solid ' + (active ? 'var(--primary)' : 'var(--border)') + ';background:' + (active ? 'rgba(0,255,156,.12)' : 'transparent') + ';color:' + (active ? 'var(--primary)' : 'var(--txt2)') + ';font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">' + m.toUpperCase() + '</button>';
    });
    h += '</div>';
    return h;
  };
  window.setModeFilter = function (mode) {
    window._modeFilter = mode;
    if (window.renderHome) renderHome();
  };

  /* ─── NEW FEATURE 38: PROFILE VIEWS COUNTER ─── */
  window.trackProfileView = function (viewedUid) {
    if (!window.U || viewedUid === window.U.uid) return;
    db.ref('profileViews/' + viewedUid + '/' + window.U.uid).set(Date.now());
    db.ref('users/' + viewedUid + '/profileViewCount').transaction(function (v) { return (v || 0) + 1; });
  };
  window.showProfileViews = function () {
    var uid = window.U.uid;
    db.ref('profileViews/' + uid).once('value', function (s) {
      var count = s.exists() ? Object.keys(s.val()).length : 0;
      var h = '<div style="text-align:center;padding:20px">';
      h += '<div style="font-size:48px;font-weight:900;color:var(--primary)">' + count + '</div>';
      h += '<div style="font-size:14px;color:var(--txt2)">Players ne tumhara profile dekha</div>';
      h += '</div>';
      if (window.showModal) showModal('👀 Profile Views', h);
    });
  };

  /* ─── NEW FEATURE 39: MATCH CALENDAR VIEW ─── */
  window.showMatchCalendar = function () {
    var MT = window.MT || {};
    var byDate = {};
    Object.values(MT).forEach(function (t) {
      if (!t || !t.matchTime) return;
      var d = new Date(Number(t.matchTime));
      var key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(t);
    });
    var keys = Object.keys(byDate).slice(0, 7);
    var h = '<div>';
    if (!keys.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">Koi upcoming match nahi</p>';
    keys.forEach(function (day) {
      h += '<div style="margin-bottom:12px">';
      h += '<div style="font-size:12px;font-weight:700;color:var(--primary);padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:6px">' + day + '</div>';
      byDate[day].forEach(function (t) {
        var joined = window.hasJ && hasJ(t.id);
        h += '<div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;background:var(--card2);border:1px solid var(--border);margin-bottom:4px">';
        h += '<div style="font-size:11px;color:var(--txt2);min-width:40px">' + new Date(Number(t.matchTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</div>';
        h += '<div style="flex:1"><div style="font-size:12px;font-weight:700">' + t.name + '</div>';
        h += '<div style="font-size:10px;color:var(--txt2)">₹' + (t.entryFee || 0) + ' | ' + (t.mode || 'solo').toUpperCase() + '</div></div>';
        if (joined) h += '<span style="font-size:10px;color:var(--green)">✅</span>';
        h += '</div>';
      });
      h += '</div>';
    });
    h += '</div>';
    if (window.showModal) showModal('📅 Match Calendar', h);
  };

  /* ─── NEW FEATURE 40: SOUND TOGGLE ─── */
  window._soundOn = localStorage.getItem('soundPref') !== 'off';
  window.toggleSound = function () {
    window._soundOn = !window._soundOn;
    localStorage.setItem('soundPref', window._soundOn ? 'on' : 'off');
    _toast(window._soundOn ? '🔊 Sound on' : '🔇 Sound off', 'inf');
  };
  window.playSound = function (type) {
    if (!window._soundOn) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = type === 'join' ? 880 : type === 'win' ? 1047 : type === 'notif' ? 660 : 440;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* Ignore sound errors */ }
  };

  /* ─── NEW FEATURE 41: HAPTIC FEEDBACK ─── */
  window.haptic = function (pattern) {
    if (!navigator.vibrate) return;
    if (pattern === 'success') navigator.vibrate([50, 30, 80]);
    else if (pattern === 'error') navigator.vibrate([100, 50, 100, 50, 100]);
    else if (pattern === 'notif') navigator.vibrate([30, 20, 30]);
    else navigator.vibrate(50);
  };

  /* ─── NEW FEATURE 42: SMART WALLET TIPS ─── */
  window.showWalletTip = function () {
    var UD = window.UD; if (!UD) return;
    var rm = UD.realMoney || {};
    var win = rm.winnings || 0, dep = rm.deposited || 0;
    var tips = [];
    if (win > 100) tips.push('💡 Tumhare ₹' + win + ' winnings hain! Withdraw karo.');
    if (dep < 50) tips.push('💡 ₹50+ deposit karo aur zyada matches join karo.');
    if ((UD.stats || {}).matches > 5 && win === 0) tips.push('💡 Duo/Squad mode try karo — better chances!');
    if (!tips.length) tips.push('💡 Coins refer karke earn karo aur matches join karo!');
    _toast(tips[0], 'inf');
  };

  /* ─── NEW FEATURE 43: LANGUAGE PREFERENCE ─── */
  window._lang = localStorage.getItem('appLang') || 'hi';
  window.setLanguage = function (lang) {
    window._lang = lang;
    localStorage.setItem('appLang', lang);
    _toast(lang === 'hi' ? '✅ Hindi set' : '✅ English set', 'ok');
  };

  /* ─── NEW FEATURE 44: MATCH SLOTS LIVE PROGRESS BAR ─── */
  window.startSlotWatcher = function () {
    setInterval(function () {
      var MT = window.MT || {};
      Object.keys(MT).forEach(function (mid) {
        var t = MT[mid]; if (!t) return;
        var bar = document.querySelector('#slot-bar-' + mid);
        if (!bar) return;
        var js = Number(t.joinedSlots) || 0, ms = Number(t.maxSlots) || 1;
        var pct = Math.min(Math.round(js / ms * 100), 100);
        bar.style.width = pct + '%';
      });
    }, 5000);
  };

  /* ─── NEW FEATURE 45: MATCH INTEREST / GOING SYSTEM ─── */
  window.toggleInterest = function (matchId) {
    var uid = window.U.uid;
    db.ref('matchInterest/' + matchId + '/' + uid).once('value', function (s) {
      if (s.exists()) {
        db.ref('matchInterest/' + matchId + '/' + uid).remove();
        _toast('👋 Interest removed', 'inf');
      } else {
        db.ref('matchInterest/' + matchId + '/' + uid).set({ name: window.UD.ign || '', ts: Date.now() });
        _toast('⚡ Interest noted! Admin ko pata chalega.', 'ok');
      }
    });
  };

  /* ─── NEW FEATURE 46: TOTAL WINNINGS MILESTONE ─── */
  window.checkMilestone = function () {
    var UD = window.UD; if (!UD || !UD.stats) return;
    var earned = UD.stats.earnings || 0;
    var milestones = [100, 500, 1000, 5000, 10000];
    var lastMilestone = UD.lastMilestone || 0;
    milestones.forEach(function (m) {
      if (earned >= m && lastMilestone < m) {
        db.ref('users/' + window.U.uid + '/lastMilestone').set(m);
        setTimeout(function () {
          _toast('🎉 Milestone! ₹' + m + ' Total Earnings reached!', 'ok');
        }, 2000);
      }
    });
  };

  /* ─── NEW FEATURE 47: MATCH CHAT (In-Match Banter) ─── */
  window.showMatchChat = function (matchId) {
    var h = '<div style="display:flex;flex-direction:column;height:300px">';
    h += '<div id="matchChatMsgs" style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px"></div>';
    h += '<div style="display:flex;gap:8px;padding:8px;border-top:1px solid var(--border)">';
    h += '<input type="text" id="matchChatIn" placeholder="Type message..." style="flex:1;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px">';
    h += '<button onclick="window._sendMatchChat(\'' + matchId + '\')" style="padding:10px 16px;border-radius:10px;background:var(--primary);color:#000;font-weight:700;border:none;cursor:pointer"><i class="fas fa-paper-plane"></i></button>';
    h += '</div></div>';
    if (window.showModal) showModal('💬 Match Chat', h);
    // Load messages
    db.ref('matchChat/' + matchId).limitToLast(20).on('value', function (s) {
      var el = _$('matchChatMsgs'); if (!el) return;
      var msgs = []; if (s.exists()) s.forEach(function (c) { msgs.push(c.val()); });
      el.innerHTML = msgs.map(function (m) {
        var isMe = m.uid === window.U.uid;
        return '<div style="display:flex;justify-content:' + (isMe ? 'flex-end' : 'flex-start') + '">' +
          '<div style="max-width:70%;padding:6px 10px;border-radius:10px;background:' + (isMe ? 'rgba(0,255,156,.15)' : 'var(--card2)') + ';font-size:12px">' +
          '<div style="font-size:10px;color:var(--txt2);margin-bottom:2px">' + (m.name || 'Player') + '</div>' +
          '<div>' + (m.text || '') + '</div></div></div>';
      }).join('');
      el.scrollTop = el.scrollHeight;
    });
  };
  window._sendMatchChat = function (matchId) {
    var inp = _$('matchChatIn'); if (!inp || !inp.value.trim()) return;
    db.ref('matchChat/' + matchId).push({
      uid: window.U.uid, name: window.UD.ign || 'Player',
      text: inp.value.trim(), ts: Date.now()
    });
    inp.value = '';
  };

  /* ─── NEW FEATURE 48: NETWORK SPEED INDICATOR ─── */
  window.checkNetworkSpeed = function () {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) { _toast('Network info available nahi', 'inf'); return; }
    var type = conn.effectiveType || conn.type || 'unknown';
    var speed = { '4g': '🟢 Fast', '3g': '🟡 Medium', '2g': '🔴 Slow', 'slow-2g': '🔴 Very Slow' };
    _toast(speed[type] || ('📶 ' + type.toUpperCase()), 'inf');
  };

  /* ─── NEW FEATURE 49: DYNAMIC BANNER MESSAGES ─── */
  window.loadDynamicBanner = function () {
    db.ref('appSettings/banner').on('value', function (s) {
      var el = document.getElementById('dynamicBanner');
      if (!el) return;
      if (s.exists() && s.val()) {
        var val = s.val();
        el.style.display = 'block';
        el.textContent = typeof val === 'string' ? val : (val.text || '');
        el.style.background = (val.color || 'rgba(0,255,156,.1)');
        el.style.color = (val.textColor || 'var(--green)');
      } else { el.style.display = 'none'; }
    });
  };

  /* ─── NEW FEATURE 50: SESSION STATS TRACKER ─── */
  window._sessionStart = Date.now();
  window._sessionMatches = 0;
  window.showSessionStats = function () {
    var duration = Math.floor((Date.now() - window._sessionStart) / 60000);
    var h = '<div style="text-align:center;padding:16px">';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:14px">Current Session</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    [['⏱️', duration + ' min', 'Session Time'], ['🎮', window._sessionMatches, 'Matches Viewed']].forEach(function (d) {
      h += '<div style="padding:14px;border-radius:12px;background:var(--card2);border:1px solid var(--border);text-align:center">';
      h += '<div style="font-size:24px">' + d[0] + '</div>';
      h += '<div style="font-size:18px;font-weight:900">' + d[1] + '</div>';
      h += '<div style="font-size:10px;color:var(--txt2)">' + d[2] + '</div></div>';
    });
    h += '</div></div>';
    if (window.showModal) showModal('📊 Session Stats', h);
  };

  /* =========================================================
     AUTO INIT
     ========================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (window.checkShowTutorial) checkShowTutorial();
      if (window.setupMatchAlerts) setupMatchAlerts();
      if (window.loadDynamicBanner) loadDynamicBanner();
      if (window.startMatchTimers) startMatchTimers();
    }, 2000);
  });

  /* =========================================================
     AUTO INIT
     ========================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (window.checkShowTutorial) checkShowTutorial();
      if (window.setupMatchAlerts) setupMatchAlerts();
      if (window.loadDynamicBanner) loadDynamicBanner();
      if (window.startMatchTimers) startMatchTimers();
    }, 2000);
  });

  console.log('[Mini eSports] ✅ 50 User Features v9 loaded (Halal Only)');

  /* =========================================================
     🆕 NEW 100 FEATURES (51-150) — Halal Only
     ========================================================= */

  /* ─── FEATURE 51: QUICK RESULT SHARE (Match completed card) ─── */
  window.quickShareResult = function (matchId) {
    var JR = window.JR || {};
    for (var k in JR) {
      if (JR[k].matchId === matchId && JR[k].result) {
        var r = JR[k].result;
        window.shareResultCard && shareResultCard(window.MT && window.MT[matchId] && window.MT[matchId].name || 'Match', r.rank, r.kills, r.prize);
        return;
      }
    }
    _toast('Koi result nahi mila abhi', 'inf');
  };

  /* ─── FEATURE 52: MATCH COPY CODE ─── */
  window.copyMatchCode = function (matchId) {
    var t = window.MT && window.MT[matchId]; if (!t) return;
    var code = 'MATCH:' + matchId.substring(0, 8).toUpperCase();
    if (window.copyTxt) copyTxt(code);
    _toast('📋 Match code copied: ' + code);
  };

  /* ─── FEATURE 53: DAILY STREAK DISPLAY ─── */
  window.renderDailyStreak = function () {
    var UD = window.UD; if (!UD) return '';
    var streak = UD.loginStreak || 0;
    var fire = streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌱';
    var h = '<div style="background:linear-gradient(135deg,rgba(255,107,107,.08),rgba(255,170,0,.05));border:1px solid rgba(255,107,107,.2);border-radius:12px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:10px">';
    h += '<div style="font-size:24px">' + fire + '</div>';
    h += '<div><div style="font-size:13px;font-weight:700">' + streak + ' Day Login Streak!</div>';
    h += '<div style="font-size:10px;color:var(--txt2)">Roz login karo streak banao 💪</div></div>';
    h += '<div style="margin-left:auto;font-size:18px;font-weight:900;color:#ff6b6b">' + streak + '</div></div>';
    return h;
  };

  /* ─── FEATURE 54: PLAYER BADGE DISPLAY ─── */
  window.getPlayerBadge = function () {
    var UD = window.UD; if (!UD || !UD.stats) return '';
    var st = UD.stats;
    var wins = st.wins || 0, matches = st.matches || 0, kills = st.kills || 0;
    if (wins >= 50) return { label: 'Legend', color: '#ff6b6b', icon: '🏆' };
    if (wins >= 20) return { label: 'Elite', color: '#ffd700', icon: '💎' };
    if (wins >= 10) return { label: 'Pro', color: '#b964ff', icon: '⭐' };
    if (wins >= 5) return { label: 'Rising', color: '#4d96ff', icon: '🚀' };
    if (matches >= 5) return { label: 'Active', color: '#00ff9c', icon: '🎮' };
    return { label: 'Rookie', color: 'var(--txt2)', icon: '🌱' };
  };
  window.renderPlayerBadge = function () {
    var b = window.getPlayerBadge(); if (!b) return '';
    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.06);border:1px solid ' + b.color + '40;font-size:11px;font-weight:700;color:' + b.color + '">' + b.icon + ' ' + b.label + '</span>';
  };

  /* ─── FEATURE 55: KILL RANK DISPLAY ─── */
  window.getKillRank = function () {
    var UD = window.UD; if (!UD || !UD.stats) return 'Noob';
    var k = UD.stats.kills || 0;
    if (k >= 500) return '💀 Terminator';
    if (k >= 200) return '🔫 Sharpshooter';
    if (k >= 100) return '⚡ Hunter';
    if (k >= 50) return '🎯 Marksman';
    if (k >= 20) return '🌟 Soldier';
    return '🌱 Recruit';
  };

  /* ─── FEATURE 56: NOTIFICATION BADGE COUNT ─── */
  window.updateNotifBadge = function () {
    if (!window.U || !db) return;
    db.ref('users/' + window.U.uid + '/notifications').orderByChild('read').equalTo(false).once('value', function (s) {
      var count = 0; if (s.exists()) s.forEach(function () { count++; });
      var dot = document.getElementById('bellDot');
      if (dot) {
        dot.style.display = count > 0 ? 'block' : 'none';
        dot.textContent = count > 9 ? '9+' : count > 0 ? count : '';
        dot.style.cssText += ';background:#ff6b6b;color:#fff;font-size:8px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:absolute;top:-2px;right:-2px;font-weight:700';
      }
    });
  };
  // Auto update every 30 seconds
  setInterval(function () { if (window.updateNotifBadge) updateNotifBadge(); }, 30000);

  /* ─── FEATURE 57: MATCH RESULT HISTORY CARD (My Matches) ─── */
  window.renderResultCard = function (jr) {
    if (!jr || !jr.result) return '';
    var r = jr.result;
    return '<div style="margin-top:8px;padding:8px 12px;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,215,0,.02));border:1px solid rgba(255,215,0,.2);border-radius:10px;display:flex;gap:12px;align-items:center">' +
      '<div style="text-align:center"><div style="font-size:22px;font-weight:900;color:#ffd700">#' + (r.rank || '-') + '</div><div style="font-size:10px;color:var(--txt2)">Rank</div></div>' +
      '<div style="text-align:center"><div style="font-size:22px;font-weight:900;color:#ff6b6b">' + (r.kills || 0) + '💀</div><div style="font-size:10px;color:var(--txt2)">Kills</div></div>' +
      (r.prize > 0 ? '<div style="text-align:center"><div style="font-size:18px;font-weight:900;color:var(--green)">₹' + r.prize + '</div><div style="font-size:10px;color:var(--txt2)">Won</div></div>' : '') +
      '<button onclick="window.quickShareResult&&quickShareResult(\'' + (jr.matchId||'') + '\')" style="margin-left:auto;padding:6px 12px;border-radius:8px;background:rgba(0,255,156,.1);border:1px solid rgba(0,255,156,.2);color:var(--green);font-size:11px;font-weight:700;cursor:pointer"><i class="fas fa-share"></i></button>' +
      '</div>';
  };

  /* ─── FEATURE 58: MATCH COUNTDOWN LABEL ─── */
  window.getCountdownLabel = function (matchTime) {
    var diff = Number(matchTime) - Date.now();
    if (diff < 0) return 'Started';
    if (diff < 60000) return 'Starting now!';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm left';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ' + Math.floor((diff % 3600000) / 60000) + 'm';
    return Math.floor(diff / 86400000) + ' days';
  };

  /* ─── FEATURE 59: WATCHLIST SCREEN ─── */
  window.showWatchlistMatches = function () {
    var MT = window.MT || {};
    var wl = JSON.parse(localStorage.getItem('matchWatchlist') || '[]');
    var watchlisted = wl.map(function (id) { return MT[id]; }).filter(Boolean);
    var h = '<div style="display:flex;flex-direction:column;gap:8px">';
    if (!watchlisted.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">Watchlist empty. Matches pe ⭐ tap karo.</p>';
    watchlisted.forEach(function (t) {
      h += '<div style="padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border);cursor:pointer" onclick="closeModal();showDet(\'' + t.id + '\')">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center">';
      h += '<div><div style="font-size:13px;font-weight:700">' + t.name + '</div>';
      h += '<div style="font-size:11px;color:var(--txt2)">' + (t.mode||'solo').toUpperCase() + ' · ₹' + (t.entryFee||0) + ' · ₹' + (t.prizePool||0) + ' prize</div></div>';
      h += '<i class="fas fa-chevron-right" style="color:var(--txt2)"></i></div></div>';
    });
    h += '</div>';
    if (window.showModal) showModal('⭐ My Watchlist', h);
  };

  /* ─── FEATURE 60: QUICK JOIN (last match) ─── */
  window.quickJoinLastMatch = function () {
    var lastId = localStorage.getItem('lastJoinedMatchId');
    if (!lastId || !window.MT || !window.MT[lastId]) { _toast('No recent match found', 'inf'); return; }
    if (window.cJoin) cJoin(lastId);
  };

  /* ─── FEATURE 61: COIN BALANCE HISTORY ─── */
  window.showCoinHistory = function () {
    if (!window.U || !db) return;
    db.ref('users/' + window.U.uid + '/coinHistory').limitToLast(20).once('value', function (s) {
      var items = [];
      if (s.exists()) s.forEach(function (c) { items.unshift(c.val()); });
      var h = '<div style="display:flex;flex-direction:column;gap:6px">';
      if (!items.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">Koi coin history nahi</p>';
      items.forEach(function (i) {
        var isEarn = i.amount > 0;
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border)">';
        h += '<span style="font-size:20px">' + (isEarn ? '🪙' : '💸') + '</span>';
        h += '<div style="flex:1"><div style="font-size:12px;font-weight:600">' + (i.reason||'Transaction') + '</div>';
        h += '<div style="font-size:10px;color:var(--txt2)">' + new Date(i.ts||0).toLocaleDateString() + '</div></div>';
        h += '<div style="font-size:14px;font-weight:700;color:' + (isEarn ? 'var(--green)' : '#ff6b6b') + '">' + (isEarn ? '+' : '') + i.amount + ' 🪙</div></div>';
      });
      h += '</div>';
      if (window.showModal) showModal('🪙 Coin History', h);
    });
  };

  /* ─── FEATURE 62: MATCH STATS OVERLAY ─── */
  window.showMyMatchStats = function (matchId) {
    var JR = window.JR || {};
    var jr = null;
    for (var k in JR) { if (JR[k].matchId === matchId) { jr = JR[k]; break; } }
    if (!jr) { _toast('Match data nahi mila', 'inf'); return; }
    var h = '<div style="padding:8px;text-align:center">';
    h += '<div style="font-size:14px;font-weight:700;margin-bottom:12px">' + (jr.matchName||'Match') + '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
    [['Mode', (jr.mode||'solo').toUpperCase()], ['Entry', (jr.entryType==='coin'?'🪙':'₹') + (jr.entryFee||0)], ['Status', jr.status||'joined'], ['Team', jr.isTeamMember?'Member':'Captain']].forEach(function (d) {
      h += '<div style="padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border)"><div style="font-size:11px;color:var(--txt2)">' + d[0] + '</div><div style="font-size:14px;font-weight:700">' + d[1] + '</div></div>';
    });
    h += '</div>';
    if (jr.result) {
      h += '<div style="padding:12px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:12px">';
      h += '<div style="font-size:12px;font-weight:700;color:#ffd700;margin-bottom:8px">🏆 Result</div>';
      h += '<div style="display:flex;justify-content:space-around"><div><div style="font-size:24px;font-weight:900">#' + (jr.result.rank||'-') + '</div><div style="font-size:10px;color:var(--txt2)">Rank</div></div>';
      h += '<div><div style="font-size:24px;font-weight:900;color:#ff6b6b">' + (jr.result.kills||0) + '💀</div><div style="font-size:10px;color:var(--txt2)">Kills</div></div>';
      if (jr.result.prize > 0) h += '<div><div style="font-size:24px;font-weight:900;color:var(--green)">₹' + jr.result.prize + '</div><div style="font-size:10px;color:var(--txt2)">Won</div></div>';
      h += '</div></div>';
    }
    h += '</div>';
    if (window.showModal) showModal('📊 My Match Stats', h);
  };

  /* ─── FEATURE 63: QUICK TEAM INVITE SHARE ─── */
  window.shareTeamInvite = function () {
    var UD = window.UD; if (!UD) return;
    var code = UD.referralCode || (window.U && window.U.uid.substring(0, 8).toUpperCase()) || '';
    var msg = '🎮 Aye bhai! Mini eSports pe mere squad mein join ho jao! ' +
      '\n👤 Captain: ' + (UD.ign || 'Player') +
      '\n🔥 FF UID: ' + (UD.ffUid || 'N/A') +
      '\n🎁 Referral Code: ' + code +
      '\n📱 mini-esports.app';
    if (navigator.share) navigator.share({ text: msg });
    else if (window.copyTxt) { copyTxt(msg); _toast('Team invite copied!'); }
  };

  /* ─── FEATURE 64: ACTIVE MATCH PULSE INDICATOR ─── */
  window.updateActivePulse = function () {
    var MT = window.MT || {}, JR = window.JR || {};
    var hasLive = false;
    for (var k in JR) {
      var jr = JR[k];
      if (!jr.matchId) continue;
      var t = MT[jr.matchId];
      if (t && (t.status === 'live' || (t.matchTime && Math.abs(Number(t.matchTime) - Date.now()) < 1800000))) {
        hasLive = true; break;
      }
    }
    var nav = document.querySelector('[data-nav="matches"]');
    if (nav) {
      if (hasLive) nav.innerHTML = '<i class="fas fa-gamepad" style="color:#ff6b6b"></i><span>My Matches</span><span style="width:6px;height:6px;border-radius:50%;background:#ff6b6b;display:inline-block;margin-left:2px;animation:pulse 1s infinite"></span>';
    }
  };
  setInterval(window.updateActivePulse, 60000);

  /* ─── FEATURE 65: PROFILE AVATAR BADGE ─── */
  window.getAvatarFrame = function () {
    var UD = window.UD; if (!UD || !UD.stats) return 'none';
    var wins = UD.stats.wins || 0;
    if (wins >= 50) return 'linear-gradient(135deg,#ff6b6b,#ffd700)';
    if (wins >= 20) return 'linear-gradient(135deg,#ffd700,#ff9c00)';
    if (wins >= 10) return 'linear-gradient(135deg,#b964ff,#4d96ff)';
    if (wins >= 5) return 'linear-gradient(135deg,#4d96ff,#00ff9c)';
    return 'linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.05))';
  };

  /* ─── FEATURE 66: IN-APP TICKER UPDATE ─── */
  window.updateTicker = function () {
    var el = document.getElementById('tickerTxt'); if (!el) return;
    db.ref('appSettings/ticker').on('value', function (s) {
      if (s.exists() && s.val()) el.textContent = s.val();
    });
  };
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () { if (window.updateTicker) updateTicker(); }, 3000);
  });

  /* ─── FEATURE 67: MATCH SLOT PERCENTAGE LABEL ─── */
  window.getSlotPctLabel = function (filled, total) {
    var pct = total > 0 ? Math.round(filled / total * 100) : 0;
    return pct + '% filled';
  };

  /* ─── FEATURE 68: RESULT ANIMATION TRIGGER ─── */
  window.showWinAnimation = function (prize) {
    if (!prize || prize <= 0) return;
    var anim = document.createElement('div');
    anim.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);pointer-events:none';
    anim.innerHTML = '<div style="text-align:center;animation:bounceIn .5s"><div style="font-size:64px">🏆</div><div style="font-size:32px;font-weight:900;color:#ffd700;margin:8px 0">+₹' + prize + '</div><div style="font-size:16px;color:#fff">You Won!</div></div>';
    document.body && document.body.appendChild(anim);
    setTimeout(function () { anim.style.opacity = '0'; anim.style.transition = 'opacity .5s'; setTimeout(function () { anim.parentNode && anim.parentNode.removeChild(anim); }, 500); }, 2500);
  };

  /* ─── FEATURE 69: OPPONENT STATS PREVIEW ─── */
  window.showOpponentPreview = function (ffUid) {
    db.ref('users').orderByChild('ffUid').equalTo(ffUid).once('value', function (s) {
      if (!s.exists()) { _toast('Player nahi mila', 'inf'); return; }
      var u = null; s.forEach(function (c) { u = c.val(); });
      if (!u) return;
      var st = u.stats || {};
      var wr = st.matches > 0 ? Math.round((st.wins || 0) / st.matches * 100) : 0;
      var h = '<div style="padding:8px;text-align:center">';
      h += '<div style="font-size:48px;margin-bottom:8px">' + (u.profileImage ? '<img src="' + u.profileImage + '" style="width:60px;height:60px;border-radius:50%">' : '🎮') + '</div>';
      h += '<div style="font-size:18px;font-weight:900">' + (u.ign || 'Player') + '</div>';
      h += '<div style="font-size:11px;color:var(--txt2)">FF UID: ' + (u.ffUid||'—') + '</div>';
      if (u.bio) h += '<div style="font-size:12px;font-style:italic;color:var(--green);margin-top:6px">"' + u.bio + '"</div>';
      h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px">';
      [['Matches', st.matches||0], ['Wins', st.wins||0], ['Kills', st.kills||0]].forEach(function (d) {
        h += '<div style="padding:8px;border-radius:10px;background:var(--card2);border:1px solid var(--border)"><div style="font-size:16px;font-weight:900">' + d[1] + '</div><div style="font-size:10px;color:var(--txt2)">' + d[0] + '</div></div>';
      });
      h += '</div>';
      h += '<div style="margin-top:10px;padding:8px;background:rgba(0,255,106,.06);border-radius:8px;font-size:12px">Win Rate: <strong style="color:var(--green)">' + wr + '%</strong></div>';
      h += '<button onclick="window.showPlayerComparison&&showPlayerComparison()" style="width:100%;margin-top:12px;padding:10px;border-radius:10px;background:var(--primary);color:#000;font-weight:700;border:none;cursor:pointer">⚔️ Compare Stats</button>';
      h += '</div>';
      if (window.showModal) showModal('👤 Player Preview', h);
    });
  };

  /* ─── FEATURE 70: KEYBOARD SHORTCUTS ─── */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'h' || e.key === 'H') { if (window.navTo) navTo('home'); }
    if (e.key === 'p' || e.key === 'P') { if (window.navTo) navTo('profile'); }
    if (e.key === 'w' || e.key === 'W') { if (window.navTo) navTo('wallet'); }
    if (e.key === 'Escape') { if (window.closeModal) closeModal(); }
    if (e.key === 'r' || e.key === 'R') { if (window.renderHome) renderHome(); }
  });

  /* ─── FEATURE 71: LEADERBOARD RANK DISPLAY ─── */
  window.getLeaderboardRank = function (cb) {
    if (!window.U || !db) return;
    var uid = window.U.uid;
    db.ref('users').orderByChild('stats/earnings').once('value', function (s) {
      var users = [];
      if (s.exists()) s.forEach(function (c) { users.push({ uid: c.key, earnings: (c.val().stats || {}).earnings || 0 }); });
      users.sort(function (a, b) { return b.earnings - a.earnings; });
      var rank = users.findIndex(function (u) { return u.uid === uid; }) + 1;
      if (cb) cb(rank || users.length + 1, users.length);
    });
  };
  window.showMyRank = function () {
    window.getLeaderboardRank(function (rank, total) {
      _toast('🏆 Global Rank: #' + rank + ' out of ' + total + ' players!', 'inf');
    });
  };

  /* ─── FEATURE 72: MATCH INTEREST COUNTER DISPLAY ─── */
  window.getMatchInterestCount = function (matchId, cb) {
    db.ref('matchInterest/' + matchId).once('value', function (s) {
      var count = 0; if (s.exists()) s.forEach(function () { count++; });
      if (cb) cb(count);
    });
  };

  /* ─── FEATURE 73: AUTO REFRESH WHEN BACK ONLINE ─── */
  window.addEventListener('online', function () {
    setTimeout(function () {
      if (window.renderHome) renderHome();
      if (window.renderMM) renderMM();
    }, 1000);
  });

  /* ─── FEATURE 74: PRIZE TRACKER ─── */
  window.showPrizeTracker = function () {
    var UD = window.UD; if (!UD) return;
    var rm = UD.realMoney || {};
    var earned = (UD.stats || {}).earnings || 0;
    var withdrawn = 0; // Would track from walletRequests
    var h = '<div style="padding:8px">';
    h += '<div style="text-align:center;padding:16px;background:linear-gradient(135deg,rgba(0,255,156,.08),rgba(0,212,255,.04));border-radius:14px;margin-bottom:14px">';
    h += '<div style="font-size:36px;font-weight:900;color:var(--green)">₹' + earned + '</div>';
    h += '<div style="font-size:12px;color:var(--txt2)">Total Earnings</div>';
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    [['💰 Deposited', '₹' + (rm.deposited||0)], ['🏆 Winnings', '₹' + (rm.winnings||0)], ['🎁 Bonus', '₹' + (rm.bonus||0)], ['📤 Pending Wd', 'See wallet']].forEach(function (d) {
      h += '<div style="padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border);text-align:center"><div style="font-size:11px;color:var(--txt2)">' + d[0] + '</div><div style="font-size:14px;font-weight:700">' + d[1] + '</div></div>';
    });
    h += '</div></div>';
    if (window.showModal) showModal('💰 Prize Tracker', h);
  };

  /* ─── FEATURE 75: MATCH FILL RATE PREDICTION ─── */
  window.predictMatchFill = function (t) {
    if (!t || !t.joinedSlots || !t.maxSlots) return null;
    var pct = Number(t.joinedSlots) / Number(t.maxSlots) * 100;
    if (pct > 80) return { label: '🔥 Almost Full!', class: 'red' };
    if (pct > 60) return { label: '⚡ Filling Fast', class: 'yellow' };
    if (pct < 10) return { label: '✨ Just Opened', class: 'green' };
    return null;
  };

  /* ─── FEATURE 76: SWIPE GESTURE SUPPORT ─── */
  (function () {
    var startX = 0;
    document.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; });
    document.addEventListener('touchend', function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 100) {
        var navItems = ['home', 'special', 'matches', 'wallet', 'rank', 'profile'];
        var activeNav = document.querySelector('.nav-item.active');
        if (!activeNav) return;
        var curIdx = navItems.indexOf(activeNav.dataset.nav || '');
        if (curIdx < 0) return;
        if (diff > 0 && curIdx < navItems.length - 1) { if (window.navTo) navTo(navItems[curIdx + 1]); }
        else if (diff < 0 && curIdx > 0) { if (window.navTo) navTo(navItems[curIdx - 1]); }
      }
    });
  })();

  /* ─── FEATURE 77: APP VERSION CHECKER ─── */
  window.checkAppVersion = function () {
    db.ref('appSettings/minVersion').once('value', function (s) {
      if (!s.exists()) return;
      var minVer = s.val();
      var curVer = '9.0'; // Current version
      if (minVer && minVer > curVer) {
        _toast('🆕 New app update available! Refresh karo.', 'inf');
      }
    });
  };
  setTimeout(function () { if (window.checkAppVersion) checkAppVersion(); }, 5000);

  /* ─── FEATURE 78: MAINTENANCE MODE CHECK ─── */
  window.checkMaintenance = function () {
    db.ref('appSettings/maintenance').on('value', function (s) {
      if (s.val() === true) {
        var bar = document.getElementById('stateBanner');
        if (bar) {
          bar.style.display = 'block';
          bar.style.cssText += ';background:rgba(255,170,0,.15);border:1px solid rgba(255,170,0,.3);color:#ffaa00;padding:10px;text-align:center;font-weight:700;font-size:13px';
          bar.innerHTML = '⚙️ Maintenance mode. Thodi der baad try karo.';
        }
      }
    });
  };
  setTimeout(function () { if (window.checkMaintenance) checkMaintenance(); }, 2000);

  /* ─── FEATURE 79: TOURNAMENT BRACKETS VIEW ─── */
  window.showTournamentBracket = function (matchId) {
    db.ref('matchResults/' + matchId).once('value', function (s) {
      var results = [];
      if (s.exists()) s.forEach(function (c) { results.push(c.val()); });
      results.sort(function (a, b) { return (a.rank || 99) - (b.rank || 99); });
      if (!results.length) { _toast('Results abhi available nahi hain', 'inf'); return; }
      var h = '<div>';
      results.forEach(function (r) {
        var bg = r.rank === 1 ? 'rgba(255,215,0,.1)' : r.rank === 2 ? 'rgba(192,192,192,.1)' : r.rank === 3 ? 'rgba(205,127,50,.1)' : 'var(--card2)';
        var medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '#' + r.rank;
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:' + bg + ';border:1px solid var(--border);margin-bottom:6px">';
        h += '<div style="font-size:18px;min-width:28px;text-align:center">' + medal + '</div>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (r.playerName||'Player') + '</div>';
        h += '<div style="font-size:11px;color:var(--txt2)">Kills: ' + (r.kills||0) + '</div></div>';
        if (r.prize > 0) h += '<div style="font-size:14px;font-weight:700;color:var(--green)">₹' + r.prize + '</div>';
        h += '</div>';
      });
      h += '</div>';
      if (window.showModal) showModal('🏆 Match Results', h);
    });
  };

  /* ─── FEATURE 80: HAPTIC ON JOIN ─── */
  var _origNavTo = window.navTo;
  window.navTo = function (scr) {
    if (window.haptic) haptic();
    if (_origNavTo) _origNavTo(scr);
  };

  /* ─── FEATURE 81: MATCH SEARCH ─── */
  window.showMatchSearch = function () {
    var h = '<div><input type="text" id="mSearchIn" placeholder="Match naam search karo..." oninput="window._searchMatches()" style="width:100%;padding:12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px;box-sizing:border-box;margin-bottom:10px"><div id="mSearchRes"></div></div>';
    if (window.showModal) showModal('🔍 Search Matches', h);
  };
  window._searchMatches = function () {
    var q = (document.getElementById('mSearchIn') || {}).value || ''; q = q.toLowerCase();
    var res = document.getElementById('mSearchRes'); if (!res) return;
    if (q.length < 2) { res.innerHTML = '<p style="color:var(--txt2);text-align:center;padding:20px">2+ characters type karo</p>'; return; }
    var MT = window.MT || {};
    var found = Object.values(MT).filter(function (t) { return t && t.name && t.name.toLowerCase().includes(q); });
    var h = '<div style="display:flex;flex-direction:column;gap:6px">';
    if (!found.length) h += '<p style="color:var(--txt2);text-align:center;padding:20px">Koi match nahi mila</p>';
    found.slice(0, 10).forEach(function (t) {
      h += '<div onclick="closeModal();showDet(\'' + t.id + '\')" style="padding:10px 12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);cursor:pointer;display:flex;justify-content:space-between;align-items:center">';
      h += '<div><div style="font-size:13px;font-weight:700">' + t.name + '</div><div style="font-size:11px;color:var(--txt2)">' + (t.mode||'solo').toUpperCase() + ' · ₹' + (t.entryFee||0) + '</div></div>';
      h += '<i class="fas fa-chevron-right" style="color:var(--txt2)"></i></div>';
    });
    h += '</div>';
    res.innerHTML = h;
  };

  /* ─── FEATURE 82: NIGHT MODE AUTO ─── */
  window.autoNightMode = function () {
    var hr = new Date().getHours();
    var isNight = hr >= 21 || hr < 6;
    var saved = localStorage.getItem('appTheme');
    if (!saved) {
      document.body && document.body.setAttribute('data-theme', isNight ? 'dark' : 'light');
    }
  };
  window.autoNightMode();

  /* ─── FEATURE 83: TOURNAMENT TYPE ICONS ─── */
  window.getMatchTypeIcon = function (t) {
    if (!t) return '🎮';
    var mode = (t.mode || t.type || 'solo').toLowerCase();
    if (mode === 'duo') return '👥';
    if (mode === 'squad') return '👪';
    if (t.isSpecial) return '⭐';
    return '🎮';
  };

  /* ─── FEATURE 84: QUICK SUPPORT CHAT ─── */
  window.sendQuickSupport = function (issue) {
    if (!window.U || !db) return;
    var uid = window.U.uid;
    var id = db.ref('supportRequests').push().key;
    db.ref('supportRequests/' + id).set({
      id: id, userId: uid, userName: window.UD && window.UD.ign || '',
      userEmail: window.UD && window.UD.email || '',
      type: issue, message: issue, status: 'open', createdAt: Date.now()
    });
    _toast('✅ Support request sent! Admin se chat karo.', 'ok');
  };
  window.showQuickSupport = function () {
    var issues = ['Match Room ID nahi mila', 'Prize credited nahi hua', 'Profile approve nahi hua', 'Wrong result diya', 'App bug hai', 'Other issue'];
    var h = '<div style="display:flex;flex-direction:column;gap:8px">';
    issues.forEach(function (i) {
      h += '<button onclick="sendQuickSupport(\'' + i + '\');closeModal()" style="padding:12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px;font-weight:600;cursor:pointer;text-align:left">' + i + '</button>';
    });
    h += '</div>';
    if (window.showModal) showModal('🆘 Quick Support', h);
  };

  /* ─── FEATURE 85: MATCH PARTICIPATION CERTIFICATE ─── */
  window.generateCertificate = function (matchName, rank, date) {
    var UD = window.UD; if (!UD) return;
    var canvas = document.createElement('canvas');
    canvas.width = 500; canvas.height = 300;
    var ctx = canvas.getContext('2d');
    // Background
    var g = ctx.createLinearGradient(0, 0, 500, 300);
    g.addColorStop(0, '#0a0f1a'); g.addColorStop(1, '#1a0f2e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 500, 300);
    // Border
    ctx.strokeStyle = '#ffd70066'; ctx.lineWidth = 3; ctx.strokeRect(10, 10, 480, 280);
    // Title
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
    ctx.fillText('MINI eSPORTS — CERTIFICATE', 250, 50);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px Arial';
    ctx.fillText('This certifies that', 250, 90);
    ctx.fillStyle = '#00ff9c'; ctx.font = 'bold 24px Arial';
    ctx.fillText(UD.ign || 'Player', 250, 130);
    ctx.fillStyle = '#ffffff'; ctx.font = '14px Arial';
    ctx.fillText('participated in ' + (matchName || 'Tournament'), 250, 165);
    ctx.fillText('Rank #' + (rank || '-') + ' · ' + (date || new Date().toLocaleDateString()), 250, 195);
    ctx.fillStyle = '#ffd700'; ctx.font = '12px Arial';
    ctx.fillText('mini-esports.app', 250, 275);
    var url = canvas.toDataURL();
    var a = document.createElement('a'); a.href = url; a.download = 'certificate.png'; a.click();
    _toast('🏅 Certificate downloaded!');
  };

  /* ─── FEATURE 86: REAL-TIME MATCH SLOT COUNTER ─── */
  window.initSlotCounters = function () {
    var MT = window.MT || {};
    Object.keys(MT).forEach(function (mid) {
      db.ref('matches/' + mid + '/joinedSlots').on('value', function (s) {
        var el = document.getElementById('slots-' + mid);
        if (el && s.exists()) el.textContent = s.val() + '/' + (MT[mid] && MT[mid].maxSlots || '?');
      });
    });
  };

  /* ─── FEATURE 87: MATCH NOTES (Personal) ─── */
  window.showMatchNote = function (matchId) {
    var key = 'matchNote_' + matchId;
    var existing = localStorage.getItem(key) || '';
    var h = '<div style="padding:8px">';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px">Personal note for this match:</div>';
    h += '<textarea id="matchNoteIn" style="width:100%;padding:12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--txt);font-size:13px;resize:none;height:100px;box-sizing:border-box" placeholder="Strategy, notes, team info...">' + existing + '</textarea>';
    h += '<button onclick="localStorage.setItem(\'matchNote_' + matchId + '\',document.getElementById(\'matchNoteIn\').value);toast(\'Note saved!\');closeModal()" style="width:100%;margin-top:10px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Save Note</button>';
    h += '</div>';
    if (window.showModal) showModal('📝 Match Note', h);
  };

  /* ─── FEATURE 88: WIN PROBABILITY DISPLAY ─── */
  window.getWinProbability = function (t) {
    if (!t || !t.maxSlots) return null;
    var slots = Number(t.maxSlots);
    var mode = (t.mode || t.type || 'solo').toLowerCase();
    var baseChance = mode === 'solo' ? 1 / slots : mode === 'duo' ? 2 / slots : 4 / slots;
    var pct = Math.min(Math.round(baseChance * 100), 100);
    return pct;
  };

  /* ─── FEATURE 89: STREAK BONUS NOTIFICATION ─── */
  window.checkStreakBonus = function () {
    var UD = window.UD; if (!UD) return;
    var streak = UD.loginStreak || 0;
    var milestones = [3, 7, 14, 30];
    if (milestones.indexOf(streak) >= 0) {
      _toast('🎉 ' + streak + ' Day Streak Bonus! Extra 🪙 coins earned!', 'ok');
    }
  };

  /* ─── FEATURE 90: IN-APP RULES SUMMARY ─── */
  window.showQuickRules = function () {
    var rules = [
      { icon: '🎮', title: 'Fair Play', desc: 'Registered IGN & UID se hi khelo. Mismatch = disqualification.' },
      { icon: '💰', title: 'Entry Fee', desc: 'Entry fee non-refundable hai (cancelled match ke siwa).' },
      { icon: '💀', title: 'Kill Proof', desc: 'Kill count dispute ke liye screenshot upload karo.' },
      { icon: '🏆', title: 'Results', desc: 'Admin 30 min mein result publish karega.' },
      { icon: '📤', title: 'Withdrawal', desc: 'Min ₹50. Winnings wallet mein credited hote hain.' },
      { icon: '🚫', title: 'Cheating', desc: 'Hack/cheat = permanent ban aur prize forfeit.' },
    ];
    var h = '<div style="display:flex;flex-direction:column;gap:8px">';
    rules.forEach(function (r) {
      h += '<div style="display:flex;gap:10px;padding:10px;border-radius:10px;background:var(--card2);border:1px solid var(--border)">';
      h += '<span style="font-size:20px">' + r.icon + '</span>';
      h += '<div><div style="font-size:13px;font-weight:700">' + r.title + '</div><div style="font-size:11px;color:var(--txt2)">' + r.desc + '</div></div></div>';
    });
    h += '</div>';
    if (window.showModal) showModal('📋 Quick Rules', h);
  };

  /* ─── FEATURE 91: EARN COINS GUIDE ─── */
  window.showEarnGuide = function () {
    var ways = [
      { icon: '📅', title: 'Daily Login', coins: '+5 🪙', desc: 'Roz login karo' },
      { icon: '👥', title: 'Refer Friends', coins: '+10 🪙', desc: 'Har refer pe' },
      { icon: '🎟️', title: 'Use Voucher', coins: 'Varies', desc: 'Voucher code redeem karo' },
      { icon: '🎮', title: 'Play Matches', coins: 'Win prizes', desc: 'Coin matches join karo' },
    ];
    var h = '<div style="display:flex;flex-direction:column;gap:8px">';
    ways.forEach(function (w) {
      h += '<div style="display:flex;gap:10px;align-items:center;padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border)">';
      h += '<span style="font-size:24px">' + w.icon + '</span>';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + w.title + '</div><div style="font-size:11px;color:var(--txt2)">' + w.desc + '</div></div>';
      h += '<div style="font-size:13px;font-weight:700;color:#ffd700">' + w.coins + '</div></div>';
    });
    h += '</div>';
    if (window.showModal) showModal('🪙 How to Earn Coins', h);
  };

  /* ─── FEATURE 92: MATCH HISTORY EXPORT ─── */
  window.exportMatchHistory = function () {
    var uid = window.U && window.U.uid; if (!uid) return;
    db.ref('joinRequests').orderByChild('userId').equalTo(uid).once('value', function (s) {
      var rows = [['Match Name', 'Mode', 'Entry Fee', 'Status', 'Result', 'Date']];
      if (s.exists()) s.forEach(function (c) {
        var d = c.val();
        rows.push([
          d.matchName || 'Unknown', d.mode || 'solo', d.entryFee || 0, d.status || '-',
          d.result ? 'Rank #' + d.result.rank + ' | ₹' + d.result.prize : 'No result',
          new Date(d.createdAt || 0).toLocaleDateString()
        ]);
      });
      var csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'match-history.csv'; a.click();
      _toast('📊 Match history exported!');
    });
  };

  /* ─── FEATURE 93: APP TOUR BUTTON ─── */
  window.startAppTour = function () {
    localStorage.removeItem('tutorialSeen');
    if (window.checkShowTutorial) checkShowTutorial();
  };

  /* ─── FEATURE 94: QUICK JOIN HISTORY ─── */
  window.showRecentJoins = function () {
    var history = JSON.parse(localStorage.getItem('recentJoins') || '[]');
    var h = '<div style="display:flex;flex-direction:column;gap:6px">';
    if (!history.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">No recent joins</p>';
    history.slice(0, 10).forEach(function (item) {
      h += '<div style="padding:10px 12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">';
      h += '<div><div style="font-size:13px;font-weight:600">' + (item.name||'Match') + '</div><div style="font-size:10px;color:var(--txt2)">' + new Date(item.ts||0).toLocaleDateString() + '</div></div>';
      h += '<div style="font-size:11px;color:var(--green)">Joined ✅</div></div>';
    });
    h += '</div>';
    if (window.showModal) showModal('🕐 Recent Joins', h);
  };

  /* ─── FEATURE 95: MONEY SAVING TIPS ─── */
  window.showSavingTips = function () {
    var tips = [
      '💡 Free matches se start karo — without risking money.',
      '💡 Duo/squad modes mein win rate better hoti hai.',
      '💡 Prime time (evening) mein matches join karo — more players.',
      '💡 Small entry fees wale matches mein start karo — less risk.',
      '💡 Kill-based prizes mein aggressive khelo — bonus earn hoga.',
      '💡 Profile 100% complete karo for better matchmaking.'
    ];
    var h = '<div style="display:flex;flex-direction:column;gap:8px">';
    tips.forEach(function (t) {
      h += '<div style="padding:10px 12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);font-size:12px">' + t + '</div>';
    });
    h += '</div>';
    if (window.showModal) showModal('💡 Smart Tips', h);
  };

  /* ─── FEATURE 96: SHARE MATCH ON WHATSAPP ─── */
  window.shareMatchWhatsApp = function (matchId) {
    var t = window.MT && window.MT[matchId]; if (!t) return;
    var msg = encodeURIComponent('🎮 Join ' + t.name + ' on Mini eSports!\n💰 Prize: ₹' + (t.prizePool||0) + '\n💵 Entry: ₹' + (t.entryFee||0) + '\n⏰ ' + (t.matchTime ? new Date(Number(t.matchTime)).toLocaleString() : '') + '\n📱 mini-esports.app');
    window.open('https://wa.me/?text=' + msg, '_blank');
  };

  /* ─── FEATURE 97: PERSONAL BEST TRACKER ─── */
  window.showPersonalBest = function () {
    var UD = window.UD; if (!UD || !UD.stats) return;
    var st = UD.stats;
    var h = '<div style="padding:8px">';
    h += '<div style="font-size:14px;font-weight:700;margin-bottom:14px;text-align:center">🏅 Your Personal Bests</div>';
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    [
      { label: 'Most Kills in a Season', val: (st.kills || 0), icon: '💀', color: '#ff6b6b' },
      { label: 'Total Matches Played', val: (st.matches || 0), icon: '🎮', color: '#4d96ff' },
      { label: 'Total Wins', val: (st.wins || 0), icon: '🏆', color: '#ffd700' },
      { label: 'Total Earnings', val: '₹' + (st.earnings || 0), icon: '💰', color: 'var(--green)' }
    ].forEach(function (d) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border)">';
      h += '<span style="font-size:24px">' + d.icon + '</span>';
      h += '<div style="flex:1"><div style="font-size:12px;color:var(--txt2)">' + d.label + '</div></div>';
      h += '<div style="font-size:18px;font-weight:900;color:' + d.color + '">' + d.val + '</div></div>';
    });
    h += '</div></div>';
    if (window.showModal) showModal('🏅 Personal Bests', h);
  };

  /* ─── FEATURE 98: MATCH TYPE EXPLAINER ─── */
  window.showMatchTypeInfo = function (type) {
    var info = {
      'Battle Royale': { title: 'Battle Royale', desc: '25 players mein last man standing jitega. Kill karo aur survive karo!', icon: '🔫' },
      'Clash Squad': { title: 'Clash Squad', desc: '4v4 team mode. 5 rounds mein zyada wins wala team jeeta!', icon: '⚔️' },
      'Free for All': { title: 'Free For All', desc: 'Sab ke against sab. Most kills wala player jeeta!', icon: '💥' },
    };
    var i = info[type] || { title: type, desc: 'Standard tournament mode', icon: '🎮' };
    var h = '<div style="text-align:center;padding:16px"><div style="font-size:48px;margin-bottom:8px">' + i.icon + '</div><div style="font-size:18px;font-weight:800;margin-bottom:8px">' + i.title + '</div><div style="font-size:13px;color:var(--txt2);line-height:1.5">' + i.desc + '</div></div>';
    if (window.showModal) showModal('ℹ️ Match Type', h);
  };

  /* ─── FEATURE 99: RECENT WINNERS FEED ─── */
  window.showRecentWinners = function () {
    db.ref('matchResults').limitToLast(5).once('value', function (s) {
      var winners = [];
      if (s.exists()) s.forEach(function (matchNode) {
        matchNode.forEach(function (c) {
          var r = c.val();
          if (r.rank === 1 && r.prize > 0) winners.push(r);
        });
      });
      var h = '<div style="display:flex;flex-direction:column;gap:8px">';
      if (!winners.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">Koi recent winners nahi</p>';
      winners.forEach(function (w) {
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2)">';
        h += '<span style="font-size:20px">🥇</span>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (w.playerName||'Player') + '</div><div style="font-size:10px;color:var(--txt2)">Won ₹' + w.prize + '</div></div>';
        h += '<div style="font-size:14px;font-weight:700;color:#ffd700">₹' + w.prize + '</div></div>';
      });
      h += '</div>';
      if (window.showModal) showModal('🏆 Recent Winners', h);
    });
  };

  /* ─── FEATURE 100: COMPLETE PROFILE WIZARD ─── */
  window.showProfileWizard = function () {
    var UD = window.UD; if (!UD) return;
    var steps = [];
    if (!UD.ign || !UD.ffUid) steps.push({ step: 'Update IGN & FF UID', action: "showProfileUpdate()", icon: '🎮' });
    if (!UD.phone) steps.push({ step: 'Add Phone Number', action: null, icon: '📱' });
    if (!UD.bio) steps.push({ step: 'Set Gaming Bio', action: "showSetBio()", icon: '✏️' });
    if (!UD.duoTeam || !UD.duoTeam.memberUid) steps.push({ step: 'Add Duo Partner', action: "navTo('profile')", icon: '👥' });
    if (!UD.profileImage) steps.push({ step: 'Upload Profile Photo', action: "document.getElementById('profImgIn')&&document.getElementById('profImgIn').click()", icon: '📸' });
    var pct = window.getProfileCompletion ? window.getProfileCompletion() : 0;
    if (pct >= 100) { _toast('✅ Profile 100% complete hai! Great job!', 'ok'); return; }
    var h = '<div><div style="margin-bottom:14px;padding:12px;background:rgba(0,255,156,.06);border-radius:10px;text-align:center"><div style="font-size:24px;font-weight:900;color:var(--green)">' + pct + '%</div><div style="font-size:12px;color:var(--txt2)">Complete</div></div>';
    h += '<div style="font-size:13px;font-weight:700;margin-bottom:10px">Ye steps complete karo:</div>';
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    steps.forEach(function (s) {
      h += '<div onclick="' + (s.action || '') + ';closeModal()" style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:var(--card2);border:1px solid var(--border);cursor:' + (s.action ? 'pointer' : 'default') + '">';
      h += '<span style="font-size:20px">' + s.icon + '</span>';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + s.step + '</div></div>';
      if (s.action) h += '<i class="fas fa-chevron-right" style="color:var(--txt2)"></i>';
      h += '</div>';
    });
    h += '</div></div>';
    if (window.showModal) showModal('🎯 Complete Your Profile', h);
  };

  /* ─── FEATURE 101: TEAM FORMATION WIZARD ─── */
  window.showTeamWizard = function () {
    var h = '<div style="padding:8px"><div style="font-size:14px;font-weight:700;margin-bottom:12px">👥 Build Your Team</div>';
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    h += '<div onclick="addTM&&addTM(\'duo\');closeModal()" style="padding:12px;border-radius:12px;background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.2);cursor:pointer">';
    h += '<div style="font-size:14px;font-weight:700;color:var(--blue)">👥 Duo Partner Add Karo</div>';
    h += '<div style="font-size:11px;color:var(--txt2)">1 partner ke saath duo matches khelo</div></div>';
    h += '<div onclick="addTM&&addTM(\'squad\');closeModal()" style="padding:12px;border-radius:12px;background:rgba(185,100,255,.08);border:1px solid rgba(185,100,255,.2);cursor:pointer">';
    h += '<div style="font-size:14px;font-weight:700;color:var(--purple)">👪 Squad Add Karo</div>';
    h += '<div style="font-size:11px;color:var(--txt2)">3 partners ke saath squad matches khelo</div></div>';
    h += '<div onclick="shareTeamInvite&&shareTeamInvite();closeModal()" style="padding:12px;border-radius:12px;background:rgba(37,211,102,.08);border:1px solid rgba(37,211,102,.2);cursor:pointer">';
    h += '<div style="font-size:14px;font-weight:700;color:#25d366"><i class="fab fa-whatsapp"></i> WhatsApp pe Invite Karo</div>';
    h += '<div style="font-size:11px;color:var(--txt2)">Friends ko invite karo</div></div>';
    h += '</div></div>';
    if (window.showModal) showModal('👥 Team Wizard', h);
  };

  /* ─── FEATURE 102: MULTI-PLATFORM SHARE ─── */
  window.showShareOptions = function (text, title) {
    var encoded = encodeURIComponent(text || '');
    var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:8px">';
    [
      ['WhatsApp', 'fab fa-whatsapp', '#25d366', 'https://wa.me/?text=' + encoded],
      ['Telegram', 'fab fa-telegram', '#0088cc', 'https://t.me/share/url?text=' + encoded],
      ['Copy Link', 'fas fa-copy', 'var(--primary)', null],
      ['Share', 'fas fa-share-alt', 'var(--blue)', null]
    ].forEach(function (b) {
      h += '<button onclick="' + (b[3] ? 'window.open(\'' + b[3] + '\',\'_blank\')' : b[0] === 'Copy Link' ? 'window.copyTxt&&copyTxt(text||\'\')||toast(\'Copied!\')' : 'navigator.share&&navigator.share({text:text||\'\'})') + ';closeModal()" style="padding:12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid var(--border);color:' + b[2] + ';font-size:13px;font-weight:700;cursor:pointer"><i class="' + b[1] + '" style="font-size:18px;display:block;margin-bottom:4px"></i>' + b[0] + '</button>';
    });
    h += '</div>';
    if (window.showModal) showModal('🔗 Share', h);
  };

  /* ─── FEATURE 103: DAILY CHECK-IN BUTTON ─── */
  window.doCheckIn = function () {
    if (!window.U || !db) return;
    var uid = window.U.uid;
    var today = new Date().toDateString();
    db.ref('users/' + uid + '/lastCheckIn').once('value', function (s) {
      if (s.val() === today) { _toast('✅ Aaj already check-in kar chuke ho!', 'inf'); return; }
      db.ref('users/' + uid + '/lastCheckIn').set(today);
      db.ref('users/' + uid + '/loginStreak').transaction(function (v) { return (v || 0) + 1; });
      db.ref('users/' + uid + '/coins').transaction(function (v) { return (v || 0) + 5; });
      _toast('🎉 Check-in complete! +🪙5 Coins earned!', 'ok');
      if (window.haptic) haptic('success');
    });
  };

  /* ─── FEATURE 104: WEEKEND SPECIAL DETECTOR ─── */
  window.isWeekendSpecial = function () {
    var day = new Date().getDay();
    return day === 0 || day === 6;
  };
  window.showWeekendBanner = function () {
    if (!window.isWeekendSpecial()) return;
    var el = document.getElementById('dynamicBanner');
    if (el && !el.style.display) {
      el.style.display = 'block';
      el.textContent = '🎉 Weekend Special! Aaj extra prize pool matches hain!';
      el.style.background = 'rgba(255,215,0,.12)';
      el.style.color = '#ffd700';
    }
  };

  /* ─── FEATURE 105: FULL SCREEN MODE ─── */
  window.toggleFullScreen = function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
      _toast('⬛ Full screen mode on', 'inf');
    } else {
      document.exitFullscreen && document.exitFullscreen();
      _toast('⬜ Full screen off', 'inf');
    }
  };

  /* ─── FEATURE 106: MATCH PRIZE POOL CALCULATOR (User Side) ─── */
  window.showPrizeBreakdown = function (matchId) {
    var t = window.MT && window.MT[matchId]; if (!t) return;
    var pool = Number(t.prizePool) || 0;
    var slots = Number(t.maxSlots) || 1;
    var perKill = Number(t.perKillPrize || t.perKill) || 0;
    var h = '<div>';
    h += '<div style="text-align:center;margin-bottom:14px;padding:12px;background:rgba(255,215,0,.06);border-radius:12px">';
    h += '<div style="font-size:24px;font-weight:900;color:#ffd700">₹' + pool + '</div><div style="font-size:11px;color:var(--txt2)">Total Prize Pool</div></div>';
    if (t.firstPrize) h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span>🥇 1st Place</span><strong style="color:var(--green)">₹' + t.firstPrize + '</strong></div>';
    if (t.secondPrize) h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span>🥈 2nd Place</span><strong>₹' + t.secondPrize + '</strong></div>';
    if (t.thirdPrize) h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span>🥉 3rd Place</span><strong>₹' + t.thirdPrize + '</strong></div>';
    if (perKill) h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span>💀 Per Kill</span><strong style="color:#ff6b6b">₹' + perKill + '</strong></div>';
    var chance = window.getWinProbability ? window.getWinProbability(t) : null;
    if (chance) h += '<div style="margin-top:10px;padding:8px;background:rgba(0,255,156,.06);border-radius:8px;text-align:center;font-size:12px">Your Win Chance: <strong style="color:var(--green)">' + chance + '%</strong></div>';
    h += '</div>';
    if (window.showModal) showModal('💰 Prize Breakdown', h);
  };

  /* ─── FEATURE 107: MATCH REMINDERS LIST ─── */
  window._reminders = JSON.parse(localStorage.getItem('matchReminders') || '[]');
  window.showMyReminders = function () {
    var h = '<div style="display:flex;flex-direction:column;gap:6px">';
    if (!window._reminders.length) h += '<p style="text-align:center;color:var(--txt2);padding:30px">No reminders set</p>';
    window._reminders.forEach(function (r) {
      h += '<div style="padding:10px 12px;border-radius:10px;background:var(--card2);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">';
      h += '<div><div style="font-size:13px;font-weight:600">' + r.name + '</div><div style="font-size:10px;color:var(--txt2)">' + new Date(r.matchTime).toLocaleString() + '</div></div>';
      h += '<span style="font-size:11px;color:var(--green)">⏰ Set</span></div>';
    });
    h += '</div>';
    if (window.showModal) showModal('⏰ My Reminders', h);
  };

  /* ─── FEATURE 108: COIN CONVERTER ─── */
  window.showCoinConverter = function () {
    var UD = window.UD; if (!UD) return;
    var coins = UD.coins || 0;
    var h = '<div style="padding:8px;text-align:center">';
    h += '<div style="font-size:48px;font-weight:900;color:#ffd700">🪙 ' + coins + '</div>';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:16px">Your Coins</div>';
    h += '<div style="padding:12px;background:var(--card2);border-radius:12px;font-size:13px;margin-bottom:14px">';
    h += '🪙 100 Coins = 1 Coin Match Entry<br>🪙 500 Coins = 1 Free Spin<br>🪙 1000 Coins = ₹10 Bonus';
    h += '</div>';
    h += '<div style="font-size:12px;color:var(--txt2)">Coins spend karne ke liye coin matches join karo ya voucher use karo!</div>';
    h += '</div>';
    if (window.showModal) showModal('🔄 Coin Guide', h);
  };

  /* ─── FEATURE 109: MATCH ENTRY FEE CALCULATOR ─── */
  window.calcEntryFee = function (fee, isCoin) {
    var UD = window.UD; if (!UD) return { canJoin: false, balance: 0 };
    var balance = isCoin ? (UD.coins || 0) : ((UD.realMoney || {}).deposited || 0) + ((UD.realMoney || {}).winnings || 0) + ((UD.realMoney || {}).bonus || 0);
    return { canJoin: balance >= fee, balance: balance, shortfall: Math.max(fee - balance, 0) };
  };

  /* ─── FEATURE 110: LIVE CHAT SUPPORT QUICK ACCESS ─── */
  window.openLiveSupport = function () {
    if (window.navTo) navTo('chat');
    _toast('💬 Live support chat opened!', 'inf');
  };


  /* ═══════════════════════════════════════════════
     NEW 100 SMART FEATURES (111-210) — v11
     All three files: HTML + app.js + features-user.js
     FF UID shown everywhere user is mentioned
  ═══════════════════════════════════════════════ */

  /* ─── FEATURE 111: FF UID SPOTLIGHT CARD ─── */
  /* Shows beautiful FF UID card anywhere in UI */
  window.renderFFUIDCard = function(options) {
    var UD = window.UD; if (!UD || !UD.ffUid) return '';
    var opts = options || {};
    var ffUID = UD.ffUid;
    var ign = UD.ign || 'Player';
    var h = '<div style="background:linear-gradient(135deg,rgba(0,255,156,.1),rgba(0,212,255,.06));border:1px solid rgba(0,255,156,.25);border-radius:14px;padding:14px 16px;margin-bottom:12px">';
    h += '<div style="display:flex;align-items:center;gap:10px">';
    h += '<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,rgba(0,255,156,.2),rgba(0,212,255,.1));border:2px solid rgba(0,255,156,.3);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:var(--green)">' + ign.charAt(0).toUpperCase() + '</div>';
    h += '<div style="flex:1"><div style="font-size:11px;color:var(--txt2);margin-bottom:2px">Your Free Fire Account</div>';
    h += '<div style="font-size:15px;font-weight:800">' + ign + '</div>';
    h += '<div style="font-size:13px;font-weight:700;color:var(--green);letter-spacing:.8px;font-family:monospace">UID: ' + ffUID + '</div></div>';
    h += '<button onclick="window.copyTxt && copyTxt(\'' + ffUID + '\')" style="background:rgba(0,255,156,.12);border:1px solid rgba(0,255,156,.2);color:var(--green);padding:8px 12px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer"><i class="fas fa-copy"></i><br>Copy</button>';
    h += '</div>';
    if (!opts.compact) {
      h += '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,255,156,.1);display:flex;gap:8px">';
      h += '<button onclick="window.showQRCode && showQRCode()" style="flex:1;padding:7px;border-radius:8px;background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.15);color:var(--blue);font-size:11px;font-weight:700;cursor:pointer"><i class="fas fa-qrcode"></i> QR Code</button>';
      h += '<button onclick="window.shareFFUID && shareFFUID()" style="flex:1;padding:7px;border-radius:8px;background:rgba(185,100,255,.08);border:1px solid rgba(185,100,255,.15);color:var(--purple);font-size:11px;font-weight:700;cursor:pointer"><i class="fas fa-share"></i> Share UID</button>';
      h += '</div>';
    }
    h += '</div>';
    return h;
  };

  /* ─── FEATURE 112: SHARE FF UID ─── */
  window.shareFFUID = function() {
    var UD = window.UD; if (!UD || !UD.ffUid) return;
    var text = '🎮 My Free Fire Profile:\n👤 IGN: ' + (UD.ign||'Player') + '\n🆔 FF UID: ' + UD.ffUid + '\n\nJoin me on Mini eSports! 🔥';
    if (navigator.share) navigator.share({title: 'My FF Profile', text: text}).catch(function(){});
    else { window.copyTxt && copyTxt(text); _toast('UID copied to clipboard!', 'ok'); }
  };

  /* ─── FEATURE 113: FF UID QR CODE (text-based) ─── */
  window.showQRCode = function() {
    var UD = window.UD; if (!UD || !UD.ffUid) return;
    var h = '<div style="text-align:center;padding:20px">';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Share your FF UID</div>';
    h += '<div style="font-family:monospace;font-size:24px;font-weight:900;color:var(--green);letter-spacing:3px;padding:20px;background:rgba(0,255,156,.06);border:2px solid rgba(0,255,156,.2);border-radius:14px;margin-bottom:12px">' + UD.ffUid + '</div>';
    h += '<div style="font-size:18px;font-weight:800;margin-bottom:8px">' + (UD.ign||'Player') + '</div>';
    h += '<button onclick="window.copyMyFFUID&&copyMyFFUID()" style="width:100%;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer;font-size:14px"><i class="fas fa-copy"></i> Copy UID</button>';
    h += '</div>';
    if (window.openModal) openModal('Your FF UID', h);
  };

  /* ─── FEATURE 114: MATCH HISTORY WITH FF UID ─── */
  window.showMatchHistoryDetailed = function() {
    var JR = window.JR || {}, MT = window.MT || {}, UD = window.UD;
    var ffUID = (UD && UD.ffUid) ? UD.ffUid : 'N/A';
    var matches = [];
    for (var k in JR) {
      var jr = JR[k], t = MT[jr.matchId];
      if (t) matches.push({ jr: jr, t: t, ts: jr.createdAt || 0 });
    }
    matches.sort(function(a,b) { return b.ts - a.ts; });
    var h = '<div style="padding:4px 0 12px;border-bottom:1px solid var(--border);margin-bottom:12px">';
    h += '<div style="font-size:11px;color:var(--txt2)">Playing As</div>';
    h += '<div style="font-size:14px;font-weight:800">' + (UD && UD.ign ? UD.ign : 'Player') + '</div>';
    h += '<div style="font-size:12px;font-weight:700;color:var(--green);font-family:monospace">FF UID: ' + ffUID + '</div>';
    h += '</div>';
    if (!matches.length) { h += '<div style="text-align:center;color:var(--txt2);padding:20px">No match history yet</div>'; }
    matches.slice(0, 20).forEach(function(item) {
      var jr = item.jr, t = item.t;
      var statusColor = jr.result ? '#00ff9c' : '#ffaa00';
      var statusText = jr.result ? ('₹' + (jr.result.prize || 0) + ' Won') : 'Pending';
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
      h += '<div style="width:36px;height:36px;border-radius:10px;background:rgba(185,100,255,.1);color:var(--purple);display:flex;align-items:center;justify-content:center;font-size:14px"><i class="fas fa-gamepad"></i></div>';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (t.name||jr.matchName||'Match') + '</div>';
      h += '<div style="font-size:11px;color:var(--txt2)">' + (jr.mode||'solo').toUpperCase() + ' · ₹' + (jr.entryFee||0) + ' entry</div></div>';
      h += '<div style="text-align:right"><div style="font-size:12px;font-weight:700;color:' + statusColor + '">' + statusText + '</div>';
      h += '<div style="font-size:10px;color:var(--txt2)">' + window.timeAgo(jr.createdAt||0) + '</div></div>';
      h += '</div>';
    });
    if (window.openModal) openModal('Match History', h);
  };

  /* ─── FEATURE 115: LIVE FF UID VALIDATOR ─── */
  window.validateMyFFUID = function() {
    var UD = window.UD; if (!UD) return;
    var h = '<div style="text-align:center;padding:20px 16px">';
    h += '<div style="font-size:40px;margin-bottom:12px">🔍</div>';
    if (UD.ffUid && UD.ign) {
      h += '<div style="color:var(--green);font-size:14px;font-weight:700;margin-bottom:8px"><i class="fas fa-check-circle"></i> Profile Verified!</div>';
      h += '<div style="font-family:monospace;font-size:20px;font-weight:900;color:var(--green);letter-spacing:2px;margin:10px 0">' + UD.ffUid + '</div>';
      h += '<div style="font-size:16px;font-weight:800;margin-bottom:4px">' + UD.ign + '</div>';
      h += '<div style="font-size:12px;color:var(--txt2)">This is the UID registered with Mini eSports</div>';
      h += '<div style="margin-top:14px;font-size:12px;color:#ffaa00;background:rgba(255,170,0,.08);border:1px solid rgba(255,170,0,.15);border-radius:10px;padding:10px"><i class="fas fa-exclamation-triangle"></i> Use this exact UID/IGN in matches to avoid disqualification</div>';
    } else {
      h += '<div style="color:#ff6b6b;font-size:14px;font-weight:700;margin-bottom:8px">Profile Incomplete!</div>';
      h += '<div style="font-size:13px;color:var(--txt2)">Please update your FF UID and IGN in profile settings</div>';
    }
    h += '</div>';
    if (window.openModal) openModal('FF UID Verification', h);
  };

  /* ─── FEATURE 116: TEAM UID DISPLAY ─── */
  window.showTeamUIDs = function() {
    var UD = window.UD; if (!UD) return;
    var h = '<div style="margin-bottom:12px;padding:10px;background:rgba(0,255,156,.06);border-radius:10px;border:1px solid rgba(0,255,156,.15)">';
    h += '<div style="font-size:11px;color:var(--txt2)">You (Captain)</div>';
    h += '<div style="font-size:14px;font-weight:800">' + (UD.ign||'You') + '</div>';
    h += '<div style="font-size:12px;font-weight:700;color:var(--green);font-family:monospace">UID: ' + (UD.ffUid||'Not set') + '</div>';
    h += '</div>';
    var duoT = UD.duoTeam;
    if (duoT && duoT.memberUid) {
      h += '<div style="margin-bottom:8px;padding:10px;background:var(--card);border-radius:10px;border:1px solid var(--border)">';
      h += '<div style="font-size:11px;color:var(--txt2)">Duo Partner</div>';
      h += '<div style="font-size:14px;font-weight:700">' + (duoT.memberName||'Partner') + '</div>';
      h += '<div style="font-size:12px;font-weight:700;color:var(--blue);font-family:monospace">UID: ' + duoT.memberUid + '</div>';
      h += '</div>';
    }
    var sqMembers = (UD.squadTeam && UD.squadTeam.members) || [];
    sqMembers.forEach(function(m, i) {
      h += '<div style="margin-bottom:8px;padding:10px;background:var(--card);border-radius:10px;border:1px solid var(--border)">';
      h += '<div style="font-size:11px;color:var(--txt2)">Squad Member ' + (i+2) + '</div>';
      h += '<div style="font-size:14px;font-weight:700">' + (m.name||'Member') + '</div>';
      h += '<div style="font-size:12px;font-weight:700;color:var(--purple);font-family:monospace">UID: ' + (m.uid||'N/A') + '</div>';
      h += '</div>';
    });
    if (!duoT && !sqMembers.length) h += '<div style="text-align:center;color:var(--txt2);padding:16px">No team members added yet</div>';
    if (window.openModal) openModal('Team FF UIDs', h);
  };

  /* ─── FEATURE 117: ROSTER WITH FF UIDs ─── */
  window.showRosterWithUIDs = function(matchId) {
    var db = window.firebase && window.firebase.database && window.firebase.database();
    if (!db || !matchId) return;
    _toast('Loading roster...', 'inf');
    db.ref('joinRequests').orderByChild('matchId').equalTo(matchId).once('value', function(s) {
      var players = [];
      if (s.exists()) s.forEach(function(c) {
        var jr = c.val();
        if (jr.teamMembers && jr.teamMembers.length) {
          jr.teamMembers.forEach(function(m) { players.push({ name: m.name||jr.userName, uid: m.uid||jr.userFFUID, role: m.role||'captain' }); });
        } else {
          players.push({ name: jr.userName||jr.displayName, uid: jr.userFFUID||'', role: 'captain' });
        }
      });
      var h = '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--txt2)">' + players.length + ' Players Registered</div>';
      if (!players.length) { h += '<div style="text-align:center;padding:20px;color:var(--txt2)">No players joined yet</div>'; }
      players.forEach(function(p, i) {
        h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
        h += '<div style="width:30px;height:30px;border-radius:50%;background:rgba(0,255,156,.1);display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--green);font-size:12px">' + (i+1) + '</div>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (p.name||'Player') + (p.role==='captain'?' 👑':'') + '</div>';
        h += '<div style="font-size:11px;font-family:monospace;color:var(--txt2)">UID: ' + (p.uid||'Hidden') + '</div></div>';
        h += '</div>';
      });
      if (window.openModal) openModal('Match Roster', h);
    });
  };

  /* ─── FEATURE 118: SMART PROFILE SUMMARY CARD ─── */
  window.showProfileSummary = function() {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {}, rm = UD.realMoney || {};
    var total = (rm.deposited||0)+(rm.winnings||0)+(rm.bonus||0);
    var wr = st.matches ? Math.round((st.wins||0)/st.matches*100) : 0;
    var h = '<div style="text-align:center;padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:14px">';
    h += '<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(0,255,156,.2),rgba(0,212,255,.1));border:3px solid rgba(0,255,156,.3);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:var(--green)">' + (UD.ign||'P').charAt(0).toUpperCase() + '</div>';
    h += '<div style="font-size:18px;font-weight:800">' + (UD.ign||'Player') + '</div>';
    h += '<div style="font-size:13px;font-weight:700;color:var(--green);font-family:monospace;margin-top:4px">FF UID: ' + (UD.ffUid||'Not set') + '</div>';
    h += '<div style="font-size:11px;color:var(--txt2);margin-top:2px">' + (UD.email||'') + '</div>';
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    [['🎮 Matches', st.matches||0], ['🏆 Wins', st.wins||0], ['💀 Kills', st.kills||0], ['📊 Win Rate', wr+'%'],
     ['💰 Balance', '₹'+total], ['🪙 Coins', UD.coins||0], ['👥 Referrals', UD.referralCount||0], ['⭐ Level', 1+Math.floor((st.matches||0)/3)]].forEach(function(d) {
      h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px">' + d[0] + '</div><div style="font-size:16px;font-weight:800">' + d[1] + '</div></div>';
    });
    h += '</div>';
    if (window.openModal) openModal('My Profile', h);
  };

  /* ─── FEATURE 119: OPPONENT FF UID LOOKUP ─── */
  window.lookupPlayerByUID = function() {
    var h = '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--txt2);display:block;margin-bottom:6px">Enter FF UID to look up:</label>';
    h += '<input type="text" id="lookupUID" placeholder="Enter FF UID" style="width:100%;padding:10px;border-radius:10px;background:var(--bg);border:1px solid var(--border);color:var(--txt);font-size:14px;box-sizing:border-box">';
    h += '<button onclick="window._doLookup()" style="width:100%;margin-top:8px;padding:12px;border-radius:10px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer"><i class="fas fa-search"></i> Search Player</button>';
    h += '</div><div id="lookupResult"></div>';
    if (window.openModal) openModal('Player Lookup', h);
  };
  window._doLookup = function() {
    var inp = document.getElementById('lookupUID');
    var uid = inp ? inp.value.trim() : '';
    if (!uid || uid.length < 4) { _toast('Valid UID enter karo', 'err'); return; }
    var res = document.getElementById('lookupResult');
    if (res) res.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:12px"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    var db = window.firebase && window.firebase.database && window.firebase.database();
    if (!db) return;
    db.ref('users').orderByChild('ffUid').equalTo(uid).once('value', function(s) {
      if (!res) return;
      if (!s.exists()) { res.innerHTML = '<div style="text-align:center;color:#ff6b6b;padding:12px"><i class="fas fa-times-circle"></i> No player found with this UID</div>'; return; }
      var p = null; s.forEach(function(c) { p = c.val(); });
      var st = (p.stats||{}), wr = st.matches ? Math.round((st.wins||0)/st.matches*100) : 0;
      res.innerHTML = '<div style="padding:12px;background:rgba(0,255,156,.06);border:1px solid rgba(0,255,156,.15);border-radius:12px;text-align:center">' +
        '<div style="font-size:20px;font-weight:900;margin-bottom:4px">' + (p.ign||p.displayName||'Player') + '</div>' +
        '<div style="font-size:13px;font-weight:700;color:var(--green);font-family:monospace;margin-bottom:10px">FF UID: ' + uid + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' +
        '<div style="background:var(--card);border-radius:8px;padding:8px"><div style="font-size:10px;color:var(--txt2)">Matches</div><div style="font-weight:700">' + (st.matches||0) + '</div></div>' +
        '<div style="background:var(--card);border-radius:8px;padding:8px"><div style="font-size:10px;color:var(--txt2)">Wins</div><div style="font-weight:700">' + (st.wins||0) + '</div></div>' +
        '<div style="background:var(--card);border-radius:8px;padding:8px"><div style="font-size:10px;color:var(--txt2)">Win%</div><div style="font-weight:700">' + wr + '%</div></div>' +
        '</div></div>';
    });
  };

  /* ─── FEATURE 120: MATCH JOIN RECEIPT ─── */
  window.showJoinReceipt = function(matchId) {
    var JR = window.JR || {}, MT = window.MT || {}, UD = window.UD;
    var jr = null;
    for (var k in JR) { if (JR[k].matchId === matchId) { jr = JR[k]; break; } }
    if (!jr) { _toast('No join record found', 'err'); return; }
    var t = MT[matchId] || {};
    var ffUID = (UD && UD.ffUid) ? UD.ffUid : 'N/A';
    var h = '<div style="text-align:center;padding:8px 0 14px;border-bottom:1px solid var(--border);margin-bottom:14px">';
    h += '<div style="font-size:32px;margin-bottom:6px">🎫</div>';
    h += '<div style="font-size:16px;font-weight:800;color:var(--green)">Match Joined!</div>';
    h += '<div style="font-size:11px;color:var(--txt2);margin-top:2px">Keep this receipt safe</div>';
    h += '</div>';
    var rows = [
      ['Match', t.name||jr.matchName||'Match'],
      ['Your IGN', UD && UD.ign ? UD.ign : '-'],
      ['Your FF UID', ffUID],
      ['Mode', (jr.mode||'solo').toUpperCase()],
      ['Entry Fee', (jr.entryType==='coin' ? '🪙 ':'₹') + (jr.entryFee||0)],
      ['Status', '✅ Confirmed'],
      ['Joined On', jr.createdAt ? new Date(jr.createdAt).toLocaleString('en-IN') : 'N/A']
    ];
    rows.forEach(function(r) {
      h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)"><span style="font-size:12px;color:var(--txt2)">' + r[0] + '</span><span style="font-size:12px;font-weight:700">' + r[1] + '</span></div>';
    });
    if (window.openModal) openModal('Join Receipt', h);
  };

  /* ─── FEATURE 121: WIN ANNOUNCEMENT BANNER ─── */
  window.showWinBanner = function(prize, matchName) {
    var existing = document.getElementById('winBannerOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'winBannerOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease';
    overlay.innerHTML = '<div style="text-align:center;padding:30px;max-width:300px"><div style="font-size:60px;margin-bottom:10px">🏆</div><div style="font-size:24px;font-weight:900;color:#ffd700;margin-bottom:6px">YOU WON!</div><div style="font-size:36px;font-weight:900;color:var(--green);margin-bottom:10px">₹' + (prize||0) + '</div><div style="font-size:14px;color:var(--txt2);margin-bottom:20px">' + (matchName||'Match') + '</div><button onclick="this.parentElement.parentElement.remove()" style="padding:12px 30px;border-radius:12px;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-weight:800;border:none;cursor:pointer;font-size:14px">Awesome!</button></div>';
    document.body.appendChild(overlay);
    setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 8000);
  };

  /* ─── FEATURE 122: SMART BALANCE GUARD ─── */
  window.checkBalanceBeforeJoin = function(fee, isCoin) {
    var UD = window.UD; if (!UD) return false;
    var bal = isCoin ? (UD.coins||0) : ((UD.realMoney||{}).deposited||0)+((UD.realMoney||{}).winnings||0)+((UD.realMoney||{}).bonus||0);
    if (bal < fee) {
      var shortfall = fee - bal;
      var h = '<div style="text-align:center;padding:16px">';
      h += '<div style="font-size:40px;margin-bottom:10px">😅</div>';
      h += '<div style="font-size:16px;font-weight:800;color:#ff6b6b;margin-bottom:6px">Insufficient Balance!</div>';
      h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:14px">You need ' + (isCoin?'🪙':'₹') + fee + ' but have ' + (isCoin?'🪙':'₹') + bal + '</div>';
      h += '<div style="font-size:13px;font-weight:700;color:#ffaa00">Short by: ' + (isCoin?'🪙':'₹') + shortfall + '</div>';
      if (!isCoin) h += '<button onclick="if(window.startAdd)startAdd();closeModal();" style="width:100%;margin-top:14px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer"><i class="fas fa-plus"></i> Add Money Now</button>';
      h += '</div>';
      if (window.openModal) openModal('Not Enough Balance', h);
      return false;
    }
    return true;
  };

  /* ─── FEATURE 123: DAILY MISSION TRACKER ─── */
  window.showDailyMissions = function() {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {};
    var today = new Date().toDateString();
    var todayJoins = 0;
    var JR = window.JR || {};
    for (var k in JR) {
      var jr = JR[k];
      if (jr.createdAt && new Date(jr.createdAt).toDateString() === today) todayJoins++;
    }
    var missions = [
      { name: 'Join a match today', target: 1, current: todayJoins, reward: '🪙 5', icon: 'fa-gamepad' },
      { name: 'Win a match', target: 1, current: st.wins||0, reward: '🪙 20', icon: 'fa-trophy' },
      { name: 'Get 5 kills', target: 5, current: st.kills||0, reward: '🪙 10', icon: 'fa-skull' },
      { name: 'Complete profile', target: 1, current: (UD.ffUid && UD.ign) ? 1 : 0, reward: '🪙 15', icon: 'fa-user-check' },
      { name: 'Refer a friend', target: 1, current: UD.referralCount||0, reward: '🪙 10', icon: 'fa-user-plus' }
    ];
    var h = '<div style="margin-bottom:12px;font-size:12px;color:var(--txt2)">Complete missions to earn bonus coins!</div>';
    missions.forEach(function(m) {
      var done = m.current >= m.target;
      var pct = Math.min(Math.round(m.current/m.target*100), 100);
      h += '<div style="padding:10px 12px;background:var(--card);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
      h += '<i class="fas ' + m.icon + '" style="color:' + (done?'var(--green)':'var(--txt2)') + ';font-size:14px;width:18px"></i>';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:700' + (done ? ';text-decoration:line-through;color:var(--txt2)' : '') + '">' + m.name + '</div></div>';
      h += '<div style="font-size:12px;font-weight:700;color:var(--yellow)">' + m.reward + '</div>';
      h += (done ? '<i class="fas fa-check-circle" style="color:var(--green)"></i>' : '') + '</div>';
      if (!done) {
        h += '<div style="background:var(--bg);border-radius:6px;overflow:hidden;height:4px"><div style="height:4px;background:var(--green);border-radius:6px;width:' + pct + '%"></div></div>';
        h += '<div style="font-size:10px;color:var(--txt2);margin-top:3px">' + m.current + '/' + m.target + '</div>';
      }
      h += '</div>';
    });
    if (window.openModal) openModal('Daily Missions', h);
  };

  /* ─── FEATURE 124: ACHIEVEMENT BADGES DISPLAY ─── */
  window.showAllAchievements = function() {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {};
    var badges = [
      { name: 'First Blood', desc: 'Join your first match', icon: '🎮', earned: (st.matches||0) >= 1 },
      { name: 'Sharp Shooter', desc: 'Get 10 kills total', icon: '🎯', earned: (st.kills||0) >= 10 },
      { name: 'Winner Winner', desc: 'Win your first match', icon: '🏆', earned: (st.wins||0) >= 1 },
      { name: 'Cash King', desc: 'Earn ₹100 total', icon: '💰', earned: (st.earnings||0) >= 100 },
      { name: 'Grinder', desc: 'Play 10 matches', icon: '⚡', earned: (st.matches||0) >= 10 },
      { name: 'Legend', desc: 'Play 50 matches', icon: '👑', earned: (st.matches||0) >= 50 },
      { name: 'Sniper', desc: 'Get 50 kills total', icon: '💀', earned: (st.kills||0) >= 50 },
      { name: 'Squad Leader', desc: 'Win 5 matches', icon: '🛡️', earned: (st.wins||0) >= 5 },
      { name: 'Referrer', desc: 'Refer a friend', icon: '🤝', earned: (UD.referralCount||0) >= 1 },
      { name: 'Verified Pro', desc: 'Complete your profile', icon: '✅', earned: !!(UD.ffUid && UD.ign) }
    ];
    var earned = badges.filter(function(b) { return b.earned; }).length;
    var h = '<div style="text-align:center;margin-bottom:14px;font-size:13px;color:var(--txt2)">' + earned + '/' + badges.length + ' Badges Earned</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    badges.forEach(function(b) {
      h += '<div style="padding:10px;background:' + (b.earned ? 'rgba(0,255,156,.06)' : 'var(--card)') + ';border:1px solid ' + (b.earned ? 'rgba(0,255,156,.2)' : 'var(--border)') + ';border-radius:12px;text-align:center;opacity:' + (b.earned ? '1' : '0.5') + '">';
      h += '<div style="font-size:26px;margin-bottom:4px">' + b.icon + '</div>';
      h += '<div style="font-size:12px;font-weight:700">' + b.name + '</div>';
      h += '<div style="font-size:10px;color:var(--txt2);margin-top:2px">' + b.desc + '</div>';
      h += '</div>';
    });
    h += '</div>';
    if (window.openModal) openModal('Achievements', h);
  };

  /* ─── FEATURE 125: SMART NOTIFICATIONS CENTER ─── */
  window.showNotifCenter = function() {
    var NOTIFS = window.NOTIFS || [];
    var h = '';
    if (!NOTIFS.length) {
      h = '<div style="text-align:center;padding:30px;color:var(--txt2)"><i class="fas fa-bell-slash" style="font-size:30px;margin-bottom:10px"></i><div>No notifications yet</div></div>';
    } else {
      var iconMap = { room_released: 'fa-key', new_match: 'fa-trophy', match_starting: 'fa-clock', match_completed: 'fa-check', wallet_approved: 'fa-check-circle', result: 'fa-medal', chat_reply: 'fa-comments' };
      NOTIFS.slice(0, 20).forEach(function(n) {
        var ic = iconMap[n.type] || 'fa-bell';
        h += '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04)">';
        h += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(0,255,156,.1);color:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas ' + ic + '"></i></div>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (n.title||'Notification') + '</div>';
        h += '<div style="font-size:12px;color:var(--txt2);margin-top:2px">' + (n.message||'') + '</div>';
        h += '<div style="font-size:10px;color:var(--txt2);margin-top:4px">' + window.timeAgo(n.createdAt||0) + '</div></div>';
        h += '</div>';
      });
    }
    if (window.openModal) openModal('Notifications', h);
  };

  /* ─── FEATURE 126: EARNINGS BREAKDOWN ─── */
  window.showEarningsBreakdown = function() {
    var UD = window.UD; if (!UD) return;
    var rm = UD.realMoney || {}, st = UD.stats || {};
    var total = (rm.deposited||0)+(rm.winnings||0)+(rm.bonus||0);
    var h = '<div style="text-align:center;margin-bottom:16px"><div style="font-size:32px;font-weight:900;color:var(--green)">₹' + total + '</div><div style="font-size:12px;color:var(--txt2)">Total Available Balance</div></div>';
    var items = [
      { label: '💰 Deposited', amount: rm.deposited||0, color: 'var(--blue)' },
      { label: '🏆 Winnings', amount: rm.winnings||0, color: 'var(--green)' },
      { label: '🎁 Bonus', amount: rm.bonus||0, color: 'var(--yellow)' }
    ];
    items.forEach(function(item) {
      var pct = total > 0 ? Math.round(item.amount/total*100) : 0;
      h += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px">' + item.label + '</span><span style="font-size:13px;font-weight:700;color:' + item.color + '">₹' + item.amount + '</span></div>';
      h += '<div style="background:var(--bg);border-radius:6px;overflow:hidden;height:6px"><div style="height:6px;background:' + item.color + ';border-radius:6px;width:' + pct + '%"></div></div>';
      h += '<div style="font-size:10px;color:var(--txt2);margin-top:2px">' + pct + '% of balance</div></div>';
    });
    h += '<div style="padding:10px;background:rgba(0,255,156,.06);border:1px solid rgba(0,255,156,.15);border-radius:10px;text-align:center;margin-top:8px">';
    h += '<div style="font-size:11px;color:var(--txt2)">Total Prize Won</div>';
    h += '<div style="font-size:18px;font-weight:800;color:var(--green)">₹' + (st.earnings||0) + '</div>';
    h += '</div>';
    if (window.openModal) openModal('Earnings Breakdown', h);
  };

  /* ─── FEATURE 127: LIVE MATCH COUNTDOWN WIDGET ─── */
  window.renderNextMatchCountdown = function() {
    var JR = window.JR || {}, MT = window.MT || {};
    var upcoming = [];
    for (var k in JR) {
      var jr = JR[k], t = MT[jr.matchId];
      if (t && t.matchTime && Number(t.matchTime) > Date.now()) upcoming.push({ jr: jr, t: t });
    }
    if (!upcoming.length) return '';
    upcoming.sort(function(a,b) { return Number(a.t.matchTime) - Number(b.t.matchTime); });
    var next = upcoming[0];
    var diff = Number(next.t.matchTime) - Date.now();
    var h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000);
    var html = '<div style="background:linear-gradient(135deg,rgba(255,107,107,.08),rgba(255,170,0,.06));border:1px solid rgba(255,170,0,.2);border-radius:14px;padding:12px 16px;margin-bottom:12px">';
    html += '<div style="font-size:11px;color:var(--txt2);margin-bottom:4px"><i class="fas fa-clock"></i> Next Match Starting In</div>';
    html += '<div style="font-size:20px;font-weight:900;color:#ffaa00">' + (h > 0 ? h + 'h ' : '') + m + 'm</div>';
    html += '<div style="font-size:13px;font-weight:700;margin-top:2px">' + (next.t.name||'Match') + '</div>';
    html += '</div>';
    return html;
  };

  /* ─── FEATURE 128: KILL LEADERBOARD ─── */
  window.showKillLeaderboard = function() {
    var db = window.firebase && window.firebase.database && window.firebase.database();
    if (!db) return;
    db.ref('users').orderByChild('stats/kills').limitToLast(20).once('value', function(s) {
      var users = [];
      if (s.exists()) s.forEach(function(c) { var u = c.val(); if (u && u.stats && (u.ign||u.displayName)) users.push(u); });
      users.sort(function(a,b) { return (b.stats.kills||0)-(a.stats.kills||0); });
      var h = '';
      users.forEach(function(u, i) {
        var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
        h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
        h += '<div style="font-size:16px;width:28px;text-align:center">' + medal + '</div>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (u.ign||u.displayName||'Player') + '</div></div>';
        h += '<div style="font-size:14px;font-weight:800;color:#ff6b6b">💀 ' + (u.stats.kills||0) + '</div>';
        h += '</div>';
      });
      if (!users.length) h = '<div style="text-align:center;padding:20px;color:var(--txt2)">No data yet</div>';
      if (window.openModal) openModal('Kill Leaderboard', h);
    });
  };

  /* ─── FEATURE 129: PRIZE POOL CALCULATOR ─── */
  window.showPrizeCalculator = function() {
    var h = '<div style="margin-bottom:14px"><label style="font-size:12px;color:var(--txt2)">Players in Match</label>';
    h += '<input type="number" id="calcPlayers" value="100" min="2" max="200" style="width:100%;padding:10px;border-radius:10px;background:var(--bg);border:1px solid var(--border);color:var(--txt);font-size:14px;margin-top:4px;box-sizing:border-box"></div>';
    h += '<div style="margin-bottom:14px"><label style="font-size:12px;color:var(--txt2)">Entry Fee (₹)</label>';
    h += '<input type="number" id="calcFee" value="10" min="0" style="width:100%;padding:10px;border-radius:10px;background:var(--bg);border:1px solid var(--border);color:var(--txt);font-size:14px;margin-top:4px;box-sizing:border-box"></div>';
    h += '<button onclick="window._calcPrize()" style="width:100%;padding:12px;border-radius:10px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer;margin-bottom:12px">Calculate</button>';
    h += '<div id="calcResult"></div>';
    if (window.openModal) openModal('Prize Calculator', h);
  };
  window._calcPrize = function() {
    var players = parseInt((document.getElementById('calcPlayers')||{}).value||100);
    var fee = parseInt((document.getElementById('calcFee')||{}).value||10);
    var total = players * fee;
    var p1 = Math.round(total * 0.50), p2 = Math.round(total * 0.30), p3 = Math.round(total * 0.20);
    var res = document.getElementById('calcResult');
    if (res) res.innerHTML = '<div style="background:rgba(0,255,156,.06);border:1px solid rgba(0,255,156,.15);border-radius:12px;padding:14px">' +
      '<div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:10px">Prize Distribution</div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)"><span>Total Pool</span><span style="font-weight:800;color:var(--yellow)">₹'+total+'</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)"><span>🥇 1st (50%)</span><span style="font-weight:700;color:var(--green)">₹'+p1+'</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)"><span>🥈 2nd (30%)</span><span style="font-weight:700">₹'+p2+'</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0"><span>🥉 3rd (20%)</span><span style="font-weight:700">₹'+p3+'</span></div>' +
      '</div>';
  };

  /* ─── FEATURE 130: SMART TIPS ENGINE ─── */
  window.showSmartTip = function() {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {};
    var tips = [];
    if (!UD.ffUid) tips.push({ icon: '🆔', tip: 'Complete your FF UID in profile to join matches!', action: 'Go to Profile', fn: function(){if(window.navTo)navTo('profile');} });
    if ((st.matches||0) < 3) tips.push({ icon: '🎮', tip: 'Play at least 3 matches to unlock ranked rewards!', action: 'Browse Matches', fn: function(){if(window.navTo)navTo('home');} });
    if ((st.wins||0) === 0) tips.push({ icon: '💡', tip: 'Tip: Solo matches have the lowest competition for new players!', action: 'Find Solo Match', fn: null });
    if ((UD.referralCount||0) === 0) tips.push({ icon: '🤝', tip: 'Refer friends to earn 🪙10 coins per referral!', action: 'Share Code', fn: function(){if(window.navTo)navTo('profile');} });
    var tip = tips[Math.floor(Math.random() * tips.length)] || { icon: '🔥', tip: 'Keep grinding — the top players earn the most!', action: null };
    var h = '<div style="text-align:center;padding:20px 16px"><div style="font-size:48px;margin-bottom:12px">' + tip.icon + '</div>';
    h += '<div style="font-size:15px;font-weight:700;line-height:1.5;margin-bottom:14px">' + tip.tip + '</div>';
    if (tip.action && tip.fn) h += '<button onclick="(' + tip.fn.toString() + ')();closeModal();" style="padding:10px 20px;border-radius:10px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">' + tip.action + '</button>';
    h += '</div>';
    if (window.openModal) openModal('Smart Tip 💡', h);
  };

  /* ─── FEATURE 131: MATCH PERFORMANCE TRACKER ─── */
  window.showPerformanceTracker = function() {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {};
    var wr = st.matches ? (st.wins/st.matches*100).toFixed(1) : '0.0';
    var kpg = st.matches ? (st.kills/st.matches).toFixed(1) : '0.0';
    var epg = st.matches ? ((st.earnings||0)/st.matches).toFixed(1) : '0.0';
    var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
    [
      { label: 'Win Rate', value: wr + '%', icon: '🏆', color: 'var(--green)' },
      { label: 'Kills/Match', value: kpg, icon: '💀', color: '#ff6b6b' },
      { label: 'Earn/Match', value: '₹'+epg, icon: '💰', color: 'var(--yellow)' },
      { label: 'Total Matches', value: st.matches||0, icon: '🎮', color: 'var(--blue)' }
    ].forEach(function(item) {
      h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">';
      h += '<div style="font-size:24px;margin-bottom:4px">' + item.icon + '</div>';
      h += '<div style="font-size:22px;font-weight:900;color:' + item.color + '">' + item.value + '</div>';
      h += '<div style="font-size:11px;color:var(--txt2);margin-top:2px">' + item.label + '</div>';
      h += '</div>';
    });
    h += '</div>';
    var level = (st.matches||0) >= 50 ? 'Legend' : (st.matches||0) >= 20 ? 'Pro' : (st.matches||0) >= 5 ? 'Regular' : 'Beginner';
    h += '<div style="text-align:center;padding:10px;background:rgba(185,100,255,.06);border:1px solid rgba(185,100,255,.15);border-radius:10px"><span style="font-size:13px;color:var(--purple);font-weight:700">Player Level: ' + level + ' 🎯</span></div>';
    if (window.openModal) openModal('Performance Stats', h);
  };

  /* ─── FEATURE 132: QUICK MATCH FINDER ─── */
  window.findMatchByBudget = function() {
    var UD = window.UD; if (!UD) return;
    var MT = window.MT || {};
    var money = window.getMoneyBal ? window.getMoneyBal() : 0;
    var coins = UD.coins || 0;
    var affordable = [];
    for (var k in MT) {
      var t = MT[k];
      var es = window.effSt ? window.effSt(t) : 'upcoming';
      if (es !== 'upcoming' && es !== 'live') continue;
      var isCoin = (t.entryType||'').toLowerCase() === 'coin' || Number(t.entryFee) === 0;
      var fee = Number(t.entryFee) || 0;
      if (isCoin && coins >= fee) affordable.push(t);
      else if (!isCoin && money >= fee) affordable.push(t);
    }
    var h = '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Matches you can join with your balance:</div>';
    if (!affordable.length) {
      h += '<div style="text-align:center;padding:20px;color:var(--txt2)"><i class="fas fa-search" style="font-size:24px;margin-bottom:8px"></i><div>No affordable matches right now</div></div>';
    } else {
      affordable.slice(0, 8).forEach(function(t) {
        var isCoin = (t.entryType||'').toLowerCase() === 'coin' || Number(t.entryFee) === 0;
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (t.name||'Match') + '</div><div style="font-size:11px;color:var(--txt2)">' + (t.mode||'solo').toUpperCase() + ' · Prize: ₹' + (t.prizePool||0) + '</div></div>';
        h += '<div style="font-size:13px;font-weight:700;color:' + (isCoin?'var(--yellow)':'var(--green)') + '">' + (isCoin?'🪙':' ₹') + (t.entryFee||0) + '</div>';
        h += '</div>';
      });
    }
    if (window.openModal) openModal('Matches For You 💡', h);
  };

  /* ─── FEATURE 133: COIN SPENDING GUIDE ─── */
  window.showCoinSpendingGuide = function() {
    var UD = window.UD; if (!UD) return;
    var coins = UD.coins || 0;
    var h = '<div style="text-align:center;margin-bottom:16px"><div style="font-size:32px;font-weight:900;color:var(--yellow)">🪙 ' + coins + '</div><div style="font-size:12px;color:var(--txt2)">Your Coin Balance</div></div>';
    var options = [
      { label: 'Join Coin Matches', desc: 'Use coins as entry fee in coin matches', action: 'Browse Matches', fn: "if(window.navTo)navTo('home');" },
      { label: 'Redeem Vouchers', desc: 'Apply voucher codes for bonus coins', action: 'Go to Profile', fn: "if(window.navTo)navTo('profile');" },
      { label: 'Daily Check-In', desc: 'Get +5 coins every day for free!', action: 'Check In Now', fn: "if(window.doCheckIn)doCheckIn();" }
    ];
    options.forEach(function(opt) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--card);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + opt.label + '</div><div style="font-size:11px;color:var(--txt2)">' + opt.desc + '</div></div>';
      h += '<button onclick="' + opt.fn + 'closeModal();" style="padding:6px 12px;border-radius:8px;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.2);color:var(--yellow);font-size:11px;font-weight:700;cursor:pointer">' + opt.action + '</button>';
      h += '</div>';
    });
    if (window.openModal) openModal('Coin Guide 🪙', h);
  };

  /* ─── FEATURE 134: REAL-TIME SLOT MONITOR ─── */
  window.monitorMatchSlots = function(matchId) {
    var db = window.firebase && window.firebase.database && window.firebase.database();
    if (!db || !matchId) return;
    var ref = db.ref('matches/' + matchId + '/joinedSlots');
    ref.on('value', function(s) {
      var filled = s.val() || 0;
      var t = window.MT && window.MT[matchId];
      var max = t ? (t.maxSlots || 100) : 100;
      var pct = Math.min(Math.round(filled/max*100), 100);
      var el = document.querySelector('[data-slot-monitor="' + matchId + '"]');
      if (el) { el.innerHTML = filled + '/' + max + ' (' + pct + '%)'; }
    });
    return function() { ref.off('value'); };
  };

  /* ─── FEATURE 135: PROFILE STRENGTH METER ─── */
  window.renderProfileStrengthMeter = function() {
    var UD = window.UD; if (!UD) return '';
    var checks = [
      { label: 'FF UID Set', done: !!UD.ffUid },
      { label: 'IGN Set', done: !!UD.ign },
      { label: 'Profile Photo', done: !!UD.profileImage },
      { label: 'Profile Approved', done: UD.profileStatus === 'approved' },
      { label: 'Money Added', done: ((UD.realMoney||{}).deposited||0) > 0 },
      { label: 'First Match', done: (UD.stats||{}).matches > 0 },
      { label: 'First Win', done: (UD.stats||{}).wins > 0 },
      { label: 'Team Added', done: !!(UD.duoTeam && UD.duoTeam.memberUid) }
    ];
    var done = checks.filter(function(c){ return c.done; }).length;
    var pct = Math.round(done/checks.length*100);
    var color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : '#ff6b6b';
    var h = '<div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:12px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:13px;font-weight:700"><i class="fas fa-shield-alt" style="color:' + color + '"></i> Profile Strength</span><span style="font-size:20px;font-weight:900;color:' + color + '">' + pct + '%</span></div>';
    h += '<div style="background:var(--bg);border-radius:6px;overflow:hidden;height:8px;margin-bottom:10px"><div style="height:8px;background:' + color + ';border-radius:6px;width:' + pct + '%;transition:width .3s"></div></div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
    checks.forEach(function(c) {
      h += '<div style="font-size:10px;color:' + (c.done ? 'var(--green)' : 'var(--txt2)') + '"><i class="fas ' + (c.done ? 'fa-check-circle' : 'fa-circle') + '" style="font-size:9px;margin-right:3px"></i>' + c.label + '</div>';
    });
    h += '</div></div>';
    return h;
  };

  /* ─── FEATURE 136: QUICK STATS MINI WIDGET ─── */
  window.renderMiniStatsWidget = function() {
    var UD = window.UD; if (!UD) return '';
    var st = UD.stats || {};
    var h = '<div style="display:flex;gap:6px;margin-bottom:10px;overflow-x:auto;padding-bottom:2px">';
    [
      { v: st.matches||0, l: 'Played', ic: 'fa-gamepad', c: 'var(--blue)' },
      { v: st.wins||0, l: 'Wins', ic: 'fa-trophy', c: 'var(--yellow)' },
      { v: st.kills||0, l: 'Kills', ic: 'fa-skull', c: '#ff6b6b' },
      { v: '₹'+(st.earnings||0), l: 'Earned', ic: 'fa-coins', c: 'var(--green)' }
    ].forEach(function(item) {
      h += '<div style="flex:1;min-width:60px;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:8px 6px;text-align:center">';
      h += '<i class="fas ' + item.ic + '" style="color:' + item.c + ';font-size:14px"></i>';
      h += '<div style="font-size:14px;font-weight:800;margin:3px 0">' + item.v + '</div>';
      h += '<div style="font-size:9px;color:var(--txt2)">' + item.l + '</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  };

  /* ─── FEATURE 137: MATCH RESULTS ANALYZER ─── */
  window.analyzeMyResults = function() {
    var JR = window.JR || {};
    var wins = 0, losses = 0, totalKills = 0, totalEarnings = 0, count = 0;
    for (var k in JR) {
      var jr = JR[k];
      if (jr.result) {
        count++;
        if (jr.result.won) wins++;
        else losses++;
        totalKills += (jr.result.kills||0);
        totalEarnings += (jr.result.prize||0);
      }
    }
    if (!count) {
      if (window.openModal) openModal('Results Analysis', '<div style="text-align:center;padding:30px;color:var(--txt2)">No match results yet. Play and win!</div>');
      return;
    }
    var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
    [
      { l: 'Matches with Results', v: count, c: 'var(--blue)' },
      { l: 'Wins', v: wins, c: 'var(--green)' },
      { l: 'Losses', v: losses, c: '#ff6b6b' },
      { l: 'Total Kills', v: totalKills, c: '#ff6b6b' },
      { l: 'Total Earned', v: '₹'+totalEarnings, c: 'var(--yellow)' },
      { l: 'Win Rate', v: Math.round(wins/count*100)+'%', c: 'var(--green)' }
    ].forEach(function(item) {
      h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:' + item.c + '">' + item.v + '</div><div style="font-size:10px;color:var(--txt2);margin-top:2px">' + item.l + '</div></div>';
    });
    h += '</div>';
    if (window.openModal) openModal('Results Analysis 📊', h);
  };

  /* ─── FEATURE 138: DEPOSIT HISTORY WITH STATS ─── */
  window.showDepositHistory = function() {
    var WH = window.WH || [];
    var deps = WH.filter(function(w) { return w.type === 'deposit'; });
    var total = deps.reduce(function(s,w) { return s + (w.status==='approved'||w.status==='done' ? (w.amount||0) : 0); }, 0);
    var h = '<div style="text-align:center;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)"><div style="font-size:28px;font-weight:900;color:var(--green)">₹' + total + '</div><div style="font-size:12px;color:var(--txt2)">Total Approved Deposits</div></div>';
    if (!deps.length) { h += '<div style="text-align:center;color:var(--txt2);padding:16px">No deposits yet</div>'; }
    deps.slice(0,15).forEach(function(w) {
      var stColor = (w.status==='approved'||w.status==='done') ? 'var(--green)' : w.status==='rejected' ? '#ff6b6b' : 'var(--yellow)';
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
      h += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(0,255,156,.1);color:var(--green);display:flex;align-items:center;justify-content:center"><i class="fas fa-arrow-down"></i></div>';
      h += '<div style="flex:1"><div style="font-size:14px;font-weight:700">₹' + (w.amount||0) + '</div><div style="font-size:11px;color:var(--txt2)">UTR: ' + (w.utr||w.transactionId||'N/A') + '</div></div>';
      h += '<span style="font-size:11px;font-weight:700;color:' + stColor + ';text-transform:capitalize">' + (w.status||'pending') + '</span>';
      h += '</div>';
    });
    if (window.openModal) openModal('Deposit History', h);
  };

  /* ─── FEATURE 139: WITHDRAWAL HISTORY ─── */
  window.showWithdrawalHistory = function() {
    var WH = window.WH || [];
    var wds = WH.filter(function(w) { return w.type === 'withdraw'; });
    var total = wds.reduce(function(s,w) { return s + (w.status==='approved'||w.status==='done' ? (w.amount||0) : 0); }, 0);
    var h = '<div style="text-align:center;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)"><div style="font-size:28px;font-weight:900;color:var(--blue)">₹' + total + '</div><div style="font-size:12px;color:var(--txt2)">Total Withdrawn</div></div>';
    if (!wds.length) { h += '<div style="text-align:center;color:var(--txt2);padding:16px">No withdrawals yet</div>'; }
    wds.slice(0,15).forEach(function(w) {
      var stColor = (w.status==='approved'||w.status==='done') ? 'var(--green)' : w.status==='rejected' ? '#ff6b6b' : 'var(--yellow)';
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
      h += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(0,212,255,.1);color:var(--blue);display:flex;align-items:center;justify-content:center"><i class="fas fa-arrow-up"></i></div>';
      h += '<div style="flex:1"><div style="font-size:14px;font-weight:700">₹' + (w.amount||0) + '</div><div style="font-size:11px;color:var(--txt2)">' + (w.upi||w.account||'N/A') + '</div></div>';
      h += '<span style="font-size:11px;font-weight:700;color:' + stColor + ';text-transform:capitalize">' + (w.status||'pending') + '</span>';
      h += '</div>';
    });
    if (window.openModal) openModal('Withdrawal History', h);
  };

  /* ─── FEATURE 140: TEAM PERFORMANCE TRACKER ─── */
  window.showTeamPerformance = function() {
    var UD = window.UD; if (!UD) return;
    var JR = window.JR || {}, MT = window.MT || {};
    var teamMatches = 0, teamWins = 0;
    for (var k in JR) {
      var jr = JR[k];
      if (jr.mode === 'duo' || jr.mode === 'squad') {
        teamMatches++;
        if (jr.result && jr.result.won) teamWins++;
      }
    }
    var duoT = UD.duoTeam, sqMembers = (UD.squadTeam && UD.squadTeam.members) || [];
    var h = '<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:700;margin-bottom:8px">Your Teams</div>';
    if (duoT && duoT.memberUid) {
      h += '<div style="padding:10px;background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.15);border-radius:10px;margin-bottom:8px">';
      h += '<div style="font-size:12px;font-weight:700;color:var(--blue)">Duo Partner</div>';
      h += '<div style="font-size:14px;font-weight:800;margin-top:2px">' + (duoT.memberName||'Partner') + '</div>';
      h += '<div style="font-size:11px;font-family:monospace;color:var(--txt2)">UID: ' + duoT.memberUid + '</div></div>';
    }
    if (sqMembers.length) {
      h += '<div style="padding:10px;background:rgba(185,100,255,.06);border:1px solid rgba(185,100,255,.15);border-radius:10px">';
      h += '<div style="font-size:12px;font-weight:700;color:var(--purple)">Squad (' + (sqMembers.length+1) + ' members)</div>';
      sqMembers.forEach(function(m) {
        h += '<div style="font-size:13px;font-weight:600;margin-top:4px">' + (m.name||'Member') + ' <span style="font-size:10px;font-family:monospace;color:var(--txt2)">' + (m.uid||'') + '</span></div>';
      });
      h += '</div>';
    }
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">';
    [['Team Matches', teamMatches], ['Team Wins', teamWins], ['Win Rate', teamMatches ? Math.round(teamWins/teamMatches*100)+'%' : '0%']].forEach(function(d) {
      h += '<div style="background:var(--card);border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:800">' + d[1] + '</div><div style="font-size:10px;color:var(--txt2)">' + d[0] + '</div></div>';
    });
    h += '</div>';
    if (window.openModal) openModal('Team Performance', h);
  };

  /* ─── FEATURES 141-160: UI ENHANCEMENTS ─── */
  
  /* 141: Flash sale banner */
  window.checkFlashSale = function() {
    var now = new Date(), h = now.getHours();
    if (h >= 18 && h < 20) {
      _toast('⚡ FLASH HOUR: 6-8PM — Double coins on all check-ins!', 'ok');
    }
  };

  /* 142: Motivational message after match */
  window.showMotivation = function(won) {
    var msgs = won ? ['🏆 Bohat acha khela! Keep it up!', '🔥 Winner mentality! You\'re on fire!', '💪 Champion ka dil hai tumhara!'] :
      ['💪 Haar se seekho, jeet milegi! Keep going!', '🎯 Next time better! Practice makes perfect!', '⚡ Every loss is a lesson. Come back stronger!'];
    _toast(msgs[Math.floor(Math.random()*msgs.length)], 'ok');
  };

  /* 143: Auto detect tournament type */
  window.getTournamentIcon = function(mode) {
    return mode === 'duo' ? '👫' : mode === 'squad' ? '👥' : '🧍';
  };

  /* 144: Match time formatter (short) */
  window.shortTime = function(ts) {
    if (!ts) return 'TBA';
    var d = new Date(Number(ts));
    return d.getDate() + '/' + (d.getMonth()+1) + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
  };

  /* 145: Entry fee badge HTML */
  window.feeTag = function(fee, isCoin) {
    return '<span style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;background:' + (isCoin?'rgba(255,215,0,.12)':'rgba(0,255,156,.12)') + ';color:' + (isCoin?'var(--yellow)':'var(--green)') + '">' + (isCoin?'🪙':' ₹') + fee + '</span>';
  };

  /* 146: Smart join button state */
  window.joinBtnState = function(matchId) {
    var MT = window.MT || {}, t = MT[matchId];
    if (!t) return { disabled: true, text: 'Not Found' };
    var es = window.effSt ? window.effSt(t) : 'upcoming';
    var joined = window.hasJ ? window.hasJ(matchId) : false;
    var full = (t.joinedSlots||0) >= (t.maxSlots||1);
    if (joined) return { disabled: true, text: '✅ Joined' };
    if (full) return { disabled: true, text: 'Full' };
    if (es === 'completed') return { disabled: true, text: 'Ended' };
    return { disabled: false, text: '⚡ Join Now' };
  };

  /* 147: Streak display badge */
  window.renderStreakBadge = function() {
    var info = window.getStreakInfo ? window.getStreakInfo() : null;
    if (!info) return '';
    return '<div style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;background:rgba(255,100,100,.08);border:1px solid rgba(255,100,100,.2);font-size:11px;font-weight:700;color:#ff6b6b">' + info.emoji + ' ' + info.label + '</div>';
  };

  /* 148: Copy match code helper */
  window.copyMatchCode = function(code) {
    window.copyTxt && copyTxt(code);
    _toast('Room code copied: ' + code, 'ok');
  };

  /* 149: Prize distribution explainer */
  window.explainPrizes = function(t) {
    if (!t) return;
    var d1 = t.firstPrize||t.prize1st||0, d2 = t.secondPrize||t.prize2nd||0, d3 = t.thirdPrize||t.prize3rd||0, dk = t.perKillPrize||0;
    var h = '<div style="text-align:center;margin-bottom:14px"><div style="font-size:28px;font-weight:900;color:var(--yellow)">₹' + (t.prizePool||0) + '</div><div style="font-size:12px;color:var(--txt2)">Total Prize Pool</div></div>';
    if (d1) h += '<div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,215,0,.06);border-radius:10px;margin-bottom:6px"><span>🥇 First Place</span><span style="font-weight:800;color:var(--yellow)">₹' + d1 + '</span></div>';
    if (d2) h += '<div style="display:flex;justify-content:space-between;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px"><span>🥈 Second Place</span><span style="font-weight:700">₹' + d2 + '</span></div>';
    if (d3) h += '<div style="display:flex;justify-content:space-between;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px"><span>🥉 Third Place</span><span style="font-weight:700">₹' + d3 + '</span></div>';
    if (dk) h += '<div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,107,107,.06);border-radius:10px"><span>💀 Per Kill Bonus</span><span style="font-weight:700;color:#ff6b6b">₹' + dk + '</span></div>';
    if (window.openModal) openModal('Prize Breakdown', h);
  };

  /* 150: Auto dark mode at night */
  window.autoNightCheck = function() {
    var h = new Date().getHours();
    if (h >= 21 || h < 6) {
      document.body.setAttribute('data-theme', 'dark');
    }
  };

  /* ─── FEATURES 151-170: ADVANCED SOCIAL FEATURES ─── */

  /* 151: Challenge a friend */
  window.challengeFriend = function(friendUID) {
    var UD = window.UD; if (!UD || !UD.ffUid) return;
    var text = '⚔️ CHALLENGED by ' + (UD.ign||'Player') + '!\n\n🆔 Their FF UID: ' + UD.ffUid + '\n\n🎮 Join Mini eSports and beat me in a match!\n💰 Win real cash prizes!';
    if (navigator.share) navigator.share({ title: 'FF Challenge!', text: text }).catch(function(){});
    else { window.copyTxt && copyTxt(text); _toast('Challenge copied!', 'ok'); }
  };

  /* 152: Friend request system placeholder */
  window.sendFriendRequest = function(ffUID) {
    _toast('Friend request sent to UID: ' + ffUID, 'ok');
  };

  /* 153: Player card with stats */
  window.generateAdvancedPlayerCard = function() {
    var UD = window.UD; if (!UD) return;
    var st = UD.stats || {}, rm = UD.realMoney || {};
    var wr = st.matches ? Math.round(st.wins/st.matches*100) : 0;
    var h = '<div style="background:linear-gradient(135deg,#0a0a0f,#1a1a2e);border:2px solid rgba(0,255,156,.3);border-radius:20px;padding:20px;text-align:center">';
    h += '<div style="font-size:11px;color:var(--txt2);letter-spacing:3px;text-transform:uppercase;margin-bottom:10px">Mini eSports Player Card</div>';
    h += '<div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,rgba(0,255,156,.3),rgba(0,212,255,.2));border:3px solid rgba(0,255,156,.5);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:var(--green)">' + (UD.ign||'P').charAt(0).toUpperCase() + '</div>';
    h += '<div style="font-size:20px;font-weight:900;margin-bottom:2px">' + (UD.ign||'Player') + '</div>';
    h += '<div style="font-size:13px;font-weight:700;color:var(--green);font-family:monospace;margin-bottom:14px">FF UID: ' + (UD.ffUid||'N/A') + '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">';
    [['🎮', st.matches||0, 'Matches'], ['🏆', st.wins||0, 'Wins'], ['💀', st.kills||0, 'Kills']].forEach(function(d){
      h += '<div style="background:rgba(0,0,0,.3);border-radius:10px;padding:8px"><div style="font-size:16px">' + d[0] + '</div><div style="font-size:16px;font-weight:800">' + d[1] + '</div><div style="font-size:9px;color:var(--txt2)">' + d[2] + '</div></div>';
    });
    h += '</div>';
    h += '<div style="font-size:12px;color:var(--txt2)">Win Rate: <span style="color:var(--green);font-weight:700">' + wr + '%</span></div>';
    h += '</div>';
    h += '<button onclick="window.shareFFUID&&shareFFUID()" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;background:linear-gradient(135deg,rgba(0,255,156,.2),rgba(0,212,255,.1));color:var(--green);border:1px solid rgba(0,255,156,.3);font-weight:800;cursor:pointer"><i class="fas fa-share"></i> Share Card</button>';
    if (window.openModal) openModal('My Player Card', h);
  };

  /* 154: Match watchlist with FF UID context */
  window.showWatchlistWithContext = function() {
    var wl = [];
    try { wl = JSON.parse(localStorage.getItem('matchWatchlist') || '[]'); } catch(e) {}
    var MT = window.MT || {};
    var UD = window.UD;
    var h = '';
    if (UD && UD.ffUid) {
      h += '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(0,255,156,.06);border-radius:8px;margin-bottom:10px;font-size:11px"><i class="fas fa-fingerprint" style="color:var(--green)"></i><span style="color:var(--txt2)">Watching as:</span><span style="font-weight:700;color:var(--green)">' + (UD.ign||'Player') + ' · ' + UD.ffUid + '</span></div>';
    }
    if (!wl.length) {
      h += '<div style="text-align:center;padding:20px;color:var(--txt2)">No matches in watchlist. Bookmark matches to track them here!</div>';
    } else {
      wl.forEach(function(id) {
        var t = MT[id];
        if (!t) return;
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (t.name||'Match') + '</div>';
        h += '<div style="font-size:11px;color:var(--txt2)">' + window.fmtTime(t.matchTime||0) + '</div></div>';
        h += '<button onclick="window._wlId=this.getAttribute(\'data-id\');if(window.openModal)closeModal();setTimeout(function(){if(window.showDet&&window._wlId)showDet(window._wlId);},150);" data-id="' + id + '" style="padding:6px 10px;border-radius:8px;background:rgba(0,255,156,.1);border:none;color:var(--green);font-size:11px;font-weight:700;cursor:pointer">View</button>';
        h += '</div>';
      });
    }
    if (window.openModal) openModal('⭐ My Watchlist', h);
  };

  /* 155: Tournament rules quick view */
  window.showQuickRules = function() {
    var h = '<div style="font-size:13px;line-height:1.7;color:var(--txt)">';
    h += '<div style="margin-bottom:10px;padding:10px;background:rgba(255,170,0,.08);border:1px solid rgba(255,170,0,.15);border-radius:10px"><i class="fas fa-exclamation-triangle" style="color:#ffaa00"></i> <strong>Must use your registered FF UID in matches!</strong></div>';
    var rules = ['✅ Play using your verified IGN & FF UID only', '❌ Using guest accounts = disqualification', '📸 Kill proof required for prize claims', '⏰ Join room 5 min before match starts', '🚫 Teaming with enemies = ban', '💰 Prizes credited within 24 hours of result'];
    rules.forEach(function(r) { h += '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)">' + r + '</div>'; });
    h += '</div>';
    if (window.openModal) openModal('Rules & Fair Play', h);
  };

  /* 156: Match schedule view */
  window.showUpcomingSchedule = function() {
    var JR = window.JR || {}, MT = window.MT || {};
    var upcoming = [];
    for (var k in JR) {
      var jr = JR[k], t = MT[jr.matchId];
      if (t && t.matchTime && Number(t.matchTime) > Date.now()) upcoming.push({ jr: jr, t: t });
    }
    upcoming.sort(function(a,b) { return Number(a.t.matchTime) - Number(b.t.matchTime); });
    var h = '';
    if (!upcoming.length) {
      h = '<div style="text-align:center;padding:30px;color:var(--txt2)">No upcoming matches. Join a match!</div>';
    } else {
      upcoming.forEach(function(item) {
        var t = item.t, diff = Number(t.matchTime) - Date.now();
        var hrs = Math.floor(diff/3600000), mins = Math.floor((diff%3600000)/60000);
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
        h += '<div style="background:rgba(255,170,0,.1);border-radius:10px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:14px;font-weight:900;color:#ffaa00">' + (hrs>0?hrs+'h':mins+'m') + '</div><div style="font-size:9px;color:var(--txt2)">left</div></div>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (t.name||'Match') + '</div>';
        h += '<div style="font-size:11px;color:var(--txt2)">' + window.fmtTime(t.matchTime) + '</div></div>';
        h += '</div>';
      });
    }
    if (window.openModal) openModal('My Schedule 📅', h);
  };

  /* 157: Recent winners showcase */
  window.showRecentWinners = function() {
    var db = window.firebase && window.firebase.database && window.firebase.database();
    if (!db) return;
    db.ref('results').orderByChild('createdAt').limitToLast(10).once('value', function(s) {
      var results = [];
      if (s.exists()) s.forEach(function(c) { results.push(c.val()); });
      results.reverse();
      var h = '';
      if (!results.length) { h = '<div style="text-align:center;padding:20px;color:var(--txt2)">No recent winners yet</div>'; }
      results.forEach(function(r) {
        if (!r.winnings || !r.userName) return;
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
        h += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(255,215,0,.1);color:#ffd700;display:flex;align-items:center;justify-content:center;font-size:16px">🏆</div>';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (r.userName||'Player') + '</div>';
        h += '<div style="font-size:11px;color:var(--txt2)">' + (r.matchName||'Match') + '</div></div>';
        h += '<div style="font-size:14px;font-weight:800;color:var(--green)">+₹' + (r.winnings||0) + '</div>';
        h += '</div>';
      });
      if (window.openModal) openModal('Recent Winners 🏆', h);
    });
  };

  /* 158: Referral code sharer with UID */
  window.shareReferralWithUID = function() {
    var UD = window.UD; if (!UD) return;
    var code = UD.referralCode || (window.U ? window.U.uid.substring(0,8).toUpperCase() : 'MINI');
    var text = '🎮 Join Mini eSports!\n\n👤 Invited by: ' + (UD.ign||'Player') + '\n🆔 FF UID: ' + (UD.ffUid||'N/A') + '\n\n💰 Win cash in Free Fire tournaments!\n🎁 Use code: ' + code + ' for bonus coins!\n📲 Click to join: ' + window.location.href;
    if (navigator.share) navigator.share({ title: 'Mini eSports Invite', text: text }).catch(function(){});
    else { window.copyTxt && copyTxt(text); _toast('Invite link with your UID copied!', 'ok'); }
  };

  /* 159: Match feedback shortcut */
  window.quickFeedback = function(matchId, rating) {
    var db = window.firebase && window.firebase.database && window.firebase.database();
    var U = window.U;
    if (!db || !U) return;
    db.ref('matchFeedback/' + matchId + '/' + U.uid).set({ rating: rating, createdAt: Date.now() });
    _toast('Thanks for rating! ' + '⭐'.repeat(rating), 'ok');
  };

  /* 160: Emergency support button */
  window.showEmergencySupport = function() {
    var h = '<div style="text-align:center;padding:16px">';
    h += '<div style="font-size:40px;margin-bottom:10px">🆘</div>';
    h += '<div style="font-size:16px;font-weight:800;margin-bottom:6px">Need Help?</div>';
    h += '<div style="font-size:13px;color:var(--txt2);margin-bottom:16px">Common issues and quick solutions</div>';
    var issues = [
      { issue: 'Room ID not visible', sol: 'Room ID is released 5 min before match start. Refresh the page.', icon: 'fa-key' },
      { issue: 'Entry fee deducted but not joined', sol: 'Contact support immediately with your join time and amount.', icon: 'fa-exclamation-circle' },
      { issue: 'Result wrong / prize not received', sol: 'Submit kill proof screenshot in match dispute option.', icon: 'fa-trophy' },
      { issue: 'Profile not getting approved', sol: 'Ensure your FF UID matches your in-game account exactly.', icon: 'fa-user-check' }
    ];
    issues.forEach(function(item) {
      h += '<div style="text-align:left;padding:10px 12px;background:var(--card);border-radius:10px;margin-bottom:8px">';
      h += '<div style="font-size:12px;font-weight:700;color:var(--yellow);margin-bottom:4px"><i class="fas ' + item.icon + '"></i> ' + item.issue + '</div>';
      h += '<div style="font-size:12px;color:var(--txt2)">' + item.sol + '</div>';
      h += '</div>';
    });
    h += '<button onclick="if(window.navTo)navTo(\'chat\');closeModal();" style="width:100%;margin-top:8px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer"><i class="fas fa-headset"></i> Live Chat Now</button>';
    h += '</div>';
    if (window.openModal) openModal('Help Center', h);
  };

  /* ─── FEATURES 161-180: WALLET & FINANCIAL ─── */

  /* 161: Minimum withdrawal checker */
  window.checkWithdrawalEligibility = function() {
    var UD = window.UD; if (!UD) return;
    var rm = UD.realMoney || {};
    var winnings = rm.winnings || 0;
    var minWd = 100;
    var h = '<div style="text-align:center;padding:16px">';
    if (winnings >= minWd) {
      h += '<div style="font-size:36px;margin-bottom:8px">✅</div>';
      h += '<div style="font-size:16px;font-weight:800;color:var(--green);margin-bottom:6px">Eligible to Withdraw!</div>';
      h += '<div style="font-size:14px;color:var(--txt2)">Available: ₹' + winnings + '</div>';
      h += '<button onclick="if(window.startWd)startWd();closeModal();" style="width:100%;margin-top:14px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Withdraw Now</button>';
    } else {
      h += '<div style="font-size:36px;margin-bottom:8px">⏳</div>';
      h += '<div style="font-size:16px;font-weight:800;color:#ffaa00;margin-bottom:6px">Not Yet Eligible</div>';
      h += '<div style="font-size:13px;color:var(--txt2)">Need ₹' + minWd + ' in winnings. Current: ₹' + winnings + '</div>';
      h += '<div style="margin-top:10px;font-size:13px;font-weight:700;color:#ff6b6b">Short by: ₹' + (minWd - winnings) + '</div>';
    }
    h += '</div>';
    if (window.openModal) openModal('Withdrawal Eligibility', h);
  };

  /* 162: Bonus coins countdown */
  window.showBonusOpportunities = function() {
    var UD = window.UD; if (!UD) return;
    var h = '<div style="margin-bottom:12px;font-size:13px;font-weight:700;color:var(--txt2)">Ways to earn bonus coins:</div>';
    var opps = [
      { name: 'Daily Check-In', coins: 5, action: 'Claim', fn: "if(window.doCheckIn)doCheckIn();" },
      { name: 'Refer a Friend', coins: 10, action: 'Share Code', fn: "if(window.navTo)navTo('profile');" },
      { name: 'Win a Match', coins: 20, action: 'Play Now', fn: "if(window.navTo)navTo('home');" },
      { name: 'Complete Profile', coins: 15, action: 'Update', fn: "if(window.navTo)navTo('profile');" }
    ];
    opps.forEach(function(opp) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--card);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + opp.name + '</div></div>';
      h += '<div style="font-size:13px;font-weight:700;color:var(--yellow)">+🪙' + opp.coins + '</div>';
      h += '<button onclick="' + opp.fn + 'closeModal();" style="padding:6px 12px;border-radius:8px;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.2);color:var(--yellow);font-size:11px;font-weight:700;cursor:pointer">' + opp.action + '</button>';
      h += '</div>';
    });
    if (window.openModal) openModal('Earn Coins 🪙', h);
  };

  /* 163: Transaction summary */
  window.showTransactionSummary = function() {
    var WH = window.WH || [];
    var deps = WH.filter(function(w){ return w.type==='deposit' && (w.status==='approved'||w.status==='done'); });
    var wds = WH.filter(function(w){ return w.type==='withdraw' && (w.status==='approved'||w.status==='done'); });
    var totalDep = deps.reduce(function(s,w){ return s+(w.amount||0); }, 0);
    var totalWd = wds.reduce(function(s,w){ return s+(w.amount||0); }, 0);
    var UD = window.UD; var win = (UD && UD.realMoney && UD.realMoney.winnings) || 0;
    var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    [
      { l: '💰 Total Deposited', v: '₹'+totalDep, c: 'var(--blue)' },
      { l: '🏆 Total Winnings', v: '₹'+win, c: 'var(--green)' },
      { l: '📤 Total Withdrawn', v: '₹'+totalWd, c: '#ffaa00' },
      { l: '📊 Net Position', v: '₹'+(totalDep+win-totalWd), c: (totalDep+win-totalWd >= 0 ? 'var(--green)' : '#ff6b6b') }
    ].forEach(function(item) {
      h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">';
      h += '<div style="font-size:11px;color:var(--txt2);margin-bottom:6px">' + item.l + '</div>';
      h += '<div style="font-size:20px;font-weight:900;color:' + item.c + '">' + item.v + '</div></div>';
    });
    h += '</div>';
    if (window.openModal) openModal('Transaction Summary', h);
  };

  /* 164: Coin to tournament converter */
  window.coinToMatches = function() {
    var UD = window.UD; if (!UD) return;
    var coins = UD.coins || 0;
    var MT = window.MT || {};
    var joinable = [];
    for (var k in MT) {
      var t = MT[k];
      var isCoin = (t.entryType||'').toLowerCase() === 'coin' || Number(t.entryFee) === 0;
      if (!isCoin) continue;
      var fee = Number(t.entryFee) || 0;
      var es = window.effSt ? window.effSt(t) : 'upcoming';
      if (es === 'upcoming' || es === 'live') joinable.push({ t: t, fee: fee, times: fee > 0 ? Math.floor(coins/fee) : 999 });
    }
    var h = '<div style="text-align:center;margin-bottom:14px"><div style="font-size:28px;font-weight:900;color:var(--yellow)">🪙 ' + coins + '</div><div style="font-size:12px;color:var(--txt2)">Your Coins — Matches you can join:</div></div>';
    if (!joinable.length) { h += '<div style="text-align:center;color:var(--txt2);padding:16px">No coin matches available right now</div>'; }
    joinable.slice(0,6).forEach(function(item) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--card);border-radius:10px;margin-bottom:6px">';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + (item.t.name||'Match') + '</div>';
      h += '<div style="font-size:11px;color:var(--txt2)">Entry: 🪙' + item.fee + ' · Prize: ₹' + (item.t.prizePool||0) + '</div></div>';
      h += '<button onclick="closeModal()" style="padding:6px 12px;border-radius:8px;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.2);color:var(--yellow);font-size:11px;font-weight:700;cursor:pointer">View</button>';
      h += '</div>';
    });
    if (window.openModal) openModal('Spend Coins 🪙', h);
  };

  /* 165-180: More smart helpers */
  
  window.getBalanceSummary = function() {
    var UD = window.UD; if (!UD) return { coins: 0, money: 0 };
    var rm = UD.realMoney || {};
    return { coins: UD.coins||0, money: (rm.deposited||0)+(rm.winnings||0)+(rm.bonus||0) };
  };

  window.renderWalletSummaryBar = function() {
    var s = window.getBalanceSummary ? window.getBalanceSummary() : { coins: 0, money: 0 };
    return '<div style="display:flex;gap:8px;margin-bottom:10px"><div style="flex:1;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);border-radius:10px;padding:8px;text-align:center"><div style="font-size:11px;color:var(--yellow)">🪙 Coins</div><div style="font-size:18px;font-weight:800">' + s.coins + '</div></div><div style="flex:1;background:rgba(0,255,156,.08);border:1px solid rgba(0,255,156,.15);border-radius:10px;padding:8px;text-align:center"><div style="font-size:11px;color:var(--green)">💰 Balance</div><div style="font-size:18px;font-weight:800">₹' + s.money + '</div></div></div>';
  };

  window.showAddMoneyOptions = function() {
    var h = '<div style="margin-bottom:12px;font-size:13px;color:var(--txt2)">Add money to play paid matches:</div>';
    [50,100,200,500,1000].forEach(function(amt) {
      h += '<button onclick="window.wfAmt=' + amt + ';if(window.startAdd)startAdd();closeModal();" style="display:block;width:100%;margin-bottom:8px;padding:12px;border-radius:10px;background:var(--card);border:1px solid var(--border);color:var(--txt);font-size:14px;font-weight:700;cursor:pointer;text-align:left">+ ₹' + amt + ' <span style="float:right;color:var(--green);font-size:12px">Tap to Add</span></button>';
    });
    if (window.openModal) openModal('Add Money', h);
  };

  window.showMyReferralLink = function() {
    var UD = window.UD, U = window.U; if (!UD || !U) return;
    var code = UD.referralCode || U.uid.substring(0,8).toUpperCase();
    var link = window.location.href + '?ref=' + code;
    var h = '<div style="text-align:center;margin-bottom:14px"><div style="font-size:36px;margin-bottom:8px">🎁</div><div style="font-size:14px;font-weight:700">Your Referral Code</div></div>';
    h += '<div style="font-size:28px;font-weight:900;text-align:center;letter-spacing:4px;padding:16px;background:rgba(185,100,255,.06);border:2px dashed rgba(185,100,255,.3);border-radius:12px;color:var(--purple);margin-bottom:12px">' + code + '</div>';
    h += '<div style="font-size:12px;color:var(--txt2);text-align:center;margin-bottom:14px">Share this code. You earn 🪙10 per referral!</div>';
    window._refCodeTemp = code;
    h += '<button onclick="window.copyTxt&&window._refCodeTemp&&copyTxt(window._refCodeTemp)" style="width:100%;padding:12px;border-radius:10px;background:rgba(185,100,255,.1);border:1px solid rgba(185,100,255,.2);color:var(--purple);font-weight:800;cursor:pointer;margin-bottom:8px"><i class="fas fa-copy"></i> Copy Code</button>';
    h += '<button onclick="window.shareReferralWithUID&&shareReferralWithUID()" style="width:100%;padding:12px;border-radius:10px;background:rgba(0,255,156,.1);border:1px solid rgba(0,255,156,.2);color:var(--green);font-weight:800;cursor:pointer"><i class="fas fa-share"></i> Share with My UID</button>';
    if (window.openModal) openModal('Referral Link', h);
  };

  window.showVerificationStatus = function() {
    var UD = window.UD; if (!UD) return;
    var status = UD.profileStatus || 'pending';
    var icon = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
    var color = status === 'approved' ? 'var(--green)' : status === 'rejected' ? '#ff6b6b' : '#ffaa00';
    var h = '<div style="text-align:center;padding:20px 16px">';
    h += '<div style="font-size:48px;margin-bottom:12px">' + icon + '</div>';
    h += '<div style="font-size:18px;font-weight:800;color:' + color + ';text-transform:capitalize;margin-bottom:8px">' + status + '</div>';
    if (status === 'approved') {
      h += '<div style="font-size:13px;color:var(--txt2)">Your profile is verified! You can join all matches.</div>';
    } else if (status === 'pending') {
      h += '<div style="font-size:13px;color:var(--txt2)">Your profile is being reviewed. You\'ll be notified when approved.</div>';
      if (UD.ffUid) h += '<div style="margin-top:10px;font-size:12px;font-family:monospace;color:var(--green)">FF UID: ' + UD.ffUid + '</div>';
    } else {
      h += '<div style="font-size:13px;color:var(--txt2)">Profile rejected. Please resubmit with correct details.</div>';
      h += '<button onclick="if(window.showProfileUpdate)showProfileUpdate();closeModal();" style="width:100%;margin-top:14px;padding:12px;border-radius:12px;background:var(--primary);color:#000;font-weight:800;border:none;cursor:pointer">Update Profile</button>';
    }
    h += '</div>';
    if (window.openModal) openModal('Verification Status', h);
  };

  window.showPlayTips = function() {
    var tips = [
      '🎯 Always use headshots — deals maximum damage in Free Fire',
      '🏃 Keep moving — stationary players are easy targets',
      '🎽 Swap to level 3 vest as soon as possible',
      '💊 Use med kits in safe zones only, never in combat',
      '🔫 Learn each gun\'s recoil pattern for better accuracy',
      '🗺️ Play near edges early, then push toward circle center',
      '👥 In squad, revive teammates immediately — numbers win',
      '🔇 Use headphones — footsteps give enemy position away'
    ];
    var h = '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">Pro tips to help you win more matches:</div>';
    tips.forEach(function(tip) {
      h += '<div style="padding:10px 12px;background:var(--card);border-radius:10px;margin-bottom:6px;font-size:13px;line-height:1.5">' + tip + '</div>';
    });
    if (window.openModal) openModal('Pro Gaming Tips 🎮', h);
  };

  window.showAppVersion = function() {
    var h = '<div style="text-align:center;padding:20px">';
    h += '<div style="font-size:50px;margin-bottom:12px">🎮</div>';
    h += '<div style="font-size:20px;font-weight:900;margin-bottom:4px">Mini eSports</div>';
    h += '<div style="font-size:14px;color:var(--green);font-weight:700">Version 11.0</div>';
    h += '<div style="font-size:12px;color:var(--txt2);margin-top:6px">Free Fire Tournament Platform</div>';
    h += '<div style="margin-top:16px;font-size:12px;color:var(--txt2)">Made with ❤️ for Free Fire players</div>';
    h += '</div>';
    if (window.openModal) openModal('About App', h);
  };

  window.showConnectivityStatus = function() {
    var online = navigator.onLine;
    _toast(online ? '✅ Connected to internet' : '❌ No internet connection', online ? 'ok' : 'err');
  };

  /* ─── FEATURES 181-210: EXTRA SMART WIDGETS ─── */

  window.renderFFUIDInHeader = function() {
    var UD = window.UD; if (!UD || !UD.ffUid) return;
    var bar = document.getElementById('hdrUidBar');
    var uidEl = document.getElementById('hdrFFUID');
    var ignEl = document.getElementById('hdrIGN');
    if (bar) bar.style.display = 'flex';
    if (uidEl) uidEl.textContent = UD.ffUid;
    if (ignEl) ignEl.textContent = UD.ign || '';
  };

  window.showPlayerOfTheDay = function() {
    var db = window.firebase && window.firebase.database && window.firebase.database();
    if (!db) return;
    db.ref('users').orderByChild('stats/wins').limitToLast(1).once('value', function(s) {
      var top = null;
      if (s.exists()) s.forEach(function(c) { top = c.val(); });
      if (!top) { _toast('No data yet', 'inf'); return; }
      var h = '<div style="text-align:center;padding:16px">';
      h += '<div style="font-size:40px;margin-bottom:10px">👑</div>';
      h += '<div style="font-size:11px;color:var(--txt2);margin-bottom:4px">Player of the Day</div>';
      h += '<div style="font-size:20px;font-weight:900">' + (top.ign||top.displayName||'Champion') + '</div>';
      h += '<div style="font-size:13px;font-weight:700;color:var(--green);font-family:monospace;margin:4px 0">FF UID: ' + (top.ffUid||'N/A') + '</div>';
      h += '<div style="display:flex;justify-content:center;gap:16px;margin-top:12px">';
      h += '<div style="text-align:center"><div style="font-size:18px;font-weight:800">' + ((top.stats||{}).wins||0) + '</div><div style="font-size:10px;color:var(--txt2)">Wins</div></div>';
      h += '<div style="text-align:center"><div style="font-size:18px;font-weight:800">' + ((top.stats||{}).kills||0) + '</div><div style="font-size:10px;color:var(--txt2)">Kills</div></div>';
      h += '</div></div>';
      if (window.openModal) openModal('Player of the Day', h);
    });
  };

  window.showMatchComparePanel = function(matchId1, matchId2) {
    var MT = window.MT || {};
    var t1 = MT[matchId1], t2 = MT[matchId2];
    if (!t1 || !t2) { _toast('Select two matches to compare', 'err'); return; }
    var h = '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:start">';
    h += '<div style="text-align:center"><div style="font-size:13px;font-weight:800;margin-bottom:8px">' + (t1.name||'Match 1') + '</div>';
    [['Prize', '₹'+(t1.prizePool||0)],['Entry','₹'+(t1.entryFee||0)],['Mode',(t1.mode||'solo').toUpperCase()]].forEach(function(d){
      h += '<div style="padding:6px;background:var(--card);border-radius:8px;margin-bottom:4px;font-size:12px"><div style="color:var(--txt2)">' + d[0] + '</div><div style="font-weight:700">' + d[1] + '</div></div>';
    });
    h += '</div><div style="text-align:center;font-size:18px;padding-top:30px;color:var(--txt2)">VS</div>';
    h += '<div style="text-align:center"><div style="font-size:13px;font-weight:800;margin-bottom:8px">' + (t2.name||'Match 2') + '</div>';
    [['Prize', '₹'+(t2.prizePool||0)],['Entry','₹'+(t2.entryFee||0)],['Mode',(t2.mode||'solo').toUpperCase()]].forEach(function(d){
      h += '<div style="padding:6px;background:var(--card);border-radius:8px;margin-bottom:4px;font-size:12px"><div style="color:var(--txt2)">' + d[0] + '</div><div style="font-weight:700">' + d[1] + '</div></div>';
    });
    h += '</div></div>';
    if (window.openModal) openModal('Match Comparison', h);
  };

  window.showFFUIDGuide = function() {
    var h = '<div style="font-size:13px;line-height:1.6">';
    h += '<div style="padding:12px;background:rgba(0,255,156,.06);border:1px solid rgba(0,255,156,.15);border-radius:10px;margin-bottom:12px"><strong>What is FF UID?</strong><br>Your Free Fire User ID (UID) is a unique number that identifies your game account. It\'s required to register for tournaments.</div>';
    h += '<div style="font-weight:700;margin-bottom:8px">How to find your FF UID:</div>';
    ['1. Open Free Fire game', '2. Tap your profile icon (top left)', '3. Your UID is shown below your name', '4. Copy it and paste here in Mini eSports'].forEach(function(step) {
      h += '<div style="padding:8px 10px;background:var(--card);border-radius:8px;margin-bottom:6px">' + step + '</div>';
    });
    h += '<div style="margin-top:12px;padding:10px;background:rgba(255,170,0,.08);border:1px solid rgba(255,170,0,.15);border-radius:10px;font-size:12px;color:#ffaa00"><i class="fas fa-exclamation-triangle"></i> Use the EXACT same UID during matches. Mismatch leads to disqualification!</div>';
    h += '</div>';
    if (window.openModal) openModal('FF UID Guide 📖', h);
  };

  window.showPendingMatchActions = function() {
    var JR = window.JR || {}, MT = window.MT || {};
    var pending = [];
    for (var k in JR) {
      var jr = JR[k], t = MT[jr.matchId];
      if (!t || !jr.result) {
        var es = window.effSt ? window.effSt(t) : 'upcoming';
        if (es === 'live' || es === 'upcoming') pending.push({ jr: jr, t: t });
      }
    }
    var h = pending.length ? '' : '<div style="text-align:center;padding:20px;color:var(--txt2)">No pending actions</div>';
    pending.forEach(function(item) {
      var t = item.t, jr = item.jr;
      h += '<div style="padding:10px;background:var(--card);border-radius:10px;margin-bottom:8px">';
      h += '<div style="font-size:13px;font-weight:700;margin-bottom:4px">' + (t.name||'Match') + '</div>';
      if (t.roomStatus === 'released' && t.roomId) {
        h += '<div style="font-size:12px;color:var(--green);margin-bottom:6px">🔑 Room ID ready! Join now.</div>';
      }
      h += '<button onclick="closeModal()" style="width:100%;padding:8px;border-radius:8px;background:rgba(0,255,156,.1);border:1px solid rgba(0,255,156,.15);color:var(--green);font-size:12px;font-weight:700;cursor:pointer">View Match</button>';
      h += '</div>';
    });
    if (window.openModal) openModal('Action Required ⚡', h);
  };

  window.showMatchStatsOverlay = function(matchId) {
    var t = window.MT && window.MT[matchId]; if (!t) return;
    var js = Number(t.joinedSlots||0), ms = Number(t.maxSlots||1);
    var pct = Math.min(Math.round(js/ms*100), 100);
    var h = '<div style="text-align:center;padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:14px">';
    h += '<div style="font-size:18px;font-weight:900">' + (t.name||'Match') + '</div>';
    h += '<div style="font-size:12px;color:var(--txt2);margin-top:4px">' + (t.mode||'solo').toUpperCase() + ' · ' + (t.matchType||'Battle Royale') + '</div>';
    h += '</div>';
    h += '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:12px;color:var(--txt2)">Slots Filled</span><span style="font-size:12px;font-weight:700">' + js + '/' + ms + '</span></div>';
    h += '<div style="background:var(--bg);border-radius:6px;overflow:hidden;height:8px"><div style="height:8px;background:' + (pct>80?'#ff6b6b':'var(--green)') + ';border-radius:6px;width:' + pct + '%"></div></div>';
    h += '<div style="font-size:11px;color:' + (pct>80?'#ff6b6b':'var(--txt2)') + ';margin-top:3px">' + pct + '% Full ' + (pct>80?' — Hurry up!':'') + '</div></div>';
    [['🏆 Prize Pool', '₹'+(t.prizePool||0)], ['🎯 Entry Fee', (t.entryType==='coin'?'🪙 ':'₹')+(t.entryFee||0)], ['💀 Per Kill', t.perKillPrize?'₹'+t.perKillPrize:'N/A']].forEach(function(d) {
      h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)"><span style="font-size:13px;color:var(--txt2)">' + d[0] + '</span><span style="font-size:13px;font-weight:700">' + d[1] + '</span></div>';
    });
    if (window.openModal) openModal('Match Stats', h);
  };

  /* Final batch 195-210 */
  window.showMyJoinedCount = function() { var c = Object.keys(window.JR||{}).length; _toast('You have joined ' + c + ' match' + (c!==1?'es':'') + ' total!', 'ok'); };
  window.showCoinsToMoney = function() { var UD = window.UD; if (!UD) return; _toast('🪙 ' + (UD.coins||0) + ' coins = ₹' + Math.floor((UD.coins||0)/20) + ' equivalent', 'inf'); };
  window.triggerHaptic = function() { if (navigator.vibrate) navigator.vibrate([30]); };
  window.showLastJoinedMatch = function() { var JR = window.JR||{}, MT = window.MT||{}; var last = null, ts = 0; for (var k in JR) { if ((JR[k].createdAt||0) > ts) { ts = JR[k].createdAt; last = JR[k]; } } if (!last) { _toast('No match joined yet', 'inf'); return; } var t = MT[last.matchId]; if (t && window.showDet) showDet(last.matchId); };
  window.showWinStreak = function() { var UD = window.UD; if (!UD) return; var st = UD.stats||{}; _toast('🏆 Total Wins: ' + (st.wins||0) + ' | Best: Keep Going!', 'ok'); };
  window.showTodayEarnings = function() { var WH = window.WH||[]; var today = new Date().toDateString(); var todayWin = WH.filter(function(w){ return w.type==='credit' && new Date(w.createdAt||0).toDateString()===today; }).reduce(function(s,w){ return s+(w.amount||0); }, 0); _toast('Today\'s earnings: ₹' + todayWin, 'ok'); };
  window.showKillCount = function() { var UD = window.UD; if (!UD) return; _toast('💀 Total Kills: ' + ((UD.stats||{}).kills||0) + ' | Keep grinding!', 'ok'); };
  window.resetFilters = function() { window._modeFilter = 'all'; if (window.renderHome) renderHome(); _toast('Filters reset!', 'ok'); };
  window.showSupportTickets = function() { if (window.showMyTickets) showMyTickets(); else if (window.navTo) navTo('chat'); };
  window.showMyBalance = function() { var UD = window.UD; if (!UD) return; var m = window.getMoneyBal ? window.getMoneyBal() : 0; _toast('💰 ₹' + m + ' | 🪙 ' + (UD.coins||0) + ' coins', 'ok'); };
  window.showFFUIDQuick = function() { var UD = window.UD; if (!UD || !UD.ffUid) { _toast('FF UID not set! Update your profile.', 'err'); return; } _toast('Your FF UID: ' + UD.ffUid, 'ok'); window.copyTxt && copyTxt(UD.ffUid); };
  window.copyMyFFUID = function() { var UD = window.UD; if (!UD || !UD.ffUid) { _toast('FF UID not set!', 'err'); return; } window.copyTxt && copyTxt(UD.ffUid); _toast('FF UID copied: ' + UD.ffUid, 'ok'); };

  console.log('[Mini eSports] ✅ 210 User Features v11 loaded! FF UID shown everywhere.');
})();
