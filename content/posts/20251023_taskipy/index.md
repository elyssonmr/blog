---
title: "Utilizando o Taskipy em seus projetos"
date: "2025-10-23T12:00:00-03:00"
draft: false
sidebar: true
slug: 20251023_taskipy_tool
thumbnail:
  src: "img/thumbnails/20251023_taskipy_tool.svg"
  visibility:
    - list
categories:
  - "Engenharia de Software"
tags:
  - "Ferramentas"
  - "Projeto"
  - "Python"
---


No [último post]({{< relref "/posts/20251015_project_tools" >}}) nós falamos sobre algumas ferramentas que auxiliam seus projetos de software com Python. Hoje vamos continuar falando sobre o mesmo assunto focando no Taskipy. O Taskipy é uma ferramenta que podemos criar comandos para nossos projetos, este comandos auxiliam a simplificar outros comandos complexos que usamos no dia a dia, como: comandos para rodar testes, incrementar versão, executar lint e etc. Neste post vamos explorar um pouco mais profundamente esta ferramenta.

<!--more-->

# Introdução

Todos os projetos de software possuem alguns comandos para auxiliar no dia a dia de desenvolvimento. Alguns deste comandos auxiliam a rodar testes, rodar o lint, gerar partes pré estruturadas (exemplo: apps do Django), criar/executar migrations, deploy e etc. Existe uma infinita gama de comandos que são possíveis de serem executados dentro de projetos e cada projeto possui suas necessidades e particularidades.

