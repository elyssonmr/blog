---
title: "Ferramentas para Projetos Python"
date: "2025-10-15T12:00:00-03:00"
draft: false
sidebar: true
slug: 20251015_project_tools
thumbnail:
  src: "img/thumbnails/20251015_project_tools.jpg"
  visibility:
    - list
categories:
  - "Engenharia de Software"
tags:
  - "Ferramentas"
  - "Projeto"
  - "Python"
---

Hoje vou trazer um assunto bem curioso que são as ferramentas que utilizo em meus projetos Python. Vou citar as ferramentas mais comuns que utilizo em projetos que trabalho e o que cada uma delas fazem no projeto. Não são muitas, mas ajudam demais com as tarefas de desenvolvimento de um projeto.

<!--more-->

# Introdução

Todos os projetos de software utilizam algumas ferramentas que auxiliam no gerenciamento do mesmo, seja para controlar versão, executar algumas tarefas ou gerar documentações dos projetos. Algumas ferramentas podem ser utilizadas com outras tecnologias sem problemas, mas eu particularmente não misturo muitas as tecnologias em meus projetos.

Neste artigo vou trazer algumas ferramentas que utilizo em meus projetos Python. Vou explicar os motivos que as utilizo, no que elas auxiliam e alguns comentários particulares sobre minha percepção das ferramentas.

# Ferramentas

Algumas ferramentas podem estar presentes em todos os projetos para que possamos facilitar tarefas do dia a dia de desenvolvimento. Vou citar algumas neste artigo:

## Poetry

A primeira ferramenta que vamos falar a respeito é o [Poetry](https://python-poetry.org/). O Poetry é um gerenciador de dependências muito poderoso para Python. Ele foi inicialmente criado para auxiliar criando bibliotecas, mas podemos utiliza-lo em projetos de software sem problemas. Nele conseguimos adicionar dependências de produção, dependências de desenvolvimento (nem sempre são iguais) ou de outros grupos (exemplo: documentação) conforme a necessidade. Além de que podemos também centralizar todas as nossas configurações de plugins/ferramentas no `pyproject.toml`. Outras ferramentas que vamos abordar aqui, terão configurações neste arquivo.

Para utilizar o poetry é simples, podemos instala-lo sistema para que possamos utiliza-lo em todo o sistema operacional. A instalação pode ser feita de diversas maneiras. Acredito que a mais simples seja utilizando o instalador disponível no [site oficial](https://python-poetry.org/docs/#installing-with-the-official-installer).

Com o poetry instalado, podemos então montar o nosso projeto utilizando o comando:

```shell
$ poetry new -i --flat .
```

Será mostrado algumas opções para que você possa fazer uma pré configuração do seu projeto no diretório corrente (caso não queira o diretório corrente, troque o "." pelo nome do diretório que será criado). No final da configuração você terá um projeto pré configurado com as dependências que você já escolheu. Agora precisamos instalar o projeto, que na prática é instalar as dependências no ambiente virtual que você criou para o projeto. Caso não tenha criado um, o poetry utiliza um interno dele, mas recomendo que crie um utilizando o [virtualenv](https://docs.python.org/3/library/venv.html) ou o [pyenv](https://github.com/pyenv/pyenv).

Ao longo do projeto, nós precisamos de novas dependências, para isso usamos o comando para instala-las:

```shell
$ poetry add dependency_name
```

Usando o comando acima instalamos a dependência no grupo default que é o grupo de produção. Para instalar em outro grupo, por exemplo o de desenvolvimento, podemos adicionar a informação no comando:

```shell
$ poetry add --group dev dependency_name
```

Sendo necessário somente substituir o nome do grupo. Cuidado com typos, pois novos grupos podem ser criados caso algo seja digitado errado.

Até agora parece ser um tutorial de utilização do poetry e sim, é! Mas essa introdução era necessária para então falar das vantagens de utilizar a ferramenta. Os comandos acima foram colocados para mostrar o quão fácil é utilizar o poetry. Executando os comando ele vai instalar as bibliotecas que você precisa adicionar no projeto juntamente com as dependências que a sua bibliotecas precisam. O mais legal disso tudo é que ele fixa a versão do que está instalado no arquivo `poetry.lock`, desta forma geramos um ambiente com dependências determinísticas, mesmo que alguma versão "seja a partir da versão XYZ". Quando um colega de projeto instalar as dependências ele vai ter exatamente a mesma versão que você, mesmo que seja instalado no futuro e outra versão mais nova exista. Isso evita diversos problemas com configurações de projetos que você não tem ideia.

Outra vantagem do Poetry que comentamos no começo é o `pyproject.toml`. Nele contém diversas informações que configuramos com o poetry e também podemos adicionar outra configurações para ferramentas compatíveis (vamos falar sobre algumas logo logo). Utilizando o poetry temos tudo centralizado em um único ponto sem a necessidade de possuirmos diversos arquivos de configuração para atender todas as ferramentas que estão sendo utilizadas no projeto.

## Bump-my-version

Este ferramenta é uma das minhas favoritas. Utilizei diversas parecidas mas agora parece que a recomendação é esta (algumas ferramentas de bump de versão que não estão mais tendo atualizações recomendam utilizar esta ferramenta).

Resumidamente o [bump-my-version](https://callowayproject.github.io/bump-my-version/) auxilia no processo de incremento de versão seguindo o padrão do [semantic versioning](https://semver.org/) que é um padrão utilizado em quase todos os projetos. O mais legal é que caso o seu projeto não utilize, é possível personalizar o como a versão será incrementada, particularmente nunca precisei utilizar incrementos que não sejam semantic versioning.

A instalação pode ser feita via Poetry (caso você o tenha no seu projeto) nas dependências de desenvolvimento ou via pip. É possível instalar no sistema como um todo, mas eu recomendaria não fazer isso, visto que existem diversos casos que podemos incrementar a versão via pipeline de CI/CD.

O bump-my-version utiliza o `pyproject.toml` para ler as configurações. Basicamente precisamos fazer algumas configs para que a ferramenta possa se localizar e saber como incrementar a versão, além de saber quais arquivos ela deve alterar a versão. Escrever estas configurações pode ser algo bem chato de ser fazer, deste modo vou deixar aqui um exemplo de configuração para você se basear ou até mesmo copiar e colar no seu projeto alterando minimamente algumas coisas:

```toml
[tool.bumpversion]
current_version = "0.0.0"
parse = "(?P<major>\\d+)\\.(?P<minor>\\d+)\\.(?P<patch>\\d+)"
serialize = ["{major}.{minor}.{patch}"]
search = "{current_version}"
replace = "{new_version}"
regex = false
ignore_missing_version = false
tag = true
sign_tags = false
tag_name = "{new_version}"
tag_message = "Bump version: {current_version} → {new_version}"
allow_dirty = false
commit = true
message = "Bump version: {current_version} → {new_version}"
commit_args = ""
```

Resumidamente estamos realizando algumas configurações para o commit que a ferramenta faz quando a versão é incrementada, o que buscar para alterar a versão, como nomear a tag e etc. Agora vou mostrar um exemplo de como listar um arquivo para o bump-my-version procurar no `pyproject.toml` a versão e altera-la para o incremento através dos comandos que vamos explorar daqui a pouco:

```toml
[[tool.bumpversion.files]]
filename = "pyproject.toml"
search = "version = \"{current_version}\""
replace = "version = \"{new_version}\""
```

No inicio do *pyproject.toml* gerado pelo Poetry existe uma configuração da versão. Desta forma estamos indicando para o bump que ele deve procurar por esta versão e então substituir para a nova. Viu como é simples? Existem outras configs que podemos fazer mas esta de substituir é a principal. Também podemos adicionar mais arquivos, aqui foi só um exemplo de como realizar o bump no arquivo configurado.

Um ponto importante de se destacar: o Poetry cria o projeto na versão `0.1.0`, certifique-se que esta versão foi alterada para `0.0.0` para que o bump consiga encontrar a versão que ele precisa incrementar.

Com a config feita, podemos explorar um pouco dos comandos. É basicamente um comando com alguns argumentos diferentes:

```shell
$ bump-my-version bump TARGET --dry-run -v
```

No comando nós precisamos alterar o target para o tipo de incremento que precisamos fazer. Se for um incremento `major`, substituímos o target para `major`. O mesmo se aplica para `minor`, `patch` e outras porções da versão que poderão existir. O `--dry-run` no comando é para mostrar o que será feito sem alterar os arquivos, bem útil para ver se tudo esta configurado corretamente. Quando estiver com certeza que tudo está configurado corretamente, basta remove-lo para efetivamente realizar as alterações. O ultimo argumento, o `-v` é o nível de verbosidade que também mostra algumas informações interessante do que está acontecendo com o comando.

Muitos projetos possuem um gerência de versões bem complexa e falha, utilizando o bump-my-version podemos deixar este processo mais simples e seguro de ser realizado sem correr o risco de esquecer de incrementar algum arquivo com a nova versão.

## Towncrier

A última ferramenta que vou apresentar é a minha favorita, ainda mais porque [towncrier](https://towncrier.readthedocs.io/en/stable/index.html) é um nome da idade média. Os towncriers eram responsáveis por dar recados e avisos em praça pública nas cidades medievais. No projeto ele é responsável pelo changelog, que não deixa de ser uma forma de anunciar o que está sendo alterado na aplicação.

Seguindo o mesmo que o bump-my-version, nós podemos configurar o towncrier no `pyproject.toml` e também é um pouco chato. Vou compartilhar uma configuração que sempre utilizo juntamente com um template do changelog. Basicamente é o changelog padrão disponível [aqui](https://github.com/twisted/towncrier/blob/trunk/src/towncrier/templates/default.rst) adicionando um link na versão para a tag do git e simplificando diversas sessões do changelog:

Config do `pyproject.toml`:

```toml
[tool.towncrier]
package = "app_main_pkg"
package_dir = "."
directory = "changelog.d"
filename = "CHANGELOG.md"
name = "Tools Article"
template = "changelog.d/template.md"

[[tool.towncrier.type]]
directory = "feat"
name = "Features"
showcontent = true

[[tool.towncrier.type]]
directory = "fix"
name = "Bug Fixes"
showcontent = true

[[tool.towncrier.type]]
directory = "chore"
name = "Other Tasks"
showcontent = true
```

Na config acima indicamos para o towncrier onde está o pacote da aplicação (ele suporta mais de um pacote, ou seja, ele suporta monorepos com diversos projetos diferentes), qual o diretório estão as `news fragments` (arquivos que ele vai utilizar para criar o changelog), qual o nome do arquivo de changelog e onde fica o template do changelog. Podemos especificar tipos diferentes de `news fragments`, nesta configuração estamos especificando feat (Features), fix (Bug fixes) e chore (Other Tasks), desta forma ele vai conseguir montar o changelog com todas as sessões que são comuns ao projeto.

Não podemos esquecer do CHANGELOG.md, é muito importante que ele possua uma linha com um comentário para que o towncrier possa entender que ele deve alterar dali para frente:

```markdown
# Changelog

<!-- towncrier release notes start -->

```

OBS: A linha no final é proposital pois ela é necessária para o towncrier se localizar adequadamente. Configure a sua IDE para não apagar essa linha caso necessário.

Agora vou compartilhar o template minimalista que normalmente utilizo em meus projetos:

```markdown
{% if render_title %}
[{{ versiondata.version }}](https://github.com/User/Project/tree/{{ versiondata.version }}) ({{ versiondata.date }})
{{ top_underline * ((versiondata.version + versiondata.date)|length + 3)}}
{% endif %}
{% for section, _ in sections.items() %}
{% set underline = underlines[0] %}{% if section %}{{section}}
{{ underline * section|length }}{% set underline = underlines[1] %}

{% endif %}

{% if sections[section] %}
{% for category, val in definitions.items() if category in sections[section] %}
{{ definitions[category]['name'] }}
{{ underline * definitions[category]['name']|length }}

{% for text, values in sections[section][category].items() %}
- {% if text %}{{ text }}{% endif %}

{% endfor %}

{% if sections[section][category]|length == 0 %}
No significant changes.

{% else %}
{% endif %}

{% endfor %}
{% else %}
No significant changes.


{% endif %}
{% endfor %}
```

Neste template, vamos iniciar com um título contendo um link para a versão no github (ajuste para a ferramenta de git que esteja utilizando) mais uma data. Então virão as sessões que definimos no arquivo de configuração juntamente com as respectivas alterações que serão lidas pelo towncrier na pasta `changelog.d`.

Pronto! Temos o towncrier configurado, mas como podemos usa-lo? Primeiro, ao longo do desenvolvimento de uma nova versão da aplicação, nós vamos adicionando `news fragments` na pasta `changelog.d` por exemplo: `add_create_product.feat`. Dentro deste arquivo colocamos um texto que será exibido no changelog, por exemplo: `Add the create product form`. Ao executarmos o towncrier ele vai ler este arquivo e montar o changelog para nós. O comando para gerar é:

```shell
$ towncrier build --yes --version 1.0.0
```

Executando este comando o towncrier irá ler os `news fragments` e montar o changelog para nós! Sem fazer perguntas durante o processo (a opção `--yes`)

Agora existe um pulo do gato maneiro que facilita um pouco a nossa vida, podemos criar um comando na linha de comando que gera o changelog e incrementa a versão (combinando o towncrier com o bump-my-version). Este comando fica um pouco grande, mas ele facilita muito o processo de geração de versão, além de também facilitar para o CI/CD gerar a versão "automagicamente" para nós. O comando é:

```shell
$ bump-my-version bump major --dry-run -v | grep 'New version will be' | sed -e 's/New version will be //' | xargs -n 1 towncrier build --yes --version && git commit -am \"Update CHANGELOG\" && bump-my-version bump major
```

Dentro deste comando nós temos a execução de alguns comandos, vou explicar em partes:
1. Lambra do `--dry-run` e do `-v` que fizemos no bump? Vamos utiliza-lo para saber qual a versão que a aplicação está indo.
2. Então vamos extrair a versão do output utilizando o `grep` e o `sed` (estes são comandos linux, talvez seja necessário adapatar para Windows. Já testei no MAC e funcionou sem problemas).
3. Com a versão extraída, vamos utilizar o `xargs` para adiciona-la na linha de comando que irá executar o towncrier (lembra do comando mais acima que mostra que precisamos especificar a versão? O xargs ajuda a especifica-la de forma dinâmica) e então executar o towncrier build com esta versão.
4. Com o changelog construído, será feito um commit adicionando tudo que está alterado no repositório com a mensagem de que o foi feito o update no changelog.
5. Por ultimo, executamos o bump novamente, mas sem utilizar o `--dry-run` para que efetivamente sejam alterado as versões. O bump também realiza um commit e gera uma tag com a versão que especificamos, neste exemplo é a `major`.

Este comando sempre está presente em meus projetos para facilitar a geração de versão das minhas aplicações.

# Conclusão

Existem diversas ferramentas que auxiliam o dia a dia nos nossos projetos. Hoje apresentei algumas delas para vocês. As ferramentas que apresentei possuem uma certa sinergia juntas e sempre estão presentes em meus projetos profissionais e pessoais.

Algumas configurações precisam ser feitas de tal forma que as ferramentas operem da forma que precisamos, algumas configurações são bem chatas de fazer pois envolvem muita tentativa e erro para verificar como estão ficando exatamente. Configurações de projetos podem ser um pouco custosas quando iniciamos novos projetos. Tendo configurações pré prontas de forma genérica ajuda no desenvolvimento inicial do projeto.

Espero que tenham gostado destas ferramentas e caso ainda não as usem em seus projetos, dê uma chance para elas. Tenho certeza que não se arrependerá.
