/* ================================================================
   MINI eSPORTS — TDS WALLET SYSTEM COMPLETE FIX v2.0
   
   Logic:
   - total_deposit = realMoney.deposited
   - total_winnings = realMoney.winnings
   - net_winnings = total_winnings − tds.tdsDeducted (jo already kata)
   
   TDS kab kata:
   ✅ Jab withdrawal pe winnings ka portion ho
   ✅ net_winnings > 0 ho
   ✅ TDS active ho admin se
   
   TDS kab NAHI kata:
   ❌ Deposit pe nahi
   ❌ Agar loss hua (net_winnings <= 0)
   ❌ Pehle se kata hua portion pe dobara nahi
   ❌ TDS off ho
   
   Formula:
   tds_total_due = net_winnings × 30%
   tds_already_paid = tds.tdsDeducted
   tds_this_time = min(tds_total_due − tds_already_paid, withdrawal_amount)
   user_gets = withdrawal_amount − tds_this_time
   ================================================================ */
(function () {
  'use strict';

  /* ── Wallet screen pe TDS info card dikhao ── */
  function showTDSInfoInWallet() {
    var UD = window.UD; var U = window.U; var db = window.db;
    if (!UD || !U || !db) return;

    var walletMain = document.getElementById('walletMain');
    if (!walletMain || walletMain.querySelector('._tdsInfoCard')) return;

    db.ref('appSettings/tdsConfig').once('value', function (cfgSnap) {
      var cfg = cfgSnap.val() || {};
      var tdsActive = cfg.active === true;

      db.ref('users/' + U.uid + '/tds').once('value', function (tdsSnap) {
        var tds = tdsSnap.val() || {};
        var winnings = Number((UD.realMoney || {}).winnings) || 0;
        var deposited = Number((UD.realMoney || {}).deposited) || 0;
        var tdsDeducted = Number(tds.tdsDeducted) || 0;

        /* net_winnings = winnings jo abhi wallet mein hain (already deducted after previous withdrawals)
           Plus jo pehle kata ja chuka */
        var totalWinningsCredited = Number(tds.winningsCredited) || winnings;
        var entryFeesPaid = Number(tds.entryFeesPaid) || 0;
        var netWinnings = Math.max(0, totalWinningsCredited - entryFeesPaid);
        var tdsOwed = Math.round(netWinnings * 0.30);
        var tdsRemaining = Math.max(0, tdsOwed - tdsDeducted);

        /* Agar koi winnings hi nahi to card mat dikhao */
        if (netWinnings <= 0 && !tdsActive) return;

        var card = document.createElement('div');
        card.className = '_tdsInfoCard';
        card.style.cssText = 'margin:8px 0;';

        var bgColor = tdsActive ? 'rgba(255,170,0,.06)' : 'rgba(0,255,156,.04)';
        var borderColor = tdsActive ? 'rgba(255,170,0,.2)' : 'rgba(0,255,156,.15)';
        var titleColor = tdsActive ? '#ffaa00' : '#00ff9c';
        var statusText = tdsActive ? '⚠️ TDS ACTIVE — Withdrawal pe 30% kattega' : '✅ TDS OFF — Poora amount milega';

        var h = '<div style="background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:14px;padding:13px">';
        h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
        h += '<span style="font-size:12px;font-weight:800;color:' + titleColor + '">💰 TDS Status</span>';
        h += '<span style="font-size:10px;color:' + titleColor + ';background:' + bgColor + ';padding:3px 8px;border-radius:20px;border:1px solid ' + borderColor + '">' + (tdsActive ? 'ACTIVE' : 'OFF') + '</span>';
        h += '</div>';
        h += '<div style="font-size:11px;color:#aaa;margin-bottom:8px">' + statusText + '</div>';

        if (netWinnings > 0) {
          h += '<div style="background:rgba(0,0,0,.2);border-radius:10px;padding:10px;font-size:12px">';
          h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#888">Kul Winnings</span><span style="color:#00ff9c;font-weight:700">₹' + netWinnings + '</span></div>';
          h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#888">TDS @30%</span><span style="color:#ffaa00;font-weight:700">₹' + tdsOwed + '</span></div>';
          h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#888">Pehle Kata</span><span style="color:#00ff9c;font-weight:700">-₹' + tdsDeducted + '</span></div>';
          if (tdsActive) {
            h += '<div style="display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid rgba(255,255,255,.08);font-weight:900"><span style="color:#fff">Baaki TDS</span><span style="color:#ff4444">₹' + tdsRemaining + '</span></div>';
          }
          h += '</div>';
        }

        if (tdsActive && tdsRemaining > 0) {
          h += '<div style="margin-top:8px;font-size:11px;color:#888">⚠️ Withdraw karte time ₹' + tdsRemaining + ' TDS katega. Aapko ₹' + Math.max(0, winnings - tdsRemaining) + ' milenge.</div>';
        }
        h += '</div>';
        card.innerHTML = h;

        /* Wallet mein add karo — balance ke baad */
        var wBal = walletMain.querySelector('.w-bal, .wallet-balance, #wBal');
        if (wBal && wBal.parentNode) {
          wBal.parentNode.insertBefore(card, wBal.nextSibling);
        } else {
          walletMain.insertBefore(card, walletMain.firstChild.nextSibling);
        }
      });
    });
  }

  /* ── startWd: TDS-aware withdrawal modal ── */
  var _origStartWd = window.startWd;
  window.startWd = function () {
    var UD = window.UD; var U = window.U; var db = window.db;
    if (!UD || !U || !db) {
      if (_origStartWd) _origStartWd();
      return;
    }

    if (window.isVO && isVO()) {
      if (window.toast) toast('Complete profile first', 'err'); return;
    }

    var rm = UD.realMoney || {};
    var win = Math.max(0, Number(rm.winnings) || 0);
    var dep = Math.max(0, Number(rm.deposited) || 0);
    var bon = Math.max(0, Number(rm.bonus) || 0);
    var withdrawable = win + dep;

    if (withdrawable <= 0) {
      if (window.toast) toast('Withdrawable balance nahi hai!', 'err'); return;
    }

    /* KYC gate */
    if (window.mesKYCGate && !window.mesKYCGate(withdrawable, null)) return;

    /* TDS calculate karo */
    db.ref('appSettings/tdsConfig').once('value', function (cfgSnap) {
      var tdsActive = (cfgSnap.val() || {}).active === true;

      db.ref('users/' + U.uid + '/tds').once('value', function (tdsSnap) {
        var tds = tdsSnap.val() || {};
        var winningsCredited = Number(tds.winningsCredited) || win;
        var entryFeesPaid = Number(tds.entryFeesPaid) || 0;
        var netWinnings = Math.max(0, winningsCredited - entryFeesPaid);
        var tdsAlreadyDeducted = Number(tds.tdsDeducted) || 0;
        var tdsTotalOwed = tdsActive ? Math.round(netWinnings * 0.30) : 0;
        var tdsPending = Math.max(0, tdsTotalOwed - tdsAlreadyDeducted);

        /* Modal banao */
        var h = '<div style="background:rgba(0,255,106,.06);border:1px solid rgba(0,255,106,.15);border-radius:12px;padding:12px;margin-bottom:12px">';
        h += '<div style="font-size:12px;font-weight:700;color:#00ff9c;margin-bottom:8px">💰 Balance Breakdown</div>';
        h += '<div style="font-size:12px">';
        h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#aaa">🏆 Winnings</span><span style="color:#00ff9c;font-weight:700">₹' + win + '</span></div>';
        h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#aaa">💳 Deposit</span><span style="font-weight:700">₹' + dep + '</span></div>';
        if (bon > 0) h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#aaa">🎁 Bonus</span><span style="color:#ffd700;font-weight:700">₹' + bon + ' (non-WD)</span></div>';
        h += '<div style="border-top:1px solid rgba(255,255,255,.1);padding-top:6px;margin-top:4px;display:flex;justify-content:space-between;font-weight:900"><span>Withdrawable</span><span style="color:#00ff9c">₹' + withdrawable + '</span></div>';
        h += '</div></div>';

        /* TDS warning agar active hai */
        if (tdsActive && tdsPending > 0) {
          h += '<div style="background:rgba(255,170,0,.08);border:1px solid rgba(255,170,0,.2);border-radius:12px;padding:12px;margin-bottom:12px">';
          h += '<div style="font-size:12px;font-weight:800;color:#ffaa00;margin-bottom:8px">⚠️ TDS Applicable — Section 194BA</div>';
          h += '<div style="font-size:11px;color:#ccc;line-height:1.8">';
          h += '<div style="display:flex;justify-content:space-between"><span>Net Winnings:</span><span style="color:#ffd700">₹' + netWinnings + '</span></div>';
          h += '<div style="display:flex;justify-content:space-between"><span>TDS @30%:</span><span style="color:#ffaa00">₹' + tdsTotalOwed + '</span></div>';
          h += '<div style="display:flex;justify-content:space-between"><span>Pehle Kata:</span><span style="color:#00ff9c">-₹' + tdsAlreadyDeducted + '</span></div>';
          h += '<div style="display:flex;justify-content:space-between;font-weight:900;border-top:1px solid rgba(255,255,255,.1);margin-top:4px;padding-top:4px"><span style="color:#fff">Baaki TDS:</span><span style="color:#ff6b6b">₹' + tdsPending + '</span></div>';
          h += '</div>';
          h += '<div style="margin-top:6px;font-size:10px;color:#888">Yeh TDS withdrawal amount se katega — deposited amount pe TDS nahi lagta.</div>';
          h += '</div>';
        }

        h += '<div class="f-group"><label>Amount (₹)</label>';
        h += '<input type="number" class="f-input" id="wdAmt" placeholder="Enter amount" min="1" max="' + withdrawable + '" oninput="window._wdUpdatePreview&&_wdUpdatePreview(this.value)">';
        h += '</div>';

        /* Live TDS preview */
        if (tdsActive && tdsPending > 0) {
          h += '<div id="_wdTdsPreview" style="background:rgba(0,0,0,.3);border-radius:10px;padding:10px;margin-bottom:10px;font-size:12px;display:none">';
          h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#aaa">Withdraw Amount:</span><span id="_wdReqAmt" style="font-weight:700">₹0</span></div>';
          h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#aaa">TDS Deduction:</span><span id="_wdTdsCut" style="color:#ff6b6b;font-weight:700">-₹0</span></div>';
          h += '<div style="display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid rgba(255,255,255,.1);font-weight:900"><span style="color:#fff">Aapko Milega:</span><span id="_wdGetAmt" style="color:#00ff9c;font-size:14px">₹0</span></div>';
          h += '</div>';
        }

        h += '<div class="f-group"><label>Your UPI ID</label>';
        h += '<input type="text" class="f-input" id="wdUpi" placeholder="yourname@upi">';
        h += '</div>';
        h += '<button class="f-btn fb-green" onclick="window._submitWdTDS&&_submitWdTDS(' + (tdsActive ? 1 : 0) + ',' + tdsPending + ',' + netWinnings + ',' + tdsAlreadyDeducted + ',' + withdrawable + ')">Request Withdrawal</button>';

        if (window.openModal) openModal('Withdraw', h);

        /* Live preview function */
        window._wdUpdatePreview = function (amt) {
          amt = Number(amt) || 0;
          var preview = document.getElementById('_wdTdsPreview');
          if (!preview) return;
          if (amt <= 0) { preview.style.display = 'none'; return; }
          preview.style.display = 'block';
          var thisTds = Math.min(tdsPending, amt);
          var gets = amt - thisTds;
          document.getElementById('_wdReqAmt').textContent = '₹' + amt;
          document.getElementById('_wdTdsCut').textContent = '-₹' + thisTds;
          document.getElementById('_wdGetAmt').textContent = '₹' + gets;
        };
      });
    });
  };

  /* ── submitWd with TDS: Full correct implementation ── */
  window._submitWdTDS = function (tdsActiveFlag, tdsPending, netWinnings, tdsAlreadyDeducted, maxWithdrawable) {
    var UD = window.UD; var U = window.U; var db = window.db;
    if (!UD || !U || !db) return;

    var amt = Number((document.getElementById('wdAmt') || {}).value) || 0;
    var upi = ((document.getElementById('wdUpi') || {}).value || '').trim();

    if (!amt || amt < 1) { if (window.toast) toast('Amount enter karo', 'err'); return; }
    if (!upi || !upi.includes('@')) { if (window.toast) toast('Valid UPI ID enter karo', 'err'); return; }
    if (amt > maxWithdrawable) { if (window.toast) toast('Insufficient balance! Max: ₹' + maxWithdrawable, 'err'); return; }

    var tdsActive = tdsActiveFlag === 1;

    /* TDS calculate karo */
    var tdsThisTime = 0;
    var userGets = amt;

    if (tdsActive && tdsPending > 0) {
      /* Sirf us amount pe TDS lagao jo winnings se ja raha hai */
      var rm = UD.realMoney || {};
      var winBal = Number(rm.winnings) || 0;
      var winPortion = Math.min(winBal, amt); /* withdrawal ka wo hissa jo winnings se hai */
      tdsThisTime = Math.min(tdsPending, winPortion); /* max tdsPending tak */
      userGets = amt - tdsThisTime;
    }

    /* Limits check */
    db.ref('appSettings/withdrawal').once('value', function (cfgSnap) {
      var cfg = cfgSnap.val() || { minAmount: 50, maxAmount: 5000 };
      var minAmt = Number(cfg.minAmount) || 50;
      var maxAmt = Number(cfg.maxAmount) || 5000;

      if (amt < minAmt) { if (window.toast) toast('Minimum ₹' + minAmt + ' withdraw karo', 'err'); return; }
      if (amt > maxAmt) { if (window.toast) toast('Maximum ₹' + maxAmt + ' per request', 'err'); return; }

      /* TDS disclosure confirm */
      if (tdsActive && tdsThisTime > 0 && !sessionStorage.getItem('_tds_confirmed')) {
        var conf = confirm('TDS ₹' + tdsThisTime + ' katega.\nAapko milega: ₹' + userGets + '\n\nProceed karna hai?');
        if (!conf) return;
        sessionStorage.setItem('_tds_confirmed', '1');
      }

      var rm = UD.realMoney || {};
      var winBal = Number(rm.winnings) || 0;
      var depBal = Number(rm.deposited) || 0;

      /* Financial year */
      var fy = (function () {
        var d = new Date();
        return d.getMonth() < 3 ? (d.getFullYear() - 1) + '-' + d.getFullYear() : d.getFullYear() + '-' + (d.getFullYear() + 1);
      })();

      var id = db.ref('walletRequests').push().key;
      var reqData = {
        requestId: id, uid: U.uid,
        userName: UD.ign || UD.displayName || '',
        displayName: UD.displayName || '',
        userEmail: UD.email || '',
        amount: amt,
        amountAfterTDS: userGets,
        tdsDeducted: tdsThisTime,
        tdsActive: tdsActive,
        upiId: upi, status: 'pending', type: 'withdraw',
        netWinningsAtTime: netWinnings,
        tdsPendingAtTime: tdsPending,
        financialYear: fy,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };

      db.ref('walletRequests/' + id).set(reqData);
      db.ref('paymentRequests/' + id).set(reqData);

      /* Balance deduct karo (full amount — winnings se pehle, phir deposit se) */
      var remaining = amt;
      var wdWin = Math.min(winBal, remaining); remaining -= wdWin;
      var wdDep = Math.min(depBal, remaining);

      if (wdWin > 0) db.ref('users/' + U.uid + '/realMoney/winnings').transaction(function (v) { return Math.max((v || 0) - wdWin, 0); });
      if (wdDep > 0) db.ref('users/' + U.uid + '/realMoney/deposited').transaction(function (v) { return Math.max((v || 0) - wdDep, 0); });

      /* wallet/winningBalance aur depositBalance bhi update karo */
      if (wdWin > 0) db.ref('users/' + U.uid + '/wallet/winningBalance').transaction(function (v) { return Math.max((v || 0) - wdWin, 0); });
      if (wdDep > 0) db.ref('users/' + U.uid + '/wallet/depositBalance').transaction(function (v) { return Math.max((v || 0) - wdDep, 0); });

      /* TDS record save karo agar applicable hai */
      if (tdsActive && tdsThisTime > 0) {
        db.ref('users/' + U.uid + '/tds/tdsDeducted').transaction(function (v) { return (v || 0) + tdsThisTime; });
        db.ref('tdsRecords').push({
          uid: U.uid, ign: UD.ign || UD.displayName || '',
          pan: ((UD.kyc || {}).panFull) || 'NOT_SUBMITTED',
          type: 'tds_deducted',
          withdrawalAmount: amt,
          tdsDeducted: tdsThisTime,
          amountPaid: userGets,
          netWinnings: netWinnings,
          upiId: upi, walletRequestId: id,
          financialYear: fy, timestamp: Date.now()
        });
        db.ref('tdsHeld').push({
          uid: U.uid, ign: UD.ign || UD.displayName || '',
          amount: tdsThisTime, walletRequestId: id,
          depositedToGovt: false, financialYear: fy, timestamp: Date.now()
        });
      }

      /* Payout log */
      db.ref('payoutLogs').push({
        uid: U.uid, ign: UD.ign || UD.displayName || '',
        amount: amt, netWinnings: netWinnings,
        tdsActive: tdsActive, tdsDeducted: tdsThisTime,
        userReceived: userGets,
        upiId: upi, financialYear: fy, timestamp: Date.now()
      });

      /* Notification */
      db.ref('users/' + U.uid + '/notifications').push({
        title: '📤 Withdrawal Request Submitted',
        message: tdsActive && tdsThisTime > 0
          ? '₹' + amt + ' ki request submit hui. TDS ₹' + tdsThisTime + ' katega, aapko ₹' + userGets + ' milega.'
          : '₹' + amt + ' ki withdrawal request submit hui! Admin 24-48 hrs mein process karega.',
        timestamp: Date.now(), read: false, type: 'withdrawal_pending'
      });

      if (window.closeModal) closeModal();
      sessionStorage.removeItem('_tds_confirmed');

      if (tdsActive && tdsThisTime > 0) {
        if (window.toast) toast('Request submitted! ₹' + userGets + ' milega (TDS: ₹' + tdsThisTime + ')', 'ok');
      } else {
        if (window.toast) toast('₹' + amt + ' withdrawal request submitted!', 'ok');
      }
    });
  };

  /* ── navTo hook: wallet screen pe TDS info show karo ── */
  var _origNavTo = window.navTo;
  if (_origNavTo) {
    window.navTo = function (scr) {
      _origNavTo.apply(this, arguments);
      if (scr === 'wallet') {
        setTimeout(showTDSInfoInWallet, 400);
      }
    };
  }

  /* Agar already wallet screen hai to bhi check karo */
  setTimeout(function () {
    if (window.curScr === 'wallet' || document.getElementById('scrWallet') && document.getElementById('scrWallet').classList.contains('active')) {
      showTDSInfoInWallet();
    }
  }, 1000);

  console.log('[Mini eSports] ✅ TDS Wallet Fix loaded');
})();
