<?php
/**
 * Template Moderno da Vitrine Todday Modas Brechó
 * Design premium de e-commerce com header fixo e navegação moderna
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}

// Obter informações da loja
$store_name = get_option('todday_settings_general')['store_name'] ?? 'Todday Modas Brechó';
$contact_email = get_option('todday_settings_general')['contact_email'] ?? get_option('admin_email');
$phone = get_option('todday_settings_general')['phone'] ?? '(35) 99175-9960';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Loja virtual premium de moda brechó com peças selecionadas e exclusivas.">
    <title><?php echo esc_html($store_name); ?> - Moda Brechó Premium</title>
    
    <!-- Fontes modernas -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
    
    <!-- Ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- CSS Moderno -->
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/todday-modern.css'); ?>">
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.css'); ?>">
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/todday-storefront.css'); ?>">
    
    <style>
        /* Estilos específicos para o template moderno */
        :root {
            --header-height: 80px;
            --header-mobile-height: 60px;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1F2937;
            background: #F9FAFB;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }
        
        /* Top Bar Informativa */
        .top-bar {
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            padding: 8px 0;
            font-size: 14px;
            text-align: center;
            position: relative;
            z-index: 60;
        }
        
        .top-bar-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .top-bar-offer {
            font-weight: 600;
        }
        
        .top-bar-offer span {
            background: #F59E0B;
            color: #1F2937;
            padding: 2px 8px;
            border-radius: 12px;
            margin-left: 8px;
            font-weight: 800;
        }
        
        .top-bar-contact {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        
        .top-bar-contact a {
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: opacity 0.2s;
        }
        
        .top-bar-contact a:hover {
            opacity: 0.9;
        }
        
        /* Header Moderno */
        .header-modern {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #E5E7EB;
            position: sticky;
            top: 0;
            z-index: 50;
            height: var(--header-height);
            transition: all 0.3s ease;
        }
        
        .header-scrolled {
            height: 70px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .header-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 20px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        /* Logo */
        .header-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 18px;
            font-family: 'Montserrat', sans-serif;
        }
        
        .logo-text {
            font-family: 'Montserrat', sans-serif;
            font-weight: 800;
            font-size: 24px;
            color: #1F2937;
            line-height: 1;
        }
        
        .logo-text span {
            color: #7C3AED;
        }
        
        /* Navegação Principal */
        .nav-main {
            display: flex;
            gap: 32px;
            align-items: center;
        }
        
        .nav-link {
            color: #4B5563;
            text-decoration: none;
            font-weight: 500;
            font-size: 15px;
            padding: 8px 0;
            position: relative;
            transition: color 0.2s;
        }
        
        .nav-link:hover {
            color: #7C3AED;
        }
        
        .nav-link.active {
            color: #7C3AED;
            font-weight: 600;
        }
        
        .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            border-radius: 2px;
        }
        
        /* Dropdown de Categorias */
        .nav-dropdown {
            position: relative;
        }
        
        .dropdown-toggle {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: -20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
            padding: 16px 0;
            min-width: 220px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s ease;
            z-index: 100;
        }
        
        .nav-dropdown:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-item {
            display: block;
            padding: 10px 24px;
            color: #4B5563;
            text-decoration: none;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        .dropdown-item:hover {
            background: #F3F4F6;
            color: #7C3AED;
            padding-left: 28px;
        }
        
        .dropdown-divider {
            height: 1px;
            background: #E5E7EB;
            margin: 8px 0;
        }
        
        /* Ações do Header */
        .header-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .action-button {
            position: relative;
            background: none;
            border: none;
            color: #4B5563;
            font-size: 20px;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .action-button:hover {
            color: #7C3AED;
            background: #F3F4F6;
        }
        
        .cart-count {
            position: absolute;
            top: -2px;
            right: -2px;
            background: #EF4444;
            color: white;
            font-size: 11px;
            font-weight: 700;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        
        /* Menu Mobile */
        .mobile-menu-button {
            display: none;
            background: none;
            border: none;
            font-size: 24px;
            color: #4B5563;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .mobile-menu-button:hover {
            color: #7C3AED;
            background: #F3F4F6;
        }
        
        /* Hero Banner */
        .hero-banner {
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            padding: 80px 0;
            position: relative;
            overflow: hidden;
            margin-bottom: 40px;
        }
        
        .hero-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 20px;
            position: relative;
            z-index: 2;
            text-align: center;
        }
        
        .hero-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 48px;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 16px;
        }
        
        .hero-subtitle {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.9);
            max-width: 600px;
            margin: 0 auto 32px;
            line-height: 1.6;
        }
        
        .hero-cta {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: white;
            color: #7C3AED;
            padding: 16px 32px;
            font-weight: 600;
            font-size: 16px;
            border-radius: 12px;
            text-decoration: none;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .hero-cta:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
            background: #F3F4F6;
        }
        
        .hero-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30 0L60 30L30 60L0 30z" fill="white" opacity="0.05"/></svg>');
            background-size: 60px 60px;
        }
        
        /* Conteúdo Principal */
        .main-content {
            max-width: 1280px;
            margin: 0 auto 80px;
            padding: 0 20px;
        }
        
        /* Responsividade */
        @media (max-width: 1024px) {
            .nav-main {
                gap: 24px;
            }
            
            .hero-title {
                font-size: 36px;
            }
            
            .hero-subtitle {
                font-size: 16px;
            }
        }
        
        @media (max-width: 768px) {
            :root {
                --header-height: var(--header-mobile-height);
            }
            
            .top-bar {
                display: none;
            }
            
            .mobile-menu-button {
                display: block;
            }
            
            .nav-main {
                position: fixed;
                top: var(--header-mobile-height);
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                flex-direction: column;
                padding: 40px 20px;
                gap: 0;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                z-index: 40;
                overflow-y: auto;
            }
            
            .nav-main.active {
                transform: translateX(0);
            }
            
            .nav-link {
                padding: 16px 0;
                width: 100%;
                border-bottom: 1px solid #E5E7EB;
                font-size: 16px;
            }
            
            .nav-dropdown .dropdown-menu {
                position: static;
                box-shadow: none;
                opacity: 1;
                visibility: visible;
                transform: none;
                padding: 0;
                background: #F9FAFB;
                margin-top: 8px;
                border-radius: 8px;
            }
            
            .hero-banner {
                padding: 60px 0;
            }
            
            .hero-title {
                font-size: 28px;
            }
            
            .hero-subtitle {
                font-size: 14px;
            }
            
            .header-actions {
                gap: 12px;
            }
            
            .logo-text {
                font-size: 20px;
            }
        }
        
        @media (max-width: 480px) {
            .hero-title {
                font-size: 24px;
            }
            
            .hero-cta {
                padding: 12px 24px;
                font-size: 14px;
            }
            
            .header-container {
                padding: 0 16px;
            }
        }
    </style>
