---
title: "Mensageria com RabbitMQ - Fanout"
date: "2026-07-28T12:00:00-03:00"
draft: false
sidebar: true
slug: 20260729_fanout_publish
thumbnail:
  src: "img/thumbnails/20260729_fanout_publish.jpg"
  visibility:
    - list
categories:
  - "Engenharia de Software"
  - "Desenvolvimento"
  - "Mensageria"
tags:
  - "RabbitMQ"
  - "Projeto"
  - "Mnesageria"
---




Existe uma maneira fácil de publicar mensagens em diversas filas diferentes do RabbitMQ sem a necessidade de publicar individualmente em cada fila. Neste artigo vamos continuar o assunto do [último artigo]({{< ref "/20260616_direct_consume" >}}) e explorar mais uma forma de publicar mensagens utilizando o RabbitMQ.

<!--more-->

# Introdução

Ao longo dos últimos artigos estamos explorando um pouco mais do RabbitMQ e os conceitos relacionados a ele. Neste artigo vamos explorar outra maneira de publicar mensagens via fanout. Em seguida, vamos continuar evoluindo o exemplo que já fizemos no último artigo. Caso tenha perdido, não se preocupe, ao longo deste artigo eu vou publicar o link do repositório para ficarmos na mesma página.

# Fanout Exchange

Racaptulando do [artigo]({{< ref "/20260505_rabbitmq_introduction#exchange-fanout-id" >}}) que falamos dos conceitos de mensageria com o RabbitMQ, o exchange fanout publica uma mensagem em diversas filas de forma atômica, ou seja, enviamos uma única mensagem para ele e o RabbitMQ publica nas filas que estão inscritas no exchange.

Diferentemente do Exchange Direct, o Fanout precisa ser criado e as filas devem fazer o bind com ele. Desta forma, sempre que uma mensagem for enviada utilizando o nome dele como Routing Key, uma mensagem será publicada em todas as filas que fizeram o bind neste exchange.

Uma curiosidade do nome é que o desenho representando o fanout parece com um ventilador (fan em inglês), onde ele suga o vento atrás do motor e o espalha ao joga-lo para frente.

{{<figure src="images/01_fanout_scheme.png" title="Publicação Fanout" legend="Publicação Fanout. Adaptado de: https://www.rabbitmq.com/tutorials/tutorial-three-python">}}

Esta forma de publicar mensagem, também é conhecida como Publish/Subscribe, ou seja, quem precisa receber a mensagem irá fazer um subscribe no tópico. Diferentemente do topic, todos os subscribers vão receber a mesma mensagem idêntica. Lembrando do exemplo da cozinha, caso dois cozinheiros estejam inscritos no fanout, ambos vão receber a mesma mensagem e dois pedidos idênticos serão produzidos.

# Exemplo Prático

Para explicar o fanout, ainda podemos utilizar o {{<externalnewtab src="https://github.com/elyssonmr/article_rabbitmq/tree/direct_exchange" title="exemplo da lanchonete">}}. Quando um pedido for feito, vamos utilizar um fanout para notificar a cozinha e também notificar o sistema contábil para registrar a venda do lanche. O inicio do fluxo irá continuar o mesmo, somente alterando a publicação para ser um fanout ao invés de uma publicação direct.

{{<figure src="images/02_order_flow.png" title="Fluxo do Pedido" legend="Fluxo do Pedido">}}

A lanchonete ainda continua recebendo diversos pedidos, sendo necessário enfileira-los para que a cozinha os consiga preparar e também envia-los para o sistema contábil da lanchonete. O processo da cozinha ainda continua manual, sendo os pedidos anotados no papel pelo atendente e então adicionados na fila de produção da cozinha. Já para o sistema contábil, como é um sistema computadorizado, não é necessário anotar e enviar para o setor. A mensagem publicada através do fanout, irá chegar no sistema automaticamente e ele vai processa-la sem problemas.

Vamos alterar o sistema para suportar a publicação através do Fanout Exchange. O restante do sistema vai permanecer o mesmo.

No {{<externalnewtab src="https://github.com/elyssonmr/article_rabbitmq/tree/direct_exchange" title="repositório">}}, já temos o código que fizemos com as alterações do [último artigo]({{< ref "/20260616_direct_consume" >}}). Caso tenha perdido você poderá fazer o clone do repositório para acompanhar este artigo. Vou partir das ultima alterações que feitas anteriormente. Observe que a branch main do repositório vai estar sempre com a ultima versão, mas estou adicionando tags com a versão final de cada um dos artigos a medida que formos evoluindo o sistema, ok?

