---
title: "Diagrama de sequência para representar fluxos na arquitetura de micro-serviços"
date: "2024-02-15T13:00:00-03:00"
draft: false
sidebar: true
slug: 2024_02_15_flow_diagram
thumbnail:
  src: "img/posts/20240215_flows_diagram/thumbnail.jpg"
  visibility:
    - list
categories:
  - "Arquitetura Software"
tags:
  - "Documentação"
  - "Projeto"
  - "Software"
---

Quem já trabalhou com micro serviços, já deve ter passado por alguma situação onde seja necessário chamar outros sistemas e esse sistemas chamam outros, que chamam outros e assim por diante. Em algumas situações existe uma ordem para chamar os sistemas de tal forma a passar os dados adequadamente para cada um deles. Neste artigo vou falar um pouco mais sobre como criar diagramas de sequencia para representar o fluxo de chamadas dentro de uma arquitetura de micro serviços.

<!--more-->

# Contexto que vamos utilizar ao longo do artigo

Para poder ficar mais simples de entender, vou utilizar um cenário para desenhar os fluxos.

O cenário vai ser um site de delivery de delivery de comida. Os clientes irão acessar o site para realizar selecionar quais pratos desejam, realizar o pedido e pagar pelo pedido. O nome fictício do nosso site será **LanchePlus** (usei esse nome em um sistema durante minha última experiência dando aula). Além disso vamos nos conectar com sistemas externos para poder realizar as cobranças dos pedidos dos clientes.

Essa arquitetura pode ser representada de acordo com o diagrama de contexto do C4 a seguir:

{{< figure src="/img/posts/20240215_flows_diagram/initial_c4.png" title="Diagrama C4 Inicial" >}}

**OBS**: Talvez neste cenário não seja necessário utilizar micro-serviços. Não iremos entrar neste mérito aqui. O cenário é somente para ilustrar o objetivo de mostrar os fluxos.

# Fluxos da lanchonete

O **LanchePlus** possui diversos fluxos, vamos exemplificar alguns deles aqui.

Antes de iniciarmos a falar sobre eles, eu gostaria de ressaltar que não estou usando o Diagrama de Sequência com 100% do como deveria ser utilizado. A ideia aqui é indicar a comunicação entre micro-serviços de uma forma simplificada.

O primeiro que vamos exemplificar é de um cliente acessando o site para escolher um prato e realizar o pedido. Este fluxo não irá envolver somente micro-serviços, também será envolvido o cliente e os sistemas externos que processam o pagamento. Não iremos considerar os funcionários da lanchonete pois cada lanchonete pode ter um processo muito distinto, ok??

![fluxo pedido](/blog/img/posts/20240215_flows_diagram/order_flow.png)

Breve explicação do fluxo:
1. O *Cliente* acessou o site do *LanchePlus* para escolher um lanche
2. O *Cliente* navegou entre os pratos disponíveis e escolheu um prato
3. O *Cliente* escolheu como ele vai pagar (entre cartão de crédito ou PIX)
4. O sistema de *Pedidos*, solicitou que o sistema de *Pagamentos* realizasse a cobrança de acordo com o que o *Cliente* escolheu como forma de pagamento
5. O sistema de *Pagamentos* salvou as informações referentes ao pagamento. Para então tomar a decisão para qual processador de pagamento deve solicitar a efetivação do pagamento
6. Caso o pagamento seja cartão de crédito, o sistema de *Pagamentos* irá solicitar para o processador de cartão realizar a efetiva cobrança no cartão do *Cliente*
7. Caso o pagamento seja PIX, o sistema de *Pagamentos* irá solicitar para o processador de PIX realizar a efetiva cobrança no cartão do *Cliente*
8. O sistema de *Pagamento* retorna para o sistema de *Pedidos* que o pagamento foi realizado
9. O sistema de *Pedidos* retorna para o *Cliente* que o pedido foi realizado

Este seria um fluxo geral de uma lanchonete utilizando o **LanchePlus**, ele não ficou muito grande, né?? Porém ele não possui diversos detalhes que talvez seria importante para determinados contextos. Algumas das etapas descritas acima podem ser representadas um novo fluxo dando mais detalhes do que acontece.

O que você achou deste fluxo? Acha que se você tivesse essa visão conseguiria implementar melhor a comunicação entre os micro-serviços? Quando estamos desenhando fluxos que envolvem diversos micro-serviços, não precisamos dar muitos detalhes. Caso contrário, o fluxo fica muito grande e difícil de ler. Também não podemos deixa-lo muito sem detalhes, porque senão ninguém entende nada. Existe uma faixa entre **"poucos detalhes"** e **"muitos detalhes"** que pode ser utilizada para desenhar as chamadas (etapas) nos micro-serviços. Claro que se precisar podemos detalhar melhor uma etapa. A minha recomendação nestes casos é fazer como uma especie de *funil*: começando com o desenho de fluxos com poucos detalhes e **sendo necessário**, criar fluxos com mais detalhes.

