<?php
namespace Zaya\AdminPanel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Agentes de orquestracao: cada acao do painel dispara rotinas que cuidam
 * de TUDO que o WordPress precisa por trás — €” sem passos manuais.
 */
class Agents {

	/* â•â•â•â•â•â•â•â•â•â•â•â• AGENTE DE PRODUTO â•â•â•â•â•â•â•â•â•â•â•â• */

	/**
	 * Cria ou atualiza um produto completo: post, precos, estoque,
	 * categorias (criando-as se nao existirem), imagens e contexto de marca.
	 *
	 * @param array $data name, description, short_desc, regular_price, sale_price,
	 *                    sku, stock_qty, manage_stock, categories[], status
	 * @param array $files $_FILES com images[] (multipart)
	 * @return int|\WP_Error product_id
	 */
	public static function save_product( $data, $files = array() ) {
		if ( ! class_exists( '\WC_Product_Simple' ) ) {
			return new \WP_Error( 'no_woo', 'WooCommerce nao esta ativo.' );
		}
		$name = sanitize_text_field( $data['name'] ?? '' );
		if ( '' === $name ) {
			return new \WP_Error( 'invalid_name', 'O produto precisa de um nome.' );
		}

		$product_id = isset( $data['id'] ) ? absint( $data['id'] ) : 0;
		$is_new     = $product_id < 1;

		try {
			$product = $is_new ? new \WC_Product_Simple() : wc_get_product( $product_id );
			if ( ! $product ) {
				return new \WP_Error( 'not_found', 'Produto nao encontrado.' );
			}

			$product->set_name( $name );
			$status = ( isset( $data['status'] ) && 'draft' === $data['status'] ) ? 'draft' : 'publish';
			$product->set_status( $status );
			if ( ! empty( $data['description'] ) ) { $product->set_description( wp_kses_post( $data['description'] ) ); }
			if ( ! empty( $data['short_desc'] ) ) { $product->set_short_description( wp_kses_post( $data['short_desc'] ) ); }

			if ( isset( $data['regular_price'] ) && '' !== $data['regular_price'] ) {
				$product->set_regular_price( str_replace( ',', '.', (string) $data['regular_price'] ) );
			}
			$product->set_sale_price( isset( $data['sale_price'] ) && '' !== $data['sale_price'] ? str_replace( ',', '.', (string) $data['sale_price'] ) : '' );

			if ( ! empty( $data['sku'] ) ) {
				$existing = wc_get_product_id_by_sku( sanitize_text_field( $data['sku'] ) );
				if ( $existing && (int) $existing !== $product->get_id() ) {
					return new \WP_Error( 'sku_dupe', 'Este SKU ja esta em uso por outro produto.' );
				}
				$product->set_sku( sanitize_text_field( $data['sku'] ) );
			}

			if ( isset( $data['stock_qty'] ) && '' !== $data['stock_qty'] ) {
				// Enviar estoque sem manage_stock explicito = gerenciar automaticamente.
				$product->set_manage_stock( isset( $data['manage_stock'] ) ? (bool) $data['manage_stock'] : true );
				$product->set_stock_quantity( max( 0, (int) $data['stock_qty'] ) );
				$product->set_stock_status( (int) $data['stock_qty'] > 0 ? 'instock' : 'outofstock' );
			} else if ( isset( $data['manage_stock'] ) ) {
				$product->set_manage_stock( (bool) $data['manage_stock'] );
			}

			// Agente de Categoria: atribui e cria categorias inexistentes.
			$cats = self::resolve_categories( $data['categories'] ?? [] );
			if ( ! empty( $cats ) ) {
				$product->set_category_ids( $cats );
			}

			$product_id = $product->save();

			// Agente de Midia: primeira imagem enviada vira destaque; demais viram galeria.
			if ( ! empty( $files['images'] ) ) {
				$ids = Media::handle_multiple( $files['images'], $product_id );
				if ( is_wp_error( $ids ) ) {
					return $ids;
				}
				if ( ! empty( $ids ) ) {
					$product->set_image_id( $ids[0] );
					if ( count( $ids ) > 1 ) {
						$product->set_gallery_image_ids( array_slice( $ids, 1, 3 ) );
					}
					$product->save();
				}
			}

			
			Activity_Log::log(
				$is_new ? 'product_created' : 'product_updated',
				'product',
				$product_id,
				sprintf( '%s &mdash; %s', esc_html( $name ), wp_strip_all_tags( wc_price( (float) $product->get_price() ) ) )
			);

			return $product_id;
		} catch ( \Throwable $e ) {
			return new \WP_Error( 'product_failed', 'Erro ao salvar produto: ' . $e->getMessage() );
		}
	}

	

