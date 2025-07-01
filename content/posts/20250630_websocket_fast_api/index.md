---
title: "Utilizando WebSockets com FastAPI"
date: "2025-06-30T12:00:00-03:00"
draft: false
sidebar: true
slug: 20250630_websocket_fast_api
thumbnail:
  src: "img/thumbnails/20250630_websocket_fast_api.jpg"
  visibility:
    - list
categories:
  - "Desenvolvimento de Software"
tags:
  - "WebSocket"
  - "Projeto"
  - "Software"
---

No artigo de hoje vou demonstrar como utilizar websocket no FastAPI. Para explorar um pouco mais deste recurso, vou trazer uma pequena aplicação de chat onde as pessoas podem entrar, escolher um nome e bater um papo com quem estiver online naquele momento.

<!--more-->

# Introdução

Existem alguns tipos de aplicações web que precisam trocar mensagens com seus clientes meio que instantaneamente, para isso elas podem utilizar diversas técnicas. Uma das técnicas é a utilização de [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) que consiste em abrir uma conexão persistente e bidirecional entre o cliente e o servidor.

Desta forma é possível que o cliente mande alguma mensagem para o servidor e quando ocorrer algum evento no servidor ele também possa mandar uma mensagem para o cliente através da mesma conexão. De certo modo isso torna a comunicação mais rápida pois não precisa passar pelo processo de abrir conexão sempre que um nova mensagem for enviada, tanto pelo cliente quanto pelo servidor.

# O que é WebSocket?

Como falamos na introdução é uma comunicação persistente e bidirecional entre um cliente e o servidor, ou seja, o processo de abertura de conexão ocorre no inicio, são enviadas mensagens (do cliente para o servidor e/ou do servidor para o cliente), então esta conexão não é fechada até que seja explicitamente realizado o fechamento.

{{<figure src="images/01_websocket_protocol.png" title="Imagem retirada de https://blog.algomaster.io/p/websockets" legend="Imagem retirada de https://blog.algomaster.io/p/websockets">}}

Quando abrimos uma página web, ocorre a abertura de uma nova conexão com o servidor, então é enviado a solicitação, o servidor processa, retorna uma resposta e por último o cliente fecha esta conexão. Com Websockets é diferente, a conexão não é fechada após o recebimento de uma resposta e também permite que o servidor envie mensagens para o cliente através da mesma conexão que foi aberta previamente pois ela é persistente e somente é fechada quando uma das partes decide fecha-la.

Cuidado! Manter a conexão aberta pode parecer algo muito vantajoso, mas não é bem assim. Existe um custo relacionado a manter esta conexão aberta no servidor, para cada cliente conectado é necessário manter algumas informações sobre a conexão além da própria conexão aberta. Pois esta é a forma como o servidor irá conseguir se comunicar com um cliente em especifico. Caso a sua aplicação possua mais de uma instância, a conexão pode estar associada com a instância que não está processando um evento, desta forma ela não terá as informações e a conexão para enviar uma resposta. Existem formas de resolver este problema, mas não iremos aborda-las no artigo para manter a simplicidade.

# Desenvolvimento do exemplo

O nosso exemplo é um chat simples, onde quem abrir a página vai preencher o nome e enviar mensagens. Ao receber a mensagem, o servidor vai distribuir esta mensagem para todas as demais pessoas conectadas no chat. Para manter a simplicidade, não teremos uma forma de login, a pessoa pode acessar e escolher o nome que quiser. Também não teremos um histórico de conversa salvo.

## Frontend (feito por IA)

O frontend eu pedi para o Gemini criar, desta forma vamos poder focar melhor no que é mais importante para o artigo que é a comunicação via WebSocket. Também foi gerado o Java script para a comunicação como placeholder. Fiz algumas alterações para que tudo ficasse no mesmo arquivo html e também para simplificar um pouco.

Na tag `<script>` foi gerado o código para pegar os elementos da página para que possamos realizar as ações necessárias neles. Um evento de click para limpar a mensagem escrita e por último o Gemini criou a função de adicionar uma mensagem no *DIV* (id: messages) de forma fácil quando recebermos uma mensagem vinda do websocket:

{{<figure src="images/code/01_gemini_code.png" title="Imagem com o código inicial criado pelo Google Gemini" legend="Imagem com o código inicial criado pelo Google Gemini">}}

Logo em seguida, vamos criar uma instância de WebSocket (não se preocupe com bibliotecas, está classe já vem com o JavaScript do seu navegador. Dê uma olhada neste [link](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) caso queira verificar a compatibilidade) passando como argumento o endereço do WebSocket. No exemplo já tem um endereço utilizando a porta padrão  do FastAPI, caso seja necessário, altere o endereço pra o que você configurou, não remova o prefixo: `ws://` pois se trata do protocolo da conexão. Ao instanciar o WebSocket, ele já vai se conectar com o servidor. Então precisamos adicionar uma implementação para o evento de quando chegar a mensagem:

{{<figure src="images/code/02_onmessage_event.png" title="Imagem com o código da instância e evento de recebimento de mensagens" legend="Imagem com o código da instância e evento de recebimento de mensagens">}}

