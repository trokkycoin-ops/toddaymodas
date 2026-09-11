<?php
/**
 * Template da Vitrine Todday Modas Brechó.
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="tdm-store-wrapper" id="todday-store-app">
    <!-- Barra Superior de Busca e Filtros -->
    <header class="tdm-header-bar">
        <div class="tdm-search-box">
            <input type="text" id="tdm-search-input" placeholder="Buscar por vestido, blazer, bolsa vintage..." class="tdm-input" />
            <button id="tdm-search-btn" class="tdm-btn tdm-btn-primary" aria-label="Buscar">&#128269;</button>
        </div>
        <div class="tdm-sort-box">
            <label for="tdm-sort-select" class="screen-reader-text">Ordenar</label>
            <select id="tdm-sort-select" class="tdm-select">
                <option value="date">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="rating">Melhores Avaliações</option>
                <option value="popularity">Mais Populares</option>
            </select>
        </div>
    </header>

    <!-- Pílulas de Categorias e Condição Brechó -->
    <div class="tdm-filter-pills" id="tdm-category-filters">
        <button class="tdm-pill active" data-category="">Todos os Garimpos</button>
        <button class="tdm-pill" data-category="vestidos">Vestidos</button>
        <button class="tdm-pill" data-category="casacos-blazers">Casacos & Blazers</button>
        <button class="tdm-pill" data-category="calcas-jeans">Calças & Jeans</button>
        <button class="tdm-pill" data-category="bolsas-calcados">Bolsas & Calçados</button>
        <button class="tdm-pill" data-category="vintage-exclusivo">Vintage Exclusivo</button>
    </div>

    <!-- Grid de Produtos -->
    <div class="tdm-products-grid" id="tdm-products-container">
        <div class="tdm-loading-state">
            <div class="tdm-spinner"></div>
            <p>Carregando peças exclusivas do brechó...</p>
        </div>
    </div>

    <!-- Paginação -->
    <div class="tdm-pagination" id="tdm-pagination-container"></div>
</div>
