# Sistema de design - GCNM Nexus

Referencia visual: composicoes em camadas flutuantes, vidro fosco, brilho neon azul, profundidade em varias camadas (Z), tipografia geometrica de alto contraste.

## 1. Paleta

    Fundo          #05080f
    Fundo elevado  #080d18 / #0c1322
    Vidro          rgba(255,255,255,0.05) - rgba(255,255,255,0.08)
    Borda de vidro rgba(255,255,255,0.10) / 1px
    Azul neon      #2d7bfd (principal) / #4d93ff (claro)
    Aqua           #35d6f5
    Violeta        #8a5cff
    Menta          #6ce0c2
    Ambar          #ffc46b
    Texto          #eaf1ff / #b7c7df / #8297b8

Regra: o fundo e sempre escuro; o vidro nunca e opaco; o azul neon marca acao, foco e progresso; ambar apenas para destaque comercial (promovido, oferta).

## 2. Textura do vidro

    background: rgba(255,255,255,0.05)
    backdrop-filter: blur(18px) saturate(140%)
    border: 1px solid rgba(255,255,255,0.10)
    border-radius: 24px

Variacoes: .glass (padrao), .glass-strong (painel principal, blur 28px), .glass-deep (gradiente interno, cartoes de destaque). O brilho especular nas extremidades vem da classe .specular, um gradiente de 140 graus do canto superior esquerdo.

## 3. Luz e profundidade

- Halo: .glow-ring (anel de 1px azul + sombra difusa de 60px) para elementos ativos.
- Sombra suave: .glow-soft para cartoes em repouso.
- Camadas: .stage cria perspectiva de 1400px; .layer-1 e .layer-2 inclinam as camadas flutuantes.
- Flutuacao: .float-a (7s), .float-b (9s), .float-c (11s). Desligadas quando o sistema pede menos movimento.

## 4. Tipografia

- Titulos: Plus Jakarta Sans, 700/800, letter-spacing -0.02em.
- Texto: Manrope, 400/500/600.
- Escala: 12 / 14 / 16 / 20 / 28 / 40 / 56 px.
- Contraste minimo 4.5:1 sobre o vidro; titulos com .neon recebem brilho azul discreto.

## 5. Controlos

- Botoes: primario (azul solido + halo), secundario (vidro + borda), fantasma (texto + borda em hover).
- Estados: hover eleva 2px, ativo encolhe 2%, foco com anel de 2px azul claro.
- Campos: vidro, altura 44px, borda que acende em foco, sem sombras internas.
- Chips: pilula de vidro; ativa em azul com texto branco.
- Cada controlo tem o seu proprio brilho (independente) e participa no estado global (interdependente): a pilula de navegacao acompanha o item ativo com uma unica animacao partilhada.

## 6. Navegacao

Barra superior fixa, transparente no topo e de vidro depois de 12px de rolagem. Pesquisa a esquerda do lado direito, seletor de moeda global, acao principal (azul) sempre visivel. No mobile: painel lateral em vidro e barra inferior com 5 destinos.

## 7. Chamadas para acao

- Hierarquia: um botao primario por ecra; secundarios em vidro.
- Prova antes do pedido: numero, selo de verificacao ou avaliacao junto ao botao.
- Urgencia honesta: prazos e quantidades reais, nunca contadores inventados.
- Verbo concreto: Explorar salas, Ver planos, Guardar, Publicar oferta.
- Repeticao nos pontos de decisao: fim do painel, cartao de anuncio, rodape.

## 8. Cartoes de anuncio

Imagem 16:10 com gradiente de leitura, selo de tipo no canto, favorito no canto oposto, titulo em 2 linhas, preco em destaque com moeda, localizacao e vendedor em texto secundario, acao no rodape. Elevacao no hover e halo azul discreto.

## 9. Acessibilidade

Foco sempre visivel, alvos de toque de 44px, texto alternativo nas imagens, contraste verificado, movimento desligado com prefers-reduced-motion, sem dependencia exclusiva da cor.
