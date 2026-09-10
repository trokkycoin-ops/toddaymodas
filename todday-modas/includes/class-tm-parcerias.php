<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Parcerias {
    public static function init() {
        add_shortcode( 'todday_quero_vender', array( __CLASS__, 'render_form_shortcode' ) );
        add_shortcode( 'todday_parcerias', array( __CLASS__, 'render_form_shortcode' ) );
        add_action( 'wp_ajax_tm_submit_parceria', array( __CLASS__, 'ajax_submit' ) );
        add_action( 'wp_ajax_nopriv_tm_submit_parceria', array( __CLASS__, 'ajax_submit' ) );
        add_action( 'wp_ajax_tm_update_parceria_status', array( __CLASS__, 'ajax_update_status' ) );
    }

    public static function get_submissions( $status = '' ) {
        global $wpdb;
        $table = $wpdb->prefix . 'tm_parcerias';
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table}'" ) !== $table ) {
            return array();
        }

        if ( ! empty( $status ) && $status !== 'todos' ) {
            return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE status = %s ORDER BY id DESC", $status ), ARRAY_A );
        }
        return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC", ARRAY_A );
    }

    public static function ajax_submit() {
        check_ajax_referer( 'tm_public_nonce', 'nonce' );

        $nome = isset( $_POST['nome'] ) ? sanitize_text_field( wp_unslash( $_POST['nome'] ) ) : '';
        $telefone = isset( $_POST['telefone'] ) ? sanitize_text_field( wp_unslash( $_POST['telefone'] ) ) : '';
        $email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
        $cidade = isset( $_POST['cidade'] ) ? sanitize_text_field( wp_unslash( $_POST['cidade'] ) ) : '';
        $estado = isset( $_POST['estado'] ) ? sanitize_text_field( wp_unslash( $_POST['estado'] ) ) : 'SP';
        $categoria = isset( $_POST['categoria'] ) ? sanitize_text_field( wp_unslash( $_POST['categoria'] ) ) : 'adulto';
        $quantidade = isset( $_POST['quantidade'] ) ? sanitize_text_field( wp_unslash( $_POST['quantidade'] ) ) : '6-15';
        $condicao = isset( $_POST['condicao'] ) ? sanitize_text_field( wp_unslash( $_POST['condicao'] ) ) : 'seminovo_impecavel';
        $modalidade = isset( $_POST['modalidade'] ) ? sanitize_text_field( wp_unslash( $_POST['modalidade'] ) ) : 'consignacao';
        $marcas = isset( $_POST['marcas'] ) ? sanitize_text_field( wp_unslash( $_POST['marcas'] ) ) : '';
        $descricao = isset( $_POST['descricao'] ) ? sanitize_textarea_field( wp_unslash( $_POST['descricao'] ) ) : '';
        $fotos_link = isset( $_POST['fotos_link'] ) ? esc_url_raw( wp_unslash( $_POST['fotos_link'] ) ) : '';

        if ( empty( $nome ) || empty( $telefone ) || empty( $descricao ) ) {
            wp_send_json_error( array( 'message' => __( 'Por favor preencha nome, telefone e descrição das peças.', 'todday-modas' ) ) );
        }

        global $wpdb;
        $table = $wpdb->prefix . 'tm_parcerias';
        $inserted = $wpdb->insert(
            $table,
            array(
                'nome'        => $nome,
                'telefone'    => $telefone,
                'email'       => $email,
                'cidade'      => $cidade,
                'estado'      => $estado,
                'categoria'   => $categoria,
                'quantidade'  => $quantidade,
                'condicao'    => $condicao,
                'modalidade'  => $modalidade,
                'marcas'      => $marcas,
                'descricao'   => $descricao,
                'fotos_link'  => $fotos_link,
                'status'      => 'pendente',
                'created_at'  => current_time( 'mysql' ),
            ),
            array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
        );

        if ( false === $inserted ) {
            wp_send_json_error( array( 'message' => __( 'Erro ao gravar no banco de dados.', 'todday-modas' ) ) );
        }

        wp_send_json_success( array(
            'message' => __( 'Cadastro de parceria recebido com sucesso! Nossa curadoria entrará em contato via WhatsApp.', 'todday-modas' ),
            'id'      => $wpdb->insert_id,
        ) );
    }

    public static function ajax_update_status() {
        check_ajax_referer( 'tm_admin_nonce', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( array( 'message' => __( 'Sem permissão.', 'todday-modas' ) ) );
        }

        $id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
        $status = isset( $_POST['status'] ) ? sanitize_text_field( wp_unslash( $_POST['status'] ) ) : '';
        $notas = isset( $_POST['notas'] ) ? sanitize_textarea_field( wp_unslash( $_POST['notas'] ) ) : '';

        if ( ! $id || empty( $status ) ) {
            wp_send_json_error( array( 'message' => __( 'Parâmetros inválidos.', 'todday-modas' ) ) );
        }

        global $wpdb;
        $table = $wpdb->prefix . 'tm_parcerias';
        $wpdb->update(
            $table,
            array( 'status' => $status, 'notas' => $notas ),
            array( 'id' => $id ),
            array( '%s', '%s' ),
            array( '%d' )
        );

        wp_send_json_success( array( 'message' => __( 'Status atualizado com sucesso!', 'todday-modas' ) ) );
    }

    public static function render_form_shortcode() {
        ob_start();
        ?>
        <div class="tm-quero-vender-wrapper" style="max-width:760px; margin:30px auto; background:#FDFBF9; border:1px solid #EDE8E1; border-radius:16px; padding:28px; box-shadow:0 4px 20px rgba(0,0,0,0.04); font-family:inherit;">
            <div style="text-align:center; margin-bottom:24px;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; color:#C86D51;">Brechó Todday Modas • Desapego Consciente</span>
                <h2 style="font-size:26px; font-weight:bold; color:#1A1918; margin:6px 0;">Quero Vender / Ser Parceiro</h2>
                <p style="font-size:13px; color:#666; max-width:540px; margin:0 auto;">Venda suas peças paradas ou deixe em consignação com repasse garantido. Avaliamos roupas femininas adultas, moda infantil kids, sapatos e itens religiosos.</p>
            </div>

            <form id="tm-form-quero-vender" style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Seu Nome *</label>
                        <input type="text" name="nome" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">WhatsApp com DDD *</label>
                        <input type="text" name="telefone" required placeholder="(11) 98765-4321" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">E-mail</label>
                        <input type="email" name="email" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Cidade / UF</label>
                        <input type="text" name="cidade" placeholder="Ex: São Paulo - SP" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                    <div>
                        <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Categoria</label>
                        <select name="categoria" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px; background:#fff;">
                            <option value="adulto">Moda Feminina Adulto</option>
                            <option value="kids">Moda Kids & Infantil</option>
                            <option value="religioso">Acessórios Religiosos & Bíblias</option>
                            <option value="calcados_bolsas">Calçados & Bolsas</option>
                            <option value="misto">Lote Misto</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Quantidade</label>
                        <select name="quantidade" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px; background:#fff;">
                            <option value="1-5">1 a 5 peças</option>
                            <option value="6-15" selected>6 a 15 peças</option>
                            <option value="15+">15+ peças (Lote)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Retorno Desejado</label>
                        <select name="modalidade" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px; background:#fff;">
                            <option value="consignacao">Consignação (Até 70%)</option>
                            <option value="venda_direta">Venda Direta (PIX)</option>
                            <option value="credito_loja">Crédito com Bônus 20%</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Marcas Principais das Peças</label>
                    <input type="text" name="marcas" placeholder="Ex: Farm, Zara, Animale, Bíblias Thompson..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px;">
                </div>

                <div>
                    <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Descrição das Peças *</label>
                    <textarea name="descricao" required rows="3" placeholder="Descreva os tipos de peças, tamanhos e estado de conservação..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px;"></textarea>
                </div>

                <div>
                    <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">Link de Fotos (Opcional - Google Drive / Fotos)</label>
                    <input type="url" name="fotos_link" placeholder="https://drive.google.com/..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px;">
                </div>

                <input type="hidden" name="action" value="tm_submit_parceria">
                <input type="hidden" name="nonce" value="<?php echo esc_attr( wp_create_nonce( 'tm_public_nonce' ) ); ?>">

                <button type="submit" style="background:#1A1918; color:#fff; padding:14px; border:none; border-radius:10px; font-weight:bold; font-size:14px; cursor:pointer; margin-top:8px;">
                    Enviar Cadastro para Avaliação da Curadoria
                </button>
            </form>
            <div id="tm-parceria-result" style="display:none; margin-top:16px; padding:14px; border-radius:8px; font-size:13px; text-align:center;"></div>
        </div>

        <script>
        document.getElementById("tm-form-quero-vender")?.addEventListener("submit", function(e) {
            e.preventDefault();
            var form = this;
            var formData = new FormData(form);
            var resBox = document.getElementById("tm-parceria-result");

            fetch("<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>", {
                method: "POST",
                body: formData
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                resBox.style.display = "block";
                if (data.success) {
                    resBox.style.background = "#EBF8F2";
                    resBox.style.color = "#155724";
                    resBox.style.border = "1px solid #C3E6CB";
                    resBox.innerHTML = "<strong>Sucesso!</strong> " + (data.data.message || "Cadastro enviado!");
                    form.reset();
                } else {
                    resBox.style.background = "#FDF0EE";
                    resBox.style.color = "#721C24";
                    resBox.style.border = "1px solid #F5C6CB";
                    resBox.innerHTML = "<strong>Atenção:</strong> " + (data.data.message || "Erro ao enviar.");
                }
            })
            .catch(function() {
                resBox.style.display = "block";
                resBox.style.background = "#FDF0EE";
                resBox.style.color = "#721C24";
                resBox.innerHTML = "Erro ao conectar com o servidor.";
            });
        });
        </script>
        <?php
        return ob_get_clean();
    }
}