</head>
<body class="tdm-modern">
    <!-- Top Bar Informativa -->
    <div class="top-bar">
        <div class="top-bar-content">
            <div class="top-bar-offer">
                <i class="fas fa-gift"></i> Frete grátis acima de R$ 150 <span>NOVO</span>
            </div>
            <div class="top-bar-contact">
                <a href="tel:<?php echo esc_attr($phone); ?>">
                    <i class="fas fa-phone"></i> <?php echo esc_html($phone); ?>
                </a>
                <a href="mailto:<?php echo esc_attr($contact_email); ?>">
                    <i class="fas fa-envelope"></i> <?php echo esc_html($contact_email); ?>
                </a>
            </div>
        </div>
    </div>

    <!-- Header Moderno -->
    <header class="header-modern" id="mainHeader">
        <div class="header-container">
            <!-- Logo -->
            <a href="/" class="header-logo">
                <div class="logo-icon">TM</div>
                <div class="logo-text">TODDAY<span>MODAS</span></div>
            </a>

            <!-- Navegação Desktop -->
            <nav class="nav-main" id="mainNav">
                <a href="/" class="nav-link active">
                    <i class="fas fa-home"></i> Início
                </a>
                
                <div class="nav-dropdown">
                    <div class="dropdown-toggle">
                        <span class="nav-link">
                            <i class="fas fa-tshirt"></i> Categorias
                        </span>
                        <i class="fas fa-chevron-down" style="font-size: 12px;"></i>
                    </div>
                    <div class="dropdown-menu">
                        <a href="#" class="dropdown-item">Vestidos</a>
                        <a href="#" class="dropdown-item">Blusas</a>
                        <a href="#" class="dropdown-item">Calças</a>
                        <a href="#" class="dropdown-item">Saias</a>
                        <a href="#" class="dropdown-item">Casacos</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item">Ver todas</a>
                    </div>
                </div>
                
                <a href="#" class="nav-link">
                    <i class="fas fa-star"></i> Novidades
                </a>
                
                <a href="#" class="nav-link">
                    <i class="fas fa-percent"></i> Ofertas
                </a>
                
                <a href="#" class="nav-link">
                    <i class="fas fa-info-circle"></i> Sobre
                </a>
                
                <a href="#" class="nav-link">
                    <i class="fas fa-headset"></i> Contato
                </a>
            </nav>

            <!-- Ações do Usuário -->
            <div class="header-actions">
                <button class="action-button search-button" title="Buscar">
                    <i class="fas fa-search"></i>
                </button>
                
                <button class="action-button wishlist-button" title="Lista de Desejos">
                    <i class="fas fa-heart"></i>
                </button>
                
                <button class="action-button cart-button" title="Carrinho">
                    <i class="fas fa-shopping-bag"></i>
                    <span class="cart-count">3</span>
                </button>
                
                <div class="user-avatar" title="Minha Conta">
                    <i class="fas fa-user"></i>
                </div>
                
                <!-- Botão Menu Mobile -->
                <button class="mobile-menu-button" id="mobileMenuButton">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Banner -->
    <section class="hero-banner">
        <div class="hero-pattern"></div>
        <div class="hero-content">
            <h1 class="hero-title">Moda Brechó com Estilo</h1>
            <p class="hero-subtitle">Descubra peças únicas e sustentáveis com até 70% de desconto. Qualidade premium com preços acessíveis.</p>
            <a href="#products" class="hero-cta">
                <span>Explorar Coleção</span>
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    </section>

    <!-- Conteúdo Principal (React App) -->
    <main class="main-content">
        <div id="root" class="tdm-react-root"></div>
        
        <noscript>
            <div class="tdm-react-noscript" style="padding:40px;text-align:center;font-family:sans-serif;color:#382343;background:white;border-radius:16px;margin:40px 0;">
                <h2 style="color:#7C3AED;margin-bottom:16px;"><?php echo esc_html($store_name); ?></h2>
                <p style="margin-bottom:24px;">Ative o JavaScript para navegar pela loja com todos os recursos.</p>
                <a href="/" style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                    Voltar para página inicial
                </a>
            </div>
        </noscript>
    </main>

    <!-- Scripts -->
    <script>
        // Header scroll effect
        window.addEventListener('scroll', function() {
            const header = document.getElementById('mainHeader');
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuButton').addEventListener('click', function() {
            const nav = document.getElementById('mainNav');
            nav.classList.toggle('active');
            this.innerHTML = nav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const nav = document.getElementById('mainNav');
            const button = document.getElementById('mobileMenuButton');
            
            if (!nav.contains(event.target) && !button.contains(event.target) && nav.classList.contains('active')) {
                nav.classList.remove('active');
                button.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const nav = document.getElementById('mainNav');
                    const button = document.getElementById('mobileMenuButton');
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        button.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            });
        });

        // Add loading animation
        document.addEventListener('DOMContentLoaded', function() {
            const root = document.getElementById('root');
            if (root) {
                root.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;">
                        <div style="width:60px;height:60px;border:4px solid #F3F4F6;border-top:4px solid #7C3AED;border-radius:50%;margin:0 auto 20px;animation:spin 1s linear infinite;"></div>
                        <p style="color:#6B7280;font-size:16px;">Carregando loja...</p>
                    </div>
                `;
                
                // Add spin animation
                const style = document.createElement('style');
                style.textContent = '@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}';
                document.head.appendChild(style);
            }
        });
    </script>
    
    <!-- React App -->
    <script type="module" src="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.js?v=' . TODDAY_MODAS_VERSION); ?>"></script>
</body>
</html>