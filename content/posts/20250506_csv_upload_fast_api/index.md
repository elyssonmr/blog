---
title: "Upload e validação de CSV com Fastapi"
date: "2025-05-06T12:00:00-03:00"
draft: false
sidebar: true
slug: 20250506_csv_upload_fast_api
thumbnail:
  src: "img/thumbnails/20250506_csv_upload_fast_api.jpg"
  visibility:
    - list
categories:
  - "Desenvolvimento de Software"
tags:
  - "FastAPI"
  - "Projeto"
  - "Software"
---


Após um bom tempo dando manutenção em projetos que utilizam [FastAPI](https://fastapi.tiangolo.com/) eu estou finalmente criando novos projetos profissionalmente utilizando a tecnologia. No artigo de hoje eu vou compartilhar com vocês como que fiz o processamento em massa utilizando uma API REST. Vou comentar as decisões de projetos realizadas para a realização do processamento em massa e mostrar um exemplo deste processamento.

<!--more-->

# Introdução

Em diversas ocasiões nos deparamos com a necessidade de fazer processamento em massa para alguma determinada funcionalidade. Me deparei com um cenário assim onde o usuário deveria enviar um arquivo CSV para importar veículos (não é o cenário real, mas vai estar próximo) para o sistema realizar a verificação destes veículos.

Com isso me deparei com um pequeno problema: `como fazer upload de imagens para a API de leilões?`. Bom, existem diversas formas de fazer isso e cada uma pode conter vantagens e desvantagens sobre as demais. Analisando as opções e como a arquitetura da aplicação está desenhada chegamos a uma conclusão de qual seria a forma melhor para nós. Inicialmente ficamos na dúvida entre duas formas de realizar o upload do CSV mas optamos pela forma que vamos utilizar neste artigo para exemplificar com código.

Com o upload do CSV, cada linha contém informações sobre um veículo e o sistema deveria verificar estas informações junto a alguns serviços que tínhamos contrato para realizar estas verificações, ou seja, para cada uma das linhas do CSV faríamos uma ou mais chamadas a parceiros que possuíam diversas informações sobre o veículos, tais como: multas, apreensões, dividas e etc.

Inicialmente achamos que a maior dificuldade seria o processamento em massa dos itens contidos no CSV, mas acabou que a dificuldade foi realizar o upload do CSV, visto que já temos uma estrutura para a realização deste processamento.

# Decisões tomadas

Temos diversas formas de realizar o upload dos dados. Pensamos em algumas:
* **Criar um JSON com os dados necessários** -> Esta forma não foi escolhida pois quem captura estes dados são pessoas do operacional, para eles é mais fácil preencher uma planilha do que criar JSONs. Poderíamos criar uma pequena aplicação para realizar essa conversão, mas não vimos muito sentido no momento.
* **Converter o CSV para Base64** -> Também é uma solução interessante, mas ela trás alguns problemas. O primeiro problema é o overhead que o Base64 pode adicionar nos dados enviados para o servidor. Outro problema é a necessidade do cliente realizar a conversão dos dados e posterior o servidor também realizar a conversão de volta para o CSV. Lembre-se que é o time operacional que fará esse processo de conversão e não temos bem uma aplicação para auxilia-lo.
* **Upload exclusivo do arquivo de forma individual** -> Algumas APIs REST utilizam esta abordagem, por exemplo a [API de fotos do google](https://developers.google.com/photos/library/guides/upload-media). Basicamente enviamos o arquivo através de um endpoint que irá salvar o arquivo em algum lugar (podendo ser até mesmo um cache) e então retornar um ID que aponte para aquele arquivo. Desta forma conseguimos utilizar o ID em outro endpoint que efetivamente fará o processamento do arquivo que foi feito upload.

Todas as formas apresentadas são estratégias validas e tem suas vantagens para conseguirmos realizar o upload de imagens em uma API REST. Em nosso projeto optamos pela terceira opção devido ao nosso projeto já ter um cache sendo utilizado pela facilidade do time operacional em salvar um arquivo CSV que se parece como uma planilha para eles pois nós provemos um template com os campos necessários é aberto no Excel. Após o preenchimento eles mandavam um email para o time de desenvolvimento com os arquivos CSVs. Sim, não era feito pelo time operacional pois não eram pessoas especializadas para realizar chamadas em uma API.

Depois de um tempo foi criado uma aplicação para auxiliar em outros processos operacionais e então adicionamos as chamadas necessárias pra processar o CSV com os veículos. Neste momento, inclusive, testamos as demais abordagens mas voltamos para a abordagem de realizar o upload para um cache pois outros sistemas que faziam chamadas se beneficiaram demais desta forma de realizar o upload.

# Desenvolvimento do upload de CSV usando FastAPI

Bom... agora que o cenário foi explicado, vamos para um exemplo prático com FastAPI. Ao final vou disponibilizar o código todo através do [repositório](https://github.com/elyssonmr/fast_api_examples), mas vamos desenvolvendo aqui juntos o exemplo.

Vou considerar que você está com o [FastAPI](https://fastapi.tiangolo.com/#installation) e o [redis-py](https://github.com/redis/redis-py?tab=readme-ov-file#installation) instalados em seu ambiente e que está usando [Python 3.13.3](https://www.python.org/downloads/release/python-3133/) (versão mais atual na data de escrita deste artigo).

A primeira tarefa é trabalhar no endpoint de upload de arquivos no formato CSV. Para o nosso exemplo, vamos realizar o upload de um arquivo com o modelo do carro, a placa e o ano de fabricação/modelo. O endpoint vai receber o arquivo, validar que é um CSV e então ele vai salva-lo no cache gerando um ID aleatório para identificar o arquivo (vamos usar um UUID).

Antes de trabalharmos efetivamente no endpoint de upload, vamos precisar configurar uma aplicação FastAPI com uma descrição indicando que a aplicação será utilizada para exemplos. Caso você tenha [Docker](https://www.docker.com/), você não precisa instalar o Redis pois também há um `docker-compose` no repositório que irá subir esta dependência para seus testes.

a configuração do app é rápida. Vamos criar uma pasta no projeto chamada `examples`, dentro dela vamos criar o `__init__.py` sem nenhum conteúdo e o `app.py` com o conteúdo:

{{<figure src="images/code/01_app_content.png" title="Imagem com o código inicial criado dentro do app.py" legend="Imagem com o código inicial criado dentro do app.py">}}

Pronto, nosso pré requisito já está finalizado.

## Criação do endpoint de upload do arquivo

Com a criação da aplicação FastAPI realizada, nós iremos desenvolver o endpoint que irá receber o upload do CSV contendo as informações de veículos que falamos acima, validar os dados e então salvar no cache.

Com o intuito de ficar separado (este repositório vai ter um monte de outros códigos futuramente) vamos criar uma nova pasta dentro de `examples` chamada `file_upload`, dentro dela vamos criar o `__init__.py`, `routes.py` e `schemas.py`. Com os arquivos criados, nós vamos criar 3 *schemas*:

1. `VehicleSchema`: responsável por validar os dados de cada um dos veículos que vieram no CSV;
2. `VehicleCheckUploadSchema`: responsável por validar o CSV de veículos quando convertido para uma lista de dicionários;
3. `VehicleUploadResponse`: responsável por formatar a resposta do endpoint;

Como os schemas são rápidos para criar já vou colar o código de todos eles de uma vez. Basicamente estamos definindo todos os campos sem muita restrição para deixar nosso exemplo mais simples. O código do módulo `schemas.py`:

{{<figure src="images/code/02_schemas_content.png" title="Imagem com o código do módulo schemas.py" legend="Imagem com o código do módulo schemas.py">}}

Com os schemas criados, vamos partir para as rotas no módulo `routes.py`. Este módulo é um pouco mais complexo, então vamos por partes. Na primeira parte nós vamos configurar um novo router, criar uma função que atuará como uma fábrica de clients para o Redis e um tipo customizado para que possamos injeta-lo em nossas rotas.

{{<figure src="images/code/03_routes_route_config.png" title="Imagem com o código do módulo routes.py" legend="Imagem com o código do módulo routes.py">}}

Na linha 6, foi definido um novo roteador para que possamos definir as rotas para realizar o upload do arquivo e o processamento de cada item do arquivo. Neste roteador, definimos o prefixo `/upload` (prefixos precisam comoçar com */*) e também definimos a tag que irá aparecer no swagger quando ele for montador para este agrupamento de rotas.

Na linha 9, criamos a fábrica de conexões com o Redis, estamos utilizando o client async da biblioteca e como temos a intenção de injeta-lo estamos especificando que ele deve possuir somente uma conexão (`single_connection=True`) e definimos a função como um gerador async para que possamos fechar essa conexão após utiliza-la dentro da view. Detalhe: desta forma que foi feita o FastAPI faz o gerenciamento para nós pois vamos utiliza-lo em conjunto com a injeção de dependências do FastAPI.

Por último, na linha 15, estamos definindo um tipo customizado e utilizando o [Depends](https://fastapi.tiangolo.com/tutorial/dependencies/) do FastAPI para que ele injete o objeto criado pela fábrica e faça o gerenciamento do ciclo de vida deste objeto.

Continuando com o código, vamos criar o endpoint para realizar o upload do arquivo CSV. Para definir uma view, vamos definir uma função async (logo mais vamos utilizar o async dela) chamada `upload_vehicles` com somente o retorno do schema `VehiclesUploadResponse` que irá possuir um ID e uma data de validade do arquivo. Por enquanto iremos setar dados hardcoded para o retorno desta view, ok? Logo em seguida, precisamos anotar a função para indicar qual o verbo permitido, qual a rota e qual o objeto será retornado. O código deve ficar próximo a:

{{<figure src="images/code/04_route_upload_vehicles_config.png" title="Imagem com o código da rota de upload do CSV" legend="Imagem com o código da rota de upload do CSV">}}

Não esqueça de importar o `datetime` e o `timezone`. Ambos do pacote `datetime`.

```python
from datetime import datetime, timezone
```

Com a view definida, precisamos definir alguns parâmetros para ela. Primeiro vamos definir o parâmetro `file` que irá conter o arquivo a ser feito o upload. Este parâmetro é do tipo [UploadFile](https://fastapi.tiangolo.com/reference/uploadfile/?h=uploadfile) do FastAPI. Definindo este parâmetro, o FastAPI irá buscar o arquivo no campo com o nome `file` dentro do corpo da requisição e com isso criar um arquivo temporário com o conteúdo encontrado. Caso ele não encontre será retornado um erro indicando que o arquivo não está presente. O segundo parâmetro é a injeção do cache, vamos definir um parâmetro chamado `cache` e o tipo dele será o tipo que criamos logo acima: `T_Cache`. Com estes parâmetros, o FastAPI já irá realizar alguns processamentos para nós: validar/extrair se um arquivo foi veio na request e injetar uma conexão com o Redis para a view. O código deve ficar assim:

{{<figure src="images/code/05_parameters_upload_vehicles.png" title="Imagem com o código da adição dos parâmetros na rota de upload do CSV" legend="Imagem com o código da adição dos parâmetros na rota de upload do CSV">}}

Agora vamos validar cada linha do CSV. Primeiro precisamos criar um [DictReader](https://docs.python.org/3/library/csv.html#csv.DictReader) para fazer a leitura do CSV e converte-lo para dicionários do Python. Para criar o DictReader, vamos precisar converter o arquivo que veio na request para texto no encoding `UTF-8`. Para isso vamos usar a função `iterdecode` do módulo `codecs` que vem junto com a biblioteca padrão do python, passando o retorno dela como argumento para o DictReader.

{{<figure src="images/code/06_create_dict_reader.png" title="Imagem com o código da instanciação do DictReader" legend="Imagem com o código da instanciação do DictReader">}}

Agora vamos efetivamente realizar a leitura dos dados e valida-los utilizando o schema que criamos, mas temos um pequeno problema aqui: da forma como fizemos o schema vamos precisar ler o CSV todo para validar todos os itens de uma vez só. Com poucos dados isso não representa nenhum problema, mas com CSVs grandes pode ser algo que vai custar um pouco o processamento. O cenário que tínhamos eram cerca de uns 30 a 40 veículos no máximo. O código deve ficar assim:

{{<figure src="images/code/07_validate_vehicles_csv.png" title="Imagem com o código da validação dos veículos do CSV" legend="Imagem com o código da validação dos veículos do CSV">}}

Já podemos testar o endpoint!! Podemos testa-lo utilizando a documentação que o FastAPI gera para nós. Para abrir a documentação basta rodar o servidor (comando `task run` no projeto ou usando o comando `fastapi dev examples/app.py`), após iniciar o servidor projeto podemos abrir a URL `http://127.0.0.1:8000/docs` conforme é exibido no log de inicialização do servidor. Na página que abrir vamos clickar em cima do endpoint e sem seguida clickar em *Try it out*. Então um formulário será aberto para escolhermos o arquivo que vamos fazer upload (nos arquivos no github existe uma pasta files contendo um arquivo para ser testado. O CSV válido é o *valid_vehicles.csv*). Selecionado o arquivo, basta clickar em *Execute* e então a chamada será realizada enviando o arquivo selecionado.

{{<figure src="images/code/08_screen_test.png" title="Imagem do teste realizado" legend="Imagem do teste realizado">}}

Se o arquivo selecionado foi um CSV válido ele fará o upload, validação e retornará os valores hardcoded que colocamos sem nenhum erro. Mas, não estamos efetivamente tratando os erros, deixo com você implementar o tratamento dos erros.

Agora vamos remover a chamada hardcoded e salvar efetivamente o arquivo no Redis, para isso vamos gerar um UUID que será usado como chave no Redis e como identificador para referenciar o arquivo salvo futuramente. O código da troca deve ficar:

{{<figure src="images/code/09_cache_utilization.png" title="Implementação da chamada real ao cache para salvar o arquivo" legend="Implementação da chamada real ao cache para salvar o arquivo">}}

Pronto!! Finalizamos o endpoint que vai salvar o arquivo no cache. O arquivo ficará 5 minutos no cache e depois ele será excluído automaticamente pelo Redis.

## Criação do endpoint do disparo do processamento em massa

Com o endpoint salvando o arquivo no cache finalizado, vamos implementar o endpoint que efetivamente fará a chamada ao processamento dos veículos. Um ponto importante para destacar é que não vamos implementar o processamento, somente um "placeholder" da solicitação do processamento assíncrono, ok?

Antes de escrever o endpoint, vamos escrever o schema de input e o schema de response do endpoint. Para input vamos utilizar o schema `ProcessVehiclesInfoSchema`:

{{<figure src="images/code/10_vehicles_schema.png" title="Implementação do Schema do endpoint de processamento dos veículos" legend="Implementação do Schema do endpoint de processamento dos veículos">}}

Para a resposta será o `ProcessVehiclesInfoResponse`:

{{<figure src="images/code/11_vehicle_response.png" title="Implementação do Response do endpoint de processamento dos veículos" legend="Implementação do Response do endpoint de processamento dos veículos">}}

Com os schemas implementados podemos agora implementar o endpoint `/process_vehicles_infos` utilizando os schemas que criamos. No endpoint nós iremos ler o cache com a chave que foi informada no `solicitation.file_identification`. Caso seja retornado alguma informação, nós iremos novamente fazer o parse do CSV e para cada item vamos chamar a tarefa `placeholder` de processamento passando um ID como identificador do processo e o veículo a ser processado:

{{<figure src="images/code/12_vehicle_process_endpoint.png" title="Implementação do endpoint de processamento dos veículos" legend="Implementação do endpoint de processamento dos veículos">}}

**OBS:** Você deve ter percebido que existe alguns furos no código, tais como: quando o processamento do CSV finalizou por completo. Não fique bravo, mas é proposital, o código está focando somente no upload e em minha defesa eu deixei margens para melhorias para que você possa extender e estudar mais. Uma outra dica é que também seria interessante salvar os veículos em um banco de dados e somente passar IDs para o processamento assíncrono.

## Como testar?

Junto no repositório é provido um docker-compose que vai executar o sistema e o cache. Antes de inicializar os testes certifique-se que você tenha executado o docker-compose antes para que a aplicação e a dependência esteja executando.

Existem duas formas de executar os testes que gostaria de destacar aqui:

A primeira forma é através da documentação Swagger que o fastapi provê. Basta abrir o endereço {{<assetnewtab title="localhost:8000/docs">}}. Então poderemos interagir com os endpoints que foram criados ao longo do artigo. Primeiro faremos o upload do CSV com os veículos no endpoint `/upload/upload_vehicles`. Basta clickar em cima do endpoint e no conteúdo que abrir clickar em "Try it out", escolher o arquivo CSV (lembrando que no repositório do projeto tem um válido para ser usado) e por último clickar em "Execute". Feito isso temos cerca de 5 minutos para utilizar a chave retornada no próximo endpoint `/upload/process_vehicle_infos`. O procedimento é o mesmo que do endpoint de upload, a diferença é que vamos precisar preencher os dados do endpoint com o ID retornado na chamada do upload, um email genérico e uma descrição. Após o preenchimento faremos clique em "Execute" para realizar a chamada ao endpoint. Pronto!! Teste realizado hehehe

A segunda forma é através do [Postman](https://www.postman.com/). Caso você já o tenha instalado, está pode ser a forma mais simples. Logo abaixo temos um código de CURL para chamada que realiza o upload. Será somente necessário alterar o caminho do CSV válido:

```shell
curl --location 'localhost:8000/upload/upload_vehicles' --form 'file=@"/PATH/TO/valid_vehicles.csv"'
```

Copie o código acima e importe ele no seu Postman, desta forma ele vai criar uma nova aba com a chamada já pré preenchida. Então clique em Body para alterar o caminho do CSV que será usado e por último clique em "Send". Na resposta, copie o ID retornado para utilizarmos no próximo endpoint:

```shell
curl --location 'localhost:8000/upload/process_vehicles_infos' \
--header 'Content-Type: application/json' \
--data-raw '{
    "requester_email": "email@email.com",
    "file_identification": "COLE O ID AQUI",
    "description": "Article test"
}'
```

A segunda chamada é mais simples, basta substituir o ID e clicar em "Send". Pronto!! Teste realizado hehehe

Existem outras formas que você pode explorar, como criando um script para a realização do teste ;)

# Conclusão

Quando estamos desenvolvendo uma API, algumas decisões de Design podem influenciar em como esta API irá se comportar. Sempre temos que tentar ao máximo padronizar a API utilizando os mesmos tipos de recursos, mas nem sempre conseguiremos devido a algumas limitações técnicas dos recursos que precisamos utilizar na API.

Na minha experiência, em raras ocasiões nós precisamos enviar arquivos para a API, normalmente somente enviamos JSONs. Na resposta já tivemos diversos casos que retornamos arquivos, principalmente PDFs contendo algum relatório solicitado pelo usuário. Claro que dependendo do tipo de sistema que está sendo criado isso pode mudar complementamente, se pensarmos em um sistema tipo o Instagram, eu não tenho dúvidas que o upload de arquivos deve ser super comum.

Com os recursos do FastAPI e do Pydantic, nós conseguimos uma vasta gama de possibilidades e recursos para lidarmos tanto com JSONs quanto com arquivo. A validação do dados enviados também torna uma tarefa um pouco mais simples de ser realizada devido a utilização destes recursos.


Link para o [repositório](https://github.com/elyssonmr/fast_api_examples).