A função para o evento, terá um único argumento `event` que conterá todas as informações referente ao que o servidor enviar via websocket. No nosso caso, somente vamos receber mensagens de outras pessoas no chat, desta forma não vamos precisar criar uma lógica para saber qual o tipo da mensagem sendo recebida no cliente. A implementação irá extrair os dados recebidos (atributo *data*), convertemos para obj JavaScript usando o `JSON.parse` para então adicionar a mensagem na DIV de mensagens utilizando a função para este fim que o Gemini criou.

A última parte do JavaScript é o envio de mensagens, vamos adicionar o evento de click no botão de enviar mensagem (sendBtn). Dentro da função, faremos uma verificação simples no nome e na mensagem, para isso precisamos pegar os valores destes inputs, remover espaços extras e então caso estejam vazios, um alerta irá indicar isso. Em seguida adicionamos nossa própria mensagem no DIV de mensagens (o Gemini criar está função foi uma sacada bem legal!!). Para enviar a mensagem para o servidor, vamos precisar converte-la de objeto do Javascript para uma string JSON usando o `JSON.stringfy`, depois basta enviar a mensagem via socket instanciado previamente através da função `socket.send`. Ao final do evento, vamos limpar o conteúdo do campo de mensagem e foca-lo para que a próxima mensagem seja enviada.

{{<figure src="images/code/03_send_event.png" title="Imagem com o código para o envio de mensagens" legend="Imagem com o código para o envio de mensagens">}}

Com este código Javascript implementado, já concluímos a implementação do lado do cliente. O intuito foi de fazer algo bem simples para conseguirmos focar mais em FastAPI do que no frontend. Agora vamos implementar o código do lado do servidor?

## Backend

O backend da aplicação faz parte do projeto de exemplos com FastAPI no meu github. Desta forma adicionei um módulo lá para abrigar todo o código refente a este artigo. O nome do módulo é `websocket`. A figura abaixo demonstra como ficou:

{{<figure src="images/02_websocket_structure.png" title="Imagem com a estrutura do módulo websocket" legend="Imagem com a estrutura do módulo websocket">}}

A pasta templates contém o HTML, CSS e Javascript que implementamos para o cliente. Todo o código está em um único arquivo chamado `index.html`. Para facilitar, adicionei tudo em um único arquivo para que não seja necessário configurar arquivos estáticos e etc (vamos deixar isso para outro artigo).

No `routes.py` vamos implementar o código para servir a página web para os clientes do chat e também vamos implementar o WebSocket que vai receber as mensagens e envia-las para todo mundo que estiver no chat. Primeiro, vamos importar o `path` do pacote `os`, o `APIRouter` do pacote `fastapi` e o `HTMLResponse` do pacote `fastapi.responses`. Em seguida, vamos criar um router com o prefixo `/websocket` e a tag `Web Socket`. O código deve ficar assim:

{{<figure src="images/code/04_websocket_imports.png" title="Implementação do apirouter do pacote websocket" legend="Implementação do apirouter do pacote websocket">}}

Com o router criado, nós iremos implementar o endpoint chamado `chat_page` que ao fazer um GET vai retornar o HTML contendo o chat. A URL do endpoint vai ser somente `/` para que quando adicionado o prefixo fique: `localhost:8000/websocket`. Ao executar o projeto o caminho padrão não é bem onde o routes está sendo executado, desta forma teriamos que especificar o caminho do `index.html` relativo da onde é o caminho padrão. O problema aqui é que é possível alterar este caminho, desta forma não é muito confiável escrever o caminho como um todo para abrir o arquivo. Para contornar isso, vamos utilizar a função `dirname` do módulo path que importamos. A implementação vai utilizar um context manager para gerenciar a abertura e o fechamento do arquivo e a boa e velha função open, porém o caminho do arquivo que será aberto será formatado para que possamos pegar o caminho absoluto da pasta que o routes está usando o `path.dirname`. Para realizar essa façanha, devemos passar como argumento a variável `__file__` que contém o caminho absoluto do arquivo que esta sendo executado naquele momento, desta forma vamos conseguir concatenar `/templates/index.html` porque o diretório do routes é o mesmo diretório que adicionamos a pasta de templates. Com o arquivo aberto, vamos retornar um `HTMLResponse` com todo o conteúdo lido do `index.html`. O código ficou assim:

{{<figure src="images/code/05_chat_endpoint.png" title="Implementação do endpoint de chat" legend="Implementação do endpoint de chat">}}

Para testar, basta instalar o projeto com o poetry (caso não tenha instalado no último artigo) e executar o comando `task run`. Após o servidor executar, abra no seu navegador: {{<assetnewtab src="localhost:8000/websocket/" title="localhost:8000/websocket/">}}.

O chat ainda não se conecta ao servidor, pois ainda não implementamos a comunicação via websocket do lado do servidor. Vamos fazer esta implementação agora. Do ponto de vista do servidor, o websocket somente estará conectado quando uma mensagem for enviada, ou seja, o usuário do chat vai precisar enviar pelo menos uma única mensagem para registra-lo a receber as mensagens que as outras pessoas do chat enviarem.

