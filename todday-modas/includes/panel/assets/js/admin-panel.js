/* global tmPanelConfig, jQuery */
jQuery(document).ready(function($) {
    'use strict';
    var $root = $('#tm-panel-root');
    if (!$root.length || typeof tmPanelConfig === 'undefined') {
        return;
    }

    $.ajax({
        url: tmPanelConfig.restUrl + '/status',
        method: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-WP-Nonce', tmPanelConfig.nonce);
        }
    }).done(function(data) {
        $root.html(
            '<div class="tm-panel-card">' +
            '<h3>Painel de Gestão Todday Modas v' + data.version + '</h3>' +
            '<p><strong>Peças no Acervo:</strong> ' + data.active_pieces + '</p>' +
            '<p><strong>HPOS Ativo:</strong> ' + (data.hpos_enabled ? 'Sim' : 'Não') + '</p>' +
            '<p><strong>Horário Servidor:</strong> ' + data.server_time + '</p>' +
            '</div>'
        );
    }).fail(function() {
        $root.html('<p>Erro ao carregar dados do painel.</p>');
    });
});
