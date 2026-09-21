<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

class RestController {
    public const NAMESPACE = 'todday/v1';

    public static function register_routes(): void {
        AuthController::register_routes();
        CatalogController::register_routes();
        CartController::register_routes();
        CheckoutController::register_routes();
        OrdersController::register_routes();
        CustomersController::register_routes();
        CouponsController::register_routes();
        ProductsController::register_routes();
        ReportsController::register_routes();
        ReviewsController::register_routes();
        SettingsController::register_routes();
        LogsController::register_routes();
        WebhooksController::register_routes();
    }
}
