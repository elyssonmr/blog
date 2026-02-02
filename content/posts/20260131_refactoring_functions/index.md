---
title: "Refatoração: Renomeação de Métodos/Funções"
date: "2026-01-30T12:00:00-03:00"
draft: false
sidebar: true
slug: 20260130_refactoring_functions
thumbnail:
  src: "img/thumbnails/20260130_refactoring_functions.jpg"
  visibility:
    - list
categories:
  - "Engenharia de Software"
tags:
  - "Refatoração"
  - "Projeto"
  - "Software"
---

Você já se deparou com uma função ou método de que o nome não faz sentido? É bem comum escrevermos código e depois de um tempo notar que os nomes escolhidos não fazem muito sentido. Por causa deste cenário (e de muitos outros) existem algumas técnicas para refatorar o nosso código sem quebrar todo o resto. No artigo de hoje, vou mostrar uma das formas de refatoração que auxilia a troca de nomes de métodos e funções.

<!--more-->


# Introdução

Ao longo do desenvolvimento de um projeto nós podemos descobrir que os nomes escolhidos para diversas funções e métodos não demonstram mais muito bem o que é feito. Talvez na época que foi escrito fizesse muito sentido, mas a medida que o sistema vai mudando e evoluindo pode não fazer mais. Este tipo de cenário é bem comum em projetos de software. O problema é que muitas vezes estas alterações podem quebrar partes do sistema que estejam utilizando o nome antigo que foi alterado e deixou de existir.

Como sempre, podemos fazer de diversas maneiras. Podemos utilizar a IDE e trocar tudo de uma vez (tudo ou nada) ou podemos aplicar técnicas que permita fazermos somente uma parte por vez (forma incremental). Cada uma tem suas vantagens e desvantagens, mas hoje eu vou compartilhar uma técnica que vi a alguns bons anos no livro de Refatorações do Martin Fowler para conseguirmos alterar o nome de métodos e funções de forma incrementar.

# Porque utilizar refatoração?

Refatorações nos ajudam a melhorar o código da aplicação sem alterar o comportamento da aplicação. Este ponto é muito importante de destacar, pois se uma refatoração alterar o comportamento do que está sendo refatorado, não é bem uma refatoração e sim uma alteração do comportamento/funcionalidade/requisito.

Existem diversas técnicas que podemos aplicar para alterar o código mantendo o comportamento e também permitindo fazer de modo incremental. Claro que diversas IDEs nos auxiliam a refatorar, mas imaginando que a sua IDE não tenha esta funcionalidade você poderá aplicar a técnica apresentada aqui que ela irá funcionar em qualquer projeto e, ouzo dizer que, em qualquer linguagem também.

A minha experiência utilizando os recursos das IDEs para refatorar não é dos melhores para linguagens que são interpretadas e dinâmicas como o Python por exemplo. Frequentemente não são encontrados todas as ocorrências fazendo com que ao executar os testes para garantir que tudo esta funcionando e nenhum comportamento foi alterado, surgem diversos erros que fica complexo de lidar para corrigir tudo. Utilizando a técnica de renomeação de métodos/funções nos ajuda a alterar cada utilização sem gerar diversos erros. Este é o porque podemos fazer de forma incremental e ir lidando com as alterações em passos bem pequenos (baby steps). Fora o beneficio de parar a refatoração no meio e a aplicação continuar funcionando sem problemas.

Claro que nem são um mar de rosas, existem diversos cenários que tanto a refatoração com a ajuda da IDE quanto a técnica de renomeação não conseguir pegar. Um destes cenários é a utilização da chamada de métodos utilizando string em Python. O que seria isso, perguntando você deve jovem padawan? É uma forma dinâmica de chamar métodos de um objeto sem a necessidade de criar uma estrutura complexa para chamarmos da maneira convencional: `obj.method`. Aqui vai um exemplo:

```python
class MyClass:
    def my_method(self):
      print('My Method')

obj = MyClass()
method_name = 'my_method'
method = getattr(obj, method_name)

method() # Prints: 'My Method'
```

Este modo pouco convencional foi utilizado em um projeto que trabalhei onde criávamos métodos com o nome idêntico ao que uma API externa retornava no campo de status. Desta forma o código para tratar as respostas ficou bem simples sem a necessidade de ifs e elses, dicionários com muitas chaves e etc.

Este é um bom exemplo que nem a IDE e nem a técnica vai pegar mas utilizando a técnica de renomeação ele poderá ficar por último e quando executarmos o teste após o último passo, ele irá quebrar revelando este problema.

Explicado o porque, vamos aprender a técnica?

# Aplicando a técnica

