---
title: "Mensageria com RabbitMQ - Direct"
date: "2026-05-16T12:00:00-03:00"
draft: false
sidebar: true
slug: 20260616_direct_consume
thumbnail:
  src: "img/thumbnails/20260616_direct_consume.jpg"
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

Publicar mensagens diretamente em uma fila é uma das diversas maneiras que o RabbitMQ suporta. Neste artigo vamos continuar o assunto do [último artigo]({{< ref "/20260505_rabbitmq_introduction" >}}) falando sobre RabbitMQ e explorar com um exemplo prático.

<!--more-->


# Introdução

O RabbitMQ possui diversas maneiras de publicarmos uma mensagem, hoje vamos explorar a forma mais simples de publicar que é via exchange default do tipo Direct. Em seguida, vou mostrar um exemplo para vocês de como utilizado.

# Direct Exchange

Recapitulando do [último artigo]({{< ref "/20260505_rabbitmq_introduction#exchange-direct-id" >}}), o exchange direct publica uma mensagem direto em uma fila, ou seja, a Routing Key deve ser o nome da fila.

Este exchange, por ser o padrão, já vem criado. Não há a necessidade de declara-lo. Somente vamos precisar declarar a fila, caso ela ainda não exista. Quando falarmos chegarmos no exemplo prático, vamos detalhar mais como declarar e algumas configurações que podemos fazer.

Para muitos cenários publicar diretamente na fila pode ser o suficiente. Ainda neste artigo vamos desenvolver um exemplo utilizando esta forma de publicar.

# Exemplo Prático

Para montarmos um cenário de um sistema, vamos pensar em uma lanchonete a qual podemos fazer pedidos de lanches. Nós vamos escolher um lanche no menu, ligar na lanchonete, fazer o pedido, então aguardar ele ficar pronto e ser entregue. O fluxo do processo inicial seria assim:

{{<figure src="images/01_order_flow.png" title="Fluxo de pedido de lanches" legend="Fluxo de pedido de lanches">}}

Como a lanchonete recebe diversos pedidos a cozinha não vai conseguir fazer todos ao mesmo tempo. Por este motivo uma fila de preparação dos pedidos é criada para que ela consiga ir preparando os lanches dos clientes, de tal forma que a medida que for terminando os lanches, ela consiga pegar os próximos e assim por diante. No fluxo que desenhamos este seria o passo 4, onde o atendente da lanchonete anota em um papel o pedido e adiciona na fila de produção da cozinha.

Nós vamos montar o nosso exemplo de código a partir deste item. Para ficar um pouco mais completo, vamos também adicionar uma mensagem para a fila de entrega dos lanches. O racional aqui é identifico ao da cozinha, os entregadores são limitados e eles não podem sair com todos os lanches para realizar as entregas. Eles iniciam as entregas somente com alguns lanches para que eles não cheguem frio na casa dos clientes e também não precisem fazer um percurso muito longo.

{{<figure src="images/02_delivery_flow.png" title="Fluxo de entrega de lanches" legend="Fluxo de entrega de lanches">}}

Com fluxo completo, podemos agora planejar como vamos codificar:

