/* ═══════════════════════════════════════════════════════
   ZAYA PANEL SPA — vanilla JS, sem dependencias
   Roteador por hash · API zaya/v1 · Paleta Cmd/Ctrl+K
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = window.zayaPanel;
  var view = document.getElementById('zp-view');
  var nav = document.getElementById('zp-nav');

  /* ── Tema (dark padrao; preferencia no localStorage) ── */
  var theme = localStorage.getItem('zp_theme') || 'dark';
  function applyTheme(t) {
    theme = t;
    document.body.classList.toggle('zp-light', t === 'light');
    localStorage.setItem('zp_theme', t);
    var btn = document.getElementById('zp-theme-toggle');
    if (btn) { btn.innerHTML = t === 'light' ? '&#9789;' : '&#9728;'; }
  }
  applyTheme(theme);

  /* ── Indicador de acao em andamento (profissional, sempre visivel) ── */
  var busyCount = 0;

  function ensureBusyEls() {
    if (document.getElementById('zp-progress')) { return; }
    var prog = document.createElement('div');
    prog.className = 'zp-progress';
    prog.id = 'zp-progress';
    prog.innerHTML = '<div class="zp-progress-bar"></div>';
    document.querySelector('.zp-topbar').appendChild(prog);

    var chip = document.createElement('div');
    chip.className = 'zp-action-chip';
    chip.id = 'zp-action-chip';
    chip.innerHTML = '<span class="zp-chip-spinner"></span><span id="zp-action-label"></span>';
    document.body.appendChild(chip);
  }

  function busyRender(label) {
    ensureBusyEls();
    var prog = document.getElementById('zp-progress');
    var chip = document.getElementById('zp-action-chip');
    if (busyCount > 0) {
      prog.classList.add('is-active');
      chip.classList.add('is-active');
      if (label) { document.getElementById('zp-action-label').textContent = label; }
    } else {
      prog.classList.remove('is-active');
      chip.classList.remove('is-active');
    }
  }

  function busyStart(label) { busyCount++; busyRender(label); }
  function busyEnd() { busyCount = Math.max(0, busyCount - 1); busyRender(null); }

  /* ── API helper — toda chamada mostra o que esta acontecendo ── */
  async function api(path, opts, label) {
    opts = opts || {};
    busyStart(label || '');
    var headers = { 'X-WP-Nonce': CFG.nonce };
    if (opts.body && !(opts.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    if (opts.raw) { delete headers['Content-Type']; }
    try {
      var res = await fetch(CFG.restUrl + path, Object.assign({ headers: headers, credentials: 'same-origin' }, opts));
      var json = null;
      try { json = await res.json(); } catch (e) {}
      if (!res.ok || (json && json.code && res.status >= 400)) {
        throw new Error((json && json.message) || 'Erro ' + res.status);
      }
      return json;
    } finally {
      busyEnd();
    }
  }

  /* Spinner padrao nos botoes durante qualquer submissao */
  function btnLoading(btn, on, loadingText) {
    if (!btn) { return; }
    if (on) {
      btn.dataset.origText = btn.textContent;
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.textContent = loadingText || btn.dataset.origText;
    } else {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      if (btn.dataset.origText) { btn.textContent = btn.dataset.origText; }
    }
  }

  /* ── Toasts ── */
  function toast(msg, type) {
    var box = document.getElementById('zp-toasts');
    var el = document.createElement('div');
    el.className = 'zp-toast' + (type === 'error' ? ' is-error' : '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 4500);
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function money(v) { return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ','); }

  function emptyState(title, text, actionHtml) {
    return '<div class="zp-empty"><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (actionHtml || '') + '</div>';
  }

  /* ═════════════ NAVEGACAO ═════════════ */

  var NAV = [
    { hash: '#dashboard', label: 'Painel', icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { sep: 'Loja' },
    { hash: '#produtos', label: 'Produtos', icon: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>' },
    { hash: '#categorias', label: 'Categorias', icon: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>' },
    { hash: '#pedidos', label: 'Pedidos', icon: '<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>' },
    { hash: '#hero', label: 'Hero da Home', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' },
    { hash: '#ofertas', label: 'Ofertas (Bump + Upsell)', icon: '<path d="M21 11v3l-2-1v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5l-2 1v-3l2-1V6a2 2 0 012-2h10a2 2 0 012 2v4l2 1z"/><circle cx="12" cy="9" r="1.5"/><path d="M9 18h2.5V14a1 1 0 10-2 0v4z"/>' },
    { group: 'Configurações', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.08a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.08a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.08a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>', children: [
      { hash: '#pagamentos', label: 'Pagamentos (Mercado Pago)' },
      { hash: '#frete', label: 'Frete da Loja' },
      { hash: '#email', label: 'E-mail da Loja' },
      { hash: '#loja', label: 'Endereco da Loja' },
      { hash: '#identidade', label: 'Identidade Visual' },
      { hash: '#social', label: 'Contato / Social' },
      { hash: '#vitrines', label: 'Vitrines' },
      { hash: '#idade', label: 'Verificacao de Idade' },
      { hash: '#cookies', label: 'Cookies e Privacidade' },
      { hash: '#calc', label: 'Calculadora de Preco' },
      { hash: '#robo', label: 'Robo Conselheiro' },
    ] },
  ];

  function renderNav() {
    nav.innerHTML = NAV.map(function (item, i) {
      if (item.sep) {
        if (item.adminOnly && !CFG.isAdmin) { return ''; }
        return '<div class="zp-nav-sep">' + esc(item.sep) + '</div>';
      }
      if (item.adminOnly && !CFG.isAdmin) { return ''; }
      if (item.group) {
        var kids = (item.children || []).map(function (ch) {
          return '<button class="zp-nav-item zp-nav-child" data-hash="' + ch.hash + '"><span>' + esc(ch.label) + '</span></button>';
        }).join('');
        return '<button type="button" class="zp-nav-item zp-nav-group" data-group="' + esc(item.group) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + item.icon + '</svg><span>' + esc(item.group) + '</span>' +
          '<svg class="zp-nav-chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>' +
          '<div class="zp-nav-children" data-children="' + esc(item.group) + '" style="">' + kids + '</div>';
      }
      return '<button class="zp-nav-item" data-hash="' + item.hash + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + item.icon + '</svg><span>' + esc(item.label) + '</span></button>';
    }).join('');
    nav.querySelectorAll('.zp-nav-group').forEach(function (b) {
      b.onclick = function () {
        var kids = nav.querySelector('[data-children="' + b.dataset.group + '"]');
        if (!kids) return;
        var open = kids.style.display !== 'none';
        kids.style.display = open ? 'none' : '';
        var chev = b.querySelector('.zp-nav-chev');
        if (chev) { chev.style.transform = open ? '' : 'rotate(-90deg)'; }
      };
    });
  }

  /* ═════════════ SECOES ═════════════ */

  var ROUTES = {};

  ROUTES['#dashboard'] = async function () {
    view.innerHTML = '<p style="color:var(--zp-text-dim)">Carregando...</p>';
    var d = await api('dashboard');
    var kpis =
      '<div class="zp-kpis">' +
      '<div class="zp-kpi"><div class="zp-kpi-label">Pedidos hoje</div><div class="zp-kpi-value">' + d.orders_today + '</div></div>' +
      '<div class="zp-kpi"><div class="zp-kpi-label">Faturamento hoje</div><div class="zp-kpi-value"><small>R$</small> ' + money(d.revenue_today).replace('R$ ', '') + '</div></div>' +
      '<div class="zp-kpi"><div class="zp-kpi-label">Faturamento do mes</div><div class="zp-kpi-value"><small>R$</small> ' + money(d.revenue_month).replace('R$ ', '') + '</div></div>' +
      '<div class="zp-kpi"><div class="zp-kpi-label">Reviews pendentes</div><div class="zp-kpi-value">' + d.pending_reviews + '</div></div>' +
      '<div class="zp-kpi"><div class="zp-kpi-label">Produtos publicados</div><div class="zp-kpi-value">' + d.total_products + '</div></div>' +
      '</div>';

    var actions = (d.recommended_actions || []).map(function (a) { return '<div class="zp-alert zp-alert-info">' + esc(a) + '</div>'; }).join('');

    /* Aniversarios: avisa a gerencia para preparar splash personalizado. */
    api('bday-alerts').then(function (r) {
      var box = document.getElementById('zp-bday-box');
      if (!box) return;
      var alerts = r.alerts || [];
      if (!alerts.length) { box.innerHTML = ''; box.style.display = 'none'; return; }
      box.style.display = 'block';
      var TYPE = { aniversario: '🎂 faz aniversário', aniversario_zaya: '🎉 completa ano(s) de Zaya' };
      box.innerHTML =
        '<h3 style="margin:0 0 8px">Parabéns para dar 🎈</h3>' +
        alerts.map(function (a) {
          return '<div class="zp-alert zp-alert-info" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
            '<span style="flex:1"><strong>' + esc(a.name) + '</strong> ' + (TYPE[a.type] || '') + ' <em>' + esc(a.when) + '</em></span>' +
            '<button type="button" class="zp-btn zp-splash-personal" data-user="' + a.user_id + '" data-name="' + esc(a.name) + '">Preparar mensagem</button>' +
            '</div>';
        }).join('');
      box.querySelectorAll('.zp-splash-personal').forEach(function (b) {
        b.onclick = function () {
          var inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = 'video/mp4,video/webm,image/jpeg,image/png,image/webp';
          inp.onchange = async function () {
            var f = inp.files[0];
            if (!f) return;
            btnLoading(b, true, 'Enviando...');
            try {
              var fd = new FormData();
              fd.append('media', f);
              fd.append('user_id', b.dataset.user);
              fd.append('until', '');
              await api('bday-personal', { method: 'POST', body: fd, raw: true }, 'Programando surpresa...');
              toast('Surpresa programada para ' + b.dataset.name + '! Ela vera na abertura do app dele(a).');
            } catch (e) { toast(e.message, 'error'); }
            btnLoading(b, false);
          };
          inp.click();
        };
      });
    }).catch(function () {});

    var lowStock = (d.low_stock && d.low_stock.length)
      ? '<table class="zp-table"><thead><tr><th>Produto</th><th>Estoque</th></tr></thead><tbody>' +
        d.low_stock.map(function (p) { return '<tr><td>' + esc(p.name) + '</td><td><span class="zp-badge is-pending">' + p.stock + '</span></td></tr>'; }).join('') +
        '</tbody></table>'
      : emptyState('Estoque saudavel', 'Nenhum produto com estoque baixo.');

    var activity = (d.activity && d.activity.length)
      ? '<ul style="list-style:none;font-size:13px;line-height:2">' +
        d.activity.map(function (a) {
          return '<li><strong>' + esc(a.user_name) + '</strong> &mdash; <span style="color:var(--zp-text-dim)">' + esc(a.details || a.action) + '</span>' +
            '<em style="color:var(--zp-text-dim);font-size:11px;margin-left:8px">' + esc(a.created_at.slice(0, 16).replace('T', ' ')) + '</em></li>';
        }).join('') + '</ul>'
      : emptyState('Sem atividade ainda', 'As acoes feitas no painel aparecem aqui automaticamente.');

    view.innerHTML =
      '<h1 class="zp-view-title zp-hello-title">Ola, ' + esc(CFG.userName.split(' ')[0]) + '</h1>' +
        '<div id="zp-bday-box" class="zp-card" style="max-width:640px;margin-bottom:16px;display:none"></div>' +
      kpis +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px">' +
      '<div class="zp-card"><h3>Estoque baixo</h3>' + lowStock + '</div>' +
      '<div class="zp-card"><h3>Atividade recente</h3>' + activity + '</div>' +
      '</div>';
  };

  /* ── Produtos ── */
  ROUTES['#produtos'] = produtosList;

  async function produtosList() {
    view.innerHTML = '<h1 class="zp-view-title">Produtos</h1><p class="zp-view-sub">Catalogo completo da loja</p>' +
      '<div class="zp-actions" style="margin-bottom:16px">' +
      '<input type="text" id="zp-prod-search" placeholder="Buscar produto ou SKU..." style="flex:1;max-width:340px;padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text);outline:none">' +
      '<button class="zp-btn zp-btn-primary" id="zp-new-product">+ Novo produto</button></div>' +
      '<div class="zp-card"><div id="zp-prod-table"><p style="color:var(--zp-text-dim)">Carregando...</p></div></div>';

    async function load(q) {
      var data = await api('products' + (q ? '?search=' + encodeURIComponent(q) : ''));
      var box = document.getElementById('zp-prod-table');
      if (!data.length) {
        box.innerHTML = emptyState('Nenhum produto encontrado', q ? 'Nada para "' + q + '".' : 'Cadastre o primeiro produto da loja.',
          '<button class="zp-btn zp-btn-primary zp-btn-sm" onclick="document.getElementById(\'zp-new-product\').click()">Criar agora</button>');
        return;
      }
      box.innerHTML = '<div class="zp-table-wrap"><table class="zp-table"><thead><tr><th></th><th>Produto</th><th>Categoria</th><th>Preco</th><th>Estoque</th><th>Status</th><th></th></tr></thead><tbody>' +
        data.map(function (p) {
          return '<tr><td>' + (p.image ? '<img src="' + p.image + '" alt="">' : '') + '</td>' +
            '<td><strong>' + esc(p.name) + '</strong>' + (p.sku ? '<br><small style="color:var(--zp-text-dim)">' + esc(p.sku) + '</small>' : '') + '</td>' +
            '<td>' + esc(p.categories) + '</td>' +
            '<td>' + (p.on_sale ? '<del style="color:var(--zp-text-dim)">' + money(p.regular_price) + '</del> ' : '') + money(p.sale_price || p.price) + '</td>' +
            '<td>' + (p.stock_qty === null ? '&mdash;' : '<span class="zp-badge ' + (p.stock_qty <= 5 ? 'is-pending' : 'is-publish') + '">' + p.stock_qty + '</span>') + '</td>' +
            '<td><span class="zp-badge is-' + p.status + '">' + (p.status === 'publish' ? 'Publicado' : 'Rascunho') + '</span></td>' +
            '<td><div class="zp-actions">' +
            '<button class="zp-btn zp-btn-secondary zp-btn-sm" data-edit="' + p.id + '">Editar</button>' +
            '<button class="zp-btn zp-btn-danger zp-btn-sm" data-del="' + p.id + '" data-name="' + esc(p.name) + '">Excluir</button>' +
            '</div></td></tr>';
        }).join('') + '</tbody></table></div>';

      box.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { location.hash = '#produto/' + b.dataset.edit; }; });
      box.querySelectorAll('[data-del]').forEach(function (b) {
        b.onclick = async function () {
          if (!confirm('Excluir "' + b.dataset.name + '"? Essa acao nao pode ser desfeita.')) { return; }
          btnLoading(b, true, 'Excluindo...');
          try { await api('products/' + b.dataset.del, { method: 'DELETE' }, 'Excluindo "' + b.dataset.name + '"'); toast('Produto "' + b.dataset.name + '" excluido.'); load(document.getElementById('zp-prod-search').value); }
          catch (e) { toast(e.message, 'error'); btnLoading(b, false); }
        };
      });
    }

    var timer;
    document.getElementById('zp-prod-search').addEventListener('input', function () {
      clearTimeout(timer);
      var v = this.value.trim();
      timer = setTimeout(function () { load(v); }, 300);
    });
    document.getElementById('zp-new-product').onclick = function () { location.hash = '#produto/novo'; };

    /* Card de gerenciamento de categorias */
    var catsBox = document.createElement('div');
    catsBox.className = 'zp-card';
    catsBox.style.marginTop = '16px';
    catsBox.innerHTML = '<h3>Categorias do catalogo</h3><div id="zp-cats-mgr"><p style="color:var(--zp-text-dim)">Carregando...</p></div>';
    view.querySelector('.zp-card').after(catsBox);

    async function loadCats() {
      var box = document.getElementById('zp-cats-mgr');
      var cats = await api('categories');
      if (!cats.length) { box.innerHTML = emptyState('Nenhuma categoria', 'Elas sao criadas automaticamente ao salvar produtos.'); return; }
      box.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
        cats.map(function (c) {
          var label = (c.parent ? '↳ ' : '') + c.name + ' (' + c.count + ')';
          return '<span class="zp-cat-chip" data-id="' + c.id + '" title="' + esc(c.name) + '">' +
            esc(label) +
            (c.count === 0 ? ' <button type="button" class="zp-cat-del" title="Excluir categoria vazia">&#10005;</button>' : '') +
            '</span>';
        }).join('') + '</div>' +
        '<p style="font-size:11.5px;color:var(--zp-text-dim);margin-top:10px">So categorias vazias podem ser excluidas aqui. Elas tambem ficam visiveis no wp-admin em WooCommerce &rarr; Produtos &rarr; Categorias.</p>';

      box.querySelectorAll('.zp-cat-del').forEach(function (b) {
        b.onclick = async function () {
          var chip = b.closest('.zp-cat-chip');
          if (!confirm('Excluir a categoria "' + chip.textContent.replace('\u2715', '').trim() + '"?')) { return; }
          try {
            await api('categories/' + chip.dataset.id, { method: 'DELETE' }, 'Excluindo categoria');
            toast('Categoria excluida.');
            loadCats();
          } catch (e) { toast(e.message, 'error'); }
        };
      });
    }
    loadCats();

    await load('');
  }

  ROUTES['#produto/novo'] = productForm;
  ROUTES['#produto/:id'] = async function (id) {
    var p = await api('products/' + id);
    productForm(p);
  };

  /* ── Postagens: historico de posts do postador ── */
  ROUTES['#postagens'] = async function () {
    view.innerHTML = '<h1 class="zp-view-title">Postagens</h1><p class="zp-view-sub">Controle das publicacoes no Facebook/Instagram</p>' +
      '<div class="zp-actions" style="margin-bottom:16px">' +
      '<input type="text" id="zp-post-search" placeholder="Buscar produto..." style="flex:1;max-width:340px;padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text);outline:none">' +
      '<button class="zp-btn zp-btn-primary" id="zp-post-refresh">Atualizar</button></div>' +
      '<div class="zp-card" id="zp-posts-box"><p style="color:var(--zp-text-dim)">Carregando...</p></div>';

    async function loadPosts(q) {
      var box = document.getElementById('zp-posts-box');
      box.innerHTML = '<p style="color:var(--zp-text-dim)">Carregando...</p>';
      var d;
      try { d = await api('poster-posts' + (q ? '?search=' + encodeURIComponent(q) : '')); }
      catch (e) { box.innerHTML = '<p style="color:#ff6b6b">' + esc(e.message) + '</p>'; return; }

      if (!d.enabled) {
        box.innerHTML = emptyState('Postador nao configurado',
          'Ative o postador e salve o token na seção Postador para publicar produtos.',
          '<a class="zp-btn zp-btn-primary zp-btn-sm" href="#poster">Ir para Postador</a>');
        return;
      }
      if (!d.items.length) {
        box.innerHTML = emptyState('Nenhum produto publicado',
          'Publique um produto na loja para ele aparecer aqui com o status da postagem.');
        return;
      }

      var stats = '<div class="zp-kpis" style="margin-bottom:14px">' +
        '<div class="zp-kpi"><div class="zp-kpi-label">Produtos publicados</div><div class="zp-kpi-value">' + d.total + '</div></div>' +
        '<div class="zp-kpi"><div class="zp-kpi-label">Postados nas redes</div><div class="zp-kpi-value">' + d.posted + '</div></div>' +
        '</div>';

      var rows = d.items.map(function (p) {
        var badge = p.posted
          ? '<span class="zp-badge is-publish">Postado</span>'
          : '<span class="zp-badge is-draft">Nao postado</span>';
        var detail = '';
        if (p.fb.message && p.fb.message !== 'ok') { detail += '<div style="font-size:12px;color:#ff6b6b">FB: ' + esc(p.fb.message) + '</div>'; }
        if (p.ig.message && p.ig.message !== 'ok') { detail += '<div style="font-size:12px;color:#ff6b6b">IG: ' + esc(p.ig.message) + '</div>'; }
        if (p.posted && p.at) { detail += '<div style="font-size:12px;color:var(--zp-text-dim)">Postado em ' + esc(p.at) + (p.by ? ' por ' + esc(p.by) : '') + '</div>'; }
        return '<tr>' +
          '<td>' + (p.image ? '<img src="' + p.image + '" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:8px">' : '') + '</td>' +
          '<td><strong>' + esc(p.name) + '</strong></td>' +
          '<td>' + badge + '</td>' +
          '<td>' + detail + '</td>' +
          '<td><div class="zp-actions">' +
          '<button class="zp-btn zp-btn-secondary zp-btn-sm" data-repost="' + p.id + '" data-name="' + esc(p.name) + '">' + (p.posted ? 'Reenviar' : 'Publicar nas redes') + '</button>' +
          '<a class="zp-btn zp-btn-secondary zp-btn-sm" href="' + esc(p.link) + '" target="_blank" rel="noopener">Ver na loja</a>' +
          '</div></td></tr>';
      }).join('');

      box.innerHTML = stats + '<div class="zp-table-wrap"><table class="zp-table"><thead><tr><th></th><th>Produto</th><th>Status</th><th>Detalhe</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';

      box.querySelectorAll('[data-repost]').forEach(function (b) {
        b.onclick = async function () {
          btnLoading(b, true, 'Postando...');
          try {
            var r = await api('products/' + b.dataset.repost + '/post', { method: 'POST' }, 'Publicando "' + b.dataset.name + '"');
            toast(r.message || 'Postado com sucesso!');
            loadPosts(document.getElementById('zp-post-search').value);
          } catch (e) { toast(e.message, 'error'); btnLoading(b, false); }
        };
      });
    }

    document.getElementById('zp-post-refresh').onclick = function () { loadPosts(document.getElementById('zp-post-search').value); };
    var timer;
    document.getElementById('zp-post-search').addEventListener('input', function () {
      clearTimeout(timer);
      var v = this.value.trim();
      timer = setTimeout(function () { loadPosts(v); }, 300);
    });
    await loadPosts('');
  };

  /* ── Formatacao de dinheiro BR nos campos de preco ── */
  function fmtBR(v) {
    return Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function moneyToFloat(s) {
    if (!s) { return ''; }
    return String(s).replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
  }
  function attachMoney(input) {
    /* Mascara viva: digita so numeros, o campo formata na hora
       (ultimos 2 digitos = centavos). Ex: 129990 -> 1.299,90 */
    input.addEventListener('input', function () {
      var posFromEnd = input.value.length - input.selectionStart;
      var digits = input.value.replace(/\D/g, '').slice(0, 11);
      if (!digits) { input.value = ''; return; }
      var n = parseInt(digits, 10) / 100;
      input.value = n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      // mantem o cursor onde o usuario estava digitando
      var newPos = Math.max(0, input.value.length - posFromEnd);
      input.setSelectionRange(newPos, newPos);
    });
    // Ao colar "49.90" ou "49,90", normaliza tambem
    input.addEventListener('paste', function () {
      setTimeout(function () { input.dispatchEvent(new Event('input')); }, 0);
    });
  }

  /* ── Categorias e subcategorias (visao dedicada) ── */
  ROUTES['#categorias'] = async function () {
    view.innerHTML =
      '<h1 class="zp-view-title">Categorias</h1>' +
      '<p class="zp-view-sub">Organizacao do catalogo: categorias principais e subcategorias. Criadas aqui aparecem na loja, no mega menu e no wp-admin.</p>' +

      '<div class="zp-card" style="max-width:640px">' +
      '<h3>Nova categoria ou subcategoria</h3>' +
      '<div class="zp-form-grid">' +
      '<label class="zp-field"><span>Nome *</span><input type="text" id="zp-cat-name" placeholder="Ex: Perfumaria"></label>' +
      '<label class="zp-field"><span>Categoria pai</span><select id="zp-cat-parent"><option value="">Nenhuma (principal)</option></select></label>' +
      '<label class="zp-field"><span>Contexto visual</span><select id="zp-cat-context"><option value="light">Claro (padrao)</option><option value="dark">Escuro</option></select></label>' +
      '</div>' +
      '<button type="button" class="zp-btn zp-btn-primary" id="zp-cat-create">Criar categoria</button>' +
      '</div>' +

      '<div class="zp-card" style="max-width:640px"><div id="zp-cats-tree"><p style="color:var(--zp-text-dim)">Carregando...</p></div></div>';

    async function loadTree() {
      var cats = await api('categories');
      var tops = cats.filter(function (c) { return !c.parent && c.slug !== 'sem-categoria'; });
      var tree = document.getElementById('zp-cats-tree');

      var parentSel = document.getElementById('zp-cat-parent');
      parentSel.innerHTML = '<option value="">Nenhuma (principal)</option>' +
        tops.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('');

      if (!cats.length) {
        tree.innerHTML = emptyState('Nenhuma categoria ainda', 'Crie a primeira acima — ela aparece imediatamente na loja.');
        return;
      }

      function row(c, isChild) {
        var ctxBadge = c.context === 'dark'
          ? ' <span class="zp-badge is-pending" title="Abre no tema escuro">escuro</span>'
          : ' <span class="zp-badge is-publish" title="Abre no tema claro">claro</span>';
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 4px;' + (isChild ? 'margin-left:26px;border-left:2px solid var(--zp-border);padding-left:14px;' : 'border-bottom:1px solid var(--zp-border);') + '">' +
          '<a href="' + c.link + '" target="_blank" style="color:var(--zp-text);text-decoration:none;font-weight:' + (isChild ? 400 : 600) + ';font-size:13.5px">' + esc(c.name) + '</a>' +
          ctxBadge +
          '<span style="font-size:11px;color:var(--zp-text-dim)">' + c.count + ' produto(s)</span>' +
          '<span style="flex:1"></span>' +
          '<button type="button" class="zp-btn zp-btn-secondary zp-btn-sm" data-rename="' + c.id + '" data-name="' + esc(c.name) + '">Renomear</button>' +
          (c.count === 0 ? '<button type="button" class="zp-btn zp-btn-danger zp-btn-sm" data-del="' + c.id + '" data-name="' + esc(c.name) + '">Excluir</button>' : '') +
          '</div>';
      }

      var html = tops.map(function (t) {
        var kids = cats.filter(function (c) { return c.parent === t.id; });
        if (!kids.length) { return row(t, false); }
        // Pai com filhos: ganha botao de esconder/mostrar a subarvore
        var chev = '<button type="button" class="zp-btn zp-btn-secondary zp-btn-sm zp-cat-toggle" data-target="kids-' + t.id + '" style="min-width:34px" title="Esconder / mostrar subcategorias">&minus;</button>';
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid var(--zp-border)">' +
          chev +
          '<a href="' + t.link + '" target="_blank" style="color:var(--zp-text);text-decoration:none;font-weight:600;font-size:13.5px">' + esc(t.name) + '</a>' +
          (t.context === 'dark'
            ? ' <span class="zp-badge is-pending">escuro</span>'
            : ' <span class="zp-badge is-publish">claro</span>') +
          '<span style="font-size:11px;color:var(--zp-text-dim)">' + t.count + ' produto(s)</span>' +
          '<span style="flex:1"></span>' +
          '<button type="button" class="zp-btn zp-btn-secondary zp-btn-sm" data-rename="' + t.id + '" data-name="' + esc(t.name) + '">Renomear</button>' +
          '</div>' +
          '<div class="zp-cat-kids" id="kids-' + t.id + '">' +
          kids.map(function (k) { return row(k, true); }).join('') +
          '</div>';
      }).join('');

      var orphans = cats.filter(function (c) { return c.parent && !tops.some(function (t) { return t.id === c.parent; }); });
      html += orphans.map(function (o) { return row(o, false); }).join('');

      tree.innerHTML = html;

      tree.querySelectorAll('[data-rename]').forEach(function (b) {
        b.onclick = function () {
          var novo = prompt('Novo nome para "' + b.dataset.name + '":', b.dataset.name);
          if (!novo || novo.trim() === b.dataset.name) { return; }
          saveBar(b, async function () {
            await api('categories', { method: 'POST', body: { id: parseInt(b.dataset.rename, 10), name: novo.trim() } }, 'Renomeando categoria');
            loadTree();
          });
        };
      });

      tree.querySelectorAll('[data-del]').forEach(function (b) {
        b.onclick = async function () {
          if (!confirm('Excluir a categoria "' + b.dataset.name + '"?')) { return; }
          try {
            await api('categories/' + b.dataset.del, { method: 'DELETE' }, 'Excluindo "' + b.dataset.name + '"');
            toast('Categoria excluida.');
            loadTree();
          } catch (e) { toast(e.message, 'error'); }
        };
      });

      /* Esconder/mostrar subcategorias */
      tree.querySelectorAll('.zp-cat-toggle').forEach(function (b) {
        b.onclick = function () {
          var kids = document.getElementById(b.dataset.target);
          var hidden = kids.classList.toggle('is-hidden');
          b.innerHTML = hidden ? '&#43;' : '&minus;';
        };
      });
    }

    document.getElementById('zp-cat-create').onclick = async function () {
      var name = document.getElementById('zp-cat-name').value.trim();
      var parent = document.getElementById('zp-cat-parent').value;
      var context = document.getElementById('zp-cat-context').value;
      if (!name) { toast('Digite o nome da categoria.', 'error'); return; }
      btnLoading(this, true, 'Criando...');
      try {
        await api('categories', { method: 'POST', body: { name: name, parent: parent ? parseInt(parent, 10) : 0, context: context } }, 'Criando "' + name + '"');
        toast('Categoria "' + name + '" criada e ja visivel na loja.');
        document.getElementById('zp-cat-name').value = '';
        await loadTree();
      } catch (e) { toast(e.message, 'error'); }
      btnLoading(this, false);
    };

    await loadTree();
  };

  async function productForm(existing) {
    var catsData = await api('categories');
    var catNames = catsData.map(function (c) { return c.name; });

    view.innerHTML =
'<h1 class="zp-view-title" style="margin:0 0 4px">' + (existing ? 'Editar produto' : 'Novo produto') + '</h1>' +
      '<p class="zp-view-sub">Salve uma vez e tudo e configurado: categoria criada se faltar, imagens otimizadas em WebP, preco Pix calculado.</p>' +
      '<button type="button" id="zp-pricing-toggle" class="zp-btn zp-btn-secondary zp-pricing-toggle" aria-expanded="false" style="margin:2px 0 14px">' +
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/></svg>' +
      '<span>Precifica&ccedil;&atilde;o</span>' +
      '<span class="zp-pricing-arrow">&#9662;</span></button>' +
      '<div id="zp-pricing-host" hidden></div>' +
      '<form id="zp-prod-form" class="zp-card" style="max-width:720px">' +
      '<div class="zp-form-grid">' +
      '<label class="zp-field" style="grid-column:1/-1"><span>Nome *</span><input type="text" name="name" required value="' + esc(existing ? existing.name : '') + '"></label>' +
      '<label class="zp-field"><span>Preco normal (R$)</span><input type="text" class="zp-money" name="regular_price" inputmode="decimal" value="' + (existing ? fmtBR(existing.regular_price) : '') + '" placeholder="0,00"></label>' +
      '<label class="zp-field"><span>Preco promocional (R$)</span><input type="text" class="zp-money" name="sale_price" inputmode="decimal" value="' + (existing ? fmtBR(existing.sale_price || '') : '') + '" placeholder="0,00"></label>' +
      '<label class="zp-field"><span>Desconto (%) <small style="color:var(--zp-text-dim)">calcula o preco promocional</small></span><input type="number" name="discount" min="0" max="90" step="1" placeholder="0"></label>' +
      '<label class="zp-field"><span>Categorias * <small style="color:var(--zp-text-dim)">(separe por virgula — inexistentes sao criadas)</small></span>' +
      '<input type="text" name="categories" list="zp-cats-list" required value="' + esc(existing ? existing.categories : '') + '" placeholder="Maquiagem, Labios...">' +
      '<datalist id="zp-cats-list">' + catNames.map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist></label>' +
      '<label class="zp-field"><span>Estoque *</span><input type="number" name="stock_qty" required min="0" value="' + (existing && existing.stock_qty !== null && existing.stock_qty !== undefined ? existing.stock_qty : '') + '"><input type="hidden" name="manage_stock" value="1"></label>' +
      '<label class="zp-field"><span>SKU</span><input type="text" name="sku" value="' + esc(existing ? existing.sku : '') + '"></label>' +
      '<label class="zp-field" style="grid-column:1/-1"><span>Descricao curta * <small style="color:var(--zp-text-dim)">(aparece no card e na pagina do produto)</small></span>' +
      '<textarea name="short_desc" rows="2" required maxlength="300" placeholder="Ex: Batom matte de longa duracao, textura aveludada e cobertura intensa.">' + esc(existing ? existing.short_desc : '') + '</textarea></label>' +
      '<label class="zp-field" style="grid-column:1/-1"><span>Descricao completa</span><textarea name="description">' + esc(existing ? existing.description : '') + '</textarea></label>' +
      '<div class="zp-field" style="grid-column:1/-1"><span>Imagens <small style="color:var(--zp-text-dim)">(primeira = destaque; JPG/PNG ate 20MB)</small></span>' +
      '<input type="file" name="images[]" multiple accept="image/*" id="zp-img-input" style="color:var(--zp-text-dim)">' +
      '<div id="zp-img-preview" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"></div></div>' +
      '<label class="zp-field"><span>Status</span><select name="status"><option value="publish"' + (existing && existing.status !== 'draft' ? ' selected' : '') + '>Publicado</option><option value="draft"' + (existing && existing.status === 'draft' ? ' selected' : '') + '>Rascunho</option></select></label>' +
      '</div>' +
      '<div class="zp-actions">' +
      '<button type="submit" class="zp-btn zp-btn-primary">Salvar produto</button>' +
      '<button type="button" class="zp-btn zp-btn-secondary" onclick="location.hash=\'#produtos\'">Cancelar</button>' +
      (existing && CFG.posterEnabled ? '<button type="button" class="zp-btn zp-btn-poster" id="zp-post-social">' + (existing.poster && existing.poster.ok ? '&#128260; Postado &middot; reenviar' : '&#128260; Publicar nas redes') + '</button>' : '') +
      '</div>' +
      (existing && CFG.posterEnabled ? '<p class="zp-poster-status" id="zp-poster-status" style="margin:10px 0 0"></p>' : '') +
      '</form>';

    /* Precificacao embutida: abre pelo botao no topo (carregada na 1a abertura) */
    var pricingToggle = document.getElementById('zp-pricing-toggle');
    var pricingHost = document.getElementById('zp-pricing-host');
    var pricingLoaded = false;
    pricingToggle.addEventListener('click', function () {
      if (pricingHost.hidden) {
        pricingHost.hidden = false;
        pricingToggle.classList.add('is-open');
        pricingToggle.setAttribute('aria-expanded', 'true');
        if (!pricingLoaded) { pricingLoaded = true; zayaPricingInto(pricingHost); }
      } else {
        pricingHost.hidden = true;
        pricingToggle.classList.remove('is-open');
        pricingToggle.setAttribute('aria-expanded', 'false');
      }
    });

    /* Formatacao viva dos precos */
    view.querySelectorAll('.zp-money').forEach(attachMoney);

    /* Desconto (%) <-> preco promocional: calculo automatico nos dois sentidos */
    var discEl = view.querySelector('[name=discount]');
    var normalEl = view.querySelector('[name=regular_price]');
    var saleEl = view.querySelector('[name=sale_price]');

    function discFromPrices() {
      var normal = moneyToFloat(normalEl.value);
      var sale = moneyToFloat(saleEl.value);
      if (normal > 0 && sale > 0 && sale < normal) {
        discEl.value = Math.round(((normal - sale) / normal) * 100);
      } else {
        discEl.value = '';
      }
    }
    function saleFromDisc() {
      var normal = moneyToFloat(normalEl.value);
      var disc = parseFloat(discEl.value) || 0;
      if (normal > 0 && disc > 0) {
        var sale = Math.round((normal * (100 - disc)) / 100 * 100) / 100;
        saleEl.value = fmtBR(sale);
      }
    }
    if (discEl) {
      discEl.addEventListener('input', saleFromDisc);
      normalEl.addEventListener('input', discFromPrices);
      saleEl.addEventListener('input', discFromPrices);
      if (existing) { discFromPrices(); }
    }

    /* Preview miniatura com remocao individual */
    var imgInput = document.getElementById('zp-img-input');
    var preview = document.getElementById('zp-img-preview');
    var selectedImages = [];

    function renderPreview() {
      preview.innerHTML = '';
      selectedImages.forEach(function (f, idx) {
        var wrap = document.createElement('span');
        wrap.style.position = 'relative';
        var img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.title = f.name;
        img.style.display = 'block';
        var x = document.createElement('button');
        x.type = 'button';
        x.className = 'zp-thumb-x';
        x.innerHTML = '&#10005;';
        x.title = 'Remover esta imagem';
        x.onclick = function () { selectedImages.splice(idx, 1); renderPreview(); };
        wrap.appendChild(img);
        wrap.appendChild(x);
        preview.appendChild(wrap);
      });
    }

    imgInput.addEventListener('change', function () {
      Array.prototype.forEach.call(imgInput.files, function (f) {
        if (f.type.match(/^image\//)) { selectedImages.push(f); }
      });
      imgInput.value = ''; // permite re-selecionar a mesma pasta
      renderPreview();
    });

    document.getElementById('zp-prod-form').onsubmit = async function (e) {
      e.preventDefault();
      var btn = e.target.querySelector('[type=submit]');
      btnLoading(btn, true, existing ? 'Salvando alteracoes...' : 'Criando produto...');
      try {
        var form = new FormData(e.target);
        var payload = {};
        ['name', 'regular_price', 'sale_price', 'sku', 'stock_qty', 'manage_stock', 'description', 'short_desc', 'status'].forEach(function (k) { payload[k] = form.get(k); });
        // Precos formatados BR -> float padrao da API
        payload.regular_price = moneyToFloat(payload.regular_price);
        payload.sale_price = moneyToFloat(payload.sale_price);
        payload.categories = String(form.get('categories') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        if (existing) { payload.id = existing.id; }

        var hasFiles = selectedImages.length > 0;
        if (hasFiles) {
          for (var fi = 0; fi < selectedImages.length; fi++) {
            if (selectedImages[fi].size > 20 * 1024 * 1024) {
              toast('A imagem "' + selectedImages[fi].name + '" passa de 20MB. Reduza antes de enviar.', 'error');
              btnLoading(btn, false);
              return;
            }
          }
        }
        var label = existing ? 'Salvando "' + payload.name + '"' : 'Criando "' + payload.name + '"';
        if (hasFiles) {
          // categorias vai como lista separada por virgula — NUNCA JSON
          form.set('categories', payload.categories.join(','));
          // imagens vao do array gerenciado (as removidas pelo X nao vao)
          selectedImages.forEach(function (f) { form.append('images[]', f); });
          await api(existing ? 'products/' + existing.id : 'products', { method: 'POST', body: form, raw: true }, label + ' com imagens');
        } else {
          await api(existing ? 'products/' + existing.id : 'products', { method: existing ? 'PUT' : 'POST', body: payload }, label);
        }
        toast((existing ? 'Alteracoes salvas: ' : 'Produto criado: ') + '"' + payload.name + '"');
        location.hash = '#produtos';
      } catch (err) {
        toast(err.message, 'error');
        btnLoading(btn, false);
      }
    };

    /* ── Postador: publica nas redes (botao ao lado de salvar) ── */
    var postBtn = document.getElementById('zp-post-social');
    var postStatus = document.getElementById('zp-poster-status');
    if (postBtn && existing) {
      if (existing.poster && existing.poster.ok) {
        postStatus.innerHTML = '<span style="color:var(--zp-ok,#3ddc84)">&#10003; Publicado ' + esc(existing.poster.at) + '</span>';
      }
      postBtn.addEventListener('click', async function () {
        btnLoading(postBtn, true, 'Publicando...');
        if (postStatus) { postStatus.textContent = 'Enviando para o Facebook e Instagram...'; postStatus.style.color = 'var(--zp-text-dim)'; }
        try {
          var r = await api('products/' + existing.id + '/post', { method: 'POST', body: {} }, 'Publicando "' + existing.name + '" nas redes');
          toast(r.message || 'Publicado com sucesso.');
          if (postStatus) {
            postStatus.innerHTML = '<span style="color:var(--zp-ok,#3ddc84)">&#10003; ' + esc(r.message) + '</span>';
            postBtn.innerHTML = '&#128260; Postado &middot; reenviar';
          }
        } catch (err) {
          toast(err.message, 'error');
          if (postStatus) {
            postStatus.innerHTML = '<span style="color:#e5484d">' + esc(err.message) + '</span>';
          }
        } finally {
          btnLoading(postBtn, false);
        }
      });
    }
  }

  /* ── Ficha completa do pedido (separacao/envio) ── */
  function zpAddrBlock(title, a, extra) {
    if (!a || (!a.address && !a.name)) { return ''; }
    return '<div class="zp-od-card"><h4>' + esc(title) + '</h4>' +
      (a.name ? '<strong>' + esc(a.name) + '</strong><br>' : '') +
      esc(a.address || '') + '<br>' +
      esc((a.city || '') + (a.city && a.state ? ' - ' : '') + (a.state || '')) +
      (a.postcode ? '<br>CEP ' + esc(a.postcode) : '') +
      (extra ? '<br>' + extra : '') + '</div>';
  }

  async function zpOrderDetails(id) {
    var ov = document.getElementById('zp-od-overlay');
    var body = document.getElementById('zp-od-body');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'zp-od-overlay';
      ov.innerHTML = '<div class="zp-od-box"><button type="button" id="zp-od-close" class="zp-od-close" aria-label="Fechar">&#10005;</button><div id="zp-od-body"></div></div>';
      document.body.appendChild(ov);
      ov.addEventListener('click', function (e) { if (e.target === ov) { ov.classList.remove('is-open'); } });
      document.getElementById('zp-od-close').addEventListener('click', function () { ov.classList.remove('is-open'); });
      document.addEventListener('keydown', function (e) { if ('Escape' === e.key) { ov.classList.remove('is-open'); } });
    }
    body = document.getElementById('zp-od-body');
    ov.classList.add('is-open');
    body.innerHTML = '<p style="color:var(--zp-text-dim)">Carregando pedido...</p>';

    try {
      var o = await api('orders/' + id + '/details');
      var items = (o.items || []).map(function (it) {
        return '<div class="zp-od-item">' +
          (it.image ? '<img src="' + esc(it.image) + '" alt="">' : '') +
          '<div class="zp-od-item-info"><strong>' + esc(it.name) + '</strong>' +
          (it.sku ? '<br><small>SKU: ' + esc(it.sku) + '</small>' : '') + '</div>' +
          '<span class="zp-od-item-qty">&times;' + esc(it.qty) + '</span>' +
          '<span class="zp-od-item-total">' + money(it.total) + '</span></div>';
      }).join('');
      var phoneLink = o.phone
        ? '<a href="https://wa.me/55' + esc(String(o.phone).replace(/\D/g, '')) + '" target="_blank" rel="noopener" class="zp-wa-btn zp-wa-icon" title="WhatsApp: ' + esc(o.phone) + '">' +
          '<svg viewBox="0 0 24 24" fill="#25D366" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>'
        : '';
      body.innerHTML =
        '<h3 class="zp-od-title">Pedido ' + esc(o.number) + ' <span class="zp-badge is-' + o.status + '">' + esc(o.status_label) + '</span></h3>' +
        '<p style="color:var(--zp-text-dim);font-size:12px;margin:0 0 14px">' + esc(o.date) + '</p>' +
        '<div class="zp-od-grid">' +
        zpAddrBlock('Entregar em', o.shipping_addr && o.shipping_addr.name ? o.shipping_addr : o.billing, phoneLink ? 'Contato: ' + phoneLink : '') +
        zpAddrBlock('Cobranca', o.billing, '') +
        '</div>' +
        '<div class="zp-od-card"><h4>Itens para separar</h4>' + items +
        '<div class="zp-od-totals">' +
        (o.totals.discount > 0 ? '<span>Desconto</span><strong>- ' + money(o.totals.discount) + '</strong>' : '') +
        '<span>Subtotal</span><strong>' + money(o.totals.subtotal) + '</strong>' +
        (o.shipping ? '<span>Frete (' + esc(o.shipping) + ')</span><strong>' + money(o.totals.shipping) + '</strong>' : '') +
        '<span class="zp-od-grand">Total</span><strong class="zp-od-grand">' + money(o.totals.total) + '</strong>' +
        '</div></div>' +
        '<div class="zp-od-grid"><div class="zp-od-card"><h4>Pagamento</h4>' + esc(o.payment || '&mdash;') + '</div>' +
        '<div class="zp-od-card"><h4>Contato</h4>' + esc(o.customer) + '<br><span style="font-size:12px;opacity:.85">' + esc(o.email) + '</span>' +
        (o.phone ? '<br>' + phoneLink : '') + '</div></div>' +
        '<div class="zp-od-card zp-od-tracking"><h4>Codigo de rastreio</h4>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<input type="text" id="zp-track-code" value="' + esc(o.tracking || '') + '" placeholder="Cole o codigo quando a etiqueta sair (Melhor Envio, Correios...)" style="flex:1;min-width:200px">' +
        '<button type="button" id="zp-track-save" class="zp-btn zp-btn-primary zp-btn-sm">Salvar</button>' +
        (o.tracking ? '<button type="button" id="zp-track-copy" class="zp-btn zp-btn-secondary zp-btn-sm">Copiar</button>' : '') +
        '</div>' +
        (o.tracking && o.phone
          ? '<a class="zp-btn zp-btn-secondary zp-btn-sm" style="margin-top:10px;display:inline-flex" target="_blank" rel="noopener" href="https://wa.me/55' + esc(String(o.phone).replace(/\D/g, '')) + '?text=' + encodeURIComponent('Ola ' + o.customer + '! Seu pedido ' + o.number + ' da Todday foi enviado! Codigo de rastreio: ' + o.tracking + '. Acompanhe a entrega pelo site dos Correios ou app do Mercado Pago. Obrigada por comprar com a gente! <3') + '">Avisar cliente no WhatsApp &#8599;</a>'
          : '') +
        '</div>' +
        (o.note ? '<div class="zp-od-card zp-od-note"><h4>Observacao da cliente</h4>&ldquo;' + esc(o.note) + '&rdquo;</div>' : '');

      var trackSave = document.getElementById('zp-track-save');
      if (trackSave) {
        trackSave.addEventListener('click', async function () {
          var input = document.getElementById('zp-track-code');
          btnLoading(trackSave, true, 'Salvando...');
          try {
            await api('orders/' + id + '/tracking', { method: 'POST', body: { code: input.value.trim() } }, 'Salvando codigo de rastreio');
            toast('Rastreio salvo no pedido ' + id + '.');
            zpOrderDetails(id);
          } catch (e) { toast(e.message, 'error'); }
          finally { btnLoading(trackSave, false); }
        });
      }
      var trackCopy = document.getElementById('zp-track-copy');
      if (trackCopy) {
        trackCopy.addEventListener('click', function () {
          var code = document.getElementById('zp-track-code').value.trim();
          if (!code) { return; }
          if (navigator.clipboard) { navigator.clipboard.writeText(code).then(function () { toast('Codigo copiado.'); }); }
          else { document.getElementById('zp-track-code').select(); document.execCommand('copy'); toast('Codigo copiado.'); }
        });
      }
    } catch (e) {
      body.innerHTML = '<p style="color:#ff6b81">' + esc(e.message) + '</p>';
    }
  }

  /* ── Monte o Look: editor de combos ── */
  ROUTES['#look'] = async function () {
    view.innerHTML = '<h1 class="zp-view-title">Monte o Look</h1><p class="zp-view-sub">Selecione os produtos de cada combo. Cada combo vira um card na Home com um botao unico que adiciona tudo ao carrinho.</p>' +
      '<div class="zp-card"><p style="color:var(--zp-text-dim)">Carregando...</p></div>';

    var card = view.querySelector('.zp-card');
    var state;
    try {
      state = await api('look-combos');
    } catch (e) { card.innerHTML = '<p style="color:#ff6b81">' + esc(e.message) + '</p>'; return; }

    var combos = state.combos || [{ name: '', products: [] }];
    var catalog = state.catalog || [];

    function comboBlock(c, i) {
      var checks = catalog.map(function (p) {
        var on = (c.products || []).indexOf(p.id) !== -1;
        return '<label class="zp-look-prod"><input type="checkbox" data-id="' + p.id + '"' + (on ? ' checked' : '') + '>' +
          (p.image ? '<img src="' + esc(p.image) + '" alt="">' : '') +
          '<span>' + esc(p.name) + '<em>R$ ' + money(p.price) + '</em></span></label>';
      }).join('');
      return '<div class="zp-look-combo" data-i="' + i + '">' +
        '<div class="zp-look-head"><strong>Combo ' + (i + 1) + '</strong>' +
        '<button type="button" class="zp-btn zp-btn-danger zp-btn-sm zp-look-del">Remover</button></div>' +
        '<input type="text" class="zp-look-name" value="' + esc(c.name || '') + '" placeholder="Nome do combo (ex.: Look Maquiagem Completo)" style="width:100%;margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><label style="font-size:12px;opacity:.85">Desconto do combo (%)</label>' +
        '<input type="number" class="zp-look-disc" value="' + esc(c.discount != null ? c.discount : 10) + '" min="0" max="50" step="1" style="width:80px">' +
        '<small style="opacity:.6">preco calculado automaticamente sobre a soma</small></div>' +
        '<div class="zp-look-prods">' + checks + '</div>' +
        '<input type="hidden" class="zp-look-ids" value="' + esc((c.products || []).join(',')) + '"></div>';
    }

    function render() {
      card.innerHTML = combos.map(comboBlock).join('') +
        '<button type="button" class="zp-btn zp-btn-secondary zp-btn-sm" id="zp-look-add">+ Adicionar combo</button>' +
        '<div class="zp-actions" style="margin-top:16px"><button type="button" class="zp-btn zp-btn-primary" id="zp-look-save">Salvar combos</button></div>';

      card.querySelectorAll('.zp-look-prod input').forEach(function (inp) {
        inp.addEventListener('change', function () {
          var block = inp.closest('.zp-look-combo');
          block.querySelector('.zp-look-ids').value = [...block.querySelectorAll('.zp-look-prod input:checked')].map(function (x) { return x.dataset.id; }).join(',');
        });
      });
      card.querySelectorAll('.zp-look-del').forEach(function (b) {
        b.addEventListener('click', function () {
          var idx = +b.closest('.zp-look-combo').dataset.i;
          combos.splice(idx, 1);
          if (!combos.length) { combos = [{ name: '', products: [] }]; }
          render();
        });
      });
      card.querySelector('#zp-look-add').addEventListener('click', function () {
        combos.push({ name: '', products: [] });
        render();
      });
      card.querySelector('#zp-look-save').addEventListener('click', async function () {
        var clean = [];
        card.querySelectorAll('.zp-look-combo').forEach(function (block) {
          var name = block.querySelector('.zp-look-name').value.trim();
          var disc = Math.max(0, Math.min(50, Number(block.querySelector('.zp-look-disc').value) || 0));
          var ids = block.querySelector('.zp-look-ids').value.split(',').map(Number).filter(Boolean);
          if (ids.length) { clean.push({ name: name, discount: disc, products: ids }); }
        });
        var btn = document.getElementById('zp-look-save');
        btnLoading(btn, true, 'Salvando...');
        try {
          var r = await api('look-combos', { method: 'POST', body: { combos: clean } }, 'Salvando combos do Monte o Look');
          combos = r.combos && r.combos.length ? r.combos : [{ name: '', products: [] }];
          toast('Combos salvos!');
          render();
        } catch (e) { toast(e.message, 'error'); }
        finally { btnLoading(btn, false); }
      });
    }
    render();
  };

  /* ── Precificação de produto (calculadora embutida na tela de produto) ── */
  async function zayaPricingInto(host) {
    host.innerHTML = '<div class="zp-card"><p style="color:var(--zp-text-dim)">Carregando precificacao...</p></div>';
    var card = host.querySelector('.zp-card');
    var defs;
    try { defs = await api('settings/calc'); }
    catch (e) { card.innerHTML = '<p style="color:#ff6b81">' + esc(e.message) + '</p>'; return; }

    var fee = function (k, fb) { var v = parseFloat(defs.values[k]); return isNaN(v) ? fb : v; };
    var fees = { pix: fee('zaya_fee_pix', 0.99), card: fee('zaya_fee_card', 2.99), boleto: fee('zaya_fee_boleto', 3.99) };
    var formOpts = '';

    function fmt(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

    function calc() {
      var custo = parseFloat(moneyToFloat(document.getElementById('zp-c-custo').value)) || 0;
      var venda = parseFloat(moneyToFloat(document.getElementById('zp-c-venda').value))
        || moneyToFloat((view.querySelector('[name=sale_price]') || { value: '' }).value)
        || moneyToFloat((view.querySelector('[name=regular_price]') || { value: '' }).value) || 0;
      var frete = parseFloat(moneyToFloat(document.getElementById('zp-c-frete').value)) || 0;
      var forma = document.getElementById('zp-c-forma').value;
      var taxa = parseFloat(document.getElementById('zp-c-taxa').value.replace(',', '.')) || 0;
      var alvo = parseFloat(document.getElementById('zp-c-alvo').value.replace(',', '.')) || 30;
      var minMargem = 10;

      var taxaRs = venda * taxa / 100;
      var custoTotal = custo + taxaRs + frete;
      var lucro = venda - custoTotal;
      var margem = venda > 0 ? (lucro / venda) * 100 : 0;
      var minimo = (custo + frete) > 0 && (taxa + minMargem) < 100 ? (custo + frete) / (1 - (taxa + minMargem) / 100) : 0;
      var precoAlvo = (taxa + alvo) < 100 ? (custo + frete) / (1 - (taxa + alvo) / 100) : 0;

      var lucroColor = margem < 0 ? '#ff4d5e' : (margem < 15 ? '#f5a623' : '#2ecc71');
      var warn = '';
      if (venda <= 0) {
        lucroColor = 'var(--zp-text-dim)';
        warn = '<p style="color:var(--zp-text-dim);margin:8px 0 0;font-size:13px">Digite o pre\u00e7o de venda acima (ou no campo Pre\u00e7o do produto) para calcular o lucro.</p>';
      }
      else if (margem < 0) { warn = '<p style="color:#ff4d5e;margin:8px 0 0;font-size:13px">&#9888; Pre\u00e7o abaixo do custo total — voc\u00ea est\u00e1 vendendo com PREJU\u00cdZO.</p>'; }
      else if (margem < 15) { warn = '<p style="color:#f5a623;margin:8px 0 0;font-size:13px">&#9888; Margem apertada (abaixo de 15%) — quase empate.</p>'; }
      else { warn = '<p style="color:#2ecc71;margin:8px 0 0;font-size:13px">&#10003; Margem saud\u00e1vel, pode vender.</p>'; }

      var lucroTxt = venda > 0 ? fmt(lucro) : '&mdash;';
      var margemTxt = venda > 0 ? margem.toFixed(1).replace('.', ',') + '% de margem' : 'aguardando pre\u00e7o';

      function zcard(label, tip, valueHtml, extraHtml) {
        return '<div class="zp-c-flash" style="border:1px solid var(--zp-border);border-radius:12px;padding:12px">' +
          '<div style="display:flex;align-items:center;gap:6px"><small style="opacity:.6">' + label + '</small>' +
          '<button type="button" class="zp-c-info" title="O que \u00e9 este c\u00e1lculo?">i</button></div>' +
          valueHtml +
          '<small class="zp-c-info-txt" style="display:none;margin-top:6px;font-size:11px;line-height:1.5;opacity:.85">' + tip + '</small>' +
          (extraHtml || '') + '</div>';
      }

      var tips = {
        lucro: 'Quanto sobra para voc\u00ea depois de pagar o custo do produto, a taxa do Mercado Pago e o frete. Se ficar negativo, voc\u00ea est\u00e1 vendendo no preju\u00edzo.',
        custo: 'Tudo o que voc\u00ea gasta para vender esse item: o pre\u00e7o que pagou no produto + a taxa do gateway + o frete que voc\u00ea arca.',
        minimo: 'O menor pre\u00e7o que voc\u00ea deve cobrar para garantir pelo menos 10% de lucro depois das taxas e do frete. Vender abaixo disso \u00e9 preju\u00edzo ou lucro irris\u00f3rio.',
        alvo: 'Quanto cobrar se voc\u00ea quiser atingir a margem desejada (ex.: 30%), j\u00e1 considerando a taxa do Mercado Pago e o frete.'
      };

      document.getElementById('zp-c-out').innerHTML =
        '<div class="zp-c-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px">' +
        '<div class="zp-c-flash" style="border:1px solid ' + lucroColor + ';border-radius:12px;padding:12px;background:' + lucroColor + '14"><div style="display:flex;align-items:center;gap:6px"><small style="opacity:.7">Lucro estimado</small><button type="button" class="zp-c-info" title="O que \u00e9 este c\u00e1lculo?">i</button></div><div id="zp-c-lucro" style="font-size:22px;font-weight:800;color:' + lucroColor + '">' + lucroTxt + '</div><small style="opacity:.7;color:' + lucroColor + '">' + margemTxt + '</small><small class="zp-c-info-txt" style="display:none;margin-top:6px;font-size:11px;line-height:1.5;opacity:.85">' + tips.lucro + '</small></div>' +
        zcard('Custo total', tips.custo, '<div style="font-size:16px;font-weight:700">' + fmt(custoTotal) + '</div>', '<small style="opacity:.6">custo ' + fmt(custo) + ' + taxa ' + fmt(taxaRs) + (frete > 0 ? ' + frete ' + fmt(frete) : '') + '</small>') +
        '</div>' +
        '<div class="zp-c-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">' +
        zcard('M\u00ednimo com 10% de margem', tips.minimo, '<div style="font-size:15px;font-weight:700">' + fmt(minimo) + '</div>') +
        zcard('Venda p/ lucrar ' + String(alvo).replace('.', ',') + '%', tips.alvo, '<div style="font-size:15px;font-weight:700">' + fmt(precoAlvo) + '</div>') +
        '</div>' +
        warn;
    }

    card.style.maxWidth = '720px';
    card.innerHTML =
      '<div class="zp-pricing-head"><strong>Calculadora de precifica&ccedil;&atilde;o</strong>' +
      '<small>Simule custo, frete e a taxa do Mercado Pago para ver o lucro e a margem antes de salvar.</small></div>' +
      '<div class="zp-c-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">' +
      '<label class="zp-field"><span>Custo do produto (R$)</span><input type="text" class="zp-money-calc" id="zp-c-custo" placeholder="0,00" value=""></label>' +
      '<label class="zp-field"><span>Pre\u00e7o de venda (R$)</span><input type="text" class="zp-money-calc" id="zp-c-venda" placeholder="0,00" value=""></label>' +
      '<label class="zp-field"><span>Forma de pagamento</span><select id="zp-c-forma"><option value="pix">Pix</option><option value="card">Cart\u00e3o de cr\u00e9dito</option><option value="boleto">Boleto</option></select></label>' +
      '<label class="zp-field"><span>Taxa MP (%)</span><input type="text" id="zp-c-taxa" placeholder="0,99" value="' + fees.pix + '"></label>' +
      '<label class="zp-field"><span>Frete (R$, opcional)</span><input type="text" class="zp-money-calc" id="zp-c-frete" placeholder="0,00" value=""></label>' +
      '<label class="zp-field"><span>Margem desejada (%)</span><input type="text" id="zp-c-alvo" placeholder="30" value="30"></label>' +
      '</div>' +
      '<div id="zp-c-out"></div>' +
      '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--zp-border)">' +
      '<p style="font-size:12px;opacity:.7;margin:0 0 8px">Taxas padr\u00e3o usadas na calculadora (ajuste quando o Mercado Pago mudar seu plano):</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<label style="font-size:12px">Pix % <input type="number" id="zp-fee-pix" step="0.01" value="' + fees.pix + '" style="width:70px"></label>' +
      '<label style="font-size:12px">Cart\u00e3o % <input type="number" id="zp-fee-card" step="0.01" value="' + fees.card + '" style="width:70px"></label>' +
      '<label style="font-size:12px">Boleto % <input type="number" id="zp-fee-boleto" step="0.01" value="' + fees.boleto + '" style="width:70px"></label>' +
      '<button type="button" class="zp-btn zp-btn-primary zp-btn-sm" id="zp-fee-save">Salvar taxas</button></div></div>';

    // Formato BR automatico (ponto milhar / virgula centavos) em custo e frete.
    // Aplicado ANTES do calc para o calculo sempre ler o valor ja formatado.
    card.querySelectorAll('.zp-money-calc').forEach(attachMoney);

    function bindCalc() {
      ['zp-c-custo', 'zp-c-venda', 'zp-c-frete', 'zp-c-taxa', 'zp-c-alvo'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', calc);
      });
      ['[name=regular_price]', '[name=sale_price]', '[name=discount]'].forEach(function (sel) {
        var el = view.querySelector(sel);
        if (el) {
          el.addEventListener('input', function () {
            // espelha o preco do produto no campo de venda da calculadora
            var s = moneyToFloat((view.querySelector('[name=sale_price]') || { value: '' }).value)
              || moneyToFloat((view.querySelector('[name=regular_price]') || { value: '' }).value);
            var v = document.getElementById('zp-c-venda');
            if (v && s) { v.value = fmtBR(parseFloat(s)); }
            calc();
          });
        }
      });
    }
    bindCalc();
    // pre-preenche o preco de venda com o preco do produto sendo editado
    (function () {
      var s = moneyToFloat((view.querySelector('[name=sale_price]') || { value: '' }).value)
        || moneyToFloat((view.querySelector('[name=regular_price]') || { value: '' }).value);
      var v = document.getElementById('zp-c-venda');
      if (v && s) { v.value = fmtBR(parseFloat(s)); }
    })();
    document.getElementById('zp-c-forma').addEventListener('change', function () {
      document.getElementById('zp-c-taxa').value = fees[this.value];
      calc();
    });
    // Explica o calculo ao clicar no "i" de cada card de resultado
    card.addEventListener('click', function (e) {
      var info = e.target.closest('.zp-c-info');
      if (!info) { return; }
      var txt = info.closest('.zp-c-flash').querySelector('.zp-c-info-txt');
      if (txt) { txt.style.display = (txt.style.display === 'none') ? 'block' : 'none'; }
    });
    document.getElementById('zp-fee-save').addEventListener('click', async function () {
      var btn = this;
      btnLoading(btn, true, 'Salvando...');
      try {
        await api('settings/calc', { method: 'POST', body: { zaya_fee_pix: document.getElementById('zp-fee-pix').value, zaya_fee_card: document.getElementById('zp-fee-card').value, zaya_fee_boleto: document.getElementById('zp-fee-boleto').value } }, 'Salvando taxas da calculadora');
        fees.pix = parseFloat(document.getElementById('zp-fee-pix').value) || 0.99;
        fees.card = parseFloat(document.getElementById('zp-fee-card').value) || 2.99;
        fees.boleto = parseFloat(document.getElementById('zp-fee-boleto').value) || 3.99;
        if (document.getElementById('zp-c-forma').value === 'pix') { document.getElementById('zp-c-taxa').value = fees.pix; }
        if (document.getElementById('zp-c-forma').value === 'card') { document.getElementById('zp-c-taxa').value = fees.card; }
        if (document.getElementById('zp-c-forma').value === 'boleto') { document.getElementById('zp-c-taxa').value = fees.boleto; }
        toast('Taxas salvas.');
        calc();
      } catch (e) { toast(e.message, 'error'); }
      finally { btnLoading(btn, false); }
    });
    calc();
  }

  /* ── Pedidos ── */
  ROUTES['#pedidos'] = async function () {
    view.innerHTML = '<h1 class="zp-view-title">Pedidos</h1><p class="zp-view-sub">Atualizar status dispara os e-mails nativos do WooCommerce</p>' +
      '<div class="zp-card" style="margin-bottom:14px"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<input type="text" id="zp-find-q" class="zp-search-input" placeholder="Buscar por rastreio, e-mail, telefone ou n&uacute;mero do pedido..." style="flex:1;min-width:220px">' +
      '<button type="button" id="zp-find-btn" class="zp-btn zp-btn-primary zp-btn-sm">Buscar</button></div>' +
      '<div id="zp-find-out" style="margin-top:10px"></div></div>' +
      '<div class="zp-card"><div id="zp-orders"><p style="color:var(--zp-text-dim)">Carregando...</p></div></div>';

    var findBox = document.getElementById('zp-find-out');
    async function runFind() {
      var q = document.getElementById('zp-find-q').value.trim();
      if (q.length < 3) { toast('Digite pelo menos 3 caracteres para buscar.'); return; }
      findBox.innerHTML = '<small style="color:var(--zp-text-dim)">Buscando...</small>';
      try {
        var res = await api('orders/find?q=' + encodeURIComponent(q));
        if (!res.length) { findBox.innerHTML = '<small>Nenhum pedido encontrado com "' + esc(q) + '".</small>'; return; }
        findBox.innerHTML = res.map(function (r) {
          return '<div class="zp-find-row" data-order="' + r.id + '" role="button" tabindex="0">' +
            '<strong>#' + esc(r.number) + '</strong> ' + esc(r.customer || '') +
            (r.tracking ? ' <span class="zp-badge">Rastreio: ' + esc(r.tracking) + '</span>' : '') +
            ' <span style="opacity:.6;font-size:11px">' + esc(r.date) + '</span>' +
            '<span class="zp-badge is-' + r.status + '" style="margin-left:auto">' + esc(r.status_label) + '</span></div>';
        }).join('');
        findBox.querySelectorAll('.zp-find-row').forEach(function (el) {
          el.addEventListener('click', function () { zpOrderDetails(el.dataset.order); });
        });
      } catch (e) { findBox.innerHTML = '<small style="color:#ff6b81">' + esc(e.message) + '</small>'; }
    }
    document.getElementById('zp-find-btn').addEventListener('click', runFind);
    document.getElementById('zp-find-q').addEventListener('keydown', function (e) { if ('Enter' === e.key) { runFind(); } });

    async function load(status) {
      var data = await api('orders' + (status ? '?status=' + encodeURIComponent(status) : ''));
      var box = document.getElementById('zp-orders');
      if (!data.length) { box.innerHTML = emptyState('Nenhum pedido ainda', 'Assim que a primeira venda acontecer, ela aparece aqui com todos os dados.'); return; }
      box.innerHTML = '<div class="zp-table-wrap"><table class="zp-table"><thead><tr><th>#</th><th>Cliente</th><th>Produtos</th><th>Data</th><th>Total</th><th>Status</th><th>Mudar status</th></tr></thead><tbody>' +
        data.map(function (o) {
          var prods = (o.products || []).map(function (p) {
            var img = p.image || '';
            return '<div class="zp-order-item" data-order="' + o.id + '" role="button" tabindex="0" title="Abrir ficha completa do pedido">' +
              (img ? '<img src="' + esc(img) + '" alt="" style="width:38px;height:38px;border-radius:8px;object-fit:cover;border:1px solid var(--zp-border);flex:none">' : '') +
              '<span>' + esc(p.name) + (p.qty > 1 ? ' <strong>&times;' + esc(p.qty) + '</strong>' : '') +
              '<br><small style="color:var(--zp-text-dim)">' + money(p.total) + '</small></span></div>';
          }).join('') || '<small style="color:var(--zp-text-dim)">&mdash;</small>';
          return '<tr><td><strong>' + esc(o.number) + '</strong></td><td>' + esc(o.customer || 'Cliente') + '<br><small class="zp-email-mini" title="' + esc(o.email) + '">' + esc(o.email) + '</small></td>' +
            '<td>' + prods + '</td>' +
            '<td>' + esc(o.date) + (o.payment_method ? '<br><small style="color:var(--zp-text-dim)">' + esc(o.payment_method) + '</small>' : '') + '</td><td>' + money(o.total) + '</td>' +
            '<td><span class="zp-badge is-' + o.status + '">' + esc(o.status_label) + '</span></td>' +
            '<td><select data-order="' + o.id + '" class="zp-btn zp-btn-sm zp-status-select">' +
            ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded'].map(function (s) {
              return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + ({ pending: 'Pendente', processing: 'Processando', 'on-hold': 'Aguardando', completed: 'Concluido', cancelled: 'Cancelado', refunded: 'Reembolsado' })[s] + '</option>';
            }).join('') + '</select></td></tr>';
        }).join('') + '</tbody></table></div>';

      box.querySelectorAll('.zp-order-item').forEach(function (el) {
        el.addEventListener('click', function () { zpOrderDetails(el.dataset.order); });
      });

      box.querySelectorAll('.zp-status-select').forEach(function (sel) {
        sel.onchange = async function () {
          var num = sel.closest('tr').querySelector('strong').textContent;
          btnLoading(sel, true);
          try {
            await api('orders/' + sel.dataset.order + '/status', { method: 'POST', body: { status: sel.value } }, 'Atualizando pedido ' + num + ' para "' + sel.options[sel.selectedIndex].text + '"');
            toast('Pedido ' + num + ' atualizado. Cliente notificado por e-mail.');
          } catch (e) { toast(e.message, 'error'); }
          btnLoading(sel, false);
        };
      });
    }
    await load('');
  };

  /* ── Reviews ── */
  ROUTES['#reviews'] = async function () {
    view.innerHTML = '<h1 class="zp-view-title">Avalia\u00e7\u00f5es</h1><p class="zp-view-sub">Modere as avalia\u00e7\u00f5es das clientes: aprove, desaprove ou exclua.</p>' +
      '<div class="zp-rev-tabs" id="zp-rev-tabs">' +
      '<button type="button" class="zp-rev-tab is-active" data-status="all">Todas <span class="zp-rev-count" id="zp-c-all"></span></button>' +
      '<button type="button" class="zp-rev-tab" data-status="hold">Pendentes <span class="zp-rev-count" id="zp-c-hold"></span></button>' +
      '<button type="button" class="zp-rev-tab" data-status="approve">Aprovadas <span class="zp-rev-count" id="zp-c-approve"></span></button>' +
      '</div>' +
      '<div id="zp-reviews"><p style="color:var(--zp-text-dim)">Carregando...</p></div>';

    var current = 'all';

    function statusBadge(st) {
      var map = { approve: ['Aprovada', 'is-publish'], hold: ['Pendente', ''], spam: ['Spam', 'is-cancel'], trash: ['Lixeira', 'is-cancel'] };
      var m = map[st] || [st, ''];
      return '<span class="zp-badge ' + m[1] + '">' + esc(m[0]) + '</span>';
    }

    async function load(status) {
      current = status;
      document.querySelectorAll('.zp-rev-tab').forEach(function (t) { t.classList.toggle('is-active', t.dataset.status === status); });
      var box = document.getElementById('zp-reviews');
      box.innerHTML = '<p style="color:var(--zp-text-dim)">Carregando...</p>';

      var data = [];
      try { data = await api('reviews?status=' + status); }
      catch (e) { box.innerHTML = '<p style="color:#ff6b81">' + esc(e.message) + '</p>'; return; }

      // contagens nas abas
      try {
        var all = await api('reviews?status=all');
        var hold = await api('reviews?status=hold');
        var appr = await api('reviews?status=approve');
        document.getElementById('zp-c-all').textContent = all.length;
        document.getElementById('zp-c-hold').textContent = hold.length;
        document.getElementById('zp-c-approve').textContent = appr.length;
      } catch (e) {}

      if (!data.length) {
        box.innerHTML = emptyState('Nada aqui', status === 'hold' ? 'Nenhuma avalia\u00e7\u00e3o aguardando aprova\u00e7\u00e3o.' : 'Sem avalia\u00e7\u00f5es nesse filtro.');
        return;
      }

      box.innerHTML = data.map(function (r) {
        var st = ('approved' === r.status) ? 'approve' : r.status;
        var stars = '';
        for (var i = 1; i <= 5; i++) { stars += '<span class="zp-rev-star' + (i <= r.rating ? ' is-on' : '') + '">&#9733;</span>'; }
        var initials = (r.author || '?').trim().split(/\s+/).map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
        var photos = (r.photos || []).slice(0, 3).map(function (p) {
          return '<img class="zp-rev-photo" src="' + esc(p) + '" alt="">';
        }).join('');
        return '<div class="zp-rev-card">' +
          '<div class="zp-rev-head">' +
          (r.product_image ? '<img class="zp-rev-prod" src="' + esc(r.product_image) + '" alt="">' : '') +
          '<div class="zp-rev-meta">' +
          '<span class="zp-rev-product">' + esc(r.product) + '</span>' +
          '<div class="zp-rev-author-line">' +
          '<span class="zp-rev-avatar">' + esc(initials) + '</span>' +
          '<strong>' + esc(r.author) + '</strong>' +
          (r.verified ? '<span class="zp-badge is-publish">Compra verificada</span>' : '') +
          '<span class="zp-rev-stars">' + stars + '</span>' +
          '</div>' +
          '</div>' +
          '<div class="zp-rev-side">' + statusBadge(st) + '<em>' + esc(r.date) + '</em></div>' +
          '</div>' +
          '<p class="zp-rev-content">' + esc(r.content) + '</p>' +
          (photos ? '<div class="zp-rev-photos">' + photos + '</div>' : '') +
          '<div class="zp-rev-actions">' +
          (st !== 'approve' ? '<button class="zp-btn zp-btn-primary zp-btn-sm" data-act="approve" data-id="' + r.id + '">Aprovar</button>' : '<button class="zp-btn zp-btn-secondary zp-btn-sm" data-act="unapprove" data-id="' + r.id + '">Desaprovar</button>') +
          '<button class="zp-btn zp-btn-danger zp-btn-sm" data-act="delete" data-id="' + r.id + '">Excluir</button>' +
          '</div></div>';
      }).join('');

      box.querySelectorAll('[data-act]').forEach(function (b) {
        b.onclick = async function () {
          var actLabels = { approve: 'Aprovando avalia\u00e7\u00e3o', unapprove: 'Desaprovando avalia\u00e7\u00e3o', delete: 'Excluindo avalia\u00e7\u00e3o' };
          btnLoading(b, true, actLabels[b.dataset.act] + '...');
          try {
            await api('reviews/' + b.dataset.id, { method: 'POST', body: { action: b.dataset.act } }, actLabels[b.dataset.act] + ' de ' + (b.closest('.zp-rev-card').querySelector('.zp-rev-product') || { textContent: '' }).textContent);
            toast(b.dataset.act === 'delete' ? 'Avalia\u00e7\u00e3o exclu\u00edda.' : 'Avalia\u00e7\u00e3o atualizada.');
            load(current);
          } catch (e) { toast(e.message, 'error'); }
        };
      });
    }

    document.getElementById('zp-rev-tabs').addEventListener('click', function (e) {
      var t = e.target.closest('.zp-rev-tab');
      if (t) { load(t.dataset.status); }
    });
    await load('all');
  };

  /* ── Passos guiados das configuracoes (MP / E-mail) ── */
  function zayaStepsBlock(title, bodyHtml) {
    return '<div class="zp-steps">' +
      '<button type="button" class="zp-steps-toggle" aria-expanded="false">' +
      '<span class="zp-steps-badge" aria-hidden="true">i</span><span>' + esc(title) + '</span>' +
      '<span class="zp-steps-arrow" aria-hidden="true">&#9662;</span></button>' +
      '<div class="zp-steps-body" hidden>' + bodyHtml + '</div></div>';
  }

  function zayaMpSteps() {
    return zayaStepsBlock('Como conectar (passo a passo)',
      '<ol>' +
      '<li><strong>Crie ou acesse sua conta</strong> no Mercado Pago em mercadopago.com.br.</li>' +
      '<li><strong>Abra as credenciais</strong>: use o botao no fim desta pagina &mdash; leva direto a pagina certa ("Suas integracoes" &gt; sua aplicacao).</li>' +
      '<li><strong>Nao tem aplicacao?</strong> Clique em "Criar aplicacao", nomeie (ex.: Todday), escolha <em>Pagamentos online</em>, marque que usa plataforma e selecione WooCommerce.</li>' +
      '<li><strong>Credenciais de producao</strong>: no menu lateral, clique em "Producao &gt; Credenciais de producao". Se pedir, ative informando setor do negocio e o site da loja (' + esc(location.origin) + ').</li>' +
      '<li><strong>Copie os 2 valores</strong> (Public Key e Access Token, ambos comecam com APP_USR) e cole nos campos abaixo.</li>' +
      '<li><strong>Salve</strong>. O Pix e o Cartao de credito sao ativados sozinhos na loja. Pronto para vender!</li>' +
      '</ol>' +
      '<p style="margin:10px 0 0;opacity:.75;font-size:12px">Dica: as credenciais de teste servem para simular compras sem dinheiro real. Deixando-as vazias, preencha apenas as de producao.</p>');
  }

  function zayaEmailSteps() {
    return zayaStepsBlock('Como configurar com Brevo (gratis, 300 e-mails/dia)',
      '<ol>' +
      '<li><strong>Crie a conta gratis</strong> em brevo.com (nao precisa cartao).</li>' +
      '<li>No painel do Brevo, clique no seu nome (canto superior) &gt; <strong>SMTP &amp; API</strong>.</li>' +
      '<li>Na secao <strong>SMTP</strong>, copie: servidor (<em>smtp-relay.brevo.com</em>), porta <em>587</em>, login (seu e-mail) e a <em>chave SMTP</em>.</li>' +
      '<li>Preencha os campos abaixo com esses dados e <strong>salve</strong>. A partir dai voce recebe aviso de cada pedido e a cliente recebe a confirmacao.</li>' +
      '</ol>');
  }

  function zayaFreteSteps() {
    return zayaStepsBlock('Como funciona o frete (passo a passo)',
      '<ol>' +
      '<li><strong>Frete gratis</strong>: ligue e escolha quando liberar. Em "A partir de um valor minimo", defina o valor (ex.: 79,99) &mdash; pedidos abaixo disso pagam o frete fixo.</li>' +
      '<li><strong>Modo teste</strong>: em "Quando liberar", marque <em>Sempre gratis</em> para testar compras sem custo nenhum. Lembre de voltar para o modo normal antes de vender de verdade!</li>' +
      '<li><strong>Frete fixo</strong>: cobre os pedidos que nao alcancam o minimo do gratis. Ajuste o valor e o nome que aparece no checkout.</li>' +
      '<li><strong>Salve</strong>: as mudancas valem na hora, no carrinho e no checkout. Faca um pedido-teste para conferir.</li>' +
      '</ol>');
  }

  /* ── Settings genericos ── */
  ['#identidade', '#vitrines', '#idade', '#social', '#poster', '#splash', '#robo', '#loja', '#pagamentos', '#email', '#frete'].forEach(function (hash) {    var group = hash.replace('#', '');
    ROUTES[hash] = async function () {
      view.innerHTML = '<h1 class="zp-view-title">' + esc(group.charAt(0).toUpperCase() + group.slice(1)) + '</h1><p class="zp-view-sub">Carregando...</p>';
      var s;
      try { s = await api('settings/' + group); }
      catch (e) { view.innerHTML += ''; toast(e.message, 'error'); return; }

      var html = '<h1 class="zp-view-title">' + esc(s.label) + '</h1><p class="zp-view-sub">Alteracoes registradas automaticamente no log de atividades</p>' +
        (group === 'pagamentos' ? zayaMpSteps() : '') +
        (group === 'email' ? zayaEmailSteps() : '') +
        (group === 'frete' ? zayaFreteSteps() : '') +
        '<form id="zp-settings-form" class="zp-card" style="max-width:640px">';
      for (var key in s.fields) {
        var f = s.fields[key];
        var val = s.values[key] != null ? s.values[key] : '';
        html += renderField(key, f, val);
      }
      html += '<div class="zp-actions"><button type="submit" class="zp-btn zp-btn-primary">Salvar alteracoes</button></div></form>';
      if (group === 'pagamentos') {
        html += '<div class="zp-card" style="max-width:640px;margin-top:16px">' +
          '<h3 style="margin-top:0">Diagn&oacute;stico</h3>' +
          '<p style="font-size:13px">Testa a credencial salva e simula um Pix de R$ 0,50 para mostrar o motivo <strong>exato</strong> de qualquer falha (a cobran&ccedil;a de teste expira sozinha se n&atilde;o for paga).</p>' +
          '<button type="button" id="zp-mp-diag" class="zp-btn zp-btn-primary">Checar conex&atilde;o com o Mercado Pago</button>' +
          '<div id="zp-mp-diag-out" style="margin-top:14px"></div></div>' +
          '<div class="zp-card" style="max-width:640px;margin-top:16px">' +
          '<h3 style="margin-top:0">Pegar as credenciais no Mercado Pago</h3>' +
          '<p>O botao abaixo abre a pagina exata das credenciais no site do Mercado Pago (Sua Integracoes &gt; sua aplicacao &gt; Credenciais de producao).</p>' +
          '<a class="zp-btn zp-btn-primary" href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener">Abrir credenciais do Mercado Pago &#8599;</a>' +
          '</div>' +
          '<div class="zp-card" style="max-width:640px;margin-top:16px">' +
          '<h3 style="margin-top:0">Tutorial em video</h3>' +
          '<p>Video curto mostrando o processo inteiro no Mercado Pago e na loja:</p>' +
          '<div style="position:relative;width:100%;padding-top:56.25%;border-radius:12px;overflow:hidden">' +
          '<iframe style="position:absolute;inset:0;width:100%;height:100%;border:0" src="https://www.youtube-nocookie.com/embed/hlqQP_MeHkw" title="Como configurar o Mercado Pago na loja" allowfullscreen loading="lazy"></iframe>' +
          '</div></div>';
      }
      view.innerHTML = html;

      /* Toggle dos blocos de instrucao (botao "i") */
      if (group === 'pagamentos' || group === 'email' || group === 'frete') {
        view.querySelectorAll('.zp-steps-toggle').forEach(function (t) {
          t.addEventListener('click', function () {
            var box = t.closest('.zp-steps');
            var body = box.querySelector('.zp-steps-body');
            var open = box.classList.toggle('is-open');
            t.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (body) { body.hidden = !open; }
          });
        });
      }

      /* Diagnostico Mercado Pago */
      if (group === 'pagamentos') {
        var diagBtn = document.getElementById('zp-mp-diag');
        if (diagBtn) {
          diagBtn.addEventListener('click', async function () {
            btnLoading(diagBtn, true, 'Checando...');
            var out = document.getElementById('zp-mp-diag-out');
            try {
              var r = await api('mp-diagnose');
              out.innerHTML = '<ul style="list-style:none;padding:0;margin:0;display:grid;gap:10px">' +
                r.checks.map(function (c) {
                  return '<li style="display:flex;gap:8px;align-items:flex-start">' +
                    '<span>' + ('ok' === c.status ? '\u2705' : '\u274C') + '</span>' +
                    '<span><strong>' + esc(c.label) + '</strong>' +
                    (c.detail ? '<br><span style="opacity:.78;font-size:12px;display:block;margin-top:2px">' + esc(c.detail) + '</span>' : '') +
                    '</span></li>';
                }).join('') + '</ul>';
              toast(r.ok ? 'Mercado Pago 100% operacional!' : 'Problemas encontrados — veja os itens com X.', r.ok ? '' : 'error');
            } catch (e) { toast(e.message, 'error'); }
            finally { btnLoading(diagBtn, false); }
          });
        }
      }

      /* ── Postador: testar token + como pegar credenciais da Meta ── */
      if (group === 'poster') {
        var postCard = document.createElement('div');
        postCard.className = 'zp-card';
        postCard.style.maxWidth = '640px';
        postCard.style.marginTop = '16px';
        postCard.innerHTML =
          '<h3 style="margin-top:0">Testar conex&atilde;o</h3>' +
          '<p style="font-size:13px">Clique abaixo para validar o token salvo com o Facebook e conferir se a p&aacute;gina/Instagram est&atilde;o prontos.</p>' +
          '<button type="button" id="zp-poster-test" class="zp-btn zp-btn-primary">Testar Token</button>' +
          '<div id="zp-poster-test-out" style="margin-top:14px"></div>';
        view.appendChild(postCard);

        var howCard = document.createElement('div');
        howCard.className = 'zp-card';
        howCard.style.maxWidth = '640px';
        howCard.style.marginTop = '16px';
        howCard.innerHTML =
          '<h3 style="margin-top:0">Como pegar as credenciais da Meta</h3>' +
          '<ol class="zp-steps" style="padding-left:20px;margin:0;display:grid;gap:8px;font-size:13.5px">' +
          '<li>Acesse <b>developers.facebook.com</b> e crie (ou abra) seu App.</li>' +
          '<li>Em <b>Ferramentas &gt; Graph API Explorer</b>, selecione o App, sua P&aacute;gina e a permiss&atilde;o <b>pages_manage_posts</b>.</li>' +
          '<li>Gere o token e troque por um de <b>longa dura&ccedil;&atilde;o</b> (op&ccedil;&atilde;o de troca de token do Debugger).</li>' +
          '<li>Cole o token e o <b>ID da P&aacute;gina</b> acima e clique em <b>Salvar altera&ccedil;&otilde;es</b>.</li>' +
          '<li>Para Instagram: a conta precisa ser <b>Business</b> conectada &agrave; p&aacute;gina (permiss&atilde;o <b>instagram_content_publish</b>) e o ID da conta deve ser preenchido.</li>' +
          '</ol>';
        view.appendChild(howCard);

        var postBtn = document.getElementById('zp-poster-test');
        if (postBtn) {
          postBtn.addEventListener('click', async function () {
            btnLoading(postBtn, true, 'Testando...');
            var out = document.getElementById('zp-poster-test-out');
            try {
              var r = await api('poster-test', { method: 'POST' }, 'Testando token do postador');
              out.innerHTML = r.ok
                ? '<p style="margin:0">\u2705 <strong>Token v&aacute;lido</strong> — ' + esc(r.message) + '</p>'
                : '<p style="margin:0;color:#ff6b6b">\u274C ' + esc(r.message) + '</p>';
              toast(r.ok ? 'Conexao com o Facebook OK.' : 'Falha na conexao — veja o motivo.', r.ok ? '' : 'error');
            } catch (e) { out.innerHTML = '<p style="margin:0;color:#ff6b6b">\u274C ' + esc(e.message) + '</p>'; toast(e.message, 'error'); }
            finally { btnLoading(postBtn, false); }
          });
        }
      }

                                    if (group === 'splash') {
        var TIP_MODE = 'Define o que toca na abertura: a Logo padrao e o fallback automatico quando nada esta ativo. Os videos/imagem cadastrados ficam guardados mesmo quando nao estao no modo ativo.';
        var TIP_EXPIRES = 'Define ate quando a campanha aparece na abertura do app. Passou a data, sai do ar e e deletado sozinho.';
        var TIP_DURATION = 'Quantos segundos a tela de abertura fica visivel (conta apos a midia carregar).';

        function infoIcon(tip) {
          return '<button type="button" class="zp-info" data-tip="' + esc(tip) + '" aria-label="Informacao">\u2139\uFE0F</button>';
        }

        var formEl = document.getElementById('zp-settings-form');
        var origActions = formEl.querySelector('.zp-actions');
        if (origActions) { origActions.style.display = 'none'; }
        var modeSel = formEl.querySelector('[name="zaya_splash_mode"]');

        view.addEventListener('click', function (e) {
          var info = e.target.closest('.zp-info');
          if (info) { toast(info.dataset.tip); }
        });

        function splashGetVal(name) {
          var el = formEl ? formEl.querySelector('[name="' + name + '"]') : null;
          return el ? el.value : '';
        }
        function splashSetVal(name, val) {
          var el = formEl ? formEl.querySelector('[name="' + name + '"]') : null;
          if (el) el.value = val;
        }

        /* ════════ CARTOES DE MODO ════════ */
        var modeCard = document.createElement('div');
        modeCard.className = 'zp-card';
        modeCard.style.cssText = 'max-width:680px;margin-top:14px';
        modeCard.innerHTML = '<h3 style="margin:0 0 4px">Escolha a tela de abertura ' + infoIcon(TIP_MODE) + '</h3>' +
          '<p style="font-size:12px;opacity:.65;margin:0 0 10px">A midia cadastrada fica guardada — trocar o modo nao apaga nada.</p>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px" id="zp-splash-modes">' +
          '<button type="button" class="zp-btn zp-mode-card" data-mode="logo"><span class="zmc-ico">\u2728</span>Logo padrao<small>Fallback eterno</small></button>' +
          '<button type="button" class="zp-btn zp-mode-card" data-mode="video"><span class="zmc-ico">\uD83C\uDFA5</span>Videos<small>Rotacao aleatoria</small></button>' +
          '<button type="button" class="zp-btn zp-mode-card" data-mode="imagem"><span class="zmc-ico">\uD83D\uDDBC\uFE0F</span>Imagem<small>Arte estatica</small></button>' +
          '</div><input type="hidden" name="zaya_splash_mode_force" style="display:none">';
        view.appendChild(modeCard);
        if (modeSel) { modeSel.style.display = 'none'; }

        var MODE_LABELS = { logo: '\u2728 Logo padrao', video: '\uD83C\uDFA5 Videos', imagem: '\uD83D\uDDBC\uFE0F Imagem' };
        function splashPaintMode() {
          var cur = splashGetVal('zaya_splash_mode') || 'logo';
          modeCard.querySelectorAll('.zp-mode-card').forEach(function (b) {
            var on = b.dataset.mode === cur;
            b.style.borderColor = on ? 'var(--zp-primary)' : 'rgba(212,175,55,.35)';
            b.style.background = on ? 'rgba(255,51,128,.14)' : '';
            b.style.color = on ? '#fff' : '';
          });
          tabVideos.style.display = cur === 'video' ? '' : 'none';
          tabImagem.style.display = cur === 'imagem' ? '' : 'none';
        }
        modeCard.querySelectorAll('.zp-mode-card').forEach(function (b) {
          b.onclick = function () {
            splashSetVal('zaya_splash_mode', b.dataset.mode);
            splashPaintMode();
            toast('Modo: ' + (MODE_LABELS[b.dataset.mode] || b.dataset.mode) + '. Salve para confirmar.');
          };
        });

        /* ════════ ABAS ════════ */
        var tabsBar = document.createElement('div');
        tabsBar.className = 'zp-card';
        tabsBar.style.cssText = 'max-width:680px;margin-top:14px;padding-bottom:0';
        tabsBar.innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap" id="zp-splash-tabs">' +
          '<button type="button" class="zp-btn zp-btn-secondary zp-tab-on" data-tab="videos">\uD83C\uDFA5 Videos</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-tab="imagem">\uD83D\uDDBC\uFE0F Imagem</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-tab="saudacoes">\uD83C\uDF05 Sauda\u00e7\u00f5es</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-tab="prazo">\u23F0 Prazo da campanha</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-tab="registro">\uD83D\uDCDA Registro</button>' +
          '</div>';
        view.appendChild(tabsBar);

        function makePane(title, sub) {
          var p = document.createElement('div');
          p.className = 'zp-card';
          p.style.cssText = 'max-width:680px;margin-top:-1px;border-top-left-radius:0';
          p.innerHTML = '<p class="zp-view-sub" style="margin:0 0 10px">' + esc(sub) + '</p>';
          view.appendChild(p);
          return p;
        }

        /* ── ABA VIDEOS ── */
        var tabVideos = makePane('videos', 'Rotacao aleatoria: cada abertura do app sorteia um video.');
        tabVideos.innerHTML =
          '<input type="file" id="zp-splash-file-video" accept="video/mp4,video/webm,video/quicktime" style="display:none">' +
          '<div id="zp-splash-vlist"></div>' +
          '<div style="margin-top:14px"><button type="button" id="zp-splash-up-video" class="zp-btn zp-btn-primary">+ Adicionar video (MP4/WebM, max 32MB)</button></div>' +
          '<span id="zp-splash-status-video" style="font-size:12px;display:block;margin-top:8px"></span>';

        var robotSleeping = CFG.robot === false || CFG.robot === 'dormindo';
        if (robotSleeping) {
          var rbEl = document.querySelector('.zp-robot');
          var cbEl = document.getElementById('zp-cartoon');
          if (rbEl) rbEl.style.display = 'none';
          if (cbEl) cbEl.style.display = 'none';
        }
        var splashVideos = [];
        async function splashLoadVideos() {
          try { var r = await api('splash-videos'); splashVideos = r.videos || []; } catch (e) { splashVideos = []; }
          splashPaintVideos();
        }
        function splashSchedText(item) {
          var s = item.s || ''; var e = item.e || '';
          if (s && e) return 'Exibe de ' + esc(s.replace('T', ' ')) + ' ate ' + esc(e.replace('T', ' '));
          if (s) return 'Exibe a partir de ' + esc(s.replace('T', ' '));
          if (e) return 'Exibe ate ' + esc(e.replace('T', ' '));
          return 'Sem agendamento — sempre no sorteio';
        }
        function splashPaintVideos() {
          var box = tabVideos.querySelector('#zp-splash-vlist');
          if (!splashVideos.length) {
            box.innerHTML = '<p style="font-size:12px;opacity:.6;margin:0 0 8px">Nenhum video na rotacao ainda.</p>';
            return;
          }
          box.innerHTML = splashVideos.map(function (item, idx) {
            var s = item.s || ''; var e = item.e || '';
            return '<div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08)">' +
              '<div style="display:flex;gap:12px;align-items:center">' +
              '<video src="' + esc(item.u) + '" muted playsinline style="width:110px;height:62px;object-fit:cover;border-radius:8px;border:1px solid rgba(212,175,55,.35);flex-shrink:0"></video>' +
              '<div style="flex:1;min-width:0"><strong style="font-size:13px">Video ' + (idx + 1) + '</strong>' +
              '<p style="margin:2px 0 0;font-size:11px;color:#d4af37">' + splashSchedText(item) + '</p></div>' +
              '<button type="button" class="zp-btn zp-splash-vdel" data-url="' + esc(item.u) + '" style="border-color:#e05c5c;color:#e05c5c">Deletar</button></div>' +
              '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">' +
              '<label style="font-size:11px;opacity:.75;display:flex;align-items:center;gap:5px">Inicio<input type="datetime-local" class="zp-sched-s" data-url="' + esc(item.u) + '" value="' + esc(s) + '" style="background:transparent;color:inherit;border:1px solid var(--zp-border);border-radius:6px;padding:5px;color-scheme:dark"></label>' +
              '<label style="font-size:11px;opacity:.75;display:flex;align-items:center;gap:5px">Fim<input type="datetime-local" class="zp-sched-e" data-url="' + esc(item.u) + '" value="' + esc(e) + '" style="background:transparent;color:inherit;border:1px solid var(--zp-border);border-radius:6px;padding:5px;color-scheme:dark"></label>' +
              '<button type="button" class="zp-btn zp-splash-schedsave" data-url="' + esc(item.u) + '">Salvar horario</button>' +
              '</div></div>';
          }).join('');
          tabVideos.querySelectorAll('.zp-splash-vdel').forEach(function (b) {
            b.onclick = async function () {
              btnLoading(b, true);
              try {
                await api('splash-video-delete', { method: 'POST', body: { url: b.dataset.url } }, 'Deletando video');
                await splashLoadVideos();
                toast('\u2713 Video deletado do site e da biblioteca.');
              } catch (e) { toast(e.message, 'error'); btnLoading(b, false); }
            };
          });
          tabVideos.querySelectorAll('.zp-splash-schedsave').forEach(function (b) {
            b.onclick = async function () {
              btnLoading(b, true);
              try {
                await api('splash-video-schedule', { method: 'POST', body: {
                  url: b.dataset.url,
                  s: tabVideos.querySelector('.zp-sched-s[data-url="' + CSS.escape(b.dataset.url) + '"]').value,
                  e: tabVideos.querySelector('.zp-sched-e[data-url="' + CSS.escape(b.dataset.url) + '"]').value
                } }, 'Salvando agendamento');
                await splashLoadVideos();
                toast('Agendamento salvo!');
              } catch (e) { toast(e.message, 'error'); btnLoading(b, false); }
            };
          });
        }
        splashLoadVideos();

        var addBtn = tabVideos.querySelector('#zp-splash-up-video');
        addBtn.onclick = function () { tabVideos.querySelector('#zp-splash-file-video').click(); };
        tabVideos.querySelector('#zp-splash-file-video').onchange = async function () {
          var f = this.files[0];
          if (!f) return;
          var stV = tabVideos.querySelector('#zp-splash-status-video');
          stV.textContent = 'Enviando ' + f.name + '... aguarde';
          addBtn.disabled = true; addBtn.style.opacity = '.45'; addBtn.style.pointerEvents = 'none';
          try {
            var fd = new FormData(); fd.append('video', f);
            var res = await api('splash-video', { method: 'POST', body: fd, raw: true }, 'Enviando video...');
            await splashLoadVideos();
            stV.textContent = '\u2713 Video adicionado! Agora ha ' + res.total + ' na rotacao.';
            setTimeout(function () { stV.textContent = ''; }, 4000);
          } catch (e) { stV.textContent = ''; toast(e.message, 'error'); }
          addBtn.disabled = false; addBtn.style.opacity = ''; addBtn.style.pointerEvents = '';
        };

        /* ── ABA IMAGEM ── */
        var tabImagem = makePane('imagem', 'Uma arte fixa exibida na abertura.');
        tabImagem.innerHTML =
          '<input type="file" id="zp-splash-file-image" accept="image/jpeg,image/png,image/webp" style="display:none">' +
          '<div id="zp-splash-iprev"></div>' +
          '<div style="margin-top:12px"><button type="button" id="zp-splash-up-image" class="zp-btn">Enviar imagem (JPG/PNG, max 8MB)</button></div>' +
          '<span id="zp-splash-status-image" style="font-size:12px;display:block;margin-top:8px"></span>';

        function splashPaintImage() {
          var iurl = splashGetVal('zaya_splash_image_url');
          var box = tabImagem.querySelector('#zp-splash-iprev');
          box.innerHTML = iurl
            ? '<img src="' + esc(iurl) + '" style="max-width:100%;max-height:240px;border-radius:12px;border:1px solid rgba(212,175,55,.4);animation:zpFadeIn .5s ease both">' +
              '<div style="margin-top:10px"><button type="button" id="zp-splash-idel" class="zp-btn" style="border-color:#e05c5c;color:#e05c5c">Deletar imagem</button></div>'
            : '<p style="font-size:12px;opacity:.6;margin:0">Nenhuma imagem cadastrada.</p>';
          var delBtn = box.querySelector('#zp-splash-idel');
          if (delBtn) {
            delBtn.onclick = async function () {
              btnLoading(delBtn, true);
              try {
                await api('splash-delete-media', { method: 'POST', body: { type: 'image' } }, 'Deletando imagem');
                splashSetVal('zaya_splash_image_url', '');
                splashPaintImage();
                toast('\u2713 Imagem deletada do site e da biblioteca.');
              } catch (e) { toast(e.message, 'error'); btnLoading(delBtn, false); }
            };
          }
        }
        splashPaintImage();

        var imgBtn = tabImagem.querySelector('#zp-splash-up-image');
        imgBtn.onclick = function () { tabImagem.querySelector('#zp-splash-file-image').click(); };
        tabImagem.querySelector('#zp-splash-file-image').onchange = async function () {
          var f = this.files[0];
          if (!f) return;
          var stI = tabImagem.querySelector('#zp-splash-status-image');
          stI.textContent = 'Enviando ' + f.name + '... aguarde';
          imgBtn.disabled = true; imgBtn.style.opacity = '.45'; imgBtn.style.pointerEvents = 'none';
          try {
            var fd = new FormData(); fd.append('image', f);
            var res = await api('splash-image', { method: 'POST', body: fd, raw: true }, 'Enviando imagem...');
            splashSetVal('zaya_splash_image_url', res.url);
            stI.textContent = '\u2713 Imagem enviada!';
          } catch (e) { stI.textContent = ''; toast(e.message, 'error'); }
          imgBtn.disabled = false; imgBtn.style.opacity = ''; imgBtn.style.pointerEvents = '';
          splashPaintImage();
        };

        /* ── ABA SAUDACOES ── */
        var tabGreet = makePane('saudacoes', 'Mini-video ou imagem curtinha mostrado 1x por periodo, antes do conteudo. Bom dia \u2600\uFE0F / Boa tarde \uD83C\uDF24\uFE0F / Boa noite \uD83C\uDF19.');
        var GREET_META = [
          ['morning', '\u2600\uFE0F Bom dia'],
          ['day', '\uD83C\uDF24\uFE0F Boa tarde'],
          ['evening', '\uD83C\uDF19 Boa noite']
        ];
        tabGreet.innerHTML = '<div id="zp-splash-greet-list"></div>';
        async function splashLoadGreet() {
          var g = {};
          try { g = await api('splash-greet'); } catch (e) {}
          var list = tabGreet.querySelector('#zp-splash-greet-list');
          list.innerHTML = GREET_META.map(function (m) {
            var url = g[m[0]] || '';
            return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08)">' +
              '<strong style="font-size:13px">' + m[1] + '</strong> ' +
              (url
                ? '<span style="font-size:11px;color:#7bd47b">\u2713 configurada</span>'
                : '<span style="font-size:11px;opacity:.55">— vazia</span>') +
              '<div style="margin-top:8px">' + (url
                ? (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)
                    ? '<video src="' + esc(url) + '" controls muted playsinline style="max-width:220px;border-radius:8px;border:1px solid rgba(212,175,55,.35)"></video>'
                    : '<img src="' + esc(url) + '" style="max-width:220px;max-height:120px;border-radius:8px;border:1px solid rgba(212,175,55,.35)">')
                : '') + '</div>' +
              '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">' +
              '<input type="file" accept="video/mp4,video/webm,image/jpeg,image/png,image/webp" style="display:none" data-period="' + m[0] + '">' +
              '<button type="button" class="zp-btn zp-greet-up" data-period="' + m[0] + '">' + (url ? 'Trocar' : 'Enviar midia') + '</button>' +
              (url ? '<button type="button" class="zp-btn zp-greet-del" data-period="' + m[0] + '" style="border-color:#e05c5c;color:#e05c5c">Remover</button>' : '') +
              '</div></div>';
          }).join('');
          list.querySelectorAll('.zp-greet-up').forEach(function (b) {
            b.onclick = function () {
              list.querySelector('input[data-period="' + b.dataset.period + '"]').click();
            };
          });
          list.querySelectorAll('input[type=file]').forEach(function (inp) {
            inp.onchange = async function () {
              var f = inp.files[0];
              if (!f) return;
              var period = inp.dataset.period;
              try {
                var fd = new FormData();
                fd.append('media', f);
                fd.append('period', period);
                await api('splash-greet-save', { method: 'POST', body: fd, raw: true }, 'Enviando saudacao...');
                toast('Saudacao salva! Ela aparece 1x por periodo na abertura do app.');
                await splashLoadGreet();
              } catch (e) { toast(e.message, 'error'); }
            };
          });
          list.querySelectorAll('.zp-greet-del').forEach(function (b) {
            b.onclick = async function () {
              btnLoading(b, true);
              try {
                await api('splash-greet-delete', { method: 'POST', body: { period: b.dataset.period } }, 'Removendo...');
                await splashLoadGreet();
              } catch (e) { toast(e.message, 'error'); btnLoading(b, false); }
            };
          });
        }
        splashLoadGreet();

        /* ── ABA PRAZO ── */
        var quick = makePane('prazo', 'Define ate quando TODA a campanha fica no ar. ' + TIP_EXPIRES);
        quick.innerHTML =
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="zp-splash-quick">' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-days="">Sem prazo</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-days="1">Ate amanha</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-days="7">7 dias</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-days="15">15 dias</button>' +
          '<button type="button" class="zp-btn zp-btn-secondary" data-days="30">30 dias</button>' +
          '</div>' +
          '<p style="font-size:12px;opacity:.65;margin:0">Ou escolha a data exata no campo "Expira em" do formulario acima.</p>';
        quick.querySelectorAll('#zp-splash-quick button').forEach(function (b) {
          b.onclick = function () {
            var days = b.dataset.days;
            var d = new Date();
            if (days !== '') { d.setDate(d.getDate() + parseInt(days, 10)); }
            var iso = days === '' ? '' : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            splashSetVal('zaya_splash_expires', iso);
            toast(days === '' ? 'Campanha sem prazo de fim.' : 'Campanha por ' + days + ' dia(s). Salve para confirmar.');
          };
        });

        /* ── ABA REGISTRO ── */
        var regPane = makePane('registro', 'Historico de midias: adicionadas e deletadas, com autor e datas.');
        regPane.innerHTML =
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">' +
          '<select id="zp-reg-status" style="background:transparent;color:inherit;border:1px solid var(--zp-border);border-radius:8px;padding:6px"><option value="">Todos</option><option value="add">Adicionados</option><option value="del">Deletados</option></select>' +
          '<label style="font-size:11px;opacity:.7;display:flex;align-items:center;gap:4px">De <input type="date" id="zp-reg-from" style="background:transparent;color:inherit;border:1px solid var(--zp-border);border-radius:6px;padding:5px;color-scheme:dark"></label>' +
          '<label style="font-size:11px;opacity:.7;display:flex;align-items:center;gap:4px">Ate <input type="date" id="zp-reg-to" style="background:transparent;color:inherit;border:1px solid var(--zp-border);border-radius:6px;padding:5px;color-scheme:dark"></label>' +
          '<button type="button" id="zp-reg-refresh" class="zp-btn">Atualizar</button></div>' +
          '<div id="zp-reg-list"></div>';
        function splashRenderReg() {
          var stf = regPane.querySelector('#zp-reg-status').value;
          var from = regPane.querySelector('#zp-reg-from').value;
          var to = regPane.querySelector('#zp-reg-to').value;
          api('splash-media-log').then(function (r) {
            var rows = (r.log || []).filter(function (e) {
              if (stf && e.a !== stf) return false;
              var d = (e.at || '').slice(0, 10);
              if (from && d < from) return false;
              if (to && d > to) return false;
              return true;
            });
            regPane.querySelector('#zp-reg-list').innerHTML = rows.length
              ? '<table class="zp-table"><thead><tr><th>Status</th><th>Tipo</th><th>Quem</th><th>Quando</th></tr></thead><tbody>' +
                rows.map(function (e) {
                  return '<tr><td>' + (e.a === 'add'
                    ? '<span class="zp-badge is-approved">Adicionado</span>'
                    : '<span class="zp-badge is-pending">Deletado</span>') + '</td>' +
                    '<td style="font-size:12px">' + esc(e.t) + '</td>' +
                    '<td style="font-size:12px">' + esc(e.by) + '</td>' +
                    '<td style="font-size:12px">' + esc((e.at || '').slice(0, 16).replace('T', ' ')) + '</td></tr>';
                }).join('') + '</tbody></table>'
              : '<p style="font-size:12px;opacity:.6;margin:0">Nenhum registro no periodo filtrado.</p>';
          }).catch(function () {});
        }
        regPane.querySelector('#zp-reg-refresh').onclick = splashRenderReg;
        splashRenderReg();

        /* ════════ SALVAR ════════ */
        var saveCard = document.createElement('div');
        saveCard.className = 'zp-card';
        saveCard.style.cssText = 'max-width:680px;margin-top:14px';
        saveCard.innerHTML = '<h3 style="margin:0 0 4px">Tudo pronto? ' + infoIcon(TIP_DURATION) + '</h3>' +
          '<p style="font-size:12px;opacity:.65;margin:0 0 10px">Confira modo, duracao e prazo no formulario acima antes de salvar.</p>' +
          '<button type="button" id="zp-splash-save" class="zp-btn zp-btn-primary">Salvar alteracoes</button>';
        view.appendChild(saveCard);

        saveCard.querySelector('#zp-splash-save').onclick = function () {
          formEl.requestSubmit ? formEl.requestSubmit() : formEl.querySelector('[type=submit]').click();
        };

        splashPaintMode();

        /* ── Motor das abas: mostra 1 pane por vez ── */
        var panes = { videos: tabVideos, imagem: tabImagem, saudacoes: tabGreet, prazo: quick, registro: regPane };
        tabsBar.querySelectorAll('[data-tab]').forEach(function (b) {
          b.onclick = function () {
            tabsBar.querySelectorAll('[data-tab]').forEach(function (x) { x.classList.toggle('zp-tab-on', x === b); });
            Object.keys(panes).forEach(function (k) { panes[k].style.display = k === b.dataset.tab ? '' : 'none'; });
          };
        });
        Object.keys(panes).forEach(function (k) { panes[k].style.display = k === 'videos' ? '' : 'none'; });
      }

      document.getElementById('zp-settings-form').onsubmit = async function (e) {
        e.preventDefault();
        var btn = e.target.querySelector('[type=submit]');
        btnLoading(btn, true, 'Salvando...');
        try {
          var body = {};
          for (var key in s.fields) {
            var input = e.target.querySelector('[name="' + key + '"]');
            if (!input) { continue; }
            body[key] = s.fields[key].type === 'bool' ? (input.checked ? '1' : '0') : input.value;
          }
          await api('settings/' + group, { method: 'POST', body: body }, 'Salvando "' + s.label + '"');
          toast('"' + s.label + '" salvo. Alteracao registrada no log.');
          /* Sempre volta ao dashboard apos salvar. */
          if (group === 'robo') {
            var dormindo = document.body.classList.contains('zp-robot-sleeping');
            document.body.classList.toggle('zp-robot-sleeping', body.zaya_robot_enabled === 'dormindo');
            void dormindo;
          }
          setTimeout(function () { location.hash = '#dashboard'; }, 900);
          return;
        } catch (err) { toast(err.message, 'error'); }
        btnLoading(btn, false);
      };

      /* ── Assistente: feed real do Instagram (só na aba Social) ── */
      if (group === 'social') {
        var wiz = document.createElement('div');
        wiz.className = 'zp-card';
        wiz.style.maxWidth = '640px';
        wiz.style.marginTop = '16px';
        wiz.innerHTML =
          '<h3>Feed real do Instagram na home</h3>' +
          '<div class="zp-ig-modes">' +
          '<button type="button" class="zp-btn zp-btn-secondary zp-ig-mode is-active" data-mode="curadoria">Escolher fotos da biblioteca <small>(sem senha)</small></button>' +
          '<button type="button" class="zp-btn zp-btn-secondary zp-ig-mode" data-mode="behold">Conectar via Behold <small>(precisa login do Instagram)</small></button>' +
          '</div>' +
          '<div id="zp-ig-mode-curadoria">' +
          '<p style="font-size:13px;color:var(--zp-text-dim);margin-bottom:12px">Clique nas fotos que devem aparecer na home. Para adicionar fotos novas do Instagram, use <b>Enviar fotos</b> abaixo.</p>' +
          '<div class="zp-actions" style="margin-bottom:12px">' +
          '<label class="zp-btn zp-btn-primary zp-btn-sm" for="zp-ig-upload">+ Enviar fotos do Instagram</label>' +
          '<input type="file" id="zp-ig-upload" accept="image/*" multiple style="display:none">' +
          '</div>' +
          '<div id="zp-ig-lib" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px;max-height:300px;overflow-y:auto;margin-bottom:14px"><span style="color:var(--zp-text-dim);grid-column:1/-1">Carregando...</span></div>' +
          '<button type="button" class="zp-btn zp-btn-primary" id="zp-ig-lib-save">Salvar selecao</button>' +
          '</div>' +
          '<div id="zp-ig-mode-behold" style="display:none">' +
          '<ol class="zp-steps">' +
          '<li>Clique em <b>Abrir Behold.so</b> e cadastre usando o Google.</li>' +
          '<li>Escolha <b>Basic Instagram</b>, conecte o perfil da loja e clique em <b>Create widget</b>.</li>' +
          '<li>Copie o link curto gerado e cole abaixo.</li>' +
          '</ol>' +
          '<div class="zp-actions" style="margin-bottom:14px">' +
          '<a class="zp-btn zp-btn-secondary" href="https://app.behold.so/add-source/basic-instagram" target="_blank" rel="noopener">Abrir Behold.so &#8599;</a>' +
          '</div>' +
          '<label class="zp-field"><span>Cole aqui o link do seu widget</span>' +
          '<input type="text" id="zp-ig-link" placeholder="Cole o link do widget que o Behold gerar"></label>' +
          '<button type="button" class="zp-btn zp-btn-primary" id="zp-ig-save">Conectar feed ao site</button>' +
          '</div>' +
          '<p id="zp-ig-status" style="font-size:12.5px;margin-top:14px;color:var(--zp-text-dim)"></p>';
        view.appendChild(wiz);

        /* Alternancia de modos */
        var mode = 'curadoria';
        function setMode(m) {
          mode = m;
          document.getElementById('zp-ig-mode-curadoria').style.display  = m === 'curadoria' ? '' : 'none';
          document.getElementById('zp-ig-mode-behold').style.display     = m === 'behold' ? '' : 'none';
          wiz.querySelectorAll('.zp-ig-mode').forEach(function (b) { b.classList.toggle('is-active', b.dataset.mode === m); });
        }
        wiz.querySelectorAll('.zp-ig-mode').forEach(function (b) { b.onclick = function () { setMode(b.dataset.mode); }; });

        /* Estado atual */
        api('instagram-widget').then(function (st) {
          var status = document.getElementById('zp-ig-status');
          if (!status || !status.textContent) {
            status.textContent = st.embed ? '\u2713 Conectado via Behold.' : (st.media_ids && st.media_ids.length ? '\u2713 Modo curadoria ativo com ' + st.media_ids.length + ' foto(s).' : 'Nenhum feed configurado \u2014 a home usa imagens da marca.');
          }
          if (st.embed) { setMode('behold'); }
        }).catch(function () {});

        /* Curadoria: grade da biblioteca + selecao */
        var sel = [];
        var libGrid = document.getElementById('zp-ig-lib');

        function syncSelection(grid, ids) {
          grid.querySelectorAll('img').forEach(function (img) {
            img.style.borderColor = ids.indexOf(parseInt(img.dataset.id, 10)) !== -1 ? 'var(--zp-primary)' : 'transparent';
          });
        }

        /* Upload direto dentro do seletor: sobe pro Instagram-grid sem sair daqui */
        document.getElementById('zp-ig-upload').addEventListener('change', async function () {
          if (!this.files.length) { return; }
          btnLoading(this, true, 'Enviando...');
          try {
            for (var fi = 0; fi < this.files.length; fi++) {
              var f = this.files[fi];
              if (f.size > 20 * 1024 * 1024) { toast('"' + f.name + '" passa de 20MB.', 'error'); continue; }
              var fd = new FormData();
              fd.append('image', f);
              var res = await api('media', { method: 'POST', body: fd, raw: true }, 'Enviando "' + f.name + '"');
              if (sel.indexOf(res.id) === -1) { sel.push(res.id); } // ja marca como selecionada
            }
            // Recarrega a biblioteca e mantem a selecao
            var libs = await api('media-library?per_page=36');
            libGrid.innerHTML = libs.map(function (m) {
              return '<img src="' + m.thumb + '" data-id="' + m.id + '" title="' + esc(m.title) + '" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid transparent">';
            }).join('');
            libGrid.querySelectorAll('img').forEach(function (img) {
              img.onclick = function () {
                var id = parseInt(img.dataset.id, 10);
                var pos = sel.indexOf(id);
                if (pos === -1) { if (sel.length >= 8) { toast('Maximo de 8 fotos no grid.', 'error'); return; } sel.push(id); } else { sel.splice(pos, 1); }
                syncSelection(libGrid, sel);
              };
            });
            syncSelection(libGrid, sel);
            toast('Fotos enviadas e selecionadas. Salve para publicar no site.');
          } catch (e) { toast(e.message, 'error'); }
          btnLoading(this, false);
        });

        api('media-library?per_page=36').then(function (libs) {
          var grid = libGrid;
          if (!libs.length) { grid.innerHTML = '<span style="color:var(--zp-text-dim);grid-column:1/-1">Biblioteca vazia. Use "Enviar fotos" acima.</span>'; return; }
          grid.innerHTML = libs.map(function (m) {
            return '<img src="' + m.thumb + '" data-id="' + m.id + '" title="' + esc(m.title) + '" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid transparent">';
          }).join('');
          api('instagram-media').then(function (cur) {
            sel = cur.ids || [];
            syncSelection(grid, sel);
          }).catch(function () {});
          grid.querySelectorAll('img').forEach(function (img) {
            img.onclick = function () {
              var id = parseInt(img.dataset.id, 10);
              var pos = sel.indexOf(id);
              if (pos === -1) { if (sel.length >= 8) { toast('Maximo de 8 fotos no grid.', 'error'); return; } sel.push(id); } else { sel.splice(pos, 1); }
              syncSelection(grid, sel);
            };
          });
        }).catch(function () {});


        document.getElementById('zp-ig-lib-save').onclick = async function () {
          btnLoading(this, true, 'Salvando...');
          try {
            await api('instagram-media', { method: 'POST', body: { ids: sel } }, 'Salvando ' + sel.length + ' foto(s) do Instagram');
            toast(sel.length ? 'Grid atualizado com ' + sel.length + ' foto(s).' : 'Selecao esvaziada.');
          } catch (e) { toast(e.message, 'error'); }
          btnLoading(this, false);
        };

        document.getElementById('zp-ig-save').onclick = async function () {
          var link = document.getElementById('zp-ig-link').value.trim();
          if (!link) { toast('Cole o link do widget primeiro.', 'error'); return; }
          btnLoading(this, true, 'Conectando...');
          try {
            await api('instagram-widget', { method: 'POST', body: { link: link } }, 'Conectando feed do Instagram');
            toast('Feed conectado! A home ja mostra as fotos do Instagram.');
          } catch (e) { toast(e.message, 'error'); }
          btnLoading(this, false);
        };
      }
    };
  });

  /* ── Hero da Home ── */
  ROUTES['#hero'] = async function () {
    view.innerHTML = '<h1 class="zp-view-title">Hero da Home</h1><p class="zp-view-sub">Carregando...</p>';
    var cfg;
    try { cfg = await api('hero-config'); } catch (e) { toast(e.message, 'error'); return; }
    var mini = (cfg.mini || []).join('\n');
    var cta1 = cfg.cta1 || {}; var cta2 = cfg.cta2 || {};
    var selo = cfg.selo || []; var imgs = cfg.imagens || [];

    function heroImgBlock(idx, url, alt, label) {
      var id = 'hero-img-' + idx + '-' + Math.random().toString(36).slice(2, 6);
      return '<div class="zp-hero-img" data-idx="' + idx + '">' +
        '<div class="zp-rep-img-preview">' + (url ? '<img src="' + esc(url) + '" alt="">' : '<span>Sem imagem</span>') + '</div>' +
        '<input type="hidden" class="zp-hero-img-url" value="' + esc(url) + '">' +
        '<label class="zp-btn zp-btn-secondary zp-btn-sm" for="' + id + '">' + (url ? 'Trocar' : 'Escolher imagem') + '</label>' +
        '<input type="file" id="' + id + '" accept="image/*" style="display:none">' +
        '<input type="text" class="zp-hero-img-alt" placeholder="Texto alternativo (alt)" value="' + esc(alt) + '">' +
        '<small style="color:var(--zp-text-dim)">' + esc(label) + '</small>' +
        '</div>';
    }

    var html =
      '<h1 class="zp-view-title">Hero da Home</h1>' +
      '<p class="zp-view-sub">Se\u00e7\u00e3o de abertura da p\u00e1gina inicial. Salvar publica na hora.</p>' +
      '<form id="zp-hero-form" class="zp-card" style="max-width:720px">' +
      '<label class="zp-field"><span>Olhar (linha curta acima do t\u00edtulo)</span><input type="text" name="eyebrow" value="' + esc(cfg.eyebrow) + '"></label>' +
      '<label class="zp-field"><span>T\u00edtulo</span><input type="text" name="titulo" value="' + esc(cfg.titulo) + '"><small style="color:var(--zp-text-dim)">Use *palavra* para deixar em it\u00e1lico (ex.: Vista-se de *hist\u00f3rias*.)</small></label>' +
      '<label class="zp-field"><span>Subt\u00edtulo</span><textarea name="sub" rows="3">' + esc(cfg.sub) + '</textarea></label>' +
      '<div class="zp-hero-cols">' +
      '<label class="zp-field"><span>Selo \u2014 1\u00aa linha</span><input type="text" name="selo1" value="' + esc(selo[0] || '') + '"></label>' +
      '<label class="zp-field"><span>Selo \u2014 2\u00aa linha</span><input type="text" name="selo2" value="' + esc(selo[1] || '') + '"></label>' +
      '</div>' +
      '<label class="zp-field"><span>Itens de apoio (um por linha)</span><textarea name="mini" rows="3">' + esc(mini) + '</textarea></label>' +
      '<h3 style="margin:18px 0 6px">Bot\u00e3o principal</h3>' +
      '<div class="zp-hero-cols">' +
      '<label class="zp-field"><span>Texto</span><input type="text" name="cta1_label" value="' + esc(cta1.label) + '"></label>' +
      '<label class="zp-field"><span>Link</span><input type="text" name="cta1_url" value="' + esc(cta1.url) + '"></label>' +
      '</div>' +
      '<h3 style="margin:18px 0 6px">Bot\u00e3o texto</h3>' +
      '<div class="zp-hero-cols">' +
      '<label class="zp-field"><span>Texto</span><input type="text" name="cta2_label" value="' + esc(cta2.label) + '"></label>' +
      '<label class="zp-field"><span>Link</span><input type="text" name="cta2_url" value="' + esc(cta2.url) + '"></label>' +
      '</div>' +
      '<h3 style="margin:18px 0 6px">Fotos do hero</h3>' +
      '<div class="zp-hero-imgs">' +
      heroImgBlock(0, imgs[0] && imgs[0].url, imgs[0] && imgs[0].alt, 'Foto principal (destaque)') +
      heroImgBlock(1, imgs[1] && imgs[1].url, imgs[1] && imgs[1].alt, 'Foto secund\u00e1ria 1') +
      heroImgBlock(2, imgs[2] && imgs[2].url, imgs[2] && imgs[2].alt, 'Foto secund\u00e1ria 2') +
      '</div>' +
      '<div class="zp-actions"><button type="submit" class="zp-btn zp-btn-primary">Salvar altera\u00e7\u00f5es</button></div>' +
      '</form>';
    view.innerHTML = html;

    view.querySelectorAll('.zp-hero-img input[type=file]').forEach(function (input) {
      input.onchange = async function () {
        if (!input.files.length) { return; }
        var wrap = input.closest('.zp-hero-img');
        var label = wrap.querySelector('label');
        var old = label.textContent;
        label.textContent = 'Enviando...';
        try {
          var url = await uploadImage(input.files[0]);
          wrap.querySelector('.zp-hero-img-url').value = url;
          wrap.querySelector('.zp-rep-img-preview').innerHTML = '<img src="' + esc(url) + '" alt="">';
          label.textContent = 'Trocar';
          toast('Imagem enviada e otimizada.');
        } catch (e) { toast(e.message, 'error'); label.textContent = old; }
      };
    });

    var q = function (n) { return document.querySelector('.zp-card [name="' + n + '"]'); };
    document.getElementById('zp-hero-form').onsubmit = async function (ev) {
      ev.preventDefault();
      var btn = this.querySelector('button[type=submit]');
      btnLoading(btn, true, 'Salvando...');
      var body = {
        eyebrow: q('eyebrow').value,
        titulo: q('titulo').value,
        sub: q('sub').value,
        selo: [q('selo1').value, q('selo2').value],
        mini: q('mini').value.split('\n').map(function (s) { return s.trim(); }),
        cta1: { label: q('cta1_label').value, url: q('cta1_url').value },
        cta2: { label: q('cta2_label').value, url: q('cta2_url').value },
        imagens: Array.prototype.map.call(document.querySelectorAll('.zp-hero-img'), function (w) {
          return { url: w.querySelector('.zp-hero-img-url').value, alt: w.querySelector('.zp-hero-img-alt').value };
        })
      };
      try {
        await api('hero-config', { method: 'POST', body: body }, 'Salvando Hero da Home');
        toast('Hero atualizado. A home j\u00e1 reflete as mudan\u00e7as.');
      } catch (e) { toast(e.message, 'error'); }
      btnLoading(btn, false);
    };
  };

  ROUTES['#ofertas'] = async function () {
    view.innerHTML = '<h1 class="zp-view-title">Ofertas de Checkout</h1><p class="zp-view-sub">Carregando...</p>';
    var cfg;
    try { cfg = await api('ofertas-config'); } catch (e) { toast(e.message, 'error'); return; }

    var html =
      '<h1 class="zp-view-title">Ofertas de Checkout</h1>' +
      '<p class="zp-view-sub">Aumente o ticket m\u00e9dio: um produto sugerido no checkout (bump) e outro na p\u00e1gina de obrigado (upsell).</p>' +
      '<form id="zp-ofertas-form" class="zp-card" style="max-width:760px">' +

      '<h3 style="margin:0 0 4px">Order bump (checado no checkout)</h3>' +
      '<p style="font-size:12.5px;color:var(--zp-text-dim);margin:0 0 12px">O cliente marca o checkbox e o produto entra no mesmo pedido e pagamento.</p>' +
      '<label class="zp-field" style="display:flex;align-items:center;gap:10px"><input type="checkbox" name="bump_on"' + (cfg.bump.on ? ' checked' : '') + ' style="width:auto"><span style="margin:0">Bump ativo</span></label>' +
      '<input type="hidden" name="bump_product_id" value="' + esc(cfg.bump.product_id) + '">' +
      '<div class="zp-field"><span>Produto do bump</span>' +
      '<div class="zp-pick" data-pick="bump">' +
      '<div class="zp-actions">' +
      '<input type="text" class="zp-pick-q" placeholder="Buscar produto pelo nome..." style="flex:1;padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text);outline:none">' +
      '</div>' +
      '<div class="zp-pick-results"></div>' +
      '<div class="zp-pick-sel"></div>' +
      '</div></div>' +
      '<label class="zp-field"><span>T\u00edtulo exibido no checkout</span><input type="text" name="bump_titulo" value="' + esc(cfg.bump.titulo) + '"></label>' +
      '<label class="zp-field"><span>Pre\u00e7o promocional (opcional)</span><input type="text" name="bump_preco" placeholder="Ex.: 49,90 — vazio usa o pre\u00e7o do produto" value="' + esc(cfg.bump.preco ? 'R$ ' + Number(cfg.bump.preco).toFixed(2).replace('.', ',') : '') + '"></label>' +

      '<hr style="border:0;border-top:1px solid var(--zp-border);margin:22px 0">' +
      '<h3 style="margin:0 0 4px">Upsell (p\u00f3s-compra)</h3>' +
      '<p style="font-size:12.5px;color:var(--zp-text-dim);margin:0 0 12px">Card na p\u00e1gina "Pedido recebido": clicar cria um novo pedido com este item e leva ao pagamento.</p>' +
      '<label class="zp-field" style="display:flex;align-items:center;gap:10px"><input type="checkbox" name="upsell_on"' + (cfg.upsell.on ? ' checked' : '') + ' style="width:auto"><span style="margin:0">Upsell ativo</span></label>' +
      '<input type="hidden" name="upsell_product_id" value="' + esc(cfg.upsell.product_id) + '">' +
      '<div class="zp-field"><span>Produto do upsell</span>' +
      '<div class="zp-pick" data-pick="upsell">' +
      '<div class="zp-actions">' +
      '<input type="text" class="zp-pick-q" placeholder="Buscar produto pelo nome..." style="flex:1;padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text);outline:none">' +
      '</div>' +
      '<div class="zp-pick-results"></div>' +
      '<div class="zp-pick-sel"></div>' +
      '</div></div>' +
      '<label class="zp-field"><span>T\u00edtulo</span><input type="text" name="upsell_titulo" value="' + esc(cfg.upsell.titulo) + '"></label>' +
      '<label class="zp-field"><span>Subt\u00edtulo</span><input type="text" name="upsell_sub" value="' + esc(cfg.upsell.sub) + '"></label>' +
      '<label class="zp-field"><span>Texto do bot\u00e3o</span><input type="text" name="upsell_botao" value="' + esc(cfg.upsell.botao) + '"></label>' +
      '<label class="zp-field"><span>Pre\u00e7o promocional (opcional)</span><input type="text" name="upsell_preco" placeholder="Ex.: 39,90 — vazio usa o pre\u00e7o do produto" value="' + esc(cfg.upsell.preco ? 'R$ ' + Number(cfg.upsell.preco).toFixed(2).replace('.', ',') : '') + '"></label>' +

      '<div class="zp-actions" style="margin-top:18px"><button type="submit" class="zp-btn zp-btn-primary">Salvar altera\u00e7\u00f5es</button></div>' +
      '</form>';
    view.innerHTML = html;

    function renderPick(pick, currentId) {
      var box = document.querySelector('[data-pick="' + pick + '"]');
      var q = box.querySelector('.zp-pick-q');
      var results = box.querySelector('.zp-pick-results');
      var sel = box.querySelector('.zp-pick-sel');
      var hidden = document.querySelector('[name="' + pick + '_product_id"]');

      function renderSelected() {
        var id = parseInt(hidden.value, 10);
        if (id > 0) {
          var opts = { method: 'GET' };
          api('products/' + id).then(function (p) {
            sel.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-top:8px;padding:8px 10px;background:rgba(180,85,45,.08);border:1px solid rgba(180,85,45,.3);border-radius:8px">' +
              (p.image ? '<img src="' + p.image + '" style="width:34px;height:34px;object-fit:cover;border-radius:6px" alt="">' : '') +
              '<span style="flex:1"><strong>' + esc(p.name) + '</strong><br><small style="color:var(--zp-text-dim)">' + money(p.price) + '</small></span>' +
              '<button type="button" class="zp-btn zp-btn-secondary zp-btn-sm" data-clear="' + pick + '">Trocar</button></div>';
            sel.querySelector('[data-clear]').onclick = function () { hidden.value = ''; sel.innerHTML = ''; };
          }).catch(function () { hidden.value = ''; sel.innerHTML = ''; });
        } else { sel.innerHTML = ''; }
      }

      var timer;
      q.addEventListener('input', function () {
        clearTimeout(timer);
        var v = q.value.trim();
        if (!v) { results.innerHTML = ''; return; }
        timer = setTimeout(async function () {
          results.innerHTML = '<p style="color:var(--zp-text-dim);font-size:12.5px;margin:6px 0">Buscando...</p>';
          var data;
          try { data = await api('products?search=' + encodeURIComponent(v)); } catch (e) { results.innerHTML = ''; return; }
          if (!data.length) { results.innerHTML = '<p style="color:var(--zp-text-dim);font-size:12.5px;margin:6px 0">Nada encontrado.</p>'; return; }
          results.innerHTML = '<div style="border:1px solid var(--zp-border);border-radius:8px;margin-top:6px;overflow:hidden;max-height:220px;overflow-y:auto">' +
            data.map(function (p) {
              return '<button type="button" data-pid="' + p.id + '" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:8px 10px;background:var(--zp-bg);border:0;border-bottom:1px solid var(--zp-border);cursor:pointer;color:var(--zp-text)">' +
                (p.image ? '<img src="' + p.image + '" style="width:30px;height:30px;object-fit:cover;border-radius:6px" alt="">' : '<span style="width:30px;height:30px;border-radius:6px;background:var(--zp-border);display:inline-block"></span>') +
                '<span style="flex:1"><strong>' + esc(p.name) + '</strong><br><small style="color:var(--zp-text-dim)">' + money(p.price) + '</small></span></button>';
            }).join('') + '</div>';
          results.querySelectorAll('[data-pid]').forEach(function (b) {
            b.onclick = function () {
              hidden.value = b.dataset.pid;
              q.value = '';
              results.innerHTML = '';
              renderSelected();
            };
          });
        }, 300);
      });

      renderSelected();
    }

    renderPick('bump', cfg.bump.product_id);
    renderPick('upsell', cfg.upsell.product_id);

    var q = function (n) { return document.querySelector('#zp-ofertas-form [name="' + n + '"]'); };
    document.getElementById('zp-ofertas-form').onsubmit = async function (ev) {
      ev.preventDefault();
      var btn = this.querySelector('button[type=submit]');
      btnLoading(btn, true, 'Salvando...');
      function preco(n) {
        var v = q(n).value.trim();
        return v ? v.replace('R$', '').trim() : '';
      }
      var body = {
        bump: { on: q('bump_on').checked, product_id: parseInt(q('bump_product_id').value, 10) || 0, titulo: q('bump_titulo').value, preco: preco('bump_preco') },
        upsell: { on: q('upsell_on').checked, product_id: parseInt(q('upsell_product_id').value, 10) || 0, titulo: q('upsell_titulo').value, sub: q('upsell_sub').value, botao: q('upsell_botao').value, preco: preco('upsell_preco') }
      };
      if ((body.bump.on && !body.bump.product_id) || (body.upsell.on && !body.upsell.product_id)) {
        toast('Selecione um produto para cada oferta ativa.', 'error');
        btnLoading(btn, false);
        return;
      }
      try {
        await api('ofertas-config', { method: 'POST', body: body }, 'Salvando ofertas');
        toast('Ofertas salvas. Valem no checkout e na p\u00e1gina de obrigado.');
      } catch (e) { toast(e.message, 'error'); }
      btnLoading(btn, false);
    };
  };

  function renderField(key, f, val) {
    var ph = f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '';
    switch (f.type) {
      case 'bool':
        return '<label class="zp-field" style="display:flex;align-items:center;gap:10px"><input type="checkbox" name="' + key + '"' + ('1' === String(val) || true === val ? ' checked' : '') + ' style="width:auto"><span style="margin:0">' + esc(f.label) + '</span></label>';
      case 'password':
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><input type="password" name="' + key + '" value="' + esc(val) + '" autocomplete="off"' + ph + '></label>';
      case 'number':
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><input type="number" name="' + key + '" value="' + esc(val) + '"' + ph + '></label>';
      case 'color':
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><input type="color" class="zp-color" name="' + key + '" value="' + esc(val || '#000000') + '"></label>';
      case 'json':
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><textarea name="' + key + '" style="font-family:monospace;font-size:12px">' + esc(val) + '</textarea></label>';
      case 'textarea':
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><textarea name="' + key + '"' + ph + '>' + esc(val) + '</textarea></label>';
      case 'select':
        var optsHtml = '';
        var optsObj = f.options || {};
        for (var ov in optsObj) {
          if (!Object.prototype.hasOwnProperty.call(optsObj, ov)) continue;
          optsHtml += '<option value="' + esc(ov) + '"' + (String(val) === String(ov) ? ' selected' : '') + '>' + esc(optsObj[ov]) + '</option>';
        }
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><select name="' + key + '">' + optsHtml + '</select></label>';
      case 'date':
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><input type="date" name="' + key + '" value="' + esc(val) + '"></label>';
      default:
        return '<label class="zp-field"><span>' + esc(f.label) + '</span><input type="text" name="' + key + '" value="' + esc(val) + '"' + ph + '></label>';
    }
  }

  /* ═════════════ EDITORES VISUAIS (cards repetiveis, sem JSON) ═════════════ */

  async function uploadImage(file) {
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Imagem acima de 20MB. Reduza a qualidade ou tamanho antes de enviar.');
    }
    var fd = new FormData();
    fd.append('image', file);
    var res = await api('media', { method: 'POST', body: fd, raw: true }, 'Enviando e otimizando imagem');
    return res.url;
  }

  function repImageField(item, key, label) {
    var url = item[key] || '';
    var id = 'img-' + key + '-' + Math.random().toString(36).slice(2, 8);
    return '<div class="zp-rep-img" data-key="' + key + '">' +
      '<div class="zp-rep-img-preview">' + (url ? '<img src="' + esc(url) + '" alt="">' : '<span>Sem imagem</span>') + '</div>' +
      '<input type="hidden" value="' + esc(url) + '">' +
      '<label class="zp-btn zp-btn-secondary zp-btn-sm" for="' + id + '">Escolher imagem</label>' +
      '<input type="file" id="' + id + '" accept="image/*" style="display:none">' +
      '<small style="color:var(--zp-text-dim)">' + esc(label || '') + '</small>' +
      '</div>';
  }

  function bindRepImages(container) {
    container.querySelectorAll('.zp-rep-img input[type=file]').forEach(function (input) {
      input.onchange = async function () {
        if (!input.files.length) { return; }
        var wrap = input.closest('.zp-rep-img');
        var label = wrap.querySelector('label');
        var old = label.textContent;
        label.textContent = 'Enviando...';
        try {
          var url = await uploadImage(input.files[0]);
          wrap.querySelector('input[type=hidden]').value = url;
          wrap.querySelector('.zp-rep-img-preview').innerHTML = '<img src="' + esc(url) + '" alt="">';
          label.textContent = 'Trocar';
          toast('Imagem enviada e otimizada.');
        } catch (e) {
          toast(e.message, 'error');
          label.textContent = old;
        }
      };
    });
  }

  function repTools() {
    return '<div class="zp-rep-tools">' +
      '<button type="button" class="zp-btn zp-btn-secondary zp-btn-sm zp-rep-up" title="Mover para cima">&#8593;</button>' +
      '<button type="button" class="zp-btn zp-btn-secondary zp-btn-sm zp-rep-down" title="Mover para baixo">&#8595;</button>' +
      '<button type="button" class="zp-btn zp-btn-danger zp-btn-sm zp-rep-del">Remover</button>' +
      '</div>';
  }

  function repBindTools(container, onChange) {
    container.querySelectorAll('.zp-rep-card').forEach(function (card) {
      card.querySelector('.zp-rep-del').onclick = function () {
        if (!confirm('Remover este item?')) { return; }
        card.remove();
        onChange();
      };
      card.querySelector('.zp-rep-up').onclick = function () {
        var prev = card.previousElementSibling;
        if (prev && prev.classList.contains('zp-rep-card')) { card.parentNode.insertBefore(card, prev); onChange(); }
      };
      card.querySelector('.zp-rep-down').onclick = function () {
        var next = card.nextElementSibling;
        if (next && next.classList.contains('zp-rep-card')) { card.parentNode.insertBefore(next, card); onChange(); }
      };
    });
  }

  function saveBar(btn, fn) {
    btn.disabled = true; btn.textContent = 'Salvando...';
    Promise.resolve(fn()).then(function () {
      toast('Salvo! O site ja esta atualizado.');
    }).catch(function (e) {
      toast(e.message, 'error');
    }).finally(function () {
      btn.disabled = false; btn.textContent = 'Salvar alteracoes';
    });
  }

  /* ── Banners (slides do hero) ── */
  ROUTES['#banners'] = async function () {
    var d = await api('banners');
    view.innerHTML =
      '<h1 class="zp-view-title">Banners</h1>' +
      '<p class="zp-view-sub">Slides do topo da loja. A primeira imagem aparece no computador e no celular; o botao leva onde voce escolher.</p>' +
      '<div id="zp-rep-list"></div>' +
      '<div class="zp-actions" style="margin-top:14px">' +
      '<button type="button" class="zp-btn zp-btn-secondary" id="zp-add-banner">+ Adicionar banner</button>' +
      '<button type="button" class="zp-btn zp-btn-primary" id="zp-save-banners">Salvar alteracoes</button>' +
      '</div>';

    var list = document.getElementById('zp-rep-list');

    function slideCard(s) {
      s = s || {};
      var el = document.createElement('div');
      el.className = 'zp-rep-card';
      el.innerHTML =
        '<div style="display:grid;grid-template-columns:150px 1fr;gap:16px">' +
        repImageField({ img_desktop: s.img_desktop }, 'img_desktop', 'Imagem principal (ideal: 1600x900)') +
        '<div>' +
        '<label class="zp-field"><span>Titulo</span><input type="text" data-f="title" value="' + esc(s.title || '') + '" placeholder="Ex: Sua beleza, sua assinatura"></label>' +
        '<label class="zp-field"><span>Frase de apoio</span><input type="text" data-f="subtitle" value="' + esc(s.subtitle || '') + '" placeholder="Ex: A nova colecao chegou"></label>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        '<label class="zp-field"><span>Texto do botao</span><input type="text" data-f="cta_text" value="' + esc(s.cta_text || '') + '" placeholder="Ex: Ver Nova Colecao"></label>' +
        '<label class="zp-field"><span>Link do botao</span><input type="text" data-f="cta_link" value="' + esc(s.cta_link || '') + '" placeholder="/categoria-produto/maquiagem/"></label>' +
        '</div></div></div>' + repTools();
      return el;
    }

    function rebuild() {
      list.innerHTML = '';
      (d.slides || []).forEach(function (s) { list.appendChild(slideCard(s)); });
      if (!(d.slides || []).length) {
        list.innerHTML = emptyState('Nenhum banner ainda', 'Adicione o primeiro slide do topo da loja.');
        var add = document.createElement('div'); add.appendChild(slideCard({}));
        list.querySelector('.zp-empty').after(add.firstChild);
      }
      bindRepImages(list);
      repBindTools(list, function () {});
    }
    rebuild();

    document.getElementById('zp-add-banner').onclick = function () {
      var blank = list.querySelector('.zp-empty');
      if (blank) { blank.remove(); }
      list.appendChild(slideCard({}));
      bindRepImages(list);
      repBindTools(list, function () {});
    };

    document.getElementById('zp-save-banners').onclick = function () {
      var slides = [];
      list.querySelectorAll('.zp-rep-card').forEach(function (card) {
        slides.push({
          img_desktop: card.querySelector('[data-key=img_desktop] input[type=hidden]').value,
          img_mobile: card.querySelector('[data-key=img_desktop] input[type=hidden]').value,
          title: card.querySelector('[data-f=title]').value,
          subtitle: card.querySelector('[data-f=subtitle]').value,
          cta_text: card.querySelector('[data-f=cta_text]').value,
          cta_link: card.querySelector('[data-f=cta_link]').value
        });
      });
      saveBar(this, async function () {
        var r = await api('banners', { method: 'POST', body: { slides: slides } }, 'Salvando ' + slides.length + ' banner(s)');
        d.slides = slides;
        if (!r.total && !slides.length) { throw new Error('Nada para salvar.'); }
      }.bind(this));
    }.bind(document.getElementById('zp-save-banners'));
  };

  /* ── VIDEOS DE FUNDO DO HERO (rotacao com texto animado) ── */
  ROUTES['#videos'] = async function () {
    var d = await api('hero-videos');
    view.innerHTML =
      '<h1 class="zp-view-title">Vídeos do Hero</h1>' +
      '<p class="zp-view-sub">Videos em rotacao no topo da home. Cada video digita o nome de uma promocao ou produto. MP4 ate 60MB; use clipes curtos (5-15s) em loop.</p>' +

      '<div class="zp-card" style="max-width:640px;margin-bottom:16px">' +
      '<h3>Modo do hero</h3>' +
      '<div class="zp-actions" id="zp-hero-modes">' +
      '<button type="button" class="zp-btn zp-btn-secondary zp-mode-btn" data-mode="videos">Vídeos em rotação</button>' +
      '<button type="button" class="zp-btn zp-btn-secondary zp-mode-btn" data-mode="imagens">Slides de imagem</button>' +
      '<button type="button" class="zp-btn zp-btn-secondary zp-mode-btn" data-mode="off">Hero desativado</button>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--zp-text-dim);margin:10px 0 0">No modo "Slides de imagem", use a aba Banners para configurar as imagens.</p>' +
      '</div>' +

      '<div class="zp-card" style="max-width:640px;margin-bottom:16px">' +
      '<h3>Seus vídeos</h3>' +
      '<div id="zp-rep-list"></div>' +
      '<div class="zp-actions" style="margin-top:14px">' +
      '<button type="button" class="zp-btn zp-btn-secondary" id="zp-add-video">+ Adicionar vídeo</button>' +
      '<button type="button" class="zp-btn zp-btn-primary" id="zp-save-videos">Salvar alteracoes</button>' +
      '</div></div>';

    var list = document.getElementById('zp-rep-list');

    /* Modo do hero: estado + salvamento */
    var modeBtns = document.querySelectorAll('#zp-hero-modes .zp-mode-btn');
    function paintModes(current) {
      modeBtns.forEach(function (b) {
        var on = b.dataset.mode === current;
        b.classList.toggle('zp-mode-on', on);
        b.style.borderColor = on ? 'var(--zp-primary)' : '';
        b.style.color = on ? 'var(--zp-primary)' : '';
      });
    }
    api('hero-videos').then(function (st) { paintModes(st.mode || 'videos'); }).catch(function () {});
    modeBtns.forEach(function (b) {
      b.onclick = async function () {
        btnLoading(b, true);
        try {
          var r = await api('hero-mode', { method: 'POST', body: { mode: b.dataset.mode } }, 'Alterando modo do hero');
          paintModes(r.mode);
          toast(r.mode === 'off' ? 'Hero desativado na home.' : r.mode === 'imagens' ? 'Home agora usa slides de imagem.' : 'Home agora usa videos em rotacao.');
        } catch (e) { toast(e.message, 'error'); }
        btnLoading(b, false);
      };
    });

    var list = document.getElementById('zp-rep-list');

    function videoCard(v) {
      v = v || {};
      var el = document.createElement('div');
      el.className = 'zp-rep-card';
      el.innerHTML =
        '<label class="zp-field"><span>Arquivo de video (MP4)</span>' +
        '<input type="file" accept="video/mp4,video/webm" data-video-input style="color:var(--zp-text-dim)">' +
        '<input type="hidden" data-f="video_url" value="' + esc(v.video_url || '') + '">' +
        '<small class="zp-video-status" style="color:var(--zp-text-dim)">' + (v.video_url ? '&#10003; Video carregado' : 'Nenhum arquivo ainda') + '</small></label>' +
        '<div class="zp-video-preview"></div>' +
        '<label class="zp-field"><span>Poster (imagem de capa, opcional)</span>' +
        '<input type="text" data-f="poster" value="' + esc(v.poster || '') + '" placeholder="URL da imagem de capa"></label>' +
        '<label class="zp-field"><span>Texto animado * <small style="color:var(--zp-text-dim)">(promocao ou produto)</small></span>' +
        '<input type="text" data-f="texto" required maxlength="60" value="' + esc(v.texto || '') + '" placeholder="Ex: KIT MAQUIAGEM COMPLETA — 20% OFF"></label>' +
        '<div class="zp-form-grid">' +
        '<label class="zp-field"><span>Texto do botao</span><input type="text" data-f="cta_text" value="' + esc(v.cta_text || '') + '" placeholder="Ex: Aproveitar oferta"></label>' +
        '<label class="zp-field"><span>Link do botao</span><input type="text" data-f="cta_link" value="' + esc(v.cta_link || '') + '" placeholder="/produto/..."></label>' +
        '</div>' + repTools();
      return el;
    }

    function bindVideos(container) {
      container.querySelectorAll('[data-video-input]').forEach(function (input) {
        input.onchange = async function () {
          var f = input.files[0];
          if (!f) { return; }
          if (f.size > 60 * 1024 * 1024) { toast('Video passa de 60MB.', 'error'); input.value = ''; return; }

          var card = input.closest('.zp-rep-card');
          var status = card.querySelector('.zp-video-status');
          var prev = card.querySelector('.zp-video-preview');

          // Preview imediato enquanto verifica/envia
          var objURL = URL.createObjectURL(f);
          prev.innerHTML =
            '<span class="zp-video-thumb is-pending"><video src="' + objURL + '" muted autoplay loop></video>' +
            '<button type="button" class="zp-thumb-x zp-video-x" title="Remover">&#10005;</button></span>';
          status.textContent = 'Verificando duracao...';
          var xBtn = prev.querySelector('.zp-video-x');
          xBtn.onclick = function () {
            URL.revokeObjectURL(objURL);
            card.querySelector('[data-f=video_url]').value = '';
            prev.innerHTML = '';
            status.textContent = 'Nenhum arquivo ainda';
          };

          // LIMITE: 20 segundos (verificado no navegador antes do upload)
          var dur = await new Promise(function (res) {
            var v = document.createElement('video');
            v.preload = 'metadata';
            v.src = objURL;
            v.onloadedmetadata = function () { res(v.duration || -1); };
            v.onerror = function () { res(-1); };
          });
          if (dur > 20.1) {
            xBtn.onclick();
            status.textContent = 'Video com ' + Math.round(dur) + 's — limite de 20s.';
            toast('O video tem ' + Math.round(dur) + ' segundos. O limite do hero e de 20 segundos. Corte o video e tente novamente.', 'error');
            return;
          }

          status.textContent = 'Enviando video...';
          try {
            var fd = new FormData();
            fd.append('image', f);
            var res = await api('media', { method: 'POST', body: fd, raw: true }, 'Enviando video (pode demorar)');
            card.querySelector('[data-f=video_url]').value = res.url;
            prev.innerHTML =
              '<span class="zp-video-thumb"><video src="' + esc(res.url) + '" muted autoplay loop></video>' +
              '<button type="button" class="zp-thumb-x zp-video-x" title="Remover video">&#10005;</button></span>';
            prev.querySelector('.zp-video-x').onclick = function () {
              card.querySelector('[data-f=video_url]').value = '';
              prev.innerHTML = '';
              status.textContent = 'Nenhum arquivo ainda';
              toast('Video removido do card.');
            };
            URL.revokeObjectURL(objURL);
            status.innerHTML = '&#10003; Video carregado';
            toast('Video enviado.');
          } catch (e) {
            xBtn.onclick();
            status.textContent = 'Falhou: ' + e.message;
            toast(e.message, 'error');
          }
        };
      });
    }

    /* Preview de videos ja salvos ao carregar a tela */
    function renderSavedVideoPreviews(container) {
      container.querySelectorAll('.zp-rep-card').forEach(function (card) {
        var url = card.querySelector('[data-f=video_url]').value;
        if (!url) { return; }
        var prev = card.querySelector('.zp-video-preview');
        if (prev && !prev.innerHTML) {
          prev.innerHTML =
            '<span class="zp-video-thumb"><video src="' + esc(url) + '" muted loop></video>' +
            '<button type="button" class="zp-thumb-x zp-video-x" title="Remover video">&#10005;</button></span>';
          prev.querySelector('.zp-video-x').onclick = function () {
            card.querySelector('[data-f=video_url]').value = '';
            prev.innerHTML = '';
            card.querySelector('.zp-video-status').textContent = 'Nenhum arquivo ainda';
          };
        }
      });
    }

    function rebuild() {
      list.innerHTML = '';
      (d.videos || []).forEach(function (v) { list.appendChild(videoCard(v)); });
      if (!(d.videos || []).length) {
        list.innerHTML = emptyState('Nenhum video ainda', 'Adicione o primeiro video de fundo da home.');
      }
      bindVideos(list);
      renderSavedVideoPreviews(list);
      repBindTools(list, function () {});
    }
    rebuild();

    document.getElementById('zp-add-video').onclick = function () {
      list.appendChild(videoCard({}));
      bindVideos(list);
      renderSavedVideoPreviews(list);
      repBindTools(list, function () {});
    };

    document.getElementById('zp-save-videos').onclick = async function () {
      var btn = this;
      var cards = Array.prototype.slice.call(list.querySelectorAll('.zp-rep-card'));
      if (!cards.length) { toast('Nenhum video para salvar.'); return; }

      /* Validacao POR CARD: nada falha em silencio */
      var videos = [];
      var problems = 0;
      cards.forEach(function (card, idx) {
        card.classList.remove('is-error');
        var url = card.querySelector('[data-f=video_url]').value;
        var txt = card.querySelector('[data-f=texto]').value.trim();
        var missing = [];
        if (!url) { missing.push('o arquivo de video'); }
        if (!txt) { missing.push('o texto animado'); }
        if (missing.length) {
          problems++;
          card.classList.add('is-error');
          try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
          toast('Card ' + (idx + 1) + ': faltou ' + missing.join(' e ') + '.', 'error');
        } else {
          videos.push({
            video_url: url,
            poster: card.querySelector('[data-f=poster]').value,
            texto: txt,
            cta_text: card.querySelector('[data-f=cta_text]').value,
            cta_link: card.querySelector('[data-f=cta_link]').value
          });
        }
      });
      if (problems) {
        await saveAnim(false, problems + ' card(s) incompleto(s) — complete os campos destacados.');
        return;
      }
      if (!videos.length && !confirm('Isso removera todos os videos do hero. Continuar?')) { return; }

      btnLoading(btn, true, 'Salvando...');
      try {
        await api('hero-videos', { method: 'POST', body: { videos: videos } }, 'Salvando ' + videos.length + ' video(s) do hero');
        d.videos = videos;
        list.innerHTML = '';
        (d.videos || []).forEach(function (v) { list.appendChild(videoCard(v)); });
        bindVideos(list);
        renderSavedVideoPreviews(list);
        repBindTools(list, function () {});
        await saveAnim(true, videos.length ? videos.length + ' video(s) salvos com sucesso!' : 'Lista de videos esvaziada.');
        location.hash = '#dashboard';
        return;
      } catch (e) {
        await saveAnim(false, e.message);
      }
      btnLoading(btn, false);
    }.bind(document.getElementById('zp-save-videos'));
  };

  /* Overlay cinematico de confirmacao de salvamento */
  async function saveAnim(ok, msg) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      toast(msg, ok ? 'success' : 'error');
      return;
    }
    var wrap = document.createElement('div');
    wrap.className = 'zp-save-anim' + (ok ? '' : ' is-error');
    wrap.innerHTML =
      '<div class="zp-save-box">' +
      '<svg class="zp-save-ring" viewBox="0 0 64 64">' +
      '<circle cx="32" cy="32" r="28" fill="none"/>' +
      (ok
        ? '<path class="zp-check" fill="none" d="M20 33 L29 42 L45 24"/>'
        : '<path class="zp-cross" fill="none" d="M22 22 L42 42 M42 22 L22 42"/>') +
      '</svg>' +
      '<p>' + esc(msg) + '</p>' +
      '</div>';
    document.body.appendChild(wrap);
    await new Promise(function (r) { setTimeout(r, ok ? 1700 : 2600); });
    wrap.classList.add('is-leaving');
    await new Promise(function (r) { setTimeout(r, 350); });
    wrap.remove();
  }

  /* ── Marcas / Blogueiras ── */
  ROUTES['#marcas'] = async function () {
    var d = await api('brands');
    view.innerHTML =
      '<h1 class="zp-view-title">Marcas / Blogueiras</h1>' +
      '<p class="zp-view-sub">Logos que aparecem na vitrine de parceiros da loja.</p>' +
      '<div id="zp-rep-list"></div>' +
      '<div class="zp-actions" style="margin-top:14px">' +
      '<button type="button" class="zp-btn zp-btn-secondary" id="zp-add-brand">+ Adicionar marca</button>' +
      '<button type="button" class="zp-btn zp-btn-primary" id="zp-save-brands">Salvar alteracoes</button>' +
      '</div>';

    var list = document.getElementById('zp-rep-list');

    function brandCard(b) {
      b = b || {};
      var el = document.createElement('div');
      el.className = 'zp-rep-card';
      el.innerHTML =
        '<div style="display:grid;grid-template-columns:150px 1fr;gap:16px">' +
        repImageField({ image: b.image }, 'image', 'Logo (fundo transparente fica melhor)') +
        '<div>' +
        '<label class="zp-field"><span>Nome</span><input type="text" data-f="name" value="' + esc(b.name || '') + '" placeholder="Ex: Blogueira Fulana"></label>' +
        '<label class="zp-field"><span>Link (site ou Instagram)</span><input type="text" data-f="url" value="' + esc(b.url || '') + '" placeholder="https://instagram.com/..."></label>' +
        '</div></div>' + repTools();
      return el;
    }

    function rebuild() {
      list.innerHTML = '';
      (d.brands || []).forEach(function (b) { list.appendChild(brandCard(b)); });
      if (!(d.brands || []).length) {
        list.innerHTML = emptyState('Nenhuma marca ainda', 'Adicione a primeira logo de parceiro.');
      }
      bindRepImages(list);
      repBindTools(list, function () {});
    }
    rebuild();

    document.getElementById('zp-add-brand').onclick = function () {
      var blank = list.querySelector('.zp-empty');
      if (blank) { blank.remove(); }
      list.appendChild(brandCard({}));
      bindRepImages(list);
      repBindTools(list, function () {});
    };

    document.getElementById('zp-save-brands').onclick = function () {
      var brands = [];
      list.querySelectorAll('.zp-rep-card').forEach(function (card) {
        brands.push({
          name: card.querySelector('[data-f=name]').value,
          image: card.querySelector('[data-key=image] input[type=hidden]').value,
          url: card.querySelector('[data-f=url]').value
        });
      });
      saveBar(this, async function () {
        await api('brands', { method: 'POST', body: { brands: brands } }, 'Salvando ' + brands.length + ' marca(s)');
        d.brands = brands;
      }.bind(this));
    }.bind(document.getElementById('zp-save-brands'));
  };

  /* ── Selos de Confianca ── */
  ROUTES['#selos'] = async function () {
    var d = await api('trust');
    view.innerHTML =
      '<h1 class="zp-view-title">Selos de Confianca</h1>' +
      '<p class="zp-view-sub">Selo pequeno com icone + frase curta. Ex: "Frete gratis &mdash; Acima de R$ 199".</p>' +
      '<div id="zp-rep-list"></div>' +
      '<div class="zp-actions" style="margin-top:14px">' +
      '<button type="button" class="zp-btn zp-btn-secondary" id="zp-add-trust">+ Adicionar selo</button>' +
      '<button type="button" class="zp-btn zp-btn-primary" id="zp-save-trust">Salvar alteracoes</button>' +
      '</div>';

    var list = document.getElementById('zp-rep-list');

    function trustCard(b) {
      b = b || {};
      var el = document.createElement('div');
      el.className = 'zp-rep-card';
      el.innerHTML =
        '<div style="display:grid;grid-template-columns:110px 1fr;gap:16px">' +
        repImageField({ icon: b.icon }, 'icon', 'Icone pequeno') +
        '<div>' +
        '<label class="zp-field"><span>Titulo</span><input type="text" data-f="title" value="' + esc(b.title || '') + '" placeholder="Ex: Frete gratis"></label>' +
        '<label class="zp-field"><span>Subtitulo</span><input type="text" data-f="subtitle" value="' + esc(b.subtitle || '') + '" placeholder="Ex: Acima de R$ 199"></label>' +
        '</div></div>' + repTools();
      return el;
    }

    function rebuild() {
      list.innerHTML = '';
      (d.badges || []).forEach(function (b) { list.appendChild(trustCard(b)); });
      if (!(d.badges || []).length) {
        list.innerHTML = emptyState('Nenhum selo ainda', 'Selos passam confianca: frete, trocas, pagamento seguro...');
      }
      bindRepImages(list);
      repBindTools(list, function () {});
    }
    rebuild();

    document.getElementById('zp-add-trust').onclick = function () {
      var blank = list.querySelector('.zp-empty');
      if (blank) { blank.remove(); }
      list.appendChild(trustCard({}));
      bindRepImages(list);
      repBindTools(list, function () {});
    };

    document.getElementById('zp-save-trust').onclick = function () {
      var badges = [];
      list.querySelectorAll('.zp-rep-card').forEach(function (card) {
        badges.push({
          icon: card.querySelector('[data-key=icon] input[type=hidden]').value,
          title: card.querySelector('[data-f=title]').value,
          subtitle: card.querySelector('[data-f=subtitle]').value
        });
      });
      saveBar(this, async function () {
        await api('trust', { method: 'POST', body: { badges: badges } }, 'Salvando ' + badges.length + ' selo(s)');
        d.badges = badges;
      }.bind(this));
    }.bind(document.getElementById('zp-save-trust'));
  };

  /* ── Cookies e Privacidade: registro de consentimentos (LGPD) ── */
  ROUTES['#cookies'] = async function () {
    view.innerHTML = '<h1 class="zp-view-title">Cookies e Privacidade</h1><p class="zp-view-sub">Registro de consentimentos de cookies (LGPD) — prova legal para fiscalizacao</p>';

    var ccBase = CFG.restUrl.split('/zaya/v1/')[0] + '/cc/v1/';

    var state = { page: 1, search: '', from: '', to: '', choice: '' };

    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
async function ccApi(path, opts) {
      opts = opts || {};
      var headers = { 'X-WP-Nonce': CFG.nonce };
      if (opts.body && !(opts.body instanceof FormData)) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(opts.body); }
      
      // Adiciona timestamp para evitar cache
      var separator = path.indexOf('?') > -1 ? '&' : '?';
      var urlComTimestamp = ccBase + path + separator + '_t=' + Date.now();
      
      var res = await fetch(urlComTimestamp, Object.assign({ 
        headers: headers, 
        credentials: 'same-origin', 
        cache: 'no-store' 
      }, opts));

      var json = null;
      try { json = await res.json(); } catch (e) {}
      if (!res.ok) { 
        var errorMsg = (json && json.message) || 'Erro ' + res.status;
        console.error('Erro na API:', errorMsg, json);
        throw new Error(errorMsg); 
      }
      return json;
    }

    // Export com nonce REST (link direto falha com rest_forbidden).
    function ccExport(format) {
      var q = [];
      if (state.search) { q.push('search=' + encodeURIComponent(state.search)); }
      if (state.from) { q.push('from=' + encodeURIComponent(state.from)); }
      if (state.to) { q.push('to=' + encodeURIComponent(state.to)); }
      if (state.choice) { q.push('choice=' + encodeURIComponent(state.choice)); }
      fetch(ccBase + 'export?format=' + format + (q.length ? '&' + q.join('&') : ''), {
        headers: { 'X-WP-Nonce': CFG.nonce },
        credentials: 'same-origin'
      })
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var blob, url;
        try {
          var json = JSON.parse(text);
          if (json.ok === false) { toast(json.message, 'error'); return; }
          blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        } catch (e) {
          blob = new Blob([text], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        }
        url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'consentimentos-' + new Date().toISOString().slice(0, 10) + '.' + format;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      })
      .catch(function (e) { toast('Falha ao exportar: ' + (e.message || 'erro'), 'error'); });
    }

    // Converte um User-Agent em { navegador, sistema, dispositivo }.
    function parseUA(str) {
      var ua = (str || '').toLowerCase();
      var out = { navegador: 'Desconhecido', sistema: 'Desconhecido', dispositivo: 'Desktop' };
      if (!ua) { return out; }
      if (ua.indexOf('edg/') > -1 || ua.indexOf('edge/') > -1) { out.navegador = 'Microsoft Edge'; }
      else if (ua.indexOf('opr/') > -1 || ua.indexOf('opera') > -1) { out.navegador = 'Opera'; }
      else if (ua.indexOf('chrome/') > -1) { out.navegador = 'Google Chrome'; }
      else if (ua.indexOf('firefox/') > -1) { out.navegador = 'Firefox'; }
      else if (ua.indexOf('safari/') > -1) { out.navegador = 'Safari'; }
      if (ua.indexOf('windows nt') > -1) { out.sistema = 'Windows'; }
      else if (ua.indexOf('android') > -1) { out.sistema = 'Android'; }
      else if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1 || ua.indexOf('ipod') > -1) { out.sistema = 'iOS'; }
      else if (ua.indexOf('mac os x') > -1) { out.sistema = 'macOS'; }
      else if (ua.indexOf('linux') > -1) { out.sistema = 'Linux'; }
      if (/(iphone|ipod)/.test(ua)) { out.dispositivo = 'Smartphone (iOS)'; }
      else if (ua.indexOf('ipad') > -1) { out.dispositivo = 'Tablet (iPad)'; }
      else if (ua.indexOf('android') > -1) { out.dispositivo = /mobile/.test(ua) ? 'Smartphone (Android)' : 'Tablet (Android)'; }
      else if (ua.indexOf('mobile') > -1) { out.dispositivo = 'Dispositivo movel'; }
      return out;
    }

    // Janela com todas as informações do visitante (aparelho, localização, escolhas).
    function ipModal(r) {
      var ua = parseUA(r.user_agent);
      var temGeo = !!(r.geo_pais || r.geo_cidade || r.geo_regiao);
      function flag(v) { return /^1$|^true$/i.test(String(v)); }

      var wrap = document.createElement('div');
      wrap.className = 'zp-modal';
      wrap.setAttribute('role', 'dialog');
      wrap.setAttribute('aria-modal', 'true');
      wrap.innerHTML =
        '<div class="zp-modal-box zp-modal-lg">' +
        '<h3>Informacoes do visitante</h3>' +
        '<p>IP <code style="font-size:12px">' + esc(r.ip_anonimizado || 'Indisponivel') + '</code> &middot; ' + esc(r.origem) + '</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">' +

        '<div>' +
        '<h4 style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--zp-text-dim)">Aparelho e navegador</h4>' +
        '<div style="background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.7">' +
        '<div><strong>Dispositivo:</strong> ' + esc(ua.dispositivo) + '</div>' +
        '<div><strong>Navegador:</strong> ' + esc(ua.navegador) + '</div>' +
        '<div><strong>Sistema:</strong> ' + esc(ua.sistema) + '</div>' +
        (r.user_agent ? '<div style="margin-top:6px;font-size:11px;color:var(--zp-text-dim);word-break:break-all">' + esc(r.user_agent) + '</div>' : '') +
        '</div>' +
        '<h4 style="margin:14px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--zp-text-dim)">Localizacao ' + (temGeo ? '' : '<span style="color:#ff6b6b">(nao informada)</span>') + '</h4>' +
        '<div style="background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.7">' +
        (temGeo ?
          '<div><strong>Cidade/UF:</strong> ' + esc(r.geo_cidade || '-') + (r.geo_regiao ? ' - ' + esc(r.geo_regiao) : '') + '</div>' +
          '<div><strong>Pais:</strong> ' + esc(r.geo_pais || '-') + '</div>' +
          (r.geo_isp ? '<div style="margin-top:6px;font-size:11px;color:var(--zp-text-dim)"><strong>Provedor (ISP):</strong> ' + esc(r.geo_isp) + '</div>' : '') +
          (r.geo_lat && r.geo_lon ? '<div style="margin-top:6px"><a class="zp-info" href="https://www.google.com/maps?q=' + String(r.geo_lat) + ',' + String(r.geo_lon) + '" target="_blank" rel="noopener" style="text-decoration:underline">Ver no mapa &nearr;</a></div>' : '')
          : '<p style="margin:0">Nao foi possivel determinar a localizacao deste registro (IP mascarado ou API indisponivel).</p>') +
        '</div>' +
        '</div>' +

        '<div>' +
        '<h4 style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--zp-text-dim)">Escolhas de cookies</h4>' +
        '<div style="background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:10px;padding:10px 12px;font-size:13px;line-height:2">' +
        '<div>Analise: ' + (flag(r.aceita_analise) ? '<span class="zp-badge is-publish">Sim</span>' : '<span class="zp-badge is-draft">Nao</span>') + '</div>' +
        '<div>Publicidade: ' + (flag(r.aceita_publicidade) ? '<span class="zp-badge is-publish">Sim</span>' : '<span class="zp-badge is-draft">Nao</span>') + '</div>' +
        '<div>Personalizacao: ' + (flag(r.aceita_personalizacao) ? '<span class="zp-badge is-publish">Sim</span>' : '<span class="zp-badge is-draft">Nao</span>') + '</div>' +
        '<div style="margin-top:6px;border-top:1px solid var(--zp-border);padding-top:6px"><strong>Acao:</strong> ' + esc(r.acao) + '</div>' +
        '<div><strong>Versao da politica:</strong> ' + esc(r.versao_politica) + '</div>' +
        '</div>' +
        '<h4 style="margin:14px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--zp-text-dim)">Registro</h4>' +
        '<div style="background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.8">' +
        '<div><strong>Consentimento:</strong> <code style="font-size:11px">' + esc(r.consentimento_id) + '</code></div>' +
        '<div><strong>Usuario ID:</strong> ' + esc(r.usuario_id) + ' ' + (parseInt(r.usuario_id, 10) > 0 ? '(logado)' : '(visitante)') + '</div>' +
        '<div><strong>Data/Hora (America/Sao_Paulo):</strong> ' + esc(r.criado_em_local || r.criado_em) + '</div>' +
        '<div><strong>Data/Hora (UTC):</strong> ' + esc(r.criado_em) + '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="zp-actions" style="justify-content:flex-end;margin-top:16px">' +
        '<button type="button" class="zp-btn zp-btn-primary" data-act="close">Fechar</button>' +
        '</div>' +
        '</div>';
      document.body.appendChild(wrap);
      wrap.style.display = 'flex';
      function close() { wrap.remove(); }
      wrap.addEventListener('click', function (e) { if (e.target === wrap) { close(); } });
      wrap.querySelector('[data-act=close]').onclick = close;
      document.addEventListener('keydown', function escK(ev) {
        if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', escK); }
      });
    }

    async function load() {
      var box = document.getElementById('zp-cookies-box');
      box.innerHTML = '<p style="color:var(--zp-text-dim)">Carregando...</p>';
      var q = [];
      if (state.search) { q.push('search=' + encodeURIComponent(state.search)); }
      if (state.from) { q.push('from=' + encodeURIComponent(state.from)); }
      if (state.to) { q.push('to=' + encodeURIComponent(state.to)); }
      if (state.choice) { q.push('choice=' + encodeURIComponent(state.choice)); }
      q.push('page=' + state.page); q.push('per_page=20');
      var d;
      try { d = await ccApi('logs?' + q.join('&')); }
      catch (e) { box.innerHTML = '<p style="color:#ff6b6b">' + esc(e.message) + '</p>'; return; }

      var stats = '<div class="zp-kpis" style="margin-bottom:14px">' +
        '<div class="zp-kpi"><div class="zp-kpi-label">Total registros</div><div class="zp-kpi-value">' + d.stats.total + '</div></div>' +
        '<div class="zp-kpi"><div class="zp-kpi-label">Aceitou tudo</div><div class="zp-kpi-value">' + d.stats.all + '</div></div>' +
        '<div class="zp-kpi"><div class="zp-kpi-label">Recusou tudo</div><div class="zp-kpi-value">' + d.stats.none + '</div></div>' +
        '<div class="zp-kpi"><div class="zp-kpi-label">Parcial</div><div class="zp-kpi-value">' + d.stats.partial + '</div></div>' +
        '<div class="zp-kpi"><div class="zp-kpi-label">Taxa de aceite</div><div class="zp-kpi-value">' + d.stats.rate + '%</div></div>' +
        '</div>';

      if (!d.items.length) {
        box.innerHTML = stats + emptyState('Nenhum registro', 'Nenhum visitante escolheu preferencias de cookies ainda.', '<div class="zp-actions"><button class="zp-btn zp-btn-secondary zp-btn-sm" data-cc-export="csv">Exportar CSV</button><button class="zp-btn zp-btn-secondary zp-btn-sm" data-cc-export="json">Exportar JSON</button></div>');
        return;
      }

      var rowsData = [];
      var rows = d.items.map(function (r) {
        function flag(v) { return /^1$|^true$/i.test(String(v)); }
        rowsData.push(r);
        return '<tr>' +
          '<td><code style="font-size:11px">' + esc(r.consentimento_id) + '</code></td>' +
          '<td>' + esc(r.criado_em_local || r.criado_em || '') + '</td>' +
          '<td>' + esc(r.usuario_id) + '</td>' +
          '<td>' + (flag(r.aceita_analise) ? '<span class="zp-badge is-publish">Sim</span>' : '<span class="zp-badge is-draft">Nao</span>') + '</td>' +
          '<td>' + (flag(r.aceita_publicidade) ? '<span class="zp-badge is-publish">Sim</span>' : '<span class="zp-badge is-draft">Nao</span>') + '</td>' +
          '<td>' + (flag(r.aceita_personalizacao) ? '<span class="zp-badge is-publish">Sim</span>' : '<span class="zp-badge is-draft">Nao</span>') + '</td>' +
          '<td>' + esc(r.acao) + '</td>' +
          '<td>' + esc(r.versao_politica) + '</td>' +
          '<td><button class="zp-info" data-ccip="' + r.id + '" style="cursor:pointer;text-decoration:underline" title="Ver detalhes do visitante">' + (r.ip_anonimizado || '??.??.??.??') + '</button></td>' +
          '<td>' + esc(r.origem) + '</td>' +
          '<td><button class="zp-btn zp-btn-danger zp-btn-sm" data-ccdel="' + r.id + '">Excluir</button></td>' +
          '</tr>';
      }).join('');

      var pages = Math.max(1, Math.ceil(d.total / 20));
      box.innerHTML = stats +
        '<div class="zp-table-wrap"><table class="zp-table"><thead><tr>' +
        '<th>Consentimento</th><th>Data/Hora (America/Sao_Paulo)</th><th>Usuario</th><th>Analise</th><th>Publicidade</th><th>Personalizacao</th><th>Acao</th><th>Versao</th><th>IP</th><th>Origem</th><th></th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="zp-actions" style="margin-top:14px">' +
        '<button class="zp-btn zp-btn-secondary zp-btn-sm" id="zp-cc-prev" ' + (state.page <= 1 ? 'disabled' : '') + '>&#8592; Anterior</button>' +
        '<span style="font-size:12px;color:var(--zp-text-dim)">Pagina ' + state.page + ' de ' + pages + '</span>' +
        '<button class="zp-btn zp-btn-secondary zp-btn-sm" id="zp-cc-next" ' + (state.page >= pages ? 'disabled' : '') + '>Proxima &#8594;</button>' +
        '<span style="flex:1"></span>' +
        '<button class="zp-btn zp-btn-secondary zp-btn-sm" data-cc-export="csv">Exportar CSV</button>' +
        '<button class="zp-btn zp-btn-secondary zp-btn-sm" data-cc-export="json">Exportar JSON</button>' +
        '</div>';

      document.getElementById('zp-cc-prev').onclick = function () { if (state.page > 1) { state.page--; load(); } };
      document.getElementById('zp-cc-next').onclick = function () { state.page++; load(); };
      box.querySelectorAll('[data-ccip]').forEach(function (b) {
        b.onclick = function () {
          var idx = Number(b.dataset.ccip);
          var rec = null;
          for (var i = 0; i < rowsData.length; i++) {
            if (Number(rowsData[i].id) === idx) { rec = rowsData[i]; break; }
          }
          if (rec) { ipModal(rec); }
        };
      });
      box.querySelectorAll('[data-ccdel]').forEach(function (b) {
        b.onclick = async function () {
          if (!confirm('Excluir este registro de consentimento?')) { return; }
          var btnTexto = b.textContent;
          b.textContent = 'Excluindo...';
          b.disabled = true;
          try { 
            var resultado = await ccApi('logs/' + b.dataset.ccdel, { method: 'DELETE' }); 
            console.log('Resultado da exclusão:', resultado);
            toast('Registro excluido com sucesso.', 'success'); 
            // Força recarregamento sem cache
            await new Promise(resolve => setTimeout(resolve, 300));
            load(); 
          }
          catch (e) { 
            console.error('Erro ao excluir:', e);
            toast('Erro ao excluir: ' + e.message, 'error'); 
            b.textContent = btnTexto;
            b.disabled = false;
          }
        };
      });
    }

    view.innerHTML =
      '<h1 class="zp-view-title">Cookies e Privacidade</h1>' +
      '<p class="zp-view-sub">Registro de consentimentos de cookies (LGPD) — prova legal para fiscalizacao</p>' +
      '<div class="zp-actions" style="margin-bottom:16px;flex-wrap:wrap">' +
      '<input type="text" id="zp-cc-search" placeholder="Buscar por ID, usuario ou origem..." style="flex:1;max-width:300px;padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text);outline:none">' +
      '<input type="date" id="zp-cc-from" style="padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text)">' +
      '<input type="date" id="zp-cc-to" style="padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text)">' +
      '<select id="zp-cc-choice" style="padding:9px 12px;background:var(--zp-bg);border:1px solid var(--zp-border);border-radius:8px;color:var(--zp-text)">' +
      '<option value="">Todas as escolhas</option><option value="all">Aceitou tudo</option><option value="partial">Parcial</option><option value="none">Recusou tudo</option>' +
      '</select>' +
      '<button class="zp-btn zp-btn-primary zp-btn-sm" id="zp-cc-search-btn">Buscar</button>' +
      '<button class="zp-btn zp-btn-secondary zp-btn-sm" id="zp-cc-reset">Limpar</button>' +
      '</div>' +
      '<div class="zp-card" id="zp-cookies-box"><p style="color:var(--zp-text-dim)">Carregando...</p></div>';

    document.getElementById('zp-cc-search-btn').onclick = function () {
      state.search = document.getElementById('zp-cc-search').value;
      state.from = document.getElementById('zp-cc-from').value;
      state.to = document.getElementById('zp-cc-to').value;
      state.choice = document.getElementById('zp-cc-choice').value;
      state.page = 1;
      load();
    };
    document.getElementById('zp-cc-reset').onclick = function () {
      document.getElementById('zp-cc-search').value = ''; document.getElementById('zp-cc-from').value = ''; document.getElementById('zp-cc-to').value = ''; document.getElementById('zp-cc-choice').value = '';
      state = { page: 1, search: '', from: '', to: '', choice: '' };
      load();
    };
    var timer;
    document.getElementById('zp-cc-search').addEventListener('input', function () {
      clearTimeout(timer);
      var v = this.value.trim();
      timer = setTimeout(function () { state.search = v; state.page = 1; load(); }, 350);
    });

    /* Delegacao de clique para os botoes de export (reativo a re-render). */
    view.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cc-export]');
      if (btn) { ccExport(btn.dataset.ccExport); }
    });

    await load();
  };

  /* ═════════════ ROTEADOR ═════════════ */

  function currentRoute() {
    var h = location.hash || '#dashboard';
    if (ROUTES[h]) { return [ROUTES[h], null]; }
    var m = h.match(/^#produto\/(\d+)$/);
    if (m && ROUTES['#produto/:id']) { return [ROUTES['#produto/:id'], m[1]]; }
    return [ROUTES['#dashboard'], null];
  }

  async function navigate() {
    var route = currentRoute();
    document.querySelectorAll('.zp-nav-item').forEach(function (b) { b.classList.toggle('is-active', b.dataset.hash === location.hash); });
    try {
      await route[0](route[1]);
    } catch (e) {
      view.innerHTML = emptyState('Ops, algo falhou', e.message || 'Erro inesperado ao carregar esta tela.');
    }
    window.scrollTo(0, 0);
  }

  /* ═════════════ PALETA DE COMANDO ═════════════ */

  var palette = document.getElementById('zp-palette');
  var palInput = document.getElementById('zp-palette-input');
  var palList = document.getElementById('zp-palette-list');
  var palItems = [];
  var palSelected = 0;

  function openPalette() {
    palette.hidden = false;
    palInput.value = '';
    renderPalette(staticActions());
    palInput.focus();
  }
  function closePalette() { palette.hidden = true; }

  function staticActions() {
    var items = [];
    NAV.forEach(function (n) { if (n.hash) { items.push({ label: n.label, hint: 'Ir para', run: function () { location.hash = n.hash; } }); } });
    items.push({ label: 'Criar novo produto', hint: 'Acao', run: function () { location.hash = '#produto/novo'; } });
    items.push({ label: 'Ver pedidos pendentes', hint: 'Acao', run: function () { location.hash = '#pedidos'; } });
    items.push({ label: 'Alternar tema claro/escuro', hint: 'Acao', run: function () { applyTheme(theme === 'dark' ? 'light' : 'dark'); } });
    return items;
  }

  function renderPalette(items) {
    palItems = items;
    palSelected = 0;
    palList.innerHTML = items.length
      ? items.map(function (it, i) { return '<li data-i="' + i + '"' + (i === 0 ? ' class="is-selected"' : '') + '>' + esc(it.label) + '<span>' + esc(it.hint) + '</span></li>'; }).join('')
      : '<li class="zp-pal-empty">Nenhum resultado</li>';
    palList.querySelectorAll('li[data-i]').forEach(function (li) {
      li.onclick = function () { closePalette(); palItems[parseInt(li.dataset.i, 10)].run(); };
    });
  }

  var searchTimer;
  palInput.addEventListener('input', function () {
    var q = palInput.value.trim();
    clearTimeout(searchTimer);
    if (q.length < 2) { renderPalette(staticActions()); return; }
    searchTimer = setTimeout(async function () {
      try {
        var prods = await api('products?search=' + encodeURIComponent(q) + '&per_page=5');
        var orders = await api('orders?per_page=25');
        var orderHits = orders.filter(function (o) {
          return ('#' + o.number).indexOf(q.replace('#', '')) !== -1 || o.customer.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        }).slice(0, 4);
        var items = staticActions().filter(function (a) { return a.label.toLowerCase().indexOf(q.toLowerCase()) !== -1; });
        prods.forEach(function (p) { items.push({ label: p.name, hint: 'Produto · editar', run: function () { location.hash = '#produto/' + p.id; } }); });
        orderHits.forEach(function (o) { items.push({ label: '#' + o.number + ' ' + (o.customer || ''), hint: 'Pedido · ver', run: function () { location.hash = '#pedidos'; } }); });
        renderPalette(items);
      } catch (e) { renderPalette([]); }
    }, 250);
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
      return;
    }
    if (!palette.hidden) {
      if (e.key === 'Escape') { closePalette(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!palItems.length) { return; }
        palSelected = (palSelected + (e.key === 'ArrowDown' ? 1 : palItems.length - 1)) % palItems.length;
        palList.querySelectorAll('li').forEach(function (li, i) { li.classList.toggle('is-selected', i === palSelected); });
      }
      if (e.key === 'Enter' && palItems[palSelected]) {
        closePalette();
        palItems[palSelected].run();
      }
    }
  });

  palette.addEventListener('click', function (e) { if (e.target === palette) { closePalette(); } });
  document.getElementById('zp-palette-trigger').onclick = openPalette;

  /* ═════════════ UI extras ═════════════ */
  document.getElementById('zp-collapse').onclick = function () { document.body.classList.toggle('zp-collapsed'); };

  function closeMobileMenu() { document.body.classList.remove('zp-menu-open'); }
  document.getElementById('zp-burger').onclick = function () { document.body.classList.toggle('zp-menu-open'); };
  document.getElementById('zp-backdrop').onclick = closeMobileMenu;
  var sidebarClose = document.getElementById('zp-sidebar-close');
  if (sidebarClose) { sidebarClose.onclick = closeMobileMenu; }
  document.getElementById('zp-theme-toggle').onclick = function () { applyTheme(theme === 'dark' ? 'light' : 'dark'); };

  /* ── Modal de confirmacao (identidade do painel) ── */
  function confirmModal(title, text, okLabel, onOk) {
    var wrap = document.createElement('div');
    wrap.className = 'zp-modal';
    wrap.innerHTML =
      '<div class="zp-modal-box">' +
      '<h3>' + esc(title) + '</h3>' +
      '<p>' + esc(text) + '</p>' +
      '<div class="zp-actions" style="justify-content:flex-end;margin-top:18px">' +
      '<button type="button" class="zp-btn zp-btn-secondary" data-act="cancel">Cancelar</button>' +
      '<button type="button" class="zp-btn zp-btn-primary" data-act="ok">' + esc(okLabel) + '</button>' +
      '</div></div>';
    document.body.appendChild(wrap);
    function close() { wrap.remove(); }
    wrap.addEventListener('click', function (e) { if (e.target === wrap) { close(); } });
    wrap.querySelector('[data-act=cancel]').onclick = close;
    wrap.querySelector('[data-act=ok]').onclick = function () { close(); onOk(); };
    document.addEventListener('keydown', function esc2(ev) {
      if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc2); }
    });
  }

  /* Sair: confirmacao com identidade Zaya antes de navegar */
  var logoutLink = document.querySelector('.zp-logout');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      var url = logoutLink.href;
      confirmModal(
        'Sair do painel?',
        'Voce precisara entrar novamente para gerenciar a loja.',
        'Sair',
        function () { window.location.href = url; }
      );
    });
  }

  
  /* Avatar do perfil: clique envia nova foto */
  var avatarInput = document.getElementById('zp-avatar-input');
  if (avatarInput) {
    avatarInput.onchange = async function () {
      var f = this.files[0];
      if (!f) return;
      var img = document.getElementById('zp-avatar-img');
      var old = img ? img.src : '';
      if (img) { img.style.opacity = '.4'; }
      try {
        var fd = new FormData();
        fd.append('avatar', f);
        var res = await api('profile-avatar', { method: 'POST', body: fd, raw: true }, 'Enviando foto...');
        if (img) { img.src = res.url + '?t=' + Date.now(); img.style.opacity = ''; }
        toast('Foto do perfil atualizada!');
      } catch (e) {
        if (img) { img.src = old; img.style.opacity = ''; }
        toast(e.message, 'error');
      }
    };
  }
    /* Balanzinho de mensagens: minimizavel, animado, sincronizado com o dashboard */
  var ticker = document.getElementById('zp-ticker');
  function getDashText() { return document.getElementById('zp-dash-thought-text'); }
  function pickPhrase() { return CFG.phrases[Math.floor(Math.random() * CFG.phrases.length)]; }
  function openTickerModal(txt) {
    var ov = document.createElement('div');
    ov.id = 'zp-ticker-modal';
    ov.style.cssText = 'position:fixed;left:0;top:0;width:100vw;max-width:100vw;height:100vh;max-height:100vh;z-index:2147482000;display:flex;align-items:center;justify-content:center;background:rgba(10,2,6,.7);backdrop-filter:blur(4px)';
    var card = document.createElement('div');
    card.style.cssText = 'max-width:min(420px,92vw);margin:0 4vw;background:radial-gradient(95% 55% at 50% -12%,rgba(255,51,128,.24),transparent 62%),linear-gradient(168deg,#220915,#0a0206);border:1px solid rgba(212,175,55,.55);border-radius:20px;padding:30px 26px;text-align:center;font-family:Poppins,sans-serif;color:#f5eef0;animation:zpFadeIn .4s ease both';
    var tag = document.createElement('div');
    tag.textContent = 'Mensagem para voc\u00ea';
    tag.style.cssText = 'font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#d4af37;margin-bottom:14px';
    var full = document.createElement('div');
    full.style.cssText = 'font-size:1.15em;line-height:1.5';
    full.textContent = txt;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = 'Fechar';
    btn.style.cssText = 'margin-top:20px;padding:10px 26px;border-radius:999px;border:1px solid rgba(212,175,55,.6);background:linear-gradient(135deg,#FF3380,#c2185b);color:#fff;font-weight:600;cursor:pointer';
    btn.onclick = function () { if (ov.parentNode) ov.parentNode.removeChild(ov); };
    card.appendChild(tag); card.appendChild(full); card.appendChild(btn);
    ov.appendChild(card);
    ov.onclick = function (ev) { if (ev.target === ov) { if (ov.parentNode) ov.parentNode.removeChild(ov); } };
    document.body.appendChild(ov);
  }
  if (ticker && CFG.phrases && CFG.phrases.length) {
    var tTxt = ticker.querySelector('#zp-ticker-text');
    var minBtn = document.createElement('button');
    minBtn.type = 'button'; minBtn.textContent = '\u2013';
    minBtn.className = 'zp-thought-min-btn';
    minBtn.title = 'Minimizar';
    minBtn.onclick = function (e) {
      e.stopPropagation();
      ticker.classList.add('is-min');
      try { sessionStorage.setItem('zp_thought_min', '1'); } catch (err) {}
    };
    ticker.appendChild(minBtn);
    function setAll(next) {
      if (tTxt) tTxt.textContent = next;
      if (dashText) dashText.textContent = next;
    }
    function getDashBubble() {
      var dt = getDashText();
      return dt ? dt.closest('.zp-robot-bubble') : null;
    }
    function showTicker() {
      var next = pickPhrase();
      if (tTxt) {
        tTxt.style.opacity = '0';
        setTimeout(function () {
          tTxt.textContent = next;
          tTxt.style.transition = 'opacity .4s ease';
          tTxt.style.opacity = '1';
        }, 250);
      }
    }
    try { if (sessionStorage.getItem('zp_thought_min') === '1') ticker.classList.add('is-min'); } catch (err) {}
    ticker.onclick = function () { openTickerModal(pickPhrase()); };
    /* Delegacao: o dashboard e re-renderizado pelo SPA, entao o clique
       precisa ser capturado no documento, nao no elemento fixo. */
    document.addEventListener('click', function (ev) {
      var r = ev.target.closest('.zp-hello-wrap .zp-robot');
      if (!r) return;
      var b = document.getElementById('zp-cartoon');
      if (!b) return;
      var txtEl = b.querySelector('#zp-cartoon-text');
      if (b.classList.contains('is-open')) {
        b.classList.remove('is-open', 'zp-push');
        if (b._closeTimer) { clearTimeout(b._closeTimer); b._closeTimer = null; }
      } else {
        if (txtEl) txtEl.textContent = pickPhrase();
        b.style.display = 'inline-flex';
        b.classList.add('is-open');
        b.classList.remove('zp-push');
        void b.offsetWidth;
        b.classList.add('zp-push');
        /* Fecha sozinho apos 6s de leitura */
        b._closeTimer = setTimeout(function () { b.classList.remove('is-open', 'zp-push'); }, 6000);
      }
    });

    var INVITES = ['Oi! Quer uma palavra de incentivo hoje?','Psst... tenho algo especial pra voce!','Precisa de um empurrazinho? Clica aqui!','Uma mensagem carinhosa te espera'];
    var invIdx = 0;
    setInterval(function () {
      invIdx = (invIdx + 1) % INVITES.length;
      var el = document.getElementById('zp-cartoon-text');
      if (el) { el.style.opacity = '0'; setTimeout(function () { el.textContent = INVITES[invIdx]; el.style.opacity = '1'; }, 250); }
    }, 10000);
  }
window.addEventListener('hashchange', navigate);

  /* Clique na sidebar: navega para a secao */
  nav.addEventListener('click', function (e) {
    var btn = e.target.closest('.zp-nav-item');
    if (!btn || !btn.dataset.hash) { return; }
    document.body.classList.remove('zp-menu-open');
    if (location.hash === btn.dataset.hash) {
      navigate(); // mesma rota: recarrega a tela
    } else {
      location.hash = btn.dataset.hash;
    }
  });

  /* ═════════════ BOOT ═════════════ */
  renderNav();
  if (!location.hash) { location.hash = '#dashboard'; }
  navigate();
})();
