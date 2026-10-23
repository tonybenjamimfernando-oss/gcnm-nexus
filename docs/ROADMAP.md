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

## Fase 1 - Publicacao de anuncios (concluida)

- Formulario completo por tipo de oferta, com variantes, condicao, garantia, prazo, quantidade e coordenadas.
- Imagens no bucket publico media, com limite de 5 MB e apenas PNG, JPG ou WEBP, guardadas por pasta do utilizador.
- Rascunho, envio para revisao e edicao do anuncio, com validacao antes de guardar.

## Fase 2 - Mensagens e propostas (concluida na base)

- Conversas por anuncio, com lista de conversas e historico de mensagens.
- Propostas de fornecedores aos pedidos de compra, com comparacao de precos e prazos.
- Aviso de novas mensagens na navegacao, com contagem por ler.

## Fase 3 - Pagamentos (em curso)

- Feito: funcoes create-checkout e stripe-webhook, registo de encomendas, cobranca na moeda do anuncio e erro claro quando o Stripe ainda nao esta configurado.
- Feito: destaque de anuncios atribuido pela administracao, com selo no cartao e prioridade na exploracao.
- Falta: conta e chaves do Stripe, moedas de cobranca e metodos por pais, fatura, ativacao automatica do plano, destaques pagos e comissao de afiliacao.

## Fase 4 - Administracao e moderacao (em curso)

- Feito: pagina de administracao com fila de moderacao dos anuncios, denuncias de avaliacoes e papeis de utilizador.
- Falta: historico de decisoes e avisos aos autores.

## Fase 5 - Mapa e alcance (em curso)

- Feito: latitude e longitude guardadas na base, pagina de mapa e mapa em miniatura na pagina do anuncio.
- Falta: filtro por distancia, regiao e rota de transporte.

## Fase 6 - Produto e operacao (em curso)

- Feito: aplicacao instalavel (manifesto e service worker), multi-idioma na navegacao e modo demo sem configuracao.
- Feito: guardados na conta (tabela saved_listings com RLS) e testes automaticos da logica das jornadas (npm test).
- Falta: SEO por sala, testes end-to-end no browser e monitorizacao de erros.

## Fase 7 - Incubadora de lojas
- Feito: contas de loja com dez servicos em tres niveis, painel do proprietario, montra publica e codigos de afiliado.
- Feito: esquema stores, store_services, store_members e store_affiliates com RLS e ligacao das ofertas a loja (listings.store_id).
- Falta: comissoes e liquidacoes automaticas, convites de equipa por email, verificacao de loja externa e analitica historica.