* Primeiro, vamos criar o client que irá se comunicar com o RabbitMQ utilizando uma lib async chamada de [aio-pika](https://docs.aio-pika.com/) (sem quinta série por favor hahahahaha). Vamos implementar a publicação de mensagem e o consumo. Nós vamos evoluindo este client ao longo do artigo;
* Depois, vamos montar um método no client para publicar uma mensagem. Este método vai receber uma string com a mensagem, a routing key e a prioridade (vamos falar mais sobre isso quando estivermos desenvolvendo o método);
* O terceiro passo, vai ser fazer a API que irá receber o pedido e adicionar uma mensagem na fila para a cozinha preparar o lanche;
* Entrando na parte de consumir, vamos montar um consumidor que representara a cozinha. Ele vai pegar até 5 pedidos (mensagens da fila) ao mesmo tempo e irá prepara-los para serem despachados para os clientes (uma nova mensagem na fila de entregas);
* Por último, é necessário criar mais um consumidor para representar as entregas dos pedidos. Esta etapa eu vou deixar contigo para praticar;

Meu objetivo é explicar o funcionamento da publicação e consumo de mensagens no RabbitMQ. Por isso vou tomar algumas decisões de design que vão privilegiar o entendimento e praticidade do que melhores práticas para aplicações reais. Este é um convite para você pegar os exemplos feitos aqui e amplia-los com mais detalhes para estudar mais, ok?

Antes de iniciarmos o projeto, eu quero falar quais dependências vamos utilizar. A instalação de todas poderá ser via pip install no python 3.14.x para facilitar a configuração do projeto ou utilizando o poetry. Vou pinar as versões pois pode ser que no futuro as bibliotecas sejam drasticamente alteradas.

```
fastapi[standard]==0.136.3
aio-pika==9.6.2
```

Agora estamos prontos para começar!

## RabbitClient

Para iniciar, vamos criar um arquivo chamado `rabbit_client.py`, nele vamos declarar uma classe com o nome `RabbitMQClient`. No construtor da classe, vamos inicializar um atributo chamado `_conn` com o valor `None`, `_publish_channel` com o canal que vamos utilizar para publicar mensagens. também vamos precisar do loop para utilizarmos ele na conexão. Este loop vai ser utilizado para inicializar a conexão no método `start`. Não é necessário passar o loop caso você queira utilizar o loop que está sendo executado no momento.

Agora vamos criar o método `start` sendo async para inicializar a conexão com o RabbitMQ. Não inicializamos a conexão logo no `init` porque precisamos utilizar chamadas async para isso. Por este motivo, o `init` somente cria os atributos privados da conexão e recebe o loop (ou inicializa ele). No método `start`, vamos criar uma nova conexão da biblioteca do Pika (sem quinta série hehehe) e já criar um canal padrão que vamos utilizar para publicar as mensagens nas filas.

Para instanciar uma conexão, nós vamos utilizar o `connect_robust` da biblioteca (agora não triguei a sua quinta série hahaha). Devemos passar qual a URL desta conexão e o loop que será utilizando por ela. Para a URL da conexão vamos utilizar a URL padrão (estou utilizando um docker compose para subir o serviço do RabbitMQ) do serviço rodando em localhost. Em seguida vamos instanciar um novo canal a partir da conexão criada.

{{<figure src="images/03_client_start.png" title="Init e start do RabbitMQClient" legend="Init e start do RabbitMQClient">}}


Com o `init` e o `start` do `RabbitMQClient` criado vamos criar agora a função de publicar mensagens.

## Publicação

Neste artigo, vamos abordar a publicação utilizando o exchange default, ou seja, vamos utilizar a publicação direta na fila.

Podemos criar uma função que vai receber a mensagem (já convertida para string) e qual a Routing Key que contém o nome exato da fila. Na implementação, vamos adotar algumas boas práticas, como:

* Garantir que a fila esteja declarada. Não podemos publicar mensagem em uma fila não declarada, mas podemos declarar uma fila já existente (contando que sejam com as mesmas características);
* Garantir que a fila seja durável. Uma fila durável é persistida no disco, desta forma se o RabbitMQ for desligado ou reiniciado a fila não será excluída;
* Garantir uma prioridade para a fila. Em muitos cenários que muitas mensagens estão acumuladas, ter uma prioridade maior pode ajudar com operacionais ou outros processos que precisam ser feitos o mais rápido possíveis. Normalmente utilizo 5 níveis, sendo disponibilizado somente quatro níveis para a aplicação utilizar e o quinto nível (e mais prioritário) para casos os quais as mensagens precisam furar a fila;

Estas boas práticas podemos garantir passando parâmetros no momento que declaramos a fila. Se declararmos a mesma fila com a mesma configuração, nenhum erro é retornado, mas se algum parâmetro for diferente, é lançado um erro dizendo que a fila já existe.

Vamos a implementação??

Vamos declarar um método async chamado `publish_direct` que receberá uma string com o conteúdo da mensagem, a routing key que é o nome da fila e a prioridade de 1 a 5, sendo o valor default 1.

Primeiro vamos declarar a fila para garantir que ela exista. Precisamos passar o nome da fila, se elá é durável e qual a prioridade máxima dela. Depois de declarar esta a fila, podemos então criar a mensagem utilizando a classe `Message` da Pika (essa mensagem é Pika hahahahahaha) passando o conteúdo da mensagem e a prioridade. Com a mensagem criada, vamos publica-la utilizando o exchange default.

{{<figure src="images/04_method_publish_direct.png" title="Método de publicação usando o exchange default" legend="Método de publicação usando o exchange default">}}

Agora temos o client que inicia a conexão com o RabbitMQ e também é capaz de publicar mensagens em filas utilizando o exchange default. Com este pré requisito, podemos então criar a API que vai ajudar a simular o pedido de lanches.

## API

Vamos fazer algo bem simples somente para ilustrar como uma mensagem chega. O nosso foco aqui é mais na publicação e consumo das mensagens do que a API.

Para facilitar e ficar um pouco mais didático, vou montar tudo da API em um único módulo Python chamado `api.py`. Nele vamos declarar uma função geradora que vai instanciar o client do rabbitMQ que criamos previamente, inicializar a conexão e "retornar" ele utilizando o `yield` para que possamos utilizar este client em conjunto com o `Depends` do FastAPI (ele vai cuidar do gerenciamento do ciclo de vida desta dependência). Depois vamos criar um tipo, para facilitar o tamanho da declaração que iria ficar de type hint no endpoint. Então criamos um model simples, para então criarmos o endpoint `POST /order` que simulará o pedido.

No endpoint nós vamos receber o pedido, criar um dump dele (converter para dict), criar a variável routing_key com o nome da fila e então vamos publicar a mensagem convertendo o dump para string, passando a routing_key e qual a prioridade. Neste caso vamos fazer a prioridade aleatória para observarmos o comportamento da fila com a prioridade.

{{<figure src="images/05_api.png" title="API para pedir lanche" legend="API para pedir lanche">}}

Para executar, precisamos rodar o comando `fastapi dev api.py` e o servidor de desenvolvimento estará em execução. Agora podemos testar acessando os {{<externalnewtab src="http://localhost:8000/docs" title="docs">}} da aplicação e fazer algumas requests.

Após executar algumas vezes, podemos verificar na interface administrativa do RabbitMQ as mensagens publicadas na fila. para acessar esta interface, precisamos primeiro executar docker compose que está no link do projeto e então abrir a url: {{<externalnewtab src="http://localhost:15672/">}} e logar com o usuário `admin` e senha `admin` (configurados no docker compose).

{{<figure src="images/06_admin_interface.png" title="Interface Administrativa" legend="Interface Administrativa">}}

Somente publicar as mensagens sem um consumidor fará que elas fiquem paradas na fila do RabbitMQ. Agora precisaremos criar um consumidor para a fila de preparo de lanches.

## Consumo

Com as mensagens publicadas, elas precisam ser consumidas, para isso vamos precisar criar um consumidor para esta fila. Levando para o nosso exemplo, o consumidor é um dos cozinheiros da lanchonete. Para simular, vamos adicionar 2 cozinheiros, ou seja, vamos executar dois consumidores para a fila.

Antes, precisamos evoluir um pouco mais a classe RabbitMQClient para adicionar um método que receberá o nome de uma fila e qual função chamar quando houver uma nova mensagem na fila.

Vamos declarar um novo método async chamado `consume`. Ele vai receber os argumentos:

* **queue** -> nome da fila para ser consumida;
* **on_message** -> função que será chamada quando uma mensagem estiver disponível para ser processada;
* **pre_fetch** -> com o valor padrão em 1. Este argumento vai indicar quantas mensagens devem ser retornadas do RabbitMQ por vez. Trazendo para o nosso cenário, quantos lanches um cozinheiro vai fazer por vez;

Dentro do método vamos começar criando um novo canal utilizando um context manager (para que ele seja fechado automaticamente quando o worker encerrar), depois vamos configurar o `prefetch_count` e então declarar a fila igual fizemos no método de publicar. Com a fila declarada, vamos chamar o método consume da fila e então fazer um mecanismo para que o worker possa se encerrar de forma "graciosa".

O código para toda essa explicação é este:

{{<figure src="images/07_method_consume.png" title="Método Consume" legend="Método Consume">}}

Para efetivamente parar o worker de forma "graciosa", ainda falta fechar a conexão no momento que formos desliga-lo graciosamente. Para isso, vamos criar uma nova função async chamada `stop`, nela vamos fechar a conexão com o broker e esperar que ela tenha sido fechada com sucesso:

{{<figure src="images/08_method_stop.png" title="Método Stop" legend="Método Stop">}}

Não esqueça de adicionar a chamada para este método no `except` do consumer e após o `yield` no generator de dependência do FastAPI.

Temos a função que vai realizar as configurações e iniciar o processo de consumo. Agora falta a gente criar a função que irá simular a preparação dos lanches. Para isso, vamos criar um novo módulo chamado de `kitchen_consumer.py`. Nele vamos declarar um main que vai chamar uma função main async dentro de um loop asyncio:

{{<figure src="images/09_consumer.png" title="Consumidor" legend="Consumidor">}}

Agora já somos capazes de consumir as mensagens da fila. Se você executar o consumidor através do comando `python kitchen_consumer.py` ele vai começar a consumir as mensagens da fila. O sleep longo, foi proposital para você ter a chance de simular mais de um cozinheiro.

Para ficar 100% dentro do nosso exemplo, ficou faltando um ponto importante, precisamos disparar uma nova mensagem para a fila de entregas. Existem algumas formas de fazer, a mais fácil é instanciar um novo client durante o processamento da mensagem para conseguirmos enviar a mensagem que precisamos. Porém vamos utilizar uma forma mais elegante que é utilizando {{<externalnewtab src="https://docs.python.org/3/library/functools.html#functools.partial" title="partials">}}. Basicamente vamos criar uma nova função a partir da função `prepare_snack`, onde vamos "parcialmente" passar o argumento com o client do RabbitMQ. Vamos precisar adicionar como primeiro argumento o client. Na função vamos simular a preparação e adicionar a chamada para publicar uma nova mensagem na fila de entregas. Após a declaração, vamos utilizar o partial para criar a nova função. Esta nova função será a que vamos utilizar no método consume do client. O código na integra fica assim:

{{<figure src="images/10_partial.png" title="Implementação do Partial" legend="Implementação do Partial">}}

Pronto, agora temos o nosso consumidor pronto e já publicando uma nova mensagem para a fila de entregas. Não iremos implementar o consumidor da entrega, mas a ideia dele é a mesma: criar uma função que receberá a mensagem, adicionar o código para processar esta mensagem e confirmar o processamento. Neste caso não vejo muitos motivos para utilizar o partial, mas talvez você queria notificar o sistema de pedidos de que o lanche foi entregue e pago. Como desafio, você pode pegar o código atual e implementar este consumidor.

Todo o código que fizemos neste artigo está disponível neste {{<externalnewtab src="https://github.com/elyssonmr/article_rabbitmq" title="repositório">}}.

# Conclusão

Neste artigo exploramos uma forma mais simples de publicar e consumir mensagens no RabbitMQ utilizando o exchange padrão(Direct). Com o exemplo que desenvolvemos podemos exercitar as vantagens que um broker de mensagens trás e entender melhor os conceitos de utilizar um broker.

Ao longo do exemplo, construímos:

* Um cliente para abstrair a comunicação com o RabbitMQ com boas práticas de filas duráveis e com prioridade;
* Uma API para simular os pedidos chegando;
* Um consumidor que processa as mensagens e as adiciona na fila de entrega;

Utilizar o exchange default (direct) é simples, direto e resolve diversos cenários do dia a dia. Porém o RabbitMQ tem mais formas de publicar mensagens que vamos explorar em artigos futuros.

Aproveite o desafio proposto no artigo para praticar como criar filas, publicar mensagens e até mesmo desenvolver um pouco mais o exemplo que fizemos. Você pode partir do {{<externalnewtab src="https://github.com/elyssonmr/article_rabbitmq" title="repositório">}} para praticar.
