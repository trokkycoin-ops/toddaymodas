<?php
/**
 * Template Marketplace - Todday Modas Brechó
 * Design inspirado em Mercado Livre/Shopee
 * Layout moderno, limpo e focado em vendas
 */

if (!defined('ABSPATH')) {
    exit;
}

$store_name = get_option('todday_settings_general')['store_name'] ?? 'Todday Modas Brechó';
$phone = get_option('todday_settings_general')['phone'] ?? '(35) 99175-9960';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Loja virtual de moda brechó com peças selecionadas e exclusivas.">
    <title><?php echo esc_html($store_name); ?> - Moda Brechó</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.css'); ?>">
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/todday-storefront.css'); ?>">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.5;
        }

        /* HEADER MARKETPLACE */
        .header-mp {
            background: #fff;
            border-bottom: 1px solid #ddd;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .header-top {
            background: #7C3AED;
            color: white;
            padding: 8px 0;
            font-size: 13px;
            text-align: center;
        }

        .header-main {
            max-width: 1400px;
            margin: 0 auto;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }

        .logo-mp {
            font-weight: 700;
            font-size: 24px;
            color: #7C3AED;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .search-bar {
            flex: 1;
            max-width: 500px;
            display: flex;
            background: #f5f5f5;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #ddd;
        }

        .search-bar input {
            flex: 1;
            border: none;
            background: none;
            padding: 10px 14px;
            font-size: 14px;
        }

        .search-bar button {
            background: #7C3AED;
            color: white;
            border: none;
            padding: 0 16px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .action-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            text-decoration: none;
            color: #333;
            font-size: 13px;
            font-weight: 500;
        }

        .action-link i {
            font-size: 20px;
            color: #7C3AED;
        }

        .cart-badge {
            position: relative;
        }

        .badge {
            position: absolute;
            top: -6px;
            right: -8px;
            background: #EF4444;
            color: white;
            font-size: 10px;
            font-weight: 700;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* NAVEGAÇÃO */
        .nav-mp {
            background: white;
            border-bottom: 1px solid #eee;
            padding: 0;
        }

        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            gap: 30px;
            overflow-x: auto;
        }

        .nav-item {
            padding: 12px 0;
            font-size: 14px;
            font-weight: 500;
            color: #666;
            text-decoration: none;
            white-space: nowrap;
            border-bottom: 3px solid transparent;
            transition: all 0.2s;
        }

        .nav-item:hover,
        .nav-item.active {
            color: #7C3AED;
            border-bottom-color: #7C3AED;
        }

        /* BANNER */
        .banner {
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            padding: 40px;
            max-width: 1400px;
            margin: 20px auto;
            border-radius: 8px;
            text-align: center;
        }

        .banner h2 {
            font-size: 28px;
            margin-bottom: 8px;
        }

        .banner p {
            font-size: 14px;
            opacity: 0.9;
        }

        /* CONTAINER PRINCIPAL */
        .container-mp {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        /* FILTROS */
        .filters-section {
            background: white;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-group {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }

        .filter-group label {
            font-weight: 600;
            color: #333;
        }

        .filter-group select,
        .filter-group input {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
        }

        /* GRID DE PRODUTOS */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 40px;
        }

        /* CARD DE PRODUTO */
        .product-card {
            background: white;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #eee;
            transition: all 0.3s;
            cursor: pointer;
        }

        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: #7C3AED;
        }

        .product-image {
            width: 100%;
            aspect-ratio: 1;
            background: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }

        .product-card:hover .product-image img {
            transform: scale(1.05);
        }

        .product-badges {
            position: absolute;
            top: 8px;
            left: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            z-index: 10;
        }

        .badge-new,
        .badge-sale {
            background: #EF4444;
            color: white;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 3px;
            text-transform: uppercase;
        }

        .badge-new {
            background: #7C3AED;
        }

        .product-rating {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .product-info {
            padding: 12px;
        }

        .product-category {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .product-title {
            font-size: 13px;
            font-weight: 500;
            color: #333;
            margin: 4px 0 8px;
            line-height: 1.4;
            min-height: 26px;
        }

        .product-price {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-bottom: 8px;
        }

        .price-original {
            font-size: 12px;
            color: #999;
            text-decoration: line-through;
        }

        .price-current {
            font-size: 16px;
            font-weight: 700;
            color: #7C3AED;
        }

        .price-discount {
            font-size: 11px;
            color: #EF4444;
            font-weight: 600;
        }

        .product-installment {
            font-size: 11px;
            color: #666;
            margin-bottom: 8px;
        }

        .product-btn {
            width: 100%;
            padding: 8px;
            background: #7C3AED;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }

        .product-btn:hover {
            background: #5B21B6;
        }

        /* FOOTER */
        .footer-mp {
            background: #1a1a1a;
            color: #ccc;
            padding: 40px 20px 20px;
            margin-top: 40px;
        }

        .footer-container {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }

        .footer-section h4 {
            color: white;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
        }

        .footer-section ul {
            list-style: none;
        }

        .footer-section li {
            margin-bottom: 8px;
        }

        .footer-section a {
            color: #ccc;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s;
        }

        .footer-section a:hover {
            color: #7C3AED;
        }

        .footer-bottom {
            border-top: 1px solid #333;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }

        /* RESPONSIVIDADE */
        @media (max-width: 1024px) {
            .products-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
            
            .header-main {
                flex-wrap: wrap;
            }
        }

        @media (max-width: 768px) {
            .header-main {
                flex-direction: column;
                gap: 12px;
            }

            .search-bar {
                max-width: 100%;
            }

            .products-grid {
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 10px;
            }

            .product-title {
                font-size: 12px;
            }

            .price-current {
                font-size: 14px;
            }

            .banner {
                padding: 24px;
                margin: 12px;
            }

            .banner h2 {
                font-size: 20px;
            }

            .footer-container {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 480px) {
            .header-actions {
                gap: 12px;
            }

            .products-grid {
                grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            }

            .product-card {
                border-radius: 4px;
            }

            .product-info {
                padding: 10px;
            }

            .product-title {
                font-size: 11px;
                min-height: auto;
            }

            .price-current {
                font-size: 13px;
            }
        }
    </style>
</head>
<body>
    <!-- TOP BAR -->
    <div class="header-top">
        <i class="fas fa-truck"></i> Frete grátis acima de R$ 150 • Devolução grátis
    </div>

    <!-- HEADER -->
    <div class="header-mp">
        <div class="header-main">
            <a href="/" class="logo-mp">
                <i class="fas fa-shopping-bag"></i>
                <?php echo esc_html($store_name); ?>
            </a>

            <div class="search-bar">
                <input type="text" placeholder="O que você busca?">
                <button><i class="fas fa-search"></i></button>
            </div>

            <div class="header-actions">
                <a href="#" class="action-link">
                    <i class="fas fa-heart"></i>
                    Favoritos
                </a>

                <a href="#" class="action-link cart-badge">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="badge">3</span>
                    Carrinho
                </a>

                <a href="#" class="action-link">
                    <i class="fas fa-user"></i>
                    Conta
                </a>
            </div>
        </div>
    </div>

    <!-- NAVEGAÇÃO -->
    <div class="nav-mp">
        <div class="nav-container">
            <a href="#" class="nav-item active">Início</a>
            <a href="#" class="nav-item">Vestidos</a>
            <a href="#" class="nav-item">Blusas</a>
            <a href="#" class="nav-item">Calças</a>
            <a href="#" class="nav-item">Saias</a>
            <a href="#" class="nav-item">Casacos</a>
            <a href="#" class="nav-item">Acessórios</a>
            <a href="#" class="nav-item">Outlet</a>
        </div>
    </div>

    <!-- BANNER -->
    <div class="banner">
        <h2>Bem-vindo ao Todday Modas Brechó</h2>
        <p>Moda sustentável com até 70% de desconto</p>
    </div>

    <!-- CONTAINER PRINCIPAL -->
    <div class="container-mp">
        <!-- FILTROS -->
        <div class="filters-section">
            <div class="filter-group">
                <label>Ordenar por:</label>
                <select>
                    <option>Relevância</option>
                    <option>Menor preço</option>
                    <option>Maior preço</option>
                    <option>Mais avaliado</option>
                </select>
            </div>

            <div class="filter-group">
                <label>Preço:</label>
                <input type="range" min="0" max="500" value="250">
            </div>

            <div class="filter-group">
                <label>Tamanho:</label>
                <select>
                    <option>Todos</option>
                    <option>P</option>
                    <option>M</option>
                    <option>G</option>
                    <option>GG</option>
                </select>
            </div>
        </div>

        <!-- GRID DE PRODUTOS -->
        <div class="products-grid">
            <?php
            // Produtos de exemplo
            $products = [
                [
                    'title' => 'Vestido Rosa Vintage',
                    'category' => 'Vestidos',
                    'price' => 129.90,
                    'original_price' => 299.90,
                    'discount' => 57,
                    'rating' => 4.8,
                    'reviews' => 45,
                ],
                [
                    'title' => 'Blusa Linho Off-White',
                    'category' => 'Blusas',
                    'price' => 89.90,
                    'original_price' => 189.90,
                    'discount' => 53,
                    'rating' => 4.9,
                    'reviews' => 72,
                ],
                [
                    'title' => 'Calça Jeans Premium',
                    'category' => 'Calças',
                    'price' => 99.90,
                    'original_price' => 249.90,
                    'discount' => 60,
                    'rating' => 4.7,
                    'reviews' => 38,
                ],
                [
                    'title' => 'Saia Midi Plissada',
                    'category' => 'Saias',
                    'price' => 119.90,
                    'original_price' => 279.90,
                    'discount' => 57,
                    'rating' => 4.6,
                    'reviews' => 26,
                ],
                [
                    'title' => 'Casaco Lã Caramelo',
                    'category' => 'Casacos',
                    'price' => 189.90,
                    'original_price' => 459.90,
                    'discount' => 59,
                    'rating' => 5.0,
                    'reviews' => 18,
                ],
                [
                    'title' => 'Vestido Festa Preto',
                    'category' => 'Vestidos',
                    'price' => 149.90,
                    'original_price' => 379.90,
                    'discount' => 61,
                    'rating' => 4.9,
                    'reviews' => 54,
                ],
                [
                    'title' => 'Blusa Rendada Creme',
                    'category' => 'Blusas',
                    'price' => 79.90,
                    'original_price' => 179.90,
                    'discount' => 56,
                    'rating' => 4.8,
                    'reviews' => 31,
                ],
                [
                    'title' => 'Shorts Jeans Cintura Alta',
                    'category' => 'Calças',
                    'price' => 69.90,
                    'original_price' => 159.90,
                    'discount' => 56,
                    'rating' => 4.7,
                    'reviews' => 42,
                ],
            ];

            foreach ($products as $product):
            ?>
                <div class="product-card">
                    <div class="product-image">
                        <img src="https://via.placeholder.com/180/7C3AED/ffffff?text=<?php echo urlencode($product['title']); ?>" alt="<?php echo esc_attr($product['title']); ?>">
                        
                        <div class="product-badges">
                            <span class="badge-new">NOVO</span>
                            <span class="badge-sale">-<?php echo $product['discount']; ?>%</span>
                        </div>

                        <div class="product-rating">
                            <i class="fas fa-star"></i>
                            <?php echo $product['rating']; ?> (<?php echo $product['reviews']; ?>)
                        </div>
                    </div>

                    <div class="product-info">
                        <div class="product-category"><?php echo $product['category']; ?></div>
                        <h3 class="product-title"><?php echo $product['title']; ?></h3>

                        <div class="product-price">
                            <?php if ($product['original_price'] > $product['price']): ?>
                                <span class="price-original">R$ <?php echo number_format($product['original_price'], 2, ',', '.'); ?></span>
                            <?php endif; ?>
                            <span class="price-current">R$ <?php echo number_format($product['price'], 2, ',', '.'); ?></span>
                        </div>

                        <div class="product-installment">
                            Até 3x de R$ <?php echo number_format($product['price'] / 3, 2, ',', '.'); ?>
                        </div>

                        <button class="product-btn">
                            <i class="fas fa-shopping-cart"></i> COMPRAR
                        </button>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- FOOTER -->
    <footer class="footer-mp">
        <div class="footer-container">
            <div class="footer-section">
                <h4>Sobre Todday Modas</h4>
                <ul>
                    <li><a href="#">Quem somos</a></li>
                    <li><a href="#">Nossa história</a></li>
                    <li><a href="#">Sustentabilidade</a></li>
                    <li><a href="#">Blog</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Compra e Devolução</h4>
                <ul>
                    <li><a href="#">Como comprar</a></li>
                    <li><a href="#">Frete e Entrega</a></li>
                    <li><a href="#">Devoluções</a></li>
                    <li><a href="#">Trocas</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Atendimento</h4>
                <ul>
                    <li><a href="tel:<?php echo esc_attr($phone); ?>"><?php echo esc_html($phone); ?></a></li>
                    <li><a href="#">Fale conosco</a></li>
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">Status do Pedido</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Redes Sociais</h4>
                <ul>
                    <li><a href="#"><i class="fab fa-instagram"></i> Instagram</a></li>
                    <li><a href="#"><i class="fab fa-facebook"></i> Facebook</a></li>
                    <li><a href="#"><i class="fab fa-pinterest"></i> Pinterest</a></li>
                    <li><a href="#"><i class="fab fa-tiktok"></i> TikTok</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2024 Todday Modas Brechó. Todos os direitos reservados.</p>
        </div>
    </footer>

    <!-- React Root (para integração futura) -->
    <div id="root" style="display:none;" class="tdm-react-root"></div>

    <script>
        // Interações simples
        document.querySelectorAll('.product-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Produto adicionado ao carrinho!');
            });
        });

        // Search
        document.querySelector('.search-bar button').addEventListener('click', function() {
            const query = document.querySelector('.search-bar input').value;
            if (query) alert('Buscando por: ' + query);
        });

        // Navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    </script>
</body>
</html>