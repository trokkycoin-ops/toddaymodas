/**
 * Todday Modas - Frontend Microinteractions & Concurrency Polling
 */
(function($) {
  'use strict';

  $(document).ready(function() {
    // Quickview handler
    $(document).on('click', '.todday-quickview-btn', function(e) {
      e.preventDefault();
      var productId = $(this).data('product-id');
      console.log('Todday Modas: Quickview aberto para o produto #' + productId);
    });

    // Wishlist pulse animation
    $(document).on('click', '.todday-wishlist-toggle', function(e) {
      e.preventDefault();
      var $btn = $(this);
      $btn.toggleClass('active');
      $btn.addClass('todday-pulse');
      setTimeout(function() {
        $btn.removeClass('todday-pulse');
      }, 400);
    });
  });
})(jQuery);
