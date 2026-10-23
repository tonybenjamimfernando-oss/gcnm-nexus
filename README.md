# GCNM Nexus

Versao melhorada do GCNM (Global Commerce Network Map): a mesma proposta e o mesmo servico - ligar compradores, vendedores, empresas e prestadores de servicos num so mercado global - com uma interface nova, escura, em glassmorphism 3D, salas comerciais por sector e precos em qualquer moeda.

## Incluido nesta base

- Sistema visual completo: tokens, superficies de vidro, brilho neon azul, camadas flutuantes.
- Navegacao com efeitos independentes e interdependentes (pilula ativa partilhada e brilho proprio de cada item).
- Painel inicial com composicao em camadas flutuantes e cartoes de vidro.
- Explorar: pesquisa, filtros por sala e tipo, ordenacao, vista de comparacao.
- Anuncio: galeria, mapa, metricas, vendedor, avaliacoes, favoritos, partilha, mensagem e compra.
- Publicar: formulario por tipo de oferta (produto, servico, pedido de compra, oportunidade), imagens no bucket media, rascunho, envio para revisao e edicao.
- Mensagens: conversas por anuncio, com lista de conversas e envio de mensagens.
- Propostas: fornecedores respondem aos pedidos de compra, com comparacao de precos e prazos.
- Administracao: fila de moderacao dos anuncios e das denuncias de avaliacoes, com papeis de utilizador.
- Mapa: ofertas com latitude e longitude, mapa em miniatura na pagina do anuncio.
- 12 salas comerciais, cada uma com 10 modulos funcionais.
- Planos e precos em todas as moedas ISO, com taxas de referencia.
- Conta (entrar, criar, ligacao por email) e painel com perfil, guardados e anuncios.
- Incubadora de lojas: cada afiliado monta a sua loja com dez servicos em tres niveis (vitrine, catalogo, mensagens, pagamentos, entregas, reservas, equipa, afiliados, analitica e subscricoes), com painel proprio e montra publica em /loja/:slug.
- Guardados na conta (tabela saved_listings com RLS) e aviso de novas mensagens na navegacao.
- Destaques de anuncios atribuidos pela administracao, com ordem propria na exploracao.
- Testes automaticos da logica das jornadas (npm test).
- Aplicacao instalavel (PWA), com manifesto e service worker.
- Modo demo: sem variaveis de ambiente, a interface abre com dados de exemplo.

## Arranque

    npm install
    npm run dev

## Variaveis de ambiente

Copie .env.example para .env e preencha:

    VITE_SUPABASE_URL=
    VITE_SUPABASE_ANON_KEY=

Sao valores publicos. A chave de servico nunca entra no frontend.

## Base de dados

As migracoes em `supabase/migrations` criam as tabelas, as politicas de acesso (RLS) e o bucket publico `media` das imagens (limite de 5 MB, apenas PNG, JPG ou WEBP). Aplique-as com:

    supabase db push

Num projeto ja existente, o SQL editor tambem aceita os ficheiros um a um. Cada imagem fica em `media/<id do utilizador>/...`, e so o proprio utilizador pode escrever na sua pasta.

## Pagamentos

O checkout e a confirmacao correm nas funcoes `supabase/functions/create-checkout` e `supabase/functions/stripe-webhook`. Configure os secrets e publique:

    supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_... SITE_URL=https://o-seu-dominio
    supabase functions deploy create-checkout
    supabase functions deploy stripe-webhook

No Stripe, aponte o webhook para `https://<projeto>.supabase.co/functions/v1/stripe-webhook`. Sem `STRIPE_SECRET_KEY`, o botao de compra devolve uma mensagem clara e nenhuma encomenda e criada.

## Estrutura

    src/lib          dados, moedas, salas, planos, mensagens, ligacao ao Supabase
    src/components   ui, layout, home, listings, rooms
    src/pages        rotas da aplicacao
    supabase         migracoes SQL e funcoes de servidor
    docs             arquitetura, sistema de design, roteiro

## Documentos

- docs/DESIGN-SYSTEM.md - regras visuais, texturas, controlos, CTA
- docs/ARQUITETURA.md - stack, dados, moeda, pagamentos, seguranca
- docs/ROADMAP.md - 12 salas x 10 modulos e fases seguintes

## Fases seguintes

Destaques pagos e comissao de afiliacao, ativacao automatica do plano por pagamento, SEO por sala, testes end-to-end no browser e monitorizacao de erros. Ver docs/ROADMAP.md.
