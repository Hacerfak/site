---
layout: post
title:  "Configuração básica do server SSH"
date:   2025-07-20 20:05:00 -0300
categories: [SSH]
---
# Sobre o conteúdo

Nesse post, vou mostrar como é fácil instalar e configurar o servidor SSH para seu PC, dado assim a opção de acessá-lo remotamente pela rede LAN ou até mesmo pela WAN.

## Instalação do server SSH

No momento que escrevo esse post, estou usando Debian 13 (ainda não foi lançado oficialmente, eu sei, mas eu sou entusiasta kkk)

Aqui assumo que você já tenha feito a instalação e configuração mínima do sistema, caso ainda não tenha feito isso, acompanhe nesse outro post [aqui]({% post_url 2023-06-25-configuracao-debian-12 %}).

Vamos começar instalando o servidor SSH com o comando:
~~~shell
sudo apt install openssh-server
~~~

## Configuração básica de segurança

Após instalar o servidor, vamos editar algumas configurações básicas de segurança.

Edite o arquivo **sshd_config** com seu editor de preferência.

~~~shell
sudo nano /etc/ssh/sshd_config
~~~

Nesse arquivos vamos editar os seguintes parâmetros:

```Markdown
# Se quiser alterar a porta padrão do SSH, o padrão é a 22
Port 22 
# Tempo que o usuario tem para fazer login, no caso defini para 10 segundos
LoginGraceTime 10 
# Não permita que o usuário root se conecte diretamente
PermitRootLogin no
```

Salve o arquivo e então reinicie o serviço do SSH.

~~~shell
sudo systemctl restart ssh.service
~~~

Pronto! 
Configurações básicas feitas com sucesso!

## Criando uma chave SSL para relaizar o login diretamente ao host

Aqui á ideia é gerar uma chave SSL em cada cliente que pode se conectar a essa máquina via SSH, gerando as chaves, acessamos o host com a senha e entao subimos a chave pública do cliente para o host, assim em uma nova conexão ele não irá mais solicitar a senha do cliente que está se conectando, pois a autenticação irá ocorrer pelas chave SSL.

Nas máquinas clientes, o primeiro passo é gerar o par de chaves SSL para autenticação.

Rode o comando:

~~~shell
ssh-keygen -t rsa -c "Seu comentário"
~~~

No processo de criação especifique onde as chaves serão salvas, por padrão elas ficam em **~/.ssh/**, legal que aqui você pode nomear elas e criar quantas chaves forem necessárias.

**Atenção:** No processo de criação, você pode definir uma senha para as chaves ou não, caso não queira ficar digitando senha, crie as chaves sem senha, apenas pulando a etapa da senha com **Enter**


Com as chaves geradas, agora faça o upload chave pública no host que deseja:

~~~shell
scp -P 22  sua_chave.pub user@192.168.0.99:/home/user/.ssh/authorized_keys
~~~
Com esse comando você irá se conectar ao host **user@192.168.0.99** e carregar **sua_chave.pub** renomeando o arquivo para **authorized_keys**. Nesse primeiro envio ele ainda irá solicitar a senha para se atenticar ao server, mas no próximo login já irá conectar diretamente pela chave gerada e carregado no host.

Caso seja a primeira que você esteja se conectando ao host, ele ainda irá pedir a confirmação se deseja adicionar esse host a lista de hosts confiáveis.

E basicamente é isso aí gurizada!

Com essa simples configuração já temos um acesso tranquilo a nossas máquinas através do SSH.

Claro, ainda há muita otimização pensando em segurança, principalmente se for expor o serviço do host para a WAN. Mas isso é assundo para outro post ou para ser atualziado aqui posteriormente!

Abraços! ❤️