## Evoluindo o RabbitClient

Antes de alterarmos a API, vamos precisar criar um novo método no RabbitClient para declarar o Fanout Exchange. Este método irá receber o nome do exchange (vamos utilizar este nome como routing key) e declara-lo. Como ela é especifica vamos deixar hardcoded o tipo do exchange. Por enquanto não precisamos retornar o exchange criado. Da mesma forma que declaramos as filas no outro artigo, vamos utilizar um método da biblioteca que a quinta série não permite dizer o nome para declarar o exchange. Caso seja necessário, poderíamos fazer este método genérico passando também o tipo do exchange para o método, mas não é necessário agora.

{{<figure src="images/03_declare_fanout_function.png" title="Método Declare Fanout Exchange" legend="Método Declare Fanout Exchange">}}

Legal, temos como declarar o fanout exchange, mas agora precisamos fazer o bind das filas nele. Para fazer o bind, vamos precisar declarar outro método no RabbitClient que fará o trabalho completo chamando o método que declara o exchange, declarando a fila (igual fizemos quando utilizamos o direct exchange) e por último fazendo o bind da fila no exchange utilizando o nome do exchange.

{{<figure src="images/04_bind_queue_fanout_exchange.png" title="Método Bind Queue to Fanout Exchange" legend="Método Bind Queue to Fanout Exchange">}}


A forma que fizemos temos o comportamento esperado que é criar o fanout exchange e fazer o bind de uma fila nele. Mas, podemos melhorar um pouco utilizando um único canal para declarar o fanout exchange, a fila e fazer o bind. O motivo para pensar nesta solução é por causa que o processo para declarar um um canal é um processo síncrono, ou seja, é um pouco custoso ficar abrindo canais, ainda mais que estamos abrindo e fechado ao final das chamadas. Manter o canal aberto é o mais indicado, mas para declarar uma fila não há a necessidade de abrir e fechar diversos canais. Além disso, objetos criados utilizando a biblioteca são correlacionados ao canal que foi usado para cria-los. Caso o canal esteja fechado, utilizar este objeto pode dar um erro indicando que o canal esta fechado, quebrando assim a aplicação e talvez tendo a necessidade de redeclarar o objeto para que ele seja associado a outro canal.

Para ajustar, vamos modificar o método de declarar para também receber um channel como argumento tendo o valor default como `None`. Quando a intenção for somente declarar o exchange, o channel pode ser passado como `None` pois é criado um novo dentro da função para somente declarar o exchange. Caso seja passado um valor no parâmetro channel, vamos declarar o exchange utilizando este canal e retornar o exchange criado. Vou aproveitar este ajuste e adicionar **type hint** nos parâmetros/retorno que ficaram sem.

{{<figure src="images/05_declare_fanout_exchange_refactored.png" title="Método Declare Fanout Exchange Ajustado" legend="Método Declare Fanout Exchange Ajustado">}}

Agora vamos ajustar o método `bind_queues_to_fanout_exchange` para passar o canal criado por parâmetro no método `declare_fanout_exchange` e então utilizar o exchange retornado para fazer o bind. Também vou aproveitar e adicionar uma facilidade para conservar recursos e aumentar o desempenho (lembrando da explicação logo acima sobre os canais) quando for declarar diversas filas para o exchange.

{{<figure src="images/06_bind_queues_to_fanout_refactored.png" title="Método Bind Queue to Fanout Exchange Ajustado" legend="Método Bind Queue to Fanout Exchange Ajustado">}}

Estamos utilizando o exchange para fazer o bind da fila ao invés do nome do exchange. Neste caso, nada muda entre utilizar o nome ou o exchange. Por debaixo dos panos, a biblioteca irá pegar o nome do exchange (string) para enviar para o RabbitMQ. Acabamos utilizando somente para respeitar a refatoração e deixar mais explicito qual o exchange devemos fazer o bind.

Uma tarefa para você: eliminar a duplicação da declaração de fila nos métodos do RabbitClient.

## Publicação

Ainda vamos modificar o RabbitClient um pouco mais. Precisamos agora criar um novo método para publicar utilizando fanout como routing key. Este método será parecido com o o método de publicar numa fila diretamente, a diferença é que não vamos precisar declarar a fila e sim o exchange. O método vai receber a mensagem a ser publicada e o routing key que nada mais é do que o nome do exchange.

{{<figure src="images/07_publish_fanout.png" title="Método Publish Fanout" legend="Método Publish Fanout">}}

A publicação não tem muito segredo, ela é diferente somente o que declaramos para garantir que exista no broker.

## Ajustando a API

