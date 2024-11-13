---
title: "Desenhando o fluxo de notificação com Diagrama de Sequência"
date: "2024-11-13T00:00:00-03:00"
draft: false
sidebar: true
slug: 20241113_sequence_plantuml
thumbnail:
  src: "img/thumbnails/default_thumbnail.jpg"
  visibility:
    - list
categories:
  - "Arquitetura Software"
tags:
  - "Documentação"
  - "Projeto"
  - "Software"
  - "PlantUML"
---

Neste artigo vou demonstrar como utilizar um diagrama de sequência para o desenho do fluxo de uma aplicação de notificações. Já escrevi um artigo explicando da importância de se [utilizar diagramas de sequência em projetos de software]({{< ref "posts/20240215_flows_diagram.md" >}} ). Neste iremos aprofundar em como criar estes diagramas.

Vamos utilizar o [PlantUML](https://plantuml.com) para desenhar o diagrama utilizando somente texto.

<!--more-->
# Introdução

Diagramas de sequência são utilizados para quando precisamos demonstrar um fluxo dentro de uma aplicação. Podemos documentar fluxos complexos ou demonstrar os principais fluxos dentro da aplicação em questão.

O [PlantUML](https://plantuml.com) possui este tipo de diagrama que pode ser representado facilmente utilizando texto. Inclusive podemos personalizar os diagramas de acordo com o tipo de interação e o tipo de autor do diagrama.

Chega de enrolação e vamos aprender a criar diagramas de sequência?

# Contexto

Para desenhar o diagrama de sequência, vamos desenhar um cenário de uma aplicação que realiza o envio de notificações via email.
O nosso sistema será composto por uma API responsável por receber dois tipos de notificações:
1. **Notificação de envio imediato** -> são notificações que assim que enviadas devem ser enviadas para o destinatário;
2. **Notificação de envio agendado** -> são notificações que devem ser agendadas para serem enviadas em uma data futura para o destinatário, ou seja, não são enviadas imediatamente;

Para o envio efetivo da notificações iremos utilizar o serviço de [SNS (Simple Notification Service) da AWS](https://aws.amazon.com/sns/).
Este serviço possui uma interface simples para o envio de notificações canais que a aplicação utiliza. São eles: SMS e email.

**OBS**: No nosso exemplo já estamos considerando que uma subscrição por parte dos usuários já foi realizada em outro momento.

# Desenhando o diagrama

AO longo do artigo iremos desenhar dois diagramas (o segundo é uma continuação do primeiro) para demostrar os dois fluxos de envio de notificação: envio imediato e o envio agendado.

## Notificação imediata

Agora vamos utilizar o [PlantUML](https://plantuml.com/) para desenhar o [diagrama de sequência (sequence diagram)](https://plantuml.com/sequence-diagram) do contexto descrito acima.

Primeiro precisamos criar um novo arquivo e para o exemplo aqui irei nomeá-lo como `notification_flow.plantuml`.
Ahhh vou utilizar o meu [VSCode com o plugin do plantuml](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) para editar o diagrama e ao mesmo tempo visualizar como ele está ficando.

Neste arquivo nós iremos adicionar a estrutura minima necessária para que seja reconhecido como diagrama de sequência. Basicamente é o `@staruml`, `title`, `autonumber` e `@enduml`.
Confira como que o arquivo ficou até o momento:

{{<figure src="images/code/code01.png" title="Estrutura padrão" legend="Estrutura padrão">}}

A keyword `autonumber` fará com que cada uma das interações adicionadas possuam um número ordenado que irá identifica-las dentro do fluxo. Desta forma ao explicar o diagrama podemos utilizar o números para referenciar qual a interação/mensagem estamos falando a respeito.

Agora nós iremos adicionar quais sistemas fazem parte do nosso fluxo. Nós iremos utilizar a keyword `participant` para o sistema que irá solicitar o envio de uma nova notificação, para api de notificação e para o SNS (também identificamos com uma outra cor para indicar que é um sistema externo). Desta forma será desenhado três participantes com os nomes que determinarmos.

{{<figure src="images/code/code02.png" title="Participantes do fluxo" legend="Participantes do fluxo">}}

Após estes participantes, vamos adicionar uma nova keyword `database` entre os após o participant API para representar o banco de dados da aplicação.

Em todos os sistemas e no banco banco de dados vamos utilizar a keyword `as` para podermos dar um "apelido" para todo mundo que participa do fluxo de notificação. Desta forma fica mais simples de referenciar os sistemas ao longo do diagrama.

Agora o seu diagrama deve se parecer com a imagem abaixo:

{{<figure src="images/diagram/sequence01.png" title="Diagrama com os participantes" legend="Diagrama com os participantes">}}

E o código do diagrama deve estar próximo ao da imagem abaixo:

{{<figure src="images/code/code03.png" title="Participantes com apelidos" legend="Participantes com apelidos">}}

A nossa primeira interação vai ser entre a Aplicação e a NotificationAPI. Esta mensagem é uma solicitação do envio imediato de uma notificação. para desenhar esta interação precisamos utilizar os apelidos que demos e escrever no diagrama ``app->api: Solicitação de\numa notificação imediata``. **OBS**: o `\n` no meio indica uma quebra de linha. Com este texto o PlantUML irá puxar uma seta com o número 1 (utilizando o `autonumber`, fará com que os números sejam adicionados automaticamente) mais o texto que definimos.

Logo abaixo vamos adicionar uma keyword chamada `activate` juntamente com o nome do que gostaríamos de ativar, o texto vai ficar assim: ``activate api``. Desta forma estamos demonstrando que tudo que ocorrer dentro da barra será uma chamada síncrona dentro da API. Antes de adicionar um print com o resultado, vamos adicionar a última interação que será a resposta da API para a aplicação que realizou a solicitação?

Para isso precisamos adicionar um texto indicando que há uma mensagem da API de notificação para a aplicação, porém iremos utilizar uma nova notação que adicionar um *tracinho* a mais ao invés de um único traço na "seta". O texto ficará assim: ``api-->app: Notificação enviada``. Este traço a mais faz com que a linha seja pontilhada o que indica que é uma resposta da api. Logo abaixo deste texto vamos "desativar" a API, ou seja, vamos indicar que a comunicação síncrona foi encerrada após a resposta. Para encerrar a comunicação devemos utilizar a keyword `deactivate` juntamente com o nome de qual comunicação gostaríamos de encerrar, no caso seria a api. O texto deve ficar `deactivate api`.

**OBS**: Aqui existe uma grande discussão a respeito do uso de linhas pontilhadas pois elas representam uma comunicação assíncrona em alguns outros diagramas e representações de comunicação entre sistemas. Na própria documentação do PlantUML é utilizado a mensagem de resposta de diversas formas, em algumas é utilizando como [linha pontilhada](https://www.plantuml.com/plantuml/uml/SoWkIImgAStDuNBCoKnELT2rKt3AJx9IS2mjoKZDAybCJYp9pCzJ24ejB4qjBk42oYde0jM05MDHLLoGdrUSoeLkM5u-K5sHGY9sGo6ARNHr2QY66kwGcfS2SZ00) e em outras como [linha continua](https://www.plantuml.com/plantuml/uml/SoWkIImgAStDuKeiBSdFAyrDIYtYSifFKj2rKt3CoKnELR1IS2mjoKZDAybCJYp9pCzJ24ejB4qjBW6hij75hQgu83-lE9KBoM05GrCCi_FoWTgA51A9imENQYnscHWe61gWMnUPMgAGI9ALU7N0h7L8pKi1XI40). Fica a seu critério utilizar linhas pontilhadas ou não na resposta. O objetivo de se desenhar um diagrama de sequência é comunicar um fluxo e as vezes seguir 100% da semântica pode deixar a tarefa muito burocrática de ser realizada.

Desta forma teremos o diagrama parcial:

{{<figure src="images/diagram/sequence02.png" title="Diagrama com a chamada da aplicação" legend="Diagrama com a chamada da aplicação">}}

Agora que já sabemos como desenhar as mensagens, vamos fazer as demais? A segunda mensagem é o salvamento da solicitação de de envio de mensagem imediata no banco de dados da API de notificações. Para isso adicionaremos uma nova mensagem entre a API e o banco de dados. No nosso exemplo iremos utilizar uma transação que será feito o commit após recebermos o sucesso do envio da mensagem pelo SNS. Esta primeira mensagem nós iremos adicionar a mensagem e também ativaremos o banco de dados para poder demonstrar o período que a transação ficou aberta no banco de dados. O texto ficará:

{{<figure src="images/code/code04.png" title="Chamada para o banco de dados" legend="Chamada para o banco de dados">}}

O diagrama vai ficar com a ativação posterior a última mensagem, mas no momento não tem problema pois iremos desativa-la assim que foi realizado o commit no banco de dados. Por enquanto temos o diagrama:

{{<figure src="images/diagram/sequence03.png" title="Diagrama com a chamada ao banco de dados" legend="Diagrama com a chamada ao banco de dados">}}

E o código está assim por enquanto:

{{<figure src="images/code/code05.png" title="Texto do diagrama com a chamada para o banco de dados" legend="Texto do diagrama com a chamada para o banco de dados">}}

Agora iremos adicionar a chamada e a resposta para o SNS. Basicamente vamos adicionar duas novas mensagens, uma para solicitar o envio da notificação para o SNS e outra com a resposta do SNS. Além de ativá-lo para demonstrar a duração da comunicação. O texto para as duas mensagens com a ativação é:

{{<figure src="images/code/code06.png" title="Texto do diagrama para a chamada do SNS" legend="Texto do diagrama para a chamada do SNS">}}

Ponto!! Agora com envio iremos realizar o commit da transação que foi aberta no banco de dados e posteriormente realizar o retorno da API para a aplicação que solicitou o envio da mensagem. O texto para o realizar a interação de commit no banco de dados deve ser adicionado antes da mensagem final de resposta que adicionamos no começo (mensagem entre a API e o app solicitante). O texto deve ficar:

{{<figure src="images/code/code07.png" title="Texto do diagrama realização do commit no banco de dados" legend="Texto do diagrama realização do commit no banco de dados">}}

Agora temos o diagrama de envio de notificação imediatas concluído. O fluxo deste processo foi demonstrado de forma simples e utilizando os números do `autonumber` poderemos explicar o diagrama para nosso pares no projeto.

A versão final do diagrama ficou assim:

{{<figure src="images/diagram/sequence04.png" title="Diagrama do envio de notificações imediatas" legend="Diagrama do envio de notificações imediatas">}}

Para fazer o download do texto do diagrama, acesse este {{<assetnewtab title="link" src="plantuml/notification_flow.plantuml">}}.

## Notificação agendada

Existem dois caminhos que podemos seguir agora:

1. O primeiro caminho se refere em fazer um novo diagrama para este fluxo exclusivamente.
2. O segundo caminho é adicionarmos cenários alternativos dentro do diagrama que já criamos. 

Ambos os cenários possuem vantagens e desvantagens. Normalmente eu adoto o primeiro caminho quando o fluxo é um tanto quanto complexo ou grande. Este inclusive pode ser o nosso caso.

Já o segundo caminho eu adoto para fluxos menores pois este caminho pode deixar o fluxo bem grande.

Bom... neste artigo iremos utilizar o segundo fluxo para que eu possa explicar como utilizar cenários alternativos no diagrama.

A sintaxe para a utilização de cenário alternativo é bem simples. Iremos utilizar a keyword `alt` e a keyword `else` para tenhamos dois cenários possíveis.

Um exemplo de construção seria:

{{<figure src="images/code/code08.png" title="Construção da keyword alt" legend="Construção da keyword alt">}}

O que irá gerar:

{{<figure src="images/diagram/sequence05.png" title="Diagrama demostrando a keyword alt" legend="Diagrama do envio de notificações imediatas">}}

Voltando ao nosso exemplo, vamos adicionar no diagrama o fluxo de mensagens agendadas?

O primeiro cenário alternativo que teremos é na chamada feita pela aplicação. Ela poderá realizar a chamada de uma notificação imediata ou uma notificação agendada. Vamos alterar o diagrama para refletir estes dois cenários?

Nós iremos adicionar o `alt` ao nosso digrama, após esta adição nos iremos adicionar a chamada 1 dentro do `alt` e no `else` vamos adicionar a chamada de notificação agendada. O texto do diagrama deve ficar parecido com:

{{<figure src="images/code/code09.png" title="Construção da keyword alt no exemplo do artigo" legend="Construção da keyword alt no exemplo do artigo">}}

O desenho do diagrama deve ficar igual da imagem abaixo:

{{<figure src="images/diagram/sequence06.png" title="Diagrama com a keyword alt" legend="Diagrama com a keyword alt">}}

A parte de salvar a notificação no banco de dados permanece a mesma, porém não será mais enviado a mensagem de imediato caso seja uma mensagem agenda. Para isto iremos criar outro `alt` para demonstrar este comportamento no fluxo:

{{<figure src="images/diagram/sequence07.png" title="Diagrama com a keyword alt para o envio da notificação imediata" legend="Diagrama com a keyword alt para o envio da notificação imediata">}}

O restante do fluxo deve permanecer o mesmo até a confirmação para a aplicação que solicitou o envio da notificação.

Por último, vamos precisar adicionar no fluxo o que vai acontecer com as notificações agendadas salvas no banco de dados. Para demostrar este fluxo vamos adicionar uma nota no fluxo e então adicionar as etapas do fluxo assíncrono. A nota pode ser adicionada utilizando a keyword `note`. No nosso exemplo vamos configurar para que a nota fique entre os atores envolvidos no fluxo:

{{<figure src="images/code/code10.png" title="Construção da keyword note" legend="Construção da keyword alt no exemplo do artigo">}}

Com o texto acima o diagrama deve se parecer com a imagem abaixo:

{{<figure src="images/diagram/sequence08.png" title="Diagrama com a keyword note para indicar o processamento assíncrono" legend="Diagrama com a keyword note para indicar o processamento assíncrono">}}

Logo em seguida vamos adicionar um novo ator para representar um worker que fará o processamento das mensagens agendas. Depois iremos adicionar o fluxo deste processamento. O fluxo será ler do banco de dados quais as notificações agendadas para um determinado horário, solicitar o envio destas notificações e depois atualizar no banco de dados o status dela.

O texto que fiz para representar esta parte do fluxo ficou assim:

{{<figure src="images/code/code11.png" title="Texto do fluxo assíncrono" legend="Texto do fluxo assíncrono">}}

Com isso temos o nosso diagrama de agendamento demonstrando o fluxo de solicitação de notificações agendadas e o disparo destas solicitações.

O diagram final deve estar assim:

{{<figure src="images/diagram/sequence09.png" title="Última versão do diagrama de sequência" legend="Última versão do diagrama de sequência">}}

Para fazer o download do texto do diagrama, acesse este {{<assetnewtab title="link" src="plantuml/notification_flow_async.plantuml">}}. OBS: criei um arquivo diferente para ter os dois diagramas que criamos durante o artigo

# Conclusão

Utilizar diagramas de sequencia da desenhar fluxos é algo muito util para que possamos demostrar como alguma operação dentro de um determinado contexto deve ocorrer.

O plantUML, facilita muito o desenho de diagramas de sequência além de permitir adicionar diversos tipos de interação e também diversas personalizações em nossos diagramas. Tudo isto utilizando texto, o que facilita muito a organização dos diagramas.

Nós podemos utilizar um nível de detalhe que faz sentido para cada diagrama de sequência que desenhamos. No diagrama que desenhamos neste artigo, utilizamos um nível de detalhe mais genérico pois o nosso objetivo era demostrar um fluxo. Caso seja necessário podemos adicionar mais detalhes que fazem sentido para o contexto que o diagrama deve representar. Uma curiosidade é que podemos adicionar detalhes no diagrama para representar um fluxo de comunicação entre classes de uma aplicação.

Obrigado!
