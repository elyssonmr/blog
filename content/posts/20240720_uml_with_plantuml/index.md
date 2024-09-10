---
title: "Criando Diagramas UML com o PlantUML"
date: "2024-09-10T12:00:00-03:00"
draft: false
sidebar: true
slug: 20240720_uml_with_plantuml
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
---


Escrever diagramas UML, C4 ou outros é importante para demostrar de forma gráfica diversos aspectos dos sistemas que trabalhamos. Podemos documentar desde um módulo do sistema até mesmo os fluxos que o sistema possuí. Hoje existem diversas ferramentas para se criar UML, cada uma com suas vantagens e desvantagens.

Vou apresentar uma delas que é o [PlantUML](https://plantuml.com/). Neste artigo vou abordar os pontos positivos e negativos que enxergo na ferramenta e também exemplificar com alguns diagramas de exemplo utilizando ela.

<!--more-->

# Introdução

Diagramas estão presentes na vida de todos os desenvolvedores (ou deveria &#128541;) para demonstrar algumas partes do sistema em que estão trabalhando. Utilizando digramas, podemos representar o desenho de uma determinada camada do sistema, como componentes estão sendo organizados, qual o fluxo de chamadas ocorre em uma iteração além de diversos outros aspectos.

Nas atividades que estou fazendo com maior frequência no meu trabalho eu preciso desenhar diversos diagramas para demonstrar fluxos de desenvolvimento para os times que precisam de auxilio e também para conseguir demostrar para pessoas não técnicas qual o nosso fluxo de trabalho ou explicar algum outro procedimento. Para isso utilizou muito diagramas com o [PlantUML](https://plantuml.com/).

# Como fazer diagramas usando o PlantUML

O [PlantUML](https://plantuml.com/) é uma ferramenta relativamente simples e bem poderosa que pode ser utilizada para desenhar os nossos diagramas. Ele possuí suporte a diversos diagramas UMLs, diagramas C4, diagramas de infraestrutura para cloud entre outros. A imagem abaixo mostra quais tipos de diagramas podemos criar com a biblioteca padrão do [PlantUML](https://plantuml.com/):

{{<figure src="images/supported_diagrams.png" title="Lista de diagramas suportados" legend="Lista de diagramas suportados">}}

Visto que temos uma boa gama de diagramas vamos criar o nosso primeiro diagrama? Para isso precisamos abrir o site do PlantUML no caminho do servidor online disponibilizado para demonstração. A URL é: [https://www.plantuml.com/plantuml/uml/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000](https://www.plantuml.com/plantuml/uml/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000). Após aberto a URL, o PlantUML já nos dará um diagrama pronto. Este diagrama é um diagrama de sequência que com dois sistemas, um chamado *Bob* e um chamado *Alice*, no fluxo que é demonstrado o sistema *Bob* envia uma mensagem *hello* para o sistema *Alice*. A imagem abaixo é um print da tela com o diagrama de sequência que o PlantUML criou como demonstração:

{{<figure src="images/example_sequence.png" title="Exemplo de diagrama de sequência" legend="Exemplo de diagrama de sequência">}}

Bom, antes de escrever o nosso diagrama, vamos explorar um cenário para desenhar um diagrama de classes: um determinado sistema possuí a necessidade de notificar diversas pessoas utilizando ferramentas como Slack, GChat e Email. Para isso precisamos implementar cada uma das integrações com as ferramentas e também criar uma interface única para facilitar que as notificações sejam enviadas.

Agora iremos "desenhar" o diagrama de classes utilizando o PlantUML. Primeiro precisamos definir iniciar o texto com a tag: *@startuml* e também já vamos aproveitar e adicionar a tag: *@enduml*. Com estas tags estamos delimitando que o conteúdo entre elas deve ser utilizado para desenhar o diagrama.

{{<figure src="images/code_example/code_1.png" title="Tag de inicia e fim do diagrama" legend="Tag de inicia e fim do diagrama">}}

Após adicionar as tags iniciais, vamos adicionar a tag title com o título do nosso diagrama:

{{<figure src="images/code_example/code_2.png" title="Tag de título" legend="Tag de título">}}

Utilizando o Plugin do VSCode já estamos exibindo o título do nosso diagrama de classes.

{{<figure src="images/class_diagram/1.png" title="Diagrama de classe com o título" legend="Diagrama de classe com o título">}}

Vamos adicionar as nossas classes agora? para isso vamos definir uma interface chamada *Notification* e suas implementações concretas para as diversas ferramentas de comunicação que a empresa utiliza: *GChatNotification*, *SlackNotification* e *EmailNotification*. Para simplificar também vamos criar uma classe chamada *Message* que irá conter as informações necessária sobre a mensagem que será enviada.

{{<figure src="images/code_example/code_3.png" title="Declaração das classes" legend="Declaração das classes">}}

Com este código, já temos o diagrama exibindo as classes e a interface que definimos.

{{<figure src="images/class_diagram/2.png" title="Diagrama de classe com as classes e a interface" legend="Diagrama de classe com as classes e a interface">}}

Hmm... ainda está faltando algo nestes elementos que definimos. Se você respondeu que são os atributos e métodos você acertou!! No PlantUML é bem simples definir os atributos da classe. Na classe *Message* vamos definir um atributo privado chamado de *formated_message* do tipo *str* utilizando o seguinte código:

{{<figure src="images/code_example/code_4.png" title="Declaração de atributo privado" legend="Declaração de atributo privado">}}

Explicações sobre o formato:
* O sinal "-" indica que o atributo é privado. Caso seja utilizado o sinal "+" nós indicaremos que ele é público. Existem outras definições de visibilidade que podem ser conferidos na [documentação do PlantUML](https://plantuml.com/class-diagram#3644720244dd6c6a).
* O texto "formated_message" é o nome do atributo que estamos criando.
* O restante ": str" é a declaração do tipo deste atributo.

Para exemplificar a definição de funções, podemos definir uma função pública na Interface chamada *notify*, está função vai receber um argumento chamado *message* do tipo *Message*. O código para realizar essa definição é:

{{<figure src="images/code_example/code_5.png" title="Declaração de método público da interface" legend="Declaração de método público da interface">}}

Explicações sobre o formato:
* O sinal "+" indica que o método é público. O comportamento é idêntico ao que foi explicado no atributo, sendo o sinal "-" utilizado para definir uma função privada. Para as demais definições de visibilidade que podem ser conferidos na [documentação do PlantUML](https://plantuml.com/class-diagram#3644720244dd6c6a).
* O texto "void" indica qual o tipo de retorno desta função.
* O texto "notify" é o nome da função.
* Por último temos "(Message message)" que indica o tipo e o nome do argumento que a função deve receber.

Para praticar, já vamos também adicionar outros atributos na classe *Message* e nas demais classes que irão implementar a interface de notificação. O código do diagrama deve ficar assim:

{{<figure src="images/code_example/code_6.png" title="Declaração dos demais atributos" legend="Declaração dos demais atributos">}}

O diagrama deve se parecer com a imagem abaixo:

{{<figure src="images/class_diagram/3.png" title="Diagrama de classe com os atributos e funções" legend="Diagrama de classe com os atributos e funções">}}

**OBS**: Caso o seu diagrama esteja em ordem diferente, não se preocupe. O PlantUML pode gerar os diagramas em ordens diferentes mesmo.

Com os atributos definidos, vamos dizer qual o relacionamento entre os componentes??

Primeiro iremos fazer o relacionamento de uso entre a interface *Notification* e a classe *Message*. Para realizar este relacionamento podemos utilizar o seguinte código:

{{<figure src="images/code_example/code_7.png" title="Criação da conexão de uso com Message" legend="Criação da conexão de uso com Message">}}

No código:
* Os nomes *Notification* e *Message* indicam entre quais classes deve ocorrer o relacionamento.
* O texto "-->" indica qual o tipo deste relacionamento. O PlantUML possui diversos tipos de ligação. Eles podem ser [conferidos na documentação](https://plantuml.com/class-diagram#9dd2a6eca0c2a0e7). Caso a seta seja alterado a direção irá alterar também a direção no diagrama.
* Por último temos ": Uses" que indica qual a mensagem será exibida na seta de relacionamento.

Por enquanto o seu diagrama deve se parecer com este:

{{<figure src="images/class_diagram/4.png" title="Diagrama de classe com o relacionamento entre Notification e Message" legend="Diagrama de classe com o relacionamento entre Notification e Message">}}

Agora vamos fazer para as interfaces? O código é parecido, somente iremos mudar o tipo da seta e as mensagens. Teremos algo parecido com:

{{<figure src="images/code_example/code_8.png" title="Criação das conexões de implementação da interface" legend="Criação das conexões de implementação da interface">}}

No código acima, trocamos o tipo da seta para uma seta que representa o "Implementa" do diagrama de classes. Esta seta nada mais é do que uma linha pontilhada com um triangulo vazio. O mais legal é que o desenho da seta normalmente se parece com ela. O restante do código já conhecemos, não vou repeti-lo.

Pronto o nosso diagrama de classes está feito. Apesar de simples ele nos ajudou a explicar alguns conceitos de como criar diagramas com o PlantUML.

Inicialmente pensei em fazer mais diagramas neste artigo, mas para não ficar muito grande vou deixar para explicar outros diagramas em outras oportunidades.

# Vantagens

A vantagem da utilização de ferramentas como o PlantUML é escrever um código utilizando uma linguagem de marcação ele irá montar o diagrama. Acredito que em cerca de 95% (ou mais) dos casos o como o PlantUML organizar o diagrama já será o suficiente para ele ficar com uma exibição "bonita".

A edição do diagrama se torna bem simples, pois iremos precisar somente alterar o código e todo o diagrama será redesenhado. Quem já precisou ficar religando relacionamentos em diagramas sabe bem do porque esta é uma vantagem!!

Em muitos projetos temos um repositório único de códigos que adicionamos todos os artefatos referentes a um projeto. Muitas vezes adicionamos as imagens dos diagramas e estas imagens acabam deixando o repositório muito grande em termos de espaço em disco. A vantagem de utilizar um diagrama "descrito" em texto é que arquivos de texto podem ser versionados pelo repositório mais facilmente do que arquivos de imagem, com isso podemos ver o que foi sendo alterado a cada versão e caso seja necessário desenhamos o diagrama a partir do texto quando necessário.

Você pode fazer o download do arquivo completo {{<assetnewtab title="aqui" src="/plantuml/class_diagram.plantuml">}}.

# Desvantagens

Bom... nem tudo são flores. Os 5% dos casos em que o PlantUML Não desenha o diagrama de forma "bonita" deixa a a leitura do diagrama bem complicada e pode ate confundir. Para alguns diagramas nós conseguimos dar pistas de como ele deveria organizar os componentes, mas não são todos que permitem isso.

A utilização do servidor de renderização online pode expor dados sensíveis referente ao conteúdo dos diagramas. Não é que ele não seja seguro e vão utilizar para te hackear, mas os diagramas que são criados por ele possuem uma URL pública que pode ser acessada por qualquer pessoa que possua esta URL. Para contornar esta desvantagem eu recomendo instalar o plugin do VSCode ou até mesmo utilizar a [imagem docker](https://hub.docker.com/r/plantuml/plantuml-server) com o servidor de renderização. Caso esteja utilizando na sua empresa, você pode fazer o deploy do servidor e deixar o acesso somente interno.

Outra desvantagem, talvez a pior de todas, é a necessidade de aprender a linguagem de marcação de cada um dos diagramas que se pretende utilizar. Algumas coisas são comuns, mas outras não são, sendo necessário trabalhar em um diagrama com a documentação aberta para que se possa aprender como fazer o diagrama. Após um tempo e prática fica mais fácil de escrever os diagramas sem precisar consultar a documentação constantemente, mas até chegar lá pode demorar um pouco.

# Conclusão

Ao trabalhar com com desenvolvimento de software iremos, mais cedo ou mais tarde, precisar criar algum diagrama para representar algum aspecto da nossa aplicação de forma a comunicar com outras pessoas interessadas.

Pensando em produtos de software, a criação de diagramas faz parte de diversas etapas do ciclo de vida do desenvolvimento de software. Como o software muda ao longo do tempo, também iremos precisar alterar os nossos diagramas. Utilizando diagramas que são "desenhados" através de um texto irá facilitar muito o versionamento dos diagramas que estamos criando sem uma alta complexidade para organizar os diagramas.

O PlantUML possui diversos diagramas (no artigo mostrei somente um para não ficar muito longo) que podemos utilizar no ciclo de vida do desenvolvimento de uma aplicação. A vantagem de utilizar uma única ferramenta mais completa é que não precisamos ter muitas dependências de diversas bibliotecas ou ferramentas.

Mesmo tendo uma curva de aprendizagem, o PlantUML se mostra bem útil e fácil de utilizar para montar diagramas bem bonitos para a grande maioria dos casos.
