---
layout: post
title: "Gerenciar Boot UEFI no Debian"
date: 2025-12-06 21:30:00 -0300
categories: [UEFI, Debian, Boot]
featured: true
---
# Sobre o conteúdo

Hoje vamos dar uma olhadinha em como gerenciar as entradas de boot UEFI no Debian utilizando a ferramenta `efibootmgr`.

Além disso, vamos aproveitar e ver como restaurar a entrada de boot do Windows caso ela tenha sido removida ou esteja com problemas.

## O problema a ser resolvido!

O cenário que estou utilizando para esse post é um sistema dual boot com Debian e Windows 11, ambos instalados em modo UEFI.

- **OS 1:** Debian 13
    - *Kernel:* 6.12.57
    - *Disco Inicialização:* /dev/sdd1 (ESP - EFI System Partition)
- **OS 2:** Windows 11
    - *Disco de instalação:* /dev/sdc1
    - *Disco Inicialização:* /dev/sdd1 (ESP - EFI System Partition)
- **SecureBoot:** Ativado

Notem que ambos os sistemas estão utilizando a mesma partição ESP para inicialização.

O que ocorreu foi que após uma instalação limpa do Debian, a entrada de boot do Windows foi removida do menu de boot UEFI, pois ela acabou sendo sobrescrita pela instalação do Debian. Isso aconteceu por que durante a instalação do Debian, o disco foi formatado e a partição ESP foi recriada, removendo assim a entrada de boot do Windows.

Então agora incialmente precisamos restaurar a entrada de boot do Windows.

## Restaurando a entrada de boot do Windows

Para iniciar o processo de restauração da entrada de boot do Windows, precisamos primeiro criar uma mídia de instalação do Windows 11, que pode ser um pendrive ou um DVD.

Com a mídia de instalação do Windows 11 criada, insira no computador, reinicie o sistema e inicialize a partir dessa mídia de instalação.

o que nos interessa aqui é acessar o prompt de comando do Windows, então na tela inicial do instalador, clique em "Avançar" e depois em "Reparar o computador".


Na próxima tela, selecione "Solução de Problemas" e depois "Prompt de Comando".

Com o prompt de comando aberto, precisamos identificar os discos e partições do sistema. Para isso, utilize o comando `diskpart` para entrar na ferramenta de particionamento do Windows.

Dentro do `diskpart`, utilize o comando `list disk` para listar os discos disponíveis no sistema.

Identifique o disco onde está a partição ESP (EFI System Partition), que no meu caso é o disco 1 (/dev/sdd).

Selecione o disco com o comando `select disk 1`.

Agora liste as partições do disco selecionado com o comando `list partition`.

Identifique a partição ESP, que geralmente é a partição de tamanho menor (no meu caso é a partição 1 com 500 MB).

Selecione a partição ESP com o comando `select partition 1`.

Agora precisamos atribuir uma letra para essa partição, para isso utilize o comando `assign letter=Z`. Aqui a letra "Z" é apenas um exemplo, você pode escolher qualquer letra que não esteja em uso no sistema.

Agora saia do `diskpart` com o comando `exit`.

Com a partição ESP montada na letra "Z", agora podemos utilizar o comando `bcdboot` para restaurar a entrada de boot do Windows.

O comando `bcdboot` copia os arquivos de boot do Windows para a partição ESP e recria a entrada de boot.

Utilize o seguinte comando para restaurar a entrada de boot do Windows:
~~~shell
bcdboot C:\Windows /s Z: /f UEFI
~~~

Aqui, `C:\Windows` é o caminho para a instalação do Windows (ajuste conforme necessário), `Z:` é a letra atribuída à partição ESP, e `/f UEFI` especifica que estamos trabalhando com UEFI. 

Após executar o comando, você deve ver uma mensagem indicando que os arquivos de boot foram copiados com sucesso.

Agora podemos reiniciar o sistema e verificar se a entrada de boot do Windows foi restaurada na BIOS/UEFI. E assim já é possível inicializar o Windows normalmente através da BIOS/UEFI.

No Debian, ao inicializar o sistema, é possível verificar os arquivos de boot do Windows na partição ESP, que agora estão presentes novamente. Para isso, rode o comando:
~~~shell
sudo ls /boot/efi/EFI/Microsoft/Boot/
~~~

Você deverá ver os arquivos de boot do Windows, incluindo o `bootmgfw.efi`, que é o arquivo principal de boot do Windows.

## Gerenciando entradas de boot UEFI com efibootmgr

No meu caso, eu utilizo o GRUB como gerenciador de boot, então após restaurar a entrada de boot do Windows, precisamos verificar se a entrada Boot UEFI está criada, e, garantindo que ela esteja criada, então precisamos atualizar o GRUB para que ele reconheça a entrada do Windows e a adicione ao menu de boot.

Para isso, inicialize o Debian normalmente e abra um terminal.

Digite o seguinte comando para listar as entradas de boot UEFI:
~~~shell
sudo efibootmgr
~~~

Aqui você verá uma lista das entradas de boot UEFI, incluindo a entrada do Windows que acabamos de restaurar.

Caso a entrada do Windows não esteja listada, podemos criar uma nova entrada utilizando o efibootmgr.

Para criar uma nova entrada de boot para o Windows, utilize o seguinte comando:
~~~shell
sudo efibootmgr -c -d /dev/sdd -p 1 -L "Windows Boot Manager" -l '\EFI\Microsoft\Boot\bootmgfw.efi'
~~~

Aqui, `-d /dev/sdd` especifica o disco onde está a partição ESP, `-p 1` especifica a partição ESP (ajuste conforme necessário), `-L "Windows Boot Manager"` é o rótulo da entrada de boot, e `-l '\EFI\Microsoft\Boot\bootmgfw.efi'` é o caminho para o arquivo de boot do Windows dentro da partição ESP.

Após criar a entrada, execute novamente o comando `efibootmgr` para verificar se a entrada foi criada corretamente.

Agora precisamos atualizar o GRUB para que ele reconheça a nova entrada do Windows.

Para atualizar o GRUB, utilize o seguinte comando:
~~~shell
sudo update-grub
~~~

Lembre-se de que para que o GRUB reconheça a entrada do Windows, o pacote `os-prober` deve estar instalado no sistema. Caso não esteja instalado, você pode instalá-lo com o comando:
~~~shell
sudo apt install os-prober
~~~

Além disso é necessário habilitar o `os-prober` no arquivo de configuração do GRUB. Para isso, edite o arquivo `/etc/default/grub` e adicione ou descomente a seguinte linha:
~~~shell
GRUB_DISABLE_OS_PROBER=false
~~~ 

Após atualizar o GRUB, reinicie o sistema e você deverá ver a entrada do Windows no menu de boot do GRUB.

## Finalizando

A partir daqui, você deve ser capaz de inicializar tanto o Debian quanto o Windows a partir do menu de boot do GRUB.

E é isso galera, espero que esse post tenha ajudado vocês a gerenciar as entradas de boot UEFI no Debian e a restaurar a entrada do Windows caso necessário.

Abraços! ❤️🍻