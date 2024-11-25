---
title: "Simulando o cálculo de juros utilizando Python"
date: "2024-11-25T12:00:00-03:00"
draft: false
sidebar: true
slug: 20241125_interest_calculation
thumbnail:
  src: "img/thumbnails/20241125_interest_calculation.jpg"
  visibility:
    - list
categories:
  - "Finanças/Investimentos"
tags:
  - "Investimentos"
  - "Renda Fixa"
  - "Software"
---

Uma coisa que acho bem interessante é tentar simular como que meus investimentos vão se comportar ao longo do tempo. Para isso eu sempre crio algumas simulações testando juros diferentes e também valores diferentes para realizar estes investimentos.

Normalmente eu crio planilhas para isso, porém desta vez vou tentar criar uma pequena aplicação em Python que fará a leitura dos dados para realizar o cálculo de simulações dos investimentos.

<!--more-->

# Introdução

Quando trabalhamos com investimentos é sempre bem satisfatório ver os valores investidos crescerem, porém não conseguimos verificar o crescimento do que ainda não foi realizado. Para este caso a simulação ajuda a termos uma ideia de como o nosso investimento vai crescer.

Neste artigo vamos criar juntos uma pequena aplicação para realizarmos estas simulação, considerando investimentos de renda fixa. Iremos ler os valores de investimento inicial, taxa de juros, aportes mensais e o período investido para conseguirmos realizar simulações sobre investimentos.

Antes de começarmos gostaria de dar um **disclaimer**:

> Este artigo não esta fazendo recomendações de investimentos, **estamos explorando programação utilizando o tema de investimentos como exemplo**. As rentabilidades calculadas não são garantidas mesmo que sejam utilizados valores reais pois estamos desprezando variações nos investimentos e também estamos desprezando eventuais taxas e impostos que podem ser cobradas em diferentes investimentos.

# Desenvolvimento da aplicação

Durante o artigo vamos desenvolver uma aplicação no usando como interface o terminal (eu utilizo Linux, tá?) para ler os valores que precisamos para realizar as simulações. Como forma de utilizar a aplicação em outros contextos, como web por exemplo, vou tentar separar um módulo de cálculos que pode ser reaproveitado em outros tipos de sistemas sem muita dificuldade de integração.

O nosso objetivo é focar no desenvolvimento como um todo, em diversas partes eu não vou entrar muito em detalhes ou até mesmo nem vou cobrir no artigo, porém vou disponibilizar o código todo no final do artigo para estudos. Caso tenha dúvidas, deixe um comentário no artigo que então eu tento saná-la, combinado? Bora para o desenvolvimento.

## Desenvolvimento de uma lib para os cálculos

Para iniciar o desenvolvimento da nossa aplicação, iremos trabalhar na config inicial do projeto e também na codificação do módulo a parte com os cálculos da simulação de rendimentos.

Para configurar o projeto, irei utilizar o (poetry)[] com o Python 3.13 e vou adicionar algumas libs:

