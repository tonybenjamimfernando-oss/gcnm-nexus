# GCNM Nexus

Versao melhorada do GCNM (Global Commerce Network Map): a mesma proposta e o mesmo servico - ligar compradores, vendedores, empresas e prestadores de servicos num so mercado global - com uma interface nova, escura, em glassmorphism 3D, salas comerciais por sector e precos em qualquer moeda.

## Incluido nesta base

- Sistema visual completo: tokens, superficies de vidro, brilho neon azul, camadas flutuantes.
- Navegacao com efeitos independentes e interdependentes (pilula ativa partilhada e brilho proprio de cada item).
- Painel inicial com composicao em camadas flutuantes e cartoes de vidro.
- Explorar: pesquisa, filtros por sala e tipo, ordenacao, vista de comparacao.
- Anuncio: galeria, metricas, vendedor, favoritos e partilha.
- 12 salas comerciais, cada uma com 10 modulos funcionais.
- Planos e precos em todas as moedas ISO, com taxas de referencia.
- Entrar e Painel ligados ao Supabase (o mesmo esquema de dados do GCNM).
- Modo demo: sem variaveis de ambiente, a interface abre com dados de exemplo.

## Arranque

    npm install
    npm run dev

Variaveis de ambiente: copie .env.example para .env e preencha

    VITE_SUPABASE_URL=
    VITE_SUPABASE_ANON_KEY=

Sao valores publicos. A chave de servico nunca entra no frontend.

## Estrutura

    src/lib          dados, moedas, salas, planos, ligacao ao Supabase
    src/components   ui, layout, home, listings, rooms
    src/pages        rotas da aplicacao
    docs             arquitetura, sistema de design, roteiro

## Documentos

- docs/DESIGN-SYSTEM.md - regras visuais, texturas, controlos, CTA
- docs/ARQUITETURA.md - stack, dados, moeda, pagamentos, seguranca
- docs/ROADMAP.md - 12 salas x 10 modulos e fases seguintes

## Fases seguintes

Pagamentos (Stripe), mensagens e propostas, publicacao de anuncios, administracao e moderacao, mapa, PWA e multi-idioma. Ver docs/ROADMAP.md.
