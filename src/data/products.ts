import { Product } from '../types';

export const CATEGORIES = [
  'Todos os Itens',
  'Moda Feminina (Adulto)',
  'Moda Masculina (Adulto)',
  'Moda Infantil',
  'Calçados',
  'Acessórios Cristãos',
];

export const CONDITIONS = [
  { id: 'all', label: 'Todos os Estados' },
  { id: 'Novo com Etiqueta', label: 'Novo com Etiqueta' },
  { id: 'Seminovo Impecável', label: 'Seminovo Impecável' },
  { id: 'Peça Única Selecionada', label: 'Peça Única Selecionada' },
  { id: 'Vintage Especial', label: 'Vintage Especial' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": 100,
    "name": "Vestido Maxi Luciana Pais Azul Estampa Exclusiva Peça #94524",
    "slug": "vestido-maxi-luciana-pais-azul-estampa-exclusiva-94524",
    "price": 382.31,
    "regular_price": 499.8,
    "category": "Moda Feminina (Adulto)",
    "condition": "Seminovo Impecável",
    "size": "P (38)",
    "available_sizes": [
      "PP (36)",
      "P (38)",
      "M (40)",
      "G (42)",
      "GG (44)",
      "XG (46)"
    ],
    "color": "Azul Estampa Exclusiva",
    "available_colors": [
      {
        "name": "Azul Floral Exclusivo",
        "hex": "#2B5B84",
        "in_stock": true
      },
      {
        "name": "Lavanda Suave",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Off-White Botânico",
        "hex": "#F7F4EF",
        "in_stock": true
      }
    ],
    "brand": "Luciana Pais Alta Moda Evangélica",
    "fabric": "100% Viscose Nobre Toque de Seda com Forro Antialérgico",
    "care_instructions": "Lavagem delicada à mão. Passar a ferro brando do lado avesso. Secar à sombra.",
    "description": "Vestido longo maxi de alta costura assinado pela prestigiada grife Luciana Pais (Peça #94524). Modelagem evasê fluida com caimento modesto impecável, estampa floral botânica exclusiva sobre fundo azul imperial, decote em V sutil com fechamento recatado e mangas com elástico delicado. Acompanha cinto forrado no mesmo tecido nobre da peça para ajuste elegante na cintura.",
    "measurements": {
      "bust": "98 cm",
      "waist": "78-86 cm (elástico)",
      "length": "138 cm",
      "shoulder": "39 cm"
    },
    "detailed_measurements": {
      "bust": "98 cm",
      "waist": "80 cm",
      "hips": "118 cm",
      "length": "138 cm",
      "shoulder": "39 cm",
      "sleeve": "42 cm"
    },
    "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80"
    ],
    "rating": 5,
    "review_count": 38,
    "stock": 1,
    "is_featured": true,
    "eco_score": "A+ Circular"
  },
  {
    "id": 101,
    "name": "Vestido Midi Plissado Floral Lavanda de Alta Alfaiataria",
    "slug": "vestido-midi-plissado-floral-lavanda",
    "price": 145,
    "regular_price": 340,
    "category": "Moda Feminina (Adulto)",
    "condition": "Seminovo Impecável",
    "size": "M (40)",
    "available_sizes": [
      "PP (36)",
      "P (38)",
      "M (40)",
      "G (42)",
      "GG (44)"
    ],
    "color": "Lavanda Suave com Floral Botânico",
    "available_colors": [
      {
        "name": "Lavanda Suave",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Verde Esmeralda Botânico",
        "hex": "#0F4C3A",
        "in_stock": true
      },
      {
        "name": "Pérola Off-White",
        "hex": "#F7F4EF",
        "in_stock": true
      }
    ],
    "brand": "Fascínius Haute Couture Modesta",
    "fabric": "Crepe Georgette Acetinado com Forro Antialérgico",
    "care_instructions": "Higienização profissional especializada e delicada. Lavagem a seco ou manual suave.",
    "description": "Vestido mídi de grife modesta com drapeado plissado fluido, mangas 3/4 com punho francês e cinto estruturado forrado no mesmo nobre tecido. Decote discreto e forro duplo 100% confortável, perfeito para celebrações solenes e cultos.",
    "measurements": {
      "bust": "96 cm",
      "waist": "76-84 cm (elástico)",
      "length": "118 cm",
      "shoulder": "39 cm"
    },
    "detailed_measurements": {
      "bust": "96 cm",
      "waist": "78 cm",
      "hips": "112 cm",
      "length": "118 cm",
      "shoulder": "39 cm",
      "sleeve": "44 cm"
    },
    "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"
    ],
    "rating": 5,
    "review_count": 28,
    "stock": 1,
    "is_featured": true,
    "eco_score": "A+ Circular"
  },
  {
    "id": 102,
    "name": "Capa Acolchoada para Bíblia com Zíper Reforçado & Couro Lilás & Verde",
    "slug": "capa-acolchoada-biblia-couro-lilas",
    "price": 69.9,
    "regular_price": 145,
    "category": "Acessórios Cristãos",
    "condition": "Novo com Etiqueta",
    "size": "Tamanho Médio (Bíblia de Estudo / Letra Grande)",
    "available_sizes": [
      "Padrão Médio (25x18x5cm)",
      "Grande / Thompson (27x20x6cm)"
    ],
    "color": "Lilás Orquídea Clássico",
    "available_colors": [
      {
        "name": "Lilás Orquídea",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Verde Floresta & Ouro",
        "hex": "#165B4C",
        "in_stock": true
      },
      {
        "name": "Preto Nobre Imperial",
        "hex": "#1A1A1A",
        "in_stock": true
      }
    ],
    "brand": "Ateliê Graça & Fé Artesanal",
    "fabric": "Couro Ecológico Premium Lavável com Espuma Densidade 28",
    "care_instructions": "Limpar com pano levemente úmido. Fechos banhados a ouro antioxidante.",
    "description": "Capa protetora estruturada feita à mão com revestimento nobre lavável. Fechamento seguro com zíper reforçado, puxador em metal dourado com crucifixo entalhado, alça ergonômica de mão e divisória interna para marcadores de texto e canetas.",
    "measurements": {
      "length": "25 cm x 18 cm x 5 cm"
    },
    "detailed_measurements": {
      "length": "25 cm",
      "waist": "18 cm (largura)",
      "hips": "5 cm (lombada)"
    },
    "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "rating": 5,
    "review_count": 42,
    "stock": 2,
    "is_featured": true,
    "eco_score": "Artesanato Local"
  },
  {
    "id": 103,
    "name": "Colar Crucifixo Cravejado com Microzircônias Dourado (Semijoia 18k)",
    "slug": "colar-pingente-cruz-cravejada-ouro-18k",
    "price": 89,
    "regular_price": 210,
    "category": "Acessórios Cristãos",
    "condition": "Novo com Etiqueta",
    "size": "Corrente Veneziana 45 cm + 5 cm extensor",
    "available_sizes": [
      "45 cm + 5 cm Extensor",
      "55 cm Solene"
    ],
    "color": "Dourado 18k com Cristal",
    "available_colors": [
      {
        "name": "Dourado 18k Cristal",
        "hex": "#D4AF37",
        "in_stock": true
      },
      {
        "name": "Ouro Branco & Lilás",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Esmeralda Colonial",
        "hex": "#0F4C3A",
        "in_stock": true
      }
    ],
    "brand": "Joias de Sião Alta Joalheria",
    "fabric": "Banho de Ouro 18k 10 Milésimos com Verniz Alemão Hipoalergênico",
    "care_instructions": "Acompanha flanela de polimento e saquinho de veludo aveludado.",
    "description": "Semijoia nobre de altíssima durabilidade e brilho reverente. Cruz clássica desenhada com proporções áureas, cravejada com zircônias lapidação brilhante. Fecho italiano de precisão.",
    "measurements": {
      "length": "Pingente: 2,5 cm x 1,8 cm | Corrente 45cm"
    },
    "detailed_measurements": {
      "length": "45 cm (+5 cm)",
      "shoulder": "Pingente 2,5 cm"
    },
    "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "review_count": 36,
    "stock": 1,
    "is_featured": false,
    "eco_score": "Durabilidade Eterna"
  },
  {
    "id": 104,
    "name": "Vestido Infantil Princesa Jardim Lilás & Verde com Tule Francês",
    "slug": "vestidinho-infantil-princesa-jardim-lilas",
    "price": 75,
    "regular_price": 180,
    "category": "Moda Infantil",
    "condition": "Seminovo Impecável",
    "size": "4 a 6 Anos",
    "available_sizes": [
      "2 a 4 Anos",
      "4 a 6 Anos",
      "6 a 8 Anos"
    ],
    "color": "Lilás Pastel e Verde Sage",
    "available_colors": [
      {
        "name": "Lilás & Branco Neve",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Verde Menta Suave",
        "hex": "#A3B899",
        "in_stock": true
      },
      {
        "name": "Rosa Chá Delicado",
        "hex": "#F4C2C2",
        "in_stock": true
      }
    ],
    "brand": "Mon Sucré Grife Kids Brechó",
    "fabric": "Tule Macio Importado sobre Cetim Francês e Forro 100% Algodão Puro",
    "care_instructions": "Totalmente higienizado. Não pinica o corpo delicado da criança.",
    "description": "Vestidinho infantil de alta costura infantil com saia rodada em tule macio e estampa botânica sutil. Faixa de cetim com laço estruturado nas costas para ajuste milimétrico.",
    "measurements": {
      "bust": "62 cm",
      "length": "65 cm",
      "waist": "58 cm (com laço de ajuste)"
    },
    "detailed_measurements": {
      "bust": "62 cm",
      "waist": "58 cm",
      "hips": "75 cm",
      "length": "65 cm",
      "shoulder": "26 cm"
    },
    "image": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
    "rating": 5,
    "review_count": 19,
    "stock": 1,
    "is_featured": false,
    "eco_score": "A+ Circular"
  },
  {
    "id": 105,
    "name": "Camisa Social Masculina Manga Longa Fio Egípcio Azul Céu & Verde Menta",
    "slug": "camisa-social-masculina-fio-egipcio",
    "price": 110,
    "regular_price": 280,
    "category": "Moda Masculina (Adulto)",
    "condition": "Seminovo Impecável",
    "size": "G (42)",
    "available_sizes": [
      "PP (36)",
      "P (38)",
      "M (40)",
      "G (42)",
      "GG (44)",
      "XG (46)"
    ],
    "color": "Azul Céu Refinado",
    "available_colors": [
      {
        "name": "Azul Céu Nobre",
        "hex": "#87CEEB",
        "in_stock": true
      },
      {
        "name": "Verde Botânico Oliva",
        "hex": "#2D6A4F",
        "in_stock": true
      },
      {
        "name": "Branco Puro Egípcio",
        "hex": "#FFFFFF",
        "in_stock": true
      },
      {
        "name": "Preto Clássico",
        "hex": "#1A1A1A",
        "in_stock": true
      }
    ],
    "brand": "Dudalina Alfaiataria Masculina",
    "fabric": "100% Algodão Fio Egípcio 120/2 Pima",
    "care_instructions": "Higienização especializada. Tecido com tecnologia de fácil passadoria.",
    "description": "Camisa social clássica com colarinho italiano estruturado, perfeita para uso com gravata em ocasiões formais e solenes. Botões madreperola originais e costura francesa inglesa.",
    "measurements": {
      "shoulder": "48 cm",
      "bust": "112 cm",
      "length": "76 cm"
    },
    "detailed_measurements": {
      "bust": "112 cm",
      "waist": "106 cm",
      "hips": "112 cm",
      "length": "76 cm",
      "shoulder": "48 cm",
      "sleeve": "66 cm"
    },
    "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "review_count": 15,
    "stock": 1,
    "is_featured": false,
    "eco_score": "Pima Sustentável"
  },
  {
    "id": 106,
    "name": "Scarpin Salto Bloco Conforto Nude Rosado & Lilás Orquídea",
    "slug": "scarpin-salto-bloco-conforto-nude",
    "price": 95,
    "regular_price": 220,
    "category": "Calçados",
    "condition": "Seminovo Impecável",
    "size": "37",
    "available_sizes": [
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40"
    ],
    "color": "Nude Rosado Fosco",
    "available_colors": [
      {
        "name": "Nude Rosado Suave",
        "hex": "#E8D3C6",
        "in_stock": true
      },
      {
        "name": "Lilás Lavanda Clássico",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Verde Esmeralda Nobre",
        "hex": "#0F4C3A",
        "in_stock": true
      },
      {
        "name": "Preto Verniz",
        "hex": "#111111",
        "in_stock": true
      }
    ],
    "brand": "Usaflex Ortopedia & Conforto",
    "fabric": "Couro Pelica Legítimo com Palmilha Espumada de Memória 8mm",
    "care_instructions": "Sola antiderrapante higienizada e impermeabilizada.",
    "description": "Scarpin de bico amendoado com salto bloco de 5,5 cm com base anti-impacto. Perfeito para permanecer confortavelmente de pé durante todo o período solene sem fadiga.",
    "measurements": {
      "length": "Salto 5,5 cm | Palmilha 24,5 cm"
    },
    "detailed_measurements": {
      "length": "24,5 cm",
      "shoulder": "Salto 5,5 cm"
    },
    "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "review_count": 14,
    "stock": 1,
    "is_featured": false,
    "eco_score": "Alta Durabilidade"
  },
  {
    "id": 107,
    "name": "Saia Godê Midi Alfaiataria Verde Esmeralda & Alfazema com Cinto Forrado",
    "slug": "saia-gode-midi-alfaiataria-alfazema",
    "price": 98,
    "regular_price": 240,
    "category": "Moda Feminina (Adulto)",
    "condition": "Peça Única Selecionada",
    "size": "G (Veste 42-44)",
    "available_sizes": [
      "M (38-40)",
      "G (42-44)",
      "GG (46)"
    ],
    "color": "Verde Esmeralda Botânico & Alfazema",
    "available_colors": [
      {
        "name": "Verde Esmeralda Botânico",
        "hex": "#0F4C3A",
        "in_stock": true
      },
      {
        "name": "Lilás Alfazema Suave",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Bordeaux Marsala Nobre",
        "hex": "#581845",
        "in_stock": true
      }
    ],
    "brand": "Kauly Moda Modesta Grife",
    "fabric": "Crepe Alfaiataria Pesado com Caimento Escultural e Forro 100% Seda Sintética",
    "care_instructions": "Bolsos alfaiataria embutidos. Zíper invisível YKK traseiro.",
    "description": "Saia godê modesta com caimento amplo que não marca e não deforma. Acompanha cinto encapado na mesma fivela e costuras rebatidas com acabamento de ateliê.",
    "measurements": {
      "waist": "82 cm",
      "length": "78 cm"
    },
    "detailed_measurements": {
      "waist": "82 cm",
      "hips": "120 cm",
      "length": "78 cm"
    },
    "image": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
    "rating": 5,
    "review_count": 21,
    "stock": 1,
    "is_featured": true,
    "eco_score": "seleção Ouro"
  },
  {
    "id": 108,
    "name": "Conjunto Infantil Menino Alfaiataria Culto & Gravata Borboleta Lilás",
    "slug": "conjunto-infantil-menino-camisa-bermuda-culto",
    "price": 85,
    "regular_price": 195,
    "category": "Moda Infantil",
    "condition": "Seminovo Impecável",
    "size": "6 Anos",
    "available_sizes": [
      "4 Anos",
      "6 Anos",
      "8 Anos"
    ],
    "color": "Camisa Branca & Bermuda Verde Oliva",
    "available_colors": [
      {
        "name": "Branco & Verde Militar Suave",
        "hex": "#3E5C43",
        "in_stock": true
      },
      {
        "name": "Branco & Bege Areia",
        "hex": "#D2B48C",
        "in_stock": true
      },
      {
        "name": "Branco & Lilás Alfazema",
        "hex": "#dac9df",
        "in_stock": true
      }
    ],
    "brand": "Tip Top Premium Boy",
    "fabric": "Tricoline de Algodão Nobre & Sarja Peletizada com Elastano",
    "care_instructions": "Cós com elástico interno regulável com botões para não apertar.",
    "description": "Conjunto infantil formal composto por camisa branca de mangas dobráveis, gravata borboleta removível em alfaiataria e bermuda em sarja com botões madrepérola.",
    "measurements": {
      "bust": "Camisa tórax: 66 cm",
      "waist": "Bermuda cós ajustável: 52-60 cm",
      "length": "Comprimento bermuda: 36 cm"
    },
    "detailed_measurements": {
      "bust": "66 cm",
      "waist": "56 cm",
      "hips": "68 cm",
      "length": "36 cm",
      "shoulder": "28 cm"
    },
    "image": "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "review_count": 11,
    "stock": 1,
    "is_featured": false,
    "eco_score": "A+ Circular"
  },
  {
    "id": 109,
    "name": "Pulseira Berloques da Fé em Prata 925 com Zircônia Esmeralda & Lilás",
    "slug": "pulseira-berloques-cristaos-prata-925",
    "price": 92,
    "regular_price": 230,
    "category": "Acessórios Cristãos",
    "condition": "Peça Única Selecionada",
    "size": "18 cm + 3 cm de extensor",
    "available_sizes": [
      "18 cm + 3 cm Ajustável"
    ],
    "color": "Prata 925 com Zircônias",
    "available_colors": [
      {
        "name": "Prata & Lilás Suave",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Prata & Verde Esmeralda",
        "hex": "#0F4C3A",
        "in_stock": true
      },
      {
        "name": "Prata Pura Clássica",
        "hex": "#C0C0C0",
        "in_stock": true
      }
    ],
    "brand": "Benedetto Pratas da Galileia",
    "fabric": "Prata de Lei 925 Maciça Certificada",
    "care_instructions": "Acompanha certificado de autenticidade da prata e caixinha de veludo.",
    "description": "Pulseira de elos portugueses em prata 925 legítima, decorada com berloques: Bíblia articulada que abre, Peixe Ictis dos primeiros cristãos, palavra Fé gravada e Cruz com zircônia colorida.",
    "measurements": {
      "length": "18 cm a 21 cm ajustável"
    },
    "detailed_measurements": {
      "length": "18 a 21 cm"
    },
    "image": "https://images.unsplash.com/photo-1611591475880-928646b9d628?auto=format&fit=crop&w=800&q=80",
    "rating": 5,
    "review_count": 17,
    "stock": 1,
    "is_featured": false,
    "eco_score": "Prata Eterna"
  },
  {
    "id": 110,
    "name": "Sapato Oxford Clássico Masculino Couro Nobre Café Envernizado",
    "slug": "sapato-social-masculino-oxford-couro-cafe",
    "price": 159,
    "regular_price": 390,
    "category": "Calçados",
    "condition": "Seminovo Impecável",
    "size": "41",
    "available_sizes": [
      "38",
      "39",
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "color": "Marrom Café Nobre",
    "available_colors": [
      {
        "name": "Café Profundo Envernizado",
        "hex": "#3B2219",
        "in_stock": true
      },
      {
        "name": "Preto Nobre Oxford",
        "hex": "#111111",
        "in_stock": true
      },
      {
        "name": "Pinhão Acetinado",
        "hex": "#4A2A20",
        "in_stock": true
      }
    ],
    "brand": "Ferracini 24h Premium",
    "fabric": "Couro Bovino Legítimo Selecionado e Solado Gel Comfort",
    "care_instructions": "Higienizado com carinho e couro hidratado com bálsamo nobre.",
    "description": "Sapato Oxford legítimo com pespontos duplos artesanais e palmilha com tecnologia de amortecimento para cultos prolongados e celebrações solenes.",
    "measurements": {
      "length": "Palmilha 27,5 cm | Tamanho 41"
    },
    "detailed_measurements": {
      "length": "27,5 cm"
    },
    "image": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "review_count": 12,
    "stock": 1,
    "is_featured": false,
    "eco_score": "Restauro Nobre"
  },
  {
    "id": 111,
    "name": "Camisa Social Seda Off-White com Gola Laço de Época Vintage",
    "slug": "camisa-social-feminina-seda-gola-laco",
    "price": 115,
    "regular_price": 290,
    "category": "Moda Feminina (Adulto)",
    "condition": "Vintage Especial",
    "size": "M (40)",
    "available_sizes": [
      "PP (36)",
      "P (38)",
      "M (40)",
      "G (42)",
      "GG (44)"
    ],
    "color": "Pérola Off-White & Verde Salva",
    "available_colors": [
      {
        "name": "Pérola Off-White",
        "hex": "#F8F6F0",
        "in_stock": true
      },
      {
        "name": "Verde Salva Botânico",
        "hex": "#165B4C",
        "in_stock": true
      },
      {
        "name": "Lilás Orquídea Clássico",
        "hex": "#dac9df",
        "in_stock": true
      }
    ],
    "brand": "Via Tolentino Brechó de Grife",
    "fabric": "Crepe Acetinado Toque Seda Pura com Botões Perolizados",
    "care_instructions": "Gola laço versátil (amarração clássica ou gravata solta modesta).",
    "description": "Camisa vintage de alfaiataria feminina com caimento fluido impecável, gola laço romântica e botões madrepérola originais. Uma peça atemporal que eleva qualquer combinação.",
    "measurements": {
      "shoulder": "40 cm",
      "bust": "98 cm",
      "length": "64 cm"
    },
    "detailed_measurements": {
      "bust": "98 cm",
      "waist": "92 cm",
      "length": "64 cm",
      "shoulder": "40 cm",
      "sleeve": "60 cm"
    },
    "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    "rating": 5,
    "review_count": 18,
    "stock": 1,
    "is_featured": true,
    "eco_score": "Vintage Raro"
  },
  {
    "id": 112,
    "name": "Sandália Salto Bloco Tiras em Veludo Lilás & Verde Esmeralda",
    "slug": "sandalia-salto-bloco-tiras-lilas-pastel",
    "price": 89,
    "regular_price": 215,
    "category": "Calçados",
    "condition": "Seminovo Impecável",
    "size": "36",
    "available_sizes": [
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40"
    ],
    "color": "Lilás Lavanda Pastel & Ouro",
    "available_colors": [
      {
        "name": "Lilás Lavanda Pastel",
        "hex": "#dac9df",
        "in_stock": true
      },
      {
        "name": "Verde Esmeralda Imperial",
        "hex": "#0F4C3A",
        "in_stock": true
      },
      {
        "name": "Dourado Champagne",
        "hex": "#E5C158",
        "in_stock": true
      }
    ],
    "brand": "Arezzo Grife Brechó",
    "fabric": "Pelica Macia com Fivela Dourada Antioxidante e Salto Encapado 6cm",
    "care_instructions": "Higienização a seco profunda e palmilha anatômica renovada.",
    "description": "Sandália clássica de grife com salto bloco geométrico super estável, tiras frontais delicadas que abraçam o pé com elegância e fecho com ajuste no tornozelo.",
    "measurements": {
      "length": "Salto 6 cm | Palmilha 23,8 cm"
    },
    "detailed_measurements": {
      "length": "23,8 cm",
      "shoulder": "Salto 6 cm"
    },
    "image": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "review_count": 16,
    "stock": 1,
    "is_featured": false,
    "eco_score": "seleção Ouro"
  },
  {
    "id": 113,
    "name": "Calça Masculina de Alfaiataria Slim Conforto com Elastano",
    "slug": "calca-masculina-alfaiataria-slim-conforto",
    "price": 129,
    "regular_price": 299,
    "category": "Moda Masculina (Adulto)",
    "condition": "Seminovo Impecável",
    "size": "42",
    "available_sizes": [
      "38",
      "40",
      "42",
      "44",
      "46",
      "48"
    ],
    "color": "Azul Marinho Nobre",
    "available_colors": [
      {
        "name": "Azul Marinho Nobre",
        "hex": "#1E293B",
        "in_stock": true
      },
      {
        "name": "Preto Clássico Solene",
        "hex": "#111827",
        "in_stock": true
      },
      {
        "name": "Cinza Chumbo Grafite",
        "hex": "#475569",
        "in_stock": true
      },
      {
        "name": "Bege Areia Fino",
        "hex": "#D2B48C",
        "in_stock": true
      }
    ],
    "brand": "Aramis Alfaiataria Homem",
    "fabric": "97% Algodão Nobre Penteado com 3% Elastano Premium",
    "care_instructions": "Passar a ferro médio. Secar pendurado para manter o vinco impecável.",
    "description": "Calça de alfaiataria masculina com corte slim contemporâneo, bolsos faca funcionais e acabamento interno de alta precisão. O toque de elastano garante amplitude total de movimento e conforto prolongado.",
    "measurements": {
      "waist": "88 cm",
      "length": "104 cm"
    },
    "detailed_measurements": {
      "waist": "88 cm",
      "hips": "106 cm",
      "length": "104 cm"
    },
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    "rating": 5,
    "review_count": 22,
    "stock": 1,
    "is_featured": true,
    "eco_score": "Alfaiataria Nobre"
  }
];
