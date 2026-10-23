# Roteiro - GCNM Nexus

## Fase 0 - Esta base (concluida)

- Sistema visual completo em glassmorphism escuro, com camadas flutuantes e brilho neon.
- Navegacao com pilula ativa interdependente e brilho proprio em cada item.
- Explorar com pesquisa, filtros por sala e tipo, ordenacao e comparador de tres ofertas.
- Pagina de anuncio com galeria, detalhes, vendedor, avaliacoes, guardar e partilhar.
- Doze salas comerciais, cada uma com dez modulos funcionais.
- Planos e precos em todas as moedas ISO, com taxas de referencia.
- Conta (entrar, criar, ligacao por email) e painel com perfil, guardados e anuncios.

## Estrutura macro: 12 salas x 10 modulos

Salas: Agro e Alimentos, Tecnologia e Eletronica, Construcao e Materiais, Moda e Textil, Saude e Farmaceutico,
Logistica e Transporte, Energia e Solar, Industria e Maquinaria, Servicos Profissionais, Casa e Decoracao,
Automovel e Pecas, Educacao e Formacao.

Modulos em cada sala: montra, catalogo de produtos, pedidos de compra, servicos e assistencia, oportunidades e
parcerias, comparador de ofertas, tendencias de preco, logistica e entrega, pagamento e moedas, verificacao e
confianca.

## Fase 1 - Publicacao de anuncios

- Formulario completo por tipo de oferta, com variantes, condicao, garantia e prazo.
- Carregamento de imagens para o bucket media, com limite de tamanho e tipo.
- Rascunho, envio para revisao e edicao do anuncio publicado.

## Fase 2 - Mensagens e propostas

- Conversas por anuncio (conversations e messages), com aviso de novas mensagens.
- Propostas de fornecedores aos pedidos de compra (proposals), com comparacao de precos e prazos.

## Fase 3 - Pagamentos

- Conta no provedor, moedas de cobranca e metodos por pais.
- Checkout no servidor, webhooks, fatura e ativacao automatica do plano.
- Destaque de anuncios e comissao de afiliacao (affiliate_links).

## Fase 4 - Administracao e moderacao

- Painel com papeis (user_roles), fila de revisao de anuncios e avaliacoes.
- Denuncias de avaliacoes (review_reports) e historico de decisoes.

## Fase 5 - Mapa e alcance

- Mapa das ofertas com latitude e longitude ja guardados na base.
- Filtro por distancia, regiao e rota de transporte.

## Fase 6 - Produto e operacao

- Aplicacao instalavel, multi-idioma e melhorias de SEO por sala.
- Guardados no servidor (requer nova tabela e migracao com RLS).
- Testes end-to-end das jornadas principais e monitorizacao de erros.
