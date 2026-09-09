<?php
/**
 * View: Integrações — Mercado Pago, WhatsApp, e-mail marketing.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$status        = isset( $_GET['tm_status'] ) ? sanitize_key( wp_unslash( $_GET['tm_status'] ) ) : '';
$sandbox       = get_option( 'tm_mp_sandbox', 'yes' );
$mp_ativo      = TM_Integrations::mp_plugin_active();
$pk_mask       = TM_Crypto::mask( (string) get_option( 'tm_mp_public_key', '' ) );
$token_mask    = TM_Crypto::mask( (string) get_option( 'tm_mp_access_token', '' ) );
$whatsapp      = TM_Helpers::get( 'tm_whatsapp_number', '' );
$wa_msg        = TM_Helpers::get( 'tm_whatsapp_message' );
$email_mk      = TM_Helpers::get( 'tm_email_marketing', '' );
?>
<h1><?php esc_html_e( 'Integrações', 'todday-modas' ); ?></h1>

<?php if ( 'ok' === $status ) : ?>
	<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Integrações salvas.', 'todday-modas' ); ?></p></div>
<?php elseif ( 'mp_ok' === $status ) : ?>
	<div class="notice notice-success is-dismissible"><p><?php esc_html_e( '✅ Conexão com o Mercado Pago funcionando! Credenciais válidas.', 'todday-modas' ); ?></p></div>
<?php elseif ( 'mp_no_token' === $status ) : ?>
	<div class="notice notice-warning is-dismissible"><p><?php esc_html_e( 'Salve um Access Token antes de testar a conexão.', 'todday-modas' ); ?></p></div>
<?php elseif ( 'mp_auth_error' === $status ) : ?>
	<div class="notice notice-error is-dismissible"><p><?php esc_html_e( 'O Mercado Pago recusou o Access Token. Verifique se colou a credencial correta (produção começa com APP_USR-, teste com TEST-).', 'todday-modas' ); ?></p></div>
<?php elseif ( 'mp_network_error' === $status ) : ?>
	<div class="notice notice-error is-dismissible"><p><?php esc_html_e( 'Falha de rede ao falar com o Mercado Pago. Tente novamente em instantes.', 'todday-modas' ); ?></p></div>
<?php endif; ?>

<?php if ( ! $mp_ativo ) : ?>
	<div class="notice notice-warning">
		<p>
			<?php esc_html_e( 'O plugin "Mercado Pago Payments for WooCommerce" não está ativo. Instale e ative para receber por Pix, cartão e boleto.', 'todday-modas' ); ?>
		</p>
	</div>
<?php endif; ?>

<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="tm-form">
	<input type="hidden" name="action" value="tm_save_integracoes" />
	<?php wp_nonce_field( 'tm_save_integracoes' ); ?>

	<h2><?php esc_html_e( 'Mercado Pago', 'todday-modas' ); ?></h2>
	<p class="description">
		<?php esc_html_e( 'As credenciais ficam criptografadas no banco e são repassadas ao plugin oficial. Nenhuma chave fica em texto puro no código ou em logs.', 'todday-modas' ); ?>
	</p>
	<table class="form-table">
		<tr>
			<th><label for="tm_mp_sandbox"><?php esc_html_e( 'Modo Sandbox (testes)', 'todday-modas' ); ?></label></th>
			<td>
				<label>
					<input type="checkbox" id="tm_mp_sandbox" name="tm_mp_sandbox" value="yes" <?php checked( $sandbox, 'yes' ); ?> />
					<?php esc_html_e( 'Usar credenciais de TESTE (desmarque quando for para produção)', 'todday-modas' ); ?>
				</label>
			</td>
		</tr>
		<tr>
			<th><label for="tm_mp_public_key"><?php esc_html_e( 'Public Key', 'todday-modas' ); ?></label></th>
			<td>
				<input type="text" id="tm_mp_public_key" name="tm_mp_public_key" class="regular-text" autocomplete="off" placeholder="<?php echo esc_attr( $pk_mask ? $pk_mask : 'APP_USR-... ou TEST-...' ); ?>" />
				<p class="description"><?php esc_html_e( 'Deixe vazio para manter a credencial atual. Produção começa com APP_USR-, teste com TEST-.', 'todday-modas' ); ?></p>
			</td>
		</tr>
		<tr>
			<th><label for="tm_mp_access_token"><?php esc_html_e( 'Access Token', 'todday-modas' ); ?></label></th>
			<td>
				<input type="password" id="tm_mp_access_token" name="tm_mp_access_token" class="regular-text" autocomplete="new-password" placeholder="<?php echo esc_attr( $token_mask ? $token_mask : 'APP_USR-... ou TEST-...' ); ?>" />
			</td>
		</tr>
	</table>

	<h2><?php esc_html_e( 'WhatsApp', 'todday-modas' ); ?></h2>
	<table class="form-table">
		<tr>
			<th><label for="tm_whatsapp_number"><?php esc_html_e( 'Número do WhatsApp', 'todday-modas' ); ?></label></th>
			<td>
				<input type="text" id="tm_whatsapp_number" name="tm_whatsapp_number" class="regular-text" value="<?php echo esc_attr( $whatsapp ); ?>" placeholder="(11) 99999-9999" />
				<p class="description"><?php esc_html_e( 'Deixe vazio para esconder o botão flutuante do site.', 'todday-modas' ); ?></p>
			</td>
		</tr>
		<tr>
			<th><label for="tm_whatsapp_message"><?php esc_html_e( 'Mensagem automática', 'todday-modas' ); ?></label></th>
			<td><input type="text" id="tm_whatsapp_message" name="tm_whatsapp_message" class="large-text" value="<?php echo esc_attr( $wa_msg ); ?>" /></td>
		</tr>
	</table>

	<h2><?php esc_html_e( 'E-mail marketing', 'todday-modas' ); ?></h2>
	<table class="form-table">
		<tr>
			<th><label for="tm_email_marketing"><?php esc_html_e( 'URL do formulário/API', 'todday-modas' ); ?></label></th>
			<td><input type="url" id="tm_email_marketing" name="tm_email_marketing" class="regular-text" value="<?php echo esc_url( $email_mk ); ?>" placeholder="https://..." /></td>
		</tr>
	</table>

	<?php submit_button( __( 'Salvar integrações', 'todday-modas' ) ); ?>
</form>

<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:10px;">
	<input type="hidden" name="action" value="tm_mp_test" />
	<?php wp_nonce_field( 'tm_mp_test' ); ?>
	<button type="submit" class="button"><?php esc_html_e( '🔌 Testar conexão com o Mercado Pago', 'todday-modas' ); ?></button>
</form>

<div class="tm-passo-a-passo">
	<h2><?php esc_html_e( 'Como configurar o Mercado Pago do zero', 'todday-modas' ); ?></h2>
	<ol>
		<li><?php esc_html_e( 'Crie (ou acesse) sua conta em mercadopago.com.br e verifique seus dados de negócio.', 'todday-modas' ); ?></li>
		<li><?php esc_html_e( 'Acesse "Suas integrações" → crie uma aplicação com o produto "Checkout API" e ative Pix, cartão e boleto.', 'todday-modas' ); ?></li>
		<li><?php esc_html_e( 'Cadastre uma chave Pix na sua conta Mercado Pago (sem chave Pix ativa, pagamentos Pix falham).', 'todday-modas' ); ?></li>
		<li><?php esc_html_e( 'Copie as credenciais de TESTE (TEST-...) aqui, mantenha o Modo Sandbox ligado e faça um pedido de teste.', 'todday-modas' ); ?></li>
		<li><?php esc_html_e( 'Aprovado nos testes? Troque pelas credenciais de PRODUÇÃO (APP_USR-...) e desligue o Modo Sandbox.', 'todday-modas' ); ?></li>
		<li>
			<?php
			/* translators: %s: URL de webhook */
			printf( esc_html__( 'Nas notificações da aplicação no Mercado Pago, configure o Webhook/IPN apontando para: %s (eventos de pagamento).', 'todday-modas' ), '<code>' . esc_html( home_url( '/?wc-api=WC_WooMercadoPago' ) ) . '</code>' );
			?>
		</li>
	</ol>
</div>
