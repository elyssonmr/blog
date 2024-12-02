---
title: "API de cálculo de juros compostos"
date: "2024-12-02T12:00:00-03:00"
draft: false
sidebar: true
slug: 20241202_future_value_web
thumbnail:
  src: "img/thumbnails/default_thumbnail.jpg"
  visibility:
    - list
categories:
  - "Finanças/Investimentos"
tags:
  - "Python"
  - "FastAPI"
  - "Projeto"
  - "Software"
---


No [último artigo]({{<ref "posts/20241115_interest_calculation/index">}}) nós vimos sobre como podemos utilizar python para criar uma calculadora simples de juros compostos para realizarmos simulações de investimento.

Neste artigo nós iremos criar uma API com o FastAPI a partir do código que fizemos para realizar simulações no último artigo.

<!--more-->

# Introdução

No desenvolvimento de software, as vezes criamos alguns componentes de software que são genéricos o suficiente para serem utilizados em diversos sistemas. Estes componente são comumente chamados de bibliotecas (libs). Podemos pegar essas libs de repositórios de bibliotecas como o [PyPI](https://pypi.org/) para a linguagem Python, ou como o [NPM](https://www.npmjs.com/) para NodeJS. Cada uma das linguagens mais utilizadas possuem um ou mais repositórios públicos de bibliotecas para que possamos fazer o download destas bibliotecas.

Neste artigo nós iremos utilizar o conceito de bibliotecas, mas por enquanto não vamos adicionar uma biblioteca criada por nós no nosso sistema. Iremos somente fazer a utilização do pacote `simulation` que criamos no último artigo. Caso não se lembre, o [artigo pode ser conferido aqui]({{<ref "posts/20241115_interest_calculation/index">}}).

Sem enrolar muito, bora criar a API web? Vou seguir a mesma linha que o último artigo explicando somente o essencial e deixando os recursos que vamos utilizar decidir sobre como será apresentado os dados para não complicar muito a explicação.

A API que vamos criar fará 3 simulações:

1. Cálculo do valor futuro (Montante + Juros);
2. Simulação mensal dos valores (total investido, total de juros e valor futuro total);
3. Simulação mensal dos valores, mas retornando um arquivo CSV;

# Desenvolvimento

Vou iniciar o desenvolvimento da onde paramos no último artigo, caso não tenha o repositório faça o clone do [repositório](https://github.com/elyssonmr/interest_calculator) que estaremos na mesma página.

Com o repositório clonado, vamos criar a branch `web` para não misturar o código que fizemos no último artigo.

Já na nova branch, vamos adicionar o `fastapi[standard]` com o comando:

```
poetry add --group web fastapi[standard]
```

Desta forma iremos criar um novo grupo no `pyproject.toml` chamado `web` com as dependências necessárias. Utilizando o `fastapi[standard]` já é instalado tudo que precisamos para executar a API, para validar os inputs e etc.

Agora vamos estruturar um novo pacote que conterá a nossa API. Primeiro vamos criar um pacote chamado `web`, dentro dele vamos criar o `__init__.py`, `app.py`, `routes.py` e `schemas.py`. Está é uma arquitetura "minima" para organizar uma API feita com FastAPI.

Ahh... estava me esquecendo do testes. Basicamente vamos criar a o módulo `tests` dentro do pacote `web` e juntamente com o `__init__.py`.

Com os arquivos criados, devemos ter o projeto parecido com:

{{<figure src="images/code/code01.png" title="Arquitetura da API web" legend="Arquitetura da API web">}}

## Implementando o schemas.py

Vamos iniciar a implementação da API pelos "schemas". Os schemas nada mais são do que modelos do [Pydantic](https://docs.pydantic.dev/latest/) de input/output que o FastAPI consegue reconhecer, disparar a validação e criar um objeto para nós com a request que veio na API ou converter um modelo em JSON ao responder um endpoint com um modelo.

O primeiro modelo que vamos criar é o `SimulationRequest` (adicionando o nome request ao modelo ajuda a identificar que ele é um modelo de request), ele será o nosso input universal para todos os endpoints da API. O código do modelo ficou assim:

{{<figure src="images/code/code02.png" title="SimulationRequest" legend="SimulationRequest">}}

Basicamente temos os dados que precisamos para realizar uma simulação, seja ela com o valor final, gerar os dados mês a mês e para gerar o CSV igual nós fizemos no último artigo.

Utilizando typing do Python juntamente com alguns recursos do Pydantic, conseguimos identificar quais validações que devemos fazer nos campos, por exemplo, os campos que representam dinheiro podem ser expressados pelo "tipo" que criamos no código chamado `Money` e para representar o juros criamos o "tipo" `Interest`. Desta forma podemos utiliza-los no `SimulationRequest` e em outros models que iremos criar também.

No tipo `Money`, estamos definindo que ele é do tipo `Decimal` e estamos especificando algumas restrições para serem validadas:

* A quantidade de dígitos antes da virgula foi limitada em 9 dígitos;
* A quantidade de dígitos após a virgula foi limitada em 2 dígitos;
* O valor padrão é um Decimal com o valor `0.00`;
* Por último definimos que o valor somente pode ser maior do que `0.00`, caso seja especificado valores negativos a validação irá falhar;

Para os períodos utilizamos o tipo `PositiveInt` do Pydantic. Como o próprio nome diz, ele somente aceita inteiros positivos (maiores do que 0).

O segundo model que iremos criar é o model `SimulationResponse` que será retornado como resposta do endpoint que fará o cálculo do valor futuro total (este inclusive será o primeiro endpoint que iremos implementar). Este model basicamente irá retornar a quantidade de períodos do cálculo e o valor total:

{{<figure src="images/code/code03.png" title="SimulationResponse" legend="SimulationResponse">}}

O terceiro model será o `PeriodInfo` que conterá as informações de cada período da simulação que usaremos para retornar o os dados de cada período na resposta do endpoint. Ele basicamente possui qual o mês, valor total investido, valor total de juros e o valor futuro no mês. O model ficou assim:

{{<figure src="images/code/code04.png" title="PeriodInfo" legend="PeriodInfo">}}

O último modelo é o mais simples de todos. No `SimulationDataResponse` (response para identificar que é um model de resposta de um endpoint), teremos uma lista de `PeriodInfo` no campo `simulation`. Basicamente este modelo é um wrapper da lista retornada pela simulação que gera os valores mensais.

{{<figure src="images/code/code05.png" title="SimulationDataResponse" legend="SimulationDataResponse">}}

Ahh... para retornar o CSV, nós iremos utilizar uma classe do FastAPI pois vamos retornar um arquivo. Não é necessário criar um modelo para isso.

## Implementando o routes.py

O módulo de routes será onde iremos desenvolver os endpoints da API. Como é uma API simples, vamos fazer todos os 3 endpoints em um único arquivo para deixar mais fácil a leitura. APIs mais complexas normalmente dividem os endpoints em mais de um arquivo de acordo com cada contexto, mas não é o nosso caso por enquanto.

Primeiro, iremos criar um roteador para que possamos criar um prefixo no Swagger que o FastAPI monta automaticamente para nós. Para implementar este roteador, vamos fazer o import: `from fastapi.routing import APIRouter` e cria-lo como uma variável no módulo:

{{<figure src="images/code/code06.png" title="Roteador com a tag Simulation" legend="Roteador com a tag Simulation">}}

Com o roteador criado, nós podemos criar o endpoint que irá simular o valor futuro total.

Para declarar um novo endpoint, precisamos criar uma função e decora-la com, por exemplo, `router.post('/path', response_model=ResponseSchema)` para criar um POST para o endpoint. O primeiro argumento deve ser qual é a rota do endpoint enquanto que os demais argumentos são configurações para o endpoint. Nós nossos endpoints, vamos configurar somente a rota e o tipo da resposta. Passando um argumento para a função com um schema do Pydantic permite que o FastAPI já faça a validação e monte o objeto para nós.

{{<figure src="images/code/code07.png" title="Rota de simulação de valor futuro" legend="Rota de simulação de valor futuro">}}

A implementação do endpoint consiste em instanciar um `FixedInterestSimulator`, passando como argumentos no construtor os valores do `SimulationRequest` que o FastAPI validou e instanciou no argumento `simulation_data`. Depois chamamos o método simulate, passando a quantidade de períodos como argumento. Com o resultado da simulação, criamos uma instância de `SimulationResponse` passando como argumento para o construtor os valores necessários para construí-lo. Desta forma o FastAPI vai criar a resposta no formato JSON a partir deste objeto de resposta.

Um ponto que vale destacar aqui é que estamos importando o simulador diretamente do pacote `simulator`, porém no último artigo deixamos o as classes de simulação dentro do módulo `simulator.fixed_income`. Bom, elas ainda continuam! A diferença foi que utilizei um recurso do Python que nos permite concentrar recursos em um único ponto, fazendo com que quem estiver de fora não precise conhecer toda estrutura do pacote. Para conseguirmos realizar o import diretamente do pacote, precisamos importar os recursos que queremos no `__init__.py` do pacote e declarar uma variável `__all__` para quando é realizado um `from simulation import *`. Isto pode facilitar muito a vida, principalmente em cenários que ocorrem muitas refatorações.

{{<figure src="images/code/code08.png" title="Import na raiz do pacote" legend="Import na raiz do pacote">}}

O próximo endpoint que vamos implementar irá retornar os dados da simulação mês a mês. A declaração do endpoint segue o mesmo principio do que já fizemos, so divergindo na rota e em qual objeto de resposta será retornado.

{{<figure src="images/code/code09.png" title="Rota de simulação de valor futuro com os dados mensais" legend="Rota de simulação de valor futuro com os dados mensais">}}

A implementação também segue a mesma linha do endpoint que já implementamos. Nós instanciamos o simulador que gera os dados, invocamos o método simulate e então montamos o objeto de resposta. Observe que utilizamos o método `model_validate` de um model do Pydantic para que possamos criar um novo model a partir de um `dict`.

O último endpoint é o endpoint que gera os dados mês a mês (igual o segundo endpoint) e ao final cria o CSV para que possamos retornado como resposta do endpoint. Neste endpoint iremos declarar ele com a rota e ao invés de utilizar o argumento nomeado `response_model` iremos utilizar o `response_class` para podermos utilizar o `StreamingResponse` do FastAPI que sabe lidar com o download de arquivos.

{{<figure src="images/code/code10.png" title="Rota de geração do arquivo CSV com a simulação" legend="Rota de geração do arquivo CSV com a simulação">}}

Na implementação foi instância do o simulador (igual fizemos nos demais) depois chamamos o método `generate_csv` (lembra que fizemos ele retornar um `StringIO` e quem chamou decidiria o que fazer com o arquivo?) e com o resultado montamos uma resposta contendo o "arquivo anexado". No final do endpoint retornamos a instância do objeto de resposta e então o FastAPI se encarrega do restante para nós.

Com os endpoints implementados, agora precisamos criar a API para que possamos interagir com ela.

## Implementando o app.py

Estamos no momento de criarmos a API para então conseguirmos realizar chamadas HTTP para ela de tal forma a realizar as simulações de investimentos.

Dentro do `app.py` vamos importar o `FastAPI` e o roteador que criamos previamente. Então iremos declarar um novo APP e incluir o roteador neste app. Pronto!! Já temos a nossa aplicação configurada. O código deve ficar parecido com:

{{<figure src="images/code/code11.png" title="Declaração da API" legend="Declaração da API">}}

Com isso já temos o necessário para rodar a nossa api através do comando `fastapi dev web/app.py` ou `task server` (que foi definido no `pyproject.toml`). Após executar a aplicação, você pode acessar o swagger que o FastAPI gerou na url: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## Implementando testes

Para finalizar a implementação vamos fazer uns testes? Como estou estamos utilizando o pytest neste projeto, iremos utilizar o recurso de [fixtures](https://docs.pytest.org/en/6.2.x/fixture.html) para poder criar um client http para nos ajudar nos testes.

Dentro da pasta de `tests` que criamos no inicio deste artigo, vamos criar o módulo `conftest.py` e nele iremos criar a fixture com o client http.

{{<figure src="images/code/code12.png" title="Criação do client http para os testes" legend="Criação do client http para os testes">}}

No código, nós fizemos os imports necessários e criamos a fixture. Na implementação da `fixture` utilizamos um `TestClient` do próprio FastAPI e "retornamos" o client com o `yield` pois é necessário desalocar este recurso (por isso usamos com um `with`). O Pytest se encarrega em gerenciar o context manager para nós, pois ele consegue reconhecer que precisa continuar a execução posterior ao `yield` para encerrar o `context manager`.

Agora vamos implementar os testes. No arquivo `test_simulations.py` nós iremos criar 3 teses (um para cada endpoint) para testarmos os endpoints que criamos.

{{<figure src="images/code/code13.png" title="Teste do endpoint de simulação do valor futuro" legend="Teste do endpoint de simulação do valor futuro">}}

No teste utilizamos o client criado (passado via parâmetro para função) para realizar a chamada para a API. A utilização é simples, basta chamarmos o método do verbo que precisa ser utilizado e então passamos alguns argumentos: qual o caminho relativo do endpoint (não é necessário se preocupar com o endereço e a porta) e qual o JSON da requisição. Feito isso será realizado a request com os parâmetros informados e então uma resposta será retornada.

Posteriormente vamos inspecionar a resposta para verificar se a chamada foi realizada com sucesso e a resposta está de acordo com o esperado.

O segundo e terceiro teste, segue a mesma linha:

{{<figure src="images/code/code14.png" title="Demais testes" legend="Demais testes">}}

Vale destacar que no terceiro teste foi necessário fazer o decode da resposta, pois ela não é um JSON e sim o arquivo CSV. Porém quando retornamos arquivos nas respostas, eles são binários e para conseguirmos verificar se forma fácil, precisamos fazer o decode do conteúdo para ele voltar a ser texto novamente.

Podemos utilizar o Swagger gerado para realizarmos testes simulando as aplicações requisitando a API. Por exemplo, para testar o endpoint de valor futuro com a simulação mês a mês:

* Valor Inicial: **1000,00**
* Taxa de juros: **1%**
* Aportes mensais: **250,00**
* Período: **60 meses (5 anos)**

{{<figure src="images/test_swagger01.png" title="Realizando simulação via swagger" legend="Realizando simulação via swagger">}}

Após realizar a chamada a resposta retornada foi:

{{<figure src="images/test_swagger02.png" title="Resposta simulação via swagger" legend="Resposta simulação via swagger">}}

Todo código que fizemos está disponível no [repositório do github](https://github.com/elyssonmr/interest_calculator/tree/web).

# Conclusão

Como fizemos o código no [último artigo]({{<ref "posts/20241115_interest_calculation/index">}}) já pensando em reaproveita-lo em outro momento conseguimos rapidamente criar uma API utilizando a "biblioteca" que criamos previamente. Desta forma conseguimos com a ajuda do FastAPI criar uma API web de modo fácil e rápido utilizando os cálculos e simulações que já havíamos feitos previamente.

Frameworks como o FastAPI ajudam a fazer desenvolvimentos bem rápidos para conseguirmos prototipar uma web API por exemplo. Claro que no nosso artigo nós utilizamos as configurações padrões do FastAPI e do Pydantic, ou seja, não nos preocupamos em formatar o input e o output, deixamos para que o FastAPI/Pydantic faça a formatação para nós. Por este motivo que os valores monetários foram formatados como string na resposta. Para alguns cenários seria necessário formatar de uma forma diferente, mas no escopo do artigo não abordamos esta formatação.

Tendo uma "biblioteca" genérica na aplicação, conseguimos utilizá-la com diversas interfaces. Neste artigo utilizamos uma interface WEB e enquanto que no último artigo utilizamos uma interface via linha de comando para montar a aplicação. Este reaproveitamento de código foi possível pois montamos o pacote `simulation` de forma genérica deixando fácil reaproveita-lo em diversos contextos.
