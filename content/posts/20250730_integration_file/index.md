---
title: "Técnicas de Integração: Arquivos"
date: "2025-07-23T18:00:00-03:00"
draft: false
sidebar: true
slug: 20250723_integration_file
thumbnail:
  src: "img/thumbnails/20250723_integration_file.jpg"
  visibility:
    - list
categories:
  - "Arquitetura Software"
tags:
  - "Projeto"
  - "Software"
  - "Integração"
---

No artigo de hoje vamos falar sobre uma técnica de integração de software, um tanto quanto antiga mas simples, que é a integração de sistemas por arquivos. Como de costume, nós iremos discutir sobre os conceitos envolvidos e também vou trazer um exemplo para vocês.

<!--more-->

# Introdução

Desde quando os primeiros sistemas foram criados, há a necessidade da comunicação com outros sistemas. Em tempo mais antigos (como os Maias faziam) não tínhamos muitos recursos computacionais para realizar a comunicação entre processos (diferente aplicações). A comunicação via rede era bem limitada e lenta, porém era necessário processar diversas informações como por exemplo folhas de pagamento de uma empresa, além de que não haviam sistema de mensageria robustos como temos hoje.

Para sanar este problema a integração entre sistemas precisava de alguma forma de se comunicar de forma independente para realizar o processamento necessário. Dai que surgiu a integração de sistemas via arquivo.

# Integrando sistemas via arquivos

A integração via arquivos, a grosso modo, é bem simples. Uma aplicação gera um arquivo contendo dados, enquanto que outra aplicação lê este arquivo e realiza algum processamento a partir destes dados. Para realizar o processamento as aplicações ficavam monitorando as pastas para o caso de um novo arquivo ser salvo, caso encontrasse um novo arquivo, a aplicação lê o arquivo para realizar o processamento deste arquivo.

Este tipo de integração pode ser bem simples ou bem complicado, vai depender um pouco dos requisitos. Por exemplo, temos um sistema que faz o controle de ponto dos funcionários de uma determinada empresa, este sistema vai gerar um arquivo contendo as informações de entradas e saídas de cada um dos funcionários para que o sistema que calcula o salário possa realizar os cálculos necessários e somar qual o valor do salário de cada funcionário. O sistema de calculo vai monitorar a pasta de output do sistema de ponto e caso um novo arquivo seja salvo, ele irá processa-lo gerando a folha de pagamento em pasta de output.

Em um exemplo mais complexo, podemos utilizar servidores de {{<externalnewtab src="https://pt.wikipedia.org/wiki/Protocolo_de_Transfer%C3%AAncia_de_Arquivos" title="FTP (File Transfer Protocol)">}} ou serviços de armazenamento de arquivos como o {{<externalnewtab src="https://aws.amazon.com/pt/s3" title="S3 da AWS">}} ao invés de pastas de arquivos, desta forma os sistemas não precisam estar na mesma máquina.

A integração via arquivo possui algumas vantagens:

1. **Simplicidade**: É uma técnica relativamente simples de ser implementada. Não requer uma grande complexidades para processar
2. **Desaoplamento**: Como uma aplicação não se comunica diretamente com outra, temos um alto grau de desacoplamento entre elas, pois a comunicação é realizada de forma indireta via arquivos. A comunicação indireta também permite que o sistema evoluam de forma independente.
3. **Flexibilidade**: Como estamos lidando com arquivos, é possível utilizar diversos formatos diferentes. Por exemplo, JSON, CSV, XML, formato binário e etc. O formato deve ser adequado ao meio de comunicação que se deseja utilizar.
4. **Tolerância a falhas**: Permite o processamento posterior dos arquivos caso alguma aplicação esteja falhando

Também é bom se atentar as desvantagens:

1. **Latência**: A latência da aplicação pode aumentar um pouco devido a necessidade de ler informações do disco (caso o arquivo seja disponibilizado em uma pasta) ou da necessidade de consultar um arquivo em algum serviço online (neste caso ainda devemos considerar o download do arquivo)
2. **Consistência**: A gestão dos arquivos pode ser algo bem complexo em alguns cenários, por exemplo, se tivermos uma aplicação com múltiplos processos tentando ler a pasta onde os arquivos estão sendo disponibilizados existe a possibilidade de um mesmo arquivo ser processado mais de uma vez. Neste caso é necessário implementar mecanismos para garantir que um arquivo seja processado somente uma vez
3. **Segurança**: Para casos onde os arquivos são disponibilizados via internet é necessário se preocupar com a segurança durante esta transferência. Para arquivos disponibilizados em pastas, a segurança também se vê necessária, visto que outros processos e/ou pessoas podem acessar o arquivo também. Nestes casos devem-se implementar mecanismos para garantir a segurança dos dados
4. **Complexidade de Gerência dos Arquivos**: A medida que a vai se integrando diversos sistemas, a complexidade de pastas e arquivos disponibilizados vai aumentando também. A complexidade alta torna a gerência dos arquivos mais complexa e também dificulta um pouco a rastreabilidade dos arquivos ao longo do processo que eles devem percorrer.

Assim como todas as integrações entre sistemas, a integração via arquivos precisa de alguns cuidados:

* Planejar e documentar os formatos dos arquivos para que todos os sistemas que irão processar os arquivos possam lê-lo sem problemas;
* Decidir o que vai acontecer em cenários de falhas, ou seja, o que faremos com os arquivos nos cenários de falha;
* Padrão de nomenclatura de arquivos que seja fácil dar manutenção e, caso necessário, ordenar os arquivos gerados;

## Ainda é utilizado hj?

Apesar de ser uma técnica antiga, ela ainda é utilizada hoje em dia em alguns cenários.

Aqui no Brasil, quando pagamos um boleto é gerado um arquivo no padrão CNAB (Centro Nacional de Automação Bancária) que é trocado entre bancos de forma a processar estes boletos. Quando trabalhei com pagamentos, nós recebíamos um arquivo no padrão CNAB todos os dias de madrugada para processarmos quais boletos emitidos foram pagos. Esta integração ocorria via arquivo enviado pelo banco o qual utilizávamos para emitir os nossos boletos.

Ja trabalhei com uma ferramenta, que para realizar a exclusão de chaves criptográficas em lote (excluir muitas de uma vez só), era necessário montarmos um CSV, realizar o upload deste CSV via FTP para um endereço que eles disponibilizaram e então eles realizavam o processamento da exclusão em lote para nós. A outra alternativa era excluir chave a chave via API, o que consumia uma request do total que tínhamos contratado (eles cobravam por requests também). O grande problema aqui é que após uma Black Friday, poderíamos ter mais de 100 mil chaves para excluir.

Dentre outros.

# Exemplo prático

Montei um exemplo prático para demonstrar essa integração ocorrendo. vou disponibiliza-lo pelo {{<externalnewtab src="https://gist.github.com/elyssonmr/b23bbfa4345300597d649a9ae74f316c" title="gist">}} para que você possa estudar o código e até mesmo estende-lo aplicando novas funcionalidades.

Não vou entrar em detalhes de toda implementação, mas caso tenha dúvidas por favor deixa um comentário que respondo assim que possível.

Bom... na implementação foi criado 3 aplicações (elas estão numeradas de acordo com a ordem do processamento):

1. A primeira aplicação vai gerar dados falsos de uma fatura de energia elétrica, salvar este dados em formato JSON em um arquivo para a segunda aplicação;
2. A segunda aplicação vai ler os dados salvos, gerar um PDF de acordo com um template simples que a IA me ajudou a montar e ao final remover o arquivo de entrada assim que o PDF foi gerado.
3. A terceira e última aplicação, vai ler o PDF, extrair o email do cliente do nome do arquivo e então simular um envio de email para o cliente;

Em todas as aplicações adicionei sleeps e lotes de processamento um pouco diferentes para simularmos que as aplicações possam gerar um output em tempo diferente das demais. Para não ficar toda hora lendo o disco, adicionei algumas pausas para o caso de não encontrar nenhum arquivo para processamento.

Para executar a aplicação `01_data_producer` é necessário instalar a biblioteca `Faker`. Já a aplicação `02_pdf_writer` será necessário instalar as bibliotecas `weasyprint` e `Jinja2`. O comando para instalar tudo é:

