---
layout: post
title:  "Como criar uma infra com PiHole e WireGuard VPN"
date:   2023-11-02 09:50:00 -0300
categories: infra
---

## Sobre o conteúdo

Nesse post vou ensinar a realizar a instalação e configuração de uma infra com Pihole para filtrar todas as nossas requisições de DNS da rede interna e utilizar a VPN do WireGuard para criar um túnel para direcionar o tráfego da rede de nossos dispositivos móveis para a nossa rede interna e assim se beneficiar do filtro de DNS do Pihole.

## O Server

Aqui estarei utilizando um notebook quase inutilizado como servidor. É um Acer A315-34-C5EY, com um modesto [Celeron N4000C](https://www.intel.com.br/content/www/br/pt/products/sku/199892/intel-celeron-processor-n4000c-4m-cache-up-to-2-60-ghz/specifications.html) e 4GB de RAM DDR4.

## Instalação do Server

Aqui utilizo debian como servidor. Realizo uma instalação limpa dele apenas instalando o sistema base e o servidor SSH que pode ser selecionado no Taksel durante a instalação.

Para um passo a passo da instalação do debian como servidor, recomendo seguir esse [tutorial](https://blog.remontti.com.br/7236) do Rudimar Remontti. :D

## Pós-Instalação

Após ter o server instalado, configurado o sources.list e rodando com SSH, então começamos os trabalhos.

Lembrando que você pode acessar seu server via SSH através de qualquer terminal linux ou windows que tenham o cliente SSH habilitado. Para acessar usamos o seguinte comando:
~~~shell
ssh usuário@servidor -p porta
~~~

Onde:
- **usuário** é o usuário que você definiu durante a instalação. Lembrando que por padrão o SSH não permite conexão diretamente com o usuário **root**, você pode acessar com seu usuário normal e depois mudar para root com o comando `su -`; 
- **servidor** é o IP fixo do seu servidor, seja ele local ou remoto; 
- O argumento `-p` você usa apenas se tiver alterado a porta padrão de acesso do SSH, que é a porta **22**. Caso tenha alterado use o argumento passando a nova porta de comunicação com o servidor SSH

Antes de tudo vamos instalar algumas dependências, que no caso são, o próprio [server do WireGuard](https://www.wireguard.com/install/#debian-module-tools) e também vamos utilizar um utilitário mais prático de firewall, o [UFW](https://servidordebian.org/pt/buster/security/firewall/ufw).

Para instalar os dois use o comando:
~~~shell
sudo apt install wireguard ufw
~~~

Ele irá instalar os dois pacotes e todas as suas dependências.

## UFW

A primeira coisa que iremos fazer é permitir a conexão SSH antes de habilitar o firewall, para isso usamos o comando:
~~~shell
sudo ufw allow regra
~~~

O SSH é possui uma regra padrão que habilita a conexão para a porta padrão 22. Nesse caso usamos o comando:
~~~shell
sudo ufw allow SSH
~~~

Caso tenha alterado a porta padrão do servidor SSH então especifique a porta e o protocolo que deseja liberar a conexão, exemplo:
~~~shell
sudo ufw allow 2222/tcp
~~~
assim será liberada as conexões de qualquer endereço para a porta **2222** utilizando protocolo **TCP**

Após liberar as conexões para o servidor SSH podemos habilitar o UFW com o comando:
~~~shell
sudo ufw enable
~~~
Ao longo do tutorial, iremos criar mais regras no firewall utilizando o UFW, mas por hora apenas liberamos o acesse ao SSH para continuar os trabalhos.

## Configurando o WireGuard-UI

Com o servidor WireGuard instalado, vamos começar a instação do WireGuard-UI, um utilitário Web para configurar o servidor e também configurar os clientes da VPN.

# IP forwarding

Vamos começar habilitando o IP forwarding do servidor, para que o server consiga encaminhar os pacotes para redes diferentes.

Edite o arquivo `sysctl.conf` com o comando:
~~~shell
sudo nano /etc/sysctl.conf
~~~
Ao abrir o arquivo, descomente a linha `#net.ipv4.ip_forward=1` apenas removendo o **#** da frente.

Após isso salve o arquivo com **Ctrl+O** e feche o arquivo com **Ctrl+X** e rode o comando:
~~~shell
sudo sysctl -p
~~~
para atualizar as configurações do sistema.

# Configurando o UFW

Agora vamos liberar as portas para acessar o Web-UI e também para permitir a conexão dos peers ao nosso servidor VPN.

Como eu não quero que os paineis web sejam acessados fora da rede local, posteriormente no meu roteador eu apenas irei fazer o port forwarding da porta UDP que o server do WireGuard irá utilizar, então se quiser acessar os paineis, poderei fazer pela VPN que terá acesso a rede local :D

Para o WireGuard-UI utilizo a porta **51821/tcp** enquanto para o servidor do WireGuard utilizo a porta **51820/udp**

Então vamos criar as regras no UFW com o seguinte comando:
~~~shell
sudo ufw allow 51821/tcp && sudo ufw allow 51820/udp && sudo ufw allow proto udp to any port 51820
~~~
Após criar as novas regras, recarregamos o UFW com o comando:
~~~shell
sudo ufw reload
~~~

# Baixando e configurando o WireGuard-UI

O WireGuard-UI é desenvolvido pela comunidade, e o repositório do projeto você encontra [aqui](https://github.com/ngoduykhanh/Wireguard-ui).

Primeiro passo é baixar os binários da sua arquitetura para seu servidor, para isso usaremos o [wget](https://packages.debian.org/bookworm/wget).

Primeiro acessamos a página de lançamentos do WireGuard-UI [aqui](https://github.com/ngoduykhanh/wireguard-ui/releases) e copiamos o link de download dos binários compatíveis com o nosso sistema, no nosso caso é o pacote `*-linux-amd64.tar.gz`

Com o link copiado, então podemos rodar o comando de download do arquivo em nosso servidor com o wget. Exemplo:
~~~shell
wget https://github.com/ngoduykhanh/wireguard-ui/releases/download/v0.5.2/wireguard-ui-v0.5.2-linux-amd64.tar.gz
~~~
Isso irá baixar o arquivo para nosso diretório atual, que deve ser o **/home**

Após o download, é possível verificar o arquivo no diretório com um `ls`

![Binário salvo no sistema](/assets/dns_vpn/wireguard-ui-download.png)

Agora vamos extrair o conteúdo do arquivo com o comando:
~~~shell
tar -xvzf  wireguard-ui-*.tar.gz
~~~

Após criamos um diretório para armazenar os binários em **/opt**
~~~shell
sudo mkdir /opt/wireguard-ui
~~~
Então movemos a pasta extraída para o diretório em /opt
~~~shell
sudo mv wireguard-ui /opt/wireguard-ui/
~~~

O próximo passo é criar o arquivo de configuração **.env** no diretório raiz. Para isso rodamos o comando:
~~~shell
sudo nano /opt/wireguard-ui/.env
~~~
dessa forma o nano cria um arquivo novo assim que salvarmos a edição.

Dentro desse arquivo vamos informar as seguintes linhas:

~~~ini
# /opt/wireguard-ui/.env
SESSION_SECRET=Uma senha aleatória
WGUI_USERNAME=Seu usuário de acesso
WGUI_PASSWORD=Sua senha de acesso
~~~

Exemplo:

~~~ini
# /opt/wireguard-ui/.env
SESSION_SECRET=123456789
WGUI_USERNAME=Eder
WGUI_PASSWORD=Eder123321
~~~

Agora vamos confirmar qual é a interface de rede que estamos utilizando, para isso podemos rodar o comando:

`ip addr` ou `ip route`

Vamos considerar a interface que possui o ip estático do servidor ou então a interface padrão de rota.
Que no meu caso é a **enp2s0**. Para você pode ser **eth0** ou qualquer outra, sempre verifique.

Com o conhecimento da interface padrão do sistema, vamos criar dois scripts para criar as rotas e regras de NAT quando serviço do WireGuard inicia e termina.

Primeiro criamos o script de pós-inicialização.

Rode o comando:
~~~shell
sudo nano /opt/wireguard-ui/postup.sh
~~~
e cole as seguintes linhas:

~~~shell
#!/usr/bin/bash
# /opt/wireguard-ui/postup.sh
ufw route allow in on wg0 out on enp2s0
iptables -t nat -I POSTROUTING -o enp2s0 -j MASQUERADE
~~~

**OBS**: Lembre de alterar a interface *enp2s0* para a interface do seu sistema.

Salve o arquivo com **Ctrl+O** e feche o arquivo com **Ctrl+X**.

Agora criaremos o arquivo de pós-termino do serviço, rodando o comando:
~~~shell
sudo nano /opt/wireguard-ui/postdown.sh
~~~
e cole as seguintes linhas:

~~~shell
#!/usr/bin/bash
# /opt/wireguard-ui/postdown.sh
ufw route delete allow in on wg0 out on enp2s0
iptables -t nat -D POSTROUTING -o enp2s0 -j MASQUERADE
~~~

**OBS**: Lembre de alterar a interface *enp2s0* para a interface do seu sistema.

Salve o arquivo com **Ctrl+O** e feche o arquivo com **Ctrl+X**.

Ao finalizar a criação dos dois scripts, vamos tornar eles executáveis, aplicando a seguinte regra:
~~~shell
sudo chmod +x /opt/wireguard-ui/post*.sh
~~~

# Criando o serviço WireGuard-UI com SystemD

Para conseguirmos incializar o serviço e gerenciar ele através do SystemD que é o sistema de inicialização padrão do Debian, precisamos criar os seu scripts de inicialização.

Vamos começar pelo script do serviço do WireGuard-UI.

Rode o comando:
~~~shell
sudo nano /etc/systemd/system/wireguard-ui-daemon.service
~~~
e cole as seguintes linhas:

~~~ini
[Unit]
Description=Serviço WireGuard UI
Wants=network-online.target
After=network-online.target

[Service]
User=root
Group=root
Type=simple
WorkingDirectory=/opt/wireguard-ui
EnvironmentFile=/opt/wireguard-ui/.env
ExecStart=/opt/wireguard-ui/wireguard-ui -bind-address "192.168.0.99:51821"

[Install]
WantedBy=multi-user.target
~~~

**OBS**: Lembre de alterar o IP do argumento *bind-address* para o IP fixo do seu server, além disso a porta aqui é a porta de acesso a interface web.

Salve o arquivo com **Ctrl+O** e feche o arquivo com **Ctrl+X**.

Agora, vamos reiniciar o serviço do SystemD para atualizar a lista de serviços que ele pode gerenciar e assim carregar o novo serviço do WireGuard-UI.

Rode o comando:
~~~shell
sudo systemctl daemon-reload && sudo systemctl start wireguard-ui-daemon.service
~~~

Dessa forma o sistema irá inciar o serviço do WireGuard-UI e já conseguirá visulizar ele rodando com o comando:
~~~shell
sudo systemctl status wireguard-ui-daemon.service
~~~

Por fim, vamos habilitar o serviço para ser inicializado junto com o sistema, caso ele reinicie.
~~~shell
sudo systemctl enable wireguard-ui-daemon.service
~~~

# Serviço para monitorar o WireGuard

Como o WireGuard-UI cuida apenas da geração da configuração do WireGuard, você precisa de outro serviço SystemD para observar as alterações e reiniciar o serviço WireGuard quando for necessário.

Para criar esse serviço rode o comando:
~~~shell
sudo nano /etc/systemd/system/wgui.service
~~~
e cole as seguintes linhas:

~~~ini
[Unit]
Description=Reiniciar WireGuard
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/systemctl restart wg-quick@wg0.service

[Install]
RequiredBy=wgui.path
~~~

Salve o arquivo com **Ctrl+O** e feche o arquivo com **Ctrl+X** e crie outro arquivo com o comando:
~~~shell
sudo nano /etc/systemd/system/wgui.path
~~~
e cole as seguintes linhas:

~~~ini
[Unit]
Description=Observar mudanças em /etc/wireguard/wg0.conf

[Path]
PathModified=/etc/wireguard/wg0.conf

[Install]
WantedBy=multi-user.target
~~~

Salve o arquivo com **Ctrl+O** e feche o arquivo com **Ctrl+X**.

E para finalizar aplique esses novos serviços no SystemD com os seguintes comandos:
~~~shell
sudo systemctl daemon-reload && sudo systemctl enable wgui.{path,service} && sudo systemctl start wgui.{path,service}
~~~

Configuração inicial finalizada!

---


## Acessando o WireGuard-UI e finalizando a configuração

Agora vamos acessar a interface web para finalizar a configuração do WireGuard e gerar os acessos dos clientes.

A inteface poderá ser acessada pelo endereço estático do servidor, seguido pela porta, exemplo: `192.168.0.99:51821`

Quando solicitar os dados de autenticação, preencha com os dados que você definiu nos campos **WGUI_USERNAME** e **WGUI_PASSWORD** no arquivo **.env** que criamos anteriormente.

Ao acessar a interface, a primeira coisa que vamos fazer é configurar o servidor do WireGuard.

Acesse a página **WireGuard Server** e configure os campos dessa forma:

- **Listen Port**: 51820
- **Post Up Script**: /opt/wireguard-ui/postup.sh
- **Post Down Script**: /opt/wireguard-ui/postup.sh

Cliue em **Save** e então acesse a página **Global Settings** e verifique os campos:

- **Endpoint Address**: Aqui você pode usar seu IP público ou então o IP do servidor, vamos fazer o port forwarding logo em seguida no roteador.
- **Wireguard Config File Path**: Verifique se o mesmo está preenchido com o seguinte caminho: `/etc/wireguard/wg0.conf` 

Após verificar, clique em **Save** e então volte para a página **WireGuard Server** e clique em **Apply Config** e aguarde alguns segundos para o servidor WireGuard reiniciar.

Após isso você pode rodar o comando:
~~~shell
sudo wg show 
~~~

no terminal do servidor para verificar que a interface **wg0** esta ativa e escutando na porta **51820**.

Ao finalizar essa etapa, agora o que resta a fazer é criar a regra de port forwarding no roteador, para que clientes de redes externas consigam acessar o servidor e assim estabelecer a conexão para o túnel e registrar os clientes no servidor para configurar os dispositivos clientes que irão usar a nossa VPN.

# Port Forwarding no roteador.

Nessa infra, eu tenho meu roteador principal GPON que roda o servidor DHCP da rede interna e o meu server que está rodando a VPN, então precisamos encaminhar todas as solicitações externas na porta 51820/UDP para a porta 51820/UDP do meu servidor que está na rede interna.

Para fazer isso vou acessar a interface web do meu roteador, na seção de internet, vou na aba de segurança e então lá tenho a opção de criar regras de encaminhamento de portas (port forwarding). O caminho e as funções disponíveis em cada roteador variam conforme marca, modelo e sistema utilizado.

Aqui um exemplo de como fica a regra criada, lembrando que meu servidor tem IP estático.

![Regra de encaminhamento de porta no meu roteador](/assets/dns_vpn/wg-port-forwarding.png)

# Criando um cliente

Para criar um cliente é muito simples. Na interface de gerenciamento do WireGuard, acesse em **WireGuard Clients** e clique em **+ New Client** e então preencha o campo **Name** e se desejar informe um e-mail no respectivo campo.

Os demais campos, são padrões e basicamente já estão configurados de forma correta, a ponto de redirecionar todo o tráfego dos clientes para a rede interna.

Após salvar, você pode realizar o download do arquivo de configuração ou gerar um QR Code para utilizar na configuração de Smartphones com Android ou IOS, por exemplo.

E essa etapa inicial está concluída.

Agora vamos finalizar criando o server DNS com Pihole e finalizar a configuração do WireGuard para utilizar o próprio Pihole como nosso servidor padrão de DNS para os clientes da VPN.

---


## Pihole

O Pihole irá atuar como nosso servidor DNS na rede interna, filtrando todas as requisições dos clientes inclusive de quem estará remoto usando nosso túnel VPN. Para conhecer mais do projeto, acesse o site deles: <https://pi-hole.net/>

# Regras de Firewall

Antes de começar a instalação do Pihole, é necessário criar as regras de firewall para que os serviços dele sejam acessíveis as todos os nós da rede interna.

As portas utilizadas pelo Pihole são as seguintes:

- **53**: Para o serviço de DNS, precisa liberar para os protocolos TCP/UDP.
- **67**: Para o serviço DHCP que o Pihole oferece, precisa liberar para o protocolo UDP caso for utilizar o DHCP do Pihole.
- **547** Para o serviço DHCPv6 que o Pihole oferece, precisa liberar para o protocolo UDP caso for utilizar o DHCPv6 do Pihole.
- **80**: Para o serviço HTTP que é utilizado pelo `lighthttp` para acessar a interface web do Pihole. Precisa liberar o protocolo TCP.

Como utilizamos o UFW para gerenciar nossas regras, segue a lista de regras para habilitar. Ative-as conforme os serviços que irá utilizar:

IPv4:
~~~shell
sudo ufw allow 80/tcp
sudo ufw allow 53/tcp
sudo ufw allow 53/udp
sudo ufw allow 67/tcp
sudo ufw allow 67/udp
~~~

IPv6:
~~~shell
sudo ufw allow 546:547/udp
~~~

Após finalizar, lembre de reiniciar o UFW para que as novas regras entrem em vigor:
~~~shell
sudo ufw reload
~~~

A parte mais legal do Pihole é que ele possui um instalador autônomo, então para iniciar os trabalhos basta rodar o seguinte comando:
~~~shell
sudo curl -sSL https://install.pi-hole.net | bash
~~~

Dessa forma ele faz todo o serviço de baixar os pacotes e dependências necessárias.

Ao realizar a instação ele irá fazer algums perguntas e basicamente instale o pighttpd para ter acesso a interface web para gerenciamento do Pihole.

Lembre de anotar a senha que ele irá apresentar durante a instalação, essa será a senha de acesso ao painel de gerenciamento.

Ao finalizar a instalação já poderá acessar a interface do Pihole acessando a URL `192.168.0.99/admin` lembrando que o IP será o IP estático do seu servidor.

No painel do Pihole, basicamente vamos acessar a página **Settings** e na aba **DNS** vamos habilitar os Servers DNS que queremos utilizar e também na seção **Interface settings** vamos permitir as requisições de todas as origens marcando a opção **Permit all origins**.

Após isso basta salvar e finalizar a configuração no roteador e no WireGuard.

# Usando o Pihole como server DNS da rede interna

Para usar o Pihole que está rodando em nosso servidor da rede interna, vamos configurar o roteador que é nosso servidor DHCP para utilizar o IP do servidor como server DNS, então todos os nós da rede serão configurados automaticamente para utilizar o Pihole como DNS e assim se beneficiar dos filtros de domínios.

Novamente vou acessar a interface do meu roteador e na página de configurações da rede local (LAN), irei acessar as configurações do servidor DHCP e e alterar o endereço do DNS primário para o DNS do meu servidor da rede interna, conforme o exemplo abaixo:

![Configuração do servidor DHCP do roteador](/assets/dns_vpn/pi-hole-dns-dhcp.png)

Após essa configuração é só salvar e reiniciar o roteador.

# Usando o Pihole como server DNS da VPN WireGuard

Para esse caso, basta acessarmos a interface web do WireGuard e na página **Global Settings** definir o IP do nosso servidor como servidor DNS do WireGuard.

Ao salvar as configurações, lembre-se de aplicar as configurações para que o novo endereço seja utilizado, assim todos os cliente devem ter seus dados de configuração atualizados.

Se por acaso os dados dos clientes não atualizarem, exclua os clientes cadastrados atualmente e crie-os novamente para que tenham as configurações atualizadas.

---


E é isso pessoal!
Chegamos ao fim dessa configuração.

Espero poder ter contribuído para o projeto de vocês.
Abraços!

