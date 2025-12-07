---
layout: post
title: "Como configurar o Lighttpd com Let's Encrypt no Debian"
date: 2025-11-30 22:30:00 -0300
categories: [Lighttpd, Debian, Let's Encrypt]
featured: true
---
# Sobre o conteúdo

Hoje vamos ver como configurar o Lighttpd para usar certificados SSL gratuitos do Let's Encrypt no Debian. Isso permitirá que você sirva seu site de forma segura usando HTTPS.

## Pré-requisitos
Antes de começar, certifique-se de ter o seguinte:
- Um servidor Debian (preferencialmente Debian 12 ou 13).
- Redirecionamento de portas 80 e 443 no seu firewall e no seu roteador.
- Acesso root ou privilégios sudo.
- Um domínio registrado e configurado para apontar para o seu servidor.
    - Você pode usar serviços gratuitos como o Freenom ou No-IP para registrar um domínio gratuitamente.

## Passo 1: Instalar e configurar o Lighttpd
Primeiro, vamos instalar o Lighttpd. Abra o terminal e execute os seguintes comandos:

~~~bash
sudo apt install lighttpd
~~~

Após a instalação, vamos realizar algumas configurações básicas. Edite o arquivo de configuração do Lighttpd:
~~~bash
sudo nano /etc/lighttpd/lighttpd.conf
~~~

Vamos definir o diretório raiz do nosso site. Procure pela linha `server.document-root` e altere para o caminho do seu site, por exemplo:
~~~conf
server.document-root = "/var/www/exemplo.com.br"
~~~

Também vamos definir o usuário e grupo sob os quais o Lighttpd será executado. Procure pelas linhas `server.username` e `server.groupname` e defina como `www-data`, por exemplo:
~~~conf
server.username = "www-data"
server.groupname = "www-data"
~~~

E por fim vamos definir as exclusões de arquivos para evitar que arquivos sensíveis sejam acessados e definir a página de índice padrão do site adicionando ou modificando as seguintes linhas no arquivo de configuração:
~~~conf
static-file.exclude-extensions = ( ".php", ".pl", ".fcgi", ".rb", ".py", ".cgi", "~" )
index-file.names = ( "index.html", "index.htm" )
~~~

Salve e feche o arquivo. Agora, reinicie o Lighttpd para aplicar as mudanças:
~~~bash
sudo systemctl restart lighttpd
~~~

Incluindo alguns arquivos de teste no diretório do site:
~~~bash
echo "<h1>Olá, Lighttpd com Let's Encrypt!</h1>" | sudo tee /var/www/exemplo.com.br/index.html
~~~

Já podemos acessar o site via HTTP para verificar se está funcionando.

## Passo 2: Instalar o Certbot
O Certbot é a ferramenta recomendada para obter certificados SSL do Let's Encrypt. Com ele, podemos automatizar o processo de obtenção e renovação dos certificados.

Existem dois modos de usar o Certbot com o Lighttpd: usando o plugin do Lighttpd ou usando o modo standalone. Vamos usar o modo standalone, que é mais simples. Primeiro, vamos instalar os requisitos necessários. No modo standalone, precisamos parar o Lighttpd temporariamente para que o Certbot possa usar a porta 80.
~~~bash
sudo systemctl stop lighttpd
~~~

Para o Debian, o Certbot pode ser instalado diretamente pelo python3-pip ou pelo snap. Vamos usar o pip para instalar o Certbot. Primeiro os requisitos do sistema:
~~~bash
sudo apt install python3 python3-dev python3-venv libaugeas-dev gcc
~~~

Agora, vamos criar um ambiente virtual para o Certbot e instalar o Certbot nele:
~~~bash
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
~~~

Agora, instale o Certbot:
~~~bash
sudo /opt/certbot/bin/pip install certbot
~~~

Rode o comando abaixo para verificar se o Certbot foi instalado corretamente:
~~~bash
sudo /opt/certbot/bin/certbot --version
~~~

E garanta que o comando 'certbot' esteja disponível globalmente:
~~~bash
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
~~~

## Passo 3: Obter o certificado SSL
Agora, vamos obter o certificado SSL para o nosso domínio. Execute o seguinte comando, substituindo `exemplo.com.br` pelo seu domínio real:
~~~bash
sudo certbot certonly --standalone -d your-domain.com.br
~~~
Siga as instruções na tela para completar o processo de obtenção do certificado. O Certbot irá verificar se você possui o domínio e, se tudo estiver correto, emitirá o certificado.

Você pode encontrar os certificados emitidos em:
- `/etc/letsencrypt/live/your-domain.com.br/fullchain.pem` (certificado completo)
- `/etc/letsencrypt/live/your-domain.com.br/privkey.pem` (chave privada)

## Passo 4: Configurar o Lighttpd para usar o certificado SSL
Agora que temos o certificado SSL, precisamos configurar o Lighttpd para usá-lo. Edite o arquivo de configuração do Lighttpd novamente:
~~~bash
sudo nano /etc/lighttpd/lighttpd.conf
~~~

Adicione as seguintes linhas ao arquivo para habilitar o SSL:
~~~conf
$SERVER["socket"] == ":443" {
    ssl.engine = "enable"
    ssl.pemfile = "/etc/letsencrypt/live/your-domain.com.br/fullchain.pem"
    ssl.privkey = "/etc/letsencrypt/live/your-domain.com.br/privkey.pem"
}
~~~

Substitua `your-domain.com.br` pelo seu domínio real. 

Vamos também configurar o Lighttpd para redirecionar todo o tráfego HTTP para HTTPS. Adicione as seguintes linhas ao arquivo de configuração:
~~~conf
$HTTP["scheme"] == "http" {
    url.redirect = ("" => "https://${url.authority}${url.path}${qsa}")
}
~~~

Salve e feche o arquivo.

Agora, reinicie o Lighttpd para aplicar as mudanças:
~~~bash
sudo systemctl restart lighttpd
~~~

## Passo 5: Testar a configuração
Agora, você deve ser capaz de acessar seu site via HTTPS. Abra o navegador e vá para o seu domínio.

Você deve ver o site carregando com um cadeado indicando que a conexão é segura.

## Passo 6: Configurar a renovação automática do certificado
Os certificados do Let's Encrypt são válidos por 90 dias, então é importante configurar a renovação automática. O Certbot pode cuidar disso para você. Vamos criar um trabalho cron para renovar o certificado automaticamente. Abra o crontab para edição:
~~~bash
sudo crontab -e
~~~

Adicione a seguinte linha ao final do arquivo:
~~~cron
0 3 * * * /usr/bin/certbot renew --quiet
~~~

Isso fará com que o Certbot tente renovar o certificado todos os dias às 3 da manhã. O `--quiet` suprime a saída, a menos que haja um erro.

## Finalizando

A partir daqui, você deve ser capaz de servir seu site de forma segura usando Lighttpd com certificados SSL do Let's Encrypt no Debian.

E é isso galera, espero que esse post tenha ajudado vocês!

Abraços! ❤️🍻