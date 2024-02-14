---
title: "Utilizando o webhook.site"
date: 2023-04-05T17:45:39-03:00
draft: true
toc: true
---

# Hello

## Introdução

Algumas aplicações possuem um recurso de disparar notificações para indicar que alguma ação foi executada ou até mesmo notificações via email. Isso é bem comum em aplicações que possuem processos assíncronos, como por exemplo: geração de algum relatório mais complexo, invocação de algum outro sistema assíncrono e até mesmo tarefas mais pesadas.

Existem diversas maneiras de adicionarmos algo que irá receber esta notificação (tanto via email quanto chamar um endpoint de alguma outra aplicação). O mais comum para email é adicionar o email próprio, disparar a notificação e verificar o email. Já para requisiçõesem que é necessário um endpoint fica um pouco mais complicado de testar pois é necessário que alguma outra aplicação receba em um endpoint uma requisição HTTP retorne uma resposta de sucesso necessário para ser considerado sucesso.

Para o caso da chamada via algum endpoint, já utilizei algumas técnicas no passado que me ajudaram a resolver o problema de notificar, mas não me ajudou 100% no que precisava:

- Utilização do site [httpbin](https://httpbin.org/) foi muito bom para testar a funcionalidade que gostaríamos na época. Dependendo da url que passarmos para a nossa aplicação o [httpbin](https://httpbin.org/) retorna um sucesso ou um erro, isso nos ajudou muito a garantir a nossa funcionalidade. Porém, tínhamos um grande problema: Como garantimos que o corpo da notificação foi o correto? O site não nos permite inspecionar o corpo da chamada que fizemos.
- Criação de um aplicativo para receber essas chamadas. Na época trabalhávamos bastante com Docker e resolvemos fazer uma aplicação simples HTTP que imprimia as chamadas realizadas além de retornar um sucesso ou algo que configurávamos para retornar. O grande problema desta aplicação é ela ser bem simples, não era muito ágil alterar qual a resposta deveria ser retornada e olhar qual foi o corpo enviado, muito disso porque não dedicamos muito tempo planejando a aplicação.

Recentemente me indicaram uma ferramenta que ajuda bem neste problema, o [wehook.site](https://webhook.site/). Ela nos permite criar um novo identificador único que irá gerar uma URL e um email para o disparo de notificações via HTTP ou via email. Desta forma conseguimos testar as as funcionalidades de notificação das nossas aplicações. A imagem a seguir mostra a tela inicial com a URL e o email que foi criado:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/20a61ce5-76ee-4d7d-8066-01d52b467a0c/Untitled.png)

A ferramenta possui diversos recursos muito interessantes, porém os recursos que vamos explorar são os oferecidos gratuitamente.

O recurso de adicionar uma resposta customizada para quando um endpoint é chamado é bem útil para testar alguns cenários das chamadas de notificação. Para configurar a resposta basta clicar em *edit* no canto superior direito da página:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/14137a03-212b-4a9d-ac2a-31cdbe7ba266/Untitled.png)

No popup que será exibido, iremos configurar os detalhes da resposta. Podemos configurar:

- O **Status Code** que será retornado → para podermos simular diversos tipos de resposta e testar fluxos de erros quando o callback é enviado;
- O **Content Type** →para podermos simular diversos tipos de conteúdo diferente (normalmente APIs utilizam o Content Type: **application/json**);
- O **Timeout** antes que a ferramenta envie a resposta → para podermos simular um tempo de resposta mais elevado da notificação. Esta funcionalidade é bem útil para testar o comportamento do fluxo quando timeouts ocorrerem;
- O **Response Body** → campo de texto para configurarmos a mensagem que vai ser retornada quando chamarmos qualquer endpoint com a URL. No response também podemos utilizar algumas variáveis que são fornecidas pela ferramenta. Por enquanto não iremos usar nenhuma, mas fique a vontade para explora-las.

Com o entendimento dos campos, vamos criar uma resposta customizada? Exemplo de resposta customizada criada para indicar que a notificação foi com sucesso:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b1ef1333-1b87-4a49-8666-23436f2b2235/Untitled.png)

Na resposta de qualquer chamada, iremos retornar o **Status Code 202**, com o **Content Type** **“application/json”**, a ferramenta **vai esperar 2 segundos** antes de retornar a resposta e o corpo da resposta será **{”message”: “ok”}**.

## Testando o endpoint disponibilizado

Para demostrar a ferramenta, vamos fazer um teste simples utilizando o postman? Em um próximo artigo podemos simular alguma funcionalidade através de uma aplicação, mas por enquanto nosso objetivo é apresentar a ferramenta.

Para realizar um teste, precisamos abrir alguma ferramenta que realize requisições HTTP. Vamos utilizar o postman, mas fique a vontade para utilizar a ferramenta que esteja mais acostumado.

Antes de qualquer coisa, vamos copiar a URL que a ferramenta forneceu. A URL apresenta o seguinte padrão: 

```jsx
https://webhook.site/{CODIGO_GERADO}
```

O código gerado é um UUID gerado na hora que você abrir a página a primeira vez, ou seja, o código que iremos utilizar ao longo do artigo não deve ser o mesmo gerado para você.

Após copiar a ferramenta, vamos abrir o Postman e criar uma nova requisição. A requisição que iremos utilizar para testar contém as seguintes caracteristicas:

