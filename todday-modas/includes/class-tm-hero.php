<?php
/**
 * Hero da Home: conteúdo da seção de abertura gerenciado pelo painel.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Armazena, sanitiza e renderiza a seção hero da página inicial.
 *
 * O hero original vivia hardcoded no conteúdo da página "Início". Com esta
 * classe, o painel de gestão edita a configuração (option '_tm_hero_config')
 * e o shortcode [tm_hero] renderiza o bloco com as MESMAS classes de CSS.
 *
 * Comportamento de ativação: enquanto a option não existir, o conteúdo da
 * página continua como está (hero estático). Na primeira gravação pelo painel,
 * o filtro the_content troca a seção <section class="tmv-hero..."> pelo
 * shortcode, dirigindo o hero inteiro pela configuração.
 */
class TM_Hero {

	const OPTION = '_tm_hero_config';

	/**
	 * Hooks.
	 */
	public static function init() {
		add_shortcode( 'tm_hero', array( __CLASS__, 'shortcode' ) );
		// Prioridade 8: roda antes do do_shortcode (11), permitindo a troca do bloco estático.
		add_filter( 'the_content', array( __CLASS__, 'filter_content' ), 8 );
	}

	/**
	 * Configuração padrão — espelha exatamente o hero estático atual.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'eyebrow' => 'Brechó com peças selecionadas · Moda circular',
			'titulo'  => 'Vista-se de *histórias*.',
			'sub'     => 'Peças únicas escolhidas a dedo, conferidas uma a uma e prontas para um novo começo — do trabalho ao fim de semana.',
			'cta1'    => array( 'label' => 'Explorar a coleção', 'url' => '/loja/' ),
			'cta2'    => array( 'label' => 'Nossa história', 'url' => '/sobre/' ),
			'mini'    => array(
				'Nova seleção toda semana',
				'Peças aprovadas pela nossa seleção',
			),
			'selo'    => array( 'Moda circular', 'peças únicas' ),
			'imagens' => array(
				array( 'slot' => 'principal', 'url' => '/wp-content/uploads/2026/09/vestido-midi-floral.webp', 'alt' => 'Vestido midi floral' ),
				array( 'slot' => 'sec1', 'url' => '/wp-content/uploads/2026/09/bolsa-tote.webp', 'alt' => 'Bolsa tote caramelo' ),
				array( 'slot' => 'sec2', 'url' => '/wp-content/uploads/2026/09/lenco-seda.webp', 'alt' => 'Lenço de seda' ),
			),
		);
	}

	/**
	 * Configuração atual (option sobre defaults).
	 *
	 * @return array
	 */
	public static function get_config() {
		$saved  = get_option( self::OPTION, array() );
		$saved  = is_array( $saved ) ? $saved : array();
		$d      = self::defaults();
		$merged = array_merge( $d, $saved );

		// Imagens: garante 3 slots sempre (principal, sec1, sec2).
		$imgs = isset( $saved['imagens'] ) && is_array( $saved['imagens'] ) ? $saved['imagens'] : $d['imagens'];
		$order = array( 'principal', 'sec1', 'sec2' );
		$normalized = array();
		foreach ( $order as $i => $slot ) {
			$raw = isset( $imgs[ $i ] ) ? $imgs[ $i ] : array();
			if ( $raw['slot'] ?? '' !== $slot ) {
				$found = null;
				foreach ( $imgs as $im ) {
					if ( is_array( $im ) && ( $im['slot'] ?? '' ) === $slot ) {
						$found = $im;
						break;
					}
				}
				$raw = $found ? $found : ( $d['imagens'][ $i ] ?? array( 'slot' => $slot, 'url' => '', 'alt' => '' ) );
			}
			$normalized[] = array(
				'slot' => $slot,
				'url'  => (string) ( $raw['url'] ?? '' ),
				'alt'  => (string) ( $raw['alt'] ?? '' ),
			);
		}
		$merged['imagens'] = $normalized;

		if ( empty( $merged['cta1'] ) || ! is_array( $merged['cta1'] ) ) {
			$merged['cta1'] = $d['cta1'];
		}
		if ( empty( $merged['cta2'] ) || ! is_array( $merged['cta2'] ) ) {
			$merged['cta2'] = $d['cta2'];
		}
		if ( empty( $merged['selo'] ) || ! is_array( $merged['selo'] ) ) {
			$merged['selo'] = $d['selo'];
		}
		if ( empty( $merged['mini'] ) || ! is_array( $merged['mini'] ) ) {
			$merged['mini'] = $d['mini'];
		}
		return $merged;
	}

