---
title: "Dicas de como mockar seus testes"
date: "2024-12-31T20:00:00-03:00"
draft: false
sidebar: true
slug: 20241231_tests_hints
thumbnail:
  src: "img/thumbnails/default_thumbnail.jpg"
  visibility:
    - list
categories:
  - "Testes Software"
tags:
  - "Python"
  - "Testes Unitários"
  - "Mocks"
---


Testes unitários estão presentes em quase todos projetos de software (sim tem alguns que ainda não usam. Talvez pelo tamanho???). Porém podem ser uma faca de dois gumes: traz um alto valor para o projeto ou é utilizado para somente dar cobertura de código devido a não utilização adequada das ferramentas. Neste artigo vou apresentar alguns cenários de testes unitários utilizando mocks que não trazem um bom valor para seus testes e como contorna-los.

<!--more-->

# Introdução

Todos os níveis de teste são muito importantes para um projeto de software. Eles nos ajudam a termos mais segurança em realizar alterações no sistema sem impactar o restante da aplicação.

Implementar todos os níveis e testes possíveis pode ser muito caro, tanto para o desenvolvimento dos testes quando para a execução. Em alguns projetos não é implementados testes end-to-end por exemplo, porém podemos ainda assim ter muito valor dos testes que foram implementados caso eles estejam sendo feitos corretamente.

Neste artigo vou trazer três cenários que encontrei recentemente em alguns projetos que trabalho. Nestes cenários os testes não estão testando muito bem o que eles estão propondo testar e por isso vou mostrar como contornar estes cenários.

# Cenários

Os cenários que vou apresentar podem não ser cenários que você veja no seu dia a dia, ainda mais porque são cenários em Python e devido a características da linguagem nem sempre podem aplicar a outras linguagens. Porém, eu vou tentar explicar da forma mais genérica possível e acredito que o conceito que será demonstrado pode ser aplicado em outras tecnologias.

## Cenário 1

Este é um cenário dos mais comuns que já vi em diversos projetos que já trabalhei na minha carreira.

Bom... Python nos permite passar parâmetros para funções (argumentos no caso de métodos) de diversas formas. Por ser uma linguagem dinâmica, muitos projetos adotaram o padrão de passar argumentos das funções nomeados mesmo que os argumentos sejam posicionais. A vantagem disso é conseguimos ver totalmente explicito quais parâmetros estão passando e em tempo de execução ambas as formas de chamar funcionam. Exemplo:

```python
def soma(operador1, operador2):
    return operador1 + operador2


print(soma(operador1=5, operador2=10))
print(soma(5, 10))
```

Mas Ely, qual o problema deste cenário?? O problema está em como vamos testar o cenário de mockar uma destas chamadas que passamos argumentos nomeados ou não. Para mostrar um exemplo de mock eu vou trazer um outro cenário de código para exemplificação pois a função de soma que fizemos não é necessária mockar devido a não ser realizar operações caras ou demoradas.

No cenário de exemplo, nós temos uma função que recebe dados transformados de um ETL e os grava no banco de dados. Basicamente consultamos a API de Pokemons e então iremos salvar os nomes dos Pokemons no banco de dados. Para testarmos está função, vamos precisar mockar a chamada de salvamento no banco de dados e é nesta função que vamos aplicar este primeiro cenário. No código abaixo estamos realizando a chamada passando argumentos nomeados:

{{<figure src="images/code/code01.png" title="Função para salvar os nome dos Pokemons" legend="Função para salvar os nome dos Pokemons">}}

No código de exemplo, estamos chamando a função que irá salvar os nomes dos Pokemons no banco de dados utilizando argumentos nomeados (detalhe que a função somente declara argumentos).

No teste da função, iremos mockar a chamada da função que salva os nomes no banco de dados (está função foi somente declarada sem haver implementação concreta no nosso exemplo) para mantermos o escopo do teste somente na função que salva nomes. Basicamente vamos criar uma lista de pokemons, chamar a função que queremos testar e verificaremos se o mock foi chamado conforme o esperado:

{{<figure src="images/code/code02.png" title="Teste da função para salvar os nome dos Pokemons" legend="Teste da função para salvar os nome dos Pokemons">}}

Executando os testes, teremos 100% de cobertura no módulo `helpers.py`.

{{<figure src="images/scenario1_coverage.png" title="Output do terminal após a execução dos testes" legend="Output do terminal após a execução dos testes">}}

Até agora ainda não temos nenhum problema, mas se trocarmos o como a chamada é feita o teste irá quebrar, mesmo que em tempo de execução não faça "diferença" no funcionamento da aplicação. Vamos fazer essa troca? Iremos tirar o argumento nomeado e utilizar como argumento posicional:

