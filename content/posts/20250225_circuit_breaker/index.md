---
title: "Utilizando Circuit Breaker em seus projetos"
date: "2025-04-01T12:00:00-03:00"
draft: false
sidebar: true
slug: 20250401_circuit_breaker
thumbnail:
  src: "img/thumbnails/20250401_circuit_breaker.jpg"
  visibility:
    - list
categories:
  - "Arquitetura Software"
tags:
  - "Resiliência"
  - "Projeto"
  - "Software"
---

Muitas aplicações realizam a comunicação com outras aplicações para o envio ou consulta de dados. É mais corriqueiro do que imaginamos que estes sistemas estão indisponíveis ou degradados em alguns momentos. Será que existe algo que podemos fazer para evitar degradar mais ainda o sistema?


<!--more-->

# Introdução

Continuando sobre o assunto de resiliência que já discutimos no [último artigo]({{< ref "posts/20250202_fallback_strategy" >}}), vamos discutir outra técnica que pode ser utilizada para aumentar a resiliência e a tolerância a falhas de nossas aplicações. Muitas aplicações precisam se conectar com outras para recuperar dados e/ou salvar dados. O que nós faremos caso esta aplicação terceira esteja indisponível ou degradada? Ai que entra o Circuit Breaker! Neste artigo vamos abordar um pouco mais sobre este padrão e também vamos exemplificar criando um código simples para exemplificar o uso do padrão nas nossas aplicações.

# O padrão de Circuit Breaker

O padrão de Circuit Breaker foi emprestado da área da eletrônica. Inclusive o funcionamento é bem parecido: Quando uma "sobrecarga" (aqui vamos chamar de condição) o Circuit Breaker desarma (abre) para que o circuito (micro serviços ou sistemas terceiros) seja protegido. Desta forma não ocorre a sobrecarga no sistema queimando diversos componentes dentro deste sistema.

Em programação, a "sobrecarga" pode ser uma condição que seja verificada programaticamente e caso ela ocorra, o circuito é aberto protegendo o sistema que estamos chamando. Por exemplo, o "Meu sistema" precisa enviar emails e para isso ele utiliza um serviço de emails. Em um determinado dia o volume de emails sendo enviados era bem maior do que os envios normais, deste modo o sistema ficou degradado. Após algumas tentativas de envio de email retornarem falha, a condição que abre do Circuit Breaker foi alcançada e por isso ele "desarmou" e abriu para proteger o sistema de emails. Desta forma não estava mais sendo realizado tentativas de envio de email utilizando o sistema de emails. A imagem a seguir demonstra um este exemplo:

{{<figure src="images/01_cb_email.png" title="Imagem representando o fluxo do circuit breaker para o sistema de emails" legend="Imagem representando o fluxo do circuit breaker para o sistema de emails">}}

Em alguns cenários desejamos que ao invés do circuito abrir somente para proteger o sistema que está sendo invocado pode não ser uma boa ideia. Nestes cenário a melhor solução é chamar outro serviço de backup ou que faz o processamento similar. Por exemplo, temos um sistemas de assinatura de projetos e é utilizado um gateway de pagamentos para o processamento destas assinaturas. É muito importante para nós que seja processado o pagamento com sucesso, neste caso fizemos um outro contrato com uma outra empresa de pagamentos para que possamos processar o pagamento com eles caso o gateway principal estaja passando por algum problema. Neste cenário, ao invés do circuit breaker desarmar e não realizar mais requisições, ele irá trocar qual o gateway de pagamentos ele utiliza no momento que ocorrer a condição que fará o circuit breaker abrir. A partir deste momento será realizado o pagamento da transação no gateway de backup.

Em vias normais a o circuit breaker deve se comportar igual na imagem abaixo:

{{<figure src="images/02_cb_gateway_a.png" title="Imagem representando o fluxo do circuit breaker para a normalidade pro processamento de pagamentos das assinaturas" legend="Imagem representando o fluxo do circuit breaker para a normalidade pro processamento de pagamentos das assinaturas">}}

Caso o circuit breaker esteja aberto ou receba algum erro (condicação para o circuit breaker abrir) o fluxo será passado para o gateway de backup conforme na imagem abaixo:

{{<figure src="images/03_cb_gateway_b.png" title="Imagem representando o fluxo do circuit breaker para a condição de abertura do circuit breaker" legend="Imagem representando o fluxo do circuit breaker para a condição de abertura do circuit breaker">}}

Agora que sabemos um pouco da teoria de funcionamento, vamos implementar um exemplo simples?

# Exemplo prático

