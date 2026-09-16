import React, { useState } from 'react';
import { Download, CheckCircle2, ShieldCheck, FolderTree, FileCode, Terminal, AlertCircle, Copy, Check } from 'lucide-react';
import JSZip from 'jszip';
import { getConfig } from '../lib/api';

function resolveZipUrl(): string {
  const cfg = getConfig();
  if (typeof window !== 'undefined' && (window as any).tdmConfig) {
    return cfg.homeUrl.replace(/\/?$/, '/') + 'todday-download/?file=1';
  }
  return '/downloads/todday-modas-brecho.zip';
}

export const PluginDownloader: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [checksum, setChecksum] = useState('');
  const [sizeLabel, setSizeLabel] = useState('pacote .zip');
  const zipUrl = resolveZipUrl();

  React.useEffect(() => {
    let active = true;
    fetch(zipUrl, { method: 'HEAD', credentials: 'same-origin' })
      .then((r) => {
        const len = Number(r.headers.get('content-length') || 0);
        if (active && len > 0) {
          setSizeLabel(`${Math.round(len / 1024)} KB`);
        }
      })
      .catch(() => {
        /* mantém o rótulo padrão */
      });
    return () => {
      active = false;
    };
  }, [zipUrl]);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      // Tenta baixar o arquivo gerado diretamente
      const res = await fetch(zipUrl, { credentials: 'same-origin' });
      if (res.ok) {
        const blob = await res.blob();

        // Calcula o SHA-256 real do pacote baixado (quando o navegador permitir)
        try {
          if ((window as any).crypto?.subtle) {
            const buf = await blob.arrayBuffer();
            const digest = await (window as any).crypto.subtle.digest('SHA-256', buf);
            const hex = Array.from(new Uint8Array(digest))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('');
            setChecksum(hex);
          }
        } catch {
          /* verificação opcional */
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todday-modas-brecho.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: Redireciona para o link relativo
        window.location.href = zipUrl;
      }
    } catch {
      window.location.href = zipUrl;
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  const handleCopyChecksum = () => {
    if (!checksum) return;
    navigator.clipboard.writeText(checksum);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Topo do Módulo de Download */}
      <div className="bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#3B0764] text-white p-8 sm:p-10 rounded-3xl shadow-xl mb-10 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[#DDD6FE] text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Pacote de Produção Oficial
          </span>
          <h1 className="text-3xl font-black mb-3">
            Download do Plugin Todday Modas Brechó
          </h1>
          <p className="text-purple-100 text-sm sm:text-base mb-6 leading-relaxed">
            Arquivo <code className="bg-black/30 px-2 py-0.5 rounded font-mono text-[#DDD6FE]">todday-modas-brecho.zip</code> pronto para instalação direta via painel administrativo do WordPress (Plugins &gt; Adicionar Novo &gt; Enviar Plugin) ou deploy em servidores de produção.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#7C3AED] hover:bg-purple-50 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              id="tdm-download-plugin-zip-btn"
            >
              <Download className="w-4 h-4 text-[#7C3AED]" />
              <span>{downloading ? 'Preparando Pacote...' : `Baixar todday-modas-brecho.zip (${sizeLabel})`}</span>
            </button>

            <button
              onClick={handleCopyChecksum}
              className="flex items-center gap-2 px-4 py-3 bg-black/30 hover:bg-black/40 text-slate-300 rounded-2xl font-mono text-xs border border-white/20 transition-colors"
              title="Copiar SHA-256"
            >
              {copiedChecksum ? <Check className="w-3.5 h-3.5 text-purple-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{checksum ? `SHA-256: ${checksum.slice(0, 12)}...` : 'Verificação SHA-256'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Informações de Conformidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="p-2.5 w-fit rounded-xl bg-purple-50 text-[#7C3AED] mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mb-1">Compatível com WooCommerce HPOS</h3>
          <p className="text-xs text-slate-500">
            Declara explicitamente <code className="font-mono bg-slate-100 px-1">FeaturesUtil::declare_compatibility</code> para High-Performance Order Storage sem avisos de incompatibilidade.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="p-2.5 w-fit rounded-xl bg-purple-50 text-[#7C3AED] mb-3">
            <FileCode className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mb-1">Zero Dependências Runtime</h3>
          <p className="text-xs text-slate-500">
            Autoloader PSR-4 interno, gerador nativo de PDF 1.4 server-side e Chart.js minificado embutido sem dependência de Composer ou CDNs bloqueáveis.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="p-2.5 w-fit rounded-xl bg-purple-50 text-[#7C3AED] mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mb-1">Segurança e Criptografia</h3>
          <p className="text-xs text-slate-500">
            Tokens do Mercado Pago e Melhor Envio criptografados via AES-256-CBC, nonces em todos os formulários e permissões REST rigorosas.
          </p>
        </div>
      </div>

      {/* Instruções de Instalação e Estrutura de Arquivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Passo a Passo */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-purple-100 shadow-2xs">
          <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#7C3AED]" />
            Como Instalar no seu WordPress
          </h3>
          <ol className="space-y-4 text-xs text-slate-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold shrink-0">1</span>
              <div>
                <strong className="text-slate-900">Baixe o arquivo ZIP</strong> clicando no botão de download acima.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold shrink-0">2</span>
              <div>
                <strong className="text-slate-900">No painel WordPress</strong>, navegue até <em>Plugins &gt; Adicionar Novo &gt; Enviar Plugin</em>.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold shrink-0">3</span>
              <div>
                <strong className="text-slate-900">Envie o todday-modas-brecho.zip</strong> e clique em <em>Ativar Plugin</em>.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold shrink-0">4</span>
              <div>
                <strong className="text-slate-900">Acesse o Painel de Gestão</strong> na URL <code className="text-[#7C3AED] font-mono">https://seusite.com.br/todday-painel/</code>.
              </div>
            </li>
          </ol>
        </div>

        {/* Árvore de Diretórios Incluída no ZIP */}
        <div className="bg-slate-900 text-slate-200 p-6 sm:p-8 rounded-2xl font-mono text-xs shadow-xl overflow-x-auto">
          <div className="flex items-center gap-2 text-[#C4B5FD] font-bold mb-3">
            <FolderTree className="w-4 h-4" />
            <span>Estrutura do Pacote todday-modas-brecho.zip</span>
          </div>
          <pre className="text-[11px] leading-relaxed text-slate-300">
{`todday-modas-brecho/
├── todday-modas-brecho.php   # Header padrão, autoloader e lifecycle
├── readme.txt                # Documentação padrão do repositório WP
├── includes/
│   ├── Core/                 # Plugin, Bootstrap, Activator, Deactivator
│   ├── Database/             # Schema, Migrations, ActivityLogRepository
│   ├── Security/             # CapabilityMatrix, Security (AES-256)
│   ├── Services/             # PedidosService (HPOS), PdfService, etc.
│   ├── Integrations/         # MercadoPago, MelhorEnvio, ViaCep, WhatsApp
│   ├── Api/                  # RestController e 12 endpoints todday/v1
│   ├── Elementor/            # Init + 4 Widgets drag-and-drop
│   └── Frontend/             # Shortcodes, Vitrine, Pwa
├── templates/                # vitrine, cart, checkout, admin-panel
├── public/pwa/               # manifest.json, sw.js
├── assets/                   # CSS e JS compilados + Chart.js local
└── docs/                     # 8 manuais em Markdown + manifest.json`}
          </pre>
        </div>
      </div>
    </div>
  );
};