```python
save_pokemon_name(pokemon_name)
```

Com a alteração feita, vamos executar novamente os testes:

{{<figure src="images/scenario1_fail.png" title="Output do terminal após a execução dos testes" legend="Output do terminal após a execução dos testes">}}

Opa... parece que o Mock não conseguiu reconhecer a chamada que estávamos esperando devido a termos trocado o como a chamada a função foi feita. De fato a chamada é diferente, mas em tempo de execução ambas as chamadas funcionam igual fizemos nos teste com a função soma.

O que fazer quando isso ocorrer?

Bom... temos dois caminhos:

* O primeiro caminho é adotar um padrão no projeto todo. Quando tivemos este problema a gente chegou a esta resolução. Como a maioria do projeto estava utilizando parâmetros nomeados foi mais fácil adequar ao padrão desejado.
* O segundo caminho é esperar nos testes os dois cenários. Esta resolução foi uma das sugestões quando o time se reuniu para discutir o problema acima. Nós não adotamos este caminho porque iria deixar o código de testes muito repetido com a verificação de ambos os casos para cada um dos testes que mockamos alguma chamada.

Existem outros caminhos, mas talvez eles podem conflitar com os demais cenários que vou apresentar para vocês.

[Código do primeiro cenário](https://gist.github.com/elyssonmr/db881d61791c1cfca3f5ba6e4d1d2592)

## Cenário 2

É bem comum que a gente utilize mocks para "simular" chamadas em recursos caros e devemos verificar se eles foram chamados corretamente, igual fizemos no [Cenário 1]({{<ref "#cenário-1">}}).

Como estamos "fazendo de conta", caso os mocks não sejam chamados com os valores esperados, pode indicar que a função mockada irá retornar algum valor diferente em tempo de execução. Por exemplo, temos uma função que recupera os valores de uma nota fiscal em uma API, precisamos recuperar a nota com o ID **123456**, ao chamar a função com este ID ela irá retornar a nota fiscal esperada, correto? Caso a chamada seja com outro ID, por exemplo ID **654321**, será retornado uma nota diferente da esperada, não sendo o comportamento esperado.

Este segundo cenário diz respeito a verificações corretas de asserts nos mocks que fazemos para testar. Desta forma asseguramos que estamos mockando corretamente e que o "faz de conta" está retornando os valores conforme o esperado.

Para exemplificar este cenário, vamos implementar a chamada em um mock para recuperar os dados da nota fiscal e a chamada para gerar um PDF com este dados. Ambas mockadas pois estamos realizando acessos a recursos caros. No teste, eu irei inicialmente somente verificar se houve as chamadas aos mocks.

O código para gerar a nota fiscal ficou assim:

{{<figure src="images/code/code03.png" title="Implementação da função de geração de NFs" legend="Implementação da função de geração de NFs">}}

O teste para dar 100% de cobertura na função testada somente faz a verificação se os mocks foram criados:

{{<figure src="images/code/code04.png" title="Teste da função de geração de NFs" legend="Teste da função de geração de NFs">}}

Ao executar os testes, todos passaram e tivemos os 100% da função que testamos:

{{<figure src="images/scenario2_coverage.png" title="Cobertura cenário2" legend="Cobertura cenário2">}}

Bom... agora vamos alterar a chamada para a função mockada que gera o PDF trocando os parâmetros dela de posição, ou seja, vamos passar primeiro o parâmetro com o template e em segundo o parâmetro com os dados:

```python
return generate_pdf(template, nf_data)
```

Esta ordem não é bem a ordem esperada pela função, mas como a estamos mockando ela tudo que for passado será aceito. Após a alteração nós vamos executar os testes novamente:

{{<figure src="images/scenario2_false_positive.png" title="Teste e cobertura de falso positivo do cenário 2" legend="Teste e cobertura de falso positivo do cenário 2">}}

Os testes passaram pois na verificação das chamadas dos mocks, nós só verificamos se eles foram chamados. Neste caso não estamos importando com os argumentos. O melhor cenário seria a gente verificar com quais argumentos eles foram utilizados na chamada do mock, desta forma também veremos qual a ordem dos argumentos. Nos testes, nós iremos alterar as verificações dos mocks para podermos verificar os argumentos utilizamos na função de geração do pdf:

```python
mock_get_nf_data.assert_called_once_with(nf_id)
mock_generate_pdf.assert_called_once_with(nf_data, template)
```

Rodando novamente os testes, eles vão apontar que a chamada ocorrida está diferente da chamada esperada:

{{<figure src="images/scenario2_error_mock_call.png" title="Execução de testes com os mocks verificando os parametros" legend="Execução de testes com os mocks verificando os parametros">}}

Ajustando a chamada da geração de PDF e rodando os testes novamente deveremos ter o comportamento esperado. Além de termos os testes realmente testando o código e assegurando que caso ele seja alterado o teste falhe (está é a ideia de um teste unitário). Caso o ID da nota fiscal seja alterado na chamada da função sem alterar o retorno do mock também apontará um erro nos testes pode também ajustamos a verificação deste mock.

[Código do segundo cenário](https://gist.github.com/elyssonmr/5472b521cb248ee5aaf2d4469111ed47)

## Cenário 3

Existem alguns cenários onde a função mockada será chamada mais de uma vez. Nestes cenários, assim como já vimos até aqui, devemos verificar cada uma das chamadas. Podemos verificar somente se houve chamadas na função, mas como vimos acima precisamos verificar se as chamadas a função foram feitas corretamente.

Primeiro, vamos desenhar um cenário e somente verificar a se houve uma chamada ao mock. O cenário vai ser a chamada em uma API de preços para a consulta de preços de uma lista de produtos. Para facilitar o teste, vamos utilizar apenas 2 produtos na lista.

A implementação do cenário deve ser:

{{<figure src="images/code/code05.png" title="Implementação cenário 3" legend="Implementação cenário 3">}}

O teste com a verificação se houve a chamada a mock ficou:

{{<figure src="images/code/code06.png" title="Teste da implementação cenário 3" legend="Teste da implementação cenário 3">}}


Temos 100% de cobertura no método a ser testado:

{{<figure src="images/scenario3_100_coverage.png" title="Cobertura 100% na função testada do cenário 3" legend="Cobertura 100% na função testada do cenário 3">}}


Agora, nós iremos fazer uma alteração no código para alterar a chamada de tal forma a remover o parametro:


```python
def retrieve_prices(products_id: list[str]) -> dict[str, float]:
    prices = []
    for product_id in products_id:
        price = get_price()
        prices.append({'product_id': product_id, 'price': price})

    return prices
```

Ao executar novamente os testes, nós teremos sucesso devido a não estarmos verificando as chamadas estão sendo feitas corretamente. Estamos somente verificando que foi feito alguma chamada não se importando com qual e nem com quais parâmetros. Para resolver essa questão podemos utilizar um obj especial do mock que é o [call](https://docs.python.org/3/library/unittest.mock.html#unittest.mock.call) e alterar o assert para o assert que verifica todas chamadas realizadas. Alterando o assert para verificar as chamadas e a quantidade de vezes que elas foram chamadas:

```python
mock_get_price.assert_has_calls([call('123456'), call('654321')])
assert mock_get_price.call_count == 2
```

Teremos um feedback de que elas não foram feitas conforme o esperado:

{{<figure src="images/scenario3_wrong_calls.png" title="Falha no teste com o ajuste da verificação da chamada" legend="Falha no teste com o ajuste da verificação da chamada">}}

Desta forma basta voltarmos o código para passar o parâmetro que os nossos testes voltam executar conforme o esperado. Caso seja feita alguma alteração no código os testes irão apontar através de uma falha.

[Código do terceiro cenário](https://gist.github.com/elyssonmr/5420f1914247fc61f002d88c8c34d6e7)

# Conclusão

Testes unitários não servem somente para garantir cobertura de código. Caso eles não estejam testando adequadamente as chamadas e principalmente as chamadas que mockamos não teremos muito valor dos testes.

Sempre que mockarmos alguma parte do código sendo testados, precisamos verificar se a chamada foi feito de acordo com o esperado que fosse chamado durante a execução da aplicação. Desta forma estamos garantindo, através dos testes, que o nosso sistema esta funcionando de acordo com o esperado.

Teste unitários foram feitos para quebrar, como eles devem ser executados bem rápido teremos feedbacks muito mais rápidos de que alguma coisa no código não está certa. Então devemos verificar se faz sentido alterar o teste para o novo cenário ou se foi feito algo que não deveríamos ter feito no código.

No final das contas, todos os cenários apresentados possuí uma característica comum: verificar adequadamente a chamadas nos mocks. Foram apresentado cenários diferentes para mostrar formas diferentes de testar e como que podemos fazer as verificações nos mocks que criamos.

Antes de encerrar eu gostaria de agradecer pela sua audiência em 2024. Montei este blog para praticar um pouco mais a escrita e compartilhar "um pouco do pouco que sei". Sua audiência é muito importante para mim e espero que os artigos de 2024 tenham contribuído para que você aprenda algo novo, ou tenha a visão de algum outro aspecto que não havia visto anteriormente. Muito obrigado!!