A técnica de renomeação de métodos/funções é bem rápida e simples de utilizar. Vou pegar {{<externalnewtab src="https://gist.github.com/elyssonmr/ad6995b62271768d1411c4571e0f9957" title="exemplo para trabalharmos">}}. Neste código, foi feito uma calculadora com um histórico das operações realizadas, a escolha dos nomes dos métodos não está utilizando o padrão de `snake_case` que é comumente utilizando na linguagem Python. Para isso vamos precisar refatorar o código de tal forma a atender este cenário. Na explicação eu não irei abordar sobre os testes, mas você deve executar os testes unitários após cada um dos passos apresentados pois eles vão guiar a suas alterações garantido que nada foi quebrado.

A técnica é composto por 5 passos:

1. Declare um novo método com o nome desejado. Teste!
2. Copie o corpo do antigo método para o novo. Teste!
3. Altere o corpo do antigo método para ele invocar o novo método. Teste!
4. Procure todas as referências do antigo método e altere para invocar o novo. Teste, a cada referência alterada!
5. Remova o método antigo. Caso ele faça parte de alguma biblioteca, apenas o marque como depreciado. Teste novamente!

No exemplo da calculadora, vamos pegar a método `SumNumbers` e aplicar a refatoração nela. **O primeiro** passo será declarar um novo método. Como desejamos utilizar o snake_case, nós vamos então declarar o método `sum_numbers` utilizando a mesma assinatura do método `SumNumbers`:

{{<figure src="images/01_declare_sum_numbers.png" title="Declaração do método sum_numbers" legend="Declaração do método sum_numbers">}}

Teste!!

**O segundo passo** é copiar o corpo da método antigo (`SumNUmbers`) para a nova método (`sum_numbers`):

{{<figure src="images/02_copy_method_code.png" title="Copia do corpo da método antigo para a nova" legend="Copia do corpo da método antigo para a nova">}}

Teste!!

Agora podemos ir para o **terceiro passo** apagando o código dentro do método antigo (`SumNumbers`) e fazendo ela chamar a nova método (`sum_numbers`):

{{<figure src="images/03_call_old_to_new.png" title="Chamada da método antigo para a nova" legend="Chamada da método antigo para a nova">}}

Teste!!

Realizando até o terceiro passo, já é possível parar o processo incremental sem que a aplicação quebre.

No **quarto passo** nós vamos procurar as chamadas sendo feitas para o método antigo (`SumNumbers`) e substituir para a nova chamada (`sum_numbers`). Para cada cada substituição realizada, nós vamos executar novamente os testes. No exemplo somente possui uma, mas caso possua mais é recomendado executar os teste após a alteração de cada uma das ocorrências:

{{<figure src="images/04_change_calls.png" title="Alteração das chamadas para antigo método para o novo" legend="Alteração das chamadas para antigo método para o novo">}}

Caso sejam muitas ocorrências, é possível fazer arquivo por arquivo e em cada um dos arquivos realizar um commit e/ou um deploy. Como existe os dois métodos na aplicação ela não vai quebrar pois a nova forma de chamada está coexistindo com a forma antiga. A principal vantagem da forma incrementar pode ser percebida nesta etapa.

Após realizar a alteração de todas as ocorrências, podemos enfim realizar o **quinto passo** procedendo com a remoção do método antigo:

{{<figure src="images/05_removing_old_method.png" title="Remoção do método antigo" legend="Remoção do método antigo">}}

Teste!!

Pronto!! Refatoramos a nossa aplicação de tal forma que poderíamos parar após a execução de cada um dos passos sem que algo no restante da aplicação quebre.

Observe que o nosso exemplo, nem precisa executar este passos todos. Agora imagine em uma aplicação maior? Imagine um objeto que seja utilizado em diversos lugares, como um logger por exemplo?? Nestes projetos que estes passos fazem total diferença, em projetos menores eles podem ser muito complexos, mas caso a IDE não ajude muito você pode aplicar os passos sem nenhum problema.

Ahhh... Não falamos sobre as funções, mas a técnica é a mesma coisa!!

# Conclusão

Refatoração é algo muito comum em projetos de software. Utilizar uma técnica de refatoração auxilia a lidar com possíveis erros de forma mais isolada sem alterar um monte de coisa ao mesmo tempo.

Existem alguns casos em, por exemplo, linguagens dinâmicas que podem "esconder" chamadas para as funções. Nestes cenários, nenhuma técnica irá conseguir pegar todos.

A técnica de renomeação de métodos e funções possuí passos bem simples e permite pausas após cada uma das etapas permitindo ainda a execução da aplicação sem problemas.

Fonte: {{<externalnewtab src="https://amzn.to/49WaSJu" title="Refatoração - 2ª Edição">}}
