<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
$status_filter = isset( $_GET['status_filter'] ) ? sanitize_text_field( wp_unslash( $_GET['status_filter'] ) ) : 'todos';
$submissions = TM_Parcerias::get_submissions( $status_filter );
?>
<div class="wrap tm-admin-wrap">
    <div class="tm-admin-header">
        <h1><?php esc_html_e( 'Parcerias & Desapegos — Gestão de Fornecedores', 'todday-modas' ); ?></h1>
        <span class="tm-badge tm-badge-success"><?php echo count( $submissions ); ?> solicitações</span>
    </div>
    <div class="tm-admin-body">
        <p><?php esc_html_e( 'Gerencie pessoas que preencheram o formulário "Quero Vender / Desapegar" pelo shortcode [todday_quero_vender] ou na boutique online.', 'todday-modas' ); ?></p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin:20px 0; background:#FAF8F5; padding:12px 18px; border-radius:8px;">
            <div style="font-size:13px; font-weight:bold;">
                Filtrar por Status:
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=tm-parcerias&status_filter=todos' ) ); ?>" class="button button-small <?php echo $status_filter === 'todos' ? 'button-primary' : ''; ?>">Todos</a>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=tm-parcerias&status_filter=pendente' ) ); ?>" class="button button-small <?php echo $status_filter === 'pendente' ? 'button-primary' : ''; ?>">Pendentes</a>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=tm-parcerias&status_filter=em_analise' ) ); ?>" class="button button-small <?php echo $status_filter === 'em_analise' ? 'button-primary' : ''; ?>">Em Análise</a>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=tm-parcerias&status_filter=aprovado' ) ); ?>" class="button button-small <?php echo $status_filter === 'aprovado' ? 'button-primary' : ''; ?>">Aprovados</a>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=tm-parcerias&status_filter=concluido' ) ); ?>" class="button button-small <?php echo $status_filter === 'concluido' ? 'button-primary' : ''; ?>">Concluídos</a>
            </div>
            <div>
                <span style="font-size:12px; color:#666;">Shortcode para páginas/Elementor: <code>[todday_quero_vender]</code></span>
            </div>
        </div>

        <?php if ( empty( $submissions ) ) : ?>
            <div style="text-align:center; padding:40px; background:#fff; border:1px solid #eee; border-radius:8px;">
                <h3>Nenhuma proposta de parceria cadastrada neste status.</h3>
                <p style="color:#777;">Quando clientes preencherem o formulário no site, as propostas aparecerão aqui em tempo real.</p>
            </div>
        <?php else : ?>
            <table class="widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width:60px;">ID</th>
                        <th>Contato / Nome</th>
                        <th>WhatsApp</th>
                        <th>Categoria / Peças</th>
                        <th>Modalidade</th>
                        <th>Marcas & Descrição</th>
                        <th>Status</th>
                        <th style="width:180px;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $submissions as $sub ) : 
                        $whats_clean = preg_replace( '/\D/', '', $sub['telefone'] );
                        $msg = rawurlencode( "Olá " . $sub['nome'] . "! Sou da Curadoria Todday Modas. Recebemos sua proposta de parceria para desapego de peças e gostaríamos de avaliar!" );
                    ?>
                        <tr>
                            <td><strong>#<?php echo esc_html( $sub['id'] ); ?></strong></td>
                            <td>
                                <strong><?php echo esc_html( $sub['nome'] ); ?></strong><br>
                                <small style="color:#666;"><?php echo esc_html( $sub['cidade'] ); ?> - <?php echo esc_html( $sub['estado'] ); ?></small><br>
                                <small><?php echo esc_html( $sub['email'] ); ?></small>
                            </td>
                            <td>
                                <strong><?php echo esc_html( $sub['telefone'] ); ?></strong><br>
                                <a href="https://wa.me/55<?php echo esc_attr( $whats_clean ); ?>?text=<?php echo esc_attr( $msg ); ?>" target="_blank" class="button button-small" style="background:#25D366; color:#fff; border:none; margin-top:4px;">
                                    Abrir WhatsApp
                                </a>
                            </td>
                            <td>
                                <span class="tm-badge"><?php echo esc_html( ucfirst( $sub['categoria'] ) ); ?></span><br>
                                <small><?php echo esc_html( $sub['quantidade'] ); ?> peças</small><br>
                                <small style="color:#777;"><?php echo esc_html( $sub['condicao'] ); ?></small>
                            </td>
                            <td>
                                <strong><?php echo esc_html( strtoupper( $sub['modalidade'] ) ); ?></strong>
                            </td>
                            <td>
                                <strong>Marcas:</strong> <?php echo esc_html( $sub['marcas'] ); ?><br>
                                <small><?php echo esc_html( $sub['descricao'] ); ?></small>
                                <?php if ( ! empty( $sub['fotos_link'] ) ) : ?>
                                    <br><a href="<?php echo esc_url( $sub['fotos_link'] ); ?>" target="_blank" style="color:#C86D51; font-weight:bold; font-size:11px;">Ver Fotos Anexadas &rarr;</a>
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="tm-badge <?php echo $sub['status'] === 'aprovado' || $sub['status'] === 'concluido' ? 'tm-badge-success' : ''; ?>">
                                    <?php echo esc_html( strtoupper( $sub['status'] ) ); ?>
                                </span>
                            </td>
                            <td>
                                <select onchange="updateParceriaStatus(<?php echo esc_attr( $sub['id'] ); ?>, this.value)" style="font-size:11px;">
                                    <option value="pendente" <?php selected( $sub['status'], 'pendente' ); ?>>Pendente</option>
                                    <option value="em_analise" <?php selected( $sub['status'], 'em_analise' ); ?>>Em Análise</option>
                                    <option value="aprovado" <?php selected( $sub['status'], 'aprovado' ); ?>>Aprovado</option>
                                    <option value="concluido" <?php selected( $sub['status'], 'concluido' ); ?>>Concluído</option>
                                    <option value="recusado" <?php selected( $sub['status'], 'recusado' ); ?>>Recusado</option>
                                </select>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>

<script>
function updateParceriaStatus(id, newStatus) {
    jQuery.post(ajaxurl, {
        action: "tm_update_parceria_status",
        nonce: "<?php echo esc_attr( wp_create_nonce( 'tm_admin_nonce' ) ); ?>",
        id: id,
        status: newStatus
    }).done(function(res) {
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.data.message || "Erro ao atualizar status.");
        }
    });
}
</script>