A implementação do websocket não é tão complexa de se fazer usando o FastAPI. Na verdade ela é até um pouco parecida com um endpoint comum (igual ao endpoint que retorna o HTML que já implementamos), o que difere é qual o decorator do router vamos utilizar e o tipo do parâmetro da função. Sobre o decorator, vamos utilizar o `@router.websocket_route` passando para ele qual a URL será utilizada através do protocolo de websocket. Neste caso, será a url `/ws_chat`, desta forma a url completa para este endpoint ficará: `localhost:8000/websocket/ws_chat`. Na função, precisamos adicionar um parâmetro do tipo `WebSocket` importado do `fastapi`, o nome deste parâmetro pode ser qualquer um, no código vou utilizar `websocket`:

{{<figure src="images/code/06_ws_chat_declaration.png" title="Implementação do endpoint WebSocket" legend="Implementação do endpoint WebSocket">}}

Como endpoint declarado, vamos implementar o código necessário para receber uma mensagem e dispara-la para os demais participantes do chat. A primeira coisa que devemos fazer é aceitar uma nova conexão com o chat, para isso devemos utilizar a função accept do websocket. Aaahhh esta é uma função assíncrona tah, qualquer função que vamos utilizar do websocket é assíncrona. Em seguida, vamos criar um loop infinito que vai esperar por um JSON chegar e quando ele chegar, verificamos se o usuário está conectado, caso não esteja, vamos adiciona-lo no dicionario chamado `connected_clients`, onde a chave é o nome que foi escolhido e o valor é o websocket daquela conexão. Este dicionário será usado para que possamos enviar a mensagem enviada para todos os demais participantes do chat. Por enquanto o nosso código está assim:

{{<figure src="images/code/07_ws_client_connection.png" title="Implementação da conexão dos clientes" legend="Implementação da conexão dos clientes">}}

Para concluir a implementação do endpoint está faltando somente o envio da mensagem para as demais pessoas conectadas. Verificar se é necessário ou não adicionar o cliente no dicionário de clientes conectamos e adiciona-lo caso necessário, nós iremos percorrer este dicionario para enviar a mensagem para os demais participantes do chat enviando um JSON para eles contendo quem envio a mensagem e qual o texto dela. Um ponto importante é que não precisamos enviar para nós mesmo, neste caso devemos adicionar uma condição para que seja enviado somente se a pessoa conectada for diferente da pessoa que acabamos de receber uma mensagem no websocket. O código completo deve ficar:

{{<figure src="images/code/08_ws_chat_full.png" title="Implementação da completa do endpoint WebSocket" legend="Implementação da completa do endpoint WebSocket">}}

Pronto a implementação está completa. Agora precisamos testar!! Não é necessário que você use mais de um computador, basta abrir mais de uma aba com o chat, preencher o nome e enviar algumas mensagens de exemplo. No teste que fiz, eu criei um chat entre alguns cavaleiros do Zodíaco. O print abaixo foi tirado de um dos integrantes do chat:

{{<figure src="images/04_chat_seyia.png" title="Chat do Seyia" legend="Chat do Seyia">}}

Note que primeiro foi enviado uma mensagem para que seja registrado no chat e depois foi recebido mensagens dos demais integrantes. Na visão do Shiryu, como ele não entrou antes da mensagem "Olá" do Seyia ele não recebeu esta mensagem, somente depois de enviar a primeira mensagem que ele se recebeu as demais. Caso um integrante do chat já esteja registrado ele vai receber todas as mensagens posteriores.

{{<figure src="images/05_chat_shiryu.png" title="Chat do Shiryu" legend="Chat do Shiryu">}}

Todo o código pode ser encontrado no [repositório](https://github.com/elyssonmr/fast_api_examples).

# Conclusão

WebSockets são bem interessante para se ter uma comunicação bidirecional utilizando a mesma conexão. Em vias normais em uma aplicação web não é possível enviar uma mensagem do servidor para um cliente se que ele solicite está mensagem, utilizando websockets nós conseguimos realizar este tipo de comunicação e notificar eventos que ocorreram no servidor.

O nosso exemplo de chat foi um exemplo simples para demonstrar a comunicação utilizando WebSockets. Existem outros casos que também pode-se aplicar WebSockets, como por exemplo um stream de dados de logs, jogos multiplayer, aplicações de IOT e etc. O leque de possibilidades é enorme!!

Estudando um pouco melhor sobre como podemos criar interações com WebSockets, podemos criar experiências novas para os clientes que utilizam as nossas aplicações. Com esta forma de comunicação podemos criar uma interação mis fluída com estes clientes e também muito mais interativa.

Como nem tudo são flores, também temos alguns pontos que podem prejudicar um pouco. No exemplo que fizemos juntos somente permite uma instância da aplicação devido a decisão de design em manter os clientes conectados dentro de um dicionário. Existem formas de escalarmos a aplicação, mas elas podem ser um pouco complexas de se implementar.
