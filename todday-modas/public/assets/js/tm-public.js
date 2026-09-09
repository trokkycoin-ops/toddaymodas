/* Público — Todday Modas v1.0.6. Leve, sem dependências. */
(function () {
	'use strict';

	var prm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ============ PWA: registra service worker ============ */
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', function () {
			navigator.serviceWorker.register('/tm-sw.js', { scope: '/' }).catch(function () { /* silencioso */ });
		});
	}

	/* ============ Toast padrão da loja (feedback rápido, sem lib) ============ */
	function toastTM(msg, type) {
		var old = document.querySelector('.tm-toast');
		if (old) { old.remove(); }
		var el = document.createElement('div');
		el.className = 'tm-toast' + (type === 'error' ? ' is-error' : '');
		el.textContent = msg;
		el.setAttribute('role', 'alert');
		document.body.appendChild(el);
		setTimeout(function () {
			el.classList.add('is-out');
			setTimeout(function () { el.remove(); }, 300);
		}, 3800);
	}

	/* ============ Header: efeito "vidro" ao rolar ============ */
	var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)');
	var lastY = 0;
	function onScroll() {
		var y = window.scrollY || 0;
		document.body.classList.toggle('tm-scrolled', y > 12);
		// esconde/mostra header ao rolar pra cima/baixo (comportamento app-like SÓ no mobile)
		var header = document.querySelector('.site-header, header.ast-primary-header-bar, .ast-desktop-header');
		if (header && isMobile.matches) {
			if (y > 180 && y > lastY + 6) { document.body.classList.add('tm-header-hidden'); }
			else if (y < lastY - 6) { document.body.classList.remove('tm-header-hidden'); }
		} else {
			document.body.classList.remove('tm-header-hidden');
		}
		lastY = y;
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	if (isMobile.addEventListener) { isMobile.addEventListener('change', onScroll); }

	document.addEventListener('DOMContentLoaded', function () {

		/* ============ Animações de entrada (IntersectionObserver, stagger) ============ */
		var alvos = document.querySelectorAll(
			'.tm-hero, .tm-secao, .tm-fullbleed, .tm-cat-card, .tm-cupom, ' +
			'.woocommerce ul.products li.product, .tm-card-produto-destaque, .tm-banner-cta, ' +
			'.tm-footer, .tm-contato-canal, .tm-faq details, .tm-newsletter, .tm-doc'
		);
		if (prm || !('IntersectionObserver' in window)) {
			alvos.forEach(function (el) { el.classList.add('tm-in'); });
		} else {
			alvos.forEach(function (el, i) {
				el.classList.add('tm-pre');
				el.style.setProperty('--tm-delay', ((i % 6) * 70) + 'ms');
			});
			var io = new IntersectionObserver(function (entries) {
				entries.forEach(function (en) {
					if (en.isIntersecting) {
						en.target.classList.add('tm-in');
						io.unobserve(en.target);
					}
				});
			}, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
			alvos.forEach(function (el) { io.observe(el); });
		}

		/* ============ Overlay de busca (app bar) ============ */
		var overlay = document.getElementById('tm-busca-overlay');
		var btnOpen = document.getElementById('tm-busca-open');
		var btnClose = document.getElementById('tm-busca-close');
		var campo = document.getElementById('tm-busca-campo');

		function abrirBusca() {
			if (!overlay) { return; }
			overlay.hidden = false;
			document.body.classList.add('tm-busca-aberta');
			requestAnimationFrame(function () {
				overlay.classList.add('is-open');
				if (campo) { campo.focus(); }
			});
		}
		function fecharBusca() {
			if (!overlay) { return; }
			overlay.classList.remove('is-open');
			document.body.classList.remove('tm-busca-aberta');
			setTimeout(function () { overlay.hidden = true; }, 260);
			if (btnOpen) { btnOpen.focus(); }
		}
		if (btnOpen) { btnOpen.addEventListener('click', abrirBusca); }
		if (btnClose) { btnClose.addEventListener('click', fecharBusca); }
		if (overlay) {
			overlay.addEventListener('click', function (e) { if (e.target === overlay) { fecharBusca(); } });
		}
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && overlay && !overlay.hidden) { fecharBusca(); }
		});

		/* ============ Feedback de transição da busca ============ */
		var formBusca = overlay ? overlay.querySelector('.tm-busca-form') : null;
		if (formBusca) {
			formBusca.addEventListener('submit', function (e) {
				if (!campo) { return true; }
				if (!campo.value.trim()) {
					campo.focus();
					campo.classList.add('tm-busca-erro');
					setTimeout(function () { campo.classList.remove('tm-busca-erro'); }, 700);
					e.preventDefault();
					return;
				}
				e.preventDefault();
				overlay.classList.add('is-buscando');
				var btn = formBusca.querySelector('button[type="submit"]');
				if (btn) {
					btn.disabled = true;
					btn.setAttribute('aria-busy', 'true');
					btn.textContent = 'Buscando...';
				}
				var params = new URLSearchParams();
				params.set('s', campo.value.trim());
				params.set('post_type', 'product');
				var url = formBusca.getAttribute('action') + '?' + params.toString();
				setTimeout(function () { window.location.href = url; }, 450);
			});
		}

		/* ============ Header desktop: busca + sacola + conta (injeção no menu Astra) ============ */
		var dados = window.TMDados || null;
		var desktopNav = null;
		var itensInjetados = false;

		function atualizarBadge(qtd) {
			var badges = document.querySelectorAll('.tm-hdr-badge');
			badges.forEach(function (b) {
				b.textContent = String(Math.min(99, qtd));
				b.classList.toggle('is-ativo', qtd > 0);
				b.setAttribute('aria-label', qtd + ' ' + (dados ? dados.rotuloCarrinho : ''));
			});
		}

		function injetarHeaderDesktop() {
			if (itensInjetados || !dados) { return; }
			if (!window.matchMedia || !window.matchMedia('(min-width: 769px)').matches) { return; }
			desktopNav = document.querySelector('#ast-desktop-header .main-header-menu, .ast-desktop-header ul.main-header-menu');
			if (!desktopNav) {
				desktopNav = document.querySelector('.ast-builder-menu-1 ul.main-header-menu');
			}
			if (!desktopNav) { return; }

			var liBusca = document.createElement('li');
			liBusca.className = 'menu-item tm-hdr-item';
			var btnBusca = document.createElement('button');
			btnBusca.type = 'button';
			btnBusca.className = 'tm-hdr-btn';
			btnBusca.setAttribute('aria-label', 'Buscar');
			btnBusca.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.2 15.2 5 5"/></svg>';
			btnBusca.addEventListener('click', abrirBusca);
			liBusca.appendChild(btnBusca);

			var liSacola = document.createElement('li');
			liSacola.className = 'menu-item tm-hdr-item';
			var linkSacola = document.createElement('a');
			linkSacola.className = 'tm-hdr-link';
			linkSacola.href = dados.carrinhoUrl;
			linkSacola.setAttribute('aria-label', dados.rotuloCarrinho);
			linkSacola.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
			var badge = document.createElement('em');
			badge.className = 'tm-hdr-badge';
			badge.setAttribute('aria-hidden', 'true');
			linkSacola.appendChild(badge);
			liSacola.appendChild(linkSacola);

			var liConta = document.createElement('li');
			liConta.className = 'menu-item tm-hdr-item';
			var linkConta = document.createElement('a');
			linkConta.className = 'tm-hdr-link';
			linkConta.href = dados.contaUrl;
			linkConta.setAttribute('aria-label', dados.rotuloConta);
			linkConta.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 21c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5"/></svg>';
			liConta.appendChild(linkConta);

			desktopNav.appendChild(liBusca);
			desktopNav.appendChild(liSacola);
			desktopNav.appendChild(liConta);
			itensInjetados = true;
			atualizarBadge(dados.carrinhoQtd || 0);
		}

		// Re-tenta ao mudar o tamanho da janela (entra na faixa desktop depois).
		if (window.matchMedia) {
			var mqDesktop = window.matchMedia('(min-width: 769px)');
			if (mqDesktop.addEventListener) {
				mqDesktop.addEventListener('change', function (m) { if (m.matches) { injetarHeaderDesktop(); } });
			} else if (mqDesktop.addListener) {
				mqDesktop.addListener(function (m) { if (m.matches) { injetarHeaderDesktop(); } });
			}
		}
		injetarHeaderDesktop();

		// Atualiza os badges (header desktop + app bar) quando um item entra na sacola via AJAX.
		function aoAdicionarCarrinho(fragments) {
			var novo = null;
			if (fragments && fragments['div.widget_shopping_cart_content']) {
				// conta as linhas do mini-cart no fragment (mais confiável que incrementar)
				var holder = document.createElement('div');
				holder.innerHTML = fragments['div.widget_shopping_cart_content'];
				var total = 0;
				holder.querySelectorAll('li.cart_item, li.woocommerce-mini-cart-item').forEach(function (li) {
					var q = li.querySelector('.quantity, .product-quantity');
					var m = q ? q.textContent.match(/(\d+)/) : null;
					total += m ? parseInt(m[1], 10) : 1;
				});
				if (total > 0) { novo = total; }
			}
			if (novo === null) {
				novo = (dados ? dados.carrinhoQtd : 0) + 1;
			}
			if (dados) { dados.carrinhoQtd = novo; }
			atualizarBadge(novo);
			// badge da app bar mobile (cria se ainda não existir no link da sacola)
			document.querySelectorAll('.tm-appbar a[href*="carrinho"], .tm-appbar-item[href*="carrinho"]').forEach(function (link) {
				var badge = link.querySelector('.tm-appbar-badge');
				if (!badge && novo > 0) {
					badge = document.createElement('em');
					badge.className = 'tm-appbar-badge';
					badge.setAttribute('aria-label', novo + ' itens na sacola');
					link.appendChild(badge);
				}
				if (badge) {
					badge.textContent = String(Math.min(99, novo));
					if (novo > 0) { badge.classList.add('is-ativo'); }
				}
			});
		}
		if (dados && window.jQuery) {
			jQuery(document.body).on('added_to_cart', function (e, fragments) { aoAdicionarCarrinho(fragments); });
		} else if (dados) {
			document.body.addEventListener('added_to_cart', function (e, fragments) { aoAdicionarCarrinho(fragments); });
		}

		/* ============ Slider de banners ([tm_banners]) ============ */
		document.querySelectorAll('.tm-banners').forEach(function (secao) {
			var track = secao.querySelector('.tm-banners-track');
			var slides = secao.querySelectorAll('.tm-banner-slide');
			var prev = secao.querySelector('.tm-banners-prev');
			var next = secao.querySelector('.tm-banners-next');
			var dots = secao.querySelectorAll('.tm-banners-dot');
			var atual = 0;
			var total = slides.length;
			var timer = null;
			var autoplay = parseInt(secao.getAttribute('data-autoplay') || '0', 10) * 1000;

			if (!track || total <= 1) { return; }

			function irPara(i) {
				atual = (i + total) % total;
				track.style.transform = 'translateX(-' + (atual * 100) + '%)';
				dots.forEach(function (d, j) {
					var ativo = j === atual;
					d.classList.toggle('is-active', ativo);
					d.setAttribute('aria-selected', ativo ? 'true' : 'false');
				});
			}
			function play() {
				if (autoplay && prm === false) { timer = setInterval(function () { irPara(atual + 1); }, autoplay); }
			}
			function pause() { if (timer) { clearInterval(timer); timer = null; } }

			if (prev) { prev.addEventListener('click', function () { irPara(atual - 1); }); }
			if (next) { next.addEventListener('click', function () { irPara(atual + 1); }); }
			dots.forEach(function (d) {
				d.addEventListener('click', function () { irPara(parseInt(d.getAttribute('data-slide') || '0', 10)); });
			});

			secao.addEventListener('mouseenter', pause);
			secao.addEventListener('mouseleave', play);
			document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });

			// Swipe básico (touch).
			var x0 = null;
			secao.addEventListener('touchstart', function (e) {
				x0 = e.changedTouches[0].clientX;
				pause();
			}, { passive: true });
			secao.addEventListener('touchend', function (e) {
				if (x0 === null) { return; }
				var dx = e.changedTouches[0].clientX - x0;
				if (Math.abs(dx) > 40) { irPara(atual + (dx < 0 ? 1 : -1)); }
				x0 = null;
				play();
			}, { passive: true });

			play();
		});

		/* ============ Lazy load defensivo ============ */
		var imgs = document.querySelectorAll('.woocommerce img:not([loading])');
		imgs.forEach(function (img) {
			img.setAttribute('loading', 'lazy');
			img.setAttribute('decoding', 'async');
		});

		/* ============ Botões "copiar cupom" ============ */
		document.querySelectorAll('.tm-cupom-copiar').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var codigo = btn.getAttribute('data-codigo') || '';
				var label = btn.querySelector('.tm-cupom-copiar-label');
				var original = label ? label.textContent : '';

				function sucesso() {
					btn.classList.add('copiado');
					if (label) { label.textContent = 'Copiado!'; }
					setTimeout(function () {
						btn.classList.remove('copiado');
						if (label) { label.textContent = original; }
					}, 2000);
				}

				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(codigo).then(sucesso).catch(function () {
						fallback(codigo, sucesso);
					});
				} else {
					fallback(codigo, sucesso);
				}
			});
		});

		/* ============ Popup de cupom (1x por sessão, gatilhos contextuais) ============ */
		var popupCupom = document.getElementById('tm-popup-cupom');
		if (popupCupom) {
			var CHAVE = 'tm_cupom_popup_visto_v1';
			var viu = false;
			var popupJaAbriu = false;
			try { viu = window.sessionStorage && sessionStorage.getItem(CHAVE) === '1'; } catch (e) { viu = false; }
			function abrirPopupCupom() {
				if (viu || popupJaAbriu) { return; }
				popupJaAbriu = true;
				popupCupom.hidden = false;
				document.body.classList.add('tm-popup-aberta');
				popupCupom.classList.add('is-open');
				var entrar = popupCupom.querySelector('.tm-popup-copiar');
				if (entrar && !prm) { setTimeout(function () { entrar.focus(); }, 450); }
			}
			function marcarVisto() {
				try { window.sessionStorage.setItem(CHAVE, '1'); } catch (e) {}
				viu = true;
			}
			function fecharPopupCupom() {
				popupCupom.hidden = true;
				popupCupom.classList.remove('is-open');
				document.body.classList.remove('tm-popup-aberta');
				marcarVisto();
			}
			function tentarAbrir(origem) {
				if (viu || popupJaAbriu) { return; }
				abrirPopupCupom();
			}
			popupCupom.querySelectorAll('[data-tm-popup-fechar]').forEach(function (el) {
				el.addEventListener('click', fecharPopupCupom);
			});
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && !popupCupom.hidden) { fecharPopupCupom(); }
			});

			var ehTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
			if (!ehTouch && !prm) {
				// Exit-intent (desktop): mouse sai pelo topo da janela.
				document.addEventListener('mouseleave', function (e) {
					if (e.clientY <= 0) { tentarAbrir('exit'); }
				});
			}
			if (ehTouch) {
				// Mobile/touch: atinge 60% da página.
				var checouScroll = false;
				window.addEventListener('scroll', function () {
					if (checouScroll) { return; }
					var doc = document.documentElement;
					var max = Math.max(1, doc.scrollHeight - window.innerHeight);
					if ((window.scrollY || 0) / max >= 0.6) {
						checouScroll = true;
						tentarAbrir('scroll');
					}
				}, { passive: true });
			}
			// Fallback: passou 30s de permanência sem nenhum gatilho.
			setTimeout(tentarAbrir, prm ? 4000 : 30000);
			// Acesso direto (landing/redirecionado): abre antes após 3s para não perder o visitante.
			if (window.location.referrer && window.location.referrer.indexOf(window.location.origin) === -1) {
				setTimeout(tentarAbrir, 3000);
			}
		}

		function fallback(texto, cb) {
			var ta = document.createElement('textarea');
			ta.value = texto;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			try {
				document.execCommand('copy');
				cb();
			} catch (e) { /* silencioso */ }
			document.body.removeChild(ta);
		}

		/* ============ Banner de consentimento de cookies (LGPD) ============ */
		var consentBanner = document.getElementById('tm-consent-banner');
		if (consentBanner) {
			var CBASE = 'tm_consent';
			var cDecidiu = false;
			try {
				var cCookie = document.cookie.split('; ').filter(function (c) { return c.indexOf(CBASE + '=') === 0; });
				cDecidiu = !!cCookie.length || !!window.localStorage.getItem(CBASE);
			} catch (e) { cDecidiu = false; }

			function gravarConsentimento(acao) {
				acao = acao === 'fechar' ? 'somente_essenciais' : acao;
				var flags = {
					aceita_analise: acao === 'aceitar_todos' ? 1 : 0,
					aceita_publicidade: acao === 'aceitar_todos' ? 1 : 0,
					aceita_personalizacao: acao === 'aceitar_todos' ? 1 : 0
				};
				var dados = TMDados || {};
				
				// Primeiro fecha o banner (UX imediata)
				fecharConsentimento();
				
				// Salva preferência localmente primeiro
				try {
					window.localStorage.setItem(CBASE, acao);
					var exp = new Date();
					exp.setTime(exp.getTime() + 1000 * 60 * 60 * 24 * 30);
					document.cookie = CBASE + '=' + acao + '; expires=' + exp.toUTCString() + '; path=/; SameSite=Lax';
				} catch (e) {
					console.error('Erro ao salvar cookie localmente:', e);
				}
				
				// Depois envia para o servidor (em background)
				if (dados.restUrl) {
					var payload = Object.assign({ acao: acao, versao_politica: '1.0' }, flags);
					
					fetch(dados.restUrl + 'cc/v1/logs', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload),
						credentials: 'same-origin'
					})
					.then(function(response) {
						if (!response.ok) {
							return response.json().then(function(err) {
								throw new Error(err.message || 'Erro ao registrar consentimento');
							});
						}
						return response.json();
					})
					.then(function(result) {
						console.log('Consentimento registrado:', result);
					})
					.catch(function(error) {
						console.error('Erro ao gravar consentimento:', error);
						// Tenta novamente após 5 segundos
						setTimeout(function() {
							fetch(dados.restUrl + 'cc/v1/logs', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(payload),
								credentials: 'same-origin'
							}).catch(function() {
								console.error('Falha na segunda tentativa de gravar consentimento');
							});
						}, 5000);
					});
				} else {
					console.warn('TMDados.restUrl não está definido - consentimento não será enviado ao servidor');
				}
			}

			function fecharConsentimento() {
				consentBanner.classList.remove('is-open');
				document.body.classList.remove('tm-consent-aberta');
				setTimeout(function () { consentBanner.hidden = true; }, 320);
			}

			consentBanner.querySelectorAll('[data-tm-consent]').forEach(function (btn) {
				btn.addEventListener('click', function () {
					gravarConsentimento(btn.getAttribute('data-tm-consent'));
				});
			});

			if (!cDecidiu) {
				var atraso = prm ? 400 : 1400;
				setTimeout(function () {
					var pop = document.getElementById('tm-popup-cupom');
					if (pop && !pop.hidden) {
						return; // não disputa atenção com o popup de cupom
					}
					consentBanner.hidden = false;
					document.body.classList.add('tm-consent-aberta');
					requestAnimationFrame(function () {
						consentBanner.classList.add('is-open');
					});
				}, atraso);
			}
		}

		/* ============ Swatches de cor/tamanho ============ */
		var swatchGrupos = document.querySelectorAll('.tm-swatches');
		if (swatchGrupos.length) {
			swatchGrupos.forEach(function (grupo) {
				var destino = document.querySelector('select[name="' + grupo.getAttribute('data-destino') + '"]');
				if (!destino) { return; }

				function marcar(novoValor) {
					grupo.querySelectorAll('.tm-swatch').forEach(function (b) {
						var ativo = String(b.getAttribute('data-tm-valor')) === String(novoValor);
						b.classList.toggle('is-selecionado', ativo);
						b.setAttribute('aria-checked', ativo ? 'true' : 'false');
					});
				}

				grupo.querySelectorAll('.tm-swatch').forEach(function (botao) {
					botao.addEventListener('click', function () {
						if (botao.disabled) { return; }
						destino.value = botao.getAttribute('data-tm-valor');
						destino.dispatchEvent(new Event('change', { bubbles: true }));
						marcar(destino.value);
					});
				});

				destino.addEventListener('change', function () { marcar(destino.value); });
				marcar(destino.value);
			});

			/* Sincroniza desabilitados com o form de variacao (esgotadas por combinacao). */
			document.querySelectorAll('.variations_form').forEach(function (form) {
				form.addEventListener('woocommerce_variation_has_changed', function () {
					form.querySelectorAll('.tm-swatches').forEach(function (grupo) {
						var destino = document.querySelector('select[name="' + grupo.getAttribute('data-destino') + '"]');
						if (!destino) { return; }
						grupo.querySelectorAll('.tm-swatch').forEach(function (b) {
							var opt = destino.querySelector('option[value="' + b.getAttribute('data-tm-valor') + '"]');
							var desabilitado = !!opt && (opt.disabled || opt.getAttribute('aria-disabled') === 'true');
							b.disabled = desabilitado;
							b.classList.toggle('is-esgotado', desabilitado);
						});
					});
				});
			});
		}

		/* ============ Modal "Qual é o meu tamanho?" ============ */
		var modalMedidas = document.getElementById('tm-modal-medidas');
		if (modalMedidas) {
			function abrirMedidas() {
				modalMedidas.hidden = false;
				document.body.classList.add('tm-modal-aberta');
				modalMedidas.classList.add('is-open');
			}
			function fecharMedidas() {
				modalMedidas.classList.remove('is-open');
				document.body.classList.remove('tm-modal-aberta');
				setTimeout(function () { modalMedidas.hidden = true; }, 260);
			}
			document.querySelectorAll('[data-tm-abre-medidas]').forEach(function (btn) {
				btn.addEventListener('click', abrirMedidas);
			});
			modalMedidas.querySelectorAll('[data-tm-fecha-medidas]').forEach(function (el) {
				el.addEventListener('click', fecharMedidas);
			});
			modalMedidas.addEventListener('click', function (e) {
				if (e.target === modalMedidas) { fecharMedidas(); }
			});
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && !modalMedidas.hidden) { fecharMedidas(); }
			});
		}
	/* ============ Order bump no checkout (Todday Ofertas) ============ */
		var bumpBox = document.querySelector('[data-tm-bump]');
		if (bumpBox && window.TM_OfertasCfg) {
			var bumpCheck = bumpBox.querySelector('input[type=checkbox]');
			var bumpBusy = false;
			bumpCheck.addEventListener('change', function () {
				if (bumpBusy) { return; }
				var on = this.checked;
				var body = new URLSearchParams();
				body.set('action', 'tm_bump_toggle');
				body.set('nonce', TM_OfertasCfg.nonce);
				body.set('product_id', bumpBox.dataset.product);
				body.set('on', on ? '1' : '0');
				bumpBusy = true;
				bumpBox.classList.add('is-busy');
				fetch(TM_OfertasCfg.ajax, {
					method: 'POST',
					credentials: 'same-origin',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
					body: body.toString()
				}).then(function (r) { return r.json(); }).then(function (j) {
					bumpBusy = false;
					bumpBox.classList.remove('is-busy');
					if (j && j.success) {
						// Força o WooCommerce a recalcular os totais do checkout.
						if (window.jQuery && jQuery.fn.update_checkout) {
							jQuery(document.body).trigger('update_checkout');
						} else {
							window.location.reload();
						}
					} else {
						bumpCheck.checked = !on;
						toastTM((j && j.data && j.data.message) || TM_OfertasCfg.errorGeneric, 'error');
					}
				}).catch(function () {
					bumpBusy = false;
					bumpBox.classList.remove('is-busy');
					bumpCheck.checked = !on;
					toastTM(TM_OfertasCfg.errorGeneric, 'error');
				});
			});
		}

		/* ============ Upsell pós-compra (Todday Ofertas) ============ */
		var upsellBox = document.querySelector('[data-tm-upsell]');
		if (upsellBox && window.TM_OfertasCfg) {
			var upsellBtn = upsellBox.querySelector('.tm-upsell-btn');
			upsellBtn.addEventListener('click', function () {
				if (upsellBtn.disabled) { return; }
				var original = upsellBtn.textContent;
				upsellBtn.disabled = true;
				upsellBtn.textContent = 'Criando seu pedido...';
				var body = new URLSearchParams();
				body.set('action', 'tm_upsell_order');
				body.set('nonce', TM_OfertasCfg.nonce);
				body.set('product_id', upsellBox.dataset.product);
				body.set('order_id', upsellBox.dataset.order);
				fetch(TM_OfertasCfg.ajax, {
					method: 'POST',
					credentials: 'same-origin',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
					body: body.toString()
				}).then(function (r) { return r.json(); }).then(function (j) {
					if (j && j.success && j.data && j.data.pay_url) {
						window.location.href = j.data.pay_url;
					} else {
						upsellBtn.disabled = false;
						upsellBtn.textContent = original;
						toastTM((j && j.data && j.data.message) || TM_OfertasCfg.errorGeneric, 'error');
					}
				}).catch(function () {
					upsellBtn.disabled = false;
					upsellBtn.textContent = original;
					toastTM(TM_OfertasCfg.errorGeneric, 'error');
				});
			});
		}
	});
})();