Para demonstrar o funcionamento do circuit breaker, vamos montar duas aplicações utilizando [Flask](https://flask.palletsprojects.com/en/stable/). Com as aplicações montadas, vamos executar um script com o [Locust](https://locust.io/) para simular a condição de abertura do Circuit Breaker.

Infelizmente não vou explicar o código todo, mas vou destacar as melhores partes e explica-las.

A primeira parte para destacar é a criação da classe `CircuitBreaker`, existe bibliotecas que já possuem implementações até mesmo mais robustas, mas a ideia era implementar algo simples e funcional para explicar o conceito de circuit breaker. No código definimos alguns atributos para a classe CircuitBreaker no intuito de realizar o controle dos erros que ocorrem na chamada do recurso "caro". Os atributos criados são:

* `cb_key` -> Chave do circuit breaker que será usada no cache para sabermos se o circuit breaker foi aberto. Ela é composta pelo prefixo concatenado com a chave;
* `cb_count_key` -> Chave do circuit breaker que é responsável por contar quantos erros ocorreram na chamada do recurso "caro". Toda vez que ocorrer um erro, será incrementado o valor em 1;
* `threshold` -> Quantidade máxima de erros que precisa ocorrer para o circuit breaker abrir;
* `open_time` -> Tempo, em segundos, que o circuit breaker vai ficar aberto até fechar automaticamente novamente.

Com estas variáveis de controle, podemos criar o comportamento do circuit breaker que irá opera automaticamente utilizando um cache para armazenar a quantidade de erros, quando abrir o circuit breaker e quando ele está aberto ou não.

{{<figure src="images/04_attrs_cb.png" title="Atributos do Circuit Breaker" legend="Atributos do Circuit Breaker">}}

Logo após, definimos uma propriedade que indica se o circuit breaker está aberto ou não. Basicamente é feito a consulta no cache e converte a resposta para boolean.

{{<figure src="images/05_is_open_cb.png" title="Propriedade is_open" legend="Propriedade is_open">}}

Outro método que precisamos é o método para incrementar os erros. O Redis (cache_usado na implementação) possui um comando que realiza o incremento para nós de forma fácil e atômica. Desta maneira, basta utilizamos a função dele para que a chave definida em `err_count_key` seja incrementa em 1.

{{<figure src="images/06_increment_errors_cb.png" title="Método para incrementar os erros ocorridos no circuit breaker" legend="Método para incrementar os erros ocorridos no circuit breaker">}}

O último método da classe CircuitBreaker possuí a implementação para realizar a verificação se deve-se abrir (desarmar) ou não o circuit breaker. Basicamente será lido a quantidade de erros e então, caso o valor esteja maior ou igual ao threshold, será adicionado um valor no cache com a chave do atributo `cb_key` e o tempo que o circuit breaker deve ficar desarmado. Com isso a quantidade de erros é resetada para que no futuro possa ser iniciado uma nova contagem.

{{<figure src="images/07_check_cb.png" title="Método para verificar se deve ou não abrir (desarmar) o circuit breaker" legend="Método para verificar se deve ou não abrir (desarmar) o circuit breaker">}}

Bom, somente com essa implementação não temos bem como ativar o circuit breaker em uma chamada cara, para isso iremos criar um `decorator` para que ele faça as verificações e chamadas necessárias.

{{<figure src="images/08_decorator.png" title="Implementação do Decorator" legend="Implementação do Decorator">}}

Na implementação do decorator, vamos receber todos os parâmetros de configuração para instanciar um novo objeto do tipo CircuitBreaker e também vamos receber quais os erros que devemos observar. Caso ocorra algum erro fora dos que estamos observando o Circuit Breaker não deve considerado na contagem de erros para a abertura do mesmo.

Com isso criamos uma função decorator que ira "substituir" a função decorada por uma que fará as verificações do circuit breaker e ira realizar a chamada para o recurso caro que foi decorado. A função que vai substituir, primeiro fará a verificação se o circuit breaker está aberto. Caso esteja, uma exception indicando a abertura é lançada. Depois, é realizado a chamada da função com o recurso caro dentro de um try/except genérico para capturarmos todo os erros que podem ocorrer na chamada. Dentro do bloco except, é verificado se o erro ocorrido é um dos erros que estamos tratando com o circuit breaker. Se for, será incrementado a quantidade de erros e por último será verificado se deve-se abrir ou não o circuit breaker. No final de tudo a exception que ocorreu é lançada para que quem está realizando a chamada do recurso caso possa tratar os erros da forma que achar melhor. Caso não seja, um dos erros esperado, a exception será "relançada" para que quem está chamando do recurso caro possa trata-la da forma que achar mais interessante.

O código pode ser encontrado neste [repositório do github](https://github.com/elyssonmr/circuit_breaker). Ele está um pouco antigo, sorry!! Mas fica o desafio para você melhora-lo usando versões mais novas dos frameworks :)

# Conclusão

Utilizando circuit breaker na sua aplicação, auxiliará em um gerenciamento melhor de recursos da sua aplicação e também na aplicação que está sendo chamada. Se uma aplicação está retornando erro ao ser chamada, pode ser que deixando um período sem realizar chamadas para aquela aplicação possa ajuda-la a se recuperar da degradação que ela esteja sofrendo.

A técnica de circuit breaker usada por si só, pode não ser interessando para a área de negócio da companhia que você trabalha. Está técnica é comumente utilizada com o direcionamento da chamada para um outro sistema de backup conforme foi exporto no [último artigo sobre fallback]({{< ref "posts/20250202_fallback_strategy" >}}). Até hoje toda vez que utilizei circuit breaker, sempre foi associado com a chamada a outro sistema de backup que possuí as "mesmas funcionalidades".

Circuit Breaker é um padrão simples e bem eficiente para proteger a chamada a recursos caros. Da mesma forma que protege as instalações elétricas. Isso faz com que ele seja facilmente utilizado em diversas partes do sistema que estamos desenvolvendo.

**Referencias:**

* [https://martinfowler.com/bliki/CircuitBreaker.html](https://martinfowler.com/bliki/CircuitBreaker.html)
* [https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern)
* [https://imasters.com.br/desenvolvimento/criando-aplicacoes-resilientes-uma-visao-geral](https://imasters.com.br/desenvolvimento/criando-aplicacoes-resilientes-uma-visao-geral)
* [https://www.infoq.com/br/presentations/construindo-aplicacoes-resilientes/](https://www.infoq.com/br/presentations/construindo-aplicacoes-resilientes/)
* [https://pypi.org/project/pybreaker/](https://pypi.org/project/pybreaker/)
* [https://pypi.org/project/lasier/](https://pypi.org/project/lasier/)