	/**
	 * Valida e grava a configuração vinda do painel (REST).
	 *
	 * @param array $body Payload já un-slashed (JSON ou form params).
	 */
	public static function save_config( $body ) {
		$body    = is_array( $body ) ? $body : array();
		$current = self::get_config();

		$clean = array(
			'eyebrow' => self::clean_text( $body['eyebrow'] ?? $current['eyebrow'], 90 ),
			'titulo'  => self::clean_text( $body['titulo'] ?? $current['titulo'], 160 ),
			'sub'     => self::clean_text( $body['sub'] ?? $current['sub'], 320 ),
			'cta1'    => array(
				'label' => self::clean_text( $body['cta1']['label'] ?? $current['cta1']['label'], 60 ),
				'url'   => self::clean_url( $body['cta1']['url'] ?? $current['cta1']['url'] ),
			),
			'cta2'    => array(
				'label' => self::clean_text( $body['cta2']['label'] ?? $current['cta2']['label'], 60 ),
				'url'   => self::clean_url( $body['cta2']['url'] ?? $current['cta2']['url'] ),
			),
			'selo'    => array(
				self::clean_text( $body['selo'][0] ?? $current['selo'][0], 40 ),
				self::clean_text( $body['selo'][1] ?? $current['selo'][1], 40 ),
			),
		);

		$mini = array();
		if ( is_array( $body['mini'] ?? null ) ) {
			foreach ( $body['mini'] as $line ) {
				$line = self::clean_text( $line, 90 );
				if ( '' !== $line ) {
					$mini[] = $line;
				}
			}
		} else {
			foreach ( (array) $current['mini'] as $line ) {
				$mini[] = self::clean_text( $line, 90 );
			}
		}
		$clean['mini'] = array_slice( $mini, 0, 6 );

		$imagens = array();
		if ( is_array( $body['imagens'] ?? null ) ) {
			$order = array( 'principal', 'sec1', 'sec2' );
			foreach ( $order as $i => $slot ) {
				$imagens[] = array(
					'slot' => $slot,
					'url'  => self::clean_url( $body['imagens'][ $i ]['url'] ?? ( $current['imagens'][ $i ]['url'] ?? '' ) ),
					'alt'  => self::clean_text( $body['imagens'][ $i ]['alt'] ?? ( $current['imagens'][ $i ]['alt'] ?? '' ), 120 ),
				);
			}
		} else {
			$imagens = $current['imagens'];
		}
		$clean['imagens'] = $imagens;

		update_option( self::OPTION, $clean, false );

		if ( function_exists( 'TM_Logger' ) && method_exists( 'TM_Logger', 'add' ) ) {
			TM_Logger::add( 'info', 'Hero da Home atualizado pelo painel.' );
		}

		return $clean;
	}

	/**
	 * "Restaura" o hero estático: remove a configuração salva.
	 */
	public static function reset() {
		delete_option( self::OPTION );
	}

	/**
	 * Texto sem HTML/tags, com limite de tamanho.
	 *
	 * @param mixed  $raw Valor bruto.
	 * @param int    $max Limite de chars.
	 * @return string
	 */
	private static function clean_text( $raw, $max ) {
		$raw = wp_strip_all_tags( (string) ( is_scalar( $raw ) ? $raw : '' ), true );
		$raw = trim( $raw );
		if ( function_exists( 'mb_substr' ) && mb_strlen( $raw ) > $max ) {
			$raw = mb_substr( $raw, 0, $max );
		}
		return $raw;
	}

	/**
	 * URL permitida: https, http ou caminho interno (ex.: /loja/). Nunca javascript:.
	 *
	 * @param mixed $raw Valor bruto.
	 * @return string
	 */
	private static function clean_url( $raw ) {
		$raw = trim( (string) ( is_scalar( $raw ) ? $raw : '' ) );
		if ( '' === $raw ) {
			return '';
		}
		if ( 0 === strpos( $raw, '/' ) ) {
			return sanitize_text_field( $raw );
		}
		$esc = esc_url_raw( $raw, array( 'http', 'https' ) );
		return is_string( $esc ) ? $esc : '';
	}

	/**
	 * Título com *palavra* convertida em <em>.
	 *
	 * @param string $raw Texto do título.
	 * @return string HTML com <em> quando aplicável.
	 */
	private static function render_titulo( $raw ) {
		if ( '' === trim( $raw ) ) {
			return '';
		}
		$out = preg_replace( '/\*(.+?)\*/u', '<em>$1</em>', $raw );
		return wp_kses( $out, array( 'em' => array() ) );
	}

