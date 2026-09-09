/* ═══════════════════════════════════════════════════════
   ZINHO — Assistente do Painel Zaya
   Aparece em momentos aleatorios, nunca insiste,
   sempre disponivel pelo icone de chamada.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = window.zayaPanel || {};
  if (CFG.robot === false) return; // Global dormindo (wp-admin)

  var LS_COOLDOWN = 'zinho_cooldown_until';
  var MIN_WAIT = 40 * 1000;
  var MAX_WAIT = 5 * 60 * 1000;
  var REFUSAL_WAIT = 10 * 60 * 1000;
  var NO_ANSWER_MS = 22000;

  var INVITE = 'Oi, {NOME}! Eu sou o Zinho, seu assistente aqui do painel. Posso te enviar mensagens de incentivo enquanto voc\u00ea trabalha. Quer experimentar?';
  var FAREWELLS = [
    'Tudo bem! Estou aqui quando precisar \uD83E\uDD16',
    'Sem problemas! Volto depois \uD83D\uDC4B',
    'Beleza, me chama quando quiser! \u2728'
  ];

  var nome = (CFG.userName || '').split(' ')[0] || '';
  var host = null;          // container fixo
  var balloon = null;
  var appearTimer = null;
  var hideTimer = null;
  var typeTimer = null;

  function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function cooldownActive() {
    try {
      var until = parseInt(localStorage.getItem(LS_COOLDOWN) || '0', 10);
      return Date.now() < until;
    } catch (e) { return false; }
  }
  function setCooldown(ms) {
    try { localStorage.setItem(LS_COOLDOWN, String(Date.now() + ms)); } catch (e) {}
  }

  function fillInvite(text) {
    return text.replace('{NOME}', nome);
  }

  /* ── MARKUP ── */
  function build() {
    host = document.createElement('div');
    host.id = 'zinho';
    host.innerHTML =
      '<div class="zin-stars" aria-hidden="true">' +
        '<svg class="zin-star s1" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.4l-6.3 4.6L8 13.8 2 9.2h7.6z"/></svg>' +
        '<svg class="zin-star s2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.4l-6.3 4.6L8 13.8 2 9.2h7.6z"/></svg>' +
        '<svg class="zin-star s3" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.4l-6.3 4.6L8 13.8 2 9.2h7.6z"/></svg>' +
      '</div>' +
      '<div class="zin-balloon" id="zin-balloon">' +
        '<div class="zin-bal-text" id="zin-bal-text"></div>' +
        '<div class="zin-bal-actions" id="zin-bal-actions"></div>' +
      '</div>' +
      '<button type="button" class="zin-body" id="zin-body" aria-label="Zinho, assistente">' +
        '<svg viewBox="0 0 76 76" width="64" height="64">' +
          '<defs><radialGradient id="zinFace" cx=".35" cy=".3" r="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eaf4ff"/></radialGradient><linearGradient id="zinBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe3ee"/></linearGradient></defs>' +
          '<line class="zin-ant-stem" x1="38" y1="9" x2="38" y2="18" stroke="#d4af37" stroke-width="2.4" stroke-linecap="round"/>' +
          '<circle class="zin-ant" cx="38" cy="7.5" r="4"/>' +
          '<circle class="zin-ant-glow" cx="38" cy="7.5" r="7.5"/>' +
          '<rect x="11" y="18" width="54" height="46" rx="17" fill="url(#zinBody)" stroke="#FF3380" stroke-width="1.6"/>' +
          '<rect x="17.5" y="25" width="41" height="30" rx="13" fill="url(#zinFace)" stroke="#bcd9f2" stroke-width="1"/>' +
          '<rect class="zin-ear zin-ear-l" x="6" y="34" width="7" height="14" rx="3.5" fill="#7ec8ff" stroke="#FF3380" stroke-width="1.2"/>' +
          '<rect class="zin-ear zin-ear-r" x="63" y="34" width="7" height="14" rx="3.5" fill="#7ec8ff" stroke="#FF3380" stroke-width="1.2"/>' +
          '<g class="zin-eye-l"><circle cx="29" cy="39" r="5.2" fill="#1d3a5f"/><circle class="zin-shine" cx="30.6" cy="37.4" r="1.7" fill="#fff"/><circle cx="27.6" cy="40.8" r=".9" fill="#fff" opacity=".8"/></g>' +
          '<g class="zin-eye-r"><circle cx="47" cy="39" r="5.2" fill="#1d3a5f"/><circle class="zin-shine" cx="48.6" cy="37.4" r="1.7" fill="#fff"/><circle cx="45.6" cy="40.8" r=".9" fill="#fff" opacity=".8"/></g>' +
          '<circle class="zin-cheek zin-cheek-l" cx="23.5" cy="47.5" r="3.6" fill="#FF3380" opacity=".28"/>' +
          '<circle class="zin-cheek zin-cheek-r" cx="52.5" cy="47.5" r="3.6" fill="#FF3380" opacity=".28"/>' +
          '<path class="zin-mouth" d="M32.5 48.5 q5.5 5 11 0" stroke="#1d3a5f" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
          '<rect x="26" y="56.5" width="24" height="3.4" rx="1.7" fill="#7ec8ff" opacity=".9"/>' +
          '<g class="zin-arm" id="zin-arm-wave"><path d="M64 44 q9 -2 11 -10" stroke="#FF3380" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="75.5" cy="32.5" r="3.6" fill="#fff" stroke="#FF3380" stroke-width="1.4"/></g>' +
          '<path d="M12 46 q-8 2 -9 9" stroke="#FF3380" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="3.5" cy="56" r="3.6" fill="#fff" stroke="#FF3380" stroke-width="1.4"/>' +
        '</svg>' +
      '</button>';
    document.body.appendChild(host);

    balloon = host.querySelector('#zin-balloon');
    host.querySelector('#zin-body').addEventListener('click', onBodyClick);
    document.addEventListener('mousemove', onMousemove);
    scheduleBlink();
  }

  /* ── Olhos seguem o cursor ── */
  var movePending = false;
  function onMousemove(ev) {
    if (movePending || !host || !host.classList.contains('is-visible')) return;
    movePending = true;
    requestAnimationFrame(function () {
      movePending = false;
      var bodyEl = host.querySelector('#zin-body');
      if (!bodyEl) return;
      var rect = bodyEl.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height * 0.45;
      var dx = ev.clientX - cx, dy = ev.clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var max = 2.6;
      var ux = (dx / dist) * Math.min(dist / 60, 1) * max;
      var uy = (dy / dist) * Math.min(dist / 60, 1) * max;
      var l = host.querySelector('.zin-eye-l'), r = host.querySelector('.zin-eye-r');
      [l, r].forEach(function (g) {
        if (!g) return;
        g.style.transition = 'transform .15s ease';
        g.style.transform = 'translate(' + ux.toFixed(1) + 'px,' + uy.toFixed(1) + 'px)';
      });
    });
  }

  /* ── Piscada organica (3-5s) ── */
  function scheduleBlink() {
    setTimeout(function () {
      host.classList.add('is-blinking');
      setTimeout(function () { host.classList.remove('is-blinking'); }, 260);
      scheduleBlink();
    }, rand(3000, 5000));
  }

  /* ── Balao com efeito de digitacao ── */
  function typeText(el, text, done) {
    if (typeTimer) clearInterval(typeTimer);
    el.textContent = '';
    el.classList.add('is-typing');
    host.classList.add('is-talking');
    var i = 0;
    typeTimer = setInterval(function () {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typeTimer);
        el.classList.remove('is-typing');
        host.classList.remove('is-talking');
        if (done) done();
      }
    }, 34);
  }

  /* ── Aparecer ── */
  function appear(mode) {
    if (!host || host.classList.contains('is-visible')) return;
    build();
    host = document.getElementById('zinho');
    balloon = host.querySelector('#zin-balloon');
    host.classList.add('is-visible', 'is-entering');

    var actions = host.querySelector('#zin-bal-actions');
    actions.innerHTML = '';

    if (mode === 'invite') {
      typeText(balloon.querySelector('#zin-bal-text'), fillInvite(pick(INVITES)));
      var yes = document.createElement('button');
      yes.type = 'button'; yes.className = 'zin-btn zin-btn-yes'; yes.textContent = 'Quero! \u2728';
      var no = document.createElement('button');
      no.type = 'button'; no.className = 'zin-btn zin-btn-no'; no.textContent = 'Agora n\u00e3o';
      yes.onclick = function () { accept(); };
      no.onclick = function () { refuse(); };
      actions.appendChild(yes); actions.appendChild(no);
    } else if (mode === 'conselho') {
      typeText(balloon.querySelector('#zin-bal-text'), pick(CFG.phrases || ['Respire fundo e siga em frente!']));
      actions.appendChild((function () {
        var ok = document.createElement('button');
        ok.type = 'button'; ok.className = 'zin-btn zin-btn-yes'; ok.textContent = 'Obrigado!';
        ok.onclick = function () { farewell(false); };
        return ok;
      })());
    } else if (mode === 'farewell') {
      typeText(balloon.querySelector('#zin-bal-text'), pick(FAREWELLS));
    }

    clearTimeout(hideTimer);
    if (mode === 'invite') {
      hideTimer = setTimeout(function () { farewell(true); }, NO_ANSWER_MS);
    } else if (mode === 'conselho') {
      hideTimer = setTimeout(function () { farewell(false); }, 9000);
    } else {
      hideTimer = setTimeout(function () { farewell(false); }, 3200);
    }
  }

  function accept() {
    clearTimeout(hideTimer);
    host.classList.add('is-happy');
    setTimeout(function () { host.classList.remove('is-happy'); }, 1200);
    var actions = host.querySelector('#zin-bal-actions');
    if (actions) actions.innerHTML = '';
    typeText(balloon.querySelector('#zin-bal-text'), pick(CFG.phrases || ['Voc\u00ea \u00e9 incr\u00edvel!']), function () {
      /* Apos o conselho: acoes claras em vez de sumir sem avisar */
      if (actions) {
        actions.innerHTML = '';
        var outra = document.createElement('button');
        outra.type = 'button'; outra.className = 'zin-btn zin-btn-yes'; outra.textContent = 'Outra mensagem';
        outra.onclick = function () { accept(); };
        var fechar = document.createElement('button');
        fechar.type = 'button'; fechar.className = 'zin-btn zin-btn-no'; fechar.textContent = 'Fechar';
        fechar.onclick = function () { farewell(false); };
        actions.appendChild(outra); actions.appendChild(fechar);
      }
    });
  }

  function refuse() {
    clearTimeout(hideTimer);
    host.classList.add('is-bye');
    var actions = host.querySelector('#zin-bal-actions');
    if (actions) actions.innerHTML = '';
    typeText(balloon.querySelector('#zin-bal-text'), pick(FAREWELLS));
    setCooldown(REFUSAL_WAIT);
    hideTimer = setTimeout(function () { disappear(); }, 2800);
  }

  function farewell(fromNoAnswer) {
    clearTimeout(hideTimer);
    host.classList.add('is-bye');
    var actions = host.querySelector('#zin-bal-actions');
    if (actions) actions.innerHTML = '';
    if (fromNoAnswer) {
      // balao some primeiro, depois o robo acena e sai devagar
      balloon.classList.add('zin-hide-first');
      host.classList.add('is-leaving');
      setCooldown(rand(MIN_WAIT, MAX_WAIT));
      setTimeout(disappear, 1400);
    } else {
      setCooldown(rand(MIN_WAIT, MAX_WAIT));
      disappear();
    }
  }

  function disappear() {
    if (!host) return;
    host.classList.remove('is-visible');
    host.classList.add('is-hidden-done');
    setTimeout(function () {
      if (host && host.parentNode) host.parentNode.removeChild(host);
      host = null; balloon = null;
    }, 700);
  }

  /* ── Agendamento inteligente ── */
  function schedule() {
    clearTimeout(appearTimer);
    if (cooldownActive()) return;
    appearTimer = setTimeout(function () {
      if (document.hidden) return;
      appear('invite');
    }, 5000);
  }

  /* ── Chamada manual pelo icone fixo ── */
  function summonNow() {
    clearTimeout(appearTimer);
    if (host && host.classList.contains('is-visible')) return;
    appear('conselho');
  }

  /* ── Boot ── */
  function boot() {
    build();
    var pill = document.createElement('button');
    pill.type = 'button';
    pill.id = 'zin-pill';
    pill.title = 'Chamar o Zinho';
    pill.textContent = '\uD83E\uDD16';
    pill.onclick = function () { summonNow(); };
    document.body.appendChild(pill);
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
