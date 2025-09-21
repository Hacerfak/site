---
layout: post
title:  "How to create an alias in bash"
date:   2022-08-31 22:30:00 -0300
categories: bash
lang: en
---

To create an alias in bash, you can use the `.bashrc` file of the root user or the local user.

Example:

{% highlight bash %}
alias update='sudo apt-get update && sudo apt-get -u dselect-upgrade -y'
{% endhighlight %}

This alias creates the "command" update, where it runs the update and upgrade commands of the apt package manager. The `&&` is a conditional operator, which executes the next command in sequence as long as there is no error.