```sh
pip install Faker weasyprint Jinja2
```

Caso tenha problemas com a instalação, por favor mande suas dúvidas no comentário que eu tento ajudar a resolver.

Do código eu gostaria de destacar algumas partes:

Na aplicação `01_data_producer`, decidir por salvar o arquivo com um timestamp porque desta maneira podemos garantir uma certa ordem no processamento. Como não há a necessidade de nenhuma informação extra, o nome do arquivo é simplesmente um timestamp: `175315440531605.json`. Está ordenação também foi utilizada para as demais aplicações.

{{<figure src="images/01_save_invoice.png" title="Código para salvar um JSON com dados falsos" legend="Código para salvar um JSON com dados falsos">}}

Na aplicação `02_pdf_writer`, ao realizar a leitura dos arquivos na pasta, está sendo limitado a 5 arquivos e deste 5 arquivos ainda é reduzido mais ainda verificando se cada um destes arquivos é realmente um arquivo, pode-se adicionar uma pasta no diretório que não irá quebrar a aplicação. Esta maneira foi proposital para demonstrar como uma validação pode ser feita para verificar se o arquivo é realmente um arquivo sem a necessidade de abri-lo (o que tornaria mais lento a leitura).

{{<figure src="images/02_list_invoices_files.png" title="Código para a leitura de arquivos antes de gerar o PDF com os dados lidos" legend="Código para a leitura de arquivos antes de gerar o PDF com os dados lidos">}}

Ainda na aplicação `02_pdf_writer` também gostaria de destacar a função que faz a escrita do arquivo de saída no formato de PDF. Neste caso, foi adicionado o email do cliente ao nome do arquivo. Este foi um design simples para conseguirmos informar para a aplicação `03_email_sender` para qual email ela deveria enviar o PDF anexado. Sinceramente, não sei se seria uma boa prática, mas a título de exemplo funcionou bem e deixou o design mais simples.

{{<figure src="images/03_save_pdf_with_email.png" title="Código para a salvar o PDF com o email do cliente no nome" legend="Código para a salvar o PDF com o email do cliente no nome">}}

Se as aplicações não estivessem fazendo uma simulação, alguém receberia um email com o PDF de invoice anexado. Caso tenha curiosidade de ver o PDF antes de executar a aplicação, basta {{<assetnewtab src="assets/invoice_175315440531605_kristenorr@elyblog.com.pdf" title="visualizar este exemplo">}}. Outra forma é deixar de executar a aplicação para o envio de email e vizualizar um dos PDFs gerados.

Recomendo executar as aplicações (exemplos de comandos estão dentro do gist) e estudar o código para entender melhor a arquitetura de integração via arquivos. {{<externalnewtab src="https://gist.github.com/elyssonmr/b23bbfa4345300597d649a9ae74f316c" title="Link para o gist">}}.

# Conclusão

A arquitetura de integração de sistemas via arquivo é um arquitetura que já é utilizada a um bom tempo. Quando ela foi projetada, não tínhamos os recursos de rede que temos hoje, desta forma a troca de arquivos era somente via pastas dentro de um mesmo computador. Hoje temos outras formas de distribuir os arquivos via serviços web para que outros sistemas possam realizar um processamento nestes arquivos.

Assim como todas as arquiteturas, ela possui vantagens e desvantagens. Dependendo do cenário pode ser muito mais vantajoso utilizar esta arquitetura do que outras. Um bom arquiteto irá avaliar qual a melhor solução para cada um dos cenários que estiver trabalhando. Tomando assim, a melhor decisão possível para aquele cenário considerando as vantagens e desvantagens de cada estilo arquitetural.

Com o exemplo apresentado no artigo, pode-se ter uma ideia de como esta arquitetura funciona. Além de que os exemplos podem ser estendidos para melhorar o entendimento da arquitetura de integração via arquivos.

**Fontes**

* {{<externalnewtab src="https://pecepoli.com.br/m_files/00047880_000256_monografia01.pdf" title="Análise da Arquitetura de Software Para Interoperabilidade Entre Sistemas Via Arquivos">}}