	/**
	 * Renderiza a seção hero completa (mesmas classes do CSS atual).
	 *
	 * @param array $cfg Configuração.
	 * @return string
	 */
	public static function render( $cfg = null ) {
		$cfg = is_array( $cfg ) ? $cfg : self::get_config();

		$eyebrow = esc_html( (string) ( $cfg['eyebrow'] ?? '' ) );
		$titulo  = self::render_titulo( (string) ( $cfg['titulo'] ?? '' ) );
		$sub     = esc_html( (string) ( $cfg['sub'] ?? '' ) );

		$cta1  = $cfg['cta1'] ?? array( 'label' => '', 'url' => '' );
		$cta2  = $cfg['cta2'] ?? array( 'label' => '', 'url' => '' );
		$mini  = (array) ( $cfg['mini'] ?? array() );
		$selo  = (array) ( $cfg['selo'] ?? array() );
		$imgs  = (array) ( $cfg['imagens'] ?? array() );

		$html  = '<section class="tmv-hero tm-fullbleed">' . "\n\t";
		$html .= '<div class="tmv-hero-inner">' . "\n\t\t";
		$html .= '<div class="tmv-hero-texto">' . "\n\t\t\t";
		$html .= '<p class="tmv-eyebrow">' . $eyebrow . '</p>' . "\n\t\t\t";
		if ( '' !== $titulo ) {
			$html .= '<h1 class="tmv-hero-titulo">' . $titulo . '</h1>' . "\n\t\t\t";
		}
		$html .= '<p class="tmv-hero-sub">' . $sub . '</p>' . "\n\t\t\t";
		$html .= '<div class="tmv-hero-ctas">' . "\n\t\t\t\t";
		if ( '' !== ( $cta1['label'] ?? '' ) && '' !== ( $cta1['url'] ?? '' ) ) {
			$html .= '<a class="tmv-btn tmv-btn--primario" href="' . esc_url( $cta1['url'] ) . '">' . esc_html( $cta1['label'] ) . '</a>' . "\n\t\t\t\t";
		}
		if ( '' !== ( $cta2['label'] ?? '' ) && '' !== ( $cta2['url'] ?? '' ) ) {
			$html .= '<a class="tmv-btn tmv-btn--texto" href="' . esc_url( $cta2['url'] ) . '">' . esc_html( $cta2['label'] ) . ' <span aria-hidden="true">&rarr;</span></a>' . "\n\t\t\t";
		}
		$html .= '</div>' . "\n\t\t\t";
		if ( ! empty( $mini ) ) {
			$html .= '<ul class="tmv-hero-mini" role="list">';
			foreach ( $mini as $item ) {
				$html .= "\n\t\t\t\t" . '<li>' . esc_html( $item ) . '</li>';
			}
			$html .= "\n\t\t\t" . '</ul>';
		}
		$html .= "\n\t\t" . '</div>' . "\n\t\t";
		$html .= '<div class="tmv-hero-visual" aria-hidden="true">';

		$classes = array(
			'principal' => 'tmv-hero-foto tmv-hero-foto--principal',
			'sec1'      => 'tmv-hero-foto tmv-hero-foto--sec1',
			'sec2'      => 'tmv-hero-foto tmv-hero-foto--sec2',
		);
		foreach ( $imgs as $i => $img ) {
			$slot   = $img['slot'] ?? ( isset( $classes[ $i ] ) ? $i : 'principal' );
			$url    = (string) ( $img['url'] ?? '' );
			$alt    = (string) ( $img['alt'] ?? '' );
			$class  = isset( $classes[ $slot ] ) ? $classes[ $slot ] : (array_values( $classes )[ min( $i, 2 ) ] );
			$lazy   = ( 'principal' === $slot ) ? 'eager' : 'lazy';
			if ( '' !== $url ) {
				$html .= "\n\t\t\t" . '<figure class="' . esc_attr( $class ) . '">';
				$html .= '<img src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt ) . '" loading="' . $lazy . '" />';
				$html .= '</figure>';
			}
		}

		if ( ! empty( $selo[0] ) || ! empty( $selo[1] ) ) {
			$html .= "\n\t\t\t" . '<p class="tmv-hero-selo">' . esc_html( (string) ( $selo[0] ?? '' ) );
			if ( ! empty( $selo[1] ) ) {
				$html .= '<b>' . esc_html( $selo[1] ) . '</b>';
			}
			$html .= '</p>';
		}

		$html .= "\n\t\t" . '</div>' . "\n\t";
		$html .= '</div>' . "\n";
		$html .= '</section>' . "\n";
		return $html;
	}

	/**
	 * Shortcode [tm_hero].
	 *
	 * @return string
	 */
	public static function shortcode() {
		return self::render();
	}

	/**
	 * Filtro the_content: só troca o hero estático na página inicial quando
	 * o painel já gravou uma configuração (option existe).
	 *
	 * @param string $content Conteúdo.
	 * @return string
	 */
	public static function filter_content( $content ) {
		if ( ! is_front_page() || ! self::is_activated() ) {
			return $content;
		}
		return self::replace_in_content( $content );
	}

	/**
	 * Option existe? (painel salvou ao menos uma vez).
	 *
	 * @return bool
	 */
	public static function is_activated() {
		return false !== get_option( self::OPTION, false );
	}

	/**
	 * Troca o bloco estático <section class="tmv-hero tm-fullbleed">... </section>
	 * pelo shortcode. Pure para testes.
	 *
	 * @param string $content Conteúdo bruto da página.
	 * @return string
	 */
	public static function replace_in_content( $content ) {
		$pattern     = '#\s*<section class="tmv-hero tm-fullbleed">.*?</section>#s';
		$replacement = "\n<!-- ===== Hero (gerenciado pelo painel) ===== -->\n[tm_hero]\n";
		return preg_replace( $pattern, $replacement, $content, 1 );
	}
}