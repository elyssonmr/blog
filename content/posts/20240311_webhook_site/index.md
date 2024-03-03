---
title: "Teste de comunicação assíncrona utilizando webhook.site"
date: "2024-03-12T12:00:00-03:00"
draft: false
sidebar: true
slug: 20240312_webhook_site
thumbnail:
  src: "img/thumbnails/20240311_webhook_site.png"
  visibility:
    - list
categories:
  - "Testes Software"
tags:
  - "Testes"
  - "Tutorial"
  - "Webhook"
---

Existem diversas formas de se comunicar assincronamente entre sistemas internos de uma empresa ou até mesmo externos. Hoje em dia muito se fala a respeito de emails (para notificar usuários), menssageria com o [RabbitMQ](https://en.wikipedia.org/wiki/RabbitMQ) e [webhooks](https://en.wikipedia.org/wiki/Webhook). Neste artigo vou explorar sobre o que são os webhooks e também mostrar uma ferramenta que facilita os testes da sua aplicação que dispara webhooks.

<!--more-->

## Introdução

Algumas aplicações precisam possuir recursos para disparar notificações indicando que alguma ação foi executada ou até mesmo notificações via email (normalmente quando é para o usuário). Isso é bem comum em aplicações que possuem processos assíncronos ou demorados, como, por exemplo, geração de algum relatório mais complexo, invocação de algum outro sistema assíncrono e até mesmo tarefas mais pesadas.

Existem diversas maneiras de adicionarmos algum recurso para testar as notificações dos processos assíncronos da aplicação. Quando a notificação for para um usuário, podemos adicionar o nosso próprio email, realizar o processo que irá disparar a notificação e verificar o email com a notificação. Até ai tudo bem né? Já para requisições em que seja necessário um endpoint fica um pouco mais complicado de testar pois é necessário que alguma outra aplicação receba chamadas HTTP em um endpoint que retorne algum tipo de sucesso indicando que recebeu a requisição. Como podemos fazer para verificar a notificação para outra aplicação? Como iremos prover um endpoint para verificarmos que a notificação foi disparada corretamente?

Já passei por este problema no passado e demos algumas voltas para efetivamente resolve-lo da forma que precisávamos. As técnicas que já usamos envolve:

- Utilização do site [httpbin](https://httpbin.org/) foi muito bom para testar a funcionalidade que gostaríamos na época. Dependendo da url que passarmos para a nossa aplicação o [httpbin](https://httpbin.org/) retorna um sucesso ou um erro, isso nos ajudou muito a garantir a nossa funcionalidade. Porém, tínhamos um grande problema: Como garantimos que o corpo da notificação foi o correto? O site não nos permite inspecionar o corpo da chamada que fizemos.
- Criação de um aplicativo para receber essas chamadas. Na época trabalhávamos bastante com Docker e resolvemos fazer uma aplicação simples HTTP que imprimia as chamadas realizadas, além de retornar um sucesso ou algo que configurávamos para retornar. O grande problema desta aplicação é que ela era muito simples, não era muito ágil alterar qual a resposta deveria ser retornada e olhar qual foi o corpo enviado, muito disso porque não dedicamos muito tempo planejando a aplicação.

Nosso problema foi resolvido, mas ainda assim era um pouco complicado de utilizar essas soluções.

## Utilizando o webhook.site

Recentemente me indicaram uma ferramenta que ajuda bem neste problema, o [webhook.site](https://webhook.site/). Ela nos permite criar um novo identificador único que irá gerar uma URL e um email para o disparo de notificações via HTTP ou via email. Desta forma conseguimos testar as as funcionalidades de notificação das nossas aplicações. A imagem a seguir mostra a tela inicial com a URL e o email que foi criado:

{{< figure src="images/webhook_site.png" title="Página inicial do webhook.site" legend="Página inicial do webhook.site" >}}

A ferramenta possui diversos recursos muito interessantes. Os recursos que vamos explorar são os oferecidos gratuitamente.

O recurso de adicionar uma resposta customizada para quando um endpoint é chamado é bem útil para testar alguns cenários das chamadas de notificação. Para configurar a resposta basta clicar em *edit* no canto superior direito da página:

{{< figure src="images/webhook_edit_bar.png" title="Barra com o botão de edição do site" legend="Barra de edição do webhook.site" >}}

No popup que será exibido, iremos configurar os detalhes da resposta. Podemos configurar:

- O **Status Code** que será retornado → para podermos simular diversos tipos de resposta e testar fluxos de erros quando o callback é enviado;
- O **Content Type** →para podermos simular diversos tipos de conteúdo diferente (normalmente APIs utilizam o Content Type: **application/json**);
- O **Timeout** antes que a ferramenta envie a resposta → para podermos simular um tempo de resposta mais elevado da notificação. Esta funcionalidade é bem útil para testar o comportamento do fluxo quando timeouts ocorrerem;
- O **Response Body** → campo de texto para configurarmos a mensagem que vai ser retornada quando chamarmos qualquer endpoint com a URL. No response também podemos utilizar algumas variáveis que são fornecidas pela ferramenta. Por enquanto não iremos usar nenhuma, mas fique a vontade para explora-las.

Com o entendimento dos campos, vamos criar uma resposta customizada? Exemplo de resposta customizada criada para indicar que a notificação foi com sucesso:

{{< figure src="images/webhook_edit_form.png" title="Formulário de edição de respostas" legend="Formulário de edição de respostas" >}}

Na resposta de qualquer chamada, iremos retornar o **Status Code 202**, com o **Content Type** **“application/json”**, a ferramenta **vai esperar 2 segundos** antes de retornar a resposta e o corpo da resposta será **{"message": "ok"}**.

## Testando o endpoint disponibilizado

Para demonstrar a ferramenta, vamos fazer um teste simples utilizando o [Postman](https://www.postman.com/)? Em um próximo artigo podemos simular alguma funcionalidade através de uma aplicação, mas por enquanto nosso objetivo é apresentar a ferramenta.

Para realizar um teste, precisamos abrir alguma ferramenta que realize requisições HTTP. Aqui no artigo vamos utilizar o [postman](https://www.postman.com/), mas fique a vontade para utilizar a ferramenta que esteja mais acostumado.

Antes de qualquer coisa, vamos copiar a URL que a ferramenta forneceu. A URL apresenta o seguinte padrão:

```jsx
https://webhook.site/{CODIGO_GERADO}
```

O código é um UUID gerado na hora que você abrir a página a primeira vez, ou seja, o código que iremos utilizar ao longo do artigo não deve ser o mesmo gerado para você.

Após copiar a URL, vamos abrir o [Postman](https://www.postman.com/) e criar uma nova requisição. A requisição que iremos utilizar para testar contém as seguintes características:

→ A requisição irá para o endpoint ***https://webhook.site/{CODIGO_GERADO}/notification*** com o verbo **POST**:

{{< figure src="images/postman_request.png" title="Requisição utilizando o Postman" legend="Requisição utilizando o Postman" >}}

→ Vamos adicionar um Header customizado chamado **custom-header**:

{{< figure src="images/postman_request_custom_header.png" title="Header customizado utilizando o Postman" legend="Header customizado utilizando o Postman" >}}

→ O body da mensagem será um JSON com o conteúdo:

{{< figure src="images/postman_request_body.png" title="Body utilizando o Postman" legend="Body da request utilizando o Postman" >}}

Esta requisição gerou o seguinte CURL:

```bash
curl --location --request POST 'https://webhook.site/2cf94531-a9cc-41fd-81af-e23454341e93/notification' \
--header 'custom-header: my-custom-header' \
--header 'Content-Type: application/json' \
--data-raw '{
    "kind": "test",
    "message": "My first notification using webhook.site"
}'
```

Configurada a requisição, vamos dispara-la? No Postman, basta clicar no botão *Send* que ele fará a requisição para o [webhook.site](https://webhook.site):

{{< figure src="images/postman_response.png" title="Requisição utilizando o Postman" legend="Requisição utilizando o Postman" >}}

Prontinho!! Realizamos a nossa requisição para o [webhook.site](http://webhook.site) que aguardou dois segundos para então retornar uma resposta para nós. Vale ressaltar que o valor de espera configurado não significa que seja o valor total da request, pois ainda existe um tempo para que seja processado a requisição enviada e a resposta, tanto do Postman quanto do webhook.site.

No webhook.site, a requisição realizada vai aparecer do lado esquerdo da tela. Caso não apareça recarregue a página tomando cuidado para não alterar a URL (para não perder o código gerado, caso perca será necessário realizar uma nova requisição para o novo código gerado). Ao clicar sobre ela é exibido os detalhes da requisição conforme a imagem abaixo:

{{< figure src="images/webhook_request.png" title="Detalhes da request recebida pelo webhook.site" legend="Detalhes da request recebida pelo webhook.site" >}}

Na imagem podemos ver os detalhes das requisição tais como o verbo da requisição (destacado em verde), URL que recebeu a requisição disparada (destacado em verde), corpo da requisição enviado (destacado em amarelo), headers (destacado em vermelho), query strings (destacado em azul), campos da querystring/formulários (destacado em azul) e etc. Com estas informações podemos validar se a requisição da aplicação foi realizada com os valores corretos.

Também temos disponível a exportação da requisição através da opção **Export as**. A visualização do conteúdo de forma **crua** através da opção **Raw content**. Por último podemos gerar um link permanente para essa requisição através da opção "Permalink" (muito útil para adicionar em algum documento de evidências).

Com esses recursos gratuitos já podemos realizar diversos testes das nossas APIs e verificar se o conteúdo foi enviado corretamente.

## Testando com o email disponibilizado

O webhook.site também suporta a validação de emails. Alguns sistemas possuem o envio de email como forma de notificar o usuário que algo foi realizado, confirmar alguma ação e etc. Para testarmos o envio de email vamos precisar enviar um email para o endereço que foi disponibilizado na tela inicial do site. Podemos copiar o endereço e iremos utilizar um email pessoal para poder testar o funcionamento da ferramenta.

{{< figure src="images/webhook_email.png" title="Envio de email para o webhook.site via Gmail" legend="Envio de email para o webhook.site via Gmail" >}}

A imagem acima é um print do email que estou enviado para o website.hook através do Gmail.

Depois de alguns instantes um novo email será disponível na ferramenta e ao clicar nos detalhes será exibido uma tela conforme a imagem abaixo:

{{< figure src="images/webhook_email_details.png" title="Detalhes do email recebido no webhook.site" legend="Detalhes do email recebido no webhook.site" >}}

**OBS**: Os dados que envolvem um email são muito maiores do que os dados de uma notificação HTTP. Mas não precisa se assustar que muitos destes dados são informações utilizadas para que as ferramentas de email possam se localizar e montar o email adequadamente.

Na imagem acima, podemos verificar algumas informações bem legais sobre o email que acabamos de enviar, tais como os detalhes do envio de email (destacado em amarelo), os cabeçalhos do email (destacado em azul), arquivos enviados (destacado em verde), a mensagem em forma de texto (destacado em vermelho) e o conteúdo "cru" (destacado em rosa).

Normalmente não precisamos nos preocupar com o conteúdo “cru” do email pois contém muitas informações referentes ao protocolo de troca de emails.

**OBS**: alguns textos estão borrados na imagem para omitir o endereço de email utilizando para enviar o email de teste.

Assim como no detalhamento de requisição, também podemos pegar o link permanente (através da opção "Permalink") para o caso de ser necessário adicionar em algum documento de evidências e também ver o conteúdo "cru" (através da opção "Raw Content").

## Conclusão

O teste envolvendo integrações de sistemas pode ser algo bem complicado de fazer pois na maioria dos casos não temos um “container” do sistema para utilizarmos. As vezes nem é bem possível usar um container pois é um sistema de terceiros que não temos acesso a uma versão para testes.

Para realizar testes em que são disparadas chamadas HTTP podemos utilizar diversas ferramentas e cada uma delas nos permite testar um aspecto da chamada. A ferramenta [webhook.site](http://webhook.site) nos auxilia a garantir que a chamada foi com os dados corretos. Nela podemos, inclusive, criar uma resposta padrão para podermos testar retornos diferentes e também podemos setar timeouts para testarmos esse comportamento. Desta forma conseguimos garantir diversos comportamentos dentro da nossa aplicação.

Algumas funcionalidades exigem o envio de email com algum relatório gerado ou somente uma notificação sem arquivos anexados. Também podemos utilizar a ferramenta [webhook.site](http://webhook.site) para garantir o conteúdo destes emails.

No próximo artigo sobre esta ferramenta, vamos criar uma aplicação (provavelmente usando Python) para exemplificar a ferramenta em um caso mais próximo do real.