Ai que entra o [taskipy](https://github.com/taskipy/taskipy). A ferramenta nos auxilia a simplificar comandos que usamos no dia a dia em nossos projetos de forma rápida e simples sem precisar decorar comandos complexos. Com ela conseguimos facilitar a execução de tarefas comuns em nossos projetos tornando o desenvolvimento mais ágil e focando mais em criar código do que em gerenciamentos complexos dentro do projeto.

Ao longo do artigo, vamos explorar um pouco mais da ferramenta e criar alguns comandos em um projeto fictício usando [FastAPI](https://fastapi.tiangolo.com/), [pytest](https://docs.pytest.org/en/stable/), [towncrier](https://towncrier.readthedocs.io/en/stable/index.html), [ruff](https://docs.astral.sh/ruff/) e [bump-my-version](https://callowayproject.github.io/bump-my-version/).

# Instalando o Taskipy

A instalação é simples, neste artigo vamos faze-la utilizando o [poetry](https://python-poetry.org/). Com um projeto já configurado execute o comando:

```shell
$ poetry add --group dev taskipy
```

Com isso o taskipy será instalado no seu projeto utilizando o grupo dev (dependências de desenvolvimento).

# Configurando pyproject.toml

Com a ferramenta instalada precisamos fazer a configuração das tarefas. Vou mostrar aqui duas formas de fazer e logo logo vamos falar um pouco mais profundo das tarefas.

A configuração necessária no *pyproject.toml* é adicionar uma linha com o seguinte texto:

```toml
[tool.taskipy.tasks]
```

Dentro desta configuração podemos adicionar nossas tasks. O primeiro formato de task é em texto, basicamente adicionamos qual comando vai ser executado:

```toml
[tool.taskipy.tasks]
lint = "ruff check . --diff"
```

A task acima, irá executar o ruff para realizar o lint do código mostrando quais pontos foram encontrados de que não estão de acordo.

A segunda maneira de definir uma tarefa é um pouco mais verbosa, mas auxilia em termos uma descrição sobre o comando:

```toml
[tool.taskipy.tasks]
lint = "ruff check . --diff"
format = { cmd = "ruff check . --fix && ruff format .", help = "Realiza a formatação do código com o Ruff" }
```

Esta maneira temos um help na tarefa e não muda o como executa-la. Para ambos os casos usamos o mesmo formato de comando para executar as tarefas:

```shell
$ task lint
$ task format
```

Caso você esteja usando o ambiente virtual criado pelo poetry a execução muda um pouco:

```shell
$ poetry run task lint
$ poetry run task format
```
Legal, sabemos executar as tarefas mas e o "help" que criamos? Para executa-lo devemos usar o list do task:

```shell
$ task --list
```

Ou:

```shell
$ poetry run task --list
```

Com este comando é listado todas as tarefas criadas e seus respectivos helps quando houver. Quando não houver, somente é mostrado o comando da task.

## Utilizando o pre-hook

Um recurso interessante no taskipy são os pre-hooks. Vamos imaginar uma situação que antes de executar testes precisamos verificar se o código esta formatado. Para não precisar executar a tarefa de formatar e depois executar os testes, nós podemos utilizar um pre-hook para os testes que execute a formatação do código e logo em seguida a task principal é executada.

A forma de criar um pre-hook é simples, precisamos só adicionar um prefixo **pre_** mais o nome da task. No exemplo de execução de testes ficaria: *pre_test*. Adicionando mais estas tarefas teremos:

```toml
[tool.taskipy.tasks]
lint = "ruff check . --diff"
format = { cmd = "ruff check . --fix && ruff format .", help = "Realiza a formatação do código com o Ruff" }
pre_test = "ruff check . --fix && ruff format ."
test = "pytest -vv --cov=project_folder --cov-report term-missing -p no:warnings ."
```

Com estas duas novas tarefas (a tarefa de pre-hook e a de testes) podemos executar:

```shell
$ task test
```

Que iremos executar a formatação do código e executar os testes. Um ponto importante para destacar é que caso o pre-hook falhe, a task original não será executada. Desta forma podemos garantir os testes somente sejam executados se o código estiver formatado. Talvez para este cenário não seja uma boa ideia, mas em outros cenários este comportamento pode ajudar a não executar tarefas que não foram configuradas apropriadamente no pre-hook.

## Utilizando o post-hook

E claro que temos como executar depois da tarefa principal. Para adicionar o post-hook, precisamos usar o prefixo **post_** mais o nome da task. Ainda no exemplo de testes, vamos adicionar um comando para o coverage criar um HTML com a cobertura dos testes:

```toml
pre_test = "ruff check . --fix && ruff format ."
test = "pytest -vv --cov=project_folder --cov-report term-missing -p no:warnings ."
post_test = "coverage html"
```

Quando executarmos o `task test` estaremos na verdade executando a formatação do código, posteriormente executamos os nossos testes (objetivo principal) e por último geramos uma página HTML com a cobertura do código. Tudo isso em um único comando no terminal!!

Caso de algum comando falhe antes do post-hook, ele não será executado. **Este comportamento é importante de se ter em mente pois alguns cenários exigem que seja feito algum tipo de limpeza no ambiente logo após algo ser executado e caso ocorra algum problema com a execução o ambiente não será limpo com o post-hook**. Ele vai poder facilitar em cenários de sucesso, mas é sempre bom executar uma tarefa de limpeza de forma independente.

## Chamando outras tasks

Nos exemplos de [pre-hook]({{< relref "#utilizando-o-pre-hook" >}}) e [post-hook]({{< relref "#utilizando-o-post-hook" >}}) repetimos alguns comandos de outras tasks que criamos, como a task de formatar o código. Porém podemos utilizar outras tasks dentro de uma task. Basta invocarmos a task igual fazemos via linha de comando. Por exemplo, na task de format que exploramos aqui no artigo podemos usa-la no pre-hook dos testes unitários invocando a task ao invés de repetir o comando. Desta forma a nova *pre_test* ficaria:

```toml
format = { cmd = "ruff check . --fix && ruff format .", help = "Realiza a formatação do código com o Ruff" }
pre_test = "task format"
test = "pytest -vv --cov=project_folder --cov-report term-missing -p no:warnings ."
post_test = "coverage html"
```

Este recuso é bem interessante pois não precisamos repetir os comandos em mais de uma task. Caso este comando mude em algum momento no futuro, teríamos que alterar em todas as tasks que ele foi repetido, mas desta forma conseguimos reutilizar as tasks.

# Sugestões de comandos genéricos

Em muitos projetos que trabalho temos algumas tasks genéricas e comuns entre eles. São tasks para incrementar a versão (conforme vimos alguns exemplos no [último artigo]({{< relref "/posts/20251015_project_tools" >}})), executar a aplicação no ambiente de desenvolvimento, executar testes e executar lint/format. Já exploramos alguns aqui, mas vou mostrar um exemplo de um `pyproject.toml` que tem bem a ver com os projetos que costumo fazer:

```toml
[tool.ruff]
line-length = 79

[tool.ruff.lint]
preview = true
select = ["I", "F", "E", "W", "PL", "PT"]

[tool.ruff.format]
preview = true
quote-style = "single"

[tool.pytest.ini_options]
pythonpath = "."
addopts = " --cov=project_pkg --cov-report term-missing -p no:warnings"
asyncio_mode = 'auto'
asyncio_default_fixture_loop_scope = 'session'
asyncio_default_test_loop_scope = 'session'

[tool.coverage.run]
omit = ["**/test*/**"]

[tool.taskipy.tasks]
lint = "ruff check . && ruff check . --diff"
format = "ruff check . --fix && ruff format ."
run = "fastapi dev project_pkg/app.py"
pre_test = "task format"
test = "pytest -vv"
post_test = "coverage html"
bump_major = "bump-my-version bump major --dry-run -v | grep 'New version will be' | sed -e 's/New version will be //' | xargs -n 1 towncrier build --yes --version && git commit -am \"Update CHANGELOG\" && bump-my-version bump major"
bump_minor = "bump-my-version bump minor --dry-run -v | grep 'New version will be' | sed -e 's/New version will be //' | xargs -n 1 towncrier build --yes --version && git commit -am \"Update CHANGELOG\" && bump-my-version bump minor"
bump_patch = "bump-my-version bump patch --dry-run -v | grep 'New version will be' | sed -e 's/New version will be //' | xargs -n 1 towncrier build --yes --version && git commit -am \"Update CHANGELOG\" && bump-my-version bump patch"
```

Normalmente estes comandos são os que mais utilizo em meus projeto. Vou primeiro explicar as configurações a mais que colei aqui e depois comento mais sobre os comandos. Elas são importantes para mostrar o como podemos utilizar comandos genéricos somente trocando algumas configurações.

A primeira configuração é do [ruff](https://docs.astral.sh/ruff/) que notifica caso uma linha de código tenha mais do que 79 caracteres. A segunda configuração é do lint do ruff, nela estamos permitindo a visualização de uma prévia e aplicando algumas regras para serem consideradas na hora de executar o lint. Mais info sobre elas [aqui](https://docs.astral.sh/ruff/rules). Você pode usar as que mais fazem sentido no seu projeto. Aqui estão de uma forma genérica. A ultima configuração do ruff é o como ele vai formatar o código, estamos setando para que ele transforme todas as strings com aspas duplas (**"**) em aspas simples (**'**) automaticamente para padronizarmos as strings do projeto.

A segunda configuração é do [pytest](https://docs.pytest.org/en/stable/) que configura como vamos inicializa-lo: qual o diretório ele deve considerar para buscar os testes, quais configurações devem ser adicionadas ao comando, como ele deve se comportar sobre testes que usam async/await (usando o auto podemos fazer testes síncronos e assíncronos sem problemas) e qual o escopo do loop para fixtures e teste (utilizando `session`, eliminamos diversos problemas com testes que envolviam banco de dados mockados).

A terceira configuração é do [coverage](https://pypi.org/project/pytest-cov/) indicando qual padrão deve ser desconsiderado para calcular a cobertura do código. Por incrível que pareça, mesmo executando todos os testes com sucesso, as vezes o teste não é considerado como coberto.

Agora temos as nossas tasks!

A primeira task é o lint que irá executar as verificações sem realizar nenhuma alteração. Normalmente utilizo essa task em pipelines de CI/CD para que possamos verificar se o código foi realmente pré formatado corretamente.

Durante o desenvolvimento utilizo mais a segunda task. Ela efetivamente verifica e tenta formatar o código de acordo com a regras que nós definimos na configuração. Nem sempre ela consegue ajustar tudo, mas a maioria dos casos são feitos automaticamente os que sobram não são muito complicados de ajustarmos na mão. Normalmente são casos de linha muito grande.

A terceira task é um comando de run para facilitar subir sua aplicação web, aqui no caso FastAPI. Não a utilizo em produção por causa que normalmente construímos uma imagem docker na pipeline de CI/CD e ela possui o comando exato para execução em produção.

A quarta task é a task para executar testes unitários, porém nela temos o pre-hook que executa a task de format para ajustar o código antes de executar o teste. Depois é executado os testes usando o pytest (lembre-se que as configurações já foram feitas mais acima) e neste comando adiciono o *-vv* para ter um certo nível de verbosidade para quando houver algum problema podermos identificar da onde falhou. O pos-hook irá gerar o coverage em HTML caso precisamos analisa-lo.

Da quinta task em diante são os comandos de bump (falamos um pouco sobre eles no [último artigo]({{< relref "/posts/20251015_project_tools" >}})) a diferença deles é somente o tipo do bump, mas deixando comandos separados ficou mais fácil para nós. Além de também simplificar a geração das versões.

# Conclusão

Todos os projetos possuem alguns comandos comuns que auxiliam o dia a dia de desenvolvimento. Cabe a nós, desenvolvedores, criarmos mecanismos para auxiliar o nosso dia a dia de desenvolvimento.

Utilizando o taskipy podemos criar abstrair tarefas do nosso dia a dia desenvolvendo um projeto em pequenas tarefas que são fáceis de lembrar e personalizar. Desta forma conseguimos abstrair comandos complexos e comuns no projeto de tal forma a incentivar a execução frequente deles que ao mesmo tempo que ganhamos mais produtividade e padronização.

O ecosistema python tem diversas ferramentas que ajudam muito o nosso dia a dia, seja para desenvolver projetos ou gerencia-los.