	/* â•â•â•â•â•â•â•â•â•â•â•â• AGENTE DE CATEGORIA â•â•â•â•â•â•â•â•â•â•â•â• */

	/**
	 * Cria/atualiza categoria nativa do WooCommerce (visivel no wp-admin)
	 * com meta de contexto visual (claro/escuro).
	 */
	public static function save_category( $data ) {
		$name   = sanitize_text_field( $data['name'] ?? '' );
		$parent = absint( $data['parent'] ?? 0 );
		$term_id = absint( $data['id'] ?? 0 );

		if ( '' === $name ) {
			return new \WP_Error( 'invalid_name', 'A categoria precisa de um nome.' );
		}
		if ( $parent && ! get_term( $parent, 'product_cat' ) ) {
			return new \WP_Error( 'invalid_parent', 'Categoria pai nao encontrada.' );
		}

		$args = [ 'parent' => $parent ];
		if ( ! empty( $data['slug'] ) ) { $args['slug'] = sanitize_title( $data['slug'] ); }

		if ( $term_id ) {
			$result = wp_update_term( $term_id, 'product_cat', array_merge( $args, [ 'name' => $name ] ) );
			$action = 'category_updated';
		} else {
			$result = wp_insert_term( $name, 'product_cat', $args );
			$action = 'category_created';
		}

		if ( is_wp_error( $result ) ) {
			if ( 'term_exists' === $result->get_error_code() ) {
				$existing = get_term_by( 'name', $name, 'product_cat' );
				return [ 'id' => (int) $existing->term_id, 'existed' => true ];
			}
			return $result;
		}

		$term_id = (int) ( $result['term_id'] ?? 0 );

		// Contexto visual da categoria (claro/escuro).
		$context = ( 'dark' === ( $data['context'] ?? 'light' ) ) ? 'dark' : 'light';
		update_term_meta( $term_id, 'tm_context', $context );

		Activity_Log::log( $action, 'category', $term_id, sprintf( '%s (contexto %s)', esc_html( $name ), $context ) );

		return [ 'id' => $term_id, 'existed' => false ];
	}

	/**
	 * Converte nomes de categorias em IDs, criando as que nao existem.
	 * Aceita array ou string separada por virgula; ignora artefatos de JSON.
	 */
	public static function resolve_categories( $names ) {
		if ( is_string( $names ) ) {
			$names = explode( ',', $names );
		}
		$ids = [];
		foreach ( (array) $names as $name ) {
			// Remove artefatos de serializacao ([] " ") que geram categorias lixo.
			$name = trim( str_replace( [ '[', ']', '"' ], '', (string) $name ), " \t\n\r" );
			if ( '' === $name ) { continue; }
			$term = get_term_by( 'name', $name, 'product_cat' );
			if ( ! $term && function_exists( 'get_term_by' ) ) {
				$term = get_term_by( 'slug', sanitize_title( $name ), 'product_cat' );
			}
			if ( $term && ! is_wp_error( $term ) ) {
				$ids[] = (int) $term->term_id;
				continue;
			}
			$new = wp_insert_term( $name, 'product_cat' );
			if ( ! is_wp_error( $new ) ) {
				$ids[] = (int) $new['term_id'];
				Activity_Log::log( 'category_autocreated', 'category', (int) $new['term_id'], $name . ' (ao salvar produto)' );
			}
		}
		return array_values( array_unique( $ids ) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â• AGENTE DE PEDIDO â•â•â•â•â•â•â•â•â•â•â•â• */

	/**
	 * Atualiza status via metodo nativo do WooCommerce (dispara e-mails/hooks).
	 */
	public static function update_order_status( $order_id, $status ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return new \WP_Error( 'not_found', 'Pedido nao encontrado.' );
		}
		$valid = array_keys( wc_get_order_statuses() );
		$key   = 'wc-' . strtolower( preg_replace( '/^wc-/', '', (string) $status ) );
		if ( ! in_array( $key, $valid, true ) ) {
			return new \WP_Error( 'invalid_status', 'Status invalido.' );
		}

		$old = $order->get_status();
		$result = $order->update_status( $key ); // hooks nativos: emails, integracoes...
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		Activity_Log::log( 'order_status_changed', 'order', $order_id, sprintf( 'Pedido #%d: %s -> %s', $order_id, $old, str_replace( 'wc-', '', $key ) ) );
		return true;
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â• LOG HELPER â•â•â•â•â•â•â•â•â•â•â•â• */

	public static function log_settings_saved( $group ) {
		Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Configuracoes "%s" atualizadas.', sanitize_key( $group ) ) );
	}
}
