---
title: "Estratégia de Fallback"
date: "2025-02-02T20:00:00-03:00"
draft: false
sidebar: true
slug: 20250202_fallback_strategy
thumbnail:
  src: "img/thumbnails/20250202_fallback_strategy.jpg"
  visibility:
    - list
categories:
  - "Arquitetura Software"
tags:
  - "Projeto"
  - "Software"
  - "Fallback"
---

Aplicações importantes possuem diversos recursos para se manterem online, disponíveis e também manter o ambiente que estão inseridas saudável caso algum componente da arquitetura esteja com uma carga alta ou indisponível. Uma das técnicas utilizadas é a estratégia de Fallback para chamadas importantes em outros sistemas que podem estar indisponíveis. Neste artigo vamos discutir sobre esta estratégia e também alguns exemplos de como utiliza-la.

<!--more-->

# Introdução

Algumas aplicações estão dentro de uma arquitetura em que elas são componentes chaves para a empresa, por isso estas aplicações utilizam algumas técnicas para manter a sua disponibilidade e a resiliência.

Uma destas técnicas é implementar uma estratégia de Fallback. De forma a criar um mecanismo de backup para quando uma ação não sai conforme o esperado. Vale ressaltar que existem diversas estratégias para criar um fallback. Neste artigo vou mostrar duas estratégias que já utilizei em algumas das aplicações que trabalhei no passado e também vou explorar alguns exemplos que conheço.

# O que é a estratégia de fallback

O Fallback é uma técnica em que criamos um "backup" ou plano de contingência para alguma funcionalidade da nossa aplicação. Geralmente usamos este backup quando o comportamento principal falha ou algo não está disponível.

Por exemplo: o plano principal é consultar consultar um sistema externo que irá gerar as etiquetas para iniciar o processo de despacho das peças feitas pela fábrica que trabalhamos. Caso o sistema de etiquetas não esteja disponível não conseguiremos gerar as etiquetas que precisam estar fixas no pacote com as peças a serem transportadas. Neste cenário o plano de contingência (backup) seria retentar gerar a etiqueta depois de alguns minutos, caso o sistema esteja com algum problema momentâneo, depois de algum tempo ao realizar uma nova tentativa teremos mais chances de obter sucesso na chamada.

Existem diversas formas de implementar um plano de contingência ou backup. Uma das formas está de acordo com o exemplo do último paragrafo, o plano foi de criar um backup para a funcionalidade, ou seja, no momento que foi encontrado um erro no sistema que precisa ser chamado, um backup da chamada foi gerado para poder realizar a chamada novamente em outro momento.

Outra forma é desenhar um comportamento alternativo. Quando o comportamento principal não for realizado com sucesso entra em cena o comportamento alternativo. Por exemplo, um site lista as últimas transações de bitcoin que foram feitas em uma determinada blockchain. Caso em algum momento não seja possível consultar as últimas transações, ainda assim será apresentado as transações que estão salvas em um cache (exibindo os dados do cache desatualizados) informando a última data que foram atualizados. Este comportamento alternativo, pode não trazer os dados 100% atualizados, mas pelo menos para alguns casos ele vai ajudar nas consultas que algumas pessoas querem realizar. Ainda assim é melhor do que não trazer nenhuma informação para os usuários.

