// Micro-framework DOM reativo minimalista Zinho
window.Zinho = (function() {
    return {
        mount: function(el, component) {
            var target = document.querySelector(el);
            if (target && typeof component === 'function') {
                target.innerHTML = component();
            }
        }
    };
})();
