#!/usr/bin/env node
/**
 * Sitemap Generator for Todday Modas Brechó
 * Gera sitemap.xml e sitemap-index.xml para SEO
 * 
 * Uso: npx tsx scripts/generate-sitemap.ts
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://toddaymodas.com.br';
const OUTPUT_DIR = resolve(__dirname, '../public');

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{ url: string; title: string; caption?: string }>;
}

const STATIC_PAGES: SitemapEntry[] = [
  {
    url: BASE_URL,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/?tab=store`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/?tab=store#sessao-adulto`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/?tab=store#sessao-kids`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/?tab=store#sessao-cristao`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/?tab=store#sessao-calcados`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/todday-cliente/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/todday-painel/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/todday-vendedor/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5,
  },
];

// URLs dinâmicas de produtos - seriam buscadas da API em produção
// Aqui deixamos como exemplo de como seria a estrutura
const generateProductUrls = (): SitemapEntry[] => {
  // Em produção, buscar da API: GET /wp-json/todday/v1/catalog?limit=1000
  // const products = await fetch(`${BASE_URL}/wp-json/todday/v1/catalog?limit=1000`);
  // return products.map(p => ({
  //   url: `${BASE_URL}/?tab=store&product=${p.slug}`,
  //   lastmod: p.modified_date,
  //   changefreq: 'weekly',
  //   priority: 0.7,
  //   images: p.gallery?.map(img => ({ url: img, title: p.name }))
  // }));
  
  // Placeholder para produtos de exemplo
  return [
    {
      url: `${BASE_URL}/?tab=store&product=vestido-midi-plissado-fascinus`,
      lastmod: '2026-09-15',
      changefreq: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/?tab=store&product=saia-gode-evase-alfaiataria`,
      lastmod: '2026-09-10',
      changefreq: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/?tab=store&product=capa-biblia-matelasse-couro`,
      lastmod: '2026-09-05',
      changefreq: 'weekly',
      priority: 0.7,
    },
  ];
};

const generateSitemap = (entries: SitemapEntry[]): string => {
  const urlEntries = entries.map(entry => {
    let xml = `  <url>\n    <loc>${entry.url}</loc>`;
    
    if (entry.lastmod) {
      xml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
    }
    if (entry.changefreq) {
      xml += `\n    <changefreq>${entry.changefreq}</changefreq>`;
    }
    if (entry.priority !== undefined) {
      xml += `\n    <priority>${entry.priority.toFixed(1)}</priority>`;
    }
    if (entry.images && entry.images.length > 0) {
      entry.images.forEach(img => {
        xml += `\n    <image:image>\n      <image:loc>${img.url}</image:loc>`;
        if (img.title) {
          xml += `\n      <image:title>${escapeXml(img.title)}</image:title>`;
        }
        if (img.caption) {
          xml += `\n      <image:caption>${escapeXml(img.caption)}</image:caption>`;
        }
        xml += `\n    </image:image>`;
      });
    }
    xml += `\n  </url>`;
    return xml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlEntries}\n</urlset>`;
};

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
};

const generateRobotsTxt = (): string => {
  return `# Todday Modas Brechó - robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay para não sobrecarregar o servidor
Crawl-delay: 10

# Disallow áreas administrativas
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-content/plugins/
Disallow: /todday-painel/
Disallow: /todday-vendedor/
Disallow: /todday-cliente/
Disallow: /todday-download/
Disallow: /todday-docs/
Disallow: /*?tab=admin
Disallow: /*?tab=vendor
Disallow: /*?tab=customer
Disallow: /*?tab=download
Disallow: /*?tab=docs

# Allow assets
Allow: /wp-content/uploads/
Allow: /wp-content/themes/
Allow: /wp-content/plugins/todday-modas-brecho/assets/
`;
};

const main = () => {
  console.log('🗺️  Gerando sitemap.xml para Todday Modas Brechó...\n');

  // Combinar páginas estáticas + produtos
  const productUrls = generateProductUrls();
  const allEntries = [...STATIC_PAGES, ...productUrls];

  // Gerar sitemap.xml
  const sitemapXml = generateSitemap(allEntries);
  const sitemapPath = resolve(OUTPUT_DIR, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemapXml, 'utf-8');
  console.log(`✅ sitemap.xml gerado: ${sitemapPath}`);
  console.log(`   ${allEntries.length} URLs incluídas`);

  // Gerar robots.txt
  const robotsTxt = generateRobotsTxt();
  const robotsPath = resolve(OUTPUT_DIR, 'robots.txt');
  writeFileSync(robotsPath, robotsTxt, 'utf-8');
  console.log(`✅ robots.txt gerado: ${robotsPath}`);

  // Gerar sitemap-index.xml (para sitemaps grandes)
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
  const sitemapIndexPath = resolve(OUTPUT_DIR, 'sitemap-index.xml');
  writeFileSync(sitemapIndexPath, sitemapIndex, 'utf-8');
  console.log(`✅ sitemap-index.xml gerado: ${sitemapIndexPath}`);

  console.log('\n✨ Sitemap generation completa!');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Total URLs: ${allEntries.length} (${STATIC_PAGES.length} estáticas + ${productUrls.length} produtos)`);
};

main();