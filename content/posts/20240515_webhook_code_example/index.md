---
title: "Exemplo de código da utilização do Webhook Site"
date: "2024-05-13T12:00:00-03:00"
draft: false
sidebar: true
slug: 20240515_webhook_code_example
thumbnail:
  src: "img/thumbnails/default_thumbnail.jpg"
  visibility:
    - list
categories:
  - "Testes Software"
tags:
  - "Testes"
  - "Tutorial"
  - "Software"
  - "Webhook"
---

No [último artigo]({{< ref "/20240311_webhook_site" >}}) falamos sobre o que é o [webhook.site](https://webhook.site/) e como podemos utiliza-lo em nossos testes. Neste artigo vou explorar um exemplo prático do uso webhook sendo enviado para o [webhook.site](https://webhook.site/).

<!--more-->

# Introdução

Após escrever o último artigo, eu fiquei pensando o seguinte: "Puts... faltou um exemplo de código de como um webhook funciona. Que tal escrever um artigo montando um exemplo junto com o [webhook.site](https://webhook.site/)?". Pois bem... estou escrevendo este artigo para montar um exemplo simples e prático da utilização do webhook.

No exemplo, iremos simular um "processamento assíncrono" em um sistema de pagamentos que que ao final irá disparar um webhook na URL informada na request. Claro que iremos informar a URL do [webhook.site](https://webhook.site/) para podermos verificar o que foi enviado.

# O Exemplo Codificado

Neste tópico vou explicar um pouco mais sobre o código do sistema de pagamentos, não se preocupe em entende-lo 100%. Junto no projeto temos um arquivo de docker-compose que irá subir tudo que é necessário para a execução do projeto.

Ahhh... também utilizarei o Postman para realizar algumas requests, mas fique a vontade de utilizar a ferramenta que achar melhor.

O sistema é uma aplicação simples em [Flask](https://flask.palletsprojects.com/) com um endpoint que irá receber o valor, o nome do produto e qual é a URL para notificar que a cobrança foi realizada. Por exemplo:

```json
// POST localhost:5000/payment

{
  "value": 10.99,
  "product": "Pringles",
  "callback_url": "https://webhook.site/{ID_GERADO}"
}
```

A resposta desta requisição irá retornar um "OK, vou processar" com um ID para identificar e o status indicando que está sendo processado. Por exemplo:

```json
{
  "payment_id": "4438a75d-2505-4c5e-913a-e9f72de1bd13",
  "status": "processing"
}
```

O ID é retornado para ser salvo e no futuro quando a notificação ocorrer fazer a correlação do pagamento solicitado.

Após cerca de 5 segundos será disparado uma notificação na URL informado através do campo `callback_url`.

Agora vou explicar um pouco do código. [Clique aqui]({{< relref "#rodando-a-aplicação" >}}) caso queira pular para o tópico da explicação de como executar a aplicação.

# Explicando o Código

O sistema está codificado para subir uma aplicação [Flask](https://flask.palletsprojects.com/) que irá definir o endpoint `/payment`. O endpoint recebe os dados de pagamentos conforme definido acima, o campo `callback_url` será validado se ele existe (não há validação se realmente é uma URL), então é chamado a tarefa assíncrona para simular o processamento demorado do pagamento e por último é retornado a resposta indicando que o pagamento será processado.

{{< figure src="images/flask_app.png" title="Definição da aplicação Flask" legend="Definição da aplicação Flask" >}}

A biblioteca [APScheduler](https://pypi.org/project/APScheduler/) está sendo utilizada para simular o processamento assíncrono demorado. Para isso criamos uma configuração inicial do APScheduler a qual ele irá armazenar os dados em memória para execução.

{{< figure src="images/apscheduler_config.png" title="Configuração do APScheduler" legend="Configuração do APScheduler" >}}

A tarefa que o nosso scheduler irá executar é bem simples. Ela irá dormir durante 5 segundos e então montar a resposta para ser disparada para a URL informada no campo `callback_url`.

{{< figure src="images/task_def.png" title="Definição da tarefa" legend="Definição da tarefa" >}}

Observe que quando executamos a tarefa no endpoint ela será imediatamente executada, não é disparado o webhook de imediato por causa que existe o `sleep` de 5 segundos.

# Rodando a Aplicação

No [repositório da aplicação](https://github.com/elyssonmr/webhook_blog_post) existe um `docker-compose` para facilitar a execução da mesma. Neste caso não há a necessidade de ter o [interpretador da linguagem Python](https://www.python.org/) instalado na sua máquina, mas será necessário ter o [Docker](https://docker.com) instalado.

Para executar com o Docker (estou considerando que você tenha a versão mais recente) rode o comando no seu terminal:

```shell
$ docker compose up -d
```

Pronto!! a aplicação está rodando!!

Caso tenha o python e queira rodar direito do código, primeiro será necessário instalar as dependências para depois executar a aplicação. Para instalar as depedências execute o comando:

```shell
$ pip install -r requirements.txt
```

E então rode a aplicação:

```shell
$ python main.py
```

Pronto!! a aplicação está rodando!!

# Simulando um pagamento

Vamos simular um pagamento utilizando o [webhook.site](https://webhook.site/). Primeiro precisamos acessa-lo para que ele gere uma nova URL única para utilizarmos nos nossos testes. Aqui gerou a url: [**https://webhook.site/2427bba8-211d-4d3e-a19f-85f3ab2a05e9**](https://webhook.site/2427bba8-211d-4d3e-a19f-85f3ab2a05e9) (quase certeza que ela não estará disponível caso você acesse). Caso esteja com dúvida nesse passo, consulte o [último artigo]({{< ref "/20240311_webhook_site" >}}).

Com a URL gerada, abra [Postman](https://www.postman.com/) para montarmos uma nova requisição. Para facilitar, estou disponibilizando uma {{< assetnewtab src="assets/WebhookExample.postman_collection.json" title="Collection">}} com a requisição pronta.

{{< figure src="images/postman_request.png" title="Request realizada pelo Postman" legend="Request realizada pelo Postman" >}}

Após alguns instantes será disparado o webhook contendo o resultado do processamento. Lembrando que na aplicação de exemplo não ocorre efetivamente o processamento e sim um `sleep` para simular um processamento pesado.

Pelo console no terminal que estamos rodando a aplicação, podemos ver os prints que são utilizados no código durante o processamento da tarefa:

{{< figure src="images/terminal_prints.png" title="Prints indicando o processamento" legend="Prints indicando o processamento" >}}

Depois de "finalizado o processamento" o tempo (no código está configurado com 5 segundos), será realizado uma request para a URL informada. Caso ela esteja correta, o resultado será exibido no site do webhook, contendo as informações sobre as requisição realizada. No site é exibido alguns dados sobre a request realizada, como o corpo da mensagem.

{{< figure src="images/webhook_request.png" title="Visualização do webhook no webhook.site" legend="Visualização do webhook no webhook.site" >}}

Com isso nós concluímos a simulação do pagamento. Recomendo que você realize outros testes utilizando valores diferentes, tempo de espera do processamento diferentes e etc.

# Conclusão

Neste artigo vimos um exemplo prático de como utilizar o [webhook.site](https://webhook.site/) para realizar testes de webhooks utilizando uma interface amigável que apresenta todos os dados da requisição.

Utilizando a ferramenta conseguimos validar os fluxos de aplicações que utilizam webhooks de uma maneira simples, sendo possível tirar prints com todos os dados disparados para adicionar como evidência de testes.

Em sistemas que possuem processamentos demorados, é bem comum encontrarmos mecanismos de disparo de webhooks para notificarem que o processamento foi concluído. O sistema criado para simularmos o comportamento é muito simples, mas ele consegue simular bem o processo de disparo de webhook.

Um ponto que vale citar aqui é que não estamos aplicando boas práticas de segurança no disparo do webhook para que o exemplo fique mais fácil de ser compreendido. O meu objetivo foi demonstrar uma simulação da técnica com a utilização de uma ferramenta que nos auxilia durante a execução de testes envolvendo webhooks.

Projeto no Github: [https://github.com/elyssonmr/webhook_blog_post](https://github.com/elyssonmr/webhook_blog_post)

Collection do Postman: {{< assetnewtab src="assets/WebhookExample.postman_collection.json" title="WebhookExample.postman_collection.json">}}
