---
title: "Refatoração: Renomeação de Classes"
date: "2026-03-10T12:00:00-03:00"
draft: false
sidebar: true
slug: 20260310_refactoring_classes
thumbnail:
  src: "img/thumbnails/20260310_refactoring_classes.jpg"
  visibility:
    - list
categories:
  - "Engenharia de Software"
tags:
  - "Refatoração"
  - "Projeto"
  - "Software"
---

No [último artigo]({{< ref "/20260130_refactoring_functions" >}}) eu mostrei uma técnica de refatoração que auxilia a fazer "baby steps" para refatorar funções e métodos. Neste artigo vamos continuar falando sobre refatoração, mas desta vez vou mostrar a técnica para classes.

<!--more-->

# Introdução

Ao longo do tempo nós percebemos que a decisão de nomes para diversos componentes do nosso sistema não faz mais sentido, para isso precisamos atualiza-los para nomes que façam mais sentido.

Isto é aplicado a todo tipo de componente da aplicação, como: funções, classes, métodos, módulos, variáveis e etc.

No artigo de hoje vou mostrar como fazer uma refatoração em classes sem ser realizado um tudo ou nada.

OBS: Não vou explicar muito sobre o porque da refatoração pois já foi explicado no [último artigo]({{< ref "/20260130_refactoring_functions" >}}).

# Aplicando a Técnica

A técnica utilizada para refatorar o nome de uma classe é bem parecida com a técnica que usamos para refatorar funções e métodos. A diferença é que vamos utilizar herança para poder manter o sistema sem quebrar enquanto as alterações para o novo nome são realizadas.

Lembrando que o mesmo principio de dinamismo do Python pode ser aplicado em classes também. Utilizando a {{<externalnewtab src="https://docs.python.org/3/library/importlib.html" title="importlib">}} conseguimos fazer um comportamento mais dinâmico na aplicação.

Em um projeto era utilizado um mecanismo para utilizar classes com implementações concretas diferentes para realizar uma operação. Cada classe implementava particularidades de um provedor de serviços. Foi feita a aplicação do Design Pattern Strategy de forma dinâmica em tempo de execução. Exemplo:

```python
# class_test.py
class Test1:
    def hello(self):
        print('Hello from Test1')

class Test2:
    def hello(self):
        print('Hello from Test2')

# main.py
from importlib import import_module

klass = getattr(import_module('class_test'), 'Test1')
instance = klass()
instance.hello()
```

Utilizando um código parecido conseguimos fazer os import dinâmicos em tempo de execução de acordo com alguns cenários.

Este também é um caso que nem fazendo uma refatoração "tudo ou nada" vai ajudar a pegar. Pelo menos fazendo passo a passo, este cenário vai ficar por último tornando mais fácil de não passar despercebido.

Bom, voltando para a técnica. Vamos utilizar {{<externalnewtab src="https://gist.github.com/elyssonmr/d826777a0173af6ab29a9b491c354191" title="este exemplo">}} como base. A técnica é composta composta por 5 passos:

1. Declare uma nova classe com o nome desejado. Teste!
2. Copie todo o código da classe antiga para a nova. Teste!
3. Apague o código da antiga, mas faça ela herdar a nova classe. Teste!
4. Procure todas as referências da classe antiga e altere para utilizar a nova. Teste, a cada referência alterada!
5. Remova a classe antiga. Caso ela faça parte de alguma biblioteca, apenas o marque como depreciado. Teste novamente!

Bem parecido com a técnica do ultimo artigo. A diferença é a utilização da herança para manter a compatibilidade.

No exemplo, nós temos declarado a classe `calcu_lator`. Este nome não ficou nem um pouco bom e vamos precisar altera-lo para um nome melhor e dentro do padrão de nomenclatura de classes. **O primeiro** passo será declarar uma nova classe com o nome desejado: `Calculator`.

{{<figure src="images/01_new_class.png" title="Declaração da nova classe Calculator" legend="Declaração da nova classe Calculator">}}

Execute os testes!!

No **segundo passo** devemos copiar o código da classe antiga para a nova.

{{<figure src="images/02_copy_code.png" title="Copia do código da classe antiga para a nova" legend="Copia do código da classe antiga para a nova">}}

Teste!!

No **terceiro passo** podemos apagar o código dentro da classe antiga (`calcu_lator`) e adicionar uma herança da classe `Calculator`.

{{<figure src="images/03_delete_old_code.png" title="Adição de Herança na classe antiga" legend="Adição de Herança na classe antiga">}}

Teste!!

Chegando aqui no final deste passo, já podemos parar de refatorar sem que a aplicação quebre. Na verdade, desde o segundo passo já conseguimos, mas é bem provável que ferramentas de análise de código identifiquem o código duplicado.

No **quarto passo** podemos iniciar a substituição da classe antiga (`calcu_lator`) para utilizar a classe nova (`Calculator`).

{{<figure src="images/04_change_classes.png" title="Alteração das classes do antigo nome para o novo" legend="Alteração das classes do antigo nome para o novo">}}

Lembrando que se forem muitas ocorrência, a substituição pode ocorrer de forma incremental. Sendo arquivo por arquivo, módulo por módulo e etc. Após a refatoração de cada unidade é possível realizar um commit e/ou deploy sem que as demais partes da aplicação quebre, pois neste momento temos as duas classes coexistindo. A vantagem principal de refatorar em pequenos passos é percebida neste passo. Lembre-se de testar após cada alteração realizada.

Após a alteração de todas as ocorrências, podemos avançar para o **quinto passo** removendo a classe antiga.

{{<figure src="images/05_removing_old_class.png" title="Remoção da classe antiga" legend="Remoção da classe antiga">}}

O exemplo apresentado nem é tão necessário seguir este processo pois ele é simples e possuí poucas ocorrências. Ele é mais para ilustrar a técnica.


# Conclusão

Refatoração é algo comum em diversos projetos e no nosso dia a dia. Entender como utiliza-la de forma incremental é muito importante para garantirmos que as refatorações não quebrem o código já existe, pois a refatoração não deve influenciar em nenhum comportamento da aplicação.

Nem todos os casos conseguimos fazer uma refatoração "passo a passo" ou a refatoração "tudo ou nada", mas fazendo passo a passo ajuda a gerenciar melhor as alterações enquanto que a aplicação continua funcionando sem problemas.

Assim como a técnica de renomeação de funções e métodos do [último artigo]({{< ref "/20260130_refactoring_functions" >}}), os passos da renomeação de Classes também são simples e fáceis de seguir. Também permite que a execução da aplicação sem precisar refatorar todas as ocorrência de uma vez só.

Fonte: {{<externalnewtab src="https://amzn.to/49WaSJu" title="Refatoração - 2ª Edição">}}
