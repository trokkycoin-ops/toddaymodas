<?php
namespace Zaya\AdminPanel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AGENTE DE MIDIA: toda imagem enviada pelo painel e otimizada automaticamente
 * (redimensionamento para max 1600px + conversao WebP quando disponivel)
 * antes de ser associada a produtos/banners.
 */
class Media {

	const MAX_DIMENSION = 1600;

	/**
	 * Processa multiplos arquivos enviados (input images[]).
	 *
	 * @return array|\WP_Error lista de attachment_ids em ordem
	 */
	public static function handle_multiple( $files_array, $parent_post = 0 ) {
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$ids = [];

		if ( ! is_array( $files_array['name'] ?? null ) ) {
			return new \WP_Error( 'no_files', 'Nenhuma imagem recebida.' );
		}

		foreach ( $files_array['name'] as $i => $name ) {
			if ( empty( $name ) ) { continue; }

			$err = $files_array['error'][ $i ] ?? UPLOAD_ERR_NO_FILE;

			// NUNCA falha em silencio: erros de limite voltam como mensagem clara.
			if ( UPLOAD_ERR_INI_SIZE === $err || UPLOAD_ERR_FORM_SIZE === $err ) {
				return new \WP_Error(
					'too_large',
					sprintf( '"%s" e grande demais para o limite de envio do servidor. Reduza a imagem ou use outra.', sanitize_file_name( $name ) )
				);
			}
			if ( UPLOAD_ERR_PARTIAL === $err ) {
				return new \WP_Error( 'partial_upload', sprintf( '"%s" chegou pela metade. Tente enviar novamente.', sanitize_file_name( $name ) ) );
			}
			if ( UPLOAD_ERR_NO_FILE === $err ) { continue; }
			if ( UPLOAD_ERR_OK !== $err ) {
				return new \WP_Error( 'upload_error', sprintf( 'Erro no envio de "%s" (codigo %d).', sanitize_file_name( $name ), (int) $err ) );
			}

			$single = [
				'name'     => $files_array['name'][ $i ],
				'type'     => $files_array['type'][ $i ],
				'tmp_name' => $files_array['tmp_name'][ $i ],
				'error'    => $files_array['error'][ $i ],
				'size'     => $files_array['size'][ $i ],
			];
			$id = self::handle_single( $single, $parent_post );
			if ( is_wp_error( $id ) ) {
				return $id; // erro especifico sobe para o painel exibir.
			}
			if ( $id ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	/**
	 * Upload unico: valida tipo, redimensiona, converte p/ WebP quando possivel,
	 * cria o attachment nativo do WordPress.
	 */
	public static function handle_single( $file, $parent_post = 0 ) {
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		// NECESSARIO para metadados de VIDEO (wp_read_video_metadata).
		require_once ABSPATH . 'wp-admin/includes/media.php';

		// Validacao de tipo real (nao confia no MIME enviado pelo navegador).
		$check = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'] );
		$allowed_images = [ 'image/jpeg', 'image/png', 'image/webp', 'image/gif' ];
		$allowed_videos = [ 'video/mp4', 'video/quicktime', 'video/webm' ];
		if ( empty( $check['type'] ) || ( ! in_array( $check['type'], $allowed_images, true ) && ! in_array( $check['type'], $allowed_videos, true ) ) ) {
			return new \WP_Error( 'invalid_file', sprintf( '"%s" nao e um arquivo valido (JPG, PNG, WebP, MP4 ou WebM).', sanitize_file_name( $file['name'] ) ) );
		}
		if ( ( $file['size'] ?? 0 ) > 60 * MB_IN_BYTES ) {
			return new \WP_Error( 'too_large', sprintf( '"%s" passa de 60MB.', sanitize_file_name( $file['name'] ) ) );
		}

		$is_video = in_array( $check['type'], $allowed_videos, true );

		$upload = wp_handle_sideload( $file, [ 'test_form' => false ], gmdate( 'Y/m' ) );
		if ( ! empty( $upload['error'] ) ) {
			return new \WP_Error( 'upload_failed', 'Falha ao mover arquivo: ' . $upload['error'] );
		}

		$path = $upload['file'];

		// Limite de DURACAO para videos: 20 segundos (via getID3 embutido no WP).
		if ( $is_video ) {
			try {
				require_once ABSPATH . 'wp-admin/includes/media.php';
				$vmeta   = wp_read_video_metadata( $path );
				$length  = (float) ( $vmeta['length'] ?? 0 );
				if ( $length > 20.5 ) {
					wp_delete_file( $path );
					return new \WP_Error(
						'too_long',
						sprintf( '"%s" tem %d segundos. O limite para o hero e de 20 segundos.', sanitize_file_name( $file['name'] ), (int) round( $length ) )
					);
				}
			} catch ( \Throwable $e ) {
				error_log( '[Zaya Media] leitura de metadados de video falhou (upload mantido): ' . $e->getMessage() );
			}
		}

		// Otimizacao apenas para imagens (video segue como veio).
		if ( ! $is_video ) {
			self::optimize( $path );
		}

		$attachment_id = wp_insert_attachment(
			[
				'post_mime_type' => $check['type'],
				'post_title'     => sanitize_file_name( pathinfo( $upload['url'], PATHINFO_FILENAME ) ),
				'post_status'    => 'inherit',
				'post_parent'    => (int) $parent_post,
			],
			$path,
			(int) $parent_post
		);

		if ( is_wp_error( $attachment_id ) ) {
			return new \WP_Error( 'attach_failed', 'Falha ao registrar midia no WordPress.' );
		}

		// Metadados: falha aqui NUNCA pode bloquear o upload ja concluido.
		try {
			wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $path ) );
		} catch ( \Throwable $e ) {
			error_log( '[Zaya Media] metadata falhou (upload mantido): ' . $e->getMessage() );
		}

		return (int) $attachment_id;
	}

	/**
	 * Redimensiona para MAX_DIMENSION e converte JPEG/PNG grandes para WebP
	 * quando a GD da hospedagem suporta. Falhas aqui sao silenciosas por design:
	 * imagem original permanece utilizavel.
	 */
	private static function optimize( $path ) {
		if ( ! function_exists( 'wp_get_image_editor' ) ) {
			return;
		}
		try {
			$image = wp_get_image_editor( $path );
			if ( is_wp_error( $image ) ) {
				return;
			}
			$size = $image->get_size();
			if ( ( $size['width'] ?? 0 ) > self::MAX_DIMENSION || ( $size['height'] ?? 0 ) > self::MAX_DIMENSION ) {
				$image->resize( self::MAX_DIMENSION, self::MAX_DIMENSION, false );
				$image->save( $path );
			}

			// WebP: gera copia otimizada lado a lado (usada pelo front quando existir).
			if ( function_exists( 'imagewebp' ) && in_array( strtolower( pathinfo( $path, PATHINFO_EXTENSION ) ), [ 'jpg', 'jpeg', 'png' ], true ) ) {
				$editor = wp_get_image_editor( $path );
				if ( ! is_wp_error( $editor ) && wp_image_editor_supports( [ 'mime_type' => 'image/webp' ] ) ) {
					$webp_path = preg_replace( '/\.(jpe?g|png)$/i', '.webp', $path );
					$editor->set_quality( 82 );
					$editor->save( $webp_path, 'image/webp' );
				}
			}
		} catch ( \Throwable $e ) {
			// otimizacao e best-effort; nunca bloqueia o upload.
		}
	}

	/**
	 * URL de um attachment, preferindo a versao WebP se existir fisicamente.
	 */
	public static function best_url( $attachment_id, $size = 'medium' ) {
		$url = wp_get_attachment_image_url( $attachment_id, $size );
		if ( ! $url ) {
			// Videos e outros nao-imagens: usa a URL direta do attachment.
			$url = wp_get_attachment_url( $attachment_id );
		}
		if ( ! $url ) {
			return '';
		}
		$file = get_attached_file( $attachment_id );
		if ( $file ) {
			$webp = preg_replace( '/\.(jpe?g|png)$/i', '.webp', $file );
			if ( file_exists( $webp ) ) {
				$uploads = wp_get_upload_dir();
				$url     = str_replace( $uploads['basedir'], $uploads['baseurl'], $webp );
			}
		}
		return $url;
	}
}
