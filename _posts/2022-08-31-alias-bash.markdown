---
layout: post
title: "Como criar Alias no Bash: Produtividade no Terminal Linux"
excerpt: "Aprenda a criar atalhos personalizados (alias) no Linux para simplificar comandos longos e aumentar a sua produtividade no dia a dia."
description: "Guia prático sobre como configurar alias no .bashrc, tornar atalhos permanentes e exemplos úteis para utilizadores Debian e Ubuntu."
date: 2022-08-31 10:00:00 -0300
last_modified_at: 2022-09-09 14:00:00 -0300
categories: [Linux, Produtividade]
tags: [Bash, Terminal, Atalhos, Debian]
author: Eder Gross Cichelero
---

Para criar um alias no bash, você pode utilizar o arquivo `.bashrc` do usuário root ou do usuário local.

Exemplo:

{% highlight bash %}
alias update='sudo apt-get update && sudo apt-get -u dselect-upgrade -y'
{% endhighlight %}

Esse alias cria o "comando" update, onde ele executa os comandos update e upgrade do gerenciador de pacotes apt. O `&&` é uma condicional, onde ele executa o comando em sequencia desde que nao haja nenhum erro.
