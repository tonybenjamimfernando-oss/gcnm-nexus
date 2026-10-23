# Arquitetura - GCNM Nexus

## 1. Stack

    Frontend   React 19 + TypeScript + Vite 6
    Estilo     Tailwind CSS 4 (tokens em src/styles.css)
    Rotas      react-router-dom 7
    Movimento  framer-motion (camadas flutuantes e pilula de navegacao)
    Icones     lucide-react
    Dados      Supabase (Postgres + Auth + Storage), o mesmo esquema do GCNM

## 2. Estrutura de pastas

    src/lib          supabase, api de leitura, moedas, taxas, salas, planos, contextos
    src/components   ui (vidro, botoes, chips, estatisticas), layout, home, listings, rooms
    src/pages        rotas da aplicacao
    docs             arquitetura, sistema de design, roteiro
    .github          pipeline de validacao (tipos + build)

## 3. Dados

O esquema e o mesmo do GCNM, para entregar o mesmo servico sem migrar conteudo:

    listings          ofertas: produto, servico, pedido de compra e oportunidade
    profiles          membros, empresas e prestadores, com verificacao
    reviews           avaliacoes por oferta
    conversations     conversas entre comprador e vendedor
    messages          mensagens das conversas
    proposals         propostas de fornecedores a pedidos de compra
    profile_private   dados fiscais em area privada
    user_roles        papeis de administracao e moderacao
    affiliate_links   ligacoes de afiliacao e contagem de cliques

A camada src/lib/api.ts le os dados, junta o vendedor e a media de avaliacoes, e devolve um modelo pronto para a
interface. Sem variaveis de ambiente, a mesma camada serve dados de exemplo (src/lib/demo.ts) para a interface poder
ser avaliada em qualquer maquina.

## 4. Moeda

Todos os codigos ISO 4217 sao suportados. A moeda escolhida fica guardada no navegador e cada preco e convertido a
partir da moeda original da oferta, com formatacao local via Intl.NumberFormat. As taxas em src/lib/rates.ts sao de
referencia e serao substituidas por taxas ao vivo na fase de pagamentos.

## 5. Pagamentos (fase seguinte)

- Checkout no servidor, nunca no cliente: chaves secretas do provedor apenas em funcoes serverless.
- Moedas de cobranca definidas no provedor, com apresentacao local na interface.
- Webhooks para confirmar pagamento, ativar plano e emitir fatura.
- Reembolsos, impostos e notas de credito definidos com o provedor antes de ligar o botao de compra.

## 6. Seguranca

- Row Level Security no Supabase: cada tabela decide quem le e quem escreve.
- Apenas a chave publica entra no frontend; a chave de servico nunca.
- Dados fiscais e contactos privados ficam em tabela separada (profile_private).
- Nenhum ficheiro de ambiente e versionado; .env.example traz apenas os nomes das variaveis.

## 7. Deploy

O build gera ficheiros estaticos (pasta dist). Publique em Cloudflare Pages ou Workers com as variaveis
VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY definidas no ambiente. O pipeline do GitHub valida tipos e build em cada
pull request.
