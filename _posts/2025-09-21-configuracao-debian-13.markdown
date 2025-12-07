---
layout: post
title:  "Configurações pós instalação do Debian 13"
date:   2025-09-21 18:15:00 -0300
categories: [Debian]
featured: true
---

Nesse post, vou mostrar quais são as configurações que faço após realizar a instalação do debian.

# A máquina 🖥️

Primeiro, é importante ressaltar que essa instalação será feita em uma máquina com as seguintes configurações:

- **CPU:** Ryzen 5 5600x
- **MB:** Asus TUF Gaming X570-PLUS/BR
  - *Áudio:* ALC S1200A (ALC1200)
  - *LAN:* Realtek L8200A (RTL8111/8168/8411)
- **GPU:** RTX 3070
- **Wi-Fi/BT:** Intel Wi-Fi 6 (AX210/AX211/AX411) 160MHz

**OBS:** O SecureBoot está desativado para essa instalação.

Dito isso é importante lembrar que pode ser que algumas das configurações não se apliquem a qualquer instalação do Debian, pois isso varia muito conforme o hardware onde o sistema foi instalado.

Quanto a instalação do Debian, ela é feita a partir de uma mídia de instalação do tipo [netinst](https://www.debian.org/CD/netinst/), ou seja, uma mídia de instalação mínima que depende de uma conexão com a internet para baixar os pacotes do sistema. Além disso a instalação é feita de forma limpa, sem instalar nenhum tipo de pacote ou utilitário adicional pelo **tasksel** que é executado durante a instalação.

Basicamente ao finalizar a instalação eu tenho um sistema com **222** pacotes instalados.

Você pode visualizar a quantidade de pacotes instalados ao rodar o comando: 
~~~bash
apt list –-installed | wc -l
sudo apt list –-installed | wc -l # caso não seja superusuário.
~~~

# O pacote SUDO e o auto complete do BASH

Como primeiro passo eu instalo o pacote [sudo](https://wiki.debian.org/sudo) para conseguir executar comandos de superusuário a partir do meu usuário comum. Para isso preciso logar primeiro no usuário _root_. Depois é só executar os comandos:

~~~bash
apt install sudo
adduser usuário sudo 
~~~

Onde no segundo comando, substitua _usuário_ pelo nome do seu usuário comum.

Após é só deslogar de root com o comando _exit_

Agora podemos logar no usuário comum, e assim já podemos testar o funcionamento do sudo instalando o pacote `bash-completion` que ajuda com opções de auto completar usando tab.

~~~bash
sudo apt install bash-completion
~~~

Será solicitada a senha do usuário para finalizar a execução do comando.

Pronto! Agora começamos com a configuração dos repositórios.

# Espelhos

Antes de começar qualquer tipo de instalação é necessário configurar os espelhos dos repositórios, para que tenhamos uma conexão mais estável e rápida.

Geralmente o espelho central (deb.debian.org) tem uma boa conexão, mas a fim de desafogar o tráfego para este servidor, é preferível que configuremos repositórios mais próximos de nossa localização.

Para ver a lista completa de espelhos de repositórios do debian, [acesse essa página](https://www.debian.org/mirror/list).

# A configuração dos repositórios

No debian 13 (Trixie), a configuração dos repositórios mudou um pouco, o novo formato de configuração dos espelho usa a referẽncia deb822, que é um formato mais flexível e que permite a configuração de múltiplos repositórios em um único arquivo.

Veja mais sobre esse novo formato no [manual do debian](https://www.debian.org/doc/manuals/debian-reference/ch02#_debian_archive_basics) e na [wiki do debian](https://wiki.debian.org/SourcesList).

Para configurar os repositórios no debian, vamos editar o arquivo **debian.sources**, este por sua vez pode ser acessado em **/etc/apt/sources.list.d**

Para visualizar seu conteúdo, podemos usar o comando `cat /etc/apt/sources.list.d/debian.sources`

Para editá-lo, devemos usar o comando sudo para ter privilégios de superusuário e assim poder salvar o arquivo depois, senão temos apenas o acesso a leitura.

Como editor de texto, eu gosto de utilizar o [nano](https://packages.debian.org/bookworm/nano). Então para editar o arquivo, usamos:

~~~bash
sudo nano /etc/apt/sources.list.d/debian.sources
~~~

A sintaxe para configuração os repositórios basicamente é:

  ~~~yaml
  Types: deb deb-src
  URIs: http://deb.debian.org/debian/
  Suites: stable stable-backports
  Components: main non-free-firmware contrib non-free
  ~~~

Onde temos as seguintes seções:

+ **Types** - Aqui é o início da sintaxe, onde podemos ter **deb** para arquivos binários ou **deb-src** para o código fonte.
+ **URIs** - Aqui é onde se informa a URL do espelho junto com seu protocolo.
+ **Suites** - Nesse ponto é onde especificamos qual é a distruição que queremos utilizar ao pegar os pacotes ou códigos no repositório, no nosso caso o padrão vem como **trixie**, onde esse é o nome da distribuição do debian 13. Os nomes das distribuições do debian são inspiradas no filme _Toy Story_.
+ **Components** - No final da configuração, atribuímos os componentes que vamos utilizar daquele repositório, onde temos:
  + **main** - Sendo o componente principal da distribuição, é nele onde estão os kerneis linux, por exemplo. Consiste em pacotes [DFSG](https://www.debian.org/social_contract.pt.html)-compliant, que não dependem de software fora desta área para operar. Estes são os únicos pacotes considerados parte da distribuição Debian.
  + **contrib** - Pacotes contêm software compatível com DFSG, mas têm dependências não principais (possivelmente empacotado para Debian em non-free).
  + **non-free** - Contém software que não está em conformidade com o DFSG.
  + **non-free-firmware** - Contém firmwares/drivers que não estão em conformidade com o DFSG.

Nessa instalação, vou utilizar a distribuição **unstable** ou **sid** para obter os pacotes mais recentes que ainda estão em fase de testes. Você pode obter mais informações sobre essa distribuição acessando [aqui](https://www.debian.org/releases/sid/).

A cópia do meu **sources.list** pode ser obtida [aqui](/assets/debian/sources_debian_13.txt).

Recomendo utilizar todos os espelhos do Brasil, mas também é possível utilizar apenas um deles, ai vai conforme sua necessidade. Também é importante testar qual deles é mais rápido na sua região.

Você pode obter mais informações sobre a configuração dos repositórios [aqui](https://wiki.debian.org/pt_BR/SourcesList) e sobre as distribuições [aqui](https://www.debian.org/releases/).

Ao editar o arquivo através do nano, basta pressionar **Ctrl + O** ou **Ctrl + S** para salvar e **Ctrl + X** para sair do modo de edição do arquivo.

Após editar o arquivos, devemos atualizar o cache do APT usando o comando `sudo apt update` e após a atualização, podemos atualizar o sistema da distribuição _trixie_ para _sid_ usando o comando `sudo apt full-upgrade`

Após finalizar a atualização, temos o debian na distribuição **unstable** ou **sid**.

# Firmwares

Por padrão, agora o debian inclui os firmwares na mídia de instalação, realizando a instalação dos mesmos durante o processo de instalação. Melhorando assim a compatibilidade do sistema com o hardware da máquina e facilitando a vida do usuário. Porém isso vale a partir de agora na versão 12 do debian, versões anteriores é necessário realizar a instalação dos firmwares manualmente após a instalação do sistema.

Entretanto para essa máquina o adaptador de rede LAN é uma Realtek R8168, porém no firmware padrão contido no pacote *firmware-realtek* dos repositórios, não oferece um suporte 100% para esse adaptador, fazendo com que tenhamos uma utilização mínima do adaptador, frente ao seu potencial.

Por este motivo, que irei realizar a instalção de outro firmware, mantido pela comunidade e que utiliza o DKMS para recompilar o firmware a cada novo kernel instalado no sistema, isso garante que ele funcione mesmo após a atualização do kernel para um mais recente.

Para instalar esse novo firmware, então rodo o comando `apt install r8168-dkms`

Ele irá instalar vários outros pacotes como dependência e irá desabilitar o módulo r8169 do firmware padrão do pacote *firmware-realtek* na próxima vez que reiniciarmos a máquina.

Para verificar os firmawares e módulos carregados na inicialização, podemos rodar o comando `dmesg` para ver o log da última inicialização do sistema.
Para procurar por algo específico, podemos complementar o comnado adicionando o comando `grep`, ficando dessa forma: `dmesg | grep r8169` para verificar o módulo carregado nesse momento. Após reiniciarmos a máquina podemos pesquisar **r8168** no lugar de r8169.

Agora vamos realizar a instalação do driver de vídeo da NVIDIA. No meu caso eu tenho uma RTX 3070 e ela já possui os módulos de kernel open source que a NVIDIA liberou para a comunidade, porém no meu caso vou continuar utilizando os drivers proprietários.

Nesse caso a instalação em um desktop é muito simples, visto que eu só tenho essa fonte de vídeo no sistema (pois o 5600x nao possui vídeo integrado, por exemplo). Para quem tem um notebook com vídeo hibrido, essa configuração geralmente nao se aplica, sendo necessário verificar se há alguma alternativa e/ou solução.

Para a minha placa, basicamente é só instalar o meta-pacote `nvidia-driver`, assim ele instalará todos os pacotes necessários para o driver.

Da mesma forma como ocorre para o driver de rede, a instalação padrão do debian instala os drivers open source da nouveau. Mas realizando a instalação dos drivers da NVIDIA esse drivers são colocados em uma lista negra para não serem carregados com a incialização do sistema, deixando apenas os drivers proprietários serem carregados.

Além disso, os drivers da NVIDIA também usam DKMS para compilar os módulos do kernel para cada kernel instalado no sistema e consequentemente para qualquer kernel novo a ser instalado.

Mas se você deseja instalar o driver manualmente, você pode seguir os passos do meu post sobre [como instalar o driver NVIDIA manualmente no Debian 12/13]({% post_url 2025-09-21-configurando-wayland-gnome %}).

# Microcode e CPU Frequency Scaling

Ao trabalhar com Linux, é interessante instalarmos os microcodes para nosso processador, eles são patchs de segurança e também correções para que o funcionamento e o comportamento do processador sejam conforme as especificações do fabricante.

Ele atua como um "driver" do processador no kernel linux e deve ser carregado na inicialização do sistema.

No debian 12, o microcode também já é instalado por padrão durante a instalação do sistema, assim como os demais drivers.

A única coisa que fica de fora é o driver ACPI para controle de frequencia do processador. O debian ainda usa o legado acpi-cpufreq, mas tando a AMD como a Intel, possuem controladores próprios que aproveitam muito mais a performance e a eficiencia que o processador pode proporcionar.

No meu caso eu vou instalar o driver da AMD, o `amd-pstate` que é uma módulo de kernel e também precisa ser carregado na inicialização do sistema. Esse driver se aproveita do recursos AMD CPPC (Collaborative Processor Performance Control) disponível nos processadores mais recentes da AMD, porém para habilitar ele no kernel é importante que o recurso esteja habilitado na BIOS da placa mãe.

Geralmente essas opções ficam no automático, mas podem ser encontradas na BIOS em AMD CBS > NBIO > AMD CPPC

Para habilitar esse módulo do kernel na incialização o modo mais fácil é indicarmos ele nos argumentos de inicialização do GRUB

Para isso vamos editar o arquivo `/etc/default/grub`

1. `nano /etc/default/grub`
2. Na opção **GRUB_CMDLINE_LINUX_DEFAULT** adicionamos o comando `amd_pstate=active` no final para que ele seja carregado na inicialização do kernel.

Exemplo de como fica preenchido: GRUB_CMDLINE_LINUX_DEFAULT="quiet amd_pstate=active"

Aproveitando que estamos editando o arquivo do GRUB, vamos rever algumas opções

# GRUB

O grub é nosso gerenciador de incialização padrão do debian. Existem outros sistemas de inicialização mas o GRUB é o mais popular até então.

Além da adição do módulo da amd-pstate, há outras duas configurações que gosto de realizar.

descomentar a linha **GRUB_DISABLE_OS_PROBER=false**, para fazer com que o grub reconheça qualquer outro sistema instalado na máquina, e como eu utilizo um Windows 11 em outro SSD, ele será reconhecido e uma ,inha de inicialização será criada para ele ao atualizarmos o arquivo de configuração posteriormente.

Além dessa, tem também a linha **GRUB_GFXMODE** onde podemos descomentá-la e aplicar a resolução que quermos que a tela de inicialização do grub tenha. Note porém, que essa resolução nem sempre é a mesma que vamos utilizar nativamente no monitor, isso depende do driver VBE da placa de vídeo.

No meu caso o driver tem suporte a resolução 4k, porém eu uso a resolução Full HD no grub, para as informações não ficarem tão pequenas kkkk.

Para isso apenas configuro a linha como GRUB_GFXMODE=1920x1080

Após essas edições, salvo o arquivo com Ctrl + O e depois fecho com Ctrl + X

Então para atualizar o arquivo de configuração do grub, rodo o comando `update-grub`

E assim vemos a atualização do arquivo ocorrendo.

Nesse ponto podemos reiniciar a máquina para ver os efeitos das configuraçãoes.

# Primeira reinicialização

Após reinicar a máquina já podemos notar a primeira diferença, que é a resolução do terminal, aqui temos o driver na NVIDIA em ação.

Ao rodarmos os comando `dmesg | grep r8168` vemos o firmware da placa de rede carregado e configurado.

E ao rodar o comando  `cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_driver` podemos ver que o driver do CPU frequency scalling carregado é o **amd_pstate_epp**

Nesse ponto, temos o básico configurado, então vamos partir para o ambiente desktop.

# GNOME

O meu ambiente desktop preferido é de longe o gnome, acho ele muito limpo e fácil de usar. Além de ser muito versátil e bonito.

Eu gosto de instalar o pacote `gnome-core` pois ele vem apenas com os pacotes essenciais, e conforme a demanda vou instalando o que necessito.

Para instalar, basicamente é só rodar o comando `apt install gnome-core` e praticamente será feito um download de ~500MB

Após o download e a instalação é só reiniciar a máquina e a mágica acontece.

**OBS:** Se por acaso o icone de rede não identificar sua rede cabeada, edite o arquivo `sudo nano /etc/NetworkManager/NetWorkManager.conf`

Na seção [ifupdown] altere a opção `managed` para `true`, salve e reinicie a máquina.

Está feito! Agora é só aproveitar o Debian 13 com GNOME. 🍻❤️