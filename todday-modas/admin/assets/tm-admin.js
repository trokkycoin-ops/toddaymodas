/* global tmAdminData, jQuery */
jQuery(document).ready(function($) {
    'use strict';

    // Salvar Banner via AJAX
    $('#tm-form-banner').on('submit', function(e) {
        e.preventDefault();
        var formData = $(this).serializeArray();
        formData.push({ name: 'action', value: 'tm_save_banner' });
        formData.push({ name: 'nonce', value: tmAdminData.nonce });

        $.post(tmAdminData.ajaxUrl, formData)
            .done(function(res) {
                if (res.success) {
                    alert('Banner salvo com sucesso!');
                    window.location.reload();
                } else {
                    alert('Erro: ' + (res.data.message || 'Falha ao salvar.'));
                }
            })
            .fail(function() {
                alert('Erro na requisição.');
            });
    });

    // Deletar Banner via AJAX
    $('.tm-btn-delete-banner').on('click', function(e) {
        e.preventDefault();
        if (!confirm('Deseja realmente remover este banner?')) {
            return;
        }
        var bannerId = $(this).data('id');
        $.post(tmAdminData.ajaxUrl, {
            action: 'tm_delete_banner',
            nonce: tmAdminData.nonce,
            id: bannerId
        }).done(function(res) {
            if (res.success) {
                window.location.reload();
            }
        });
    });
});
