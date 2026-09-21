import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock';
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Todday Modas Brechó — Moda Modesta Premium, Vestidos Mídi, Infantil e Artigos de Fé',
  description = 'Loja virtual especializada em moda modesta feminina, vestidos mídi, moda infantil e artigos de fé. Peças únicas com medidas reais na fita métrica, curadoria artesanal e entrega para todo o Brasil.',
  image = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85',
  url = 'https://toddaymodas.com.br',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Todday Modas Brechó',
  section = 'Moda',
  tags = ['moda modesta', 'vestidos mídi', 'brechó premium', 'moda infantil', 'artigos de fé', 'curadoria artesanal'],
  price,
  currency = 'BRL',
  availability = 'in_stock',
}) => {
  const ogImage = image.startsWith('http') ? image : `${url}${image}`;
  const ogUrl = url.startsWith('http') ? url : `https://toddaymodas.com.br${url}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebSite',
    name: 'Todday Modas Brechó',
    url: 'https://toddaymodas.com.br',
    description,
    image: ogImage,
    publisher: {
      '@type': 'Organization',
      name: 'Todday Modas Brechó',
      logo: {
        '@type': 'ImageObject',
        url: 'https://toddaymodas.com.br/logo.png',
      },
    },
    ...(type === 'article' && {
      headline: title,
      datePublished: publishedTime,
      dateModified: modifiedTime,
      author: {
        '@type': 'Person',
        name: author,
      },
      articleSection: section,
      keywords: tags.join(', '),
    }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`,
        seller: {
          '@type': 'Organization',
          name: 'Todday Modas Brechó',
        },
      },
    }),
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#271E2D" />
      <meta name="author" content={author} />
      <meta name="keywords" content={tags.join(', ')} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Todday Modas Brechó" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@toddaymodas" />
      <meta name="twitter:creator" content="@toddaymodas" />
      <meta name="twitter:url" content={ogUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Canonical */}
      <link rel="canonical" href={ogUrl} />

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//api.mercadopago.com" />
      <link rel="dns-prefetch" href="//melhorenvio.com.br" />
      <link rel="dns-prefetch" href="//viacep.com.br" />
    </>
  );
};

export const ProductSEO: React.FC<{
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    regular_price?: number;
    brand: string;
    category: string;
    condition: string;
    size: string;
    sku?: string;
    availability: 'in_stock' | 'out_of_stock';
  };
  url: string;
}> = ({ product, url }) => (
  <SEO
    title={`${product.name} — Todday Modas Brechó`}
    description={product.description.slice(0, 160)}
    image={product.image}
    url={url}
    type="article"
    author="Todday Modas Brechó"
    section="Produto"
    tags={[product.category, product.condition, product.brand, 'moda modesta', 'brechó premium']}
    price={product.price}
    availability={product.availability}
  />
);

export const CategorySEO: React.FC<{
  category: string;
  description: string;
  image?: string;
  url: string;
}> = ({ category, description, image, url }) => (
  <SEO
    title={`${category} — Todday Modas Brechó`}
    description={description}
    image={image}
    url={url}
    type="website"
    section={category}
    tags={[category.toLowerCase(), 'moda modesta', 'brechó premium', 'curadoria']}
  />
);