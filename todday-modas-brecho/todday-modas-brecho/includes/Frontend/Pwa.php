<?php
namespace ToddayModasBrecho\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

class Pwa {
    public static function register(): void {
        add_action('wp_head', [self::class, 'inject_manifest_and_meta']);
        add_action('wp_footer', [self::class, 'register_service_worker']);
    }

    public static function inject_manifest_and_meta(): void {
        $manifest_url = TODDAY_MODAS_URL . 'public/pwa/manifest.json';
        ?>
        <link rel="manifest" href="<?php echo esc_url($manifest_url); ?>">
        <meta name="theme-color" content="#7C3AED">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Todday Modas">
        <?php
    }

    public static function register_service_worker(): void {
        if (!is_ssl()) {
            return;
        }

        $sw_url = TODDAY_MODAS_URL . 'public/pwa/sw.js';
        ?>
        <script>
        if ('serviceWorker' in navigator && location.protocol === 'https:') {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('<?php echo esc_url($sw_url); ?>')
                    .then(function(reg) {
                        console.log('Todday PWA SW registrado com sucesso:', reg.scope);
                    })
                    .catch(function(err) {
                        console.warn('Falha no registro do Service Worker Todday:', err);
                    });
            });
        }
        </script>
        <?php
    }
}
