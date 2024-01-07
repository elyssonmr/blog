---
title: "Por que documentar antes?"
date: "2024-01-04T20:00:00-03:00"
draft: false
sidebar: true
slug: 02_por_que_documentar_antes
thumbnail:
  src: "img/posts/02_porque_documentar_antes/thumbnail.png"
  visibility:
    - list
categories:
  - "Arquitetura Software"
tags:
  - "Documentação"
  - "Projeto"
  - "Software"
---

Ao criarmos um sistema é bem comum também criarmos uma documentação junto com este sistema. Se pensarmos na documentação dos endpoints usando, por exemplo, um [Swagger](https://swagger.io/) podemos utilizar uma das diversas ferramentas que geram essa documentação para nós, porém não devemos utiliza-las!! Neste artigo vou falar mais um pouco sobre isso, explicar qual a motivação de não usa-las e dar alguns exemplos do que passei na minha carreira.

<!--more-->

# Quais os problemas que enxergo sobre não documentar antes?

A documentação do software que estamos trabalhando é muito importante para ensinar desenvolvedores de outros times ou novos desenvolvedores a como se integrar ao sistema que trabalhamos, explicar o funcionamento interno do sistema e também documentar decisões que foram tomadas ao longo do desenvolvimento.

Muitas vezes escrever essa documentação é bem trabalhoso, tediante e ninguém gosta muito de fazer. Tá tudo bem!! As vezes eu também acho um pouco chato, mas é algo que precisa ser feito, não? Neste caso sempre recorremos a ferramentas para gerar documentação. Citamos na introdução um exemplo de documentação com [Swagger](https://swagger.io/), bom... vou usar esse exemplo pelo resto do artigo, OK? Dai basta fazer a troca para outros tipos de documentação.

Existem algumas ferramentas e/ou bibliotecas que leem o código desenvolvido e geram para nós o Swagger totalmente funcional e preciso de acordo com o que fizemos no código. O FastAPI em Python, por exemplo, [possuí este recurso de forma nativa](https://fastapi.tiangolo.com/features/#automatic-docs). Utilizar estes recursos torna bem mais rápido a geração da documentação necessária para documentar os endpoints, não há dúvidas sobre isso. Porém não deveriamos usar... Mas porque não usar? A resposta é bem simples! Quem garante que está implementado corretamente? Será gerado a documentação com o que foi implementado, o que não é necessáriamente correto.

Alguns documentos podem ser feito antes para podermos comunicar quais a intenções e objetivos que temos com a implementação, a documentação dos endpoints é um destes documentos.

"Mas Ely, podemos muito bem escrever a documentação antecipada errada, não podemos?" Sem dúvidas que sim!! Porém ao escrever antecipadamente o time acaba discutindo um pouco mais sobre a documentação e pensando um pouco melhor nas decisões que estão sendo tomadas nos endpoints, além de que é possível fornecer essa documentação, **com resalvas que poderá ser alterado**, para outros times gerarem mocks e/ou anteciparem a implementação da integração. Um ponto que temos que levar em consideração neste cenário é que é mais fácil alterar o contrato de endpoints durante o desenvolvimento do que depois de pronto. Já passei por casos na minha experiência que o time acaba não alterando endpoints após estarem prontos, o que faz com que o problema se torne ainda maior pois diversos outros sistemas irão se conectar utilizando endpoints que não estão muito bem escritos. O processo de depreciação e alteração de contratos de endpoints pode ser bem moroso, demorado e custoso (por isso não é facilmente alterado). Eu acredito que a documentação sendo feita antes ajuda na validação dos endpoints e também a planeja-los melhor.

Dando um exemplo fora da computação: se pensarmos na **construção de uma casa**, primeiro a gente levanta as paredes, passa fiação, passa os canos e faz o acabamento para depois voar um drone para cima da casa de tal modo a tirar uma foto para criar a planta baixa da casa? Essa analogia eu fiz para um colega sobre a importancia de se fazer algumas "documentações" antes da construção da aplicação. A pergunta que ele fez após eu falar a analogia foi: "Mas os comodos da casa foram construídos como deveria ter sido?", falei para ele que o mesmo podemos aplicar a software. Lembrando que mesmo tendo a planta baixa da casa podemos construí-la errada, não temos como previnir isso 100%, mas já teremos um guia para seguir o caminho que foi planejado.

Pensando em sistemas internos a uma empresa, conseguimos alterar os endpoints de forma mais simples pois teremos menos sistemas se conectando. Agora, pensando em sistemas que atende o público externo, teremos muito mais trabalho para poder alterar os endpoints e não utilizar mais os antigos que estão com problemas.

Tenho certeza que caso seja alterado com muita frequencia só irá trazer problemas:

1. Será gasto muito esforço pelos clientes para poder manter as chamadas atualizadas com a última versão da API;
2. Existirão diversas versões da API, gerando muito esforço para o time manter. Como os clientes não irão conseguir atualizar com frequencia versões bem mais antigas terão que existir junto com as mais atuais;
3. A falta de consistência na API é algo que fara com que os clientes procurem soluções alternativas. Muitas das vezes essas soluções são oferecidas pelos concorrentes. Sem pressão, tá? não é tão fácil e frequente de ocorrer mas é uma possibilidade.
4. A evolução do sistema pode ser mais complexa, pois algumas alterações irá impactar diversas versões da api que estão sendo usadas pelos clientes. O teste das alterações irá precisar contemplar todas as versões que estão sendo usadas;

# Não documentei antes, como posso contornar isso?

Não vou deixar vocês pensando que só estou escrevendo este post para falar que você não deve fazer a documentação depois. Vou dar uma dica de como pode ser feito de uma forma que gere menos impacto possível para os clientes da sua API caso seja necessário alterar o contrato dos endpoints.

A dica é utilizar da **técnica de depreciação de uma versão da API**. Esta técnica consiste em dar um prazo de vida limite para uma determinada versão da API, ou seja, após um determinado prazo a versão será desligada e todo mundo deve atualizar para uma das versões mais recentes. É bem parecido com o que acontece com versões de liguagens e bibliotecas.

Para facilitar podemos adicionar a versão da API nas URLs de tal modo que fique bem fácil identificar qual a versão sendo usada. Normalmente é usado versões baseadas em números, por exemplo: *v1*, *v2*, *v3* e assim por diante. Exemplos de url:
* meuapp.com.br/v1/clientes
* meuapp.com.br/v1/vendas
* meuapp.com.br/v2/clientes
* meuapp.com.br/v2/vendas

Quando uma versão estiver para ser descontinuada deveremos notificar os clientes que essa versão da API será descontinuada. Junto a essa notificação, também devemos apontar um prazo para que os clientes que estejam utilizando essa versão possam atualizar seus sistemas para utilizar as versões mais atualizadas.

Na teoria parece bem simples, mas é dai que você se engana. A parte mais dificil aqui é determinar o prazo para desligar a versão antiga. Se o cliente for um bom cliente e estiver trazendo um faturamente interessante para a empresa, ele automaticamente ganha o poder de negociar esse prazo. Não é nem um pouco interessante perder esse cliente e o custo em manter a versão antiga pode ser menor do que o valor que ele está pagando por utilizar o sistema. Essa negociação de prazo normalmente é bem tensa e complicada de chegar em um concensso. Eu já trabalhei em um time que conseguimos renegociar a data limite da depreciação de uma versão da API que tinhamos um contrato de utilização. Para vocês terem uma ideia estavamos cerca de **25 versões atrás da atual**, tivemos esse poder pois eramos um bom cliente e eles não queria perder o faturamento que levavamos para a empresa deles. O argumento utilizado para extender foi que não tinhamos disponibilidade para evoluir a versão e que se não fosse mais disponibilizada usariamos outro fornecedor que também tinhamos contrato (este outro fornecedor recebia um volume bem menor de chamadas) até conseguirmos realizar a atualização. Sendo bem honesto não foi planejado essa atualização por pelo menos uns 6 meses após o prazo limite do fornecedor. Eventualmente conseguimos atualizar, mas não foi uma tarefa fácil e nem foi rapidamente priorisada. Deu muito trabalho atualizar, foi alterado inclusive o funcionamento da API, teriamos que realizar mudanças bem expressivas na aplicação. Não posso mentir sobre termos considerado não atualizar e trocar o fornecedor principal, essa hipotese passou pela cabeça de todo mundo do time.

Neste caso, a dica é ter uma conversa com os clientes para verificar se o prazo é adequado para eles. Pelo menos falar com os principais já ajuda bastante. ahhh... a boa e velha gordura que colocamos em estimativas pode ser algo bem útil aqui. Ter uma forma de voltar atrás também pode ser alto interessante de adicionar, visto que caso algo dê errado seja mais simples reativar a versão antiga.

Efim, existem diversas outras técnicas que podem ser utilizadas, mas essa é uma das mais comuns usadas em software, ferramentas e bibliotecas também. A técnica em si é simples, a dificuldade está na negociação e manutenção de diversas versões.

Espero que este post tenha sido útil para você pelo menos considerar alguma forma diferente de fazer caso tenha passado pelos mesmos problemas que passei com relação a criar documentações posteriores a conclusão do desenvolvimento da aplicação. Compartilhe suas esperiências sobre este tema nos comentários. Caso tenha feedbacks serão todos bem vindos também!

Obrigado por ler até aqui :)
