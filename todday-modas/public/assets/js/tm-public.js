/* global tmPublicData, jQuery */
jQuery(document).ready(function($) {
    'use strict';

    // Banner de consentimento LGPD
    var consentKey = 'tm_cookie_consent';
    if (!localStorage.getItem(consentKey)) {
        $('#tm-consent-banner').fadeIn();
    }

    function recordConsent(categories) {
        localStorage.setItem(consentKey, categories);
        $('#tm-consent-banner').fadeOut();

        if (typeof tmPublicData !== 'undefined') {
            $.post(tmPublicData.ajaxUrl, {
                action: 'tm_record_consent',
                nonce: tmPublicData.consentNonce,
                categories: categories
            });
        }
    }

    $('#tm-accept-all').on('click', function() {
        recordConsent('essential,analytics,marketing');
    });

    $('#tm-accept-essential').on('click', function() {
        recordConsent('essential');
    });
});
