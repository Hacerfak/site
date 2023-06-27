---
layout: post
title:  "Configurações pós instalação do debian 12"
date:   2023-06-25 17:00:00 -0300
categories: debian
---

Nesse post, vou mostrar quais são as configurações e instalções que faço após realizar a instalação do debian.

# A máquina...

Primeiro, é importante ressaltar que essa instalação será feita em uma máquina 🖥️ com as seguintes configurações:

- **CPU:** Ryzen 5 5600x
- **MB:** Asus TUF Gaming X570-PLUS/BR
  - *Áudio:* ALC S1200A (ALC1200)
  - *LAN:* Realtek L8200A (RTL8111/8168/8411)
- **GPU:** RTX 3070
- **Wi-Fi/BT:** Intel Wi-Fi 6 (AX210/AX211/AX411) 160MHz

Dito isso é importante lembrar que pode ser que algumas das configurações não se apliquem a qualquer instalação do Debian, pois isso varia muito conforme o hardware onde o sistema foi instalado.

Quanto a instalação do Debian, ela é feita a partir de uma mídia de instalação do tipo [netinst](https://www.debian.org/CD/netinst/), ou seja, uma mídia de instalação mínima que depende de uma conexão com a internet para baixar os pacotesdo sistema. Além disso a instalação é feita de forma limpa, sem instalar nenhum tipo de pacote ou utilitário adicional pelo **tasksel** que é executado durante a instalação.

Basicamente ao finalizar a instalação eu tenho um sistema com **222** pacotes instalados.

Você pode visualizar a quantidade de pacotes instalados ao rodar o comando: `apt list –-installed | wc -l` ou `sudo apt list –-installed | wc -l` caso não seja superusuário.

# O pacote SUDO e o auto complete do BASH

Como primeiro passo eu instalo o pacote [sudo](https://wiki.debian.org/sudo) para conseguir executar comandos de superusuário a partir do meu usuário comum. Para isso preciso logar primeiro no usuário _root_. Depois é só executar os comandos:

1. `apt install sudo` - para instalar o pacote.
2. `adduser usuário sudo` - para adicionar o usuário ao grupo _sudo_, e assim ter acesso aos recursos. Onde "usuário" é o seu login.

Após é só deslogar de root com o comando _exit_

Agora podemos logar no usuário comum, e assim já podemos testar o funcionamento do sudo instalando o pacote **bash-completion** que ajuda com opções de auto completar usando tab.

`sudo apt install bash-completion`

Será solicitada a senha do usuário para finalizar a execução do comando.

Pronto! Agora começamos com a configuração dos repositórios.

# Espelhos

Antes de começar qualquer tipo de instalação é necessário configurar os espelhos dos repositórios, para que tenhamos uma conexão mais estável e rápida.

Geralmente o espelho central (deb.debian.org) tem uma boa conexão, mas a fim de desafogar o tráfego para este servidor, é preferível que configuremos repositórios mais próximos de nossa localização.

Para ver a lista completa de espelhos de repositórios do debian, [acesse essa página](https://www.debian.org/mirror/list).

# A configuração dos repositórios

Para configurar os repositórios no debian, vamos editar o arquivo **sources.list**, este por sua vez pode ser acessado em **/etc/apt/sources.list**

Para visualizar seu conteúdo, podemos usar o comando `cat /etc/apt/sources.list`

Para editá-lo, devemos usar o comando sudo para ter privilégios de superusuário e assim poder salvar o arquivo depois, senão temos apenas o acesso a leitura.

Como editor de texto, eu gosto de utilizar o [nano](https://packages.debian.org/bookworm/nano). Então para editar o arquivo, usamos:
