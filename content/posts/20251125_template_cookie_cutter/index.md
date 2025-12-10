---
title: "Templates com o Cookie Cutter"
date: "2025-12-10T12:00:00-03:00"
draft: false
sidebar: true
slug: 20251210_template_cookie_cutter
thumbnail:
  src: "img/thumbnails/20251210_cookiecutter.png"
  visibility:
    - list
categories:
  - "Engenharia de Software"
tags:
  - "Template"
  - "Projeto"
  - "Software"
---

Depois de uma série de artigos sobre configurações de projeto, chegou a hora de eu apresentar para vocês uma ferramenta muito maneira que auxilia na configuração de projetos chamada [Cookiecutter](https://github.com/cookiecutter/cookiecutter). Com ela podemos criar diversos templates e personaliza-los de acordo com o projeto que estamos fazendo.

<!--more-->

# Introdução

Muitas vezes trabalhamos em diversos projetos que são parecidos em sua estrutura, mas com algumas poucas diferenças como nomes e etc. Ao invés de termos que configurar tudo novamente a cada novo projeto. Podemos criar um template, configura-lo, adicionar dependências para então utiliza-lo em diversos projetos fazendo com que não seja mais necessário reconfigurar todas dependências comuns e de um novo projeto.

Nos últimos artigos nós configuramos algumas dependências que podem ser utilizadas em quase todos os projetos. Neste artigo vamos utilizar as configuração que foram feitas para criar um template que podemos personalizar utilizando o Cookiecutter.

# Como o Cookie Cutter funciona?

Para configurar um template, precisamos primeiro entender um pouco de como o cookiecutter funciona. Desta forma podemos criar templates melhores e/ou mais simples para as necessidades de cada tipo de projeto. Podemos fazer templates super complexos e completos, mas neste artigo vamos explorar recursos mais simples que já ajudam bastante a aumentar a produtividade configurando os seus projetos.

## Substituição de variáveis

O funcionamento do cookiecutter é basicamente copiar arquivos e verificar dentro destes arquivos se eles possuem tags para ser substituídas pelos valores que foram lidos no momento que o comando foi executado. Desta forma conseguimos adicionar um pouco de personalização nos templates.

Para exemplificar vamos utilizar o template de FastAPI criado para este projeto (vamos falar mais sobre ele em um momento). Nele podemos informar um nome do projeto e então utilizar esta variável nome em diversas partes do projeto. A variável também pode ser utilizada sugerir um valor padrão para o pacote principal do projeto.

{{<figure src="images/01_template_variables.png" title="Variáveis de template" legend="Variáveis de template">}}

No arquivo de configuração do cookiecutter podemos ler diversas variáveis para configurar o nosso projeto de acordo com o que precisamos.

## Fluxo de execução do Cookiecutter

Ao executar um comando para gerar um projeto, algumas etapas ocorrem conforme o diagrama a baixo:

{{<figure src="images/02_execution_diagram.png" title="Diagrama de execução do Cookiecutter" legend="Diagrama de execução do Cookiecutter">}}

A primeira etapa: "**Hook de pré prompt**" é executada antes do Cookiecutter perguntar quais são os valores das variáveis. Por conta disso não temos nenhuma variáveis que configurada durante esta etapa, então para o que ela pode ser usada?? Esta etapa pode ser utilizada para verificar se o ambiente possuem alguma instalação necessária para que o projeto seja executado adequadamente. Por exemplo, podemos verificar se o docker está instalado, se alguma lib do sistema está disponível e etc. Caso não esteja, também podemos executar a instalação por este hook.

Em seguida, na etapa "**Perguntas do Prompt de Configuração**" o Cookiecutter irá perguntar qual os valores das variáveis dando como sugestão os valores que foram pré preenchidos no arquivos de configuração (vamos falar sobre ele logo logo). Nesta etapa quem estiver executando o comando poderá personalizar o template com as variáveis.

Na etapa: "**Hook de Pré Geração de Template**" podemos executar verificações nas variáveis que foram lidas. Desta forma conseguimos garantir que quem esteja utilizando o template possa utilizar valores válidos nas variáveis.

Finalmente a etapa principal: "**Renderização do Template**", nesta etapa que o Cookiecutter irá renderizar o conteúdo do template substituindo as variáveis que definimos dentro de arquivos e/ou na estrutura do projeto. Podemos aplicar alguns filtros nestas variáveis para manipular o como o valor será substituído.

A ultima etapa: "**Hook de Pós Geração**" é executada após o template ser renderizado por completo. Nelas podemos remover arquivos não utilizados, rodar comandos extras para configurar alguma coisa (como o git por exemplo) e etc.

Um ponto importante para destacar é que todas etapas de Hooks, são etapas personalizadas que podemos adicionar código no template para ser executado. Os limites cabe a sua imaginação de criar os hooks personalizados.

# Configurando um template

Agora vou mostrar para vocês como que configuramos um template. Nesta configuração vou mostrando uns exemplos do [template de FastAPI](https://github.com/elyssonmr/fastapi-template) que normalmente utilizo em meus projetos particulares. Caso este template ajude em seus projetos, fique a vontade para fazer o fork do projeto e adicionar outras dependências que você utiliza, caso necessário.

**OBS**: Dependendo de quando você estiver lendo este artigo as dependências podem ser diferentes, mas o conceito permanecerá os mesmos.


# Utilizando o Cookiecutter

Existem algumas maneiras de criar um template no Cookiecutter, neste artigo vamos explorar uma maneira bem simples que é basicamente criar uma pasta com a estrutura do projeto, uma pasta com os hooks e o arquivo de configuração do Cookiecutter. A estrutura deve ficar assim:

{{<figure src="images/03_cookiecutter_structure.png" title="Estrutura do Cookiecutter" legend="Estrutura do Cookiecutter">}}

Na imagem, você notou que tem uma pasta com um texto estranho? Este texto é a pasta do projeto. O texto está assim pois ele vai ser substituídos por uma das variáveis que lemos ao executar a renderização do template. Neste caso o valor é `{{ cookiecutter.project_slug }}`.

Para explorar melhor esta estrutura, vamos explorar o arquivo `cookiecutter.json`. Nele definimos quais as variáveis vamos ler durante o processo de renderização e seus valores padrões. Também podemos definir algumas coisas a mais. Esta construção para utilizar as variáveis é assim pois o cookiecutter utiliza o [Jinja2]() como motor para processar os valores das variáveis.

{{<figure src="images/04_cookiecutter_json_content.png" title="Conteúdo do cookiecutter.json" legend="Conteúdo do cookiecutter.json">}}

No arquivo estamos definindo nas primeiras linhas (da linha 2 até a linha 6) quais variáveis vamos solicitar para serem preenchidas durante a etapa de "prompt das variáveis". Cada uma dessas variáveis possui um valor padrão que também foi definido com valores estáticos, porém a variável `project_slug` está aplicando dois filtros a partir do valor da variável `project_name`. O primeiro filtro é o `lower` que irá converter todo o texto da variável `project_name`. Logo em seguida é aplicado um filtro que irá fazer o "replace" de espaços por "_". Todos esses filtros determinaram o valor padrão da variável `project_slug`, durante o prompt o valor pode ser lido de acordo com o que for informado.

Logo abaixo das variáveis (linha 7) temos o "dunder prompt". Esta configuração é para indicar pro Cookiecutter quais textos ele deve apresentar na hora de ler as variáveis, desta forma conseguimos configurar um prompt que solicita as variáveis de uma forma melhor para lermos. Não é obrigatório adicionar esta configuração, mas ela ajuda na hora de ler as variáveis de uma forma amigável para lermos.

A última configuração (linha 14) é para que o Cookiecutter não tente renderizar os as strings de template (`{{ template }}`) dos arquivos que especificarmos lá, ele vai somente copiar o arquivo durante a renderização. O motivo de adicionarmos este arquivo em especial é que ele também possui um template em Jinja2 utilizado pelo Towncrier para montar o changelog. Sinceramente não sei se conseguimos fazer um escape ou ignorar as variáveis não conhecidas, mas achei mais fácil simplesmente pular este arquivo por enquanto.

Na pasta de `hooks` temos os 3 hooks que podemos utilizar. Apesar de não estar na ordem, vamos falar dos hooks de acordo com as etapas de execução que foram apresentadas no fluxo mais acima.

O código do primeiro hook esta no arquivo `pre_prompt.py`, neste hook estamos verificado se o sistema possui o docker instalado pois ele é necessário no projeto. Não vou entrar em detalhes do código, mas você pode [conferi-lo aqui](https://github.com/elyssonmr/fastapi-template/blob/main/hooks/pre_prompt.py).

O código do segundo hook está no arquivo `pre_gen_project.py`, nele estamos utilizando o valor da variável `project_slug` (`{{ cookiecutter.project_slug }}`) para realizar uma validação se o valor que o usuário inseriu está válido. Não vou entrar em detalhes do código, mas você pode [conferi-lo aqui](https://github.com/elyssonmr/fastapi-template/blob/main/hooks/pre_gen_project.py).

O terceiro hook está no arquivo `post_gen_project.py`, este hook somente informa que o arquivo de `template.md` na pasta `changelog.d` será copiado e que a URL do git deve ser alterada. Não vou entrar em detalhes do código, mas você pode [conferi-lo aqui](https://github.com/elyssonmr/fastapi-template/blob/main/hooks/post_gen_project.py).

Entrando na pasta que contém o template `{{ cookiecutter.project_slug }}`, está toda a estrutura do projeto e em alguns arquivos será realizado a substituição utilizado as variáveis que lemos durante a execução do comando. Vamos passar por alguns arquivos para explicar estas substituições.

Na estrutura temos uma pasta que possui o mesmo nome da pasta de template (`{{ cookiecutter.project_slug }}`), ela é o pacote principal do projeto. Por isso estamos substituindo o nome dela com o slug do projeto. Dentro dela temos os arquivos que são minimamente necessários para o projeto.

Vamos ver alguns arquivos? Entrando no [app.py]() temos uma variável de substituição no import do `Settings` e o restante do arquivo define um `APIRouter` com a *v1* da API. A maioria dos arquivos as substituições ocorrem nos imports para utilizar o pacote padrão que configuramos via variável.

No [pyproject.toml](https://github.com/elyssonmr/fastapi-template/blob/main/%7B%7B%20cookiecutter.project_slug%20%7D%7D/pyproject.toml) nós temos mais substituições do que nos demais arquivos pois nele temos o nome do projeto, a descrição, os dados do autor e até mesmo o pacote que o Pytest vai calcular a cobertura de código. Além de outras configurações comuns como execução da aplicação, dos testes, geração de versão e changelog, lint e etc.

Agora que entendemos a estrutura do template, vou mostrar o comando para executar a renderização do template. Antes da execução garanta que o Cookiecutter esteja instalado em seu ambiente. Podemos executar utilizando o repositório que o template está no github, para isso devemos executar o comando:

```sh
$ cookiecutter https://github.com/elyssonmr/fastapi-template.git
```

Basicamente o comando é `cookiecutter ENDEREÇO_HTTPS_REPOSITÓRIO.git`. Existem outras formas de executar como, por exemplo, de um arquivo zip (assim que usei para montar o template e testa-lo): `cookiecutter NOME_ARQUIVO_ZIP`. Ao executar ele poderá perguntar se deseja fazer novamente o download e então irá mostrar os prompts para a leitura das variáveis. Por exemplo:

{{<figure src="images/05_cookiecutter_execution.png" title="Exemplo de execução" legend="Exemplo de execução">}}

Após executar o comando do cookiecutter, será montado uma pasta com o projeto de acordo com o que foi configurado no template e na leitura das variáveis. Considerando que o template tenha tudo que é necessário para executar o projeto, já temos um projeto estruturado e funcional para começar a nossa aplicação.

# Como manter o template atualizado

Durante a escrita deste projeto eu peguei um template que normalmente utilizo em minhas aplicações e alterei ele para suportar o cookiecutter. Neste processo precisei fazer algumas atualizações nas bibliotecas, mas eu já estava com as strings formatadas para que o cookiecutter possa substitui-las com os valores lidos da etapa de prompt.

Nisto eu descobri que o poetry, não consegue executar pois ele entende que diversos nomes não possuem valores válidos e por isso ele não executa. Desta forma eu fiz o seguinte passo a passo:

1. Criei um projeto a partir do template, desta forma o poetry executou sem problemas
2. No projeto criado, verifiquei se existe alguma atualização das bibliotecas instaladas (`poetry update`)
3. Caso existam novas versões, copiei os números destas versões para o template e também copiei o arquivo de lock do poetry para que a versão nova instalada esteja fixada corretamente. Qualquer coisa se der problema, delete o `poetry.lock` e execute o comando `poetry lock` que o arquivo será gerado novamente com as versões corretas

Não sei bem se existe alguma forma melhor de fazer isso, mas desta forma deu certo. Caso descubra alguma forma melhor eu vou atualizar este artigo contemplando isso.

# Conclusão

Padronizar projetos que estamos trabalhando é uma boa ideia para podermos ter uma evolução conjunta destes projetos. Claro que projetos previamente criados não serão atualizados desta forma, mas pelo menos novos projetos vão estar padronizados e com as melhores práticas que formos aprendendo ao longo do desenvolvimento destes projetos.

Utilizar ferramentas como o Cookiecutter, ajudam muito na personalização destes templates, podemos ter projetos padronizados e ao mesmo tempo personalizáveis. nem sempre um novo projeto vai ser exatamente nos mesmos moldes e ter como personaliza-los pode ser super positivo para o time. Apesar de no artigo termos feito personalizações simples, o cookiecutter permite diversas personalizações mais robustas e complexas. Para muitos casos apenas personalizações simples já serão o suficiente, mas para outros teremos que fazer personalizações mais complexas para que possamos atingir o objetivo desejado.

Se você gostou do artigo, compartilhe com os seus amigos e colegas, deixe um comentário e espero que tenha contribuído com um pouco de conteúdo novo para você.