→ A requisição irá para o endpoint ***https://webhook.site/{CODIGO_GERADO}/notification*** com o verbo **POST**:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a39bdc5b-edd5-4bf7-a0fa-e2e971b3bdb7/Untitled.png)

→ Vamos adicionar um Header customizado chamado **custom-header**:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/0f677965-f332-4012-82b5-cc287a5edf58/Untitled.png)

→ O body da mensagem será um JSON com o conteúdo:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/2041aa46-0ac2-499e-9c63-45a5f297829c/Untitled.png)

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

Configurado a requisição, vamos dispara-la? No Postman, basta clicar no botão Send que ele fará a requisição para o [webhook.site](https://webhook.site):

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/291a6deb-5e01-4600-b40a-4c1d330beb4a/Untitled.png)

Prontinho!! Realizamos a nossa requisição para o [webhook.site](http://webhook.site) que aguardou dois segundos para então retornar uma resposta para nós. Vale ressaltar que o valor de espera configurado não significa que seja o valor total da request, pois ainda existe um tempo para que seja processado a requisição enviada e a resposta, tanto do Postman quanto da ferramenta.

Na ferramenta, a requisição realizada vai aparecer do lado esquerdo da tela. Caso não apareça recarregue a página tomando cuidado para não alterar a URL (para não perder o código gerado, caso perca será necessário realizar uma nova requisição para o novo código gerado). Ao clicar sobre ela é exibido os detalhes da requisição conforme a imagem abaixo: 

![Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/55a7ff9e-77ef-4639-8da5-1bbe4373e353/Untitled.png)

Na imagem podemos ver os detalhes das requisição tais como o verbo da requisição (destacado em verde), URL que recebeu a requisição disparada (destacado em verde), corpo da requisição enviado (destacado em amarelo), headers (destacado em vermelho), query strings (destacado em azul), campos de forma (destacado em azul) e etc. Com essa informações podemos validar se a requisição da aplicação foi realizada com os valores corretos.

Também temos disponível a exportação da requisição através da opção “Export as”. A visualização do conteúdo de forma “crua” através da opção “Raw content”. Por último podemos gerar um link permanente para essa requisição através da opção “Permalink” (muito útil para adicionar em algum documento de evidências).

Com esses recursos gratuitos já podemos realizar diversos testes das nossas APIs e verificar se o conteúdo foi enviado corretamente.

## Testando o email disponibilizado

O website.hook também suporta a validação de emails. Alguns sistemas possuem o envio de email como forma de notificar o usuário que algo foi realizado, confirmar alguma ação e etc. Para testarmos o envio de email vamos precisar enviar um email para o endereço que foi disponibilizado na tela inicial do site. Podemos copiar o endereço e iremos utilizar um email pessoal para poder testar o funcionamento da ferramenta.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/70e19843-6ce4-4fd4-8e0b-126015fdaa93/Untitled.png)

A imagem acima é um print do email que estou enviado para o website.hook através do Gmail.

Depois de alguns instantes um novo email será disponível na ferramenta e ao clicar nos detalhes será exibido uma tela conforme a imagem abaixo:

![email.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ebeda4a0-d9ee-45ff-9371-1dd799808cae/email.png)

OBS: Os dados que envolvem um email são muito maiores do que os dados de uma notificação HTTP. Mas não precisa se assustar que muitos destes dados são informações utilizadas para que as ferramentas de email possam se localizar e montar o email adequadamente.

Na imagem acima, podemos verificar algumas informações bem legais sobre o email que acabamos de enviar, tais como os detalhes do envio de email (destacado em amarelo), os cabeçalhos do email (destacado em azul), arquivos enviados (destacado em verde), a mensagem em forma de texto (destacado em vermelho) e o conteúdo “cru” (destacado em rosa).

Normalmente não precisamos nos preocupar com o conteúdo “cru” do email pois contém muitas informações referentes ao protocolo de troca de emails.

OBS: alguns textos estão borrados na imagem pois é um endereço de email que utilizei para enviar o email de testes.

Assim como no detalhamento de requisição, também podemos pegar o link permanente (através da opção “Permalink”) para o caso de ser necessário adicionar em algum documento de evidências e também ver o conteúdo “cru” (através da opção “Raw Content”).

## Conclusão

O teste envolvendo integrações de sistemas pode ser algo bem complicado de fazer pois na maioria dos casos não temos um “container” do sistema para utilizarmos. As vezes nem é bem possível usar um container pois é um sistema de terceiros que não temos acesso a uma versão para testes.

Para realizar testes que são disparados chamadas HTTP podemos utilizar diversas ferramentas e cada uma delas nos permite testar um aspecto da chamada. A ferramenta [webhook.site](http://webhook.site) nos auxilia a garantir que a chamada foi com os dado corretos. Nela podemos, inclusive, criar uma resposta padrão para podermos testar retornos diferentes e também podemos setar timeouts para testarmos esse comportamento. Desta forma conseguimos garantir diversos comportamentos dentro da nossa aplicação.

Algumas funcionalidades exigem o envio de email com algum relatório gerado ou somente uma notificação sem arquivos anexados. Também podemos utilizar a ferramenta [webhook.site](http://webhook.site) para garantir o conteúdo destes emails.

No próximo artigo sobre esta ferramenta, vamos criar uma aplicação (provavelmente usando Python) para exemplificar a ferramenta.
