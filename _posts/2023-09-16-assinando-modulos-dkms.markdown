---
layout: post
title:  "SecureBoot - Assinando módulos com DKMS"
date:   2023-09-16 15:00:00 -0300
categories: [DKMS, SecureBoot]
featured: true
---
# Sobre o conteúdo

Nesse post, vou mostrar como é fácil assinar e carregar a chave pública para a BIOS UEFI para usar na assinatura e validação dos módulos durante a incialização.

## A máquina 🖥️

Primeiro, é importante ressaltar que essa instalação será feita em uma máquina com as seguintes configurações:

- **CPU:** Ryzen 5 5600x
- **MB:** Asus TUF Gaming X570-PLUS/BR
  - *Áudio:* ALC S1200A (ALC1200)
  - *LAN:* Realtek L8200A (RTL8111/8168/8411)
- **GPU:** RTX 3070
- **Wi-Fi/BT:** Intel Wi-Fi 6 (AX210/AX211/AX411) 160MHz
- **SO:** Debian 12 (bookworm)

**OBS:** O SecureBoot está habilitado na BIOS e o sistema foi instalado com recursos mínimos, sem uma DE e nem utilitários básicos do sistema. Você pode acompanhar o outro post sobre a instação [aqui]({% post_url 2025-09-21-configuracao-debian-13 %}).

## Pós-Instalação

Após ter instalado o sistema, apenas temos a tela do console para realizar login, nisso entro no usuário `root` e sigo com a instalção dos seguintes pacotes:

- [openssl](https://packages.debian.org/bookworm/openssl)
- [dkms](https://packages.debian.org/bookworm/dkms)

Com a instalação desses dois pacotes, você pode seguir com a instalação dos pacotes que deseja e então prosseguir.

## DKMS

O Dynamic Kernel Module System (DKMS) ou Suporte Dinâmico de Módulo de Kernel é um framework que permite que ele recompile automaticamente todos os módulos DKMS quando uma nova versão do kernel é instalada. Isto permite manter os drivers de dispositivos fora da linha principal do kernel funcionando mesmo após uma atualização do kernel do Linux.

Ou seja, pegando um cenário onde você tenha um módulo do kernel que pode não ser atualizado junto com o kernel, mas ao atuaizar o kernel para uma versão nova, o módulo é reconstruído para essa nova versão, mantendo assim o módulo funcional com a nova versão do kernel.

A página oficial do DKMS você encontra [aqui](https://github.com/dell/dkms).

Seguindo o passo a passo da instalação na página do Github é possível ver a seção sobre a assinatura dos módulos e a inicialização segura (SecureBoot).

De forma resumida, quando instalamos o DKMS ele não possui nenhuma chave pública ou privada para realizar a assinatura dos módulos, porém ao realizar a primeira construção, ou seja, quando ele for executado pela primeira vez, ele irá criar uma chave pública e privada padrão para utilização nas assinaturas.

Nesse ponto podemos customizar e criar nossas próprias chaves, mas em questão de praticidade vamos utilizar as chaves padrões geradas por ele.

O nosso trabalho aqui será registrar a chave pública em nosso sistema UEFI. E aqui entra o `shim` e o `mokutil`.

## Shim e o MOKutil

O [shim](https://packages.debian.org/bookworm/shim-signed) é um gerenciador de inicialização segura minimalista que permite verificar assinaturas de outros binários UEFI em relação ao DB/DBX de inicialização segura ou verificar um banco de dados de assinaturas integrado.

O shim vem instalado automaticamente no Debian 12.

O [mokutil](https://packages.debian.org/bookworm/mokutil) fornece os meios para inscrever e apagar as chaves do proprietário da máquina (machine owner keys - MOK) armazenadas no banco de dados do shim.

Com esses dois, vamos poder carregar a chave pública do DKMS para nosso sistema UEFI e assim quando o sistema inicializar ele conseguirá validar os módulos assinados durante a construção no DKMS.

## A inscrição da chave na BIOS UEFI

As chaves padrões do DKMS ficam nesse local: `/var/lib/dkms`

Como dito antes, após instalado o DKMS ele não vem com nenhuma chave, ela é gerada durante a primeira execução. Por isso nesse caso dessa máquina tenho duas opções. O módulo de kernel da Nvidia e o módulo de kernel da placa de rede. Instalando qualquer um dos dois, o DKMS já irá gerar as chaves.

Rodando o comando abaixo, baixamos um pacote de testes e o sistema inicia a instalação e construção usando DKMS:

~~~shell
apt install dkms-test-dkms
~~~

Após a instalação de um dos módulos, podemos verificar as chaves geradas em `/var/lib/dkms`, onde teremos a chave pública `mok.pub` e a privada `mok.key`.

Também já podemos verificar o módulo e sua assinatura rodando o comando `modinfo módulo`, no meu caso pode ser `modinfo r8168`, `modinfo nvidia-current` ou `modinfo dkms-test`.

Note que na descrição teremos inforações sobre a assinatura do módulo.

Antes de reiniciar o computador, teremos que realizar a inscrição da chave pública em nosso sistema UEFI.

Para efetuar a inscrição da chave no sistema UEFI, rodamos o seguinte comando:
~~~shell
mokutil --import /var/lib/dkms/mok.pub
~~~

Ao realizar esse processo será solicitado que se crie uma senha de entrada única que deve possuir ao menos 1 caractere.

**OBS:** Se o comando de importar a chave não ocorrer com sucesso, provavelmente seu sistema não permite carregar as chaves dessa forma, então você precisará realizar a cópia da chave para um disco externo ou pendrive, por exemplo, e realizar a inscrição da chave diretamente na BIOS da sua placa mãe, carregando ela no gerenciador de chaves DB/DBX.

Após isso reiniciamos a máquina para então realizarmos o enroll (inscrição) da chave no sistema UEFI.

Ao reiniciar, será apresentada a página para realizar a inscrição, nessa primeira parte pode pressionar qualquer tecla.

![Shim UEFI Key Management](/assets/dkms/shim.png)

Após, selecionamos a opção **MOK Enroll**

![Enroll MOK](/assets/dkms/enrollmok.png)

A partir desse ponto, na página **Enroll MOK** selecione a opção **Continue** e depois na tela **Enroll the Key(s)?** selecione a opção **Yes**.

A próxima página irá solicitar a senha de uso único, digite a mesma que você criou quando inscreveu a chave e por fim selecione a opção **Reboot**.

E está feito! 🍻

Quando o sistema inicializar é possível verificar as chaves carregadas com o comando:

~~~shell
mokutil --list-enrolled
~~~

Você verá a CA do debian e também a chave do DKMS, além de outras chaves existentes em seu sistema UEFI.

Até mais pessoal! 👋❤️