Como o pedido também vai para a contabilidade, é necessário enriquecer um pouco mais a mensagem enviada. Além de alterar a API para que seja enviado uma mensagem para o fanout.

Para enriquecer a mensagem, vamos adicionar uma função para calcular um número aleatório entre 5 e 25 com duas casas decimais para simular que recuperamos o valor do banco de dados. Depois vamos converter este número para string (fica mais simples para trabalhar com valores monetários) para então fazer o dump do dict para json. Por último, trocaremos a função `publish_direct` para `publish_fanout` sem alterar os parâmetros passados pois elas possuem a mesma assinatura.

{{<figure src="images/08_update_api.png" title="Ajuste na API" legend="Ajuste na API">}}

## Consumo Contabilidade

Agora sim vamos criar o consumir para a contabilidade. A título de simulação vamos fazer o consumidor de contabilidade igual da cozinha: ao consumir a mensagem vinda pelo fanout, a fila da contabilidade vai simular um tempo de processamento fazendo de conta que o pedido está sendo gravado no sistema e por último vai fazer o ack na mensagem.

Vou pegar o mesmo código que fizemos no último artigo para o worker de consumo da cozinha e a partir deste código alterar para simular o sistema de contabilidade.

Primeiro eu vou copiar o arquivo do consumidor da cozinha `kitchen_consumer.py`, cola-lo e então renomear para `accountant_consumer.py`. No código do consumidor, vamos precisar adicionar a declaração do fanout juntamente com o bind da fila da contabilidade. Para isso vamos invocar a função `bind_queues_to_fanout_exchange` passando uma lista de filas somente com o nome `account_system` e o nome do fanout exchange `order_fanout`. Em seguida, podemos utilizar a função `consume` diretamente, pois este consumer não terá a necessidade de utilizar o client para enviar novas mensagens, ou seja, não iremos mais precisar do `partial` igual fizemos no consumidor da cozinha para também passar o client como argumento. Na imagem abaixo está o conteúdo total do consumidor da contabilidade:

{{<figure src="images/09_accountant_consumer.png" title="Consumir da Contabilidade" legend="Consumir da Contabilidade">}}

A parte de consumo mesmo sendo um fanout, permanece a mesma. O que mudou até agora foi o pré requisito para consumir as mensagens da fila, visto que elas precisam fazer o bind com o fanout exchange.

A partir deste momento já podemos testar a API e o consumidor recém criado. Vou fazer estes testes quando tudo tiver pronto pois ainda falta ajustar o consumidor da cozinha.

## Ajuste Consumidor da Cozinha

O ajuste necessário no consumidor da cozinha é apenas fazer o bind da fila `kitchen` com o exchange, igual fizemos ao criar o consumidor da contabilidade. O restante irá permanecer o mesmo. Também vou mostrar o conteúdo total do consumidor:

{{<figure src="images/10_kicthen_consumer.png" title="Consumir da Contabilidade" legend="Consumir da Contabilidade">}}

Finalizamos todo o código, mas gostaria de trazer umas curiosidades. As filas que fizemos o bind no fanout exchange também continuam com o bind no direct padrão porque todas as filas criadas no RabbitMQ fazem, automaticamente, o bind no exchange padrão. Este comportamento também se aplica se fizermos mais binds a outros exchanges, a mesma fila vai receber a mensagem de diversos exchanges que ela fez o bind.

Outro ponto curioso é que caso você tenha a fila da cozinha previamente criada, ao declarar o bind (igual ajustamos aqui), o RabbitMQ vai fazer o bind com o exchange de fanout que criamos sem nenhum problema. Nenhum erro será lançado pois podemos fazer inclusive outros binds em filas previamente criadas. O único problema que pode ocorrer é tentar declarar uma fila com características diferentes das que são utilizadas no client, mas se você está acompanhando até aqui, você não irá passar por este problema.

## Validando o Funcionamento pelo Admin do RabbitMQ

Para validar, suba o docker composer do projeto para que o RabbitMQ seja executado:

```sh
docker compose up -d
```

Então suba cada componente e uma janela de terminal diferente para que possamos ver os logs dos consumidores e da API. Cada um dos comandos abaixo devem ser executados em janelas diferentes do seu terminal:

```sh
fastapi dev
python kitchen_consumer.py
python account_consumer.py
```

Com os componentes levantados, os consumidores já irão se conectar no RabbitMQ e fazer os binds das filas ao fanout que foi criado. Podemos verificar as conexões clickando na aba **Connections** na interface administrativa do RabbitMQ:

{{<figure src="images/11_admin_connections.png" title="Aba Connections no ADM do RabbitMQ" legend="Aba Connections no ADM do RabbitMQ">}}

