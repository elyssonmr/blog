---
title: "Quiz: Fundamentos de Mensageria com RabbitMQ"
date: "2026-11-18T12:00:00-03:00"
draft: false
sidebar: false
toc: false
# Hidden page: rendered and reachable by its URL (/quiz/rabbitmq-fundamentos/),
# but left out of the home page, lists, RSS, sitemap and search engines.
noindex: true
build:
  list: never
sitemap:
  disable: true
---

Você acompanhou a série sobre RabbitMQ? Responda as perguntas abaixo e, se acertar
pelo menos **70%**, receba um certificado de conclusão em PDF.

As respostas são corrigidas no servidor, então não adianta procurar o gabarito no
código da página. 😉

{{< quiz id="rabbitmq-fundamentos" >}}

{{< mcq id="q1" question="Qual é o papel de uma **exchange** no RabbitMQ?" >}}
Armazenar as mensagens até que sejam consumidas
Receber as mensagens dos publicadores e roteá-las para as filas
Consumir as mensagens e processá-las
Garantir que as mensagens sejam persistidas em disco
{{< /mcq >}}

{{< mcq id="q2" question="Em uma exchange do tipo **direct**, como a mensagem é roteada?" >}}
Para todas as filas ligadas à exchange
Com base nos headers da mensagem
Para as filas cuja binding key é igual à routing key da mensagem
Para uma fila escolhida aleatoriamente
{{< /mcq >}}

{{< mcq id="q3" question="Qual tipo de exchange entrega uma cópia da mensagem para **todas** as filas ligadas a ela, ignorando a routing key?" >}}
`fanout`
`direct`
`topic`
`headers`
{{< /mcq >}}

{{< mcq id="q4" question="Em uma exchange **topic**, qual binding key recebe mensagens publicadas com a routing key `pedido.pagamento.aprovado`?" >}}
`pedido.*`
`*.aprovado`
`pedido.pagamento`
`pedido.#`
{{< /mcq >}}

{{< mcq id="q5" question="O que acontece quando o consumidor envia o **ack** de uma mensagem?" >}}
A mensagem é reenviada para outra fila
O RabbitMQ entende que a mensagem foi processada e pode removê-la da fila
A mensagem volta para o início da fila
O publicador recebe a resposta do consumidor
{{< /mcq >}}

{{< /quiz >}}