Além das formas que foram apresentadas aqui, existem diversas outras formas de implementar uma estratégia de fallback. Inclusive utilizando outras técnicas como o [circuit break](https://martinfowler.com/bliki/CircuitBreaker.html). Cabe ao time mantenedor da aplicação avaliar qual seria a melhor técnica a ser utilizada em cada situação. Em todos os casos que implementamos o Fallback, estamos na verdade criando um comportamento backup para aquela funcionalidade, o famoso "E se der errado? O que fazemos?".

# Onde e como é usado?

Além dos exemplos que demonstramos para explicar a técnica existem outros sistemas de empresas famosas que utilizam da mesma estratégia.

Podemos exemplificar a [Netflix](netflix.com). Ao acessar o catalogo da Netflix é mostrado diversas sugestões e sua própria lista do conteúdo salvo para visualizar posteriormente. Caso a chamadas na API para retornar estas sugestões dê ruim, simplesmente não é mostrado aquela informação no catalogo. Eles perceberam que o impacto na experiência do cliente é mínimo em comparado com o impacto de mostrar que houve um erro. Caso o cliente realmente queira ver a lista dos conteúdos salvos, ele vai precisar obrigatoriamente consultar esta parte dentro do aplicativo da Netflix, sendo realizado uma nova tentativa de consulta. Para provar que o impacto é mínimo, provavelmente você nem reparou que em alguns momentos não é mostrado de cara algumas listas dentro do aplicativo da Netflix, reparou? Para saber mais confira o post sobre resiliência no [blog da Netflix](https://netflixtechblog.com/making-the-netflix-api-more-resilient-a8ec62159c2d).

Algumas empresas de e-commerce também utilizando a estratégia de Fallback em alguns de suas funcionalidades. Posso citar em dois casos que conheço que utilizam um Fallback:
1. O primeiro momento é em alguns casos quando se vai calcular o frete para mostrar para o usuário. Nem sempre os serviços dos correios estão disponíveis para o cálculo do frete, neste caso a estratégia de Fallback utilizada é consultar uma tabela interna com preços médios para cada região. Desta forma o e-commerce não perde a venda e ainda assim consegue realizar a entrega do produto para o cliente. Mostrar um erro nestes casos pode fazer com que o cliente busque o produto em outra plataforma de e-commerce.
2. O segundo caso é na hora da cobrança do pedido. Algumas plataformas realizam a cobrança de forma assíncrona, ou seja, ao receber um pedido elas indicam que receberam e que irão processar o pagamento deste pedido posteriormente. Outras plataformas possuem o comportamento padrão de tentar autorizar no cartão do cliente (reservar o valor do pedido) e após essa reserva continuar com o processamento do pedido de forma assíncrona. A estratégia de fallback neste caso seria tentar realizar o comportamento padrão e caso encontre algum erro, salvar os dados de tal forma a reutiliza-lo em algum momento no futuro. Desta forma é possível garantir a compra enquanto ainda será realizado uma nova tentativa de de autorização no cartão do cliente.

Dentre outros casos.

**OBS**: O comportamento vai depender um pouco da experiência que você deseja dar para seus clientes. Não existe uma forma única de se implementar algo e cada experiência precisa ser avaliada a fim de buscar o que é melhor para o cliente e para o negócio.

# Dicas de implementação

Bora para a prática? Vou explicar arquiteturalmente como implementar um Fallback. Vou utilizar os dois cenários que levantamos ao longo do artigo com uma sugestão de como implementar um fallback.

## Estratégia de backup para retentativa

Pegando o exemplo de etiquetas que explicamos. Temos a seguinte arquitetura no sistema:

{{<figure src="images/diagrams/01_package_register_system.png" title="Diagrama C4 de containers do sistema" legend="Diagrama C4 de containers do sistema">}}

O comportamento padrão é o operador registrar um novo pacote e a etiqueta ser gerada na hora estando disponível para a impressão logo em seguida. O sistema também permite o registro de lotes de pacotes, sendo necessário gerar diversas etiquetas ao mesmo tempo.

Para aplicar a estratégia de Fallback podemos adicionar um novo container. Este container será um worker que irá realizar, de tempos em tempos, uma leitura no banco de dados para buscar quais as etiquetas precisam ser geradas e irá realizar uma nova tentativa de chamada para o sistema que gera a etiqueta. Caso dê sucesso na chamada, o worker vai salvar a etiqueta no banco de dados e então o operador poderá consulta-las posteriormente. Caso ainda ocorra algum erro o status não será alterado no banco de dados, sendo realizado uma nova consulta na próxima execução do worker.

Após adicionar o worker a arquitetura ficará desta maneira:

{{<figure src="images/diagrams/02_package_register_system_fallback.png" title="Diagrama C4 de containers do sistema com o worker de fallback" legend="Diagrama C4 de containers do sistema com o worker de fallback">}}

Com a adição do worker estamos agora com um backup para o caso de ocorrer algum erro na primeira tentativa de gerar as etiquetas. O worker será responsável por ler as tentativas que ocorreram erros do banco de dados e realizar uma nova tentativa de geração de etiqueta sem que o usuário realize esta tarefa manualmente.

{{<assetnewtab title="Download do arquivo que gerou este diagrama" src="content/01_tag_system_c2.plantuml">}}

## Comportamento alternativo

O comportamento alternativo se dá quando a ação principal não é executada como sucesso. Então como fallback entra para que seja feita outra ação no lugar.

Para este exemplo, vamos desenhar um sistema de consulta a cotações da Bolsa de Valores. A ideia é criar uma API que irá realizar a consulta das ações na Bolsa e disponibilizar as cotações para os clientes da API.

Inicialmente o desenho é bem simples. Será somente a API e um cache para salvar os dados e evitar diversas consultas ao mesmo ticker.

{{<figure src="images/diagrams/03_stock_api_system.png" title="Diagrama C4 de containers do sistema" legend="Diagrama C4 de containers do sistema">}}

Mesmo já estando evitando diversas consultas com o cache, nem sempre ele estará atualizado. Desta forma será necessário consultar novamente para poder manter os valores atualizados. Se nesta consulta ocorrer algum erro? Aqui que entra o fallback com um comportamento alternativo. Ao invés de mostrar para os clientes que deu erro, iremos mostrar a última informação que temos salva no cache. Claro que para não confundir devemos mostrar a informação com o horário que houve a atualização. Para alguns casos esta informação desatualizada será bem útil, para outros infelizmente será necessário ter o dado atualizado.

Caso seja solicitado novamente o valor do ticker, será feito uma nova tentativa. Ela sendo um sucesso, o valor no cache será atualizado. Se a nova tentativa não for com sucesso também, então será retornado o comportamento alternativo.

{{<assetnewtab title="Download do arquivo que gerou este diagrama" src="content/02_stock_api_c2.plantuml">}}

# Conclusão

A técnica de fallback é uma técnica poderosa que trás muita disponibilidade e tolerância a falhas para a sua aplicação. Com ela podemos prover comportamentos alternativos sem a necessidade de mostrar que houve um erro para quem estiver chamando a aplicação.

Existem diversas maneiras de implementar esta técnica para prover comportamentos alternativos ou backups de funcionalidades. Nem sempre é fácil prover um comportamento alternativo para algumas funcionalidades, sendo necessário um bom planejamento do que deve ser feito para prover um comportamento alternativo que realmente ajude, mesmo que só um pouco, quem está chamando a aplicação. A melhor forma de implementar uma técnica de Fallback é alinhar bem o comportamento que será implementado com as funcionalidades do sistema, desta forma é possível fazer a implementação sem que os usuários do sistema percebam que ela está sendo utilizada.

Particularmente, não acho que o Fallback deva ser utilizado em todas as funcionalidades do sistema pois pode gerar uma complexidade de implementação muito grande. Além de adicionar novos nós na arquitetura (pensando em workers) que precisam ser monitorados para garantir que estejam sempre "saudáveis". Inicialmente pode-se implementar nas tarefas mais cruciais para aplicação e após avaliar se deve ser implementado em alguma outra tarefa do sistema.

**Fonte**:

[Fallback](https://thecodest.co/dictionary/fallback/)