* [pytest](https://docs.pytest.org/en/stable/) -> para realizarmos os testes na lib;
* [pytest-cov](https://pytest-cov.readthedocs.io/en/latest/) -> para analisarmos a cobertura dos testes;
* [ruff](https://docs.astral.sh/ruff/) -> para nos ajudar a formatar melhor o código da nossa aplicação;
* [taskipy](https://github.com/taskipy/taskipy) -> para configurarmos comandos de uma forma mais simples;

Não irei entrar nos detalhes da instalação, mas seguindo o tutorial de instalação e uso do poetry já deve ser o suficiente para configurar o projeto.

Existem algumas configurações a mais para serem feitas no `pyproject.toml`, vou adicionar um print destas configurações para que possamos estar padronizados nos uso das ferramentas e também no formato do código.

{{<figure src="images/configs.png" title="Configurações no pyproject.toml" legend="Configurações no pyproject.toml">}}

Iniciando o desenvolvimento vamos criar um novo pacote chamado `simulation`, dentro dele iremos adicionar o `__init__.py` (posteriormente vou demonstrar uma técnica bem interessante usando o `__init__.py`). Também vamos criar um módulo chamado de `fixed_income.py` que irá abrigar os cálculos que faremos para simular.

Para finalizar a estrutura, vamos criar um sub-pacote dentro do pacote `simulation` chamado `tests` juntamente com o `__init__.py`. Este sub-pacote abrigará os testes que faremos para o código referente ao módulo `simulation`. A estrutura do pacote `simulation` deve ficar assim:

{{<figure src="images/struct_simulation.png" title="Estrutura do pacote simulation" legend="Estrutura do pacote simulation">}}

Antes de começarmos a implementar o código, vamos rever a formula de juros compostos e a formula de juros compostos com aportes mensais? Precisamos destas duas formulas para podermos calcular os cenários:

1. Investimento inicial sem aportes mensais. Consideramos o valor inicial positivo e o valor dos aportes como zero;
2. Investimento inicial com aportes mensais. Consideramos ambos os valores como positivo;
3. Sem investimento inicial e aportes mensais. Consideramos o valor inicial zerado e os aportes positivo;


A formula de juros compostos sem aporte é:

{{<figure src="images/future_value_formula.png" title="Juros compostos sem aportes" legend="Juros compostos sem aportes">}}

A formula de juros compostos dos aportes é:


{{<figure src="images/future_value_formula_payments.png" title="Juros compostos com aportes" legend="Juros compostos com aportes">}}


Ao pesquisar no Google, a IA do Gemini deu uma resposta concatenando as duas formulas (a título de curiosidade):

{{<figure src="images/01_google_result.png" title="Resposta Gemini das fórmulas concatenadas" legend="Resposta Gemini das fórmulas concatenadas">}}

O resultado do cálculo basicamente será o resultado das duas formulas aplicadas juntas, pois será contado os juros sobre o valor inicial e sobre os aportes.

Agora iremos trabalhar no módulo `fixed_income.py` e codificar a simulação.

Posteriormente iremos adicionar mais funcionalidades para esta lib, porém agora somente iremos codificar os cálculos.

Vamos declarar uma classe na nossa lib que irá receber o montante inicial, o valor do juros (mensal) e o valor do aporte mensal. Também iremos declarar uma função chamada de `simulate` recebendo um argumento que será o período para a realização do cálculo. Ao final do calculo ela irá retornar o valor total. O Código deve ficar algo assim:

{{<figure src="images/code/code02.png" title="Estrutura da classe FixedInterestSimulator" legend="Estrutura da classe FixedInterestSimulator">}}

Com a estrutura inicial criada, nós iremos agora implementar o código referente as fórmulas que colocamos mais acima. A primeira fórmula que iremos trabalhar é a formula que considera somente o valor inicial. A implementação deve ficar assim:

{{<figure src="images/code/code03.png" title="Implementação da função future_value_without_contribution" legend="Implementação da função future_value_without_contribution">}}

Ahh um ponto bem importante... Temos um problema bem complexo de resolver aqui que é arredondamento. Para facilitar a nossa vida, vamos considerar os arredondamentos que são calculados automaticamente, ok? Somente vamos nos preocupar em manter o decimal com 2 dígitos após a virgula. Os arredondamentos podem causar alguns centavos de diferença, mas para simular não tem muito problema.

Também fiz os testes referentes a função que acabamos de implementar testando alguns cenários. O código ficou assim:

{{<figure src="images/code/code04.png" title="Testes da função future_value_without_contribution" legend="Testes da função future_value_without_contribution">}}

OBS: em caso tenha dúvidas, deixe um comentário que vou tentar ajudar a sanar a dúvida.

Com a primeira formula implementada, vamos criar um novo método para implementar a segunda fórmula. A fórmula que iremos implementar é a formula do calculo de juros com aportes mensais. Esta formula basicamente considera o valor mensal e irá calcular os juros compostos de acordo com o período fornecido. Um ponto importante é que quando realizamos um aporte, o juros referente aquele aporte somente será considerado 1 mês depois, ou seja, se utilizarmos a formula para um período de 1 mês, não teremos os juros pois o período é muito curto. A formula faz este cálculo para nós no aplicando o `-1` no calculo dos juros, desta forma sempre teremos 1 período a menos no total pois o último aporte não passara pelo período todo para que os juros sejam calculados (o valor retornado deve ser o valor do aporte). Teremos um teste para simular este comportamento.

A implementação do segundo método ficará assim:

{{<figure src="images/code/code05.png" title="Testes da função future_value_with_contribution" legend="Testes da função future_value_with_contribution">}}

Também foi feito os testes a função que acabamos de implementar testando alguns cenários. O código ficou assim:

{{<figure src="images/code/code06.png" title="Testes da função future_value_with_contribution" legend="Testes da função future_value_with_contribution">}}

Com os dois métodos implementados, iremos, finalmente, implementar a função `simulate` que agregará o resultado das duas funções. Desta forma conseguimos utilizá-la para todos os cenários que levantamos acima. Basicamente iremos retornar aa soma do resultado das duas funções que criamos previamente:

{{<figure src="images/code/code07.png" title="Implementação da função simulate" legend="Implementação da função simulate">}}

Para testar, como já testamos bem as demais funções, somente criei testes para garantir que os cenários que definimos mais acima estejam funcionando corretamente. Os teste ficaram:

{{<figure src="images/code/code08.png" title="Testes da função simulate" legend="Testes da função simulate">}}

Por enquanto esta é a implementação que faremos no módulo `fixed_income.py`. No próximo tópico iremos criar uma pequena aplicação simples usando o terminal que fará a leitura dos dados e irá utilizar o que já implementamos até agora para realizar as simulações.

## Realizando chamadas na lib para simular valores

Agora que temos o código para simular pronto, podemos fazer uma pequena aplicação usando o terminal para realizar as simulações de investimentos. Basicamente iremos imprimir um menu de opções e ao escolher a opção para simular iremos ler os valores referente ao investimento inicial, aporte mensal, taxa de juros e o tempo do investimento. Então realizaremos a simulação e para cada período iremos imprimir o valor total do período, ou seja, iremos indicar no output da aplicação o valor de cada mês até que o prazo do investimento seja finalizado.

{{<figure src="images/code/code09.png" title="Main da aplicação" legend="Main da aplicação">}}

O código foi escrito dentro do módulo `__main__.py` na raiz do projeto. Resumidamente, o código cria um loop onde a condição de saída é escolher a opção para encerrar. Caso seja escolhida a opção para realizar a simulação, serão lidos as informações para realizar a simulação e então a aplicação irá imprimir os valores futuros mensalmente.

Agora temos uma aplicação simples porém funcional que podemos realizar diversas simulações de renda fixa, utilizando valores diferentes de investimento inicial, de taxas e de aportes mensais.

## Gerando um CSV com os valores simulados

Bora incrementar um pouco a nossa aplicação? Que tal a gente gerar dados em um arquivo CSV de tal forma a sabermos os totais de dinheiro que foram investidos, totais de juros e total investido?

Para entendermos melhor este cenário, vamos montar um exemplo? Se investirmos inicialmente o valor de 1000,00 (valor inicial), a uma taxa de 1% (taxa de juros) durante 10 meses (períodos). Teremos um valor futuro total de 1104,62, deste valor 1000,00 é o valor inicial e os total de juros é 104,62.

A abordagem será diferente do que já implementamos até agora para que possamos totalizar todos os dados que precisamos para gerar o arquivo CSV. Por causa disso, vamos criar uma nova classe no módulo `fixed_income.py` que fará as contas e armazenará os dados mês a mês e no final irá retornar um stream para que possamos salvá-lo da forma que acharmos melhor.

Primeiro vamos declarar uma classe chamada `FixedInterestDataSimulator`, nela iremos criar um construtor e a função `simulate` (estrutura parecida com a outra classe de simulação que fizemos). A diferença é que no construtor iremos implementar um novo atributo chamado `monthly_data` que será uma lista contendo os dados calculados mês a mês da simulação. Também já deixarei criado o método para gerar o CSV. A estrutura da classe com o construtor implementado deve ficar assim:

{{<figure src="images/code/code10.png" title="Implementação da classe FixedInterestDataSimulator" legend="Implementação da classe FixedInterestDataSimulator">}}

Antes de pularmos para dentro do código, vamos entender como que será o cálculo?

No primeiro mês iremos somar o valor inicial, com o aporte e então calcularemos o juros referente ao valor inicial (aqui estamos considerando que é o final do primeiro mês). A partir do segundo iremos pegar total do mês anterior, aplicar os juros e somar com o aporte mensal, a cada mês subsequente repetiremos a esta conta. Ainda confuso? Vamos montar um exemplo com números para ficar mais fácil:

Valor inicial => 1000.00
Valor aportes => 100
Taxa juros mensais => 1%

| Mês | Valor total aportado | Valor Juros | Valor total |
| --- | -------------------- | ----------- | ----------- |
| 1   | 1100,00              | 10,00       | 1110,00     |
| 2   | 1200,00              | 21,10       | 1221,10     |
| 3   | 1300,00              | 33,31       | 1333,31     |

Racional do primeiro mês:
* O total aportado foi 1100,00, que é o valor inicial mais o valor do aporte.
* O valor do juros foi 10,00, que é referente a 1% (taxa de juros mensais) do valor inicial.
* O valor total é a soma to valor total aportado e a taxa de juros.

Racional do segundo mês:
* O total aportado foi de 1200,00, que é o valor inicial mais 2 aportes realizados.
* O valor de juros foi 21,10, que é referente a 1% (taxa de juros mensais) do valor total referente ao mês anterior (primeiro mês).
* O valor total é a soma do valor total do primeiro mês mais os juros referente ao total do mês passado (primeiro mês), por último adicionamos o valor referente ao aporte mensal.

O racional do terceiro mês segue a linha do racional do segundo, porém vou deixar para você fazer mentalmente para fixar o conhecimento. Qualquer dúvida só publicar um comentário que eu respondo sanando as dúvidas.

Agora que estamos na mesma página do funcionamento, vamos implementar o cálculo refente ao primeiro mês:

{{<figure src="images/code/code11.png" title="Implementação do método simulate" legend="Implementação do método simulate">}}

Na implementação nós criamos uma variável auxiliar para cada totalizador, uma para o valor total aportado, uma para o valor dos juros e outra para o valor total dos aportes somados ao juros. Com estas variáveis iremos preencher uma lista com os totalizadores de cada período, lembrando que por enquanto fizemos somente do primeiro mês.

Também criei um teste para garantir esta parte:

{{<figure src="images/code/code12.png" title="Implementação do teste no método simulate" legend="Implementação do teste no método simulate">}}

Agora vamos implementar para os demais meses:

{{<figure src="images/code/code13.png" title="Implementação do cálculo dos demais meses do método simulate" legend="Implementação do cálculo dos demais meses do método simulate">}}

Na implementação, nós fizemos um `for` para ir realizando os cálculos e adicionar na lista de totalizadores mês a mês. Os cálculos realizados foram:

* O cálculo do totalizador de valores investidos aplicamos o valor do aporte realizado naquele mês;
* O cálculo do totalizador de valor futuro aplicamos a taxa no valor futuro que foi totalizado na última interação e somamos com o valor do aporte (pois neste valor não aplicamos a taxa);
* O cálculo do totalizador de juros iremos subtrair o total de valor investido do valor futuro total que calculamos;

OBS: Observe que fiz uma pequena refatoração na implementação referente ao primeiro mês para ficar mais padronizado com o que fizemos para os demais meses.

Também fiz mais alguns testes para garantir que tudo esteja funcionando adequadamente:

{{<figure src="images/code/code14.png" title="Implementação dos testes para o cálculo dos demais meses do método simulate" legend="Implementação dos testes para o cálculo dos demais meses do método simulate">}}

OBS: No testes com dois meses, o `assert` verifica se tem os dois itens com os totalizadores de valores nos dados de cada mês, porém nos demais testes somente verifico o último mês para não ficar muito grande.

Finalmente chegamos na parte mais importante deste tópico que é gerar o CSV com os dados que calculamos. Para a geração vamos utiliza o próprio módulo de CSV do Python que provê uma interface simples para podemos gerar o arquivo.

No nosso exemplo, iremos gerar o arquivo CSV dentro de um [StringIO](https://docs.python.org/3/library/io.html#io.StringIO) para que quem invocou a simulação possa decidir o que fazer com o CSV gerado.

para gerar o CSV, vamos implementar o método `generate_csv`. Nele nós iremos instanciar um novo [gerador de CSV](https://docs.python.org/3/library/csv.html#csv.DictWriter), escrever a primeira linha com os títulos das colunas do CSV e então escreveremos os dados totalizados que foram calculados juntamente com o número do mês correspondente. O código escrito foi:

{{<figure src="images/code/code15.png" title="Implementação do método generate_csv" legend="Implementação do método generate_csv">}}

O teste para garantir que o CSV esteja gerado corretamente foi:

{{<figure src="images/code/code16.png" title="Implementação do teste para o método generate_csv" legend="Implementação do teste para o método generate_csv">}}

Um ponto importante que vale ressaltar é que caso não tenha dados, não iremos conseguir chamar a função `generate_csv` para gerar os dados do CSV. Somente será gerado o CSV com os títulos. Por este motivo que a função para gerar o CSV foi criada com o argumento `period`, desta forma poderemos realizar os cálculos caso eles já não tenham sido realizados. Podemos até considerar que este método seja o principal desta classe, mas não faremos nenhuma modificação com relação a isto além de verificar se devemos realizar os cálculos ou não.

O ajuste para realizar os cálculos ficou assim:

{{<figure src="images/code/code17.png" title="Implementação do ajuste no método generate_csv" legend="Implementação do ajuste no método generate_csv">}}

No teste referente a este método podemos tirar a chamada para o método `simulate` garantindo que entre no `if` e realize os cálculos dos períodos. Desta forma teremos 100% de cobertura de código.

Terminamos de implementar a geração do arquivo CSV. No próximo tópico, vamos implementar a chamada na aplicação de terminal que criamos previamente para gerar o CSV.

## Realizando chamadas na lib para gerar o CSV

Para realizar a chamada vamos adicionar uma nova opção para gerar o CSV e então faremos a chamada para o método que gera o CSV (igual fizemos na simulação do valor final). O código para gerar o CSV é:

{{<figure src="images/code/code18.png" title="Implementação da geração do CSV" legend="Implementação da geração do CSV">}}

No exemplo:

* Valor Inicial: **1000,00**
* Taxa de juros: **1%**
* Aportes mensais: **250,00**
* Período: **60 meses (5 anos)**

Foi obtido a seguinte {{<assetnewtab title="simulação" src="content/simulation.csv">}}.

O código de tudo que implementamos está disponível no meu [github](https://github.com/elyssonmr/interest_calculator).

# Conclusão

Podemos utilizar programação para diversos fins. A linguagem python ajuda a implementar um diversas coisas diferentes desde simulações até aplicações web completas.

Com o módulo de simulação, poderemos reaproveita-lo para criar uma simulação utilizando diversos tipos de aplicações diferentes. Podemos por exemplo, criar uma aplicação WEB que faça os cálculos de juros compostos e retorne uma página com a demonstração destes cálculos. Caso queira exportar, já temos implementado o método para gerar o CSV. Este método retornando um StringIO, deixa ele genérico o suficiente para salvarmos o arquivo ou retorna-lo na aplicação web.

Problemas do dia a dia podem ser resolvidos utilizando programação. Sempre que vejo algum investimento novo eu fico me perguntando o quanto melhor ele é em relação a investimentos de renda fixa ou se a taxa do investimento é interessante no longo prazo. Para isso eu preciso realizar algumas simulações para saber qual opção é melhor, montar uma aplicação assim ajuda muito neste processo.

Existem diversas oportunidades de melhorar e fazer o código diferente do como fizemos. Algumas decisões de design do código foram tomadas para privilegiar a facilidade de leitura e entendimento do mesmo. Pode-se, por exemplo, implementar somente uma classe de simulação. A decisão de se implementar duas foi tomada para separarmos a responsabilidade e também por causa de complexidade algorítmica do código, para calcular o valor total não é preciso passar os valores mês a mês conforme foi feito na classe `FixedInterestDataSimulator`. Apesar de que podemos muito bem utilizar somente ela para ambos os cenários.

**Referências**

* [https://riconnect.rico.com.vc/blog/juros-compostos/](https://riconnect.rico.com.vc/blog/juros-compostos/)
* [https://www.calculatorsoup.com/calculators/financial/future-value-calculator.php](https://www.calculatorsoup.com/calculators/financial/future-value-calculator.php)
