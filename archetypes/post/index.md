---
title: "{{ replace .ContentBaseName '-' ' ' | title }}"
date: "{{ .Date }}"
draft: false
sidebar: true
slug: {{ .ContentBaseName }}
thumbnail:
  src: "img/thumbnails/default_thumbnail.jpg"
  visibility:
    - list
categories:
  - "Arquitetura Software"
tags:
  - "Documentação"
  - "Projeto"
  - "Software"
---