Vamos expecificar melhor uma das etapas do fluxo? Podemos pegar a primeira etapa (cliente escolhendo o prato que irá comprar). Vou tentar descrever o máximo possível as etapas:

![fluxo pedido detalhado](/blog/img/posts/20240215_flows_diagram/order_detail.png)

Breve explicação do fluxo:

1. *Cliente* acessa o site para escolher um prato
2. O sistema de *Pedidos* retorna a página principal
3. *Cliente* acessa o catalogo de pratos
4. O sistema de *Pedidos* retorna o catalogo de pratos
5. Dentro de um loop, o *Cliente* escolhe um prato e adiciona no carrinho
6. Ainda dentro do loop, o sistema de *Pedidos* confirma que o prato foi adicionado
7. O *Cliente* acessa o carrinho
8. A tela com o resumo do carrinho é exibida para o *Cliente*
9. *Cliente* verifica se todos os pratos foram adicionados conforme o desejado
10. O *Cliente* seleciona um meio de pagamento
11. Caso o meio de pagamento seja Cartão de crédito, o sistema de *Pedidos* irá exibir o formulário para preenchimento com os dados do cartão
12. o *Cliente* preenche os dados do cartão de crédito
13. Confirma o meio de pagamento
14. *Cliente* clicka em "Pedir"
15. Caso o meio de pagamento seja PIX, o sistema de *Pedidos* exibe o QRCode
16. O *Cliente* escaneia o QRCode com um aplicativo para pagamento de PIX
17. O sistema de *Pedidos* fica aguardando a confirmação do pagamento
18. Exibe uma mensagem para o *Cliente* indicando que o pedido foi pago e que está sendo preparado

Ufa!! Ficou bem maior, né?? Viram como podemos adicionar muito mais detalhes no fluxo? Como foi dito a pouco, os detalhes dependem de como queremos descrever o fluxo em questão. Estes detalhes que adicionei nesta parte do fluxo estão bem próximos de como deveríamos programar a aplicação de *Pedidos*.

Normalmente fluxos com poucos detalhes dão uma visão geral da comunicação entre diversos micro-serviços. Fluxos com mais detalhes são mais indicados para o time de desenvolvimento ter a visão de como deve ser a implementação. Um fluxo mais detalhado não necessariamente é usado somente pelo time de desenvolvimento, lembre-se que o nível de detalhes é relativo e para cada situação e/ou público será necessário mais ou menos detalhes.

Outra coisa que não estamos considerando no fluxo são cenários alternativos. Por exemplo, o cliente pode entrar para olhar os pratos e não escolher nenhum, ou ele pode abandonar o carrinho antes de pagar. Nós podemos representar estes cenários em outros fluxos (caso o fluxo fique muito grande) ou utilizar de outras *tags* do diagrama de sequência para representar este fluxo. Vou deixar para outro artigo aprofundar mais nos conceitos do diagrama de sequência.

Vamos para o último Fluxo? Este eu vou desenhar referenciado o processo de entrega, porém não darei muitos detalhes. Te desafio a desenhar o fluxo com detalhes e postar o link dele nos comentários, combinado?? ;)

![fluxo entrega](/blog/img/posts/20240215_flows_diagram/delivery_flow.png)

O fluxo de entrega é um pouco mais simples. Breve explicação do fluxo:

1. A medida que os pedidos forem terminando, o sistema de *Pedidos* informa o sistema de *Entregas* que há pedidos para serem entregados
2. O *Entregador* consulta os pedidos disponíveis no sistema de *Entregas*
3. O *Entregador* busca os pedidos disponíveis na lanchonete
4. Para cada pedido que estava disponível, o *Entregador* vai até o endereço do Cliente
5. Entrega o pedido para o Cliente
6. Confirma no sistema de *Entregas* que o pedido foi entregue ao Cliente


Olhando para este fluxo, conseguimos entender melhor como o processo de entrega funciona. Não temos todos os detalhes deste processo, mas conseguimos ter um contexto do como ele funciona e consequentemente podemos implementar de forma mais assertiva os requisitos. Caso seja necessário podemos dar mais detalhes deste fluxo.

# Conclusão

Os diagramas de sequência podem ser usados para indicar, de uma forma simples, a interação entre diversos micro-serviços através de um fluxo da comunicação entre diversos sistemas e atores.

Os fluxos montados ajudam na contextualização das interações que ocorrem entre os sistemas envolvidos no fluxo desenhado. Desta forma, todas as pessoas envolvidas em determinado fluxo dentro de uma empresa conseguem se localizar dentro do contexto que estão inseridos.

O nível de detalhes depende muito do público que irá ler o fluxo. Alguns públicos podem exigir mais detalhes no fluxo do que outros públicos. A dica neste caso é sempre criar os fluxos utilizando um "funil" de detalhamento, onde existam fluxos mais genéricos para entender o contexto e fluxos mais específicos para quem precisar de mais detalhes. Não existe um nível de detalhamento adequado, sendo necessário observar qual seria mais adequado para cada situação.
