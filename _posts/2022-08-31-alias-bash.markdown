---
layout: post
title:  "Como criar um alias no bash"
date:   2022-08-31 22:30:00 -0300
categories: bash
---

Para criar um alias no bash, você pode utilizar o arquivo .bashrc do usuário root ou do usuário local.

Exemplo:

{% highlight bash %}
alias update='sudo apt-get update && sudo apt-get -u dselect-upgrade -y'
{% endhighlight %}

Esse alias cria o "comando" update, onde ele executa os comandos update e upgrade do gerenciador de pacotes apt. O && é uma condicional, onde ele executa o comando em sequencia desde que nao haja nenhum erro.