Repare que cada conexão tem 2 canais abertos, um canal é utilizado para consumir as mensagens e outro para publicar mensagens. Mesmo que um dos consumidores não utilize a publicação, o canal para publicar ainda assim é criado ao iniciar o RabbitClient. Aqui temos mais uma oportunidade de melhoria que deixarei de dever de casa para você.

Antes de mostrar o fanout exchange criado, eu vou mostrar as filas. Devemos ter 3 filas: uma para cozinha, uma para entrega dos lanches e outra para o sistema de contabilidade.

{{<figure src="images/12_admin_queues.png" title="Aba Queues no ADM do RabbitMQ" legend="Aba Queues no ADM do RabbitMQ">}}

Abrindo a fila do sistema de contabilidade para mostrar os detalhes, conseguimos ver que existem dois binds nela: um do direct (onde todas as filas fazem bind automaticamente) e o bind do fanout que criamos.

{{<figure src="images/13_admin_queue_detail.png" title="Detalhe de uma Fila" legend="Detalhe de uma Fila">}}

Clickando na aba exchanges, podemos ver o `order_fanout` que foi criado:

{{<figure src="images/14_admin_exchanges.png" title="Aba Exchanges no ADM do RabbitMQ" legend="Aba Exchanges no ADM do RabbitMQ">}}

Nos detalhes do `order_fanout` podemos ver quais as filas fizeram o bind nele:

{{<figure src="images/15_exchange_detail.png" title="Aba Exchanges no ADM do RabbitMQ" legend="Aba Exchanges no ADM do RabbitMQ">}}

Agora que verificamos que tudo esta correto, podemos realizar o pedido de um lanche para testar. Vou fazer algumas chamadas na API e colar os outputs dos consumidores aqui:

{{<figure src="images/16_output_kitchen.png" title="Output do Consumidor da Cozinha" legend="Output do Consumidor da Cozinha">}}

{{<figure src="images/17_output_accountant.png" title="Output do Consumidor da Contabilidade" legend="Output do Consumidor da Contabilidade">}}

Lembre-se que as mensagens são publicadas com prioridades aleatórias, mas você pode perceber que todos os consumidores receberam uma copia da mensagem publicada no fanout e a processou de acordo com as regras de cada um.

Achou que eu ia terminar sem desafio né? O desafio deste artigo é um pouco mais simples. Faça o bind de mais uma fila no fanout exchange para que alguma outro sistema possa processar o "evento" de pedido feito. Incremente os valores do pedido se for necessário

Todo o código que fizemos neste artigo está disponível neste {{<externalnewtab src="https://github.com/elyssonmr/article_rabbitmq/tree/fanout_exchange" title="repositório">}}.

# Conclusão

Neste artigo exploramos o Fanout Exchange, uma forma de publicar uma única mensagem e entregá-la para diversas filas de uma só vez. Diferentemente do exchange padrão, o fanout precisa ser declarado e as filas interessadas precisam fazer o bind com ele, criando assim um cenário de Publish/Subscribe onde todos os inscritos recebem uma cópia idêntica da mensagem.

Evoluímos o exemplo da lanchonete:

* Criamos os métodos no RabbitClient para declarar o fanout exchange e fazer o bind das filas nele;
* Refatoramos a declaração para reaproveitar um único canal, evitando o custo de abrir e fechar canais desnecessariamente;
* Adicionamos a publicação via fanout e enriquecemos a mensagem enviada pela API;
* Criamos o consumidor da contabilidade e ajustamos o consumidor da cozinha para receberem a mesma mensagem de pedido;
* Validamos os binds, o exchange e o consumo das mensagens pela interface administrativa do RabbitMQ.

Assim como outras formas de publicar mensagens no RabbitMQ, o ponto mais interessante é o desacoplamento que ele traz: quem publica não precisa saber quem vai consumir a mensagem. Adicionar um novo sistema interessado no evento de "pedido feito" custa apenas mais um bind, sem nenhuma alteração no código de quem publica. Por outro lado, como todas as filas recebem a mesma mensagem, o fanout não serve quando é necessário rotear mensagens diferentes para consumidores diferentes. Para estes casos, o RabbitMQ oferece outros tipos de exchange que vamos explorar nos próximos artigos.

Aproveite o desafio proposto no artigo para praticar como criar filas, publicar mensagens e até mesmo desenvolver um pouco mais o exemplo que fizemos. Você pode partir do {{<externalnewtab src="https://github.com/elyssonmr/article_rabbitmq" title="repositório">}} para praticar.
