/* ================================================================
   MINI eSPORTS — REFERRAL SYSTEM COMPLETE FIX
   - Referral Stats modal fix (REFS se live data)
   - Profile pe Refer & Earn card visible
   - Share karne ka poora flow
   ================================================================ */
(function () {
  'use strict';

  /* ── showReferralStats: REFS + Firebase se live data ── */
  window.showReferralStats = function () {
    var UD = window.UD; var U = window.U; var db = window.db;
    if (!UD || !U || !db) return;

    var myCode = UD.referralCode || U.uid.substring(0, 8).toUpperCase();
    var refCount = UD.referralCount || 0;
    var coinsEarned = UD.referralCoinsEarned || 0;

    /* Modal skeleton — data load hoga baad mein */
    var h = '<div style="padding:4px 0">';
    /* Top stats card */
    h += '<div style="background:linear-gradient(135deg,rgba(185,100,255,.12),rgba(0,255,156,.06));border:1px solid rgba(185,100,255,.25);border-radius:16px;padding:18px;text-align:center;margin-bottom:14px">';
    h += '<div style="font-size:42px;font-weight:900;color:#b964ff">' + refCount + '</div>';
    h += '<div style="font-size:13px;color:#aaa;margin-bottom:6px">Friends Referred</div>';
    h += '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.25);border-radius:20px;padding:5px 14px">';
    h += '<span style="font-size:18px">🪙</span><span style="font-size:16px;font-weight:900;color:#ffd700">' + coinsEarned + ' Coins Earned</span></div>';
    h += '</div>';

    /* My referral code box */
    h += '<div style="background:rgba(0,255,156,.06);border:1px solid rgba(0,255,156,.2);border-radius:14px;padding:14px;margin-bottom:14px">';
    h += '<div style="font-size:11px;color:#aaa;margin-bottom:6px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Mera Referral Code</div>';
    h += '<div style="display:flex;align-items:center;gap:10px">';
    h += '<div style="flex:1;font-size:22px;font-weight:900;color:#00ff9c;letter-spacing:3px">' + myCode + '</div>';
    h += '<button onclick="window._copyRefCode&&_copyRefCode()" style="padding:8px 14px;border-radius:10px;background:rgba(0,255,156,.15);border:1px solid rgba(0,255,156,.3);color:#00ff9c;font-weight:800;font-size:12px;cursor:pointer"><i class="fas fa-copy"></i> Copy</button>';
    h += '</div></div>';

    /* Share button */
    h += '<button onclick="window._shareReferral&&_shareReferral()" style="width:100%;padding:13px;border-radius:12px;background:linear-gradient(135deg,#b964ff,#7c3aed);color:#fff;font-weight:900;font-size:14px;border:none;cursor:pointer;margin-bottom:12px"><i class="fas fa-share-alt"></i> &nbsp;Share & Earn 🪙10 per Refer</button>';

    /* Referral list */
    h += '<div id="_refListBox" style="min-height:40px"><div style="text-align:center;padding:14px;color:#666;font-size:13px"><i class="fas fa-spinner fa-spin"></i> Loading...</div></div>';

    /* How it works */
    h += '<div style="background:rgba(255,255,255,.03);border-radius:12px;padding:12px;margin-top:8px">';
    h += '<div style="font-size:11px;font-weight:800;color:#555;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Kaise Kaam Karta Hai</div>';
    var steps = [
      { icon: '📤', t: 'Share karo', d: 'Apna code dosto ko share karo' },
      { icon: '📲', t: 'Friend join kare', d: 'Woh app install karke code apply kare' },
      { icon: '🪙', t: '10 Coins milenge', d: 'Har verified join pe reward milta hai' }
    ];
    steps.forEach(function (s) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0">';
      h += '<div style="font-size:20px;width:28px;text-align:center">' + s.icon + '</div>';
      h += '<div><div style="font-size:12px;font-weight:700;color:#ddd">' + s.t + '</div>';
      h += '<div style="font-size:11px;color:#666">' + s.d + '</div></div></div>';
    });
    h += '</div></div>';

    if (window.showModal) {
      showModal('🎁 Refer & Earn', h);
    } else if (window.openModal) {
      openModal('🎁 Refer & Earn', h);
    }

    /* Load referral list from Firebase */
    db.ref('referrals').orderByChild('referrerId').equalTo(U.uid).once('value', function (s) {
      var listEl = document.getElementById('_refListBox');
      if (!listEl) return;

      if (!s.exists()) {
        listEl.innerHTML = '<div style="text-align:center;padding:16px;color:#555;font-size:13px">Abhi tak koi referral nahi.<br><span style="color:#b964ff;font-weight:700">Dosto ko invite karo!</span></div>';
        return;
      }

      var refs = [];
      s.forEach(function (c) { refs.push(c.val()); });
      refs.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

      var lh = '<div style="font-size:12px;font-weight:800;color:#aaa;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Recent Referrals</div>';
      refs.slice(0, 10).forEach(function (r) {
        var dt = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '';
        lh += '<div style="display:flex;align-items:center;gap:10px;padding:9px 11px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;margin-bottom:6px">';
        lh += '<div style="width:34px;height:34px;border-radius:10px;background:rgba(185,100,255,.12);display:flex;align-items:center;justify-content:center;font-size:16px">👤</div>';
        lh += '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#e0e0f0">' + (r.referredName || 'User') + '</div>';
        lh += '<div style="font-size:10px;color:#555">' + dt + '</div></div>';
        lh += '<div style="font-size:13px;font-weight:800;color:' + (r.verified ? '#ffd700' : '#ffaa00') + '">' + (r.verified ? '+🪙10' : '⏳') + '</div>';
        lh += '</div>';
      });
      listEl.innerHTML = lh;
    });
  };

  /* Copy referral code */
  window._copyRefCode = function () {
    var UD = window.UD; var U = window.U;
    if (!UD || !U) return;
    var code = UD.referralCode || U.uid.substring(0, 8).toUpperCase();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(function () {
        if (window.toast) toast('✅ Code copied: ' + code, 'ok');
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      if (window.toast) toast('✅ Code copied: ' + code, 'ok');
    }
  };

  /* Share referral link */
  window._shareReferral = function () {
    var UD = window.UD; var U = window.U;
    if (!UD || !U) return;
    var code = UD.referralCode || U.uid.substring(0, 8).toUpperCase();
    var msg = '🎮 Mini eSports — Free Fire Tournament App!\n\n' +
      '💰 Real Cash Prizes Jeeto!\n' +
      '🪙 Join karo FREE coins pao!\n\n' +
      '👉 Mera Referral Code: ' + code + '\n' +
      '📲 App: ' + window.location.origin;
    if (navigator.share) {
      navigator.share({ title: 'Mini eSports - Refer & Earn', text: msg }).catch(function () {
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
      });
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    }
  };

  /* ── applyReferralCode: Complete fixed version ── */
  window.applyReferralCode = function () {
    var UD = window.UD; var U = window.U; var db = window.db;
    if (!UD || !U || !db) return;

    /* Agar already referred hai to block karo */
    if (UD.referredBy) {
      if (window.toast) toast('Tum pehle se ek referral code use kar chuke ho!', 'err');
      return;
    }

    var inp = document.getElementById('applyRefInput');
    var code = inp ? inp.value.trim().toUpperCase() : '';
    if (!code || code.length < 4) {
      if (window.toast) toast('Valid referral code enter karo', 'err'); return;
    }
    var myCode = UD.referralCode || U.uid.substring(0, 8).toUpperCase();
    if (code === myCode) {
      if (window.toast) toast('Apna code nahi laga sakte!', 'err'); return;
    }

    /* Admin se reward amount lo */
    db.ref('appSettings/referralReward').once('value', function (rSnap) {
      var rewardCoins = rSnap.val() || 10;

      /* Code se referrer dhundo */
      db.ref('users').orderByChild('referralCode').equalTo(code).once('value', function (s) {
        if (!s.exists()) {
          if (window.toast) toast('Yeh referral code nahi mila!', 'err'); return;
        }
        var referrerUid = null;
        s.forEach(function (c) { referrerUid = c.key; });
        if (!referrerUid || referrerUid === U.uid) {
          if (window.toast) toast('Invalid code!', 'err'); return;
        }

        /* Current user ko mark karo — referred */
        db.ref('users/' + U.uid).update({ referredBy: referrerUid, referredByCode: code });

        /* Referrer ko reward do */
        db.ref('users/' + referrerUid + '/referralCount').transaction(function (v) { return (v || 0) + 1; });
        db.ref('users/' + referrerUid + '/referralCoinsEarned').transaction(function (v) { return (v || 0) + rewardCoins; });
        db.ref('users/' + referrerUid + '/coins').transaction(function (v) { return (v || 0) + rewardCoins; });

        /* Referral record Firebase mein save karo */
        var rrid = db.ref('referrals').push().key;
        db.ref('referrals/' + rrid).set({
          referrerId: referrerUid,
          referredUid: U.uid,
          referredName: UD.ign || UD.displayName || 'User',
          referrerIgn: '',
          code: code,
          reward: rewardCoins,
          verified: true,
          createdAt: Date.now()
        });

        /* Referrer ko IGN fetch karke record update karo */
        db.ref('users/' + referrerUid + '/ign').once('value', function (ignSnap) {
          db.ref('referrals/' + rrid + '/referrerIgn').set(ignSnap.val() || '');
        });

        /* Referrer ko notification bhejo */
        db.ref('users/' + referrerUid + '/notifications').push({
          title: '🎁 Referral Reward!',
          message: (UD.ign || UD.displayName || 'Koi') + ' ne tumhara code use kiya! +' + rewardCoins + ' 🪙 coins mile!',
          timestamp: Date.now(), read: false, type: 'referral'
        });

        if (window.toast) toast('✅ Code apply hua! Tumhare dost ko 🪙' + rewardCoins + ' coins milenge!', 'ok');
        if (window.renderProfile) renderProfile();
        if (window.closeModal) closeModal();
      });
    });
  };

  /* ── Referral card profile mein add karo ── */
  function addReferralCardToProfile() {
    var pc = document.getElementById('profileContent');
    if (!pc || pc.querySelector('._refCard')) return;
    var UD = window.UD; var U = window.U;
    if (!UD || !U) return;

    var myCode = UD.referralCode || U.uid.substring(0, 8).toUpperCase();
    var hasReferred = !!UD.referredBy;
    var refCount = UD.referralCount || 0;
    var coinsEarned = UD.referralCoinsEarned || 0;

    var card = document.createElement('div');
    card.className = '_refCard';
    card.style.cssText = 'margin:0 0 8px';

    /* Referral Earn card */
    var html = '<div style="border-radius:16px;background:linear-gradient(135deg,rgba(185,100,255,.1),rgba(121,40,202,.05));border:1px solid rgba(185,100,255,.25);padding:14px;cursor:pointer" onclick="window.showReferralStats&&showReferralStats()">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
    html += '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">🎁</span><span style="font-size:14px;font-weight:800;color:#b964ff">Refer & Earn</span></div>';
    html += '<i class="fas fa-chevron-right" style="color:#b964ff;font-size:13px"></i></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
    html += '<div style="background:rgba(0,0,0,.2);border-radius:10px;padding:8px;text-align:center">';
    html += '<div style="font-size:20px;font-weight:900;color:#b964ff">' + refCount + '</div>';
    html += '<div style="font-size:10px;color:#666">Friends Referred</div></div>';
    html += '<div style="background:rgba(0,0,0,.2);border-radius:10px;padding:8px;text-align:center">';
    html += '<div style="font-size:20px;font-weight:900;color:#ffd700">🪙' + coinsEarned + '</div>';
    html += '<div style="font-size:10px;color:#666">Coins Earned</div></div></div>';

    /* My code display */
    html += '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.2);border-radius:10px;padding:8px 12px">';
    html += '<span style="font-size:11px;color:#888">Mera Code:</span>';
    html += '<span style="font-size:16px;font-weight:900;color:#00ff9c;letter-spacing:2px">' + myCode + '</span>';
    html += '<button onclick="event.stopPropagation();window._copyRefCode&&_copyRefCode()" style="background:rgba(0,255,156,.15);border:1px solid rgba(0,255,156,.3);color:#00ff9c;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">Copy</button>';
    html += '</div>';

    /* Agar referred nahi kiya to code apply section */
    if (!hasReferred) {
      html += '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.06);padding-top:10px">';
      html += '<div style="font-size:11px;color:#888;margin-bottom:6px">Kisi ne invite kiya? Code apply karo:</div>';
      html += '<div style="display:flex;gap:8px">';
      html += '<input type="text" id="applyRefInput" placeholder="Referral code dalo" style="flex:1;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:13px;font-weight:700;outline:none;text-transform:uppercase">';
      html += '<button onclick="window.applyReferralCode&&applyReferralCode()" style="padding:9px 14px;border-radius:10px;background:linear-gradient(135deg,#b964ff,#7c3aed);border:none;color:#fff;font-weight:800;font-size:13px;cursor:pointer">Apply</button>';
      html += '</div></div>';
    }
    html += '</div>';
    card.innerHTML = html;

    /* Profile mein add karo — settings card ke pehle */
    var settingsCard = pc.querySelector('[onclick*="showProfileSettings"]');
    if (settingsCard && settingsCard.parentNode) {
      settingsCard.parentNode.insertBefore(card, settingsCard);
    } else {
      pc.appendChild(card);
    }
  }

  /* renderProfile ke baad hook karo */
  function hookRenderProfile() {
    var orig = window.renderProfile;
    if (!orig || window._refSysHooked) return;
    window._refSysHooked = true;
    window.renderProfile = function () {
      orig.apply(this, arguments);
      setTimeout(addReferralCardToProfile, 150);
    };
  }

  /* Check karo jab renderProfile available ho */
  var _t = 0;
  var _iv = setInterval(function () {
    _t++;
    if (window.renderProfile) { clearInterval(_iv); hookRenderProfile(); }
    if (_t > 40) clearInterval(_iv);
  }, 300);

  console.log('[Mini eSports] ✅ Referral System Fix loaded');
})();
