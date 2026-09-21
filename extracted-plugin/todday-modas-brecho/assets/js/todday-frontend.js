/**
 * Todday Modas Brechó — Frontend & SPA Client Logic
 * Consome o contrato REST todday/v1 via fetch com X-WP-Nonce.
 * @version 1.0.0
 */

(function ($) {
  'use strict';

  var cfg = window.tdmConfig || {
    restUrl: '/wp-json/todday/v1',
    nonce: '',
    ajaxUrl: '/wp-admin/admin-ajax.php',
    ajaxNonce: '',
    currency: 'R$'
  };

  function apiFetch(endpoint, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['X-WP-Nonce'] = cfg.nonce;
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    return fetch(cfg.restUrl + endpoint, options).then(function (res) {
      return res.json();
    });
  }

  // ==========================================
  // 1. VITRINE / CATÁLOGO
  // ==========================================
  function initVitrine() {
    var $grid = $('#tdm-products-container');
    if (!$grid.length) return;

    var currentCategory = '';
    var currentSort = 'date';
    var currentSearch = '';

    function loadProducts() {
      $grid.html('<div class="tdm-loading-state"><div class="tdm-spinner"></div><p>Carregando peças...</p></div>');

      var query = '?category=' + encodeURIComponent(currentCategory) +
                  '&orderby=' + encodeURIComponent(currentSort) +
                  '&search=' + encodeURIComponent(currentSearch);

      apiFetch('/catalog' + query).then(function (res) {
        if (!res.success || !res.data || !res.data.products || !res.data.products.length) {
          $grid.html('<div class="tdm-empty-state"><p>Nenhuma peça encontrada neste garimpo.</p></div>');
          return;
        }

        var html = '';
        res.data.products.forEach(function (p) {
          var img = p.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="360" viewBox="0 0 300 360"><rect fill="%23f1f5f9" width="300" height="360"/><text fill="%2394a3b8" font-size="16" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Todday Modas</text></svg>';
          html += '<div class="tdm-product-card" data-id="' + p.id + '">' +
            '<span class="tdm-card-badge">' + (p.condition || 'Estado de Novo') + '</span>' +
            '<div class="tdm-card-image-wrapper">' +
              '<img src="' + img + '" alt="' + p.name + '" loading="lazy" />' +
            '</div>' +
            '<div class="tdm-card-info">' +
              '<h3 class="tdm-card-title">' + p.name + '</h3>' +
              '<div class="tdm-card-meta">' +
                '<span>Tam: <strong>' + (p.size || 'M') + '</strong></span>' +
                '<span>•</span>' +
                '<span>★ ' + (p.rating > 0 ? p.rating.toFixed(1) : '5.0') + '</span>' +
              '</div>' +
              '<div class="tdm-card-price-row">' +
                '<div>' +
                  '<span class="tdm-price-current">R$ ' + p.price.toFixed(2).replace('.', ',') + '</span>' +
                  (p.regular_price && p.regular_price > p.price ? '<span class="tdm-price-regular">R$ ' + p.regular_price.toFixed(2).replace('.', ',') + '</span>' : '') +
                '</div>' +
                '<button class="tdm-btn tdm-btn-primary tdm-add-cart-btn" data-id="' + p.id + '">Garimpar</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        });

        $grid.html(html);
      }).catch(function () {
        $grid.html('<div class="tdm-empty-state"><p>Erro ao conectar com a loja. Tente novamente.</p></div>');
      });
    }

    // Eventos de filtro e busca
    $('#tdm-category-filters').on('click', '.tdm-pill', function () {
      $('#tdm-category-filters .tdm-pill').removeClass('active');
      $(this).addClass('active');
      currentCategory = $(this).data('category') || '';
      loadProducts();
    });

    $('#tdm-sort-select').on('change', function () {
      currentSort = $(this).val();
      loadProducts();
    });

    $('#tdm-search-btn').on('click', function () {
      currentSearch = $('#tdm-search-input').val();
      loadProducts();
    });

    $('#tdm-search-input').on('keyup', function (e) {
      if (e.key === 'Enter') {
        currentSearch = $(this).val();
        loadProducts();
      }
    });

    // Adicionar à sacola
    $grid.on('click', '.tdm-add-cart-btn', function (e) {
      e.preventDefault();
      var id = $(this).data('id');
      var $btn = $(this);
      $btn.prop('disabled', true).text('Adicionando...');

      apiFetch('/cart/add', {
        method: 'POST',
        body: { product_id: id, quantity: 1 }
      }).then(function (res) {
        $btn.text('Garimpado! ✓');
        setTimeout(function () {
          $btn.prop('disabled', false).text('Garimpar');
        }, 1500);
      }).catch(function () {
        $btn.prop('disabled', false).text('Erro ao adicionar');
      });
    });

    loadProducts();
  }

  // ==========================================
  // 2. CHECKOUT COM VIACEP
  // ==========================================
  function initCheckout() {
    var $cepBtn = $('#tdm-btn-lookup-cep');
    if (!$cepBtn.length) return;

    $cepBtn.on('click', function () {
      var cep = $('#tdm-checkout-cep').val().replace(/\D/g, '');
      if (cep.length !== 8) {
        alert('Digite um CEP válido com 8 dígitos.');
        return;
      }

      $cepBtn.prop('disabled', true).text('Consultando...');

      apiFetch('/shipping/quote', {
        method: 'POST',
        body: { cep: cep }
      }).then(function (res) {
        $cepBtn.prop('disabled', false).text('Buscar');
        if (res.success && res.data) {
          if (res.data.address) {
            $('#tdm-checkout-street').val(res.data.address.street);
            $('#tdm-checkout-bairro').val(res.data.address.neighborhood);
            $('#tdm-checkout-city').val(res.data.address.city);
            $('#tdm-checkout-state').val(res.data.address.state);
          }

          var $opts = $('#tdm-shipping-options-list');
          if (res.data.shipping_quotes && res.data.shipping_quotes.length) {
            var html = '';
            res.data.shipping_quotes.forEach(function (q, idx) {
              html += '<label class="tdm-radio-option" style="display:flex; align-items:center; justify-content:space-between; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px; cursor:pointer;">' +
                '<span><input type="radio" name="tdm_shipping_method" value="' + q.id + '" data-price="' + q.price + '" ' + (idx === 0 ? 'checked' : '') + ' /> <strong>' + q.name + '</strong> (' + q.delivery_time + ' dias)</span>' +
                '<strong>' + (q.price === 0 ? 'Grátis' : 'R$ ' + q.price.toFixed(2).replace('.', ',')) + '</strong>' +
              '</label>';
            });
            $opts.html(html);
          }
        }
      }).catch(function () {
        $cepBtn.prop('disabled', false).text('Buscar');
        alert('Falha na consulta de CEP.');
      });
    });

    $('input[name="tdm_payment_method"]').on('change', function () {
      if ($(this).val() === 'credit_card') {
        $('#tdm-card-fields').slideDown();
      } else {
        $('#tdm-card-fields').slideUp();
      }
    });
  }

  // ==========================================
  // 3. SPA MOUNTERS
  // ==========================================
  function initAdminSpa() {
    var $root = $('#tdm-admin-spa-root');
    if (!$root.length) return;

    var canManage = $root.data('can-manage') === true;
    var userName = $root.data('user-name') || 'Administrador';

    if (!canManage) {
      $root.html('<div style="padding:48px; text-align:center;"><h2>Acesso Restrito</h2><p>Você precisa estar autenticado como Gerente ou Administrador para acessar este painel.</p><a href="/wp-login.php" class="tdm-btn tdm-btn-primary">Fazer Login no WordPress</a></div>');
      return;
    }

    $root.html('<div class="tdm-spa-dashboard" style="padding:24px; max-width:1200px; margin:0 auto;">' +
      '<header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">' +
        '<div>' +
          '<h1 style="color:#0E9B75; margin:0 0 4px 0;">Painel de Gestão Todday Modas</h1>' +
          '<p style="color:#64748B; margin:0;">Bem-vindo(a), <strong>' + userName + '</strong></p>' +
        '</div>' +
        '<div style="display:flex; gap:12px;">' +
          '<a href="/" class="tdm-btn tdm-btn-outline">Ver Loja Virtual</a>' +
          '<button id="tdm-spa-refresh-btn" class="tdm-btn tdm-btn-primary">Atualizar Métricas</button>' +
        '</div>' +
      '</header>' +
      '<div class="tdm-metrics-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:32px;">' +
        '<div class="tdm-card"><h4>Faturamento Total</h4><h2 id="tdm-kpi-rev" style="color:#0E9B75; margin:8px 0 0 0;">Carregando...</h2></div>' +
        '<div class="tdm-card"><h4>Total de Pedidos</h4><h2 id="tdm-kpi-orders" style="color:#8B5CF6; margin:8px 0 0 0;">-</h2></div>' +
        '<div class="tdm-card"><h4>Ticket Médio</h4><h2 id="tdm-kpi-ticket" style="color:#0A7956; margin:8px 0 0 0;">-</h2></div>' +
        '<div class="tdm-card"><h4>Clientes Ativos</h4><h2 id="tdm-kpi-cust" style="color:#12201B; margin:8px 0 0 0;">-</h2></div>' +
      '</div>' +
      '<div class="tdm-card" style="margin-bottom:32px;">' +
        '<h3>Desempenho de Vendas do Brechó</h3>' +
        '<canvas id="tdm-revenue-chart" style="width:100%; height:280px;"></canvas>' +
      '</div>' +
    '</div>');

    // Carrega dados da API REST
    apiFetch('/reports/summary').then(function (res) {
      if (res.success && res.data) {
        $('#tdm-kpi-rev').text('R$ ' + res.data.total_revenue.toFixed(2).replace('.', ','));
        $('#tdm-kpi-orders').text(res.data.order_count);
        $('#tdm-kpi-ticket').text('R$ ' + res.data.average_ticket.toFixed(2).replace('.', ','));
        $('#tdm-kpi-cust').text(res.data.new_customers);

        // Renderiza gráfico nativo
        if (window.Chart) {
          var labels = (res.data.timeline || []).map(function (t) { return t.date; });
          var values = (res.data.timeline || []).map(function (t) { return t.revenue; });

          if (!labels.length) {
            labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
            values = [0, 0, 0, 0, 0, 0, 0];
          }

          new Chart('tdm-revenue-chart', {
            type: 'line',
            data: {
              labels: labels,
              datasets: [{
                label: 'Receita Diária (R$)',
                borderColor: '#0E9B75',
                data: values
              }]
            }
          });
        }
      }
    });
  }

  $(document).ready(function () {
    initVitrine();
    initCheckout();
    initAdminSpa();
  });
})(jQuery);
